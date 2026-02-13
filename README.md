# 日日記 | Nichi-Nichi Log

**Nichi-Nichi Log** is a minimalist, privacy-first bookkeeping application specifically designed for residents and travelers in Japan. Unlike generic finance apps, it preserves the original currency of every transaction, simplifying life in a dual-currency environment without the constant stress of fluctuating exchange rates.

*日日記 (Nichi-Nichi Log) 是一款專為在日生活與旅遊者設計的極簡記帳應用，強調原始幣別紀錄與隱私保護。*

---

## 🌟 Key Features

### 1. True Dual-Currency Recording
Record transactions exactly as they happen—whether in **JPY** or **TWD**. The app stores the original currency and amount separately from the display conversion, ensuring your accounting remains accurate over time, regardless of exchange rate shifts.
*支援日幣與台幣的原始幣別紀錄，讓支出數據不受匯率波動干擾。*

### 2. Offline-First PWA (Progressive Web App)
Install it on your home screen without a download. Built with PWA technology, it works perfectly in offline environments (like the Tokyo Metro). Your data is saved locally and synced to the cloud automatically once you're back online.
*基於 PWA 技術，支援離線記帳與背景自動同步，體驗如同原生 App 般順暢。*

### 3. Social Ledger & Split Billing
Manage complex group expenses with ease. Track "Who paid what" and "Who owes whom" with integrated debt calculation. Ideal for students sharing rent or travelers splitting dinner bills.
*整合社交分帳與債務計算，輕鬆管理合租或旅伴間的代墊與拆帳。*

### 4. Data Sovereignty & Portability
Your data belongs to you. Export your history as a **CSV** for spreadsheet analysis or a **JSON** file for full system restoration. You can even generate custom **Public Links** to share your travel expenses as a guide for others.
*掌握資料主權，支援一鍵匯出 CSV 報表或 JSON 備份，並可產生公開連結分享花費攻略。*

### 5. Minimalist "Muji-Style" Aesthetics
A clean, distraction-free interface inspired by Japanese minimalism. Low-saturation tones and generous white space reduce the psychological burden of daily bookkeeping.
*採用日系極簡美學設計，低飽和色調與大留白介面，讓記帳變得無壓力。*

---

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API), Vite, Tailwind CSS.
- **Backend**: Firebase Authentication, Cloud Firestore.
- **Service**: Service Worker (PWA), Chart.js (Visualization), JSZip (Data Export).

*技術架構採 Vue 3 搭配 Firebase 雲端服務，並利用 Service Worker 實現離線支援與 JSZip 處理資料匯出。*

---

## 🚀 Local Development

Ensure you have [Node.js](https://nodejs.org/) installed.

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/keicha2025/nichi-nichi.git
    cd nichi-nichi
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Start development server**:
    ```bash
    npm run dev
    ```
4.  **Firebase Setup**:
    The application requires a Firebase project. Ensure your Firebase configuration is correctly set up in the environment or configuration files to enable Auth and Firestore features.

*透過 npm 安裝依賴後即可啟動 Vite 開發伺服器。需連結開發者自備的 Firebase 雲端專案。*

---

## 🔒 Privacy & Security

Nichi-Nichi Log is designed with data ownership at its core. Every record is stored within **your own** Firebase instance. The developers have no access to your financial data or personal records.

*隱私與安全：所有資料均儲存在使用者私人的 Firebase 帳戶中，開發者無法存取。*

---

## 📄 License

This project is licensed under the ISC License.

*本專案採用 ISC 授權協議進行開發。*
