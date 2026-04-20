import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

const sheet = wb.getWorksheet('Purchased Material and WIP');

console.log('Max column:', sheet.maxColumn);
console.log('Max row:', sheet.maxRow);

const firstRow = sheet.getRow(1);
console.log('\nAll header columns:');
for (let col = 1; col <= Math.min(20, sheet.maxColumn); col++) {
  const cell = firstRow.getCell(col);
  console.log(`  Col ${col}: "${cell.value}"`);
}

const secondRow = sheet.getRow(2);
console.log('\nAll values in first data row:');
for (let col = 1; col <= Math.min(20, sheet.maxColumn); col++) {
  const cell = secondRow.getCell(col);
  console.log(`  Col ${col}: ${cell.value}`);
}
