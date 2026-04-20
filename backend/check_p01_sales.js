import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

const sheet = wb.getWorksheet('Sales Revenue ');
const headers = sheet.getRow(1).values;
const productCodeIdx = headers.indexOf('Product Code');
const quantityIdx = headers.indexOf('Quantity');
const orderNoIdx = headers.indexOf('Order No');

console.log('All P01 sales orders:');
let p01Total = 0;
let p01Count = 0;
sheet.eachRow((row, rowNum) => {
  if (rowNum > 1) {
    const productCode = row.values[productCodeIdx];
    const qty = row.values[quantityIdx];
    if (productCode === 'P01') {
      p01Count++;
      p01Total += typeof qty === 'number' ? qty : 0;
      const orderNo = row.values[orderNoIdx];
      console.log(`  Order ${orderNo}: ${qty} units (row ${rowNum})`);
    }
  }
});
console.log(`\nTotal P01 sales orders: ${p01Count}`);
console.log(`Total P01 quantity: ${p01Total}`);
