const Item = require('../models/Item');
const Material = require('../models/Material');

// @desc    Get all items
// @route   GET /api/items
// @access  Public
const getItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, materialId } = req.query;
    
    const query = { IsActive: true };
    
    if (search) {
      query.$or = [
        { PartNo: new RegExp(search, 'i') },
        { PartName: new RegExp(search, 'i') },
        { Description: new RegExp(search, 'i') },
        { DrawingNo: new RegExp(search, 'i') }
      ];
    }
    
    if (materialId) {
      query.MaterialID = materialId;
    }
    
    const items = await Item.find(query)
      .populate('MaterialID', 'MaterialCode MaterialName Description Density Unit')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ PartNo: 1 });
    
    const total = await Item.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: items,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('MaterialID', 'MaterialCode MaterialName Description Density Unit Standard Grade Color')
      .populate('CreatedBy', 'Username Email')
      .populate('UpdatedBy', 'Username Email');
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: item 
    });
  } catch (error) {
    console.error('Get item error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create item
// @route   POST /api/items
// @access  Public
const createItem = async (req, res) => {
  try {
    const { MaterialID } = req.body;
    
    // Check if material exists and is active
    if (MaterialID) {
      const material = await Material.findOne({ _id: MaterialID, IsActive: true });
      if (!material) {
        return res.status(404).json({ 
          success: false, 
          message: 'Material not found or inactive' 
        });
      }
    }
    
    // Set created by user
    const itemData = {
      ...req.body,
      CreatedBy: req.user?._id || null
    };
    
    const item = await Item.create(itemData);
    
    // Populate material data in response
    const populatedItem = await Item.findById(item._id)
      .populate('MaterialID', 'MaterialCode MaterialName Description Density Unit');
    
    res.status(201).json({ 
      success: true, 
      data: populatedItem,
      message: 'Item created successfully' 
    });
  } catch (error) {
    console.error('Create item error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item with this part number already exists' 
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

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Public
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    const { MaterialID } = req.body;
    
    // Check if material exists and is active
    if (MaterialID && MaterialID !== item.MaterialID.toString()) {
      const material = await Material.findOne({ _id: MaterialID, IsActive: true });
      if (!material) {
        return res.status(404).json({ 
          success: false, 
          message: 'Material not found or inactive' 
        });
      }
    }
    
    // Update item
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        UpdatedBy: req.user?._id || null 
      },
      { new: true, runValidators: true }
    ).populate('MaterialID', 'MaterialCode MaterialName Description Density Unit');
    
    res.json({ 
      success: true, 
      data: updatedItem,
      message: 'Item updated successfully' 
    });
  } catch (error) {
    console.error('Update item error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item with this part number already exists' 
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

// @desc    Delete item (SOFT DELETE)
// @route   DELETE /api/items/:id
// @access  Public
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    // Check if item is used in costings
    const Costing = require('../models/Costing');
    const costingCount = await Costing.countDocuments({ PartNo: item.PartNo });
    
    if (costingCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete item. ${costingCount} costing(s) are associated with this item.` 
      });
    }
    
    // Check if item is used in dimension/weight
    const DimensionWeight = require('../models/DimensionWeight');
    const dimensionCount = await DimensionWeight.countDocuments({ PartNo: item.PartNo });
    
    if (dimensionCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete item. ${dimensionCount} dimension record(s) are associated with this item.` 
      });
    }
    
    // SOFT DELETE - Update IsActive to false
    item.IsActive = false;
    item.UpdatedBy = req.user?._id || null;
    await item.save();
    
    res.json({ 
      success: true, 
      message: 'Item deactivated successfully' 
    });
  } catch (error) {
    console.error('Delete item error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Reactivate item
// @route   PUT /api/items/:id/reactivate
// @access  Public
const reactivateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    item.IsActive = true;
    item.UpdatedBy = req.user?._id || null;
    await item.save();
    
    res.json({ 
      success: true, 
      data: item,
      message: 'Item reactivated successfully' 
    });
  } catch (error) {
    console.error('Reactivate item error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get items by material
// @route   GET /api/items/material/:materialId
// @access  Public
const getItemsByMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    
    // Check if material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    const items = await Item.find({ 
      MaterialID: materialId,
      IsActive: true 
    })
    .populate('MaterialID', 'MaterialCode MaterialName')
    .sort({ PartNo: 1 });
    
    res.json({ 
      success: true, 
      data: items,
      count: items.length 
    });
  } catch (error) {
    console.error('Get items by material error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  reactivateItem,
  getItemsByMaterial
};