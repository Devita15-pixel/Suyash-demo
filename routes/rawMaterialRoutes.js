const express = require('express');
const router = express.Router();
const {
  getRawMaterials,
  getCurrentRates,
  getRawMaterial,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial
} = require('../controllers/rawMaterialController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     RawMaterial:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         MaterialName:
 *           type: string
 *           enum: [Copper, Steel, Aluminium, Brass]
 *           example: "Copper"
 *         Grade:
 *           type: string
 *           example: "C10100"
 *         RatePerKG:
 *           type: number
 *           format: float
 *           example: 850.50
 *           minimum: 0
 *         ScrapPercentage:
 *           type: number
 *           format: float
 *           example: 5.0
 *           minimum: 0
 *           maximum: 100
 *         TransportLossPercentage:
 *           type: number
 *           format: float
 *           example: 2.0
 *           minimum: 0
 *           maximum: 100
 *         EffectiveRate:
 *           type: number
 *           format: float
 *           example: 909.035
 *           minimum: 0
 *         DateEffective:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
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
 *     RawMaterialCreate:
 *       type: object
 *       required:
 *         - MaterialName
 *         - Grade
 *         - RatePerKG
 *         - DateEffective
 *       properties:
 *         MaterialName:
 *           type: string
 *           enum: [Copper, Steel, Aluminium, Brass]
 *           example: "Copper"
 *         Grade:
 *           type: string
 *           example: "C10100"
 *         RatePerKG:
 *           type: number
 *           format: float
 *           example: 850.50
 *           minimum: 0
 *         ScrapPercentage:
 *           type: number
 *           format: float
 *           example: 5.0
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *         TransportLossPercentage:
 *           type: number
 *           format: float
 *           example: 2.0
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *         DateEffective:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         IsActive:
 *           type: boolean
 *           example: true
 *           default: true
 * 
 *     RawMaterialUpdate:
 *       type: object
 *       properties:
 *         MaterialName:
 *           type: string
 *           enum: [Copper, Steel, Aluminium, Brass]
 *           example: "Copper"
 *         Grade:
 *           type: string
 *           example: "C10200"
 *         RatePerKG:
 *           type: number
 *           format: float
 *           example: 860.00
 *           minimum: 0
 *         ScrapPercentage:
 *           type: number
 *           format: float
 *           example: 5.5
 *           minimum: 0
 *           maximum: 100
 *         TransportLossPercentage:
 *           type: number
 *           format: float
 *           example: 2.5
 *           minimum: 0
 *           maximum: 100
 *         DateEffective:
 *           type: string
 *           format: date
 *           example: "2024-01-20"
 *         IsActive:
 *           type: boolean
 *           example: false
 * 
 *     CurrentRate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         MaterialName:
 *           type: string
 *           example: "Copper"
 *         Grade:
 *           type: string
 *           example: "C10100"
 *         RatePerKG:
 *           type: number
 *           format: float
 *           example: 850.50
 *         EffectiveRate:
 *           type: number
 *           format: float
 *           example: 909.035
 *         DateEffective:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 * 
 *   responses:
 *     RawMaterialNotFound:
 *       description: Raw material not found
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
 *                 example: "Raw material not found"
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
 *                 example: "Material name is required, Rate per KG must be greater than or equal to 0"
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
 *   name: Raw Materials
 *   description: Raw material rate management and pricing
 */

/**
 * @swagger
 * /api/raw-materials:
 *   get:
 *     summary: Get all raw materials with pagination and filtering
 *     tags: [Raw Materials]
 *     description: Retrieve all active raw materials with optional filtering by material name
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
 *         name: materialName
 *         schema:
 *           type: string
 *           enum: [Copper, Steel, Aluminium, Brass]
 *         description: Filter by material name
 *     responses:
 *       200:
 *         description: List of raw materials retrieved successfully
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
 *                     $ref: '#/components/schemas/RawMaterial'
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
 *       GetRawMaterials:
 *         value:
 *           success: true
 *           data:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *               MaterialName: "Copper"
 *               Grade: "C10100"
 *               RatePerKG: 850.50
 *               ScrapPercentage: 5.0
 *               TransportLossPercentage: 2.0
 *               EffectiveRate: 909.035
 *               DateEffective: "2024-01-15"
 *               IsActive: true
 *               CreatedAt: "2024-01-15T10:30:00.000Z"
 *               UpdatedAt: "2024-01-15T10:30:00.000Z"
 *           pagination:
 *             currentPage: 1
 *             totalPages: 5
 *             totalItems: 50
 *             itemsPerPage: 10
 */
router.get('/', protect, getRawMaterials);

/**
 * @swagger
 * /api/raw-materials/current-rates:
 *   get:
 *     summary: Get current rates for all raw materials
 *     tags: [Raw Materials]
 *     description: Retrieve the latest effective rates for each material type (most recent DateEffective)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current rates retrieved successfully
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
 *                     $ref: '#/components/schemas/CurrentRate'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       GetCurrentRates:
 *         value:
 *           success: true
 *           data:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *               MaterialName: "Copper"
 *               Grade: "C10100"
 *               RatePerKG: 850.50
 *               EffectiveRate: 909.035
 *               DateEffective: "2024-01-15"
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *               MaterialName: "Steel"
 *               Grade: "304"
 *               RatePerKG: 120.75
 *               EffectiveRate: 126.7875
 *               DateEffective: "2024-01-10"
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7c0"
 *               MaterialName: "Aluminium"
 *               Grade: "6061"
 *               RatePerKG: 280.25
 *               EffectiveRate: 294.2625
 *               DateEffective: "2024-01-12"
 */
router.get('/current-rates', protect, getCurrentRates);

/**
 * @swagger
 * /api/raw-materials/{id}:
 *   get:
 *     summary: Get single raw material by ID
 *     tags: [Raw Materials]
 *     description: Retrieve detailed information about a specific raw material rate entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw Material ID
 *     responses:
 *       200:
 *         description: Raw material retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *       404:
 *         $ref: '#/components/responses/RawMaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       GetRawMaterial:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             MaterialName: "Copper"
 *             Grade: "C10100"
 *             RatePerKG: 850.50
 *             ScrapPercentage: 5.0
 *             TransportLossPercentage: 2.0
 *             EffectiveRate: 909.035
 *             DateEffective: "2024-01-15"
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-15T10:30:00.000Z"
 */
router.get('/:id', protect, getRawMaterial);

/**
 * @swagger
 * /api/raw-materials:
 *   post:
 *     summary: Create a new raw material rate entry
 *     tags: [Raw Materials]
 *     description: Create a new raw material rate. EffectiveRate is automatically calculated based on RatePerKG, ScrapPercentage, and TransportLossPercentage.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RawMaterialCreate'
 *     responses:
 *       201:
 *         description: Raw material created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *                 message:
 *                   type: string
 *                   example: "Raw material created successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       CreateRawMaterialRequest:
 *         value:
 *           MaterialName: "Copper"
 *           Grade: "C10100"
 *           RatePerKG: 850.50
 *           ScrapPercentage: 5.0
 *           TransportLossPercentage: 2.0
 *           DateEffective: "2024-01-15"
 *           IsActive: true
 *       CreateRawMaterialResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             MaterialName: "Copper"
 *             Grade: "C10100"
 *             RatePerKG: 850.50
 *             ScrapPercentage: 5.0
 *             TransportLossPercentage: 2.0
 *             EffectiveRate: 909.035
 *             DateEffective: "2024-01-15"
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-15T10:30:00.000Z"
 *           message: "Raw material created successfully"
 */
router.post('/', protect, createRawMaterial);

/**
 * @swagger
 * /api/raw-materials/{id}:
 *   put:
 *     summary: Update an existing raw material rate entry
 *     tags: [Raw Materials]
 *     description: Update raw material information. EffectiveRate is automatically recalculated.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RawMaterialUpdate'
 *     responses:
 *       200:
 *         description: Raw material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RawMaterial'
 *                 message:
 *                   type: string
 *                   example: "Raw material updated successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/RawMaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       UpdateRawMaterialRequest:
 *         value:
 *           RatePerKG: 860.00
 *           ScrapPercentage: 5.5
 *           DateEffective: "2024-01-20"
 *       UpdateRawMaterialResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             MaterialName: "Copper"
 *             Grade: "C10100"
 *             RatePerKG: 860.00
 *             ScrapPercentage: 5.5
 *             TransportLossPercentage: 2.0
 *             EffectiveRate: 924.50
 *             DateEffective: "2024-01-20"
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-16T14:20:00.000Z"
 *           message: "Raw material updated successfully"
 */
router.put('/:id', protect, updateRawMaterial);

/**
 * @swagger
 * /api/raw-materials/{id}:
 *   delete:
 *     summary: Delete a raw material rate entry (HARD DELETE)
 *     tags: [Raw Materials]
 *     description: Permanently delete a raw material rate entry. This action cannot be undone.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Raw Material ID
 *     responses:
 *       200:
 *         description: Raw material deleted successfully
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
 *                   example: "Raw material deleted successfully"
 *       404:
 *         $ref: '#/components/responses/RawMaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteRawMaterial);

module.exports = router;