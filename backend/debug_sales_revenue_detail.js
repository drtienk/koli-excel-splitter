import { ExcelService } from './services/excelService.js';

const excelService = new ExcelService();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';

const wb = await excelService.readFile(filePath);
const salesRevenue = await excelService.getSalesRevenue(wb);

// Find all P01 orders
const p01Orders = salesRevenue.filter(order => order['Product Code'] === 'P01');
console.log(`P01 Orders count: ${p01Orders.length}`);
console.log('P01 Orders:');
p01Orders.forEach((order, i) => {
  console.log(`  ${i}: ${order['Order No']} - Qty: ${order['Quantity']} (type: ${typeof order['Quantity']})`);
});

console.log(`\nTotal P01 Quantity: ${p01Orders.reduce((sum, o) => sum + (typeof o['Quantity'] === 'number' ? o['Quantity'] : parseFloat(o['Quantity']) || 0), 0)}`);
