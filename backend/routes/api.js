import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { SplitterService } from '../services/splitterService.js';
import { MergerService } from '../services/mergerService.js';
import { ExcelService } from '../services/excelService.js';
import { ExpenseService } from '../services/expenseService.js';
import { COGSService } from '../services/cogsService.js';
import { ActivityDriverService } from '../services/activityDriverService.js';
import { InventoryService } from '../services/inventoryService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream',
      'application/excel',
      'application/x-excel',
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const splitterService = new SplitterService();
const mergerService = new MergerService();
const excelService = new ExcelService();
const expenseService = new ExpenseService();
const cogsService = new COGSService();
const activityDriverService = new ActivityDriverService();
const inventoryService = new InventoryService();

// Upload and preview
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const workbook = await excelService.readFile(filePath);

    const salesRevenue = await excelService.getSalesRevenue(workbook);
    const resources = await excelService.getResources(workbook);

    const preview = {
      fileName: req.file.originalname,
      fileId: req.file.filename,
      salesRevenue: salesRevenue.slice(0, 10),
      salesRevenueCount: salesRevenue.length,
      resources: resources.slice(0, 10),
      resourcesCount: resources.length,
    };

    res.json({
      status: 'success',
      preview,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Split file into Income Statement and Sales Order
router.post('/split', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const result = await splitterService.splitFile(filePath);
    const company = 'KOLI';
    const period = '2024-01';
    const periodYYYYMM = '202401';

    // Save generated files with new naming convention
    const fileId = Date.now().toString();
    const isFilePath = path.join(uploadsDir, `${company}_${periodYYYYMM}_IncomeStatement-${fileId}.xlsx`);
    const soFilePath = path.join(uploadsDir, `${company}_${periodYYYYMM}_SalesOrder-${fileId}.xlsx`);
    const expenseFilePath = path.join(uploadsDir, `${company}_${periodYYYYMM}_ExpenseDetail-${fileId}.xlsx`);

    await excelService.saveWorkbook(result.incomeStatement, isFilePath);
    await excelService.saveWorkbook(result.salesOrder, soFilePath);

    // Generate expense detail
    let expenseResult = null;
    let expenseDownloadUrl = null;
    try {
      const expenses = await expenseService.generateExpenseDetail(filePath);
      const expenseWb = await expenseService.createExpenseWorkbook(expenses, company, period);
      await excelService.saveWorkbook(expenseWb, expenseFilePath);
      expenseResult = {
        expenses,
        totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      };
      expenseDownloadUrl = `/api/download/${company}_${periodYYYYMM}_ExpenseDetail-${fileId}.xlsx`;
    } catch (expenseError) {
      console.error('[EXPENSE ERROR]', expenseError.message);
    }

    // Generate COGS detail
    let cogsResult = null;
    let cogsDownloadUrl = null;
    const cogsFilePath = path.join(uploadsDir, `${company}_${periodYYYYMM}_COGSDetail-${fileId}.xlsx`);
    try {
      const cogsData = await cogsService.generateCOGSDetail(filePath);
      const cogsWb = await cogsService.createCOGSWorkbook(cogsData, company, period);
      await excelService.saveWorkbook(cogsWb, cogsFilePath);
      cogsResult = {
        cogsDetails: cogsData.cogsDetails,
        totalCOGS: cogsData.totalCOGS,
        totalQuantity: cogsData.totalQuantity,
        salesOrderTotalQty: cogsData.salesOrderTotalQty,
        quantityMatches: cogsData.quantityMatches,
        quantityDifference: cogsData.quantityDifference,
      };
      cogsDownloadUrl = `/api/download/${company}_${periodYYYYMM}_COGSDetail-${fileId}.xlsx`;
    } catch (cogsError) {
      console.error('[COGS ERROR]', cogsError.message);
    }

    // Generate Activity Driver Time Sheet
    let activityDriverResult = null;
    let activityDriverDownloadUrl = null;
    const activityDriverFilePath = path.join(uploadsDir, `${company}_${periodYYYYMM}_TimeSheet-${fileId}.xlsx`);
    try {
      const activities = await activityDriverService.generateActivityDriverData(filePath);
      const activityDriverWb = await activityDriverService.createActivityDriverWorkbook(activities, company, period);
      await excelService.saveWorkbook(activityDriverWb, activityDriverFilePath);
      activityDriverResult = {
        activities,
        totalActivities: activities.length,
      };
      activityDriverDownloadUrl = `/api/download/${company}_${periodYYYYMM}_TimeSheet-${fileId}.xlsx`;
    } catch (activityError) {
      console.error('[ACTIVITY DRIVER ERROR]', activityError.message);
    }

    // Generate Inventory Detail
    let inventoryResult = null;
    let inventoryDownloadUrl = null;
    const inventoryFilePath = path.join(uploadsDir, `${company}_${periodYYYYMM}_Inventory-${fileId}.xlsx`);
    try {
      const inventoryData = await inventoryService.generateInventoryDetail(filePath);
      console.log('[INVENTORY] Data generated:', { rows: inventoryData.inventoryDetails.length, totalQty: inventoryData.totalPurchaseQty });
      const inventoryWb = await inventoryService.createInventoryWorkbook(inventoryData, company, period);
      console.log('[INVENTORY] Workbook created');
      await excelService.saveWorkbook(inventoryWb, inventoryFilePath);
      console.log('[INVENTORY] Workbook saved');
      inventoryResult = {
        inventoryDetails: inventoryData.inventoryDetails,
        totalPurchaseQty: inventoryData.totalPurchaseQty,
        totalEndingQty: inventoryData.totalEndingQty,
        totalPurchaseAmount: inventoryData.totalPurchaseAmount,
        totalEndingAmount: inventoryData.totalEndingAmount,
      };
      inventoryDownloadUrl = `/api/download/${company}_${periodYYYYMM}_Inventory-${fileId}.xlsx`;
      console.log('[INVENTORY] SUCCESS: Result prepared');
    } catch (inventoryError) {
      console.error('[INVENTORY ERROR]', inventoryError.message, inventoryError.stack);
    }

    // Clean up original upload
    fs.unlinkSync(filePath);

    console.log('[DEBUG] Company:', company, 'Period:', period);
    const response = {
      status: 'success',
      fileId,
      company,
      period,
      validation: result.validation,
      metadata: {
        total_revenue: result.metadata.summary.total_revenue,
        total_cogs: result.metadata.summary.total_cogs,
        gross_profit: result.metadata.summary.gross_profit,
        total_expenses: result.metadata.summary.total_expenses,
        net_profit: result.metadata.summary.net_profit,
      },
      incomeStatementData: {
        revenue: result.metadata.summary.total_revenue,
        cogs: result.metadata.summary.total_cogs,
        expenses: result.metadata.summary.total_expenses,
      },
      salesOrders: result.salesOrderPreview || [],
      downloads: {
        incomeStatement: `/api/download/${company}_${periodYYYYMM}_IncomeStatement-${fileId}.xlsx`,
        salesOrder: `/api/download/${company}_${periodYYYYMM}_SalesOrder-${fileId}.xlsx`,
      },
    };

    if (expenseResult) {
      response.expenseResult = expenseResult;
      response.downloads.expenseDetail = expenseDownloadUrl;
    } else {
      response.downloads.expenseDetail = null;
    }

    if (cogsResult) {
      response.cogsResult = cogsResult;
      response.downloads.cogsDetail = cogsDownloadUrl;
    } else {
      response.downloads.cogsDetail = null;
    }

    if (activityDriverResult) {
      response.activityDriverResult = activityDriverResult;
      response.downloads.activityDriver = activityDriverDownloadUrl;
    } else {
      response.downloads.activityDriver = null;
    }

    if (inventoryResult) {
      response.inventoryResult = inventoryResult;
      response.downloads.inventory = inventoryDownloadUrl;
    } else {
      response.downloads.inventory = null;
    }

    res.json(response);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Generate Expense Detail
router.post('/expense', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const expenses = await expenseService.generateExpenseDetail(filePath);

    // Create expense workbook
    const expenseWb = await expenseService.createExpenseWorkbook(expenses);

    // Save expense file
    const fileId = Date.now().toString();
    const expenseFilePath = path.join(uploadsDir, `expense-${fileId}.xlsx`);

    await excelService.saveWorkbook(expenseWb, expenseFilePath);

    // Clean up original upload
    fs.unlinkSync(filePath);

    res.json({
      status: 'success',
      fileId,
      expenses,
      totalExpenses: expenses.reduce((sum, e) => sum + e.amount, 0),
      download: `/api/download/expense-${fileId}.xlsx`,
    });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Merge files
router.post('/merge', upload.array('files', 2), async (req, res) => {
  try {
    if (!req.files || req.files.length !== 2) {
      return res.status(400).json({ error: 'Two files are required for merging' });
    }

    const incomeStatementPath = req.files[0].path;
    const salesOrderPath = req.files[1].path;

    const result = await mergerService.mergeFiles(incomeStatementPath, salesOrderPath);

    if (result.status === 'error') {
      req.files.forEach((f) => fs.unlinkSync(f.path));
      return res.status(400).json(result);
    }

    // Save merged file
    const fileId = Date.now().toString();
    const mergedPath = path.join(uploadsDir, `merged-${fileId}.xlsx`);

    await excelService.saveWorkbook(result.workbook, mergedPath);

    // Clean up uploaded files
    req.files.forEach((f) => fs.unlinkSync(f.path));

    res.json({
      status: 'success',
      fileId,
      verification: result.verification,
      download: `/api/download/merged-${fileId}.xlsx`,
    });
  } catch (error) {
    if (req.files) {
      req.files.forEach((f) => {
        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Download file
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const { company, period } = req.query;

    if (!filename.match(/^[a-zA-Z0-9\-\._]+$/)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const filePath = path.join(uploadsDir, filename);

    // Verify file exists and is in uploads directory
    if (!fs.existsSync(filePath) || !path.resolve(filePath).startsWith(uploadsDir)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Build download filename with company and period if provided
    let downloadName = filename;
    if (company && period) {
      const periodYYYYMM = period.replace('-', '');
      // Extract the file type from the original filename
      let fileType = 'File';
      const fileTypes = ['IncomeStatement', 'SalesOrder', 'COGSDetail', 'ExpenseDetail', 'TimeSheet', 'Inventory'];
      for (const type of fileTypes) {
        if (filename.includes(type)) {
          fileType = type;
          break;
        }
      }
      downloadName = `${company}_${periodYYYYMM}_${fileType}.xlsx`;
    }

    res.download(filePath, downloadName, (err) => {
      if (err) console.error('Download error:', err);
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

// Cleanup old files (optional)
router.post('/cleanup', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    let deleted = 0;
    files.forEach((file) => {
      const filePath = path.join(uploadsDir, file);
      const stat = fs.statSync(filePath);

      if (stat.mtimeMs < oneHourAgo) {
        fs.unlinkSync(filePath);
        deleted++;
      }
    });

    res.json({
      status: 'success',
      filesDeleted: deleted,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export default router;
