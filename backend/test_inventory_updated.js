import { InventoryService } from './services/inventoryService.js';

const inventoryService = new InventoryService();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';

const result = await inventoryService.generateInventoryDetail(filePath);

console.log('Updated Inventory Results:');
console.log(`Total Purchase Qty: ${result.totalPurchaseQty}`);
console.log(`Total Ending Qty: ${result.totalEndingQty}`);
console.log(`Total Purchase Amount: $${result.totalPurchaseAmount.toFixed(2)}`);
console.log(`Total Ending Amount: $${result.totalEndingAmount.toFixed(2)}`);

console.log('\nFirst 5 items:');
result.inventoryDetails.slice(0, 5).forEach(item => {
  console.log(`${item.materialCode}: Purchase=${item.purchaseQty}, Sales=${item.salesQty}, Ending=${item.endingQty}`);
});
