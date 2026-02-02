const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  reactivateItem,
  getItemsByMaterial
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         PartNo:
 *           type: string
 *           example: "PART-001"
 *         PartName:
 *           type: string
 *           example: "Bearing Housing"
 *         Description:
 *           type: string
 *           example: "Cast iron bearing housing for industrial pumps"
 *         DrawingNo:
 *           type: string
 *           example: "DRG-2024-001"
 *         RevisionNo:
 *           type: string
 *           example: "A"
 *         Unit:
 *           type: string
 *           enum: [Nos, Kg, Meter, Set, Piece]
 *           example: "Nos"
 *         HSNCode:
 *           type: string
 *           example: "8483.30.90"
 *         MaterialID:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f8e9b7a1b2c3d4e5f6a7b9"
 *             MaterialCode:
 *               type: string
 *               example: "CI-001"
 *             MaterialName:
 *               type: string
 *               example: "Cast Iron"
 *             Description:
 *               type: string
 *               example: "Grade 25 Cast Iron"
 *             Density:
 *               type: number
 *               format: float
 *               example: 7.2
 *             Unit:
 *               type: string
 *               example: "Kg"
 *         MaterialName:
 *           type: string
 *           example: "Cast Iron"
 *         MaterialCode:
 *           type: string
 *           example: "CI-001"
 *         IsActive:
 *           type: boolean
 *           example: true
 *         CreatedBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f8e9b7a1b2c3d4e5f6a7c0"
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
 *               example: "64f8e9b7a1b2c3d4e5f6a7c1"
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
 *     ItemCreate:
 *       type: object
 *       required:
 *         - PartNo
 *         - PartName
 *         - Unit
 *         - HSNCode
 *         - MaterialID
 *       properties:
 *         PartNo:
 *           type: string
 *           example: "PART-001"
 *           description: "Part number must be unique"
 *         PartName:
 *           type: string
 *           example: "Bearing Housing"
 *         Description:
 *           type: string
 *           example: "Cast iron bearing housing for industrial pumps"
 *         DrawingNo:
 *           type: string
 *           example: "DRG-2024-001"
 *         RevisionNo:
 *           type: string
 *           example: "A"
 *           default: "A"
 *         Unit:
 *           type: string
 *           enum: [Nos, Kg, Meter, Set, Piece]
 *           example: "Nos"
 *           default: "Nos"
 *         HSNCode:
 *           type: string
 *           example: "8483.30.90"
 *         MaterialID:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b9"
 *           description: "Reference to an active Material"
 * 
 *     ItemUpdate:
 *       type: object
 *       properties:
 *         PartNo:
 *           type: string
 *           example: "PART-001A"
 *         PartName:
 *           type: string
 *           example: "Bearing Housing - Revised"
 *         Description:
 *           type: string
 *           example: "Updated cast iron bearing housing specification"
 *         DrawingNo:
 *           type: string
 *           example: "DRG-2024-001-REV-A"
 *         RevisionNo:
 *           type: string
 *           example: "B"
 *         Unit:
 *           type: string
 *           enum: [Nos, Kg, Meter, Set, Piece]
 *           example: "Nos"
 *         HSNCode:
 *           type: string
 *           example: "8483.30.91"
 *         MaterialID:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7c2"
 * 
 *   parameters:
 *     materialIdParam:
 *       in: path
 *       name: materialId
 *       required: true
 *       schema:
 *         type: string
 *       description: Material ID
 * 
 *   responses:
 *     ItemNotFound:
 *       description: Item not found
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
 *                 example: "Item not found"
 * 
 *     MaterialNotFound:
 *       description: Material not found
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
 *                 example: "Material not found or inactive"
 * 
 *     DuplicateItem:
 *       description: Item with this part number already exists
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
 *                 example: "Item with this part number already exists"
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
 *                 example: "Part number is required, Material is required"
 * 
 *     ItemInUse:
 *       description: Cannot delete item because it's used in other records
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
 *                 example: "Cannot delete item. 5 costing(s) are associated with this item."
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
 *   name: Items
 *   description: Item/Part management
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items with pagination, search and filtering
 *     tags: [Items]
 *     description: Retrieve all items with optional search, filtering by material, and pagination
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in part number, part name, description, or drawing number
 *       - in: query
 *         name: materialId
 *         schema:
 *           type: string
 *         description: Filter by material ID
 *     responses:
 *       200:
 *         description: List of items retrieved successfully
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
 *                     $ref: '#/components/schemas/Item'
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
 *       GetItems:
 *         value:
 *           success: true
 *           data:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *               PartNo: "PART-001"
 *               PartName: "Bearing Housing"
 *               Description: "Cast iron bearing housing for industrial pumps"
 *               DrawingNo: "DRG-2024-001"
 *               RevisionNo: "A"
 *               Unit: "Nos"
 *               HSNCode: "8483.30.90"
 *               MaterialID:
 *                 _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *                 MaterialCode: "CI-001"
 *                 MaterialName: "Cast Iron"
 *                 Description: "Grade 25 Cast Iron"
 *                 Density: 7.2
 *                 Unit: "Kg"
 *               IsActive: true
 *               CreatedAt: "2024-01-15T10:30:00.000Z"
 *               UpdatedAt: "2024-01-15T10:30:00.000Z"
 *           pagination:
 *             currentPage: 1
 *             totalPages: 5
 *             totalItems: 50
 *             itemsPerPage: 10
 */
