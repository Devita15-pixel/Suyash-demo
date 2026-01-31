const Company = require('../models/Company');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ IsActive: true }).sort({ CompanyName: 1 });
    res.json({ 
      success: true, 
      data: companies,
      count: companies.length 
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
const getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: company 
    });
  } catch (error) {
    console.error('Get company error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create company
// @route   POST /api/companies
// @access  Public
const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    
    res.status(201).json({ 
      success: true, 
      data: company,
      message: 'Company created successfully' 
    });
  } catch (error) {
    console.error('Create company error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company with this GSTIN or PAN already exists' 
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

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Public
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: company,
      message: 'Company updated successfully' 
    });
  } catch (error) {
    console.error('Update company error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company with this GSTIN or PAN already exists' 
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

// @desc    Delete company (HARD DELETE)
// @route   DELETE /api/companies/:id
// @access  Public
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    // Check if company is used in quotations
    const Quotation = require('../models/Quotation');
    const quotationCount = await Quotation.countDocuments({ CompanyID: company._id });
    
    if (quotationCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete company. ${quotationCount} quotation(s) are associated with this company.` 
      });
    }
    
    // HARD DELETE
    await Company.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Company deleted successfully' 
    });
  } catch (error) {
    console.error('Delete company error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
};