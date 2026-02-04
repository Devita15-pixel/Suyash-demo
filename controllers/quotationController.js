const Quotation = require('../models/Quotation');
const Company = require('../models/Company');
const Vendor = require('../models/Vendor');
const Item = require('../models/Item');
const Costing = require('../models/Costing');
const Tax = require('../models/Tax');
const TermsCondition = require('../models/TermsCondition');

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Private
const getQuotations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      vendorId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status) {
      query.Status = status;
    }
    
    // Filter by vendor
    if (vendorId) {
      query.VendorID = vendorId;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.QuotationDate = {};
      if (startDate) query.QuotationDate.$gte = new Date(startDate);
      if (endDate) query.QuotationDate.$lte = new Date(endDate);
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const quotations = await Quotation.find(query)
      .populate('VendorID', 'VendorName VendorCode GSTIN State StateCode')
      .populate('CompanyID', 'CompanyName GSTIN State StateCode')
      .populate('CreatedBy', 'Username Email EmployeeID')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Quotation.countDocuments(query);
    
    // Calculate statistics
    const stats = await Quotation.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalQuotations: { $sum: 1 },
          totalAmount: { $sum: '$GrandTotal' },
          avgAmount: { $avg: '$GrandTotal' },
          draftCount: { 
            $sum: { $cond: [{ $eq: ['$Status', 'Draft'] }, 1, 0] }
          },
          sentCount: { 
            $sum: { $cond: [{ $eq: ['$Status', 'Sent'] }, 1, 0] }
          },
          approvedCount: { 
            $sum: { $cond: [{ $eq: ['$Status', 'Approved'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      data: quotations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      statistics: stats[0] || {
        totalQuotations: 0,
        totalAmount: 0,
        avgAmount: 0,
        draftCount: 0,
        sentCount: 0,
        approvedCount: 0
      }
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single quotation
// @route   GET /api/quotations/:id
// @access  Private
const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('VendorID', 'VendorName VendorCode Address GSTIN State StateCode Phone Email')
      .populate('CompanyID', 'CompanyName Address GSTIN State StateCode Phone Email BankName AccountNo IFSC')
      .populate('CreatedBy', 'Username Email EmployeeID Department')
      .populate('UpdatedBy', 'Username Email EmployeeID');
    
    if (!quotation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    // Get detailed item information
    const detailedItems = await Promise.all(
      quotation.Items.map(async (item) => {
        const itemDetails = await Item.findOne({ PartNo: item.PartNo })
          .populate('MaterialID', 'MaterialName MaterialCode Density');
        
        return {
          ...item.toObject(),
          ItemDetails: itemDetails || null
        };
      })
    );
    
    const responseData = {
      ...quotation.toObject(),
      Items: detailedItems,
      Calculations: {
        subTotal: parseFloat(quotation.SubTotal?.toFixed(2)),
        gstAmount: parseFloat(quotation.GSTAmount?.toFixed(2)),
        grandTotal: parseFloat(quotation.GrandTotal?.toFixed(2)),
        gstPercentage: parseFloat(quotation.GSTPercentage?.toFixed(2))
      }
    };
    
    res.json({ 
      success: true, 
      data: responseData 
    });
  } catch (error) {
    console.error('Get quotation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create quotation
// @route   POST /api/quotations
// @access  Private
const createQuotation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      VendorID, 
      VendorType, 
      NewVendor, // For new vendors added during quotation
      Items, 
      ValidTill, 
      InternalRemarks, 
      CustomerRemarks 
    } = req.body;
    
    // 1. Get company details (only one active company)
    const company = await Company.findOne({ IsActive: true });
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active company found. Please setup company first.' 
      });
    }
    
    let vendorData = {};
    let vendorId = null;
    
    // 2. Handle vendor based on type
    if (VendorType === 'Existing' && VendorID) {
      // Existing vendor
      const vendor = await Vendor.findById(VendorID);
      if (!vendor || !vendor.IsActive) {
        return res.status(404).json({ 
          success: false, 
          message: 'Vendor not found or inactive' 
        });
      }
      
      vendorId = vendor._id;
      vendorData = {
        VendorID: vendor._id,
        VendorName: vendor.VendorName,
        VendorGSTIN: vendor.GSTIN || '',
        VendorState: vendor.State,
        VendorStateCode: vendor.StateCode,
        VendorAddress: vendor.Address,
        VendorCity: vendor.City,
        VendorPincode: vendor.Pincode,
        VendorContactPerson: vendor.ContactPerson,
        VendorPhone: vendor.Phone,
        VendorEmail: vendor.Email,
        VendorPAN: vendor.PAN || ''
      };
      
    } else if (VendorType === 'New' && NewVendor) {
      // New vendor added during quotation
      const { 
        VendorName, 
        GSTIN, 
        State, 
        StateCode, 
        Address, 
        City, 
        Pincode, 
        ContactPerson, 
        Phone, 
        Email, 
        PAN 
      } = NewVendor;
      
      // Generate vendor code
      const vendorCode = `V-${Date.now().toString().slice(-6)}`;
      
      // Create new vendor
      const newVendor = await Vendor.create({
        VendorCode: vendorCode,
        VendorName,
        GSTIN: GSTIN || '',
        State,
        StateCode,
        Address,
        City,
        Pincode,
        ContactPerson,
        Phone,
        Email,
        PAN: PAN || '',
        CreatedBy: userId,
        UpdatedBy: userId
      });
      
      vendorId = newVendor._id;
      vendorData = {
        VendorID: newVendor._id,
        VendorName: newVendor.VendorName,
        VendorGSTIN: newVendor.GSTIN || '',
        VendorState: newVendor.State,
        VendorStateCode: newVendor.StateCode,
        VendorAddress: newVendor.Address,
        VendorCity: newVendor.City,
        VendorPincode: newVendor.Pincode,
        VendorContactPerson: newVendor.ContactPerson,
        VendorPhone: newVendor.Phone,
        VendorEmail: newVendor.Email,
        VendorPAN: newVendor.PAN || ''
      };
      
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Vendor information is required' 
      });
    }
    
    // 3. Validate and process items
    const processedItems = await Promise.all(
      Items.map(async (item) => {
        // Get item details
        const itemDetails = await Item.findOne({ 
          PartNo: item.PartNo,
          IsActive: true 
        });
        
        if (!itemDetails) {
          throw new Error(`Item ${item.PartNo} not found or inactive`);
        }
        
        // Get costing for final rate
        const costing = await Costing.findOne({ 
          PartNo: item.PartNo,
          IsActive: true 
        });
        
        if (!costing) {
          throw new Error(`Costing not found for item ${item.PartNo}`);
        }
        
        // Get tax rate from HSN code
        const tax = await Tax.findOne({ 
          HSNCode: itemDetails.HSNCode,
          IsActive: true 
        });
        
        return {
          PartNo: item.PartNo,
          PartName: itemDetails.PartName,
          Description: itemDetails.Description || '',
          HSNCode: itemDetails.HSNCode,
          Unit: itemDetails.Unit || 'Nos',
          Quantity: item.Quantity,
          FinalRate: costing.FinalRate,
          // Amount will be calculated automatically in schema
        };
      })
    );
    
    // 4. Get GST percentage (use first item's HSN code tax)
    const firstItemTax = await Tax.findOne({ 
      HSNCode: processedItems[0]?.HSNCode,
      IsActive: true 
    });
    
    if (!firstItemTax) {
      return res.status(404).json({ 
        success: false, 
        message: `Tax rate not found for HSN code: ${processedItems[0]?.HSNCode}` 
      });
    }
    
    // Determine GST Type based on state
    let gstType = 'CGST/SGST';
    if (vendorData.VendorStateCode !== company.StateCode) {
      gstType = 'IGST';
    }
    
    // Get appropriate GST percentage
    let gstPercentage = 0;
    if (gstType === 'IGST') {
      gstPercentage = firstItemTax.IGSTPercentage;
    } else {
      gstPercentage = firstItemTax.GSTPercentage;
    }
    
    // 5. Get terms & conditions
    const termsConditions = await TermsCondition.find()
      .sort({ Sequence: 1 })
      .select('Title Description Sequence');
    
    // 6. Create quotation
    const quotation = await Quotation.create({
      // Company Info
      CompanyID: company._id,
      CompanyName: company.CompanyName,
      CompanyGSTIN: company.GSTIN,
      CompanyState: company.State,
      CompanyStateCode: company.StateCode,
      
      // Vendor Info
      VendorID: vendorId,
      VendorType: VendorType,
      ...vendorData,
      
      // Items
      Items: processedItems,
      
      // Tax
      GSTPercentage: gstPercentage,
      GSTType: gstType,
      
      // Dates
      ValidTill: ValidTill ? new Date(ValidTill) : null,
      
      // Terms & Conditions
      TermsConditions: termsConditions,
      
      // Remarks
      InternalRemarks: InternalRemarks || '',
      CustomerRemarks: CustomerRemarks || '',
      
      // User info
      CreatedBy: userId,
      UpdatedBy: userId
    });
    
    // 7. Populate response
    const populatedQuotation = await Quotation.findById(quotation._id)
      .populate('VendorID', 'VendorName VendorCode GSTIN State')
      .populate('CompanyID', 'CompanyName GSTIN State')
      .populate('CreatedBy', 'Username Email');
    
    res.status(201).json({ 
      success: true, 
      data: populatedQuotation,
      message: 'Quotation created successfully' 
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get vendors for dropdown
// @route   GET /api/quotations/vendors
// @access  Private
const getVendorsForDropdown = async (req, res) => {
  try {
    const { search } = req.query;
    
    const query = { IsActive: true };
    
    if (search) {
      query.$or = [
        { VendorName: new RegExp(search, 'i') },
        { VendorCode: new RegExp(search, 'i') },
        { GSTIN: new RegExp(search, 'i') }
      ];
    }
    
    const vendors = await Vendor.find(query)
      .select('VendorCode VendorName GSTIN State StateCode ContactPerson Phone Email')
      .sort({ VendorName: 1 })
      .limit(50);
    
    res.json({
      success: true,
      data: vendors
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Calculate quotation preview
// @route   POST /api/quotations/preview
// @access  Private
const calculateQuotation = async (req, res) => {
  try {
    const { VendorType, VendorID, NewVendor, Items } = req.body;
    
    // Get company
    const company = await Company.findOne({ IsActive: true });
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active company found' 
      });
    }
    
    let vendorStateCode = null;
    let vendorState = '';
    let vendorGSTIN = '';
    let vendorName = '';
    
    // Handle vendor based on type
    if (VendorType === 'Existing' && VendorID) {
      const vendor = await Vendor.findById(VendorID);
      if (!vendor || !vendor.IsActive) {
        return res.status(404).json({ 
          success: false, 
          message: 'Vendor not found or inactive' 
        });
      }
      
      vendorStateCode = vendor.StateCode;
      vendorState = vendor.State;
      vendorGSTIN = vendor.GSTIN || '';
      vendorName = vendor.VendorName;
      
    } else if (VendorType === 'New' && NewVendor) {
      vendorStateCode = NewVendor.StateCode;
      vendorState = NewVendor.State;
      vendorGSTIN = NewVendor.GSTIN || '';
      vendorName = NewVendor.VendorName;
      
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Vendor information is required' 
      });
    }
    
    // Process items
    const processedItems = await Promise.all(
      Items.map(async (item) => {
        const itemDetails = await Item.findOne({ 
          PartNo: item.PartNo,
          IsActive: true 
        });
        
        if (!itemDetails) {
          throw new Error(`Item ${item.PartNo} not found`);
        }
        
        const costing = await Costing.findOne({ 
          PartNo: item.PartNo,
          IsActive: true 
        });
        
        if (!costing) {
          throw new Error(`Costing not found for item ${item.PartNo}`);
        }
        
        const amount = item.Quantity * costing.FinalRate;
        
        return {
          PartNo: item.PartNo,
          PartName: itemDetails.PartName,
          Description: itemDetails.Description || '',
          HSNCode: itemDetails.HSNCode,
          Unit: itemDetails.Unit || 'Nos',
          Quantity: item.Quantity,
          FinalRate: parseFloat(costing.FinalRate.toFixed(2)),
          Amount: parseFloat(amount.toFixed(2)),
          ItemDetails: itemDetails
        };
      })
    );
    
    // Calculate totals
    const subTotal = processedItems.reduce((total, item) => total + item.Amount, 0);
    
    // Get GST
    const firstItemTax = await Tax.findOne({ 
      HSNCode: processedItems[0]?.HSNCode,
      IsActive: true 
    });
    
    let gstType = 'CGST/SGST';
    let gstPercentage = 0;
    
    if (vendorStateCode !== company.StateCode) {
      gstType = 'IGST';
      gstPercentage = firstItemTax ? firstItemTax.IGSTPercentage : 0;
    } else {
      gstPercentage = firstItemTax ? firstItemTax.GSTPercentage : 0;
    }
    
    const gstAmount = (subTotal * gstPercentage) / 100;
    const grandTotal = subTotal + gstAmount;
    
    // Get terms & conditions
    const termsConditions = await TermsCondition.find()
      .sort({ Sequence: 1 })
      .select('Title Description Sequence');
    
    // CORRECTED: Convert amount to words (Indian Number System)
    const convertToWords = (amount) => {
      // Separate rupees and paise
      const rupees = Math.floor(amount);
      const paise = Math.round((amount - rupees) * 100);
      
      // Arrays for number words
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 
                   'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
                   'Seventeen', 'Eighteen', 'Nineteen'];
      
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      // Function to convert a number less than 1000 to words
      const convertHundreds = (num) => {
        if (num === 0) return '';
        
        let result = '';
        
        // Handle hundreds
        if (num >= 100) {
          result += ones[Math.floor(num / 100)] + ' Hundred ';
          num %= 100;
        }
        
        // Handle tens and ones
        if (num >= 20) {
          result += tens[Math.floor(num / 10)] + ' ';
          num %= 10;
        }
        
        if (num > 0) {
          result += ones[num] + ' ';
        }
        
        return result.trim();
      };
      
      // Function to convert rupees to words using Indian numbering system
      const convertRupeesToWords = (num) => {
        if (num === 0) return 'Zero';
        
        let result = '';
        let groupIndex = 0;
        const groups = [];
        
        // Break number into groups of 2 digits (except first group which is 3 digits)
        while (num > 0) {
          if (groupIndex === 0) {
            groups.push(num % 1000); // Last 3 digits
            num = Math.floor(num / 1000);
          } else {
            groups.push(num % 100); // Last 2 digits
            num = Math.floor(num / 100);
          }
          groupIndex++;
        }
        
        // Convert each group to words
        const groupNames = ['', 'Thousand', 'Lakh', 'Crore', 'Arab'];
        
        for (let i = 0; i < groups.length; i++) {
          if (groups[i] > 0) {
            let groupWords = convertHundreds(groups[i]);
            if (groupNames[i]) {
              groupWords += ' ' + groupNames[i];
            }
            result = groupWords + ' ' + result;
          }
        }
        
        return result.trim();
      };
      
      // Convert rupees to words
      let rupeesWords = convertRupeesToWords(rupees);
      
      // Convert paise to words
      let paiseWords = '';
      if (paise > 0) {
        paiseWords = convertRupeesToWords(paise);
      }
      
      // Construct final string
      let result = '';
      
      if (rupeesWords) {
        result += rupeesWords + ' Rupee' + (rupees === 1 ? '' : 's');
      } else {
        result += 'Zero Rupees';
      }
      
      if (paiseWords && paiseWords !== 'Zero') {
        result += ' and ' + paiseWords + ' Paise';
      }
      
      result += ' Only';
      
      // Capitalize first letter
      result = result.charAt(0).toUpperCase() + result.slice(1);
      
      return result.replace(/\s+/g, ' ').trim();
    };
    
    res.json({
      success: true,
      data: {
        company: {
          CompanyName: company.CompanyName,
          GSTIN: company.GSTIN,
          State: company.State,
          StateCode: company.StateCode
        },
        vendor: {
          VendorName: vendorName,
          GSTIN: vendorGSTIN,
          State: vendorState,
          StateCode: vendorStateCode
        },
        vendorType: VendorType,
        items: processedItems,
        calculations: {
          subTotal: parseFloat(subTotal.toFixed(2)),
          gstType: gstType,
          gstPercentage: parseFloat(gstPercentage.toFixed(2)),
          gstAmount: parseFloat(gstAmount.toFixed(2)),
          grandTotal: parseFloat(grandTotal.toFixed(2)),
          amountInWords: convertToWords(grandTotal)
        },
        termsConditions: termsConditions,
        gstLogic: vendorStateCode === company.StateCode 
          ? 'Within same state: CGST + SGST applies'
          : 'Interstate: IGST applies'
      }
    });
  } catch (error) {
    console.error('Calculate quotation error:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
// @desc    Update quotation
// @route   PUT /api/quotations/:id
// @access  Private
const updateQuotation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { Items, ValidTill, InternalRemarks, CustomerRemarks, Status } = req.body;
    
    // Check if quotation exists and is in editable state
    const existingQuotation = await Quotation.findById(req.params.id);
    if (!existingQuotation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    // Can only edit draft quotations
    if (existingQuotation.Status !== 'Draft' && Status !== existingQuotation.Status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only draft quotations can be modified' 
      });
    }
    
    const updateData = {
      UpdatedBy: userId,
      UpdatedAt: Date.now()
    };
    
    // Update items if provided
    if (Items && Items.length > 0) {
      // Recalculate items with latest rates
      const processedItems = await Promise.all(
        Items.map(async (item) => {
          const itemDetails = await Item.findOne({ 
            PartNo: item.PartNo,
            IsActive: true 
          });
          
          if (!itemDetails) {
            throw new Error(`Item ${item.PartNo} not found or inactive`);
          }
          
          const costing = await Costing.findOne({ 
            PartNo: item.PartNo,
            IsActive: true 
          });
          
          if (!costing) {
            throw new Error(`Costing not found for item ${item.PartNo}`);
          }
          
          return {
            PartNo: item.PartNo,
            PartName: itemDetails.PartName,
            Description: itemDetails.Description || '',
            HSNCode: itemDetails.HSNCode,
            Unit: itemDetails.Unit || 'Nos',
            Quantity: item.Quantity,
            FinalRate: costing.FinalRate
          };
        })
      );
      
      updateData.Items = processedItems;
      
      // Update GST percentage if items changed
      const firstItemTax = await Tax.findOne({ 
        HSNCode: processedItems[0]?.HSNCode,
        IsActive: true 
      });
      
      if (firstItemTax) {
        if (existingQuotation.GSTType === 'IGST') {
          updateData.GSTPercentage = firstItemTax.IGSTPercentage;
        } else {
          updateData.GSTPercentage = firstItemTax.GSTPercentage;
        }
      }
    }
    
    // Update other fields
    if (ValidTill) updateData.ValidTill = new Date(ValidTill);
    if (InternalRemarks !== undefined) updateData.InternalRemarks = InternalRemarks;
    if (CustomerRemarks !== undefined) updateData.CustomerRemarks = CustomerRemarks;
    if (Status) {
      updateData.Status = Status;
      if (Status === 'Sent') updateData.SentAt = Date.now();
      if (Status === 'Approved') updateData.ApprovedAt = Date.now();
    }
    
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('VendorID', 'VendorName VendorCode GSTIN State')
    .populate('CompanyID', 'CompanyName GSTIN State')
    .populate('CreatedBy', 'Username Email')
    .populate('UpdatedBy', 'Username Email');
    
    res.json({ 
      success: true, 
      data: quotation,
      message: 'Quotation updated successfully' 
    });
  } catch (error) {
    console.error('Update quotation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Delete quotation
// @route   DELETE /api/quotations/:id
// @access  Private
const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    // Only allow deletion of draft quotations
    if (quotation.Status !== 'Draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only draft quotations can be deleted' 
      });
    }
    
    // Soft delete (set IsActive to false)
    quotation.IsActive = false;
    await quotation.save();
    
    res.json({ 
      success: true, 
      message: 'Quotation deleted successfully' 
    });
  } catch (error) {
    console.error('Delete quotation error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getQuotations,
  getQuotation,
  createQuotation,
  getVendorsForDropdown,
  calculateQuotation,
  updateQuotation,
  deleteQuotation
};