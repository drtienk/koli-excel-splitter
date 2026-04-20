import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

const sheet = wb.getWorksheet('Sales Revenue ');
const row1 = sheet.getRow(1).values;
const productIdx = row1.indexOf('Product Code');
const qtyIdx = row1.indexOf('Quantity');
const orderIdx = row1.indexOf('Order No');

console.log('All P01 orders in Sales Revenue:');
let total = 0;
let count = 0;
sheet.eachRow((row, rowNum) => {
  if (rowNum > 1 && row.values[productIdx] === 'P01') {
    const qty = row.values[qtyIdx];
    const orderNo = row.values[orderIdx];
    count++;
    total += typeof qty === 'number' ? qty : parseFloat(qty) || 0;
    console.log(`  ${orderNo}: ${qty}`);
  }
});
console.log(`\nTotal P01 orders: ${count}`);
console.log(`Total P01 quantity: ${total}`);

// Also check Purchased Material
console.log('\n---\nPurchased Material P01:');
const pmSheet = wb.getWorksheet('Purchased Material and WIP');
pmSheet.eachRow((row, rowNum) => {
  if (rowNum > 1 && row.values[2] === 'P01') {
    console.log(`  Material Code: ${row.values[2]}, Quantity: ${row.values[4]}`);
  }
});
