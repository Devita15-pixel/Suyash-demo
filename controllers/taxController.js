const Tax = require('../models/Tax');

// @desc    Get all taxes
// @route   GET /api/taxes
// @access  Public
const getTaxes = async (req, res) => {
  try {
    const { page = 1, limit = 10, hsnCode } = req.query;
    
    const query = { IsActive: true };
    
    if (hsnCode) {
      query.HSNCode = new RegExp(hsnCode, 'i');
    }
    
    const taxes = await Tax.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ HSNCode: 1 });
    
    const total = await Tax.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: taxes,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get taxes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single tax
// @route   GET /api/taxes/:id
// @access  Public
const getTax = async (req, res) => {
  try {
    const tax = await Tax.findById(req.params.id);
    
    if (!tax) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: tax 
    });
  } catch (error) {
    console.error('Get tax error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create tax
// @route   POST /api/taxes
// @access  Public
const createTax = async (req, res) => {
  try {
    const { HSNCode, GSTPercentage } = req.body;
    
    // Calculate CGST and SGST if GST type is not IGST
    let cgstPercentage = 0;
    let sgstPercentage = 0;
    let igstPercentage = 0;
    
    if (req.body.GSTType === 'IGST') {
      igstPercentage = GSTPercentage;
    } else {
      cgstPercentage = GSTPercentage / 2;
      sgstPercentage = GSTPercentage / 2;
    }
    
    const tax = await Tax.create({
      HSNCode,
      GSTPercentage,
      CGSTPercentage: cgstPercentage,
      SGSTPercentage: sgstPercentage,
      IGSTPercentage: igstPercentage,
      Description: req.body.Description || ''
    });
    
    res.status(201).json({ 
      success: true, 
      data: tax,
      message: 'Tax created successfully' 
    });
  } catch (error) {
    console.error('Create tax error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tax with this HSN code already exists' 
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

// @desc    Update tax
// @route   PUT /api/taxes/:id
// @access  Public
const updateTax = async (req, res) => {
  try {
    const tax = await Tax.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!tax) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: tax,
      message: 'Tax updated successfully' 
    });
  } catch (error) {
    console.error('Update tax error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax not found' 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tax with this HSN code already exists' 
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

// @desc    Delete tax (HARD DELETE)
// @route   DELETE /api/taxes/:id
// @access  Public
const deleteTax = async (req, res) => {
  try {
    const tax = await Tax.findById(req.params.id);
    
    if (!tax) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax not found' 
      });
    }
    
    // Check if tax is used in items
    const Item = require('../models/Item');
    const itemCount = await Item.countDocuments({ HSNCode: tax.HSNCode });
    
    if (itemCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete tax. ${itemCount} item(s) are using this HSN code.` 
      });
    }
    
    // HARD DELETE
    await Tax.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Tax deleted successfully' 
    });
  } catch (error) {
    console.error('Delete tax error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Tax not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getTaxes,
  getTax,
  createTax,
  updateTax,
  deleteTax
};