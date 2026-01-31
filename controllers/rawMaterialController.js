const RawMaterial = require('../models/RawMaterial');

// @desc    Get all raw materials
// @route   GET /api/raw-materials
// @access  Public
const getRawMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, materialName } = req.query;
    
    const query = { IsActive: true };
    
    if (materialName) {
      query.MaterialName = materialName;
    }
    
    const rawMaterials = await RawMaterial.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ MaterialName: 1, DateEffective: -1 });
    
    const total = await RawMaterial.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: rawMaterials,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get raw materials error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get current raw material rates
// @route   GET /api/raw-materials/current-rates
// @access  Public
const getCurrentRates = async (req, res) => {
  try {
    const currentRates = await RawMaterial.aggregate([
      { $match: { IsActive: true } },
      { $sort: { MaterialName: 1, DateEffective: -1 } },
      {
        $group: {
          _id: '$MaterialName',
          latestRate: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$latestRate' } },
      { $sort: { MaterialName: 1 } }
    ]);
    
    res.json({ 
      success: true, 
      data: currentRates 
    });
  } catch (error) {
    console.error('Get current rates error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single raw material
// @route   GET /api/raw-materials/:id
// @access  Public
const getRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id);
    
    if (!rawMaterial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Raw material not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: rawMaterial 
    });
  } catch (error) {
    console.error('Get raw material error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Raw material not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create raw material
// @route   POST /api/raw-materials
// @access  Public
const createRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.create(req.body);
    
    res.status(201).json({ 
      success: true, 
      data: rawMaterial,
      message: 'Raw material created successfully' 
    });
  } catch (error) {
    console.error('Create raw material error:', error);
    
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

// @desc    Update raw material
// @route   PUT /api/raw-materials/:id
// @access  Public
const updateRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!rawMaterial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Raw material not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: rawMaterial,
      message: 'Raw material updated successfully' 
    });
  } catch (error) {
    console.error('Update raw material error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Raw material not found' 
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

// @desc    Delete raw material (HARD DELETE)
// @route   DELETE /api/raw-materials/:id
// @access  Public
const deleteRawMaterial = async (req, res) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id);
    
    if (!rawMaterial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Raw material not found' 
      });
    }
    
    // HARD DELETE
    await RawMaterial.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Raw material deleted successfully' 
    });
  } catch (error) {
    console.error('Delete raw material error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Raw material not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getRawMaterials,
  getCurrentRates,
  getRawMaterial,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial
};