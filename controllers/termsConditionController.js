const TermsCondition = require('../models/TermsCondition');

// @desc    Get all terms & conditions
// @route   GET /api/terms-conditions
// @access  Public
const getTermsConditions = async (req, res) => {
  try {
    const { termType } = req.query;
    
    const query = { IsActive: true };
    
    if (termType) {
      query.TermType = termType;
    }
    
    const termsConditions = await TermsCondition.find(query)
      .sort({ Sequence: 1, TermType: 1 });
    
    res.json({ 
      success: true, 
      data: termsConditions 
    });
  } catch (error) {
    console.error('Get terms conditions error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single term & condition
// @route   GET /api/terms-conditions/:id
// @access  Public
const getTermsCondition = async (req, res) => {
  try {
    const termsCondition = await TermsCondition.findById(req.params.id);
    
    if (!termsCondition) {
      return res.status(404).json({ 
        success: false, 
        message: 'Terms & condition not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: termsCondition 
    });
  } catch (error) {
    console.error('Get terms condition error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Terms & condition not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create terms & condition
// @route   POST /api/terms-conditions
// @access  Public
const createTermsCondition = async (req, res) => {
  try {
    const termsCondition = await TermsCondition.create(req.body);
    
    res.status(201).json({ 
      success: true, 
      data: termsCondition,
      message: 'Terms & condition created successfully' 
    });
  } catch (error) {
    console.error('Create terms condition error:', error);
    
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

// @desc    Update terms & condition
// @route   PUT /api/terms-conditions/:id
// @access  Public
const updateTermsCondition = async (req, res) => {
  try {
    const termsCondition = await TermsCondition.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!termsCondition) {
      return res.status(404).json({ 
        success: false, 
        message: 'Terms & condition not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: termsCondition,
      message: 'Terms & condition updated successfully' 
    });
  } catch (error) {
    console.error('Update terms condition error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Terms & condition not found' 
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

// @desc    Delete terms & condition (HARD DELETE)
// @route   DELETE /api/terms-conditions/:id
// @access  Public
const deleteTermsCondition = async (req, res) => {
  try {
    const termsCondition = await TermsCondition.findById(req.params.id);
    
    if (!termsCondition) {
      return res.status(404).json({ 
        success: false, 
        message: 'Terms & condition not found' 
      });
    }
    
    // HARD DELETE
    await TermsCondition.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Terms & condition deleted successfully' 
    });
  } catch (error) {
    console.error('Delete terms condition error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Terms & condition not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getTermsConditions,
  getTermsCondition,
  createTermsCondition,
  updateTermsCondition,
  deleteTermsCondition
};