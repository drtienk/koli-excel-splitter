import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

const sheet = wb.getWorksheet('Sales Revenue ');
const row1 = sheet.getRow(1).values;
const orderNoIdx = row1.indexOf('Order No');

const orderPrefixes = new Set();
sheet.eachRow((row, rowNum) => {
  if (rowNum > 1 && row.values[orderNoIdx]) {
    const orderNo = row.values[orderNoIdx];
    const prefix = orderNo.toString().substring(0, 9); // SO-202401
    orderPrefixes.add(prefix);
  }
});

console.log('Order prefixes found:');
Array.from(orderPrefixes).sort().forEach(prefix => {
  console.log(`  ${prefix}`);
});