router.get('/', protect, getItems);

/**
 * @swagger
 * /api/items/material/{materialId}:
 *   get:
 *     summary: Get items by material
 *     tags: [Items]
 *     description: Retrieve all active items associated with a specific material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/materialIdParam'
 *     responses:
 *       200:
 *         description: Items retrieved successfully
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
 *                     $ref: '#/components/schemas/Item'
 *                 count:
 *                   type: integer
 *                   example: 10
 *       404:
 *         $ref: '#/components/responses/MaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       GetItemsByMaterial:
 *         value:
 *           success: true
 *           data:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *               PartNo: "PART-001"
 *               PartName: "Bearing Housing"
 *               MaterialID:
 *                 _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *                 MaterialCode: "CI-001"
 *                 MaterialName: "Cast Iron"
 *               IsActive: true
 *           count: 10
 */
router.get('/material/:materialId', protect, getItemsByMaterial);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get single item by ID
 *     tags: [Items]
 *     description: Retrieve detailed information about a specific item including material details and audit trail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       404:
 *         $ref: '#/components/responses/ItemNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       GetItem:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             PartNo: "PART-001"
 *             PartName: "Bearing Housing"
 *             Description: "Cast iron bearing housing for industrial pumps"
 *             DrawingNo: "DRG-2024-001"
 *             RevisionNo: "A"
 *             Unit: "Nos"
 *             HSNCode: "8483.30.90"
 *             MaterialID:
 *               _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *               MaterialCode: "CI-001"
 *               MaterialName: "Cast Iron"
 *               Description: "Grade 25 Cast Iron"
 *               Density: 7.2
 *               Unit: "Kg"
 *               Standard: "ASTM A48"
 *               Grade: "Class 25"
 *               Color: "Gray"
 *             IsActive: true
 *             CreatedBy:
 *               _id: "64f8e9b7a1b2c3d4e5f6a7c0"
 *               Username: "john.doe"
 *               Email: "john.doe@example.com"
 *             UpdatedBy:
 *               _id: "64f8e9b7a1b2c3d4e5f6a7c1"
 *               Username: "jane.doe"
 *               Email: "jane.doe@example.com"
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-16T14:20:00.000Z"
 */
