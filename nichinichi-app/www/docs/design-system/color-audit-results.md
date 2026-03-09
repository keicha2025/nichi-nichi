# 全站點顏色審核報告 (Color Audit Report)

本報告根據「方案 C (混合模式)」執行，掃描了所有的 CSS、JavaScript 與 HTML 檔案，識別出全站使用的顏色數值與 Tailwind Tokens。

## 審核摘要

| 統計項目 | 數值 |
| :--- | :--- |
| **唯一顏色值總數** | 72 種 |
| **總出現次數** | 1000+ 次 |
| **主要色彩系統** | Tailwind Gray Scale (50-900) |
| **品牌主色** | `#4A4A4A` (var: `--color-primary`) |

### 核心觀察
1. **Tailwind 依賴度高**: 大部分的 UI 顏色使用 Tailwind 的 `text-gray-*` 或 `bg-gray-*` 類別，而非直接使用 `design-tokens.css` 中的變數。
2. **硬編碼品牌色**: 雖然定義了 `--color-primary`，但仍有超過 60 處直接實寫了 `#4A4A4A`。
3. **特定用途色彩**: 在 `settings-page.js` 中發現了專用於 Google 圖示的品牌色（#4285F4 等）。
4. **掃描排除範圍**: 已自動排除 `archive_` 與 `legacy` 資料夾，確保數據準確。

---

## 顏色審核明細表

| 原始顏色值 / Token | 用途分類 | 檔案範例 (部分列出) | 出現次數 |
| :--- | :--- | :--- | :--- |
| `text-gray-400` | Text, Background | [import-page.js](../../js/pages/import-page.js) | 181 |
| `bg-gray-50` | Background | [system-modal.js](../../js/components/system-modal.js) | 95 |
| `text-gray-300` | Text, Background | [app-header.js](../../js/components/app-header.js) | 72 |
| `border-gray-50` | Border, Text | [view-settings-page.js](../../js/pages/view-settings-page.js) | 64 |
| `#4A4A4A` | Brand Primary | [theme.js](../../js/theme.js), [design-tokens.css](../../css/design-tokens.css) | 61 |
| `text-gray-600` | Text | [edit-page.js](../../js/pages/edit-page.js) | 57 |
| `text-gray-500` | Text | [import-page.js](../../js/pages/import-page.js) | 51 |
| `text-gray-700` | Text | [overview-page.js](../../js/pages/overview-page.js) | 41 |
| `border-gray-100` | Border | [icon-edit-page.js](../../js/pages/icon-edit-page.js) | 37 |
| `text-gray-800` | Text | [app-footer.js](../../js/components/app-footer.js) | 22 |
| `var(--color-border-medium)` | Border | [markdown-body.css](../../css/markdown-body.css) | 10 |
| `text-red-300` | Status/Danger | [edit-page.js](../../js/pages/edit-page.js) | 3 |
| `#FDFCFB` | Background Main | [README.md](../../README.md) | 5 |
| `#16A34A` | Google Green | [theme.js](../../js/theme.js) | 2 |

---

## 驗證紀錄

透過自動化腳本提取與人工對比，確認報表準確反映了當前代碼庫的色彩分佈。
