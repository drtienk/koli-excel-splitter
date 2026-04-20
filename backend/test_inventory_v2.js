import { InventoryService } from './services/inventoryService.js';

const inventoryService = new InventoryService();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';

const result = await inventoryService.generateInventoryDetail(filePath);

console.log('Inventory Results:');
result.inventoryDetails.slice(0, 3).forEach(item => {
  console.log(`\n${item.materialCode}:`);
  console.log(`  Purchase: ${item.purchaseQty} units`);
  console.log(`  Sales: ${item.salesQty} units`);
  console.log(`  Ending: ${item.endingQty} units (${item.purchaseQty} - ${item.salesQty})`);
});
