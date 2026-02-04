const Costing = require('../models/Costing');
const Item = require('../models/Item');
const RawMaterial = require('../models/RawMaterial');
const DimensionWeight = require('../models/DimensionWeight');
const Process = require('../models/Process');

// @desc    Get all costings
// @route   GET /api/costings
// @access  Private
const getCostings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      partNo, 
      isActive,
      sortBy = 'UpdatedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    if (partNo) {
      query.PartNo = partNo.toUpperCase();
    }
    
    if (isActive !== undefined) {
      query.IsActive = isActive === 'true';
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const costings = await Costing.find(query)
      .populate({
        path: 'ItemID',
        select: 'PartNo PartName MaterialID Unit',
        populate: {
          path: 'MaterialID',
          select: 'MaterialName MaterialCode Density'
        }
      })
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Costing.countDocuments(query);
    
    // Calculate totals
    const stats = await Costing.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRMCost: { $sum: '$RMCost' },
          totalProcessCost: { $sum: '$ProcessCost' },
          totalFinalRate: { $sum: '$FinalRate' },
          avgMargin: { $avg: '$MarginPercentage' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      data: costings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      statistics: stats[0] || {
        totalRMCost: 0,
        totalProcessCost: 0,
        totalFinalRate: 0,
        avgMargin: 0,
        count: 0
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
// @access  Private
const getCosting = async (req, res) => {
  try {
    const costing = await Costing.findById(req.params.id)
      .populate({
        path: 'ItemID',
        select: 'PartNo PartName Description DrawingNo RevisionNo Unit HSNCode',
        populate: {
          path: 'MaterialID',
          select: 'MaterialName MaterialCode Density Unit Standard Grade Color'
        }
      })
      .populate('CreatedBy', 'Username Email EmployeeID')
      .populate('UpdatedBy', 'Username Email EmployeeID');
    
    if (!costing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
      });
    }
    
    // Get associated dimension weight
    const dimensionWeight = await DimensionWeight.findOne({ PartNo: costing.PartNo });
    
    const responseData = {
      ...costing.toObject(),
      DimensionWeight: dimensionWeight || null,
      Calculations: {
        rawMaterialCost: parseFloat(costing.RMCost?.toFixed(2)),
        subCost: parseFloat(costing.SubCost?.toFixed(2)),
        overheadCost: parseFloat(costing.OverheadCost?.toFixed(2)),
        marginCost: parseFloat(costing.MarginCost?.toFixed(2)),
        finalRate: parseFloat(costing.FinalRate?.toFixed(2))
      },
      FormulaDetails: {
        rawMaterialCost: `${costing.RMWeight?.toFixed(3)} Kg × ₹${costing.RMRate?.toFixed(2)} = ₹${costing.RMCost?.toFixed(2)}`,
        subCost: `₹${costing.RMCost?.toFixed(2)} + ₹${costing.ProcessCost?.toFixed(2)} + ₹${costing.FinishingCost?.toFixed(2)} + ₹${costing.PackingCost?.toFixed(2)} = ₹${costing.SubCost?.toFixed(2)}`,
        overheadCost: `₹${costing.SubCost?.toFixed(2)} × ${costing.OverheadPercentage}% = ₹${costing.OverheadCost?.toFixed(2)}`,
        marginCost: `₹${costing.SubCost?.toFixed(2)} × ${costing.MarginPercentage}% = ₹${costing.MarginCost?.toFixed(2)}`,
        finalRate: `₹${costing.SubCost?.toFixed(2)} + ₹${costing.OverheadCost?.toFixed(2)} + ₹${costing.MarginCost?.toFixed(2)} = ₹${costing.FinalRate?.toFixed(2)}`
      }
    };
    
    res.json({ 
      success: true, 
      data: responseData 
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
// @access  Private
const createCosting = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      PartNo, 
      RMRate,
      ProcessCost,
      FinishingCost,
      PackingCost,
      OverheadPercentage = 10,
      MarginPercentage = 15
    } = req.body;
    
    // 1. Check if item exists and is active
    const item = await Item.findOne({ 
      PartNo: PartNo.toUpperCase(),
      IsActive: true 
    }).populate('MaterialID', 'MaterialName MaterialCode Density');
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found or inactive' 
      });
    }
    
    // 2. Get weight from dimension weight
    const dimensionWeight = await DimensionWeight.findOne({ 
      PartNo: PartNo.toUpperCase() 
    });
    
    if (!dimensionWeight) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dimension/Weight not found for this part. Please create dimension first.' 
      });
    }
    
    const rmWeight = dimensionWeight.WeightInKG;
    
    // 3. Get current raw material rate
    const rawMaterial = await RawMaterial.findOne({ 
      MaterialName: item.MaterialID.MaterialName,
      IsActive: true 
    }).sort({ DateEffective: -1 });
    
    let effectiveRMRate = RMRate;
    let rawMaterialSource = 'Manual Input';
    
    if (!RMRate && rawMaterial) {
      effectiveRMRate = rawMaterial.EffectiveRate;
      rawMaterialSource = `Auto from RawMaterial: ${rawMaterial.Grade} (Scrap: ${rawMaterial.ScrapPercentage}%, Loss: ${rawMaterial.TransportLossPercentage}%)`;
    } else if (!RMRate && !rawMaterial) {
      return res.status(404).json({ 
        success: false, 
        message: `Raw material rate not found for ${item.MaterialID.MaterialName}. Please provide RMRate.` 
      });
    }
    
    // 4. Calculate process cost if not provided
    let processCost = ProcessCost || 0;
    let processSource = ProcessCost ? 'Manual Input' : 'Default';
    
    if (!ProcessCost) {
      // Get processes for this item type and calculate
      const processes = await Process.find({ IsActive: true });
      if (processes.length > 0) {
        processCost = processes.reduce((total, process) => {
          let cost = 0;
          switch (process.RateType) {
            case 'Per Nos':
              cost = process.Rate * 1; // Assuming 1 quantity
              break;
            case 'Per Kg':
              cost = process.Rate * rmWeight;
              break;
            case 'Per Hour':
              cost = process.Rate * 1; // Assuming 1 hour
              break;
            case 'Fixed':
              cost = process.Rate;
              break;
          }
          return total + cost;
        }, 0);
        processSource = 'Auto from Process Master';
      }
    }
    
    // 5. Create costing
    const costing = await Costing.create({
      ItemID: item._id,
      PartNo: item.PartNo,
      RMWeight: rmWeight,
      RMRate: effectiveRMRate,
      ProcessCost: processCost,
      FinishingCost: FinishingCost || 0,
      PackingCost: PackingCost || 0,
      OverheadPercentage: OverheadPercentage,
      MarginPercentage: MarginPercentage,
      CreatedBy: userId,
      UpdatedBy: userId
    });
    
    // 6. Populate response
    const populatedCosting = await Costing.findById(costing._id)
      .populate({
        path: 'ItemID',
        select: 'PartNo PartName MaterialID',
        populate: {
          path: 'MaterialID',
          select: 'MaterialName MaterialCode Density'
        }
      });
    
    const responseData = {
      ...populatedCosting.toObject(),
      Metadata: {
        weightSource: 'Dimension Weight Master',
        rawMaterialSource,
        processSource,
        dimensionDetails: {
          thickness: dimensionWeight.Thickness,
          width: dimensionWeight.Width,
          length: dimensionWeight.Length,
          density: dimensionWeight.Density,
          volume: dimensionWeight.VolumeMM3
        }
      },
      Calculations: {
        rawMaterialCost: parseFloat(populatedCosting.RMCost?.toFixed(2)),
        subCost: parseFloat(populatedCosting.SubCost?.toFixed(2)),
        overheadCost: parseFloat(populatedCosting.OverheadCost?.toFixed(2)),
        marginCost: parseFloat(populatedCosting.MarginCost?.toFixed(2)),
        finalRate: parseFloat(populatedCosting.FinalRate?.toFixed(2))
      }
    };
    
    res.status(201).json({ 
      success: true, 
      data: responseData,
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
// @access  Private
const updateCosting = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const costing = await Costing.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body, 
        UpdatedAt: Date.now(),
        UpdatedBy: userId 
      },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'ItemID',
      select: 'PartNo PartName MaterialID',
      populate: {
        path: 'MaterialID',
        select: 'MaterialName MaterialCode Density'
      }
    });
    
    if (!costing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        ...costing.toObject(),
        Calculations: {
          rawMaterialCost: parseFloat(costing.RMCost?.toFixed(2)),
          subCost: parseFloat(costing.SubCost?.toFixed(2)),
          overheadCost: parseFloat(costing.OverheadCost?.toFixed(2)),
          marginCost: parseFloat(costing.MarginCost?.toFixed(2)),
          finalRate: parseFloat(costing.FinalRate?.toFixed(2))
        }
      },
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

