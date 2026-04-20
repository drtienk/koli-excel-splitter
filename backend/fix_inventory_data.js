import ExcelJS from 'exceljs';

const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
const wb = new ExcelJS.Workbook();
await wb.xlsx.readFile(filePath);

// Get sales by product
const srSheet = wb.getWorksheet('Sales Revenue ');
const sales = {};
srSheet.eachRow((row, rowNum) => {
  if (rowNum > 1) {
    const code = row.values[3];
    const qty = typeof row.values[4] === 'number' ? row.values[4] : parseFloat(row.values[4]) || 0;
    if (code) {
      sales[code] = (sales[code] || 0) + qty;
    }
  }
});

console.log('Sales quantities:');
Object.entries(sales).sort().forEach(([code, qty]) => {
  console.log(`  ${code}: ${qty}`);
});

// Update Purchased Material and WIP
const pmSheet = wb.getWorksheet('Purchased Material and WIP');
const changes = [];

pmSheet.eachRow((row, rowNum) => {
  if (rowNum > 1) {
    const matCode = row.values[2];
    const oldQty = row.values[4];
    const oldAmount = row.values[5];
    
    if (matCode && sales[matCode]) {
      const newQty = sales[matCode];
      const unitCost = oldAmount / oldQty;
      const newAmount = newQty * unitCost;
      
      // Update the row
      row.getCell(4).value = newQty;
      row.getCell(5).value = newAmount;
      
      changes.push({
        code: matCode,
        oldQty,
        newQty,
        oldAmount: oldAmount.toFixed(2),
        newAmount: newAmount.toFixed(2),
        unitCost: unitCost.toFixed(2)
      });
    }
  }
});

console.log('\nChanges made:');
console.log('Code | Old Qty | New Qty | Old Amount | New Amount | Unit Cost');
console.log('-----|---------|---------|------------|------------|----------');
changes.forEach(c => {
  console.log(`${c.code}   | ${c.oldQty.toString().padStart(7)} | ${c.newQty.toString().padStart(7)} | ${c.oldAmount.padStart(10)} | ${c.newAmount.padStart(10)} | ${c.unitCost}`);
});

// Save the file
await wb.xlsx.writeFile(filePath);
console.log('\n✓ File saved successfully!');
