import { ExcelService } from './excelService.js';

export class ExpenseService {
  constructor() {
    this.excelService = new ExcelService();
  }

  async generateExpenseDetail(filePath) {
    const workbook = await this.excelService.readFile(filePath);
    const resources = await this.excelService.getResources(workbook);

    // Parse expenses from resources
    const expenses = [];
    resources.forEach((resource, index) => {
      const expenseType = resource['(Resource description)'] || resource['Resource Code'] || 'Unknown';
      const department = resource['(Activity center description)'] || resource['Activity Center Code'] || 'N/A';
      const amount = typeof resource['Amount'] === 'number' ? resource['Amount'] : parseFloat(resource['Amount']) || 0;
      const description = `${resource['Resource Code'] || ''} - ${resource['(Resource description)'] || 'Resource'}`.trim();

      if (amount > 0) {
        expenses.push({
          expenseType,
          amount,
          description,
          department,
          resourceCode: resource['Resource Code'],
          activityCenter: resource['Activity Center Code'],
        });
      }
    });

    return expenses;
  }

  async createExpenseWorkbook(expenses, company, period) {
    const wb = await this.excelService.createWorkbook();
    const sheet = wb.addWorksheet('Expense Detail');

    // Set column widths
    this.excelService.setColumnWidth(sheet, 'A', 25);
    this.excelService.setColumnWidth(sheet, 'B', 15);
    this.excelService.setColumnWidth(sheet, 'C', 40);
    this.excelService.setColumnWidth(sheet, 'D', 20);

    // Title
    sheet.addRow(['EXPENSE DETAIL']);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([`Company: ${company}`]);
    sheet.addRow([`Period: ${period}`]);

    // Add empty row
    sheet.addRow([]);

    // Headers
    this.excelService.addHeaderRow(sheet, [
      'Expense Type',
      'Amount',
      'Description',
      'Department',
    ]);

    // Format columns
    this.excelService.formatCurrencyColumn(sheet, 'B');

    // Add data rows
    let totalAmount = 0;
    expenses.forEach((expense, idx) => {
      const row = sheet.addRow([
        expense.expenseType,
        expense.amount,
        expense.description,
        expense.department,
      ]);

      totalAmount += expense.amount;

      // Add alternating row colors
      if (sheet.lastRow.number % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    // Add empty row
    sheet.addRow([]);

    // Add total row
    sheet.addRow(['TOTAL', totalAmount, '', '']);
    const totalRow = sheet.lastRow;
    totalRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    sheet.getCell('B' + totalRow.number).numFmt = '$#,##0.00';

    return wb;
  }
}