// @desc    Calculate costing without saving
// @route   POST /api/costings/calculate
// @access  Private
const calculateCosting = async (req, res) => {
  try {
    const {
      PartNo,
      RMWeight,
      RMRate,
      ProcessCost = 0,
      FinishingCost = 0,
      PackingCost = 0,
      OverheadPercentage = 10,
      MarginPercentage = 15
    } = req.body;
    
    // Validate required fields
    if (!RMWeight || !RMRate) {
      return res.status(400).json({
        success: false,
        message: 'RMWeight and RMRate are required for calculation'
      });
    }
    
    // Perform calculations
    const rmCost = RMWeight * RMRate;                    // RM Cost = Weight × Effective RM Rate
    const subCost = rmCost + ProcessCost + FinishingCost + PackingCost; // Sub Cost = RM Cost + Process Cost + Finishing + Packing
    const overheadCost = subCost * (OverheadPercentage / 100);  // Overhead Cost = Sub Cost × Overhead %
    const marginCost = subCost * (MarginPercentage / 100);      // Margin Cost = Sub Cost × Margin %
    const finalRate = subCost + overheadCost + marginCost;      // Final Rate = Sub Cost + Overhead Cost + Margin Cost
    
    res.json({
      success: true,
      data: {
        inputs: {
          RMWeight: parseFloat(RMWeight),
          RMRate: parseFloat(RMRate),
          ProcessCost: parseFloat(ProcessCost),
          FinishingCost: parseFloat(FinishingCost),
          PackingCost: parseFloat(PackingCost),
          OverheadPercentage: parseFloat(OverheadPercentage),
          MarginPercentage: parseFloat(MarginPercentage)
        },
        calculations: {
          rawMaterialCost: parseFloat(rmCost.toFixed(2)),
          subCost: parseFloat(subCost.toFixed(2)),
          overheadCost: parseFloat(overheadCost.toFixed(2)),
          marginCost: parseFloat(marginCost.toFixed(2)),
          finalRate: parseFloat(finalRate.toFixed(2))
        },
        formulas: {
          rawMaterialCost: `${RMWeight} Kg × ₹${RMRate} = ₹${rmCost.toFixed(2)}`,
          subCost: `₹${rmCost.toFixed(2)} + ₹${ProcessCost} + ₹${FinishingCost} + ₹${PackingCost} = ₹${subCost.toFixed(2)}`,
          overheadCost: `₹${subCost.toFixed(2)} × ${OverheadPercentage}% = ₹${overheadCost.toFixed(2)}`,
          marginCost: `₹${subCost.toFixed(2)} × ${MarginPercentage}% = ₹${marginCost.toFixed(2)}`,
          finalRate: `₹${subCost.toFixed(2)} + ₹${overheadCost.toFixed(2)} + ₹${marginCost.toFixed(2)} = ₹${finalRate.toFixed(2)}`
        }
      }
    });
  } catch (error) {
    console.error('Calculate costing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete costing (HARD DELETE)
// @route   DELETE /api/costings/:id
// @access  Private
const deleteCosting = async (req, res) => {
  try {
    const costing = await Costing.findById(req.params.id);
    
    if (!costing) {
      return res.status(404).json({ 
        success: false, 
        message: 'Costing not found' 
      });
    }
    
    // Check if costing is used in quotations
    // const quotationCount = await Quotation.countDocuments({ CostingID: req.params.id });
    // if (quotationCount > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Cannot delete costing. ${quotationCount} quotation(s) are associated with this costing.`
    //   });
    // }
    
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
  deleteCosting,
  calculateCosting
};