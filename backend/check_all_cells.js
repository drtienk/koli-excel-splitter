import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

const sheet = wb.getWorksheet('Purchased Material and WIP');

console.log('All header columns:');
const headerRow = sheet.getRow(1);
const headers = [];
headerRow.eachCell((cell, colNum) => {
  headers[colNum] = cell.value;
  console.log(`  Col ${colNum}: "${cell.value}"`);
});

console.log('\nTotal headers:', headers.length);

console.log('\nFirst data row (row 2):');
const dataRow = sheet.getRow(2);
dataRow.eachCell((cell, colNum) => {
  console.log(`  Col ${colNum}: ${cell.value}`);
});
