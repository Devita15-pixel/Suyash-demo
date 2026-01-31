const DimensionWeight = require('../models/DimensionWeight');
const Item = require('../models/Item');
const { calculateWeight } = require('../utils/calculations');

// @desc    Get all dimension weights
// @route   GET /api/dimension-weights
// @access  Public
const getDimensionWeights = async (req, res) => {
  try {
    const { page = 1, limit = 10, partNo } = req.query;
    
    const query = {};
    
    if (partNo) {
      query.PartNo = partNo;
    }
    
    const dimensionWeights = await DimensionWeight.find(query)
      .populate('PartNo', 'PartNo PartName MaterialType')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ CreatedAt: -1 });
    
    const total = await DimensionWeight.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: dimensionWeights,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get dimension weights error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single dimension weight
// @route   GET /api/dimension-weights/:id
// @access  Public
const getDimensionWeight = async (req, res) => {
  try {
    const dimensionWeight = await DimensionWeight.findById(req.params.id)
      .populate('PartNo', 'PartNo PartName MaterialType');
    
    if (!dimensionWeight) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dimension weight not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: dimensionWeight 
    });
  } catch (error) {
    console.error('Get dimension weight error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Dimension weight not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create dimension weight
// @route   POST /api/dimension-weights
// @access  Public
const createDimensionWeight = async (req, res) => {
  try {
    const { PartNo, Thickness, Width, Length, Density } = req.body;
    
    // Check if item exists
    const item = await Item.findOne({ PartNo });
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    // Check if dimension already exists for this part
    const existingDimension = await DimensionWeight.findOne({ PartNo });
    if (existingDimension) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dimension weight already exists for this part' 
      });
    }
    
    const dimensionWeight = await DimensionWeight.create({
      PartNo,
      Thickness,
      Width,
      Length,
      Density: Density || 8.96 // Default copper density
    });
    
    res.status(201).json({ 
      success: true, 
      data: dimensionWeight,
      message: 'Dimension weight created successfully' 
    });
  } catch (error) {
    console.error('Create dimension weight error:', error);
    
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

// @desc    Update dimension weight
// @route   PUT /api/dimension-weights/:id
// @access  Public
const updateDimensionWeight = async (req, res) => {
  try {
    const dimensionWeight = await DimensionWeight.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!dimensionWeight) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dimension weight not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: dimensionWeight,
      message: 'Dimension weight updated successfully' 
    });
  } catch (error) {
    console.error('Update dimension weight error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Dimension weight not found' 
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

// @desc    Delete dimension weight (HARD DELETE)
// @route   DELETE /api/dimension-weights/:id
// @access  Public
const deleteDimensionWeight = async (req, res) => {
  try {
    const dimensionWeight = await DimensionWeight.findById(req.params.id);
    
    if (!dimensionWeight) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dimension weight not found' 
      });
    }
    
    // HARD DELETE
    await DimensionWeight.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Dimension weight deleted successfully' 
    });
  } catch (error) {
    console.error('Delete dimension weight error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Dimension weight not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getDimensionWeights,
  getDimensionWeight,
  createDimensionWeight,
  updateDimensionWeight,
  deleteDimensionWeight
};