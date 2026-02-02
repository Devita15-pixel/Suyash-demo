const express = require('express');
const router = express.Router();
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/company:
 *   get:
 *     summary: Get all active companies
 *     tags: [Company]
 *     description: Retrieve a list of all active companies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies retrieved successfully
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
 *                     $ref: '#/components/schemas/Company'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       CompaniesList:
 *         value:
 *           success: true
 *           data:
 *             - CompanyName: "ABC Manufacturing Ltd."
 *               Address: "123 Industrial Area, Mumbai"
 *               GSTIN: "27AABCU9603R1ZX"
 *               PAN: "AABCU9603R"
 *               State: "Maharashtra"
 *               StateCode: 27
 *               Phone: "+91-9876543210"
 *               Email: "accounts@abcmfg.com"
 *               IsActive: true
 *           count: 1
 */
router.get('/', protect, getCompanies);

/**
 * @swagger
 * /api/company/{id}:
 *   get:
 *     summary: Get company by ID
 *     tags: [Company]
 *     description: Retrieve detailed information about a specific company
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *         example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *     responses:
 *       200:
 *         description: Company details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *       404:
 *         description: Company not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getCompany);

/**
 * @swagger
 * /api/company:
 *   post:
 *     summary: Create a new company
 *     tags: [Company]
 *     description: Create a new company with GSTIN, PAN, and bank details
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CompanyName
 *               - Address
 *               - GSTIN
 *               - PAN
 *               - State
 *               - StateCode
 *               - Phone
 *               - Email
 *               - BankName
 *               - AccountNo
 *               - IFSC
 *             properties:
 *               CompanyName:
 *                 type: string
 *                 example: "XYZ Enterprises"
 *               Address:
 *                 type: string
 *                 example: "456 Business Park, Delhi"
 *               GSTIN:
 *                 type: string
 *                 example: "07BZEPM5805R1Z6"
 *               PAN:
 *                 type: string
 *                 example: "BZEPM5805P"
 *               State:
 *                 type: string
 *                 example: "Delhi"
 *               StateCode:
 *                 type: integer
 *                 example: 7
 *               Phone:
 *                 type: string
 *                 example: "+91-9876543211"
 *               Email:
 *                 type: string
 *                 example: "info@xyzenterprises.com"
 *               Logo:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *               BankName:
 *                 type: string
 *                 example: "HDFC Bank"
 *               AccountNo:
 *                 type: string
 *                 example: "50100234567890"
 *               IFSC:
 *                 type: string
 *                 example: "HDFC0001234"
 *               IsActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *                 message:
 *                   type: string
 *                   example: "Company created successfully"
 *       400:
 *         description: Validation error or duplicate GSTIN/PAN
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', protect, createCompany);

/**
 * @swagger
 * /api/company/{id}:
 *   put:
 *     summary: Update company
 *     tags: [Company]
 *     description: Update company information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *         example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               CompanyName:
 *                 type: string
 *               Address:
 *                 type: string
 *               GSTIN:
 *                 type: string
 *               PAN:
 *                 type: string
 *               State:
 *                 type: string
 *               StateCode:
 *                 type: integer
 *               Phone:
 *                 type: string
 *               Email:
 *                 type: string
 *               Logo:
 *                 type: string
 *               BankName:
 *                 type: string
 *               AccountNo:
 *                 type: string
 *               IFSC:
 *                 type: string
 *               IsActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Company'
 *                 message:
 *                   type: string
 *                   example: "Company updated successfully"
 *       400:
 *         description: Validation error or duplicate GSTIN/PAN
 *       404:
 *         description: Company not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateCompany);

/**
 * @swagger
 * /api/company/{id}:
 *   delete:
 *     summary: Delete company
 *     tags: [Company]
 *     description: Permanently delete a company (cannot delete if used in quotations)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Company ID
 *         example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *     responses:
 *       200:
 *         description: Company deleted successfully
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
 *                   example: "Company deleted successfully"
 *       400:
 *         description: Company cannot be deleted (used in quotations)
 *       404:
 *         description: Company not found
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteCompany);

module.exports = router;