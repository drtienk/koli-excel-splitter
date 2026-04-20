import { InventoryService } from './services/inventoryService.js';
import { ExcelService } from './services/excelService.js';

const excelService = new ExcelService();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';

const wb = await excelService.readFile(filePath);
const salesRevenue = await excelService.getSalesRevenue(wb);

// Count P01 manually
const p01Sales = salesRevenue.filter(o => o['Product Code'] === 'P01');
console.log(`P01 orders from getSalesRevenue: ${p01Sales.length}`);
console.log('Details:');
let total = 0;
p01Sales.forEach(o => {
  const qty = typeof o['Quantity'] === 'number' ? o['Quantity'] : parseFloat(o['Quantity']) || 0;
  total += qty;
  console.log(`  ${o['Order No']}: ${o['Quantity']} (parsed: ${qty})`);
});
console.log(`Total: ${total}`);
