# KOLI Excel Splitter

A full-stack web application for splitting and merging KOLI Excel files with intelligent calculations and comprehensive validation.

## Features

✨ **File Splitting**
- Extract Sales Order data with automatic unit price calculation
- Generate Income Statement with intelligent expense categorization
- Automatic COGS calculation based on material costs
- Gross profit and net profit calculations

✨ **File Merging**
- Merge split files back to original structure
- SHA256 checksum verification for file integrity
- Revenue consistency validation
- Detailed verification reports

✨ **Validation & Error Detection**
- Real-time validation during upload
- Detection of calculation errors (NaN, Infinity, negative values)
- Material cost mapping validation
- Comprehensive error and warning reports

## Project Structure

```
koli-excel-splitter/
├── backend/              # Node.js + Express server
│   ├── services/        # Core business logic
│   ├── routes/          # API endpoints
│   ├── utils/           # Utilities (checksum, validation)
│   ├── server.js        # Main server
│   └── package.json
├── frontend/            # React + TypeScript UI
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── App.tsx     # Main app
│   │   └── App.css     # Styles
│   ├── public/         # Static files
│   └── package.json
└── README.md
```

## Installation

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server will run on http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on http://localhost:3000

## API Endpoints

### POST /api/upload
Upload and preview Excel file

**Response:**
```json
{
  "status": "success",
  "preview": {
    "fileName": "file.xlsx",
    "fileId": "unique-id",
    "salesRevenue": [...],
    "salesRevenueCount": 197
  }
}
```

### POST /api/split
Split file into Income Statement and Sales Order

**Response:**
```json
{
  "status": "success",
  "fileId": "unique-id",
  "validation": {...},
  "metadata": {...},
  "downloads": {
    "incomeStatement": "/api/download/is-*.xlsx",
    "salesOrder": "/api/download/so-*.xlsx"
  }
}
```

### POST /api/merge
Merge two split files

**Response:**
```json
{
  "status": "success",
  "fileId": "unique-id",
  "verification": {
    "is_valid": true,
    "revenue_match": true,
    "checksum": "sha256-hash"
  },
  "download": "/api/download/merged-*.xlsx"
}
```

### GET /api/download/:filename
Download generated file

## Usage

### Splitting a File
1. Go to "Split File" tab
2. Upload your KOLI Excel file
3. Review validation report for any errors
4. Download Income Statement and Sales Order files

### Merging Files
1. Go to "Merge Files" tab
2. Select Income Statement and Sales Order files
3. System verifies files match using checksum
4. Download merged file with verification report

## Technical Details

### Income Statement Calculation
```
Total Revenue = SUM(Sales Amount)
COGS = SUM(Product Unit Cost × Quantity)
Gross Profit = Revenue - COGS
Operating Expenses = SUM(Resource Amounts)
Net Profit = Gross Profit - Operating Expenses
```

### Sales Order Fields
- Order No
- Customer Code
- Product Code
- Quantity
- Unit Price (Amount ÷ Quantity)
- Total Amount

### Validation Rules
1. All order data must have valid Quantity and Amount (> 0)
2. Unit price calculation must result in finite numbers
3. All product codes must have material cost mapping
4. Merged files must pass checksum verification

### Checksum Verification
- Original file checksum stored in metadata
- Merged file checksum calculated from sales and summary data
- Revenue totals must match within 0.01 tolerance

## Error Handling

### Common Errors
- **MISSING_ORDER_NO**: Order number is empty
- **INVALID_QUANTITY**: Quantity is not a valid number
- **PRICE_CALCULATION_ERROR**: Unit price is NaN or Infinity
- **MISSING_MATERIAL_COST**: Product code not found in materials mapping
- **FILE_MISMATCH**: Merged files don't have matching checksums

## Development

### Backend Architecture
- **excelService.js**: Excel file reading/writing
- **splitterService.js**: File splitting logic
- **mergerService.js**: File merging logic
- **validationService.js**: Data validation and checksum

### Frontend Components
- **FileUpload**: File upload and split
- **MergeUpload**: File merge interface
- **ValidationReport**: Display validation results
- **App.tsx**: Main application and routing

## Testing

### Test Split Function
1. Upload the sample KOLI Excel file
2. Verify Income Statement calculations
3. Check Sales Order data accuracy
4. Review validation report

### Test Merge Function
1. Download split files from split operation
2. Upload to merge function
3. Verify checksum matches
4. Validate revenue consistency

### Test Validation
1. Try uploading file with missing data
2. Verify error detection works
3. Check warning messages for edge cases

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License
MIT

## Support
For issues or questions, please refer to the validation reports for detailed error messages.
