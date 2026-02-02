const express = require('express');
const router = express.Router();
const {
  getProcesses,
  getProcess,
  createProcess,
  updateProcess,
  deleteProcess
} = require('../controllers/processController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Process:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         ProcessName:
 *           type: string
 *           example: "CNC Machining"
 *         RateType:
 *           type: string
 *           enum: [Per Nos, Per Kg, Per Hour, Fixed]
 *           example: "Per Hour"
 *         Rate:
 *           type: number
 *           format: float
 *           example: 45.50
 *           minimum: 0
 *         VendorOrInhouse:
 *           type: string
 *           enum: [Vendor, Inhouse]
 *           example: "Vendor"
 *         Description:
 *           type: string
 *           example: "Computer Numerical Control machining process for precision parts"
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
 *     ProcessCreate:
 *       type: object
 *       required:
 *         - ProcessName
 *         - RateType
 *         - Rate
 *         - VendorOrInhouse
 *       properties:
 *         ProcessName:
 *           type: string
 *           example: "CNC Machining"
 *           description: "Process name must be unique"
 *         RateType:
 *           type: string
 *           enum: [Per Nos, Per Kg, Per Hour, Fixed]
 *           example: "Per Hour"
 *         Rate:
 *           type: number
 *           format: float
 *           example: 45.50
 *           minimum: 0
 *         VendorOrInhouse:
 *           type: string
 *           enum: [Vendor, Inhouse]
 *           example: "Vendor"
 *         Description:
 *           type: string
 *           example: "Computer Numerical Control machining process for precision parts"
 *         IsActive:
 *           type: boolean
 *           example: true
 *           default: true
 * 
 *     ProcessUpdate:
 *       type: object
 *       properties:
 *         ProcessName:
 *           type: string
 *           example: "CNC Machining - Updated"
 *         RateType:
 *           type: string
 *           enum: [Per Nos, Per Kg, Per Hour, Fixed]
 *           example: "Per Nos"
 *         Rate:
 *           type: number
 *           format: float
 *           example: 50.00
 *           minimum: 0
 *         VendorOrInhouse:
 *           type: string
 *           enum: [Vendor, Inhouse]
 *           example: "Inhouse"
 *         Description:
 *           type: string
 *           example: "Updated description for CNC machining process"
 *         IsActive:
 *           type: boolean
 *           example: false
 * 
 *   parameters:
 *     vendorOrInhouseParam:
 *       in: query
 *       name: vendorOrInhouse
 *       schema:
 *         type: string
 *         enum: [Vendor, Inhouse]
 *       description: Filter by vendor or inhouse processes
 *     rateTypeParam:
 *       in: query
 *       name: rateType
 *       schema:
 *         type: string
 *         enum: [Per Nos, Per Kg, Per Hour, Fixed]
 *       description: Filter by rate type
 * 
 *   responses:
 *     ProcessNotFound:
 *       description: Process not found
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
 *                 example: "Process not found"
 * 
 *     DuplicateProcess:
 *       description: Process with this name already exists
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
 *                 example: "Process with this name already exists"
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
 *                 example: "Process name is required, Rate must be greater than or equal to 0"
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
 *   name: Processes
 *   description: Manufacturing process management
 */

/**
 * @swagger
 * /api/processes:
 *   get:
 *     summary: Get all processes with pagination and filtering
 *     tags: [Processes]
 *     description: Retrieve all active processes with optional filtering by vendor/inhouse and rate type
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
 *       - $ref: '#/components/parameters/vendorOrInhouseParam'
 *       - $ref: '#/components/parameters/rateTypeParam'
 *     responses:
 *       200:
 *         description: List of processes retrieved successfully
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
 *                     $ref: '#/components/schemas/Process'
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
 *       GetProcesses:
 *         value:
 *           success: true
 *           data:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *               ProcessName: "CNC Machining"
 *               RateType: "Per Hour"
 *               Rate: 45.50
 *               VendorOrInhouse: "Vendor"
 *               Description: "Computer Numerical Control machining process for precision parts"
 *               IsActive: true
 *               CreatedAt: "2024-01-15T10:30:00.000Z"
 *               UpdatedAt: "2024-01-15T10:30:00.000Z"
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *               ProcessName: "Heat Treatment"
 *               RateType: "Per Kg"
 *               Rate: 15.75
 *               VendorOrInhouse: "Inhouse"
 *               Description: "Annealing and hardening process for metals"
 *               IsActive: true
 *               CreatedAt: "2024-01-15T11:30:00.000Z"
 *               UpdatedAt: "2024-01-15T11:30:00.000Z"
 *           pagination:
 *             currentPage: 1
 *             totalPages: 5
 *             totalItems: 50
 *             itemsPerPage: 10
 */
router.get('/', protect, getProcesses);

/**
 * @swagger
 * /api/processes/{id}:
 *   get:
 *     summary: Get single process by ID
 *     tags: [Processes]
 *     description: Retrieve detailed information about a specific process
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Process ID
 *     responses:
 *       200:
 *         description: Process retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *       404:
 *         $ref: '#/components/responses/ProcessNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       GetProcess:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             ProcessName: "CNC Machining"
 *             RateType: "Per Hour"
 *             Rate: 45.50
 *             VendorOrInhouse: "Vendor"
 *             Description: "Computer Numerical Control machining process for precision parts"
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-15T10:30:00.000Z"
 */
router.get('/:id', protect, getProcess);

/**
 * @swagger
 * /api/processes:
 *   post:
 *     summary: Create a new process
 *     tags: [Processes]
 *     description: Create a new manufacturing process. Process name must be unique.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessCreate'
 *     responses:
 *       201:
 *         description: Process created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *                 message:
 *                   type: string
 *                   example: "Process created successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/DuplicateProcess'
 *               - $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       CreateProcessRequest:
 *         value:
 *           ProcessName: "CNC Machining"
 *           RateType: "Per Hour"
 *           Rate: 45.50
 *           VendorOrInhouse: "Vendor"
 *           Description: "Computer Numerical Control machining process for precision parts"
 *           IsActive: true
 *       CreateProcessResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             ProcessName: "CNC Machining"
 *             RateType: "Per Hour"
 *             Rate: 45.50
 *             VendorOrInhouse: "Vendor"
 *             Description: "Computer Numerical Control machining process for precision parts"
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-15T10:30:00.000Z"
 *           message: "Process created successfully"
 */
router.post('/', protect, createProcess);

/**
 * @swagger
 * /api/processes/{id}:
 *   put:
 *     summary: Update an existing process
 *     tags: [Processes]
 *     description: Update process information. Process name must remain unique.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Process ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessUpdate'
 *     responses:
 *       200:
 *         description: Process updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Process'
 *                 message:
 *                   type: string
 *                   example: "Process updated successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/DuplicateProcess'
 *               - $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/ProcessNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       UpdateProcessRequest:
 *         value:
 *           Rate: 50.00
 *           RateType: "Per Nos"
 *           Description: "Updated description for CNC machining process"
 *       UpdateProcessResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             ProcessName: "CNC Machining"
 *             RateType: "Per Nos"
 *             Rate: 50.00
 *             VendorOrInhouse: "Vendor"
 *             Description: "Updated description for CNC machining process"
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-16T14:20:00.000Z"
 *           message: "Process updated successfully"
 */
router.put('/:id', protect, updateProcess);

/**
 * @swagger
 * /api/processes/{id}:
 *   delete:
 *     summary: Delete a process (HARD DELETE)
 *     tags: [Processes]
 *     description: Permanently delete a process. This action cannot be undone.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Process ID
 *     responses:
 *       200:
 *         description: Process deleted successfully
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
 *                   example: "Process deleted successfully"
 *       404:
 *         $ref: '#/components/responses/ProcessNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteProcess);

module.exports = router;