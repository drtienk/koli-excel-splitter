import ExcelJS from 'exceljs';

const wb = new ExcelJS.Workbook();
const filePath = 'E:/OneDrive/OD-2018 US/2026 vibe coding web design/2-KOLI Simulation/PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx';
await wb.xlsx.readFile(filePath);

// Check Purchased Material codes
const pmSheet = wb.getWorksheet('Purchased Material and WIP');
const pmCodes = new Set();
pmSheet.eachRow((row, rowNum) => {
  if (rowNum > 1 && row.values[2]) {
    pmCodes.add(row.values[2]);
  }
});
console.log('Material Codes in Purchased Material and WIP:', Array.from(pmCodes).sort());

// Check Sales Revenue product codes
const srSheet = wb.getWorksheet('Sales Revenue ');
const productCodes = {};
srSheet.eachRow((row, rowNum) => {
  if (rowNum > 1 && row.values[1]) {
    const headers = srSheet.getRow(1).values;
    const productCodeIndex = headers.indexOf('Product Code');
    const quantityIndex = headers.indexOf('Quantity');
    
    if (productCodeIndex && quantityIndex) {
      const code = row.values[productCodeIndex];
      const qty = row.values[quantityIndex];
      if (code) {
        productCodes[code] = (productCodes[code] || 0) + (typeof qty === 'number' ? qty : 0);
      }
    }
  }
});
console.log('\nProduct Codes in Sales Revenue and total qty:');
Object.keys(productCodes).sort().forEach(code => {
  console.log(`  ${code}: ${productCodes[code]}`);
});

// Check Purchase quantities
console.log('\nMaterial Purchase Quantities in Purchased Material and WIP:');
const pmQuantities = {};
pmSheet.eachRow((row, rowNum) => {
  if (rowNum > 1) {
    const matCode = row.values[2];
    const qty = row.values[4];
    if (matCode && typeof qty === 'number') {
      pmQuantities[matCode] = (pmQuantities[matCode] || 0) + qty;
    }
  }
});
Object.keys(pmQuantities).sort().forEach(code => {
  console.log(`  ${code}: ${pmQuantities[code]}`);
});
