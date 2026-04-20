import { ExcelService } from './excelService.js';
import { ValidationService } from './validationService.js';
import { calculateChecksum } from '../utils/checksumUtil.js';

export class MergerService {
  constructor() {
    this.excelService = new ExcelService();
    this.validationService = new ValidationService();
  }

  async mergeFiles(incomeStatementPath, salesOrderPath) {
    const isWb = await this.excelService.readFile(incomeStatementPath);
    const soWb = await this.excelService.readFile(salesOrderPath);

    // Extract metadata from both files
    const isMetadata = this.extractMetadata(isWb);
    const soMetadata = this.extractMetadata(soWb);

    if (!isMetadata || !soMetadata) {
      return {
        status: 'error',
        message: 'Metadata not found in one or both files',
      };
    }

    // Verify that both files have matching metadata
    if (isMetadata.original_checksum !== soMetadata.original_checksum) {
      return {
        status: 'error',
        message: 'Files do not match - different source files',
      };
    }

    // Extract sales data from Sales Order sheet
    const salesData = this.extractSalesData(soWb);

    // Create merged workbook - copy from original structure
    const mergedWb = await this.excelService.createWorkbook();

    // Add Income Statement
    await this.copySalesRevenue(soWb, mergedWb, salesData);
    await this.copyIncomeStatement(isWb, mergedWb);

    // Add metadata
    this.addMetadataSheet(mergedWb, isMetadata);

    // Calculate verification
    const verification = this.verifyMerge(
      isMetadata.summary,
      salesData,
      isMetadata.materials_mapping,
    );

    return {
      status: 'success',
      workbook: mergedWb,
      verification,
      metadata: isMetadata,
    };
  }

  extractMetadata(workbook) {
    const sheet = workbook.getWorksheet('_Metadata');
    if (!sheet) return null;

    const metadata = {};
    const rows = [];

    sheet.eachRow((row) => {
      rows.push(row.values.slice(1));
    });

    rows.forEach(([key, value]) => {
      if (key === 'summary' || key === 'materials_mapping') {
        try {
          metadata[key] = JSON.parse(value);
        } catch (e) {
          metadata[key] = value;
        }
      } else {
        metadata[key] = value;
      }
    });

    return Object.keys(metadata).length > 0 ? metadata : null;
  }

  extractSalesData(workbook) {
    const sheet = workbook.getWorksheet('Sales Order');
    if (!sheet) return [];

    const sales = [];
    let headers = null;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        headers = row.values.slice(1);
        return;
      }
      if (!row.values[1]) return;

      const order = {};
      headers.forEach((header, index) => {
        order[header] = row.values[index + 1];
      });
      sales.push(order);
    });

    return sales;
  }

  async copySalesRevenue(sourceWb, targetWb, salesData) {
    const sheet = targetWb.addWorksheet('Sales Revenue ');

    // Add headers
    const headers = [
      'Order No',
      'Customer Code',
      'Product Code',
      'Quantity',
      'Amount',
      'Sales Activity Center Code',
      'Shipment Business Unit',
      'Currency',
    ];
    sheet.addRow(headers);

    // Add data rows
    salesData.forEach((sale) => {
      sheet.addRow([
        sale['Order No'],
        sale['Customer Code'],
        sale['Product Code'],
        sale['Quantity'],
        sale['Total Amount'],
        sale['Sales Activity Center Code'] || '',
        'KOLI',
        'NTD',
      ]);
    });
  }

  async copyIncomeStatement(sourceWb, targetWb) {
    const sourceSheet = sourceWb.getWorksheet('Income Statement');
    if (!sourceSheet) return;

    const sheet = targetWb.addWorksheet('Income Statement');

    sourceSheet.eachRow((row, rowNumber) => {
      const newRow = sheet.addRow(row.values.slice(1));

      // Copy formatting
      if (row.font) newRow.font = { ...row.font };
      if (row.fill) newRow.fill = { ...row.fill };
      if (row.alignment) newRow.alignment = { ...row.alignment };

      row.eachCell((cell, colNumber) => {
        const newCell = newRow.getCell(colNumber);
        if (cell.numFmt) newCell.numFmt = cell.numFmt;
        if (cell.font) newCell.font = { ...cell.font };
        if (cell.fill) newCell.fill = { ...cell.fill };
      });
    });
  }

  verifyMerge(originalSummary, salesData, materialsMapping) {
    const mergedRevenue = salesData.reduce((sum, sale) => sum + (sale['Total Amount'] || 0), 0);
    const originalRevenue = originalSummary.total_revenue || 0;

    const revenueDiff = Math.abs(mergedRevenue - originalRevenue);
    const orderCount = salesData.length;

    const verification = {
      revenue_match: revenueDiff < 0.01,
      original_revenue: originalRevenue,
      merged_revenue: mergedRevenue,
      revenue_difference: revenueDiff,
      order_count: orderCount,
      checksum: calculateChecksum({
        salesData,
        summary: originalSummary,
      }),
      is_valid: revenueDiff < 0.01,
    };

    if (!verification.is_valid) {
      verification.warnings = [
        `Revenue mismatch: Original ${originalRevenue}, Merged ${mergedRevenue}`,
      ];
    }

    return verification;
  }

  addMetadataSheet(workbook, metadata) {
    const sheet = workbook.addWorksheet('_Metadata', { hidden: true });

    sheet.addRow(['original_checksum', metadata.original_checksum]);
    sheet.addRow(['split_timestamp', metadata.split_timestamp]);
    sheet.addRow(['merged_timestamp', new Date().toISOString()]);
    sheet.addRow(['summary', JSON.stringify(metadata.summary)]);
    sheet.addRow(['materials_mapping', JSON.stringify(metadata.materials_mapping)]);
  }
}
