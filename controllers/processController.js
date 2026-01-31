const Process = require('../models/Process');

// @desc    Get all processes
// @route   GET /api/processes
// @access  Public
const getProcesses = async (req, res) => {
  try {
    const { page = 1, limit = 10, vendorOrInhouse, rateType } = req.query;
    
    const query = { IsActive: true };
    
    if (vendorOrInhouse) {
      query.VendorOrInhouse = vendorOrInhouse;
    }
    
    if (rateType) {
      query.RateType = rateType;
    }
    
    const processes = await Process.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ ProcessName: 1 });
    
    const total = await Process.countDocuments(query);
    
    res.json({ 
      success: true, 
      data: processes,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get processes error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Get single process
// @route   GET /api/processes/:id
// @access  Public
const getProcess = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id);
    
    if (!process) {
      return res.status(404).json({ 
        success: false, 
        message: 'Process not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: process 
    });
  } catch (error) {
    console.error('Get process error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Process not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// @desc    Create process
// @route   POST /api/processes
// @access  Public
const createProcess = async (req, res) => {
  try {
    const process = await Process.create(req.body);
    
    res.status(201).json({ 
      success: true, 
      data: process,
      message: 'Process created successfully' 
    });
  } catch (error) {
    console.error('Create process error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Process with this name already exists' 
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

// @desc    Update process
// @route   PUT /api/processes/:id
// @access  Public
const updateProcess = async (req, res) => {
  try {
    const process = await Process.findByIdAndUpdate(
      req.params.id,
      { ...req.body, UpdatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!process) {
      return res.status(404).json({ 
        success: false, 
        message: 'Process not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: process,
      message: 'Process updated successfully' 
    });
  } catch (error) {
    console.error('Update process error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Process not found' 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Process with this name already exists' 
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

// @desc    Delete process (HARD DELETE)
// @route   DELETE /api/processes/:id
// @access  Public
const deleteProcess = async (req, res) => {
  try {
    const process = await Process.findById(req.params.id);
    
    if (!process) {
      return res.status(404).json({ 
        success: false, 
        message: 'Process not found' 
      });
    }
    
    // HARD DELETE
    await Process.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Process deleted successfully' 
    });
  } catch (error) {
    console.error('Delete process error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false, 
        message: 'Process not found' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

module.exports = {
  getProcesses,
  getProcess,
  createProcess,
  updateProcess,
  deleteProcess
};