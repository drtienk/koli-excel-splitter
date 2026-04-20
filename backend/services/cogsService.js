import { ExcelService } from './excelService.js';

export class COGSService {
  constructor() {
    this.excelService = new ExcelService();
  }

  async generateCOGSDetail(filePath) {
    const workbook = await this.excelService.readFile(filePath);

    // Read ALL rows from Purchased Material and WIP directly
    const sheet = workbook.getWorksheet('Purchased Material and WIP');
    if (!sheet) throw new Error('Purchased Material and WIP sheet not found');

    const cogsDetails = [];
    let totalCOGS = 0;
    let totalQuantity = 0;
    let headers = null;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values.slice(1);
        return;
      }
      if (!row.values[1]) return;

      const material = {};
      headers.forEach((header, index) => {
        material[header] = row.values[index + 1];
      });

      const productCode = material['Material Code'];
      const description = material['(Material code description)'] || '';
      const rawQty = material['Quantity'];
      const rawAmount = material['Amount'];

      const quantity = typeof rawQty === 'number' ? rawQty : parseFloat(rawQty) || 0;
      const amount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount) || 0;

      if (!productCode || quantity === 0) return;

      const unitCost = quantity > 0 ? amount / quantity : 0;

      totalQuantity += quantity;
      totalCOGS += amount;

      cogsDetails.push({
        productCode,
        description,
        quantity,
        unitCost,
        lineCOGS: amount,
      });
    });

    // Get Sales Order total quantity for cross-check
    const salesRevenue = await this.excelService.getSalesRevenue(workbook);
    let salesOrderTotalQty = 0;
    salesRevenue.forEach((order) => {
      const qty = typeof order['Quantity'] === 'number' ? order['Quantity'] : parseFloat(order['Quantity']) || 0;
      salesOrderTotalQty += qty;
    });

    const quantityMatches = Math.abs(totalQuantity - salesOrderTotalQty) < 0.01;

    console.log('[COGS DEBUG]', {
      cogsRows: cogsDetails.length,
      totalQuantity,
      salesOrderTotalQty,
      totalCOGS,
      quantityMatches,
    });

    return {
      cogsDetails,
      totalCOGS,
      totalQuantity,
      salesOrderTotalQty,
      quantityMatches,
      quantityDifference: totalQuantity - salesOrderTotalQty,
    };
  }

  async createCOGSWorkbook({ cogsDetails, totalCOGS }, company, period) {
    const wb = await this.excelService.createWorkbook();
    const sheet = wb.addWorksheet('COGS Detail');

    this.excelService.setColumnWidth(sheet, 'A', 18);
    this.excelService.setColumnWidth(sheet, 'B', 35);
    this.excelService.setColumnWidth(sheet, 'C', 12);
    this.excelService.setColumnWidth(sheet, 'D', 18);
    this.excelService.setColumnWidth(sheet, 'E', 18);

    // Title
    sheet.addRow(['COST OF GOODS SOLD DETAIL']);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([`Company: ${company}`]);
    sheet.addRow([`Period: ${period}`]);
    sheet.addRow([]);

    // Headers
    this.excelService.addHeaderRow(sheet, [
      'Product Code',
      'Description',
      'Quantity',
      'Unit Cost',
      'Amount (COGS)',
    ]);

    this.excelService.formatCurrencyColumn(sheet, 'D');
    this.excelService.formatCurrencyColumn(sheet, 'E');

    // Data rows
    cogsDetails.forEach((cogs) => {
      const row = sheet.addRow([
        cogs.productCode,
        cogs.description,
        cogs.quantity,
        cogs.unitCost,
        cogs.lineCOGS,
      ]);

      if (sheet.lastRow.number % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    sheet.addRow([]);

    // Total row
    sheet.addRow(['TOTAL', '', '', '', totalCOGS]);
    const totalRow = sheet.lastRow;
    totalRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    sheet.getCell('E' + totalRow.number).numFmt = '$#,##0.00';

    return wb;
  }
}
