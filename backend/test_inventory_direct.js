import { InventoryService } from './services/inventoryService.js';

const inventoryService = new InventoryService();
const filePath = process.argv[2];

try {
  const result = await inventoryService.generateInventoryDetail(filePath);
  console.log('[SUCCESS] Inventory generated');
  console.log('Result keys:', Object.keys(result));
  console.log('Inventory details count:', result.inventoryDetails.length);
} catch (error) {
  console.error('[ERROR]', error.message);
  console.error('Stack:', error.stack);
}
