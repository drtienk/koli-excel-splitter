import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

const sheet = wb.getWorksheet('Purchased Material and WIP');
const firstRow = sheet.getRow(1);

console.log('All columns in "Purchased Material and WIP":');
firstRow.eachCell((cell, colNumber) => {
  if (cell.value) {
    console.log(`  Col ${colNumber}: "${cell.value}"`);
  }
});

console.log('\nFirst data row values:');
const secondRow = sheet.getRow(2);
secondRow.eachCell((cell, colNumber) => {
  if (colNumber <= 15) {
    console.log(`  Col ${colNumber}: ${cell.value}`);
  }
});
