# Design Tokens v1.0: Enterprise Specification

本規範定義了專案的旗艦級設計系統色彩架構。採用三層 Token 結構並針對暗色模式、互動狀態及企業級治理進行優化。

---

## 1. Primitive Layer (基礎色階)
基礎色階為「單一數據源」，僅定義數值而不具備語義。

### Gray Scale (Neutrals)
| Token | HEX | Mapping Origin |
| :--- | :--- | :--- |
| `p-gray-50` | `#F9FAFB` | Tailwind Gray-50 |
| `p-gray-100` | `#F3F4F6` | Tailwind Gray-100 |
| `p-gray-200` | `#E5E7EB` | Tailwind Gray-200 |
| `p-gray-300` | `#D1D5DB` | Tailwind Gray-300 |
| `p-gray-400` | `#9CA3AF` | Tailwind Gray-400 |
| `p-gray-500` | `#6B7280` | Tailwind Gray-500 |
| `p-gray-600` | `#4B5563` | Tailwind Gray-600 |
| `p-gray-700` | `#374151` | Tailwind Gray-700 |
| `p-gray-800` | `#1F2937` | Tailwind Gray-800 |
| `p-gray-900` | `#111827` | Tailwind Gray-900 |

### Brand Scale (Core)
| Token | HEX | Description |
| :--- | :--- | :--- |
| `p-brand-100` | `#EBEBEB` | 超淺品牌色 |
| `p-brand-500` | `#4A4A4A` | **官方品牌主色** |
| `p-brand-700` | `#333333` | 深品牌色 |
| `p-brand-900` | `#1A1A1A` | 極深品牌色 |

### Functional Scale
- **Success (Green)**: `p-success-100` (#F0FDF4), `p-success-500` (#22C55E), `p-success-700` (#15803D)
- **Danger (Red)**: `p-danger-100` (#FEF2F2), `p-danger-500` (#EF4444), `p-danger-700` (#B91C1C)
- **Warning (Amber)**: `p-warn-100` (#FFFBEB), `p-warn-500` (#F59E0B), `p-warn-700` (#B45309)
- **Info (Blue)**: `p-info-100` (#EFF6FF), `p-info-500` (#3B82F6), `p-info-700` (#1D4ED8)

---

## 2. Semantic Layer (功能語義)
本層級為開發引用的標準，支援 **Light/Dark** 轉換。

### Core Roles
| Token | Light Value | Dark Value | Intent |
| :--- | :--- | :--- | :--- |
| `txt-primary` | `p-gray-900` | `p-gray-50` | 主要內文 (High Contrast) |
| `txt-secondary` | `p-gray-500` | `p-gray-400` | 次要描述 |
| `txt-muted` | `p-gray-400` | `p-gray-600` | 禁用的文字/裝飾 |
| `bg-main` | `#FDFCFB` | `p-gray-900` | 頁面背景 |
| `bg-canvas` | `p-white` | `p-gray-800` | 卡片/彈窗背景 |
| `bdr-default` | `p-gray-200` | `p-gray-700` | 標準邊框 |

### Interaction Roles (互動狀態)
| Token | Light Value | Dark Value | Implementation |
| :--- | :--- | :--- | :--- |
| `action-primary-bg` | `p-brand-500` | `p-gray-100` | 主要操作背景 |
| `action-primary-hover` | `p-brand-700` | `p-white` | 懸停狀態 |
| `action-primary-text` | `p-white` | `p-gray-900` | 主要操作文字 |
| `focus-ring` | `p-info-500` | `p-info-400` | 焦點環顏色 |
| `state-disabled` | `rgba(0,0,0,0.1)` | `rgba(255,255,255,0.1)` | 禁用遮罩 |

---

## 3. Component Token Matrix (組件矩陣)
針對特定 UI 組件的映射規例。

| Component | Token Name | Maps To |
| :--- | :--- | :--- |
| **Button** | `button-primary-bg` | `action-primary-bg` |
| | `button-primary-hover` | `action-primary-hover` |
| **Input** | `input-bg` | `bg-canvas` |
| | `input-border-focus` | `focus-ring` |
| **Badge** | `badge-success-bg` | `p-success-100` |
| | `badge-success-text` | `p-success-700` |

---

## 4. Governance & Technical Implementation

###治理政策 (Governance)
1. **Token Freeze**: 每季進行一次 Token 審核，非經設計團隊批准不得新增硬編碼顏色。
2. **Linting Rules**:
   - `disallow-hex`: 禁止在 CSS/JS 中直接使用 HEX。
   - `disallow-raw-tailwind`: 禁止在組件中使用 `text-gray-400`，必須使用 `text-txt-secondary`。
3. **CI 強制執行**: 提交代碼時由 Linter 掃描，發現 HEX 或非語義化 Tailwind 類別則 Build Fail。

---

## 5. Automated Migration Plan

### Regex Replacement Strategy
- **P0**: `#[4A4A4A]` → `var(--action-primary-bg)`
- **P1**: `text-gray-400` → `text-txt-secondary`
- **P2**: `bg-gray-50` → `bg-bg-subtle`
