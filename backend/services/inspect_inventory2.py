import openpyxl

file_path = r"E:\OneDrive\OD-2018 US\2026 vibe coding web design\2-KOLI Simulation\PeriodData_201701_KOLI0212_202602121957 SUCCESS -  0304.xlsx"
wb = openpyxl.load_workbook(file_path)
sheet = wb['Purchased Material and WIP']

# Get all headers
row1 = sheet[1]
headers = []
for cell in row1:
    if cell.value is None:
        break
    headers.append(cell.value)

print(f"Total columns: {len(headers)}")
print("All headers:")
for i, h in enumerate(headers, 1):
    print(f"  Column {i}: {h}")
