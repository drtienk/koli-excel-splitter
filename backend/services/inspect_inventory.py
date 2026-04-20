import openpyxl
import sys

file_path = r"E:\OneDrive\OD-2018 US\2026 vibe coding web design\2-KOLI Simulation\PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx"
wb = openpyxl.load_workbook(file_path)
sheet = wb['Purchased Material and WIP']

# Print headers
headers = [cell.value for cell in sheet[1]]
print("Headers in 'Purchased Material and WIP':")
for i, h in enumerate(headers, 1):
    print(f"  Column {i}: {h}")

# Print first 3 data rows to see structure
print("\nFirst 3 data rows:")
for row_idx in range(2, 5):
    row_data = [cell.value for cell in sheet[row_idx]]
    print(f"Row {row_idx}: {row_data[:10]}")  # First 10 columns
