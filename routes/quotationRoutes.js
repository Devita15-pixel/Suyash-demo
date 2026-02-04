const express = require('express');
const router = express.Router();
const {
  getQuotations,
  getQuotation,
  createQuotation,
  getVendorsForDropdown,
  calculateQuotation,
  updateQuotation,
  deleteQuotation
} = require('../controllers/quotationController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Quotation:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7b8"
 *         QuotationNo:
 *           type: string
 *           example: "QT-202401-1234"
 *           description: "Auto-generated quotation number"
 *         QuotationDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         ValidTill:
 *           type: string
 *           format: date-time
 *           example: "2024-02-15T10:30:00.000Z"
 *         CompanyID:
 *           oneOf:
 *             - type: string
 *               example: "64f8e9b7a1b2c3d4e5f6a7c0"
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64f8e9b7a1b2c3d4e5f6a7c0"
 *                 CompanyName:
 *                   type: string
 *                   example: "ABC Manufacturing Co."
 *                 GSTIN:
 *                   type: string
 *                   example: "27ABCDE1234F1Z5"
 *                 State:
 *                   type: string
 *                   example: "Maharashtra"
 *                 StateCode:
 *                   type: number
 *                   example: 27
 *         VendorID:
 *           oneOf:
 *             - type: string
 *               example: "64f8e9b7a1b2c3d4e5f6a7c1"
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64f8e9b7a1b2c3d4e5f6a7c1"
 *                 VendorName:
 *                   type: string
 *                   example: "XYZ Suppliers"
 *                 VendorCode:
 *                   type: string
 *                   example: "V-001"
 *                 GSTIN:
 *                   type: string
 *                   example: "27XYZAB1234C1D2"
 *                 State:
 *                   type: string
 *                   example: "Gujarat"
 *                 StateCode:
 *                   type: number
 *                   example: 24
 *         VendorName:
 *           type: string
 *           example: "XYZ Suppliers"
 *         VendorGSTIN:
 *           type: string
 *           example: "27XYZAB1234C1D2"
 *         VendorState:
 *           type: string
 *           example: "Gujarat"
 *         VendorStateCode:
 *           type: number
 *           example: 24
 *         VendorType:
 *           type: string
 *           enum: [Existing, New]
 *           example: "Existing"
 *         GSTType:
 *           type: string
 *           enum: [CGST/SGST, IGST]
 *           example: "IGST"
 *         Items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuotationItem'
 *         SubTotal:
 *           type: number
 *           format: float
 *           example: 15471.25
 *           minimum: 0
 *         GSTPercentage:
 *           type: number
 *           format: float
 *           example: 18.0
 *           minimum: 0
 *           maximum: 100
 *         GSTAmount:
 *           type: number
 *           format: float
 *           example: 2784.83
 *           minimum: 0
 *         GrandTotal:
 *           type: number
 *           format: float
 *           example: 18256.08
 *           minimum: 0
 *         AmountInWords:
 *           type: string
 *           example: "Eighteen Thousand Two Hundred Fifty Six Rupees and Eight Paise Only"
 *         TermsConditions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 example: "Payment Terms"
 *               Description:
 *                 type: string
 *                 example: "50% advance, 50% against delivery"
 *               Sequence:
 *                 type: number
 *                 example: 1
 *         InternalRemarks:
 *           type: string
 *           example: "Urgent delivery required"
 *         CustomerRemarks:
 *           type: string
 *           example: "Please ensure packaging is waterproof"
 *         Status:
 *           type: string
 *           enum: [Draft, Sent, Approved, Rejected, Cancelled]
 *           example: "Draft"
 *         IsActive:
 *           type: boolean
 *           example: true
 *         CreatedBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f8e9b7a1b2c3d4e5f6a7c2"
 *             Username:
 *               type: string
 *               example: "john.doe"
 *             Email:
 *               type: string
 *               example: "john.doe@example.com"
 *         CreatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         UpdatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 * 
 *     QuotationItem:
 *       type: object
 *       properties:
 *         PartNo:
 *           type: string
 *           example: "PN-001"
 *         PartName:
 *           type: string
 *           example: "Copper Bushing"
 *         Description:
 *           type: string
 *           example: "Copper bushing for motor application"
 *         HSNCode:
 *           type: string
 *           example: "741421"
 *         Unit:
 *           type: string
 *           enum: [Nos, Kg, Meter, Set, Piece]
 *           example: "Nos"
 *         Quantity:
 *           type: number
 *           example: 100
 *           minimum: 1
 *         FinalRate:
 *           type: number
 *           format: float
 *           example: 154.71
 *           minimum: 0
 *         Amount:
 *           type: number
 *           format: float
 *           example: 15471.00
 *           minimum: 0
 * 
 *     QuotationCreate:
 *       type: object
 *       required:
 *         - VendorType
 *         - Items
 *       properties:
 *         VendorType:
 *           type: string
 *           enum: [Existing, New]
 *           example: "Existing"
 *           description: "Whether vendor exists in Vendor Master or needs to be created"
 *         VendorID:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7c1"
 *           description: "Required if VendorType is 'Existing'"
 *         NewVendor:
 *           type: object
 *           description: "Required if VendorType is 'New'"
 *           properties:
 *             VendorName:
 *               type: string
 *               example: "New Supplier Pvt Ltd"
 *               required: true
 *             GSTIN:
 *               type: string
 *               example: "27NEWSP1234F1Z5"
 *             State:
 *               type: string
 *               example: "Maharashtra"
 *               required: true
 *             StateCode:
 *               type: number
 *               example: 27
 *               required: true
 *               minimum: 1
 *               maximum: 37
 *             Address:
 *               type: string
 *               example: "123 Main Street, Mumbai"
 *               required: true
 *             City:
 *               type: string
 *               example: "Mumbai"
 *               required: true
 *             Pincode:
 *               type: string
 *               example: "400001"
 *               required: true
 *             ContactPerson:
 *               type: string
 *               example: "Raj Sharma"
 *               required: true
 *             Phone:
 *               type: string
 *               example: "9876543210"
 *               required: true
 *             Email:
 *               type: string
 *               example: "raj@newsupplier.com"
 *               required: true
 *             PAN:
 *               type: string
 *               example: "NEWSP1234F"
 *         Items:
 *           type: array
 *           minItems: 1
 *           items:
 *             type: object
 *             required:
 *               - PartNo
 *               - Quantity
 *             properties:
 *               PartNo:
 *                 type: string
 *                 example: "PN-001"
 *                 description: "Must exist in Item Master and have active Costing"
 *               Quantity:
 *                 type: number
 *                 example: 100
 *                 minimum: 1
 *         ValidTill:
 *           type: string
 *           format: date
 *           example: "2024-02-15"
 *           description: "Defaults to 30 days from quotation date"
 *         InternalRemarks:
 *           type: string
 *           example: "Urgent delivery required"
 *         CustomerRemarks:
 *           type: string
 *           example: "Please ensure packaging is waterproof"
 * 
 *     QuotationUpdate:
 *       type: object
 *       properties:
 *         Items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               PartNo:
 *                 type: string
 *                 example: "PN-001"
 *               Quantity:
 *                 type: number
 *                 example: 150
 *         ValidTill:
 *           type: string
 *           format: date
 *           example: "2024-02-20"
 *         InternalRemarks:
 *           type: string
 *           example: "Updated delivery instructions"
 *         CustomerRemarks:
 *           type: string
 *           example: "Revised packaging requirements"
 *         Status:
 *           type: string
 *           enum: [Draft, Sent, Approved, Rejected, Cancelled]
 *           example: "Sent"
 * 
 *     QuotationPreview:
 *       type: object
 *       required:
 *         - VendorType
 *         - Items
 *       properties:
 *         VendorType:
 *           type: string
 *           enum: [Existing, New]
 *           example: "Existing"
 *         VendorID:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7c1"
 *         NewVendor:
 *           type: object
 *           properties:
 *             VendorName:
 *               type: string
 *               example: "New Supplier Pvt Ltd"
 *             GSTIN:
 *               type: string
 *               example: "27NEWSP1234F1Z5"
 *             State:
 *               type: string
 *               example: "Maharashtra"
 *             StateCode:
 *               type: number
 *               example: 27
 *         Items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               PartNo:
 *                 type: string
 *                 example: "PN-001"
 *               Quantity:
 *                 type: number
 *                 example: 100
 * 
 *     VendorDropdown:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f8e9b7a1b2c3d4e5f6a7c1"
 *         VendorCode:
 *           type: string
 *           example: "V-001"
 *         VendorName:
 *           type: string
 *           example: "XYZ Suppliers"
 *         GSTIN:
 *           type: string
 *           example: "27XYZAB1234C1D2"
 *         State:
 *           type: string
 *           example: "Gujarat"
 *         StateCode:
 *           type: number
 *           example: 24
 *         ContactPerson:
 *           type: string
 *           example: "Ramesh Patel"
 *         Phone:
 *           type: string
 *           example: "9876543210"
 *         Email:
 *           type: string
 *           example: "ramesh@xyzsuppliers.com"
 * 
 *   responses:
 *     QuotationNotFound:
 *       description: Quotation not found
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
 *                 example: "Quotation not found"
 * 
 *     CompanyNotFound:
 *       description: Company not found
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
 *                 example: "No active company found. Please setup company first."
 * 
 *     VendorNotFound:
 *       description: Vendor not found
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
 *                 example: "Vendor not found or inactive"
 * 
 *     ItemNotFound:
 *       description: Item not found or inactive
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
 *                 example: "Item PN-001 not found or inactive"
 * 
 *     CostingNotFound:
 *       description: Costing not found for item
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
 *                 example: "Costing not found for item PN-001"
 * 
 *     TaxNotFound:
 *       description: Tax rate not found for HSN code
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
 *                 example: "Tax rate not found for HSN code: 741421"
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
 *                 example: "Vendor information is required, Items array cannot be empty"
 * 
 *     CannotModifyQuotation:
 *       description: Cannot modify quotation
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
 *                 example: "Only draft quotations can be modified"
 * 
 *     CannotDeleteQuotation:
 *       description: Cannot delete quotation
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
 *                 example: "Only draft quotations can be deleted"
 * 
 *   parameters:
 *     statusQueryParam:
 *       in: query
 *       name: status
 *       schema:
 *         type: string
 *         enum: [Draft, Sent, Approved, Rejected, Cancelled]
 *       description: Filter by quotation status
 * 
 *     vendorIdQueryParam:
 *       in: query
 *       name: vendorId
 *       schema:
 *         type: string
 *       description: Filter by vendor ID
 * 
 *     startDateQueryParam:
 *       in: query
 *       name: startDate
 *       schema:
 *         type: string
 *         format: date
 *       description: Filter quotations from this date (YYYY-MM-DD)
 * 
 *     endDateQueryParam:
 *       in: query
 *       name: endDate
 *       schema:
 *         type: string
 *         format: date
 *       description: Filter quotations up to this date (YYYY-MM-DD)
 * 
 *     searchVendorQueryParam:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search vendors by name, code, or GSTIN
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
 *   name: Quotations
 *   description: Quotation creation, management, and calculations
 */

/**
 * @swagger
 * /api/quotations:
 *   get:
 *     summary: Get all quotations with pagination and filtering
 *     tags: [Quotations]
 *     description: Retrieve all quotations with optional filtering by status, vendor, and date range
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
 *       - $ref: '#/components/parameters/statusQueryParam'
 *       - $ref: '#/components/parameters/vendorIdQueryParam'
 *       - $ref: '#/components/parameters/startDateQueryParam'
 *       - $ref: '#/components/parameters/endDateQueryParam'
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, QuotationDate, GrandTotal]
 *           default: createdAt
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
 *         description: List of quotations retrieved successfully with statistics
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
 *                     $ref: '#/components/schemas/Quotation'
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
 *                     totalQuotations:
 *                       type: integer
 *                       example: 50
 *                     totalAmount:
 *                       type: number
 *                       example: 912804.00
 *                     avgAmount:
 *                       type: number
 *                       example: 18256.08
 *                     draftCount:
 *                       type: integer
 *                       example: 15
 *                     sentCount:
 *                       type: integer
 *                       example: 25
 *                     approvedCount:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', protect, getQuotations);

/**
 * @swagger
 * /api/quotations/vendors:
 *   get:
 *     summary: Get active vendors for dropdown selection
 *     tags: [Quotations]
 *     description: Retrieve active vendors for dropdown with search capability. Used during quotation creation.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/searchVendorQueryParam'
 *     responses:
 *       200:
 *         description: Vendors retrieved successfully
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
 *                     $ref: '#/components/schemas/VendorDropdown'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       GetVendorsResponse:
 *         value:
 *           success: true
 *           data:
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7c1"
 *               VendorCode: "V-001"
 *               VendorName: "XYZ Suppliers"
 *               GSTIN: "27XYZAB1234C1D2"
 *               State: "Gujarat"
 *               StateCode: 24
 *               ContactPerson: "Ramesh Patel"
 *               Phone: "9876543210"
 *               Email: "ramesh@xyzsuppliers.com"
 *             - _id: "64f8e9b7a1b2c3d4e5f6a7c3"
 *               VendorCode: "V-002"
 *               VendorName: "ABC Metals"
 *               GSTIN: "24ABCDE5678G9H0"
 *               State: "Maharashtra"
 *               StateCode: 27
 *               ContactPerson: "Suresh Kumar"
 *               Phone: "9876543211"
 *               Email: "suresh@abcmetals.com"
 */
router.get('/vendors', protect, getVendorsForDropdown);

/**
 * @swagger
 * /api/quotations/{id}:
 *   get:
 *     summary: Get single quotation by ID with detailed calculations
 *     tags: [Quotations]
 *     description: Retrieve detailed information about a specific quotation including item details and calculations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quotation ID
 *     responses:
 *       200:
 *         description: Quotation retrieved successfully
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
 *                     QuotationNo:
 *                       type: string
 *                       example: "QT-202401-1234"
 *                     QuotationDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     Items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           PartNo:
 *                             type: string
 *                             example: "PN-001"
 *                           PartName:
 *                             type: string
 *                             example: "Copper Bushing"
 *                           Quantity:
 *                             type: number
 *                             example: 100
 *                           FinalRate:
 *                             type: number
 *                             example: 154.71
 *                           Amount:
 *                             type: number
 *                             example: 15471.00
 *                           ItemDetails:
 *                             type: object
 *                     Calculations:
 *                       type: object
 *                       properties:
 *                         subTotal:
 *                           type: number
 *                           example: 15471.00
 *                         gstAmount:
 *                           type: number
 *                           example: 2784.78
 *                         grandTotal:
 *                           type: number
 *                           example: 18255.78
 *                         gstPercentage:
 *                           type: number
 *                           example: 18.0
 *       404:
 *         $ref: '#/components/responses/QuotationNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getQuotation);

/**
 * @swagger
 * /api/quotations:
 *   post:
 *     summary: Create a new quotation with auto-calculations
 *     tags: [Quotations]
 *     description: |
 *       Create a new quotation with automatic calculations and vendor management.
 *       
 *       **Key Features:**
 *       1. **Vendor Management**: 
 *          - **Existing Vendor**: Select from Vendor Master
 *          - **New Vendor**: Add vendor details, automatically creates vendor record
 *       
 *       2. **Auto Calculations**:
 *          - **Line Item**: Amount = Quantity × Final Rate (from Costing Master)
 *          - **Sub Total**: Σ(All Item Amounts)
 *          - **GST Amount**: Sub Total × GST % (from Tax Master based on HSN Code)
 *          - **Grand Total**: Sub Total + GST Amount
 *          - **Amount in Words**: Auto-generated
 *       
 *       3. **Auto GST Logic**:
 *          - **Same State**: CGST + SGST (GST% split equally)
 *          - **Different State**: IGST (full GST%)
 *       
 *       4. **Auto-loaded Data**:
 *          - Company details from Company Master
 *          - Terms & Conditions from T&C Master
 *       
 *       **Important**: All items must have active costing in Costing Master.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuotationCreate'
 *     responses:
 *       201:
 *         description: Quotation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Quotation'
 *                 message:
 *                   type: string
 *                   example: "Quotation created successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/ValidationError'
 *               - $ref: '#/components/responses/VendorNotFound'
 *               - $ref: '#/components/responses/ItemNotFound'
 *               - $ref: '#/components/responses/CostingNotFound'
 *               - $ref: '#/components/responses/TaxNotFound'
 *       404:
 *         $ref: '#/components/responses/CompanyNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 *     examples:
 *       CreateQuotationExistingVendor:
 *         summary: Create quotation with existing vendor
 *         value:
 *           VendorType: "Existing"
 *           VendorID: "64f8e9b7a1b2c3d4e5f6a7c1"
 *           Items:
 *             - PartNo: "PN-001"
 *               Quantity: 100
 *             - PartNo: "PN-002"
 *               Quantity: 50
 *           ValidTill: "2024-02-15"
 *           InternalRemarks: "Urgent delivery"
 *           CustomerRemarks: "Standard packaging"
 *       CreateQuotationNewVendor:
 *         summary: Create quotation with new vendor
 *         value:
 *           VendorType: "New"
 *           NewVendor:
 *             VendorName: "New Supplier Pvt Ltd"
 *             GSTIN: "27NEWSP1234F1Z5"
 *             State: "Maharashtra"
 *             StateCode: 27
 *             Address: "123 Main Street, Mumbai"
 *             City: "Mumbai"
 *             Pincode: "400001"
 *             ContactPerson: "Raj Sharma"
 *             Phone: "9876543210"
 *             Email: "raj@newsupplier.com"
 *             PAN: "NEWSP1234F"
 *           Items:
 *             - PartNo: "PN-001"
 *               Quantity: 100
 *           ValidTill: "2024-02-20"
 */
router.post('/', protect, createQuotation);

/**
 * @swagger
 * /api/quotations/preview:
 *   post:
 *     summary: Calculate quotation without saving (Preview)
 *     tags: [Quotations]
 *     description: |
 *       Calculate quotation amounts without saving to database. Useful for preview and validation.
 *       
 *       **Calculations Performed**:
 *       1. Line Item Amount = Quantity × Final Rate
 *       2. Sub Total = Σ(Item Amounts)
 *       3. GST Logic: Compare vendor state with company state
 *       4. GST Amount = Sub Total × GST %
 *       5. Grand Total = Sub Total + GST Amount
 *       6. Amount in Words
 *       
 *       Returns detailed breakdown including GST logic explanation.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuotationPreview'
 *     responses:
 *       200:
 *         description: Quotation calculated successfully
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
 *                     company:
 *                       type: object
 *                       properties:
 *                         CompanyName:
 *                           type: string
 *                           example: "ABC Manufacturing Co."
 *                         GSTIN:
 *                           type: string
 *                           example: "27ABCDE1234F1Z5"
 *                         State:
 *                           type: string
 *                           example: "Maharashtra"
 *                         StateCode:
 *                           type: number
 *                           example: 27
 *                     vendor:
 *                       type: object
 *                       properties:
 *                         VendorName:
 *                           type: string
 *                           example: "XYZ Suppliers"
 *                         GSTIN:
 *                           type: string
 *                           example: "27XYZAB1234C1D2"
 *                         State:
 *                           type: string
 *                           example: "Gujarat"
 *                         StateCode:
 *                           type: number
 *                           example: 24
 *                     vendorType:
 *                       type: string
 *                       example: "Existing"
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           PartNo:
 *                             type: string
 *                             example: "PN-001"
 *                           PartName:
 *                             type: string
 *                             example: "Copper Bushing"
 *                           Quantity:
 *                             type: number
 *                             example: 100
 *                           FinalRate:
 *                             type: number
 *                             example: 154.71
 *                           Amount:
 *                             type: number
 *                             example: 15471.00
 *                     calculations:
 *                       type: object
 *                       properties:
 *                         subTotal:
 *                           type: number
 *                           example: 15471.00
 *                         gstType:
 *                           type: string
 *                           example: "IGST"
 *                         gstPercentage:
 *                           type: number
 *                           example: 18.0
 *                         gstAmount:
 *                           type: number
 *                           example: 2784.78
 *                         grandTotal:
 *                           type: number
 *                           example: 18255.78
 *                         amountInWords:
 *                           type: string
 *                           example: "Eighteen Thousand Two Hundred Fifty Five Rupees and Seventy Eight Paise Only"
 *                     termsConditions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     gstLogic:
 *                       type: string
 *                       example: "Interstate: IGST applies"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/ValidationError'
 *               - $ref: '#/components/responses/ItemNotFound'
 *               - $ref: '#/components/responses/CostingNotFound'
 *       404:
 *         $ref: '#/components/responses/CompanyNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/preview', protect, calculateQuotation);

/**
 * @swagger
 * /api/quotations/{id}:
 *   put:
 *     summary: Update an existing quotation
 *     tags: [Quotations]
 *     description: |
 *       Update quotation information. Only draft quotations can be modified.
 *       
 *       **Important**: When updating items, all calculations are automatically recalculated.
 *       
 *       **Status Changes**:
 *       - **Sent**: Records SentAt timestamp
 *       - **Approved**: Records ApprovedAt timestamp
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quotation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuotationUpdate'
 *     responses:
 *       200:
 *         description: Quotation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Quotation'
 *                 message:
 *                   type: string
 *                   example: "Quotation updated successfully"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/responses/ValidationError'
 *               - $ref: '#/components/responses/CannotModifyQuotation'
 *               - $ref: '#/components/responses/ItemNotFound'
 *               - $ref: '#/components/responses/CostingNotFound'
 *       404:
 *         $ref: '#/components/responses/QuotationNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateQuotation);

/**
 * @swagger
 * /api/quotations/{id}:
 *   delete:
 *     summary: Delete a quotation (SOFT DELETE)
 *     tags: [Quotations]
 *     description: |
 *       Soft delete a quotation by setting IsActive to false.
 *       
 *       **Important**: Only draft quotations can be deleted.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quotation ID
 *     responses:
 *       200:
 *         description: Quotation deleted successfully
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
 *                   example: "Quotation deleted successfully"
 *       400:
 *         $ref: '#/components/responses/CannotDeleteQuotation'
 *       404:
 *         $ref: '#/components/responses/QuotationNotFound'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteQuotation);

module.exports = router;