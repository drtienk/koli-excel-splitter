import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

console.log('All sheets in workbook:');
wb.worksheets.forEach((sheet, i) => {
  console.log(`  ${i + 1}. "${sheet.name}"`);
});
