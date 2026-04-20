import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

const sheet = wb.getWorksheet('Sales Revenue ');

console.log('Row 1 (Headers) with exact column numbers:');
sheet.getRow(1).eachCell({includeEmpty: false}, (cell, colNum) => {
  console.log(`  Col ${colNum}: "${cell.value}"`);
});

console.log('\nRow 2 (First data row) with exact values:');
sheet.getRow(2).eachCell({includeEmpty: false}, (cell, colNum) => {
  console.log(`  Col ${colNum}: "${cell.value}"`);
});

console.log('\n---Finding all P01---');
sheet.eachRow((row, rowNum) => {
  if (rowNum > 1) {
    const col3 = row.getCell(3).value;
    const col4 = row.getCell(4).value;
    if (col3 === 'P01') {
      console.log(`Row ${rowNum}: Col3="${col3}", Col4="${col4}"`);
    }
  }
});
