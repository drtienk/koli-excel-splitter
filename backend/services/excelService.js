import ExcelJS from 'exceljs';

export class ExcelService {
  async readFile(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    return workbook;
  }

  async readFileBuffer(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    return workbook;
  }

  async getSheetData(workbook, sheetName) {
    const sheet = workbook.getWorksheet(sheetName);
    if (!sheet) return [];

    const data = [];
    sheet.eachRow((row, rowNumber) => {
      data.push({
        rowNumber,
        values: row.values.slice(1),
      });
    });
    return data;
  }

  async getSalesRevenue(workbook) {
    const sheet = workbook.getWorksheet('Sales Revenue ');
    if (!sheet) throw new Error('Sales Revenue sheet not found');

    const orders = [];
    let headers = null;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values.slice(1);
        return;
      }
      if (!row.values[1]) return; // Skip empty rows

      const order = {};
      headers.forEach((header, index) => {
        order[header] = row.values[index + 1];
      });
      orders.push(order);
    });

    return orders;
  }

  async getMaterials(workbook) {
    const sheet = workbook.getWorksheet('Purchased Material and WIP');
    if (!sheet) throw new Error('Purchased Material and WIP sheet not found');

    const materials = {};
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

      // Create mapping: Material Code -> Unit Cost
      const code = material['Material Code'];
      const amount = material['Amount'];
      const quantity = material['Quantity'];

      if (code && amount && quantity) {
        materials[code] = {
          code,
          description: material['(Material code description)'],
          quantity,
          amount,
          unitCost: amount / quantity,
        };
      }
    });

    return materials;
  }

  async getResources(workbook) {
    const sheet = workbook.getWorksheet('Resource');
    if (!sheet) throw new Error('Resource sheet not found');

    const resources = [];
    let headers = null;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values.slice(1);
        return;
      }
      if (!row.values[1]) return;

      const resource = {};
      headers.forEach((header, index) => {
        resource[header] = row.values[index + 1];
      });
      resources.push(resource);
    });

    return resources;
  }

  async getBusinessUnit(workbook) {
    const sheet = workbook.getWorksheet('Resource');
    if (!sheet) return 'KOLI';

    let businessUnit = 'KOLI';
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      const buValue = row.values[2]; // Usually column B
      if (buValue && typeof buValue === 'string') {
        businessUnit = buValue.trim();
        return false; // Stop iteration
      }
    });

    return businessUnit;
  }

  extractPeriodFromOrderNo(orderNo) {
    if (!orderNo) return null;
    // Extract YYYYMM from "SO-202401-XXX" format
    const match = String(orderNo).match(/SO-(\d{6})/);
    if (match) {
      const yyyymm = match[1];
      const yyyy = yyyymm.substring(0, 4);
      const mm = yyyymm.substring(4, 6);
      return { yyyymm, displayFormat: `${yyyy}-${mm}` };
    }
    return null;
  }

  async getPeriodFromSalesRevenue(workbook) {
    const sales = await this.getSalesRevenue(workbook);
    if (sales.length === 0) return null;

    for (const order of sales) {
      const period = this.extractPeriodFromOrderNo(order['Order No']);
      if (period) return period;
    }
    return null;
  }

  addMetadataHeader(sheet, company, period) {
    const headerText = `Company: ${company} | Period: ${period}`;
    sheet.insertRow(1, [headerText]);
    const row = sheet.getRow(1);
    row.getCell(1).font = { bold: true, size: 11 };
    row.height = 20;
  }

  async createWorkbook() {
    return new ExcelJS.Workbook();
  }

  async saveWorkbook(workbook, filePath) {
    await workbook.xlsx.writeFile(filePath);
  }

  async getWorkbookBuffer(workbook) {
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  addHeaderRow(sheet, headers) {
    const row = sheet.addRow(headers);
    row.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    row.alignment = { horizontal: 'center', vertical: 'center' };
  }

  formatCurrencyColumn(sheet, columnLetter) {
    sheet.getColumn(columnLetter).numFmt = '$#,##0.00';
  }

  formatNumberColumn(sheet, columnLetter, decimals = 0) {
    const format = decimals === 0 ? '#,##0' : `#,##0.${'0'.repeat(decimals)}`;
    sheet.getColumn(columnLetter).numFmt = format;
  }

  setColumnWidth(sheet, columnLetter, width) {
    sheet.getColumn(columnLetter).width = width;
  }
}
