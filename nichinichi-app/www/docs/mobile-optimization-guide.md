# Nichinichi 行動應用程式 (APK) 優化技術指南

本文件詳述將 `Nichinichi` 網頁版轉化為 Android APK 時，為確保極致的使用者體驗與符合「3秒記錄」核心精神，所需實施的優化點與技術方法。

## 1. 載入速度與性能優化 (Performance Optimization)

### 1.1 資源預加載與 Service Worker (Precaching)
*   **優化點**：解決 APK 開啟時的「白屏」或加載轉圈現象。
*   **技術方法**：
    *   利用 **Service Worker (Workbox)** 實施 `Precaching` 策略，將核心 UI 資產（JS, CSS, HTML, SVGs）存儲在設備本地。
    *   確保應用程式在離線狀態下也能瞬間啟動（Offline-first）。

### 1.2 Firestore 離線持久化 (Offline Persistence)
*   **優化點**：在網絡不穩定的移動端環境下，確保資料讀寫零延遲。
*   **技術方法**：
    *   啟用 Firestore 的 `enableIndexedDbPersistence()`。
    *   讓紀錄動作先寫入本地緩存，待聯網後自動後端同步。這對於維持「3秒紀錄規則」至關重要。

### 1.3 啟動畫面優化 (Splash Screen)
*   **優化點**：彌補 WebApp 在 WebView 初始化時的載入空檔。
*   **技術方法**：
    *   使用 Android 原生 Splash Screen API 顯示 Logo。
    *   在 Web 內容準備就緒前，切換到符合 MUJI 風格的簡約佔位圖（Skeleton Screen）。

---

## 2. 行動端 UX/UI 深度優化 (Mobile UX Refinement)

### 2.1 觸控目標與交互手勢 (Touch & Gestures)
*   **優化點**：適配大拇指操作，避免誤觸或操作困難。
*   **技術方法**：
    *   **放大點擊區域**：所有按鈕至少保持 44x44 dp 的點擊範圍（遵循 Apple/Google 規範）。
    *   **側滑返回 (Edge Swipe)**：實施手勢監聽，模擬原生 Android 的側滑返回行為，而非僅依賴 UI 上的返回鍵。

### 2.2 觸覺回饋 (Haptic Feedback)
*   **優化點**：提升紀錄成功後的「真實感」。
*   **技術方法**：
    *   在存檔成功、切換日期或觸發重要動作時，呼叫 `vibrate()` API 提供輕微的震動回饋。

### 2.3 避免縮放與長按菜單
*   **優化點**：防止 Web 特有的意外縮放破壞佈局。
*   **技術方法**：
    *   設定 `viewport` meta 標籤：`user-scalable=no`。
    *   CSS 禁止系統默認的長按選擇彈窗（除非在備註欄位）。

---

## 3. APK 封裝技術路徑 (Technical Stack)

### 3.1 推薦技術方案：Capacitor
*   **原因**：比起傳統 WebView，Capacitor 對於 PWA 的支援更現代，且能輕易擴展原生功能。
*   **關鍵功能**：
    *   **Status Bar 管理**：將狀態列改為透明或符合 MUJI 風格的灰白色調，使 App 視覺更統一。
    *   **Deep Linking**：支援從外部 URL 直接開啟特定的 /#/view/ 頁面。

### 3.2 替代方案：Trusted Web Activity (TWA)
*   **原因**：如果您希望 APK 大小極小，且完全依賴 Chrome 內核性能。
*   **限制**：對原生 API（如生物識別解鎖）的擴展性較差。

---

## 4. 進階原生整合 (Native Integration)

### 4.1 推播通知 (Notifications)
*   **功能**：每日記帳回顧與提醒。
*   **實施**：整合 Firebase Cloud Messaging (FCM)。通知今日記帳的總花費，來看看花了哪些？

---
*備註：所有優化應保持 MUJI 的極簡設計語彙，避免過度花哨的動畫影響效能。*
