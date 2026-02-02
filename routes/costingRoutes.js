const express = require('express');
const router = express.Router();
const {
  getCostings,
  getCosting,
  createCosting,
  updateCosting,
  deleteCosting
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
 *         PartNo:
 *           type: string
 *           example: "PART-001"
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
 *         FinalRate:
 *           type: number
 *           format: float
 *           example: 591.746875
 *           minimum: 0
 *         IsActive:
 *           type: boolean
 *           example: true
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
 *         - RMRate
 *         - ProcessCost
 *         - FinishingCost
 *         - PackingCost
 *         - OverheadPercentage
 *         - MarginPercentage
 *       properties:
 *         PartNo:
 *           type: string
 *           example: "PART-001"
 *           description: "Part number must exist in Items"
 *         RMRate:
 *           type: number
 *           format: float
 *           example: 150.75
 *           minimum: 0
 *           description: "Raw material rate per kg. If not provided, uses current raw material rate"
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
 *     CostingUpdate:
 *       type: object
 *       properties:
 *         PartNo:
 *           type: string
 *           example: "PART-001"
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
 *     summary: Get all costings with pagination and filtering
 *     tags: [Costings]
 *     description: Retrieve all costings with optional filtering by part number and active status
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
 *         description: Filter by part number
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of costings retrieved successfully
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
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       GetCostings:
 *         value:
 *           success: true
 *           data:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *               PartNo: "PART-001"
 *               RMWeight: 2.5
 *               RMRate: 150.75
 *               RMCost: 376.875
 *               ProcessCost: 50.0
 *               FinishingCost: 25.0
 *               PackingCost: 15.0
 *               OverheadPercentage: 10.0
 *               OverheadCost: 46.6875
 *               MarginPercentage: 15.0
 *               MarginCost: 77.184375
 *               FinalRate: 591.746875
 *               IsActive: true
 *               CreatedAt: "2024-01-15T10:30:00.000Z"
 *               UpdatedAt: "2024-01-15T10:30:00.000Z"
 *           pagination:
 *             currentPage: 1
 *             totalPages: 5
 *             totalItems: 50
 *             itemsPerPage: 10
 */
router.get('/', protect, getCostings);

/**
 * @swagger
 * /api/costings/{id}:
 *   get:
 *     summary: Get single costing by ID
 *     tags: [Costings]
 *     description: Retrieve detailed information about a specific costing
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
 *         description: Costing retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Costing'
 *       404:
 *         description: Costing not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       GetCosting:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             PartNo: "PART-001"
 *             RMWeight: 2.5
 *             RMRate: 150.75
 *             RMCost: 376.875
 *             ProcessCost: 50.0
 *             FinishingCost: 25.0
 *             PackingCost: 15.0
 *             OverheadPercentage: 10.0
 *             OverheadCost: 46.6875
 *             MarginPercentage: 15.0
 *             MarginCost: 77.184375
 *             FinalRate: 591.746875
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-15T10:30:00.000Z"
 */
router.get('/:id', protect, getCosting);

/**
 * @swagger
 * /api/costings:
 *   post:
 *     summary: Create a new costing
 *     tags: [Costings]
 *     description: Create a new costing calculation. Automatically calculates RM weight from dimensions, RM cost, overhead cost, margin cost, and final rate.
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
 *         description: Costing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Costing'
 *                 message:
 *                   type: string
 *                   example: "Costing created successfully"
 *       400:
 *         description: Validation error or missing required data
 *       404:
 *         description: Item, dimension, or raw material not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       CreateCostingRequest:
 *         value:
 *           PartNo: "PART-001"
 *           RMRate: 150.75
 *           ProcessCost: 50.0
 *           FinishingCost: 25.0
 *           PackingCost: 15.0
 *           OverheadPercentage: 10.0
 *           MarginPercentage: 15.0
 *       CreateCostingResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             PartNo: "PART-001"
 *             RMWeight: 2.5
 *             RMRate: 150.75
 *             RMCost: 376.875
 *             ProcessCost: 50.0
 *             FinishingCost: 25.0
 *             PackingCost: 15.0
 *             OverheadPercentage: 10.0
 *             OverheadCost: 46.6875
 *             MarginPercentage: 15.0
 *             MarginCost: 77.184375
 *             FinalRate: 591.746875
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-15T10:30:00.000Z"
 *           message: "Costing created successfully"
 */
router.post('/', protect, createCosting);

/**
 * @swagger
 * /api/costings/{id}:
 *   put:
 *     summary: Update an existing costing
 *     tags: [Costings]
 *     description: Update costing information. All calculated fields (RMCost, OverheadCost, MarginCost, FinalRate) are automatically recalculated.
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
 *                   $ref: '#/components/schemas/Costing'
 *                 message:
 *                   type: string
 *                   example: "Costing updated successfully"
 *       400:
 *         description: Validation error
 *       404:
 *         description: Costing not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       UpdateCostingRequest:
 *         value:
 *           RMRate: 155.50
 *           ProcessCost: 55.0
 *           MarginPercentage: 18.0
 *       UpdateCostingResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             PartNo: "PART-001"
 *             RMWeight: 2.5
 *             RMRate: 155.50
 *             RMCost: 388.75
 *             ProcessCost: 55.0
 *             FinishingCost: 25.0
 *             PackingCost: 15.0
 *             OverheadPercentage: 10.0
 *             OverheadCost: 48.375
 *             MarginPercentage: 18.0
 *             MarginCost: 96.9225
 *             FinalRate: 628.0475
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-16T14:20:00.000Z"
 *           message: "Costing updated successfully"
 */
router.put('/:id', protect, updateCosting);

/**
 * @swagger
 * /api/costings/{id}:
 *   delete:
 *     summary: Delete a costing (HARD DELETE)
 *     tags: [Costings]
 *     description: Permanently delete a costing. This action cannot be undone.
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
 *         description: Costing not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteCosting);
module.exports = router;