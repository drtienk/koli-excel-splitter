import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

const sheet = wb.getWorksheet('Sales Revenue ');
const row1 = sheet.getRow(1);

console.log('Row 1 values:');
row1.eachCell((cell, colNum) => {
  console.log(`  [${colNum}]: "${cell.value}"`);
});

console.log('\nRow 1 values with slice(1):');
const sliced = row1.values.slice(1);
sliced.forEach((val, idx) => {
  console.log(`  [${idx}]: "${val}"`);
});

console.log('\nRow 2 values:');
const row2 = sheet.getRow(2);
row2.eachCell((cell, colNum) => {
  console.log(`  [${colNum}]: "${cell.value}"`);
});

console.log('\nRow 2 values with slice(1):');
const row2vals = row2.values.slice(1);
row2vals.forEach((val, idx) => {
  console.log(`  [${idx}]: "${val}"`);
});
