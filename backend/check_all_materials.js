import { ExcelService } from './services/excelService.js';

const excelService = new ExcelService();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';

const wb = await excelService.readFile(filePath);

// Get purchases
const pmSheet = wb.getWorksheet('Purchased Material and WIP');
const purchases = {};
pmSheet.eachRow((row, rowNum) => {
  if (rowNum > 1) {
    const code = row.values[2];
    const qty = row.values[4];
    if (code && typeof qty === 'number') {
      purchases[code] = qty;
    }
  }
});

// Get sales
const salesRevenue = await excelService.getSalesRevenue(wb);
const sales = {};
salesRevenue.forEach(order => {
  const code = order['Product Code'];
  const qty = typeof order['Quantity'] === 'number' ? order['Quantity'] : parseFloat(order['Quantity']) || 0;
  if (code) {
    sales[code] = (sales[code] || 0) + qty;
  }
});

console.log('Material | Purchase | Sales | Ending | Status');
console.log('---------|----------|-------|--------|--------');

Object.keys(purchases).sort().forEach(code => {
  const purchase = purchases[code];
  const sale = sales[code] || 0;
  const ending = purchase - sale;
  const status = sale > purchase ? '❌ ERROR' : ending < 0 ? '⚠️ NEGATIVE' : '✓ OK';
  console.log(`${code}     | ${purchase.toString().padStart(8)} | ${sale.toString().padStart(5)} | ${ending.toString().padStart(6)} | ${status}`);
});
