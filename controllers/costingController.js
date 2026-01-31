const Costing = require('../models/Costing');
const Item = require('../models/Item');
const RawMaterial = require('../models/RawMaterial');
const DimensionWeight = require('../models/DimensionWeight');

// @desc    Get all costings
// @route   GET /api/costings
// @access  Public
const getCostings = async (req, res) => {
  try {
    const { page = 1, limit = 10, partNo, isActive } = req.query;
    
    const query = {};
    
    if (partNo) {
      query.PartNo = partNo;
    }
    
    if (isActive !== undefined) {
      query.IsActive = isActive === 'true';
    }
    
    const costings = await Costing.find(query)
      .sort({ UpdatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Costing.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: costings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get costings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single costing
// @route   GET /api/costings/:id
// @access  Public
const getCosting = async (req, res) => {
  try {
    const costing = await Costing.findById(req.params.id);
    
    if (!costing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: costing 
    });
  } catch (error) {
    console.error('Get costing error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create costing
// @route   POST /api/costings
// @access  Public
const createCosting = async (req, res) => {
  try {
    const { PartNo, RMRate, ProcessCost, FinishingCost, PackingCost, OverheadPercentage, MarginPercentage } = req.body;
    
    // Check if item exists
    const item = await Item.findOne({ PartNo });
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    // Get weight from dimension
    const dimension = await DimensionWeight.findOne({ PartNo });
    if (!dimension) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dimension/Weight not found for this part' 
      });
    }
    
    // Get current raw material rate
    const rawMaterial = await RawMaterial.findOne({ 
      MaterialName: item.MaterialType,
      IsActive: true 
    }).sort({ DateEffective: -1 });
    
    if (!rawMaterial) {
      return res.status(404).json({ 
        success: false, 
        message: `Raw material rate not found for ${item.MaterialType}` 
      });
    }
    
    const costing = await Costing.create({
      PartNo,
      RMWeight: dimension.WeightInKG,
      RMRate: RMRate || rawMaterial.EffectiveRate,
      ProcessCost: ProcessCost || 0,
      FinishingCost: FinishingCost || 0,
      PackingCost: PackingCost || 0,
      OverheadPercentage: OverheadPercentage || 10,
      MarginPercentage: MarginPercentage || 15
    });
    
    res.status(201).json({ 
      success: true, 
      data: costing,
      message: 'Costing created successfully' 
    });
  } catch (error) {
    console.error('Create costing error:', error);
    
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

// @desc    Update costing
// @route   PUT /api/costings/:id
// @access  Public
const updateCosting = async (req, res) => {
  try {
    const costing = await Costing.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!costing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: costing,
      message: 'Costing updated successfully' 
    });
  } catch (error) {
    console.error('Update costing error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
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

// @desc    Delete costing (HARD DELETE)
// @route   DELETE /api/costings/:id
// @access  Public
const deleteCosting = async (req, res) => {
  try {
    const costing = await Costing.findById(req.params.id);
    
    if (!costing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
      });
    }
    
    // HARD DELETE
    await Costing.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Costing deleted successfully' 
    });
  } catch (error) {
    console.error('Delete costing error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getCostings,
  getCosting,
  createCosting,
  updateCosting,
  deleteCosting
};