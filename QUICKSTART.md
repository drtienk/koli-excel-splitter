# Quick Start Guide

## 本地運行

### 1️⃣ 安裝依賴

**後端：**
```bash
cd backend
npm install
```

**前端：**
```bash
cd frontend
npm install
```

### 2️⃣ 啟動應用

**終端 1 - 啟動後端：**
```bash
cd backend
npm start
```
後端將在 `http://localhost:5000` 運行

**終端 2 - 啟動前端：**
```bash
cd frontend
npm run dev
```
前端將在 `http://localhost:3000` 運行

### 3️⃣ 打開瀏覽器

訪問 `http://localhost:3000`

---

## 功能演示

### 📊 分拆Excel文件

1. 點擊 **"Split File"** 頁籤
2. 上傳你的KOLI Excel文件
3. 系統會自動：
   - ✓ 提取銷售訂單數據
   - ✓ 計算銷貨成本 (COGS)
   - ✓ 生成Income Statement
   - ✓ 生成Sales Order清單
4. 查看驗證報告（如有錯誤會顯示）
5. 點擊下載按鈕下載兩個分拆的Excel文件

### 📥 合併Excel文件

1. 點擊 **"Merge Files"** 頁籤
2. 選擇Income Statement文件
3. 選擇Sales Order文件
4. 點擊 **"Merge Files"** 按鈕
5. 系統會驗證checksum是否相符
6. 下載合併後的文件

---

## 檔案說明

### 生成的文件

**Income Statement.xlsx**
- 營收 (Total Sales Revenue)
- 銷貨成本 (Cost of Goods Sold)
- 毛利 (Gross Profit)
- 營業費用分類：
  - 薪資費用 (Salary Expense)
  - 旅行費用 (Travel Expense)
  - 其他費用
- 淨利 (Net Profit)

**Sales Order.xlsx**
- Order No - 訂單編號
- Customer Code - 客戶代碼
- Product Code - 產品代碼
- Quantity - 數量
- Unit Price - 單價 (自動計算)
- Total Amount - 總金額

---

## 驗證規則

系統會檢查以下項目：

✅ **必填項**
- 訂單編號不能為空
- 數量必須 > 0
- 金額必須 ≥ 0

✅ **數據類型**
- 數量和金額必須是有效的數字

✅ **計算結果**
- 單價計算不能產生NaN或Infinity
- 不能產生負數

✅ **一致性**
- 合併後的營收總額應該等於原始值

---

## 常見錯誤排查

### "Invalid Quantity" / "Invalid Amount"
- 原因：Excel格式化的數字（如含千位分隔符）
- 解決：這是正常的提示，系統會自動轉換並進行計算

### "Missing Material Cost"
- 原因：某個產品代碼在材料清單中找不到
- 解決：檢查Excel中的材料映射是否完整

### "Checksum不符"
- 原因：合併的文件數據與原始不匹配
- 解決：確認你上傳的是同一次分拆出的文件

---

## 技術詳情

### 計算公式

```
營收 = SUM(所有訂單金額)
銷貨成本 = SUM(產品單位成本 × 數量)
毛利 = 營收 - 銷貨成本
營業費用 = SUM(資源費用)
淨利 = 毛利 - 營業費用
```

### Checksum驗證
- 使用 SHA256 哈希
- 存儲在hidden metadata sheet中
- 合併時自動驗證完整性

---

## 後續功能建議

🔜 支持更多財務報表格式
🔜 批量文件處理
🔜 報表模板定制
🔜 導出PDF功能
🔜 數據趨勢分析

---

## 支持和反饋

如遇到問題，請檢查：
1. 驗證報告中的錯誤信息
2. 確認Excel文件格式正確
3. 檢查瀏覽器控制台是否有JavaScript錯誤

---

**Ready to split and merge? 開始使用吧! 🚀**
