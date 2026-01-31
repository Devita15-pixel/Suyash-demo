const Quotation = require('../models/Quotation');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Item = require('../models/Item');
const Costing = require('../models/Costing');
const Tax = require('../models/Tax');
const TermsCondition = require('../models/TermsCondition');
const { numberToWords, calculateGSTType, generateQuotationNumber } = require('../utils/calculations');

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Public
const getQuotations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId, startDate, endDate } = req.query;
    
    const query = {};
    
    if (status) {
      query.Status = status;
    }
    
    if (customerId) {
      query.CustomerID = customerId;
    }
    
    if (startDate || endDate) {
      query.QuotationDate = {};
      if (startDate) {
        query.QuotationDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.QuotationDate.$lte = new Date(endDate);
      }
    }
    
    const quotations = await Quotation.find(query)
      .populate('CompanyID', 'CompanyName GSTIN State StateCode')
      .populate('CustomerID', 'CustomerName GSTIN State StateCode')
      .populate('CreatedBy', 'Username Email')
      .sort({ QuotationDate: -1, QuotationNo: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Quotation.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: quotations,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
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
// @access  Public
const getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('CompanyID', 'CompanyName Address GSTIN PAN State StateCode Phone Email BankName AccountNo IFSC Logo')
      .populate('CustomerID', 'CustomerName BillingAddress ShippingAddress GSTIN State StateCode ContactPerson Phone Email')
      .populate('CreatedBy', 'Username Email')
      .populate('ApprovedBy', 'Username Email');
    
    if (!quotation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: quotation 
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

// @desc    Create quotation (Draft)
// @route   POST /api/quotations
// @access  Public
const createQuotation = async (req, res) => {
  try {
    const { CustomerID, Items = [], CustomerRemarks, InternalRemarks } = req.body;
    
    // Validate required fields
    if (!CustomerID) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer ID is required' 
      });
    }
    
    // Get company (assuming single company for now)
    const company = await Company.findOne({ IsActive: true });
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found. Please setup company first.' 
      });
    }
    
    // Get customer
    const customer = await Customer.findById(CustomerID);
    if (!customer) {
      return res.status(404).json({ 
        success: false, 
        message: 'Customer not found' 
      });
    }
    
    // Calculate GST type
    const gstType = calculateGSTType(company.StateCode, customer.StateCode);
    
    // Generate quotation number
    const quotationNo = await generateQuotationNumber(Quotation);
    
    // Set validity (default 30 days)
    const validTill = new Date();
    validTill.setDate(validTill.getDate() + 30);
    
    // Process items and get rates from costing
    const processedItems = [];
    let gstPercentage = 0;
    
    for (const item of Items) {
      const { PartNo, Quantity } = item;
      
      // Get item details
      const itemDetails = await Item.findOne({ PartNo, IsActive: true });
      if (!itemDetails) {
        return res.status(404).json({ 
          success: false, 
          message: `Item ${PartNo} not found or inactive` 
        });
      }
      
      // Get costing for item
      const costing = await Costing.findOne({ PartNo, IsActive: true });
      if (!costing) {
        return res.status(404).json({ 
          success: false, 
          message: `Costing not found for item ${PartNo}` 
        });
      }
      
      // Get tax for HSN code
      const tax = await Tax.findOne({ HSNCode: itemDetails.HSNCode, IsActive: true });
      if (!tax) {
        return res.status(404).json({ 
          success: false, 
          message: `Tax not found for HSN code ${itemDetails.HSNCode}` 
        });
      }
      
      // Use first item's GST percentage for entire quotation
      if (processedItems.length === 0) {
        gstPercentage = tax.GSTPercentage;
      }
      
      const amount = Quantity * costing.FinalRate;
      
      processedItems.push({
        PartNo,
        PartName: itemDetails.PartName,
        Description: itemDetails.Description || '',
        HSNCode: itemDetails.HSNCode,
        Unit: itemDetails.Unit,
        Quantity,
        FinalRate: costing.FinalRate,
        Amount: amount
      });
    }
    
    // Get terms & conditions
    const termsConditions = await TermsCondition.find({ IsActive: true })
      .sort({ Sequence: 1 })
      .select('TermType Title Description');
    
    // Calculate amount in words
    let subTotal = 0;
    if (processedItems.length > 0) {
      subTotal = processedItems.reduce((sum, item) => sum + item.Amount, 0);
    }
    const gstAmount = subTotal * (gstPercentage / 100);
    const grandTotal = subTotal + gstAmount;
    const amountInWords = numberToWords(grandTotal);
    
    // Create quotation
    const quotation = await Quotation.create({
      QuotationNo: quotationNo,
      QuotationDate: new Date(),
      ValidTill: validTill,
      CompanyID: company._id,
      CustomerID: customer._id,
      CustomerGSTIN: customer.GSTIN,
      CustomerState: customer.State,
      CustomerStateCode: customer.StateCode,
      GSTType: gstType,
      Items: processedItems,
      SubTotal: subTotal,
      GSTPercentage: gstPercentage,
      GSTAmount: gstAmount,
      GrandTotal: grandTotal,
      AmountInWords: amountInWords,
      TermsConditions: termsConditions,
      CustomerRemarks: CustomerRemarks || '',
      InternalRemarks: InternalRemarks || '',
      Status: 'Draft',
      CreatedBy: req.user?._id || null
    });
    
    res.status(201).json({ 
      success: true, 
      data: quotation,
      message: 'Quotation created successfully (Draft)' 
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    
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

// @desc    Update quotation
// @route   PUT /api/quotations/:id
// @access  Public
const updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    // Only allow updates if status is Draft
    if (quotation.Status !== 'Draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only Draft quotations can be updated' 
      });
    }
    
    const updatedQuotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.json({ 
      success: true, 
      data: updatedQuotation,
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

// @desc    Approve quotation
// @route   PUT /api/quotations/:id/approve
// @access  Public
const approveQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    if (quotation.Status !== 'Draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only Draft quotations can be approved' 
      });
    }
    
    quotation.Status = 'Approved';
    quotation.ApprovedBy = req.user?._id || null;
    quotation.ApprovedAt = new Date();
    quotation.UpdatedAt = Date.now();
    
    await quotation.save();
    
    res.json({ 
      success: true, 
      data: quotation,
      message: 'Quotation approved successfully' 
    });
  } catch (error) {
    console.error('Approve quotation error:', error);
    
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

// @desc    Delete quotation (HARD DELETE)
// @route   DELETE /api/quotations/:id
// @access  Public
const deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    
    if (!quotation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quotation not found' 
      });
    }
    
    // Only allow delete if status is Draft
    if (quotation.Status !== 'Draft') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only Draft quotations can be deleted' 
      });
    }
    
    // HARD DELETE
    await Quotation.findByIdAndDelete(req.params.id);
    
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

// @desc    Get quotation statistics
// @route   GET /api/quotations/stats
// @access  Public
const getQuotationStats = async (req, res) => {
  try {
    const totalQuotations = await Quotation.countDocuments();
    const draftQuotations = await Quotation.countDocuments({ Status: 'Draft' });
    const approvedQuotations = await Quotation.countDocuments({ Status: 'Approved' });
    const sentQuotations = await Quotation.countDocuments({ Status: 'Sent' });
    const convertedQuotations = await Quotation.countDocuments({ Status: 'Converted' });
    const expiredQuotations = await Quotation.countDocuments({ Status: 'Expired' });
    
    // Monthly statistics
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Quotation.aggregate([
      {
        $match: {
          QuotationDate: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$QuotationDate' },
          count: { $sum: 1 },
          totalAmount: { $sum: '$GrandTotal' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        totalQuotations,
        draftQuotations,
        approvedQuotations,
        sentQuotations,
        convertedQuotations,
        expiredQuotations,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Get quotation stats error:', error);
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
  updateQuotation,
  approveQuotation,
  deleteQuotation,
  getQuotationStats
};