const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getActiveMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  reactivateMaterial
} = require('../controllers/materialController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/materials:
 *   get:
 *     summary: Get all materials with pagination and search
 *     tags: [Materials]
 *     description: Retrieve materials with filtering, searching, and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
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
 *         description: Search in MaterialCode, MaterialName, Description, Standard, Grade
 *         example: "copper"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Materials retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', protect, getMaterials);

/**
 * @swagger
 * /api/materials/active:
 *   get:
 *     summary: Get active materials for dropdown
 *     tags: [Materials]
 *     description: Retrieve only active materials for selection dropdowns
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active materials retrieved
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       MaterialCode:
 *                         type: string
 *                       MaterialName:
 *                         type: string
 *                       Description:
 *                         type: string
 *                       Density:
 *                         type: number
 *                       Unit:
 *                         type: string
 *                       Standard:
 *                         type: string
 *                       Grade:
 *                         type: string
 *                       Color:
 *                         type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/active', protect, getActiveMaterials);

/**
 * @swagger
 * /api/materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     tags: [Materials]
 *     description: Retrieve detailed information about a specific material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *         example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *     responses:
 *       200:
 *         description: Material details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *       404:
 *         description: Material not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getMaterial);

/**
 * @swagger
 * /api/materials:
 *   post:
 *     summary: Create a new material
 *     tags: [Materials]
 *     description: Create a new material entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - MaterialCode
 *               - MaterialName
 *               - Density
 *               - Unit
 *             properties:
 *               MaterialCode:
 *                 type: string
 *                 example: "CU-101"
 *                 description: Unique material code
 *               MaterialName:
 *                 type: string
 *                 example: "Copper"
 *                 description: Material name
 *               Description:
 *                 type: string
 *                 example: "Pure copper material for electrical applications"
 *               Density:
 *                 type: number
 *                 example: 8.96
 *                 minimum: 0.1
 *                 description: "Density in g/cm³"
 *               Unit:
 *                 type: string
 *                 enum: [g/cm³, kg/m³]
 *                 default: "g/cm³"
 *               Standard:
 *                 type: string
 *                 example: "IS 191"
 *               Grade:
 *                 type: string
 *                 example: "C10100"
 *               Color:
 *                 type: string
 *                 example: "Red"
 *               IsActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Material created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *                 message:
 *                   type: string
 *                   example: "Material created successfully"
 *       400:
 *         description: Validation error or duplicate material code/name
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', protect, createMaterial);

/**
 * @swagger
 * /api/materials/{id}:
 *   put:
 *     summary: Update material
 *     tags: [Materials]
 *     description: Update material information. Cannot update MaterialCode if used in items.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *         example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               MaterialCode:
 *                 type: string
 *               MaterialName:
 *                 type: string
 *               Description:
 *                 type: string
 *               Density:
 *                 type: number
 *               Unit:
 *                 type: string
 *               Standard:
 *                 type: string
 *               Grade:
 *                 type: string
 *               Color:
 *                 type: string
 *               IsActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *                 message:
 *                   type: string
 *                   example: "Material updated successfully"
 *       400:
 *         description: Cannot update material code if used in items
 *       404:
 *         description: Material not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateMaterial);

/**
 * @swagger
 * /api/materials/{id}:
 *   delete:
 *     summary: Delete material (soft delete - deactivate)
 *     tags: [Materials]
 *     description: Deactivate material. Cannot delete if used in items or raw materials.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *         example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *     responses:
 *       200:
 *         description: Material deactivated successfully
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
 *                   example: "Material deactivated successfully"
 *       400:
 *         description: Cannot delete material used in items or raw materials
 *       404:
 *         description: Material not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteMaterial);

/**
 * @swagger
 * /api/materials/{id}/reactivate:
 *   put:
 *     summary: Reactivate material
 *     tags: [Materials]
 *     description: Reactivate a previously deactivated material
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *         example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *     responses:
 *       200:
 *         description: Material reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Material'
 *                 message:
 *                   type: string
 *                   example: "Material reactivated successfully"
 *       404:
 *         description: Material not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/:id/reactivate', protect, reactivateMaterial);

module.exports = router;