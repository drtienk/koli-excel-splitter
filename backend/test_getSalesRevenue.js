import { ExcelService } from './services/excelService.js';

const excelService = new ExcelService();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';

const wb = await excelService.readFile(filePath);
const salesRevenue = await excelService.getSalesRevenue(wb);

console.log(`Total sales orders: ${salesRevenue.length}`);

// Count by product code
const productQty = {};
salesRevenue.forEach(order => {
  const code = order['Product Code'];
  const qty = typeof order['Quantity'] === 'number' ? order['Quantity'] : parseFloat(order['Quantity']) || 0;
  if (code) {
    productQty[code] = (productQty[code] || 0) + qty;
  }
});

console.log('\nProduct Code Totals from getSalesRevenue:');
['P01', 'P02', 'P03'].forEach(code => {
  console.log(`  ${code}: ${productQty[code] || 0}`);
});

// Show first few orders
console.log('\nFirst 5 orders:');
salesRevenue.slice(0, 5).forEach((order, i) => {
  console.log(`  ${i}: ${order['Order No']} - ${order['Product Code']} - Qty: ${order['Quantity']}`);
});
