import { COGSService } from './services/cogsService.js';

const cogsService = new COGSService();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';

const cogsData = await cogsService.generateCOGSDetail(filePath);

console.log('Backend COGS Data:');
console.log('  totalQuantity:', cogsData.totalQuantity);
console.log('  salesOrderTotalQty:', cogsData.salesOrderTotalQty);
console.log('  quantityMatches:', cogsData.quantityMatches);
console.log('  quantityDifference:', cogsData.quantityDifference);

// Simulate what api.js does
const cogsResult = {
  cogsDetails: cogsData.cogsDetails,
  totalCOGS: cogsData.totalCOGS,
  totalQuantity: cogsData.totalQuantity,
  salesOrderTotalQty: cogsData.salesOrderTotalQty,
  quantityMatches: cogsData.quantityMatches,
  quantityDifference: cogsData.quantityDifference,
};

console.log('\nSimulated API Response cogsResult:');
console.log('  totalQuantity:', cogsResult.totalQuantity);
console.log('  salesOrderTotalQty:', cogsResult.salesOrderTotalQty);
console.log('  quantityMatches:', cogsResult.quantityMatches);
console.log('  quantityDifference:', cogsResult.quantityDifference);
