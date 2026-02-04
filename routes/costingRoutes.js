const express = require('express');
const router = express.Router();
const {
  getCostings,
  getCosting,
  createCosting,
  updateCosting,
  deleteCosting,
  calculateCosting
} = require('../controllers/costingController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Costing:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         ItemID:
 *           oneOf:
 *             - type: string
 *               example: "698052b04c914c7c97fd75eb"
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "698052b04c914c7c97fd75eb"
 *                 PartNo:
 *                   type: string
 *                   example: "PN001"
 *                 PartName:
 *                   type: string
 *                   example: "Copper Bushing"
 *                 MaterialID:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "698052904c914c7c97fd75e5"
 *                     MaterialName:
 *                       type: string
 *                       example: "Copper"
 *                     MaterialCode:
 *                       type: string
 *                       example: "CU-001"
 *                     Density:
 *                       type: number
 *                       example: 8.96
 *         PartNo:
 *           type: string
 *           example: "PN001"
 *         RMWeight:
 *           type: number
 *           format: float
 *           example: 2.5
 *           minimum: 0
 *         RMRate:
 *           type: number
 *           format: float
 *           example: 150.75
 *           minimum: 0
 *         RMCost:
 *           type: number
 *           format: float
 *           example: 376.875
 *           minimum: 0
 *         ProcessCost:
 *           type: number
 *           format: float
 *           example: 50.0
 *           minimum: 0
 *         FinishingCost:
 *           type: number
 *           format: float
 *           example: 25.0
 *           minimum: 0
 *         PackingCost:
 *           type: number
 *           format: float
 *           example: 15.0
 *           minimum: 0
 *         OverheadPercentage:
 *           type: number
 *           format: float
 *           example: 10.0
 *           minimum: 0
 *           maximum: 100
 *         OverheadCost:
 *           type: number
 *           format: float
 *           example: 46.6875
 *           minimum: 0
 *         MarginPercentage:
 *           type: number
 *           format: float
 *           example: 15.0
 *           minimum: 0
 *           maximum: 100
 *         MarginCost:
 *           type: number
 *           format: float
 *           example: 77.184375
 *           minimum: 0
 *         SubCost:
 *           type: number
 *           format: float
 *           example: 466.875
 *           minimum: 0
 *         FinalRate:
 *           type: number
 *           format: float
 *           example: 591.746875
 *           minimum: 0
 *         IsActive:
 *           type: boolean
 *           example: true
 *         CreatedBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "697dd2fc74750dceff0bb60c"
 *             Username:
 *               type: string
 *               example: "john.doe"
 *             Email:
 *               type: string
 *               example: "john.doe@example.com"
 *         UpdatedBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "697de357bb6a3b918919d702"
 *             Username:
 *               type: string
 *               example: "jane.doe"
 *             Email:
 *               type: string
 *               example: "jane.doe@example.com"
 *         CreatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         UpdatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 * 
 *     CostingCreate:
 *       type: object
 *       required:
 *         - PartNo
 *       properties:
 *         PartNo:
 *           type: string
 *           example: "PN001"
 *           description: "Part number must exist in Items and be active"
 *         RMRate:
 *           type: number
 *           format: float
 *           example: 150.75
 *           minimum: 0
 *           description: "Raw material rate per kg. If not provided, uses current raw material rate from RawMaterial Master"
 *         ProcessCost:
 *           type: number
 *           format: float
 *           example: 50.0
 *           minimum: 0
 *           default: 0
 *           description: "If not provided, calculates from Process Master"
 *         FinishingCost:
 *           type: number
 *           format: float
 *           example: 25.0
 *           minimum: 0
 *           default: 0
 *         PackingCost:
 *           type: number
 *           format: float
 *           example: 15.0
 *           minimum: 0
 *           default: 0
 *         OverheadPercentage:
 *           type: number
 *           format: float
 *           example: 10.0
 *           minimum: 0
 *           maximum: 100
 *           default: 10
 *         MarginPercentage:
 *           type: number
 *           format: float
 *           example: 15.0
 *           minimum: 0
 *           maximum: 100
 *           default: 15
 * 
 *     CostingUpdate:
 *       type: object
 *       properties:
 *         RMRate:
 *           type: number
 *           format: float
 *           example: 155.50
 *           minimum: 0
 *         ProcessCost:
 *           type: number
 *           format: float
 *           example: 55.0
 *           minimum: 0
 *         FinishingCost:
 *           type: number
 *           format: float
 *           example: 28.0
 *           minimum: 0
 *         PackingCost:
 *           type: number
 *           format: float
 *           example: 18.0
 *           minimum: 0
 *         OverheadPercentage:
 *           type: number
 *           format: float
 *           example: 12.0
 *           minimum: 0
 *           maximum: 100
 *         MarginPercentage:
 *           type: number
 *           format: float
 *           example: 18.0
 *           minimum: 0
 *           maximum: 100
 *         IsActive:
 *           type: boolean
 *           example: false
 * 
 *     CostingCalculate:
 *       type: object
 *       required:
 *         - RMWeight
 *         - RMRate
 *       properties:
 *         PartNo:
 *           type: string
 *           example: "PN001"
 *           description: "Optional: For reference only"
 *         RMWeight:
 *           type: number
 *           format: float
 *           example: 2.5
 *           minimum: 0
 *         RMRate:
 *           type: number
 *           format: float
 *           example: 150.75
 *           minimum: 0
 *         ProcessCost:
 *           type: number
 *           format: float
 *           example: 50.0
 *           minimum: 0
 *           default: 0
 *         FinishingCost:
 *           type: number
 *           format: float
 *           example: 25.0
 *           minimum: 0
 *           default: 0
 *         PackingCost:
 *           type: number
 *           format: float
 *           example: 15.0
 *           minimum: 0
 *           default: 0
 *         OverheadPercentage:
 *           type: number
 *           format: float
 *           example: 10.0
 *           minimum: 0
 *           maximum: 100
 *           default: 10
 *         MarginPercentage:
 *           type: number
 *           format: float
 *           example: 15.0
 *           minimum: 0
 *           maximum: 100
 *           default: 15
 * 
 *   responses:
 *     CostingNotFound:
 *       description: Costing record not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Costing not found"
 * 
 *     ItemNotFound:
 *       description: Item/Part not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Item not found or inactive"
 * 
 *     DimensionNotFound:
 *       description: Dimension weight not found for item
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Dimension/Weight not found for this part. Please create dimension first."
 * 
 *     RawMaterialNotFound:
 *       description: Raw material rate not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "Raw material rate not found for Copper. Please provide RMRate."
 * 
 *     ValidationError:
 *       description: Validation error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 *                 example: "RMRate must be greater than 0, OverheadPercentage must be between 0 and 100"
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Costings
 *   description: Costing calculation and management
 */

/**
 * @swagger
 * /api/costings:
 *   get:
 *     summary: Get all costings with pagination, filtering and statistics
 *     tags: [Costings]
 *     description: Retrieve all costings with optional filtering, sorting, and includes statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: partNo
 *         schema:
 *           type: string
 *         description: Filter by part number (case insensitive)
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [CreatedAt, UpdatedAt, FinalRate, PartNo]
 *           default: UpdatedAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of costings retrieved successfully with statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Costing'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 50
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                 statistics:
 *                   type: object
 *                   properties:
 *                     totalRMCost:
 *                       type: number
 *                       format: float
 *                       example: 18843.75
 *                     totalProcessCost:
 *                       type: number
 *                       format: float
 *                       example: 2500.00
 *                     totalFinalRate:
 *                       type: number
 *                       format: float
 *                       example: 29587.34
 *                     avgMargin:
 *                       type: number
 *                       format: float
 *                       example: 15.5
 *                     count:
 *                       type: integer
 *                       example: 50
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', protect, getCostings);

/**
 * @swagger
 * /api/costings/{id}:
 *   get:
 *     summary: Get single costing by ID with detailed calculations
 *     tags: [Costings]
 *     description: Retrieve detailed information about a specific costing including formula breakdown and associated dimension data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Costing ID
 *     responses:
 *       200:
 *         description: Costing retrieved successfully with formula details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *                     PartNo:
 *                       type: string
 *                       example: "PN001"
 *                     RMWeight:
 *                       type: number
 *                       example: 2.5
 *                     RMRate:
 *                       type: number
 *                       example: 150.75
 *                     RMCost:
 *                       type: number
 *                       example: 376.88
 *                     ProcessCost:
 *                       type: number
 *                       example: 50.0
 *                     FinishingCost:
 *                       type: number
 *                       example: 25.0
 *                     PackingCost:
 *                       type: number
 *                       example: 15.0
 *                     OverheadPercentage:
 *                       type: number
 *                       example: 10.0
 *                     OverheadCost:
 *                       type: number
 *                       example: 46.69
 *                     MarginPercentage:
 *                       type: number
 *                       example: 15.0
 *                     MarginCost:
 *                       type: number
 *                       example: 77.18
 *                     SubCost:
 *                       type: number
 *                       example: 466.88
 *                     FinalRate:
 *                       type: number
 *                       example: 591.75
 *                     ItemID:
 *                       type: object
 *                     DimensionWeight:
 *                       type: object
 *                       properties:
 *                         Thickness:
 *                           type: number
 *                           example: 5.0
 *                         Width:
 *                           type: number
 *                           example: 50.0
 *                         Length:
 *                           type: number
 *                           example: 100.0
 *                         Density:
 *                           type: number
 *                           example: 8.96
 *                         VolumeMM3:
 *                           type: number
 *                           example: 25000.0
 *                     FormulaDetails:
 *                       type: object
 *                       properties:
 *                         rawMaterialCost:
 *                           type: string
 *                           example: "2.500 Kg × ₹150.75 = ₹376.88"
 *                         subCost:
 *                           type: string
 *                           example: "₹376.88 + ₹50.00 + ₹25.00 + ₹15.00 = ₹466.88"
 *                         overheadCost:
 *                           type: string
 *                           example: "₹466.88 × 10% = ₹46.69"
 *                         marginCost:
 *                           type: string
 *                           example: "₹466.88 × 15% = ₹77.18"
 *                         finalRate:
 *                           type: string
 *                           example: "₹466.88 + ₹46.69 + ₹77.18 = ₹591.75"
 *       404:
 *         $ref: '#/components/responses/CostingNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getCosting);

/**
 * @swagger
 * /api/costings:
 *   post:
 *     summary: Create a new costing with automatic calculations
 *     tags: [Costings]
 *     description: |
 *       Create a new costing calculation with automatic data population:
 *       
 *       1. **RM Weight**: Automatically fetched from Dimension Weight Master
 *       2. **RM Rate**: Uses provided rate OR fetches from Raw Material Master
 *       3. **Process Cost**: Uses provided cost OR calculates from Process Master
 *       4. **Calculates**: RM Cost, Sub Cost, Overhead Cost, Margin Cost, Final Rate
 *       
 *       **Formulas Used:**
 *       - **RM Cost = Weight × Effective RM Rate**
 *       - **Sub Cost = RM Cost + Process Cost + Finishing + Packing**
 *       - **Overhead Cost = Sub Cost × Overhead %**
 *       - **Margin Cost = Sub Cost × Margin %**
 *       - **Final Rate = Sub Cost + Overhead Cost + Margin Cost**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CostingCreate'
 *     responses:
 *       201:
 *         description: Costing created successfully with metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *                     PartNo:
 *                       type: string
 *                       example: "PN001"
 *                     RMWeight:
 *                       type: number
 *                       example: 2.5
 *                     RMRate:
 *                       type: number
 *                       example: 150.75
 *                     RMCost:
 *                       type: number
 *                       example: 376.88
 *                     ProcessCost:
 *                       type: number
 *                       example: 50.0
 *                     FinishingCost:
 *                       type: number
 *                       example: 25.0
 *                     PackingCost:
 *                       type: number
 *                       example: 15.0
 *                     OverheadPercentage:
 *                       type: number
 *                       example: 10.0
 *                     OverheadCost:
 *                       type: number
 *                       example: 46.69
 *                     MarginPercentage:
 *                       type: number
 *                       example: 15.0
 *                     MarginCost:
 *                       type: number
 *                       example: 77.18
 *                     SubCost:
 *                       type: number
 *                       example: 466.88
 *                     FinalRate:
 *                       type: number
 *                       example: 591.75
 *                     Metadata:
 *                       type: object
 *                       properties:
 *                         weightSource:
 *                           type: string
 *                           example: "Dimension Weight Master"
 *                         rawMaterialSource:
 *                           type: string
 *                           example: "Auto from RawMaterial: ETP (Scrap: 3%, Loss: 2%)"
 *                         processSource:
 *                           type: string
 *                           example: "Auto from Process Master"
 *                         dimensionDetails:
 *                           type: object
 *                     Calculations:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "Costing created successfully"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/ValidationError'
 *               - $ref: '#/components/responses/DimensionNotFound'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/ItemNotFound'
 *               - $ref: '#/components/responses/RawMaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', protect, createCosting);

/**
 * @swagger
 * /api/costings/calculate:
 *   post:
 *     summary: Calculate costing without saving
 *     tags: [Costings]
 *     description: |
 *       Calculate costing formulas without saving to database.
 *       
 *       **Required Fields:** RMWeight, RMRate
 *       
 *       **Formulas Calculated:**
 *       - **RM Cost = Weight × Effective RM Rate**
 *       - **Sub Cost = RM Cost + Process Cost + Finishing + Packing**
 *       - **Overhead Cost = Sub Cost × Overhead %**
 *       - **Margin Cost = Sub Cost × Margin %**
 *       - **Final Rate = Sub Cost + Overhead Cost + Margin Cost**
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CostingCalculate'
 *     responses:
 *       200:
 *         description: Costing calculated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     inputs:
 *                       type: object
 *                       properties:
 *                         RMWeight:
 *                           type: number
 *                           example: 2.5
 *                         RMRate:
 *                           type: number
 *                           example: 150.75
 *                         ProcessCost:
 *                           type: number
 *                           example: 50.0
 *                         FinishingCost:
 *                           type: number
 *                           example: 25.0
 *                         PackingCost:
 *                           type: number
 *                           example: 15.0
 *                         OverheadPercentage:
 *                           type: number
 *                           example: 10.0
 *                         MarginPercentage:
 *                           type: number
 *                           example: 15.0
 *                     calculations:
 *                       type: object
 *                       properties:
 *                         rawMaterialCost:
 *                           type: number
 *                           example: 376.88
 *                         subCost:
 *                           type: number
 *                           example: 466.88
 *                         overheadCost:
 *                           type: number
 *                           example: 46.69
 *                         marginCost:
 *                           type: number
 *                           example: 77.18
 *                         finalRate:
 *                           type: number
 *                           example: 591.75
 *                     formulas:
 *                       type: object
 *                       properties:
 *                         rawMaterialCost:
 *                           type: string
 *                           example: "2.5 Kg × ₹150.75 = ₹376.88"
 *                         subCost:
 *                           type: string
 *                           example: "₹376.88 + ₹50.00 + ₹25.00 + ₹15.00 = ₹466.88"
 *                         overheadCost:
 *                           type: string
 *                           example: "₹466.88 × 10% = ₹46.69"
 *                         marginCost:
 *                           type: string
 *                           example: "₹466.88 × 15% = ₹77.18"
 *                         finalRate:
 *                           type: string
 *                           example: "₹466.88 + ₹46.69 + ₹77.18 = ₹591.75"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "RMWeight and RMRate are required for calculation"
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/calculate', protect, calculateCosting);

/**
 * @swagger
 * /api/costings/{id}:
 *   put:
 *     summary: Update an existing costing
 *     tags: [Costings]
 *     description: |
 *       Update costing information. All calculated fields are automatically recalculated:
 *       
 *       - RM Cost = Weight × Effective RM Rate
 *       - Sub Cost = RM Cost + Process Cost + Finishing + Packing
 *       - Overhead Cost = Sub Cost × Overhead %
 *       - Margin Cost = Sub Cost × Margin %
 *       - Final Rate = Sub Cost + Overhead Cost + Margin Cost
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Costing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CostingUpdate'
 *     responses:
 *       200:
 *         description: Costing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *                     PartNo:
 *                       type: string
 *                       example: "PN001"
 *                     RMWeight:
 *                       type: number
 *                       example: 2.5
 *                     RMRate:
 *                       type: number
 *                       example: 155.50
 *                     RMCost:
 *                       type: number
 *                       example: 388.75
 *                     ProcessCost:
 *                       type: number
 *                       example: 55.0
 *                     FinishingCost:
 *                       type: number
 *                       example: 25.0
 *                     PackingCost:
 *                       type: number
 *                       example: 15.0
 *                     OverheadPercentage:
 *                       type: number
 *                       example: 10.0
 *                     OverheadCost:
 *                       type: number
 *                       example: 48.38
 *                     MarginPercentage:
 *                       type: number
 *                       example: 18.0
 *                     MarginCost:
 *                       type: number
 *                       example: 96.92
 *                     SubCost:
 *                       type: number
 *                       example: 483.75
 *                     FinalRate:
 *                       type: number
 *                       example: 629.05
 *                     Calculations:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "Costing updated successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/CostingNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateCosting);

/**
 * @swagger
 * /api/costings/{id}:
 *   delete:
 *     summary: Delete a costing (HARD DELETE)
 *     tags: [Costings]
 *     description: |
 *       Permanently delete a costing. This action cannot be undone.
 *       
 *       **Note:** Checks if costing is used in quotations before deletion
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Costing ID
 *     responses:
 *       200:
 *         description: Costing deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Costing deleted successfully"
 *       404:
 *         $ref: '#/components/responses/CostingNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteCosting);

module.exports = router;