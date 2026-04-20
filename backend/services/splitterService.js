import { ExcelService } from './excelService.js';
import { ValidationService } from './validationService.js';
import { calculateChecksum } from '../utils/checksumUtil.js';

export class SplitterService {
  constructor() {
    this.excelService = new ExcelService();
    this.validationService = new ValidationService();
  }

  async splitFile(filePath) {
    const workbook = await this.excelService.readFile(filePath);
    const company = 'KOLI';
    const period = '2024-01';

    const salesRevenue = await this.excelService.getSalesRevenue(workbook);
    const materials = await this.excelService.getMaterials(workbook);
    const resources = await this.excelService.getResources(workbook);


    const validations = [
      ...this.validationService.validateSalesData(salesRevenue),
      ...this.validationService.validateMaterialsMapping(materials, salesRevenue),
    ];

    const report = this.validationService.createValidationReport(validations);

    // Calculate COGS
    const cogs = this.calculateCOGS(salesRevenue, materials);

    // Create financial summary
    const summary = this.validationService.createFinancialSummary(
      salesRevenue,
      cogs,
      materials,
      resources,
    );

    const originalChecksum = calculateChecksum({
      salesRevenue,
      materials,
      resources,
    });

    const metadata = this.validationService.createMetadata(originalChecksum, summary, materials);

    const incomeStatementWb = await this.generateIncomeStatement(
      salesRevenue,
      materials,
      resources,
      summary,
      company,
      period,
    );

    const { wb: salesOrderWb, previewRows: salesOrderPreview } = await this.generateSalesOrder(
      salesRevenue,
      materials,
      company,
      period,
    );

    // Add metadata sheet to both workbooks
    this.addMetadataSheet(incomeStatementWb, metadata);
    this.addMetadataSheet(salesOrderWb, metadata);

    return {
      incomeStatement: incomeStatementWb,
      salesOrder: salesOrderWb,
      validation: report,
      metadata,
      salesOrderPreview,
      company,
      period,
    };
  }

  calculateCOGS(orders, materials) {
    let totalCOGS = 0;

    orders.forEach((order) => {
      const productCode = order['Product Code'];
      const quantity = typeof order['Quantity'] === 'number' ? order['Quantity'] : parseFloat(order['Quantity']) || 0;

      if (materials[productCode]) {
        const unitCost = materials[productCode].unitCost;
        totalCOGS += unitCost * quantity;
      }
    });

    return totalCOGS;
  }

  async generateIncomeStatement(revenue, materials, resources, summary, company, period) {
    const wb = await this.excelService.createWorkbook();
    const sheet = wb.addWorksheet('Income Statement');

    // Set column widths
    this.excelService.setColumnWidth(sheet, 'A', 30);
    this.excelService.setColumnWidth(sheet, 'B', 18);

    // Title
    sheet.addRow(['INCOME STATEMENT']);
    sheet.getRow(1).font = { bold: true, size: 14 };

    // Company and Period
    sheet.addRow([`Company: ${company}`]);
    sheet.addRow([`Period: ${period}`]);

    // Add empty row
    sheet.addRow([]);

    // Revenue section
    sheet.addRow(['REVENUE', '']);
    const revenueRow = sheet.lastRow;
    revenueRow.font = { bold: true };
    revenueRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };

    sheet.addRow(['Total Sales Revenue', summary.total_revenue]);
    this.excelService.formatCurrencyColumn(sheet, 'B');

    sheet.addRow([]);

    // Cost of Goods Sold
    sheet.addRow(['COST OF GOODS SOLD', '']);
    const cogsRow = sheet.lastRow;
    cogsRow.font = { bold: true };
    cogsRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };

    sheet.addRow(['Cost of Goods Sold', summary.total_cogs]);
    sheet.addRow([]);

    // Gross Profit
    sheet.addRow(['GROSS PROFIT', summary.gross_profit]);
    const gpRow = sheet.lastRow;
    gpRow.font = { bold: true, color: { argb: 'FF00B050' } };
    gpRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } };
    sheet.getCell('B' + gpRow.number).numFmt = '$#,##0.00';

    sheet.addRow([]);

    // Operating Expenses
    sheet.addRow(['OPERATING EXPENSES', '']);
    const opexRow = sheet.lastRow;
    opexRow.font = { bold: true };
    opexRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };

    Object.entries(summary.expenses_breakdown).forEach(([type, amount]) => {
      sheet.addRow([type, amount]);
      this.excelService.formatCurrencyColumn(sheet, 'B');
    });

    sheet.addRow(['Total Operating Expenses', summary.total_expenses]);
    const totalExpRow = sheet.lastRow;
    totalExpRow.font = { bold: true };
    sheet.getCell('B' + totalExpRow.number).numFmt = '$#,##0.00';

    sheet.addRow([]);

    // Net Profit
    sheet.addRow(['NET PROFIT', summary.net_profit]);
    const npRow = sheet.lastRow;
    npRow.font = { bold: true, size: 12, color: { argb: 'FF00B050' } };
    npRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    sheet.getCell('B' + npRow.number).numFmt = '$#,##0.00';

    return wb;
  }

  async generateSalesOrder(orders, materials, company, period) {
    const wb = await this.excelService.createWorkbook();
    const sheet = wb.addWorksheet('Sales Order');

    // Title and metadata
    sheet.addRow(['SALES ORDER']);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([`Company: ${company}`]);
    sheet.addRow([`Period: ${period}`]);
    sheet.addRow([]);

    this.excelService.setColumnWidth(sheet, 'A', 15);
    this.excelService.setColumnWidth(sheet, 'B', 15);
    this.excelService.setColumnWidth(sheet, 'C', 15);
    this.excelService.setColumnWidth(sheet, 'D', 12);
    this.excelService.setColumnWidth(sheet, 'E', 15);
    this.excelService.setColumnWidth(sheet, 'F', 18);

    this.excelService.addHeaderRow(sheet, [
      'Order No', 'Customer Code', 'Product Code', 'Quantity', 'Unit Price', 'Total Amount',
    ]);

    this.excelService.formatNumberColumn(sheet, 'D', 0);
    this.excelService.formatCurrencyColumn(sheet, 'E');
    this.excelService.formatCurrencyColumn(sheet, 'F');

    const previewRows = [];

    orders.forEach((order) => {
      const quantity = typeof order['Quantity'] === 'number' ? order['Quantity'] : parseFloat(order['Quantity']) || 0;
      const amount = typeof order['Amount'] === 'number' ? order['Amount'] : parseFloat(order['Amount']) || 0;
      const unitPrice = quantity > 0 ? amount / quantity : 0;

      previewRows.push({
        'Order No': String(order['Order No'] || ''),
        'Customer Code': String(order['Customer Code'] || ''),
        'Product Code': String(order['Product Code'] || ''),
        'Quantity': quantity,
        'Unit Price': unitPrice,
        'Total Amount': amount,
      });

      const row = sheet.addRow([
        order['Order No'], order['Customer Code'], order['Product Code'],
        quantity, unitPrice, amount,
      ]);

      if (sheet.lastRow.number % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    return { wb, previewRows };
  }

  addMetadataSheet(workbook, metadata) {
    const sheet = workbook.addWorksheet('_Metadata', { hidden: true });

    // Store metadata as JSON in cells
    sheet.addRow(['original_checksum', metadata.original_checksum]);
    sheet.addRow(['split_timestamp', metadata.split_timestamp]);
    sheet.addRow(['summary', JSON.stringify(metadata.summary)]);
    sheet.addRow(['materials_mapping', JSON.stringify(metadata.materials_mapping)]);
  }
}