router.get('/:id', protect, getItem);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     description: Create a new item/part. Part number must be unique.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemCreate'
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *                 message:
 *                   type: string
 *                   example: "Item created successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/DuplicateItem'
 *               - $ref: '#/components/responses/ValidationError'
 *               - $ref: '#/components/responses/MaterialNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       CreateItemRequest:
 *         value:
 *           PartNo: "PART-001"
 *           PartName: "Bearing Housing"
 *           Description: "Cast iron bearing housing for industrial pumps"
 *           DrawingNo: "DRG-2024-001"
 *           RevisionNo: "A"
 *           Unit: "Nos"
 *           HSNCode: "8483.30.90"
 *           MaterialID: "64f8e9b7a1b2c3d4e5f6a7b9"
 *       CreateItemResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             PartNo: "PART-001"
 *             PartName: "Bearing Housing"
 *             Description: "Cast iron bearing housing for industrial pumps"
 *             DrawingNo: "DRG-2024-001"
 *             RevisionNo: "A"
 *             Unit: "Nos"
 *             HSNCode: "8483.30.90"
 *             MaterialID:
 *               _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *               MaterialCode: "CI-001"
 *               MaterialName: "Cast Iron"
 *               Description: "Grade 25 Cast Iron"
 *               Density: 7.2
 *               Unit: "Kg"
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-15T10:30:00.000Z"
 *           message: "Item created successfully"
 */
router.post('/', protect, createItem);

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an existing item
 *     tags: [Items]
 *     description: Update item information. Part number must remain unique.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemUpdate'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *                 message:
 *                   type: string
 *                   example: "Item updated successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/DuplicateItem'
 *               - $ref: '#/components/responses/ValidationError'
 *               - $ref: '#/components/responses/MaterialNotFound'
 *       404:
 *         $ref: '#/components/responses/ItemNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       UpdateItemRequest:
 *         value:
 *           PartName: "Bearing Housing - Revised"
 *           Description: "Updated cast iron bearing housing specification"
 *           RevisionNo: "B"
 *       UpdateItemResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             PartNo: "PART-001"
 *             PartName: "Bearing Housing - Revised"
 *             Description: "Updated cast iron bearing housing specification"
 *             DrawingNo: "DRG-2024-001"
 *             RevisionNo: "B"
 *             Unit: "Nos"
 *             HSNCode: "8483.30.90"
 *             MaterialID:
 *               _id: "64f8e9b7a1b2c3d4e5f6a7b9"
 *               MaterialCode: "CI-001"
 *               MaterialName: "Cast Iron"
 *               Description: "Grade 25 Cast Iron"
 *               Density: 7.2
 *               Unit: "Kg"
 *             IsActive: true
 *             CreatedAt: "2024-01-15T10:30:00.000Z"
 *             UpdatedAt: "2024-01-16T14:20:00.000Z"
 *           message: "Item updated successfully"
 */
router.put('/:id', protect, updateItem);

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Deactivate an item (SOFT DELETE)
 *     tags: [Items]
 *     description: Soft delete an item by setting IsActive to false. Cannot delete if item is used in costings or dimension/weight records.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deactivated successfully
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
 *                   example: "Item deactivated successfully"
 *       400:
 *         $ref: '#/components/responses/ItemInUse'
 *       404:
 *         $ref: '#/components/responses/ItemNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteItem);

/**
 * @swagger
 * /api/items/{id}/reactivate:
 *   put:
 *     summary: Reactivate a deactivated item
 *     tags: [Items]
 *     description: Reactivate an item by setting IsActive to true
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *                 message:
 *                   type: string
 *                   example: "Item reactivated successfully"
 *       404:
 *         $ref: '#/components/responses/ItemNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       ReactivateItemResponse:
 *         value:
 *           success: true
 *           data:
 *             _id: "64f8e9b7a1b2c3d4e5f6a7b8"
 *             PartNo: "PART-001"
 *             PartName: "Bearing Housing"
 *             IsActive: true
 *             UpdatedAt: "2024-01-16T15:30:00.000Z"
 *           message: "Item reactivated successfully"
 */
router.put('/:id/reactivate', protect, reactivateItem);

module.exports = router;