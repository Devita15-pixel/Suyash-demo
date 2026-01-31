const Material = require('../models/Material');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Public
const getMaterials = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { MaterialCode: new RegExp(search, 'i') },
        { MaterialName: new RegExp(search, 'i') },
        { Description: new RegExp(search, 'i') },
        { Standard: new RegExp(search, 'i') },
        { Grade: new RegExp(search, 'i') }
      ];
    }
    
    if (isActive !== undefined) {
      query.IsActive = isActive === 'true';
    }
    
    const materials = await Material.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ MaterialName: 1 });
    
    const total = await Material.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: materials,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get active materials for dropdown
// @route   GET /api/materials/active
// @access  Public
const getActiveMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ IsActive: true })
      .select('MaterialCode MaterialName Description Density Unit Standard Grade Color')
      .sort({ MaterialName: 1 });
    
    res.json({ 
      success: true, 
      data: materials 
    });
  } catch (error) {
    console.error('Get active materials error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Public
const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: material 
    });
  } catch (error) {
    console.error('Get material error:', error);
    
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

// @desc    Create material
// @route   POST /api/materials
// @access  Public
const createMaterial = async (req, res) => {
  try {
    // Set created by user
    const materialData = {
      ...req.body,
      CreatedBy: req.user?._id || null
    };
    
    const material = await Material.create(materialData);
    
    res.status(201).json({ 
      success: true, 
      data: material,
      message: 'Material created successfully' 
    });
  } catch (error) {
    console.error('Create material error:', error);
    
    if (error.code === 11000) {
      const field = error.message.includes('MaterialCode') ? 'Material Code' : 'Material Name';
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists` 
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

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Public
const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    // Prevent updating MaterialCode if it's being used in items
    if (req.body.MaterialCode && req.body.MaterialCode !== material.MaterialCode) {
      const Item = require('../models/Item');
      const itemCount = await Item.countDocuments({ 
        $or: [
          { 'MaterialID': material._id }
        ]
      });
      
      if (itemCount > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot update material code. ${itemCount} item(s) are using this material.` 
        });
      }
    }
    
    // Update material
    const updatedMaterial = await Material.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        UpdatedBy: req.user?._id || null 
      },
      { new: true, runValidators: true }
    );
    
    res.json({ 
      success: true, 
      data: updatedMaterial,
      message: 'Material updated successfully' 
    });
  } catch (error) {
    console.error('Update material error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    if (error.code === 11000) {
      const field = error.message.includes('MaterialCode') ? 'Material Code' : 'Material Name';
      return res.status(400).json({ 
        success: false, 
        message: `${field} already exists` 
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

// @desc    Delete material (SOFT DELETE)
// @route   DELETE /api/materials/:id
// @access  Public
const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    // Check if material is used in items
    const Item = require('../models/Item');
    const itemCount = await Item.countDocuments({ MaterialID: material._id });
    
    if (itemCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete material. ${itemCount} item(s) are using this material.` 
      });
    }
    
    // Check if material is used in raw materials
    const RawMaterial = require('../models/RawMaterial');
    const rawMaterialCount = await RawMaterial.countDocuments({ 
      MaterialName: material.MaterialName 
    });
    
    if (rawMaterialCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete material. ${rawMaterialCount} raw material rate(s) are using this material.` 
      });
    }
    
    // SOFT DELETE - Update IsActive to false
    material.IsActive = false;
    material.UpdatedBy = req.user?._id || null;
    await material.save();
    
    res.json({ 
      success: true, 
      message: 'Material deactivated successfully' 
    });
  } catch (error) {
    console.error('Delete material error:', error);
    
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

// @desc    Reactivate material
// @route   PUT /api/materials/:id/reactivate
// @access  Public
const reactivateMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ 
        success: false, 
        message: 'Material not found' 
      });
    }
    
    material.IsActive = true;
    material.UpdatedBy = req.user?._id || null;
    await material.save();
    
    res.json({ 
      success: true, 
      data: material,
      message: 'Material reactivated successfully' 
    });
  } catch (error) {
    console.error('Reactivate material error:', error);
    
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
  getMaterials,
  getActiveMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  reactivateMaterial
};