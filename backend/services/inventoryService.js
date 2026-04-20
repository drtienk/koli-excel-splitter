import { ExcelService } from './excelService.js';

export class InventoryService {
  constructor() {
    this.excelService = new ExcelService();
  }

  async generateInventoryDetail(filePath) {
    const workbook = await this.excelService.readFile(filePath);

    // Read Purchased Material and WIP sheet
    const sheet = workbook.getWorksheet('Purchased Material and WIP');
    if (!sheet) throw new Error('Purchased Material and WIP sheet not found');

    // Get Sales Order total quantities for each material
    const salesRevenue = await this.excelService.getSalesRevenue(workbook);
    const salesByProduct = {};
    salesRevenue.forEach((order) => {
      const productCode = order['Product Code'];
      const qty = typeof order['Quantity'] === 'number' ? order['Quantity'] : parseFloat(order['Quantity']) || 0;
      if (productCode) {
        salesByProduct[productCode] = (salesByProduct[productCode] || 0) + qty;
      }
    });

    const inventoryDetails = [];
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
      const unit = material['Unit'] || 'Piece';

      const purchaseQty = typeof rawQty === 'number' ? rawQty : parseFloat(rawQty) || 0;
      const purchaseAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount) || 0;

      if (!productCode || purchaseQty === 0) return;

      const unitCost = purchaseQty > 0 ? purchaseAmount / purchaseQty : 0;
      const salesQty = salesByProduct[productCode] || 0;

      // Beginning Inventory = 0 (start of period)
      // Ending Inventory Qty = Beginning (0) + Purchase - Sales
      const endingQty = purchaseQty - salesQty;
      const endingAmount = endingQty * unitCost;

      inventoryDetails.push({
        materialCode: productCode,
        description,
        purchaseQty,
        purchaseAmount,
        unitCost,
        unit,
        endingQty,
        endingAmount,
        salesQty,
      });
    });

    console.log('[INVENTORY DEBUG]', {
      inventoryRows: inventoryDetails.length,
      totalPurchaseQty: inventoryDetails.reduce((sum, inv) => sum + inv.purchaseQty, 0),
      totalEndingQty: inventoryDetails.reduce((sum, inv) => sum + inv.endingQty, 0),
      totalPurchaseAmount: inventoryDetails.reduce((sum, inv) => sum + inv.purchaseAmount, 0),
      totalEndingAmount: inventoryDetails.reduce((sum, inv) => sum + inv.endingAmount, 0),
    });

    return {
      inventoryDetails,
      totalPurchaseQty: inventoryDetails.reduce((sum, inv) => sum + inv.purchaseQty, 0),
      totalEndingQty: inventoryDetails.reduce((sum, inv) => sum + inv.endingQty, 0),
      totalPurchaseAmount: inventoryDetails.reduce((sum, inv) => sum + inv.purchaseAmount, 0),
      totalEndingAmount: inventoryDetails.reduce((sum, inv) => sum + inv.endingAmount, 0),
    };
  }

  async createInventoryWorkbook({ inventoryDetails, totalPurchaseQty, totalEndingQty, totalPurchaseAmount, totalEndingAmount }, company, period) {
    const wb = await this.excelService.createWorkbook();
    const sheet = wb.addWorksheet('Inventory');

    this.excelService.setColumnWidth(sheet, 'A', 18);
    this.excelService.setColumnWidth(sheet, 'B', 35);
    this.excelService.setColumnWidth(sheet, 'C', 18);
    this.excelService.setColumnWidth(sheet, 'D', 18);
    this.excelService.setColumnWidth(sheet, 'E', 18);
    this.excelService.setColumnWidth(sheet, 'F', 12);
    this.excelService.setColumnWidth(sheet, 'G', 18);
    this.excelService.setColumnWidth(sheet, 'H', 18);

    // Title
    sheet.addRow(['INVENTORY DETAIL']);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([`Company: ${company}`]);
    sheet.addRow([`Period: ${period}`]);
    sheet.addRow([]);

    // Headers
    this.excelService.addHeaderRow(sheet, [
      'Material Code',
      'Description',
      'Purchase Qty',
      'Purchase Amount',
      'Unit Cost',
      'Unit',
      'Ending Qty',
      'Ending Amount',
    ]);

    this.excelService.formatCurrencyColumn(sheet, 'D');
    this.excelService.formatCurrencyColumn(sheet, 'E');
    this.excelService.formatCurrencyColumn(sheet, 'H');

    // Data rows
    inventoryDetails.forEach((inv) => {
      const row = sheet.addRow([
        inv.materialCode,
        inv.description,
        inv.purchaseQty,
        inv.purchaseAmount,
        inv.unitCost,
        inv.unit,
        inv.endingQty,
        inv.endingAmount,
      ]);

      if (sheet.lastRow.number % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    sheet.addRow([]);

    // Total row
    sheet.addRow(['TOTAL', '', totalPurchaseQty, totalPurchaseAmount, '', '', totalEndingQty, totalEndingAmount]);
    const totalRow = sheet.lastRow;
    totalRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    sheet.getCell('D' + totalRow.number).numFmt = '$#,##0.00';
    sheet.getCell('H' + totalRow.number).numFmt = '$#,##0.00';

    return wb;
  }
}
