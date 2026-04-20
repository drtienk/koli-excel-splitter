import { calculateChecksum } from '../utils/checksumUtil.js';

export class ValidationService {
  validateSalesData(orders) {
    const validations = [];

    orders.forEach((order, index) => {
      const rowNum = index + 2;

      if (!order['Order No']) {
        validations.push({
          type: 'MISSING_ORDER_NO',
          severity: 'error',
          location: `Row ${rowNum}`,
          message: 'Order No is missing',
        });
      }

      if (!order['Quantity'] || typeof order['Quantity'] !== 'number') {
        validations.push({
          type: 'INVALID_QUANTITY',
          severity: 'error',
          location: `Row ${rowNum}`,
          message: `Invalid Quantity: ${order['Quantity']}`,
        });
      } else if (order['Quantity'] <= 0) {
        validations.push({
          type: 'ZERO_QUANTITY',
          severity: 'warning',
          location: `Row ${rowNum}`,
          message: `Quantity is zero or negative: ${order['Quantity']}`,
        });
      }

      if (!order['Amount'] || typeof order['Amount'] !== 'number') {
        validations.push({
          type: 'INVALID_AMOUNT',
          severity: 'error',
          location: `Row ${rowNum}`,
          message: `Invalid Amount: ${order['Amount']}`,
        });
      } else if (order['Amount'] < 0) {
        validations.push({
          type: 'NEGATIVE_AMOUNT',
          severity: 'warning',
          location: `Row ${rowNum}`,
          message: `Amount is negative: ${order['Amount']}`,
        });
      }

      if (order['Quantity'] > 0 && order['Amount'] >= 0) {
        const price = order['Amount'] / order['Quantity'];
        if (!isFinite(price)) {
          validations.push({
            type: 'PRICE_CALCULATION_ERROR',
            severity: 'error',
            location: `Row ${rowNum}`,
            message: `Price calculation resulted in invalid value: ${price}`,
            data: { amount: order['Amount'], quantity: order['Quantity'] },
          });
        }
      }
    });

    return validations;
  }

  validateMaterialsMapping(materials, orders) {
    const validations = [];
    const missingProducts = new Set();

    orders.forEach((order, index) => {
      const rowNum = index + 2;
      const productCode = order['Product Code'];

      if (!productCode) {
        validations.push({
          type: 'MISSING_PRODUCT_CODE',
          severity: 'error',
          location: `Row ${rowNum}`,
          message: 'Product Code is missing',
        });
      } else if (!materials[productCode]) {
        missingProducts.add(productCode);
      }
    });

    if (missingProducts.size > 0) {
      validations.push({
        type: 'MISSING_MATERIAL_COST',
        severity: 'error',
        location: 'Materials Mapping',
        message: `Missing cost data for products: ${Array.from(missingProducts).join(', ')}`,
      });
    }

    return validations;
  }

  createValidationReport(validations) {
    const errors = validations.filter((v) => v.severity === 'error');
    const warnings = validations.filter((v) => v.severity === 'warning');

    return {
      status: errors.length > 0 ? 'error' : 'warning',
      validations,
      summary: {
        total_errors: errors.length,
        total_warnings: warnings.length,
        is_valid: errors.length === 0,
      },
    };
  }

  createFinancialSummary(revenue, cogs, materials, resources) {
    const totalRevenue = revenue.reduce((sum, order) => {
      const amount = typeof order['Amount'] === 'number' ? order['Amount'] : parseFloat(order['Amount']) || 0;
      return sum + amount;
    }, 0);

    // Group resources by description
    const expensesByType = {};
    resources.forEach((resource) => {
      const type = resource['(Resource description)'] || resource['Resource Code'];
      if (!expensesByType[type]) {
        expensesByType[type] = 0;
      }
      const amount = typeof resource['Amount'] === 'number' ? resource['Amount'] : parseFloat(resource['Amount']) || 0;
      expensesByType[type] += amount;
    });

    const totalExpenses = Object.values(expensesByType).reduce((sum, val) => sum + (typeof val === 'number' ? val : parseFloat(val) || 0), 0);
    const grossProfit = totalRevenue - cogs;
    const netProfit = grossProfit - totalExpenses;

    return {
      total_revenue: totalRevenue,
      total_cogs: cogs,
      gross_profit: grossProfit,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      expenses_breakdown: expensesByType,
    };
  }

  createMetadata(originalChecksum, summary, materialsMapping) {
    return {
      original_checksum: originalChecksum,
      split_timestamp: new Date().toISOString(),
      summary,
      materials_mapping: materialsMapping,
    };
  }

  verifyMergedFile(originalData, mergedData) {
    const differences = [];

    // Check revenue totals
    const origRevenue = originalData.totalRevenue || 0;
    const mergedRevenue = mergedData.totalRevenue || 0;
    if (Math.abs(origRevenue - mergedRevenue) > 0.01) {
      differences.push({
        field: 'Total Revenue',
        original: origRevenue,
        merged: mergedRevenue,
        difference: mergedRevenue - origRevenue,
      });
    }

    // Check order count
    const origOrderCount = originalData.orderCount || 0;
    const mergedOrderCount = mergedData.orderCount || 0;
    if (origOrderCount !== mergedOrderCount) {
      differences.push({
        field: 'Order Count',
        original: origOrderCount,
        merged: mergedOrderCount,
      });
    }

    return {
      is_valid: differences.length === 0,
      differences,
    };
  }
}
