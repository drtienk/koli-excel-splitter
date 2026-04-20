import { ExcelService } from './excelService.js';

export class ActivityDriverService {
  constructor() {
    this.excelService = new ExcelService();
  }

  async generateActivityDriverData(filePath) {
    const workbook = await this.excelService.readFile(filePath);
    const sheet = workbook.getWorksheet('Activity Driver');

    if (!sheet) {
      throw new Error('Activity Driver sheet not found');
    }

    const activities = [];
    let headers = null;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values.slice(1);
        return;
      }
      if (!row.values[1]) return;

      const activity = {};
      headers.forEach((header, index) => {
        activity[header] = row.values[index + 1];
      });

      // Only keep required fields with renamed columns
      activities.push({
        'Activity Center Code': activity['Activity Center Code'] || '',
        'Activity Code': activity['Activity Code'] || '',
        'hours': activity['Activity Driver Value'] || '',
        'customer ID': activity['Value Object Code'] || '',
        'product ID': activity['Product Code'] || '',
      });
    });

    return activities;
  }

  async createActivityDriverWorkbook(activities, company, period) {
    const wb = await this.excelService.createWorkbook();
    const sheet = wb.addWorksheet('Time Sheet');

    // Set column widths
    this.excelService.setColumnWidth(sheet, 'A', 18);
    this.excelService.setColumnWidth(sheet, 'B', 15);
    this.excelService.setColumnWidth(sheet, 'C', 12);
    this.excelService.setColumnWidth(sheet, 'D', 15);
    this.excelService.setColumnWidth(sheet, 'E', 15);

    // Title
    sheet.addRow(['CUSTOMER VISIT TIME SHEET']);
    sheet.getRow(1).font = { bold: true, size: 14 };
    sheet.addRow([`Company: ${company}`]);
    sheet.addRow([`Period: ${period}`]);

    // Add empty row
    sheet.addRow([]);

    // Headers
    this.excelService.addHeaderRow(sheet, [
      'Activity Center Code',
      'Activity Code',
      'hours',
      'customer ID',
      'product ID',
    ]);

    // Add data rows
    activities.forEach((activity) => {
      const row = sheet.addRow([
        activity['Activity Center Code'],
        activity['Activity Code'],
        activity['hours'],
        activity['customer ID'],
        activity['product ID'],
      ]);

      // Add alternating row colors
      if (sheet.lastRow.number % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    // Add summary row
    sheet.addRow([]);
    sheet.addRow(['Total Records:', activities.length]);
    const summaryRow = sheet.lastRow;
    summaryRow.font = { bold: true };
    summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE7E6E6' } };

    return wb;
  }
}
