import { COGSService } from './services/cogsService.js';
import { ExcelService } from './services/excelService.js';

const cogsService = new COGSService();
const excelService = new ExcelService();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';

const wb = await excelService.readFile(filePath);
const cogsData = await cogsService.generateCOGSDetail(filePath);

console.log('COGS Detail Results:');
console.log(`Total COGS Quantity: ${cogsData.totalQuantity}`);
console.log(`Sales Order Total Qty: ${cogsData.salesOrderTotalQty}`);
console.log(`Quantity Matches: ${cogsData.quantityMatches}`);
console.log(`Difference: ${cogsData.quantityDifference}`);
console.log(`Total COGS Amount: $${cogsData.totalCOGS.toFixed(2)}`);

console.log('\nFirst 5 COGS items:');
cogsData.cogsDetails.slice(0, 5).forEach(item => {
  console.log(`${item.productCode}: Qty=${item.quantity}, Amount=$${item.lineCOGS.toFixed(2)}`);
});
