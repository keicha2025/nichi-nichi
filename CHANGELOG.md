## [2026-03-06] Calculator, Predictive Input & Word Cloud

### Added
- **Word Cloud 5-Level Visual Hierarchy**:
    - Implemented a sophisticated 5-level hierarchy based on frequency rank.
    - Added non-linear power scaling (`normalized^0.6`) for dramatic font size contrast.
    - Dynamic font weights (300 to 600) and color/opacity mapping for multi-dimensional emphasis.
    - Implemented **Archimedean Spiral Layout** (`r = k * theta`) for the Word Cloud, starting from the absolute center.
    - Restricted **Level 1** to strictly the single highest-weighted keyword, forced at `(0,0)`.
    - Improved collision detection for smoother spiral flow from the origin.
    - Added z-index control to ensure priority keywords remain on top.
    - **Word Cloud Dual-Dimension Toggle**:
        - Implemented a cycling toggle to switch between **Frequency** (count) and **Amount** (total personal share) dimensions.
        - Added micro-interactions with smooth icon transitions (`monetization_on`, `format_list_numbered`) and scale animations.
        - Optimized visual scaling with a level-based "stepped" font size system to ensure container fullness.
        - Fixed icon display by correcting the Material Symbols class to `rounded`.
        - Resolved keyword overlap by refining the Archimedean spiral collision detection (adjusted character width multiplier to 1.05 for Chinese characters).
        - Achieved "average distribution" by implementing a dynamic growth factor `k` and golden-angle jitter, ensuring keywords fill the container more evenly regardless of the word count.
        - Strengthened word cloud expansion with an aggressive growth multiplier and "Radial Level Push" for lower-priority keywords, ensuring the full 340px container area is utilized.
        - Balanced word cloud spread and fixed overflow clipping by implementing width-aware boundary checks and a refined growth factor.
        - Eliminated keyword overlaps with "Precision Collision Logic": increased Chinese character buffer (1.2x), reduced spiral search step (0.1), and enforced a strict no-overlap placement rule (skipping keywords that cannot find a valid spot).
        - Fixed a major data aggregation bug where word cloud sizes were determined by alphabetical order instead of weight.
        - Improved fuzzy keyword grouping with automatic normalization (stripping trailing punctuation and symbols) and robust weight-based sorting.
- **Bug Fixes**:
    - **StatsPage**: Fixed `TypeError: Cannot read properties of undefined (reading 'length')` by restoring the `computed` property block and merging duplicate `methods`.
- **Radial Word Cloud Layout**:
    - Added a dynamic "Common Keywords" section with a Golden Angle Spiral layout.
    - Implemented intelligent grouping and substring merging (e.g., "mos breakfast" -> "mos").
    - Representative labels are automatically chosen based on highest input frequency.
- **Inline Calculator for AddPage**: Integrated a minimalist, toggleable calculator directly next to the amount input field.
  - Supports basic operations: `+`, `-`, `*`, `/`, and `()`.
  - **Real-time Calculation**: Automatically updates the amount field as you type, without needing to press `=`.
  - **Smooth Animations**: Added slide-down entrance and slide-up collapse animations for the calculator panel.
  - Optimized for MUJI aesthetics with low-saturation colors.
  - Features haptic feedback (vibration) for a tactile input experience on mobile devices.
  - **Auto-Collapse**: Pressing `=` now calculates the final result and gracefully collapses the calculator.
- **Dynamic Predictive Input Suggestions**: Smart history auto-fill for Project Name and Note fields.
  - **Real-time Filtering**: Suggestions appear as soon as the first character is typed.
  - **Top-2 Limit**: Displays strictly up to 2 most relevant historical matches to maintain minimalism.
  - **Instant Auto-fill**: Clicking a suggestion bubble automatically populates the input field.
  - **Smart Deduplication**: Improved suggestion logic to handle case-insensitivity and whitespace trimming, preventing duplicate entries.
- **Sanitized Math Evaluation**: Implemented a secure math expression evaluator with input sanitization.

*優化功能：新增「項目名稱」與「備註」的智慧預測輸入（聯想詞），支援自動去重與模糊匹配；支援計算機即時運算與平滑動畫；並實作 5 級視覺層次之文字雲，採用阿基米德螺旋線佈局確保核心關鍵字完美置中。*

## [2026-02-13] Friend Features & UI Refinement (Main Branch)

### Added
- **Delete Friend Feature**: Implemented a complete "Delete Friend" workflow from API to UI, allowing users to remove friends from their active list while preserving existing transaction history.
- **Improved Friend Search**: Added support for searching transactions by Friend ID in addition to Name, ensuring consistent filtering even after renames.

### Fixed
- **History UI Redundancy**: Fixed the issue where "我 付款" (Me paid) was displayed in transaction details when the payer was the current user. The label is now hidden for self-payments for a cleaner look.
- **Identity Logic Alignment**: Standardized UID-to-"我" resolution across `OverviewPage`, `FriendDetailPage`, and `app.js` to ensure the core accounting engine matches the local user identity.
- **Settings Page Layout Restoration**: Reverted the "Account" management section to the **bottom** of the page (after Projects and Friends) to maintain design consistency and original UX flow.
- **App Mode State Fix**: Fixed a critical bug in `app.js` where the `appMode` reactive state was not correctly exposed to the Vue template, which previously caused account management buttons to be hidden.

### Removed
- **Invitation System**: Completely removed the "Invite Friend" feature (both UI buttons and backend listeners/methods) to streamline the main application for stability.

*優化好友功能與介面：實作「刪除好友」功能；修正明細顯示冗餘；將帳號區塊恢復至設定頁面底部以維持設計一致性；及修復 `appMode` 狀態回傳錯誤以找回遺失的功能按鍵。*


### Added
- **Project Subcollection Support**: Updated `api.js` to support reading and writing projects from/to the Firestore subcollection (`users/{uid}/projects`), ensuring compatibility with the latest data structure.
- **Automatic Project Migration**: Implement a one-time migration to move projects from the legacy user document array to the new subcollection structure safely.

### Improved
- **UID Identity Mapping**: Enhanced `getFriendName` across all pages and `handleSubmit` in `app.js` to correctly map the user's UID to "我" (Me). This ensures that transactions recorded in the database with UIDs are correctly identified as the user's own transactions in the UI.
- **Robust Friend Labeling**: Added security fallbacks to mask raw UIDs with a generic "朋友" (Friend) label if local resolution fails.

### Archived
- **Beta Development Progress**: Current Beta features (including experimental invitation flows and UI refinements) have been archived to the `archive/beta-fix-safety` branch for future refinement.

*針對主分支進行了重大的資料相容性修復，包含支援專案子集合路徑、自動資料遷移，以及跨頁面的 UID 身分識別優化，確保舊版程式能完美相容新版資料結構。*

## [2026-02-12] 14:15
### Fixed
- **Friend Name Sync & Data Disconnect**:
  - Implemented optimistic local update for transaction records when a friend is renamed. This prevents the "0 amount" display issue caused by name-to-ID transitions or renames.
  - Upgraded `API.renameFriend` to support updating names within split strings (multi-friend transactions) using a refined search-and-replace strategy.
  - *修復更名斷層：實作 Optimistic UI 同步更新本地交易紀錄，解決更名後金額顯示為 0 的問題，並優化分帳字串的自動更名邏輯。*
- **Friend Detail Page Improvements**:
  - Enhanced debt calculation logic to support both ID and Name matching simultaneously.
  - Fixed 1-on-1 transaction debt calculation where "Split" mode was not explicitly enabled.
  - Added a **Currency Switcher** component directly in the Net Debt section for quick JPY/TWD toggling.
  - Implemented **+/- sign prefixes** for JPY/TWD net amounts to clearly indicate credit vs. debt status.
  - *優化好友詳情頁：計算邏輯改採 ID 與名稱雙重比對；在淨債務區域新增幣別切換器；並為各幣別淨額加上 +/- 符號，方便一眼判斷欠款狀態。*
- **Transaction Consistency**:
  - Updated Add/Edit pages to explicitly include "Me" (我) in the `friendName` field for split transactions, ensuring backward compatibility with older calculation engines.
  - *強化資料一致性：分帳交易現在會明確記錄「我」在參與名單中，提升舊版引擎的相容性。*

---

## [2026-03-07T15:30:00+08:00] Feature: Android App Widget Implementation

### Added
- **Android App Widget**: Implemented a "Nichi-Widget" that displays today's expense summary and provides a quick shortcut to the "Add" page.
- **Data Sync Bridge**: Added `SharedPreferences` integration via `@capacitor/preferences` to share data between the web app and native widget.
- **Deep Linking**: Configured `nichinichi://add` and `nichinichi://home` schemes to allow the widget to launch specific app pages.
- **Native Notification**: Created a custom Capacitor plugin `WidgetUpdate` in `MainActivity.java` to trigger immediate widget updates on data changes.
- **Design Assets**: Added MUJI-themed XML resources (colors, drawables, layouts) for the native widget UI.

### Changed
- **API Logic**: Added `syncWidget` to `js/api.js` to calculate today's total and update the native storage.
- **App Management**: Integrated `transactions` watcher in `js/app.js` to ensure the widget is always in sync with the latest data.
- **Android Manifest**: Registered `NichiWidget` receiver and added deep link intent filters to `MainActivity`.

### Affected Files
- `android/app/src/main/res/layout/nichi_widget.xml`
- `android/app/src/main/res/xml/nichi_widget_info.xml`
- `android/app/src/main/java/com/nichinichi/app/NichiWidget.java`
- `android/app/src/main/java/com/nichinichi/app/MainActivity.java`
- `android/app/src/main/AndroidManifest.xml`
- `js/api.js`
- `js/app.js`

*實作 Android 桌面小工具：新增「今日支出」摘要與「快速記帳」捷徑。透過 SharedPreferences 與自定義 Capacitor Plugin 實現 Web 與原生系統間的即時數據同步。*

---

## [2026-03-07T14:45:00+08:00] UI: App Renamed to "日日記"

### Changed
- **Display Name**: Changed the official app name from `nichinichi` to `日日記` (Daily Diary) across all platforms.
- **Android Resources**: Updated `strings.xml` and `capacitor.config.ts` to reflect the new Chinese name.
- **Widget Identification**: Added the Chinese name to the App Widget receiver label for better visibility in the system widget picker.

### Affected Files
- `capacitor.config.ts`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/AndroidManifest.xml`

*修改 App 名稱為「日日記」：全面更新 Android 系統顯示名稱與小工具標籤，使品牌形象更符合中文用戶直覺。*
## [2026-02-12] 12:30
### Added
- **Unique Friend IDs & Data Integrity Refactor**:
  - Implemented a robust ID-based management system for friends. Every friend now has a unique ID (e.g., `f_1739500000000`) that serves as the primary key for data association.
  - Developed an automatic migration script in `loadData` that assigns IDs to existing name-only friend records and persists them to Firestore.
  - *實作「好友 ID 綁定」機制：為所有好友分配唯一識別碼，解決更名後歷史紀錄不連動的問題。*
- **Synced Transaction Display**:
  - Upgraded `HistoryPage` and `StatsPage` to resolve friend names from IDs in real-time. This ensures that when a friend is renamed, all historical transactions instantly reflect the new name across the entire application interface.
  - *同步明細與統計顯示：更名後歷史紀錄會連動顯示新名稱。*
- **Enhanced Friend Detail & Calculations**:
  - Updated `FriendDetailPage` to use IDs for ultra-accurate debt calculations, supporting both legacy name matching and modern ID matching.
  - Refined the "View History" navigation to filter by Friend ID, ensuring correct results even after renames.
  - *優化好友詳情頁：使用 ID 進行精確債務運算與明細跳轉過濾。*
- **Backend & API Hardening**:
  - Upgraded `API.saveTransaction` and `renameFriend` actions to handle ID-based updates.
  - Optimized `renameFriend` to perform thorough batch updates on both `friendName` and `payer` fields in Firestore.
  - *後端 API 強化：全面支援 ID 式更新並自動同步 Firestore 中的多種關聯欄位。*
- **UI/UX Consistency**:
  - Updated Add/Edit pages to bind IDs to form fields while displaying human-readable names.
  - Ensured that "Viewer Mode" (Shared Links) also benefits from the ID-to-Name resolution for consistent reporting.
  - *介面一致性優化：記帳頁面與分享連結現已完全支援 ID 關聯顯示。*

## [2026-02-13] 11:45
### Fixed
- **Friend Management Integrity**:
  - Fully refactored `AddPage`, `EditPage`, `ViewDashboard`, and `ViewSettingsPage` to correctly handle the new Friend object structure (`{ name, visible }`).
  - Resolved "JSON string display" bug in Payer and Split Bill sections.
  - Fixed an issue where all friends (including hidden ones) appeared in Payer selection.
  - Restored missing friend list in Split Bill section by implementing `visibleFriends` and `displayFriends` computed properties.
- **Friend Detail Page Improvements**:
  - Corrected Debt Calculation: Individual shares in multi-split scenarios are now accurately calculated by dividing the total lent amount by the number of friends involved.
  - Fixed Javascript `SyntaxError` by escaping dollar signs in template literals.
  - Fixed `ReferenceError` by ensuring `FriendDetailPage` is properly imported in `app.js`.
- **Intelligent Navigation**:
  - Upgraded `handleViewHistory` in `app.js` to intelligently infer if a filter string refers to a friend's name or a project keyword based on the current context.

*全面修復好友管理邏輯，支援「隱藏好友」功能並解決 JSON 字樣顯示問題。修正分帳計算邏輯以支援多人分帳情形，並優化歷史紀錄跳轉後的自動過濾機制。*


## [2026-02-12] 01:40
### Added
- **Mutual Friend Signaling Mechanism**:
  - Implemented a robust "Discovery" mechanism to establish mutual friend links. New users now send a join signal to the `friend_connections` collection upon accepting an invite.
  - Added auto-discovery logic to `app.js` that scans for incoming signals and automatically updates the inviter's friend list upon login or refresh.
  - Developed `API.checkPendingConnections` and `API.clearConnection` to manage the signaling lifecycle.
- **Improved New User Onboarding**:
  - Enhanced `API.processInvite` to automatically initialize Firestore documents for first-time users, ensuring the invitation flow never breaks for newcomers.
- **Web Share API & Robust Clipboard Support**:
  - Upgraded the "Copy Invite Link" feature to prioritize the native **Web Share API** (System Share) on mobile devices for a more integrated experience.
  - Implemented a triple-fallback clipboard mechanism (Share API -> Clipboard API -> Legacy Textarea) to fix `TypeError: undefined` errors in insecure contexts (HTTP).
- **Invite Landing Page UI Refinements**:
  - Redesigned the "Invite Landing" page with a "Signature" branding approach, moving the logo to the bottom for a premium, content-first experience.
  - Optimized layout hierarchy by centering the invitation card and adjusting vertical spacing.
  - Enhanced app-like feel by disabling touch scrolling (`touch-none`) and text selection (`select-none`) on the landing overlay.
  - Replaced temporary branding with the official `logo-header.png`.
  - Updated CTA labels for better user guidance ("快速上手指南").
- **Security Hardening**:
  - Updated `firestore.rules` to include granular permissions for the `friend_connections` collection, enabling secure mutual linking signals.

*實作「好友雙向自動連動」機制，透過 Firestore 信號系統解決權限限制，讓邀請者能自動發現並加入新好友。同時修復剪貼簿複製錯誤，並整合原生分享介面提升行動端體驗。*

## [2026-02-12] 01:15
### Added
- **Friend Invite & Landing Page**:
  - Implemented a new "Invite Friend" feature allowing users to generate and share personalized invitation links.
  - Created a high-aesthetic "Invite Landing" page for new users, featuring a Muji-inspired design with core benefit explanations.
  - Developed `API.processInvite` to establish initial friend links in Firestore upon login.
  - Added URL parameter detection (`invite_code` and `name`) to trigger the landing experience.
  - Formatted invitation text for better clarity when shared.

*新增「邀請好友」與「邀請落地頁」，支援產生個人化連結。*


## [2026-02-11] 19:15
### Added
- Created a comprehensive English User Guide (`guide-en.html`) using Simplified Technical English (STE).
- Implemented Markdown rendering logic compatible with the project's design system and `MarkdownRenderer` component.
- Added documentation for Quick Start, Feature Explanations, and Troubleshooting.

*建立了完整的英文使用指南 (`guide-en.html`)，採用簡化技術英文 (STE) 並相容於專案的 Markdown 渲染系統。*

 - 2026-02-06 Update (Guest & View Mode Refinement)

## 🌟 Guest Mode (體驗模式) Refinements
- **Data Logic Overhaul**:
  - **Separation of Local vs. Remote**: User-created data (Local) is now strictly separated from Demo data (Remote). Clearing or toggling "Import Data" will **not** delete your local entries.
  - **Always-On Metadata**: Even if "Import Data" is OFF, the app now fetches Categories, Payment Methods, and Config from the backend to ensure a seamless experience (menus won't be empty).
  - **Toggling Logic**: The "Import Data" toggle now only controls the visibility of Demo transactions.
- **Sorting Fix**: Fixed an issue where local transactions were forced to the bottom of the list. Now, all transactions (Local & Remote) are correctly sorted mixed by date (Newest First).
- **Payment Method Fix**: Resolved an issue where "Cash" and "PayPay" would appear as duplicates in the dropdown menu. Now strictly relies on backend configuration.

## 🚀 View Mode (Viewer) Polish
- **Dedicated Read-Only Page**:
  - Replaced the shared Edit Page with a new `ViewEditPage`.
  - **Removed**: "Start Editing" button, "Delete" button, and all input fields.
  - **Retained**: Full detail view including Splitwise details and Project tags.
- **Settings Page Clean-up**: Removed the intrusive "Read Only" badge from the settings card for a cleaner aesthetic.
- **Search & Filter**:
  - The "Clear Filter" (CLEAR) button is now **always visible** in History Mode, allowing users to easily reset views without guessing if a filter is active.

## 🐛 Bug Fixes & Technical
- **Date Normalization**: Standardized remote date formats to ensure consistent grouping in the History list.
- **Syntax Fixes**: Resolved a `SyntaxError` in `app.js` related to the fetch logic.

---

# Changelog - 2026-02-06 Update (View Mode & Features)

## 🚀 View Mode (Viewer)
- **New Architecture**: Created dedicated `view.html`, `js/view-app.js`, and `ViewDashboard` component to isolate Viewer logic from the main Admin/Guest app.
- **FX Rate Fix**: Fixed an issue where the exchange rate was defaulting to 0.22. Now correctly fetches `config.fx_rate` from GAS or Guest settings (e.g., 0.21).
- **Chart Reactivity**: Resolved a critical bug where Chart.js instances were wrapped in Vue proxies, causing `TypeError` and rendering failures. Implemented proper cleanup logic.
- **UI Improvements**: Updated the View Mode dashboard layout and currency toggle style.

## ✨ New Features
- **Project Search Integration**:
  - Added a "View Details" (查看明細) button to the Project Detail page.
  - Clicking "View Details" now filters the History page by the project's ID.
  - Enhanced the search bar to support searching by **Project Name** or **Project ID**.
- **Guest Mode Enhancements**:
  - **Settings Persistence**: Guest settings (User Name, FX Rate) now take precedence over remote default data during import.
  - **UI Refinement**: Renamed "Clear Data" and "Import Default Data" actions for clarity.

## 🐛 Bug Fixes
- **Layout Fixes**: Corrected the Project Detail page layout to center content vertically.
- **Event Handling**: Fixed missing event listeners for `view-history` in both `index.html` and `view.html`.


## 🎨 UI & Layout Updates
- **Global Layout Unification**:
  - `AppHeader` (Top Bar) and `AppFooter` (Navigation) are now consistently visible across all pages, including **Project Detail** and **Edit Page**.
  - Normalized padding and spacing for the main content area (`<main>`).
- **History Page**:
  - Fixed the "jump" issue caused by scrollbars appearing/disappearing by enforcing `scrollbar-gutter: stable`.
  - Refactored `SearchBar` to use a sticky positioning that stays within the layout boundaries.
- **Edit Page**:
  - Removed the redundant top navigation bar.
  - Integrated "Close/Cancel" and Title into the main content card for a cleaner look.
- **Project Detail Page**:
  - **Vertical Centering**: The read-only project summary view is now vertically centered within the card.
  - **Edit Mode Layout**: Improved the grid layout for Start/End Date inputs.
  - Removed duplicate "CANCEL" button in the header section.

## 🛠️ Refactoring
- **Component Separation**:
  - Extracted `AppHeader`, `AppFooter`, `SearchBar`, and `SystemModal` into verified standalone components in `js/components/`.
- **Search Logic**:
  - Centralized search and filter logic in `SearchBar` component.

## 🐛 Bug Fixes
- **Invalid Token Alert**: Fixed an issue where the "Invalid Token" alert would close immediately before the user could read it. Added `await` to ensure user confirmation.
- **Friend Filtering**: Fixed the issue where clicking a friend in Settings didn't show all relevant transactions. The filter now correctly checks both `friendName` (Beneficiary) and `payer`.

- **UI Tweaks**: Removed the unused cloud status icon from the header.

## ✨ New Features
- **Edit/Delete Feedback**:
  - Implemented a clear success dialog after editing or deleting a transaction.
  - Added a "Reload" (重新整理) action to these dialogs to ensure data consistency with the backend, alongside the standard "Return to Details" (返回明細) button.

## [2026-02-08T05:56:00Z] Unified Authorization & Persistent Backup

### Features & Improvements
- **Unified Authorization**: Implemented shared authorization scope for both `Export` and `Backup features`. Users now only need to provide consent once for both operations.
  - 統一授權機制：匯出與備份功能現共用授權，使用者僅需同意一次即可。
- **Persistent Auth & Auto-Retry**: Added `_fetchWithRetry` logic to `GoogleSheetsService` to automatically handle token expiration (401/403 errors) by triggering a re-auth flow or refreshing the token.
  - 持續性存取與自動重試：當 Token 過期時，系統將自動嘗試重新驗證，減少重複登入的困擾。
- **File Naming Convention**: Updated backup and export filenames to use the precision format `yyyymmddhhmmss` (e.g., `backup_20240208123045.json`).
  - 檔名格式更新：備份與匯出檔名現包含精確的時間戳記（年月日時分秒）。
- **Auto-Backup Fix**: Resolved an issue in `app.js` where `autoBackupIfNeeded` was calling a non-existent method and improved the daily trigger logic to ensure it runs on the first app open of the day.
  - 自動備份修復：修正自動備份的程式邏輯，確保每日首次開啟 App 時能正確執行備份。
- **UI Updates**: Updated the Backup destination description in Settings to clearly state "Google Drive '日日記' folder".
  - 介面文字更新：更清楚地說明備份檔案的儲存位置。

### Technical Details
- Modified `js/api.js` to include `invalidateGoogleToken`.
- Refactored `js/services/google-sheets-service.js` to include retry logic and updated file naming.
- Updated `js/pages/settings-page.js` to pass retry callbacks.
- Fixed `js/app.js` auto-backup logic.
---

## [2026-02-08T06:17:00Z] Added Favicon

### Features & Improvements
- **Favicon**: Added `favicon.ico` support to `index.html`, `view.html`, and `migration-tool.html` for better browser tab recognition.
  - 新增網頁圖示：為所有頁面加入 Favicon，提升辨識度。

### Technical Details
- Added `<link rel="icon" href="favicon.ico" type="image/x-icon">` to HTML heads.
# Changelog - 2026-02-08 Update (UX Optimization)

## [2026-02-08T07:15:00Z] Import Feature & UI Updates

### Features & Improvements
- **Import Data**: Added a new "Import Data" feature in Settings > Account. Users can now restore or overwrite data using a JSON backup file.
  - 新增資料匯入功能：位於設定頁面的帳號區塊，允許使用者匯入 JSON 備份檔以還原資料。
- **UI Text Updates**: Renamed "Export" button to "匯出" and "Backup" button to "備份" for simplicity and consistency.
  - 介面文字調整：簡化匯出與備份按鈕的文字標籤。
- **Visual Consistency**: The new Import button matches the design of the existing Logout button, maintaining a cohesive look and feel.
  - 視覺一致性：匯入按鈕的設計與登出按鈕保持一致。
- **UI Refinement**: Updated `ImportPage` to use a grayscale color palette matching `HistoryPage` and added a standard header.
  - 介面優化：匯入頁面改採與歷史紀錄頁面一致的灰階色系，並加入標準頁首。
- **Layout Adjustment**: Reverted "Backup" and "Export" buttons to a side-by-side grid layout for better accessibility.
  - 版面調整：將備份與匯出按鈕還原為並排網格佈局。
- **UI Refinement**: Adjusted the position of the backup description text to be above the buttons and left-aligned.
  - 介面優化：調整備份說明文字位置至按鈕上方並靠左對齊。
- **UX Improvement**: Implemented auto-reload after successful data import to ensure users see updated data immediately.
  - 使用者體驗優化：資料匯入成功後自動重新整理頁面，確保使用者即時看到最新資料。
- **Unification**: Unified default settings (categories, payment methods) for Guest Mode and New Users by centralizing configuration.
  - 設定統一：統一訪客模式與新使用者的預設設定（類別、支付方式），集中管理配置。
- **Guest Mode Refinement**: Removed legacy import tool, fixed FX rate persistence, and enabled Project creation for guests.
  - 訪客模式優化：移除舊版匯入工具，修復匯率儲存問題，並開放訪客建立旅行計畫。
- **Fix**: Resolved issue where added friends were not persisting in Guest Mode.
  - 修正：解決訪客模式下新增朋友無法儲存的問題。
- **Feature**: Implemented "Guest Data Merge" on login. Users are prompted to save their guest data to their Google Account upon logging in.
  - 新功能：實作「訪客資料合併」功能。登入時若偵測到訪客資料，系統將詢問是否將其存入 Google 帳戶。
- **UI Update**: Renamed "Delete Account Data" to "Delete Bookkeeping Data" to better reflect the action's scope.
  - 介面更新：將「刪除帳戶資料」更名為「刪除記帳資料」，以更準確描述該功能。
- **Feature**: Implemented "Delete Account" functionality with enhanced security.
  - 新功能：實作「註銷帳戶」功能。改用 `reauthenticateWithPopup` 確保僅驗證且不切換登入狀態。
  - **Security**: Added identity verification to prevent session hijacking if wrong account is used.
  - **Fix**: Resolved an issue where app initialization prevented some event handlers from attaching correctly (refactored `app.js`).
- **UI Update**: Updated Delete Account confirmation text for clarity.
  - 介面更新：修改註銷確認視窗文字，強調「此操作無法復原」。
- **UI Update**: Updated Delete Account confirmation text for clarity.
  - 介面更新：修改註銷確認視窗文字，強調「此操作無法復原」。

### Technical Details
- Added `js/pages/import-page.js` component with file parsing and `API.importData` integration.
- Implemented batch write logic in `js/api.js` using `writeBatch` for efficient data import.
- Updated `js/pages/settings-page.js` to include the new button and routing event.
## ⚡️ Optimistic UI & Performance
- **Instant Feedback (Optimistic UI)**:
  - **Add/Edit/Delete**: Actions now reflect immediately on the UI without waiting for the server. Data synchronization happens in the background.
  - **Zero Latency**: Removed loading spinners for standard operations to improve perceived speed.
- **Payer Pre-selection**:
  - **Default to "Me"**: The payer field in the Add Page now strictly defaults to "Me" (我), reducing clicks for the most common use case.


# Changelog - 2026-02-08 Update (Viewer Mode & Security)

## [2026-02-08T12:12:00Z] Viewer Mode Refactor & Security Update

### Features & Improvements
- **Viewer Mode 2.0**:
  - **3-Layer Dashboard**: Completely redesigned the Overview page in Viewer Mode for better information hierarchy.
  - **Main Card**: Now successfully integrates User Name and Navigation shortcuts (Transactions/Stats) into a single cohesive card. Removed "Read-only" text for a cleaner look.
  - **Collection Section**: Introduced a new bottom section to display secondary information like FX Rate, Friends, and Projects.
  - **Simplified CTA**: Refined the "Guest Mode" call-to-action to be less intrusive.
  - 閱覽模式 2.0：全面重構總覽頁面。將導覽按鈕整合至主卡片，並新增 Collection 區塊顯示次要資訊。

### Technical Details
- **Firestore Security**:
  - Implemented `firestore.rules` to secure the database while allowing public read access for Shared Links (`sharedId`).
  - Fixed `Missing or insufficient permissions` error by properly defining access rules.
  - 資料庫安全：實作 Firestore 安全規則，在保護資料的同時允許分享連結的正常讀取。
- **App Logic**:
  - Implemented `hasMultipleCurrencies` to intelligently toggle the currency switcher only when needed.
  - Fixed duplicate import syntax error in `view-dashboard.js`.


---

# Changelog - 2026-02-08 Update (Shared Links Polish & Privacy)

## 🚀 Shared Links Enhancements (分享連結優化)
- **Viewer Experience (檢視模式)**:
  - **Date Range Display**: Added a dedicated date range display below the title.
    - **All Records**: Shows the range from the first to the last transaction.
    - **Custom Range**: Shows the configured start and end dates.
    - **Project**: Shows the project's start and end dates.
  - **Clean Title**: Removed the hardcoded "的生活筆記" suffix from the viewer title for a cleaner look.
  - **Smart Loading**: If "Exclude Project Expenses" is enabled, project data is completely excluded from the viewer payload for better privacy and performance.

- **Editor UI (編輯介面)**:
  - **Default Name Logic**: Restored "的生活筆記" as a default suffix when creating a new link, but allowing full user customization.
  - **Simplified Actions**: Replaced the top-left "Back" arrow with a clear "Cancel" (取消) text button at the top-right.
  - **Dynamic Options**: The "Hide Project Names" option now automatically hides if "Exclude Project Expenses" is selected (since project data is already excluded).

## 🔒 Privacy & Security (隱私與安全)
- **Friend Masking Fix**:
  - Resolved an issue where the user "Me" (我) was incorrectly masked as "Friend" (友) when "Hide Friend Names" was enabled.
  - Added masking for the `friendName` field (used in "Help Friend Pay" transactions) to ensuring full privacy.
- **Permission Hardening**:
  - Validated Firestore security rules for `shared_links` collection access.
  - Implemented UID-based direct access path to bypass complex index requirements and improve loading speed.

## 🐛 Bug Fixes (錯誤修正)
- **Syntax Error**: Fixed a critical `SyntaxError` in `app.js` caused by an invalid import statement.
- **Code Refinement**: Cleaned up duplicated logic in `app.js` to prevent race conditions during data loading.

---

# Changelog - 2026-02-08 Update (Add Page UX & Stability)

## ⚡️ Add Page Enhancements (新增頁面體驗優化)
- **Fluid Project Creation (流暢的計畫建立流程)**:
    - **Silent Creation**: Removed the interruption of "Project Created" alert dialogs.
    - **Auto-Selection**: Newly created projects are now automatically selected in the form, allowing you to continue tracking immediately.
    - **Conflict Resolution**: Fixed an issue where the date-based auto-selection would overwrite the newly created project.

- **Tactile "Confirm & Save" Button (按鈕回饋優化)**:
    - **Animation**: Added a subtle scale/spring animation on press.
    - **Haptic Feedback**: Added vibration feedback for mobile users.
    - **Double-Submit Prevention**: The button now instantly disables upon click to prevent accidental duplicate entries.

## 🐛 Bug Fixes (錯誤修復)
- **App Stability**: Fixed syntax errors in `app.js` (duplicate declarations, object closure) that caused startup crashes.
- **Form Logic**: Fixed `add-page.js` syntax errors and optimized the project watcher logic.

---

# Changelog - 2026-02-08 Update (Account & Data Deletion Fixes)

## [2026-02-08T23:40:00Z] Refined Account Deletion & Data Clearing Logic

### Features & Improvements
- **Robust Account Deletion**:
    - **Simplified Targeting**: Corrected `deleteFullAccount` to target only actual subcollections (`transactions`, `shared_links`). Removed redundant deletion attempts for fields like `projects` and `categories`, resolving the "Missing or insufficient permissions" error.
    - **Chunked Deletion**: Implemented a chunked batching mechanism (`_deleteCollectionChunked`) to handle large datasets effectively, bypassing the Firestore 500-document batch limit.
    - **Thorough Cleanup**: Added `shared_links` to the deletion process to ensure complete removal of user-associated data.
    - 帳戶註銷優化：修正權限錯誤，改為僅針對子集合進行手動刪除，並實作分段批次處理以應對大量交易資料，確保註銷過程穩定徹底。

- **Fixed Bookkeeping Data Clearing**:
    - **Implemented logic**: Fully implemented `clearAccountData` to delete all documents in the `transactions` subcollection while preserving the account itself.
    - **Logout Integration**: Ensuring a clean state by logging out and forcing a refresh after data clearing.
    - 刪除記帳資料修正：實作 transactions 子集合的完整清空邏輯，並確保在操作完成後自動登出並重整頁面。

- **Synchronized Page Reload**:
    - **Alert-Triggered Refresh**: Updated `handleDeleteAccount` and `handleClearAccountData` to ensure the page reloads or redirects **only after** the user clicks the "Confirm" button on the success or error dialogs. This improves UX by allowing users to read the final outcome before the application state is reset.
    - 同步重整機制：優化重整時機，確保使用者在看完成功或失敗提示並點擊按鈕後，頁面才會進行重整，提升操作體驗。

- **Add Page UX Enhancement**:
    - **Auto-Scroll to Top**: Implemented immediate scroll-to-top when clicking "Confirm & Save" on the Add Page. This ensures users instantly see the entry result or error messages regardless of the form length.
    - 新增頁面體驗優化：實作「儲存並確認」按鈕按下後自動滑動至最上方，確保使用者能立即看清新增結果或錯誤提示。

- **Improved Currency Switcher**:
    - **Forced Visibility**: The currency switcher in the header is now always visible on Overview and Stats pages, facilitating easier analysis regardless of current data diversity.
    - **Smart Detection**: Implemented automatic base currency detection. Upon loading, the app identifies the currency of the most recent transaction and automatically sets the base currency (JPY/TWD) to match.
    - **Full Viewer Support**: Extended currency toggling and smart detection to Viewer mode (shared links), ensuring a consistent experience for all users.
    - 貨幣切換器優化：Header 顯示邏輯調整為總覽與統計頁面永遠顯示。新增「智慧判斷」功能，系統載入時會自動依據最新一筆交易之幣別（日幣或台幣）切換顯示基準，且同步支援分享連結之唯讀模式。

- **Markdown Rendering System**:
    - **New Infrastructure**: Established a complete Markdown rendering pipeline for future documentation (Guides, Privacy Policies).
    - **Muji-Style Integration**: Created `css/markdown-body.css` using existing design tokens to ensure all documentation perfectly matches the app's aesthetic.
    - **Advanced Syntax Support**: Added support for GFM, code syntax highlighting (highlight.js), custom alert containers (`::: tip`, etc.), and interactive elements like `details/summary` and `kbd`.
    - **Demo Page Refinement**: Created and refined `page-demo.html`. Integrated the standard `AppHeader`, implemented a "Close" button (history back), adjusted the "Tip" container color to a subtle light gray, and **aligned the container width with the standard application layout (`max-w-md`)** to fix header misalignment.
    - Markdown 渲染系統優化：建立完整預覽機制並優化 `page-demo.html` 介面，納入標準 Header 元件與「關閉」導航功能，將「提示」方塊調整為淺灰色調，並修正容器寬度與主程式一致以解決錯位問題。

### Technical Details
- Updated `js/api.js` with `_deleteCollectionChunked` helper and refined `deleteFullAccount`.
- Updated `js/app.js` with `await` on all `dialog.alert` calls, refined `finally` block logic, added `window.scrollTo` to `handleSubmit`, and implemented smart currency detection in `loadData`.
- Updated `js/view-app.js` and `view.html` to support the header switcher and base currency management in Viewer mode.
- Created `css/markdown-body.css`, `js/components/markdown-renderer.js`, and `page-demo.html`.

---

## [2026-02-09T00:46:00Z] Fixed FX Rate Loading in Viewer Mode

### Bug Fixes
- **Corrected Configuration Structure**: Fixed a bug where the `Viewer Mode` (Shared Links) was receiving an incorrect data structure for user settings. This caused the exchange rate (FX Rate) to default to 0.22 instead of using the sharer's personalized settings.
- **Improved Data Consistency**: Standardized the data format returned by the shared data fetcher to match the regular admin/guest modes.

### Technical Details
- Modified `_fetchDataForUser` in `js/api.js` to correctly return the `config` sub-object from the user document instead of the entire document.
- Ensured `user_name` override from the shared link configuration is correctly merged into the final `config` object.


---

## [2026-02-09T13:20:00Z] Design System v1.0 Rollout (Color Audit & Tokens)

### Features & Improvements
- **3-Layer Token Architecture**: Implemented a comprehensive design token system with Primitive, Semantic, and Component layers to ensure scalability and dark-mode readiness.
  - 實作三層式設計標記架構（Primitive, Semantic, Component），確保系統擴展性並預留暗色模式支援。
- **Full Color Audit**: Performed a codebase-wide audit, identifying 72 unique colors and mapping them to standardized tokens.
  - 完成全站色彩審核：識別出 72 種唯一色彩，並將其全數映射至標準化語義標記。
- **Decoupled Brand & Text**: Separated brand color usage from functional text tokens to improve accessibility and theme flexibility.
  - 品牌色與文字色解耦：將品牌色使用處與功能性文字標記分離，提升無障礙對比度與主題切換彈性。
- **Chart Palette Optimization**: Expanded brand-toned palette (Brand Tones) for statistics charts, ensuring better category differentiation while maintaining a muted, premium aesthetic.
  - 圖表配色優化：實作「品牌明度階梯」配色，在維持低飽和高級感的同時，提升統計圖表的類別辨識度。
- **Core Technical Update**: Updated `design-tokens.css` with 10-step brand primitives and synced with Tailwind CDN configuration across all HTML entry points.
  - 核心技術更新：擴展 10 階品牌色基礎標記，並同步更新所有 HTML 進入點的 Tailwind 配置。
- Updated `css/design-tokens.css` with v1.0 specification.
- Refactored `js/theme.js` to utilize semantic CSS variables.
- Cleaned up legacy color mappings for backward compatibility.
- 核心技術更新：重構 `design-tokens.css` 與 `theme.js`，導入語義化變數並優化舊有映射。

---

## [2026-02-09T15:06:00Z] Chart Stability Restoration & Toggle Color Fix

### Bug Fixes
- **Stats Page Chart Colors**: Restored the original remote chart color palette to ensure the highest amount category uses the brand color `#4A4A4A`. The previous implementation incorrectly started with `#424242`, causing visual inconsistency.
  - 統計頁面圖表顏色修正：恢復遠端原始配色，確保最高金額分類使用品牌色 `#4A4A4A`。
- **Overview Page Rendering Failure**: Fixed a critical bug where the Overview page failed to render charts due to a missing `Theme` import in `js/pages/overview-page.js`.
  - 總覽頁面渲染失敗修正：補上缺少的 `Theme` 模組引入，修復圖表無法顯示的問題。
- **Toggle Switch Color**: Updated the "Split Expense" (幫朋友代墊 / 需分帳) toggle switch in the Add Page to use the brand primary color when active, replacing the previous light gray.
  - 開關顏色修正：將新增頁面的「需分帳」開關改為品牌主色，提升視覺一致性。

### Technical Details
- **Chart Color Palette**: Reverted `js/theme.js` chart colors to the original sequence: `['#4A4A4A', '#7A7A7A', '#9A9A9A', '#BDBDBD', '#D1C7BD', '#E5E5E5']`. This ensures Chart.js applies the brand color to the first (highest value) data point in sorted category data.
  - 圖表配色技術細節：Chart.js 會依序將顏色套用至資料點，因此第一個顏色（品牌色）會對應至排序後的最大值分類。
- **Import Fix**: Added `import { Theme } from '../theme.js';` to `js/pages/overview-page.js` to resolve `ReferenceError` when calling `Theme.resolveColor()`.
  - 引入修正：為 `overview-page.js` 補上 Theme 模組引入，解決 `ReferenceError` 錯誤。
- **Toggle Styling**: Modified `js/pages/add-page.js` line 85 to use `:class="form.isSplit ? 'bg-[var(--action-primary-bg)]' : 'bg-bg-subtle'"` for consistent brand color application.
  - 開關樣式：修改 `add-page.js` 第 85 行，使用 CSS 變數 `--action-primary-bg` 確保品牌色一致性。

### Files Modified
- `js/theme.js` - Restored original chart color palette
- `js/pages/overview-page.js` - Added Theme import
- `js/pages/add-page.js` - Updated toggle switch color
- `js/pages/stats-page.js` - Ensured compatibility with restored palette

---
## [2026-02-09T15:52:00Z] Category Management State Persistence & Dialog UX Improvement

### Bug Fixes
- **Category Save Failure**: Fixed a critical bug where newly added custom categories were not being saved to Firestore. The root cause was that navigating to the icon edit page after adding a category caused the edit mode state (`isCategoryModeEdit` and `localCategories`) to be lost, preventing the save action from executing.
  - 類別儲存失敗修正：修復新增自訂類別後無法儲存至資料庫的問題。根本原因是跳轉至圖示編輯頁面時編輯狀態遺失。
- **Icon Edit Page Save Button**: Fixed the non-functional save button on the icon edit page. The `handleSelectIcon` function now correctly updates `localCategories` in sessionStorage when in edit mode, and saves directly to the database when not in edit mode.
  - 圖示編輯頁面儲存按鈕修正：修復儲存按鈕無效的問題，現在會正確更新編輯狀態或直接儲存至資料庫。

### Features
- **State Persistence**: Implemented sessionStorage-based state persistence for category and payment method editing. The edit state is now automatically saved before navigation and restored when returning from the icon edit page.
  - 狀態持久化：實作基於 sessionStorage 的編輯狀態持久化，確保頁面跳轉後編輯狀態不會遺失。
- **Improved Unsaved Changes Dialog**: Enhanced the unsaved changes prompt to be more actionable. Changed from a passive confirmation ("您有未儲存的修改，確定要離開嗎？") to an active save prompt ("是否儲存當前編輯狀態？") with "儲存" and "不儲存" buttons.
  - 未儲存變更對話框改進：將被動確認改為主動儲存提示，按鈕文字改為「儲存」和「不儲存」，提升使用者體驗。

### Technical Details
- **State Persistence Implementation**:
  - Added `saveEditState()`, `restoreEditState()`, and `clearEditState()` methods to `settings-page.js`
  - Edit state is saved to sessionStorage before navigating to icon edit page
  - State is automatically restored in the `mounted()` lifecycle hook
  - State is cleared after successful save via `saveCategoryEdit()` or when user chooses to discard changes
  - 狀態持久化技術細節：新增三個狀態管理方法，在頁面跳轉前儲存、掛載時恢復、儲存成功後清除。

- **Icon Edit Save Logic**:
  - Modified `handleSelectIcon()` in `app.js` to check for edit mode state in sessionStorage
  - In edit mode: updates the sessionStorage state without database write
  - Not in edit mode: updates root state and calls `handleUpdateUserData()` to save to Firestore
  - 圖示編輯儲存邏輯：根據編輯模式狀態決定是更新 sessionStorage 或直接寫入資料庫。

- **Dialog Improvement**:
  - Modified `handleTabChange()` in `app.js` to use custom button text via `dialog.confirm()` options
  - Implemented event-based communication using `window.dispatchEvent()` and `CustomEvent`
  - Settings page listens for `settings-save-requested` event and triggers appropriate save method
  - Added `beforeUnmount()` lifecycle hook to clean up event listeners
  - 對話框改進技術細節：使用自訂按鈕文字，透過事件系統實現跨組件儲存觸發。

### Files Modified
- `js/pages/settings-page.js` - Added state persistence methods, event listener for save requests
- `js/app.js` - Updated `handleSelectIcon()` and `handleTabChange()` with new logic
- `js/api.js` - Added debug logging to `updateUserData()` method

### Debug Logging
Added comprehensive debug logging throughout the category save flow for easier troubleshooting:
- `[DEBUG]` prefix in `settings-page.js` for category operations
- `[DEBUG API]` prefix in `api.js` for Firestore operations
- `[DEBUG handleSelectIcon]` prefix in `app.js` for icon selection flow
- 新增完整的除錯日誌，方便追蹤類別儲存流程。

---

## [2026-02-09T11:28:00Z] Unified App Icon Configuration

### Features & Improvements
- **Unified App Icon**: Standardized the application icon across all platforms (Favicon, Apple Touch Icon, and PWA) to use the local `kakei.png`.
  - 統一應用程式圖示：將 Favicon、Apple Touch Icon 及 PWA 圖示統一指向本地檔案 `kakei.png`。
- **Self-Hosting Icons**: Replaced external Flaticon and GitHub Pages links with local relative paths to ensure offline availability and visual consistency.
  - 本地化圖示資源：移除外部連結，改用相對路徑引用，確保離線可用性與視覺一致。

### Technical Details
- Updated `index.html`:
  - Changed `apple-touch-icon` href to `./kakei.png`.
  - Changed `favicon` href to `kakei.png`.
- Updated `view.html`:
  - Changed `apple-touch-icon` href to `./kakei.png`.
  - Changed `favicon` href to `kakei.png`.
- Updated `manifest.json`:
  - Changed `icons[0].src` to `kakei.png`.

---


---


## [2026-02-10T11:45:00Z] Toggle Switch Shadow Enhancement

### UI Improvements
- **Toggle Switch Visibility**: Added `shadow-sm` styling to all toggle switch components throughout the application to improve visibility when in the off state. The shadow style matches the existing button shadows (e.g., edit button in Shared Links section) for visual consistency.
  - 開關組件視覺優化：為所有開關組件統一加入陰影樣式，提升關閉狀態時的辨識度，陰影強度與「編輯」按鈕一致。

### Modified Components
- **Settings Page** (`js/pages/settings-page.js`):
  - Auto Backup toggle switch (每日自動備份)
  - 自動備份開關
- **Add Page** (`js/pages/add-page.js`):
  - Split Bill toggle switch (幫朋友代墊 / 需分帳)
  - Project Mode toggle switch (旅行計畫模式)
  - 分帳開關、計畫模式開關
- **Edit Page** (`js/pages/edit-page.js`):
  - Split Bill toggle switch (幫朋友代墊 / 需分帳)
  - Project Mode toggle switch (旅行計畫模式)
  - 分帳開關、計畫模式開關

### Technical Details
- Applied `shadow-sm` class to the toggle track background element (`<div>` with `rounded-full` class) for all 5 toggle switches in the application.
- The shadow helps differentiate the toggle from the page background, especially when using the subtle gray background color (`bg-bg-subtle`).
- 為所有 5 個開關組件的背景軌道元素加入 `shadow-sm` class，與頁面背景形成視覺層次。

---

---


## [2026-02-10T12:19:00Z] Cloud Save & Export Refactor

### Feature Changes

#### 「雲端存檔」(Cloud Save) - Previously "備份"
- **Icon**: Changed from `cloud_sync` to `cloud_upload`
- **Label**: Changed from "備份" to "雲端存檔"
- **Behavior**: Now saves **both** a JSON backup (`系統還原用備份檔_YYMMDDHHMM.json`) **and** a Google Spreadsheet (`瀏覽用記帳匯出_YYMMDDHHMM`) to the Google Drive "日日記" folder simultaneously using `Promise.all`.
- 雲端存檔功能：同時儲存 JSON 備份檔與 Google 試算表至雲端「日日記」資料夾。

#### 「匯出檔案」(Export) - Previously "匯出"
- **Icon**: Changed from `ios_share` to `download`
- **Label**: Changed from "匯出" to "匯出檔案"
- **Behavior**: Now generates a local ZIP file (`日日記備份_YYMMDDHHMM.zip`) containing:
  - `系統還原用備份檔_YYMMDDHHMM.json` (full data backup)
  - `瀏覽用記帳匯出_YYMMDDHHMM.csv` (readable transaction export with BOM for Excel CJK support)
- No longer requires Google API authentication; purely local operation.
- Uses JSZip library (loaded via CDN).
- 匯出功能改為本地 ZIP 下載，包含 JSON 備份檔與 CSV 記帳匯出。

#### Auto Backup Enhancement
- `autoBackupIfNeeded` upgraded to use `cloudSave` (saves both JSON + Spreadsheet) instead of JSON-only backup.
- Daily check logic unchanged: runs once per day on first login when auto backup is enabled.
- 自動備份升級為同時存 JSON + 試算表。

### UI Changes
- Section title: "Google Spreadsheet Services" → "Google 雲端服務"
- Description: "將儲存於 Google 雲端硬碟「日日記」資料夾" → "檔案將儲存至「日日記」備份資料夾"
- UI 文案全面更新。

### Technical Details

#### Modified Files
- **`js/services/google-sheets-service.js`**: Added `_getTimestamp()`, `cloudSave()`, `generateCsvContent()` methods. Renamed filenames to use YYMMDDHHMM format.
- **`js/pages/settings-page.js`**: Updated UI labels, icons, and both handler methods.
- **`index.html`**: Added JSZip CDN (`jszip@3.10.1`).
- **`js/app.js`**: Updated `autoBackupIfNeeded` to call `cloudSave`.

#### New Dependency
- JSZip 3.10.1 via CDN: `https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js`
- 新增 JSZip 函式庫用於本地 ZIP 打包。

---

## [2026-02-11T14:48:00Z] Local Development Environment Setup

### Features & Improvements
- **Vite Integration**: Initialized `package.json` and installed Vite to provide a modern local development environment.
  - 導入 Vite 開發環境：建立 `package.json` 並安裝 Vite，提供現代化的前端開發體驗。
- **External Network Access**: Configured `npm run dev` with the `--host` flag, allowing mobile devices on the same network to access the preview server.
  - 開放區域網路存取：設定開發伺服器允許外部連線，方便手機直接進行 UI 測試。
- **Persistent Server Config**: Added `vite.config.js` to fix the port to `5173` and ensure host access is always enabled by default.
  - 固定伺服器設定：新增 `vite.config.js` 將埠號固定為 `5173` 並預設啟動對外連線，確保手機連結始終不變。

### Technical Details
- Created `package.json` with `vite` dependency.
- Added `dev` script: `vite --host`.
- Created `vite.config.js` with `server.host: true` and `server.port: 5173`.
- 建立 package.json 與 vite.config.js 並設定開發指令。

---

---

## [2026-02-11T15:58:00Z] Visual Identity System & Repository Migration

### Features & Improvements
- **New Visual Identity (Logo Type)**:
    - Designed a new brand identity "日日記/NICHI-NICHI" using Concept B (Stacked Records).
    - **Symbol**: A minimalist 3-layer book stack icon, representing daily accumulation.
    - **Typography**: Combined the classic elegance of "Zen Old Mincho" (Full-width CJK) with the modern clarity of "Helvetica Neue" (Latin).
    - **Color Palette**: Transitioned to a premium charcoal gray (`#4A4A4A`) on a warm paper-white background (`#FDFCFB`).
    - 視覺識別系統更新：實作全新品牌 Logo (日日記 / NICHI-NICHI)，結合經典宋體與現代無襯線體，建立高品質的品牌視覺。
- **SVG Branding Assets**:
    - Exported high-precision SVG assets for `logo-icon.svg`, `logo-full-horizontal.svg`, and `logo-full-vertical.svg`.
    - 輸出高畫質 SVG 資源檔案，支援不同排版情境。
- **Header Integration & Fallback**:
    - Replaced the text-based header in `AppHeader` with the new horizontal SVG logo.
    - Implemented a robust fallback mechanism that reverts to high-quality text logotype if the SVG image fails to load.
    - 頁首整合與防錯機制：將 Logo 整合至 AppHeader 並實作破圖自動修復，確保品牌持續可見。
- **Repository Migration**:
    - Updated the remote origin to `https://github.com/keicha2025/nichi-nichi.git`.
    - 儲存庫遷移：更新遠端位置至新的專案儲存庫。

### Technical Details
- Updated `js/components/app-header.js` with `logoError` state and `@error` handling.
- Created `logo-preview.html` (and historical versions) for identity preview.
- Finalized SVG files in the root directory.
---

## [2026-02-13T10:45:00Z] Semantic Color System Re-integration & Design Consistency

### Features & Improvements
- **100% Semantic Color Linking**: Fully refactored the application's UI to remove all hard-coded Tailwind gray/accent classes. Every page now strictly adheres to the semantic tokens defined in `design-tokens.css`.
    - **Overview Page**: Standardized statistics cards, chart navigation buttons, and net debt displays. Updated bar charts to fetch colors directly from CSS variables.
    - **History Page**: Standardized transaction list typography, payment/project icons, and group headers.
    - **Add & Edit Pages**: Updated input backgrounds, currency toggles, multi-payer buttons, and selection states to use the centralized color palette.
    - **Settings Page**: Fully standardized the management interface including category/payment editors, project management, and backup/import UI.
    - **Component Library**: Standardized `AppHeader`, `AppFooter`, `SearchBar`, and the newly created `AppSelect` component.
  - 全面語義化色彩重構：全站 100% 移除硬編碼顏色類名，所有頁面與組件現已完全連動至 `design-tokens.css`。

- **Enhanced Design Tokens**: Introduced `--bdr-main` to `design-tokens.css` for standardized divider and input border styling. Defined `--chart-color-X` series for consistent data visualization.
  - 擴展設計標記：新增 `--bdr-main` 通用邊框標記，並定義標準圖表配色序列。

- **Markdown Theme Alignment**: Updated `css/markdown-body.css` to use the same semantic tokens as the rest of the application, ensuring documentation and logs match the "Muji-style" aesthetic.
  - Markdown 樣式同步：將文檔渲染樣式完全連動至系統語義色彩，確保一致的高質感視覺風格。

- **Loading & Performance UI**: Standardized the application loading spinner and sync status indicators to follow the brand identity.
  - 載入介面標準化：更新全站載入動畫與同步狀態提示，使其與品牌識別一致。

### Technical Details
- Refactored `js/pages/*.js` for standardized Tailwind class usage.
- Updated `js/components/*.js` (Header, Footer, SearchBar, AppSelect).
- Modified `css/design-tokens.css` and `css/markdown-body.css`.
- Updated `index.html` spinner and Tailwind configuration.
- 核心技術更新：重構全站 Page 與 Component 組件，並優化 CSS 標記系統。

- **Typography & UI Accessibility Tweak**: 
    - Reverted `txt-primary` to `#424242` for better contrast on titles, while keeping `txt-secondary` for descriptions.
    - Adjusted Payment Method items in Settings to use `txt-secondary` and normal font weight for a more balanced look.
    - Defined `--color-outline` and `bdr-outline` for hollow UI elements.
    - Fixed invisible borders on "Delete", "Import", "Logout", and "Google Login" buttons.
    - Restored visibility for all Checkboxes (Stats Page and Shared Links) by linking them to the new outline color.
    - Added a global CSS rule to ensure native checkboxes always have a visible border.
  - 文字與介面易用性優化：將支付方式管理文字改為次要顏色與一般字重，並修復空心元件與核取方塊的邊框顯性，確保視覺一致性。

- **Overview Hierarchy Enhancement**: 
    - Optimized color hierarchy on the Overview page: only Today's Expense remains in `txt-primary` to draw focus, while all other statistics (Monthly, All-time, Debt) are changed to `txt-secondary`.
  - 總覽頁面層次優化：優化金額顯示顏色層級，僅保留頂部「本日支出」為主色，其餘數據（本月、總額、債務）均改為次要顏色以強化視覺導向。

- **History Page UI Tweak**: Removed sticky positioning from the search bar on the History page to provide a more natural scrolling experience.
  - 明細頁面優化：取消搜尋列的固定（sticky）定位，使其隨頁面自然滾動。

- **History Batch Editing & Interaction Fixes**:
    - Implemented a long-press interaction to trigger multi-selection with a protection flag to prevent accidental de-selection.
    - Added a "Select All / Clear All" toggle logic for faster data management.
    - Updated UI: Replaced the cancel icon with a "取消" text button and improved spacing.
    - Fixed layout issues: Added `overflow-x-hidden` and optimized animations to prevent horizontal scrolling on mobile.
    - Adjusted Floating Action Bar (Approach A) position to `bottom-28` for better visibility above the app footer.
    - Optimized database performance using Firestore batch writes for multi-deletion.
  - 明細頁面批次操作與交互修復：新增長按多選保護機制，防止手放開時誤觸取消；加入「全選/取消全選」切換；優化行動裝置排版防止溢出，並將刪除按鈕上移避免被遮擋。

- **Global Branding Update**:
    - Replaced the legacy app icon (`kakei.png`) with the new visual identity (`appicon.png` and `appicon.ico`).
    - Updated `index.html` (favicon & Apple Touch Icon) and `manifest.json` (PWA icons) to ensure cross-platform consistency.

---

## [2026-02-13T11:15:00Z] Settings Page Layout Optimization & User Guide Entry

### Features & Improvements
- **GUEST Mode Layout Optimization**: Moved the "Account" section to the very top in Guest Mode to prioritize login/auth actions for new users.

- **User Guide Entry Points**:
    - Added a prominent "User Guide" button (map icon) in the Guest Account section.
    - Added a subtle "User Guide" text link at the very bottom of the Settings page for logged-in users (aligned left, no underline).
- **New Documentation Infrastructure**:
    - Created `guide.html` and `guide.md` as the foundation for the application's user manual.
    - **Language Support**: Implemented a language switcher (English/繁體中文) on guide pages.
    - Created `guide-en.html` and `guide-en.md` for English users.
- **UX Consistency**: The new navigation ensures that both guests and members can easily find help resources according to their current context.

### Technical Details
- Modified `js/pages/settings-page.js` to implement conditional rendering based on `appMode` and refined the link style.
- Added `navigateToGuide()` method to handle internal link redirection.
- Created `guide.html` and `guide-en.html` using the standard Vue + Tailwind + Markdown renderer stack.
- Implemented language switching logic using direct HTML links between guide versions.

- **UX Optimization**:
    - Forced the "Close" button in the User Guide to always return to the **Settings** page by implementing a URL `tab` parameter in `app.js`.
    - **中文說明：修正使用指南關閉按鈕，確保按下後會精確地回到「設定」分頁。**

## [2026-02-11] 19:25
### Refined
- Replaced "Admin Mode" with "**User Mode**" to better describe logged-in users.
- Added a dedicated section for **PWA (Progressive Web App)** with mobile installation instructions for iOS/Android and offline usage benefits.
- Added a **Data Management** section explaining the use of `.json` (system restore) and `.csv` (data analysis) files.
- Expanded feature documentation to cover **Split Billing**, **Custom Shared Links**, and **Project Tracking**.
- Improved readability and clarity following **Simplified Technical English (STE)** principles.
- **Fixed Style Consistency**: Restored `guide-en.html` styling to strictly match `guide.html`, ensuring consistent use of design tokens, CSS variables, and the standard `AppHeader` component.

*精煉英文使用指南內容：將「管理員模式」更名為「使用者模式」，新增 PWA 行動端安裝教學、離線使用說明以及備份檔案 (.json/.csv) 的具體用途資訊，並完整覆蓋所有核心功能說明。同時修正樣式使其與中文版完全一致。*

## [2026-02-11] 19:30
### Added
- **Navigation (TOC)**: Implemented a Table of Contents in the User Guide with smooth-scrolling anchor links.
- **Deep Dive Content**: Added advanced technical explanations for:
    - **Split Billing & Settlement**: Clarified Debt vs. Expense and how to use the "Collection" type.
    - **Data Sovereignty**: Explained the migration from Guest to User and the different roles of JSON/CSV.
    - **Privacy & Sharing**: Detailed the scope of Shared Links and name masking.
    - **Overview Logic**: Documented how Today's Expense, Budget, and Net Debt are calculated.
- **Markdown Enhancement**: Enabled `headerIds` in the Markdown renderer to allow internal document linking.

*為英文版指南新增目錄與導覽功能，並加入進階章節：詳細解說分帳邏輯與結清、資料主權與遷移、分享權限控制以及總覽頁面運算邏輯。同時優化渲染器支援標題錨點跳轉。*

## [2026-02-11] 19:40
### Refined
- **Emoji-Free Policy**: Successfully removed all visual emojis and replaced them with a custom `:icon:` syntax powered by **Material Symbols Rounded**.
- **Enhanced Content**: 
    - Added documentation on **Original Currency Recording** vs. display conversion.
    - Highlighted **Timezone Offset** tracking for travel consistency.
    - Explained **Advanced Stats Filtering** logic (Excluding Projects and Individual Share calculation).
- **Technical Fixes**: Corrected Table of Contents anchor links for perfect scroll navigation and added smooth-scrolling behavior. Optimized the Markdown renderer to support custom `id` generation (auto-stripping icons from slugs) and fixed `:icon:` parsing.
- **Visual Fixes**: Formally integrated **Material Symbols Rounded** into the guide page with proper CSS class definitions to ensure iconography renders correctly. Replaced custom markdown extensions with standard HTML spans for maximum compatibility.
- **New Section**: Added a detailed comparison between **Delete Bookkeeping Data** (clearing history) and **Delete Account** (full closure).
- **SEO & Content**: Rewrote the introduction to emphasize key differentiators: **True Dual-Currency Recording**, **Timezone-Aware Tracking**, **Data Sovereignty** (Exportable CSV/JSON), and **Offline PWA** capabilities. Added standard SEO meta tags.

*全面移除 Emoji 並改用標準 HTML Icon 標籤以確保跨瀏覽器顯示；新增原始幣別選擇、時區記錄優勢、以及統計頁面篩選邏輯（不含專案、個人份額）的詳細說明。全站 SEO 文案優化。*

## [2026-02-11] 20:00
### Synchronization
- **Chinese Guide Updated**: Fully synchronized `guide.md` and `guide.html` with the English version.
    - **SEO**: Updated meta description and introduction to matching quality.
    - **Visuals**: Implemented **Material Symbols** and smooth scrolling.
    - **Content**: Translated all new sections including **Deep Dive** (Split Billing, Data Sovereignty, Privacy) and **Account Security).
    - **PWA Highlight**: Added a new section emphasizing the **Web × App Hybrid** advantage (No download needed, Offline support).
    - **Refinement**: User manually refined Chinese copy for better flow. This version (20:25) is locked for preservation.
    - **Fix**: Resolved `slugify` logic to strip icon HTML tags, ensuring **all TOC items** (not just sub-items) scroll correctly.

*修正目錄跳轉問題：現在所有帶有 Icon 的章節標題都能正確連結。收錄並鎖定用戶手動校潤的中文版文案。*

## [2026-02-11] 20:35
### Final Documentation Polish
- **Content**: Manual refinement of `guide.md` (Chinese) to enhance "Dual-Currency" and "PWA Advantages" descriptions.
- **Ready**: Confirmed all guide page enhancements (TOC, Icons, SEO, Copy) are verified and ready for deployment.

*整合用戶最終潤飾的指南文案（雙幣管理與 PWA 優勢），確認所有導覽與視覺修正皆已也就緒，準備發布。*

## [2026-02-11] 20:41
### SEO Optimization
- **Home Page**: Updated `index.html` with Google Site Verification (`google-site-verification`).
- **Metadata**: Enhanced meta description and keywords based on `guide.md` content ("Dual-Currency", "Travel to Japan", "Data Sovereignty").
- **Rich Snippets**: Added JSON-LD Structured Data for `SoftwareApplication` and `FAQPage` to improve search engine visibility and rich result presentation.
- **Social Sharing**: Updated Open Graph and Twitter Card image to GitHub raw URL for better reliability and reachability across platforms.

*首頁 SEO 優化：加入 Google 驗證標籤、優化 Meta 描述與關鍵字，並新增 JSON-LD 結構化資料。社交分享預覽圖已更新為 GitHub 直鏈以確保抓取穩定。*

---

## [2026-02-11T21:35:00Z] PWA Support for Guide Pages

### Features & Improvements
- **Universal PWA Installation**: Added PWA manifest links and Service Worker registration to `guide.html` and `guide-en.html`. Users can now install the application directly from the "User Guide" page.
- **Launch Strategy Consistency**: Configured the PWA to always launch to `index.html` (Home Page) regardless of which page it was installed from, maintaining a consistent entry point for the application.
- **iOS Optimization**: Added meta tags for `mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style` to ensure a premium app-like experience on iOS devices for both guide versions.

- **全域 PWA 支援**：為中文與英文版使用指南頁面補齊 PWA 核心設定（manifest.json 與 Service Worker），現在用戶可從指南頁面直接將 App 下載至主畫面。安裝後啟動點一律回到首頁，確保一致的使用者體驗。

### Technical Details
- Updated `<head>` in `guide.html` and `guide-en.html` to include manifest link and iOS app tags.
- Injected Service Worker registration script before `</body>`.
- Confirmed `manifest.json` defines `start_url` as `./index.html`.

---

## [2026-02-13T22:35:00+08:00] Website Title & SEO Optimization

### Features & Improvements
- **Website Title Update**: Updated the SEO title of the application to highlight core value propositions: "專屬旅日雙幣帳本" (Travel-focused Dual-Currency Ledger), "極簡介面" (Minimalist Interface), and "一鍵匯出" (One-click Export).
- **Social Metadata Synchronization**: Synced the Open Graph (Facebook) and Twitter titles with the new branding to ensure consistent messaging across all social sharing platforms.

### Technical Details
- Modified <title> tag in index.html.
- Updated og:title and twitter:title meta tags in index.html.

*網站標題與 SEO 優化：更新首頁標題及社群標籤，強化產品核心價值（旅日雙幣、極簡、一鍵匯出）。*

---

## [2026-02-13T22:38:00+08:00] SEO URL Correction

### Fixed
- **Corrected Entry URL**: Replaced the placeholder domain 'nichi-nichi.app' with the official GitHub Pages URL 'https://keicha2025.github.io/nichi-nichi/' in all SEO meta tags. This ensures social sharing cards and canonical linking point to the correct live deployment.

### Technical Details
- Updated og:url and twitter:url in index.html.

*修正 SEO 網址：將 Meta 標籤中的入口網址修正為正確的 GitHub Pages 位置，確保社群分享與預覽卡片連結正確。*

---

## [2026-02-13T22:46:00+08:00] Brand Assets & Social Metadata Hardening

### Features & Improvements
- **Standardized Favicon Stack**: Consolidated browser and mobile icons at the top of the <head> to ensure search engines (like Google) and browsers instantly recognize the 'Nichi-Nichi' brand icon over generic domain defaults.
- **Absolute Social Image URLs**: Updated og:image and twitter:image to use the official GitHub Pages absolute path. This resolves caching issues on platforms like Line and Facebook that sometimes fail to render images from GitHub raw URLs.

### Technical Details
- Added link rel="icon", rel="shortcut icon", and rel="apple-touch-icon" to top of head in index.html.
- Switched og:image and twitter:image content to https://keicha2025.github.io/nichi-nichi/OGImage.png.

*品牌圖標與社群標籤強化：統一 Favicon 宣告順序，並將社群預覽圖改為絕對路徑，解決搜尋引擎與 Line/FB 抓取不到正確 Logo 的問題。*

---

## [2026-02-13T22:51:00+08:00] Website Description Update

### Features & Improvements
- **Copywriting Excellence**: Fully updated the application description across all platforms (Meta, OG, Twitter, and JSON-LD) to emphasize core USP: PWA offline syncing, independent dual-currency tracking, and social sharing of exportable data.
- **Messaging Alignment**: Ensured consistent brand voice between organic search results and social media snippets.

### Technical Details
- Updated meta name="description" in index.html.
- Updated og:description and twitter:description in index.html.
- Updated SoftwareApplication description in JSON-LD script (index.html).

*網站文案更新：全面更新 Meta 描述、社群標籤及 JSON-LD，強調 PWA 離線同步、雙幣別獨立統計、以及匯出分享功能，確保品牌訊息一致。*

---

## [2026-02-13T22:55:00+08:00] README Refactor & Project Documentation Update

### Features & Improvements
- **Major README Refactor**: Completely rewrote the project documentation to align with the current **Vue 3 + Firebase PWA** architecture. Removed legacy Google Apps Script (GAS) and Google Sheets setup instructions.
- **Brand Story & Value Prop**: Updated the project introduction to highlight the "True Dual-Currency" and "Data Sovereignty" core values, targeting both residents and travelers in Japan.
- **Tech Stack Transparency**: Explicitly documented the use of Vite, Firebase, and PWA Service Workers for offline reliability.

### Technical Details
- Replaced old README.md with a modern, bilingual (English/Chinese) version.
- Unified the project identity across README and home page metadata.

*重構 README：全面更新專案文件，移除過時的 GAS 指南，改為以 PWA 與 Firebase 為核心的架構說明，並強化品牌核心價值傳達。*

---

## [2026-02-15T12:35:00+08:00] Production Deployment to Dedicated Domain

### Features & Improvements
- **Cross-Repository Deployment**: Synchronized the stable `main` branch to the production static site repository (`nichi-nichi.github.io`) to update the live environment.

### Technical Details
- Added a new git remote `deploy` pointing to `https://github.com/nichi-nichi/nichi-nichi.github.io.git`.
- Executed forced push from local `main` to `deploy/main`.

*生產環境部署：將穩定的 main 分支同步至生產環境專用儲存庫，完成正式網域的內容更新。*

---

## [2026-02-15T13:25:00+08:00] Firebase Hosting Integration & CI/CD Enhancement

### Features & Improvements
- **Firebase Hosting Deployment**: Integrated automated deployment to Firebase Hosting (`nichi-nichi.web.app`). The application is now dual-deployed to both GitHub Pages and Firebase on every push to the `main` branch.
- **Improved CI/CD Pipeline**: Upgraded the existing GitHub Action workflow to handle multi-platform deployment.
- **Local Firebase Environment**: Initialized `firebase.json` and `.firebaserc` for professional hosting management.

### Technical Details
- Added `firebase.json` defining deployment root and routing rewrites.
- Established a **4-environment deployment architecture**:
    1. **Local Preview**: Vite with IP hosting (`npm run dev`).
    2. **GitHub Pages**: Automated CI/CD via GitHub Actions.
    3. **Firebase Production (`nichi-nichi`)**: Manual deployment via `npm run deploy:prod`.
    4. **Firebase Beta (`nichinichi-beta`)**: Manual deployment via `npm run deploy:beta`.
- Configured individual site entries in `firebase.json` and added `npx` based deployment scripts to ensure environment independence.
- **UI Refinement**: Reordered Settings page sections; "Account" and "User Guide" now appear at the top when in Guest mode for better onboarding.

*全環境架構確立：完成「四位一體」部署體系設定，包含本機 IP 預覽、GitHub 自動部署、Firebase 正式版 (nichi-nichi) 與測試版 (beta) 的手動控管指令。*
*介面優化：調整設定頁面佈局，訪客模式下將帳號管理與指南移至最上方，增強引導性。*

### [2026-02-15] Interface Customization Refactor & UI Polish

- **New Page**: Created `CustomListPage` as a dedicated interface for managing categories (Expense/Income) and payment methods.
- **Unified Logic**: Consolidated the editing, reordering, adding, and icon selection logic into a single component to eliminate redundant "Save" buttons and prevent data loss.
- **Bug Fixes**:
    - Resolved unreliable payment method addition by centralizing list management.
    - Fixed "Manage" button navigation failure caused by missing Vue event declarations.
    - Eliminated "restoreEditState" runtime error in SettingsPage lifecycle.
- **UI & Aesthetics Polish**:
    - **Color Standardization**: Updated all customization UI text to `txt-secondary` for a more premium, muted look.
    - **Spacing Optimization**: Adjusted "Add Item" button margins and footer spacing to achieve perfectly symmetrical 1rem vertical gaps.
    - **Layout Consistency**: Aligned management button heights (`py-3`) with primary action buttons.

*功能重構與體感優化：建立專屬自定義頁面並統一儲存邏輯，修復導覽與狀態恢復錯誤。同時調整文字為次要色調並優化間距，確保操作介面視覺對稱且一致。*

- **SEO & Social Sharing Fix**: Updated Open Graph and Twitter metadata to point to the production domain (`nichi-nichi.web.app`) and linked a stable, remote image source from GitHub to ensure correct link previews across social platforms.

*SEO 修復：更新 OG 與 Twitter 標籤網域，並將分享縮圖指向穩定的 GitHub 原始檔案路徑，解決社群分享無法顯示預覽圖的問題。*

- **Summary Dashboard Refinement**:
    - Reconstructed the categorization summary using a **3-column Grid layout** to ensure uniform sizing and clean alignment.
    - Separated Expense and Income categories into distinct sections for better organization.
    - Adopted a clean, borderless "Mini Capsule" design for a more lightweight and modern aesthetic.

*摘要介面優化：將分類摘要改為三欄位網格佈局，確保元件大小一致且排列對稱。區分支出與收入區塊，並採用無邊框的迷你膠囊設計，提升視覺簡潔感。*





### [2026-02-15] Settings Page Layout Refactor & UX Polish

- **Layout Architecture Overhaul**:
    - **Section Merging**: Merged the legacy "System Config" block into the "Account Management" card to reduce vertical clutter and group related settings.
    - **Global Reordering**: Re-prioritized page hierarchy: **Travel Plans** > **Friends List** > **Interface Customization** > **Account Management**.
    - **Adaptive Context**: Account management (with login/config) now dynamically moves to the **top** in Guest mode and stays at the **bottom** for logged-in users.
- **Visual & UI Refinements**:
    - **Profile Header**: Repositioned the User Profile (Avatar/Email) to the top of the Account section. Removed the avatar border ring for a cleaner, flatter look.
    - **Subtle Sub-cards**: Applied the standardized `bg-bg-subtle` sub-card style (with icons and rounded corners) to the merged System Config inputs.
    - **Active Feedback**: Added a functional `save` icon to the System Config header that provides visual feedback (loading spinner) during automated or manual saves.
    - **Empty State Optimization**: Removed redundant "No plans/friends" text labels. The areas now adapt their height dynamically based on content, creating a tighter layout.
    - **Consistent Alignment**: Left-aligned the "User Guide" link at the bottom of the page and ensured all empty states and section headers follow a shared vertical alignment.
- **Enhanced Interactions**:
    - **Inline Management**: Added a functional "Add Friend" `+` button and inline form directly to the Friends List section, matching the Projects management experience.
    - **Cleaner Fields**: Removed "(e.g., Kyoto Trip)" examples from input placeholders to maintain a minimalist aesthetic.

*設定頁面重構與體驗優化：合併系統設定至帳號區塊並重新定義全頁排序（計畫 > 好友 > 自定義 > 帳號）。優化用戶資訊顯示位置、移除冗餘提示文字並加入即時儲存反饋圖示，同時為好友清單新增快速操作入口，打造更極簡且高效的設定介面。*

- **[Critical Fix] Project & Friend Sync Reliability**:
    - **Immediate Persistence**: Fixed a bug where newly created projects and friends would disappear after a page reload if no transaction was submitted. 
    - **Sync Strategy**: Upgraded `handleCreateProject` and `handleAddFriendToList` to perform immediate synchronization with Firebase Firestore in Admin mode, ensuring data is persisted instantly.
    - **Removed Deferred Logic**: Deprecated the "pending updates" queue in `handleSubmit` in favor of more robust, event-driven synchronization handlers.

*重大修復：解決新增計畫或好友後，若未建立交易紀錄便重新整理會導致資料消失的問題。現在改為在新增當下立即同步至 Firebase 後端，確保資料持久性。*

- **Auto-Backup & Auth Optimization**:
    - **Persistent Authorization**: Migrated Google OAuth tokens from `sessionStorage` to `localStorage`. This allows the background auto-backup to function even after browser restarts, provided the session remains active.
    - **Smart Authorization Prompt**: Implemented a proactive authorization flow. When "Daily Auto Backup" is enabled, the system checks for a valid Google token and prompts the user with a custom explanation dialog if authentication is required.
    - **Integrated UX**: The "Daily Auto Backup" toggle now acts as an entry point for Google Services setup, ensuring a seamless connection between settings and the backup destination folder.

*自動備份與授權優化：將 Google 授權權杖從 sessionStorage 遷移至 localStorage，確保瀏覽器重啟後背景備份仍能觸發。同時在開啟「每日自動備份」時新增主動授權引導對話框，確保功能開啟時已具備必要的雲端存取權限。*

- **Strict Account Matching Logic**:
    - **Identity Guard**: Implemented backend verification during the Google Drive authorization process. The system now strictly compares the email address of the Google Drive session with the app's current logged-in account.
    - **Auto-Hinting**: Added `login_hint` to the OAuth flow to pre-select and prioritize the correct email address in the Google popup, minimizing user error.
    - **Data Integrity**: Prevents the "cross-account backup" issue where data could inadvertently be saved to a different Google account logged into the same browser.

*帳號比對機制：在 Google 雲端授權過程中加入嚴格的身分比對。系統會自動引導並檢查授權帳號是否與「日日記」登入帳號一致，防止資料誤存至同瀏覽器內的其他 Google 帳戶。*

- **Project Soft Delete Capability**:
    - **Soft Deletion Mechanism**: Implemented `visible: false` logic for projects, similar to the friends list. Deleted projects are hidden from active lists but their historical data remains intact in transaction logs and stats.
    - **In-Detail Deletion UI**: Added a "Delete Project" button within the project detail's edit mode, replacing the redundant "Cancel Edit" button for a cleaner interface.
    - **Global Filtering**: Updated transaction addition, editing, and management lists to exclude projects marked as invisible, ensuring a focused and relevant workspace.

- **Unified Delete Interface**: Synchronized deletion UI across "Friends" and "Projects". Both sections now feature a low-interference "Delete" button in edit mode, replacing the "Cancel" button for a more streamlined management experience.
    - **UI Cleanup**: Removed the "Danger Zone" from the friend detail page to maintain visual consistency with other detail components.

*介面統一化：統一好友與計畫的刪除介面。兩者現在皆於編輯模式中，以簡潔的「刪除」按鈕取代「取消編輯」，並移除好友詳情頁底部的危險區域，讓整體設計語彙更趨一致。*

---

## [2026-02-15T17:35:00+08:00] Performance & SEO Reinforcement

### Added
- **Search Engine Optimization (SEO)**: Created `robots.txt` to properly guide search engine crawlers and resolve Lighthouse SEO audit errors.
- **Resource Preconnecting**: Added `preconnect` hints for Google Fonts and Gstatic servers to reduce latency during font fetching.

### Improved
- **Loading Performance (Critical Path)**: 
    - Implemented `defer` loading for non-critical third-party libraries (`Chart.js`, `JSZip`), allowing the main UI to render faster and improving First Contentful Paint (FCP).
    - Added `&display=swap` parameter to font loading strategy (applied via `link` tags) to ensure text remains visible during font download.

### Technical Decision
- **PWA Experience Preservation**: Decided to RETAIN `user-scalable=no` in the viewport settings despite Lighthouse accessibility suggestions. This preserves the established App-like tactile interface and prevents accidental UI zooming on mobile devices, which is a core design requirement for this project.

*效能與 SEO 強化：建立 `robots.txt` 並優化資源載入策略（包含字體預連線與非關鍵腳本延遲載入），在不影響「禁止縮放」之 App 手感的前提下提升首屏渲染速度。*

---

## [2026-02-15T17:40:00+08:00] Tailwind CSS Compilation & Performance Optimization

### Improved
- **Style Delivery Performance**: 
    - Migrated from **Tailwind CDN** (client-side compilation) to **Build-time Compilation** using PostCSS and Vite.
    - Removed the hefty 1MB+ Tailwind CDN script and inline configuration from `index.html`.
    - This change significantly reduces First Contentful Paint (FCP) and eliminates the "Flash of Unstyled Content" (FOUC).

### Infrastructure
- **Build System Upgrade**: 
    - Installed `tailwindcss`, `postcss`, and `autoprefixer` as dev dependencies.
    - Created `tailwind.config.js` to centralize our semantic design tokens (Shared with `design-tokens.css`).
    - Created `postcss.config.js` to automate CSS processing within the Vite pipeline.
    - Updated `style.css` to use standard `@tailwind` directives.

*Tailwind 效能優化：將樣式系統從 CDN 即時編譯遷移至建構時編譯 (PostCSS/Vite)，移除 1MB 以上的非必要腳本負載，大幅提升 App 啟動速度與渲染效能。*

---

## [2026-02-15T17:45:00+08:00] Fixed Tailwind Configuration for CommonJS Compatibility

### Fixed
- **Module Resolution Error**: Replaced ES Module `export default` with CommonJS `module.exports` in `tailwind.config.js` and `postcss.config.js` to match the project's `"type": "commonjs"` environment. This fixes the layout breakage in the development environment.
- **Content Paths**: Expanded Tailwind content scanning to explicitly include `./js/pages/*.js` and `./js/components/*.js` to ensure all dynamic classes are correctly purged and compiled.

*修正編譯配置：將配置檔切換至 CommonJS 語法以相容目前專案環境，修復開發環境樣式失效（跑版）問題，並擴展 JS 組件掃描路徑以確保樣式完整編譯。*

---

## [2026-02-15T17:48:00+08:00] Fixed Tailwind CSS v4 PostCSS Integration

### Fixed
- **PostCSS Compatibility**: Resolved a compilation error where Tailwind CSS v4 required the separate `@tailwindcss/postcss` package. 
- **Configuration Update**: Updated `postcss.config.js` to use `@tailwindcss/postcss` instead of the legacy `tailwindcss` plugin.

*修正 Tailwind v4 相容性：安裝 `@tailwindcss/postcss` 套件並更新 PostCSS 配置，解決 v4 版架構變更導致的編譯錯誤。*

---

## [2026-02-15T17:55:00+08:00] Migrated to Tailwind CSS v4 Vite Plugin

### Improved
- **Compiler Architecture**: Migrated from PostCSS-based integration to the native **Tailwind CSS v4 Vite Plugin** (`@tailwindcss/vite`). This provides a more robust and faster compilation process within the Vite ecosystem.
- **Zero-Config Styling**: Deprecated separate `tailwind.config.js` and `postcss.config.js` files in favor of the new CSS-first configuration using the `@theme` block in `style.css`.
- **CSS Consolidation**: Moved all remaining inline `<style>` blocks from `index.html` into the centralized `style.css` for better maintainability and performance.

### Technical Detail
- Installed `@tailwindcss/vite` and configured it in `vite.config.js`.
- Cleaned up development cache (`node_modules/.vite`) to ensure fresh compilation of all utility classes.

*架構升級：全面遷移至 Tailwind CSS v4 官方 Vite 插件，棄用舊有的 JS 配置檔，改為 CSS 優先的配置模式，並整合全站樣式至 `style.css` 以追求極致性能與乾淨代碼。*

---

## [2026-02-15T18:00:00+08:00] Fixed Font Rendering & Layout Consistency

### Fixed
- **Typography Calibration**: Explicitly defined the `sans` font stack and root `16px` font size in `style.css` to match the production site's aesthetics. Fixed the "abnormal font size" issue caused by missing font-family tokens.
- **Vite Processing Guarantee**: Migrated `style.css` from a static `<link>` tag in `index.html` to a module `import` in `js/app.js`. This ensures Vite + Tailwind v4 correctly processes the theme tokens and utility classes.
- **Config Stability**: Renamed `vite.config.js` to `vite.config.mjs` to ensure reliable ESM loading across all environments.

*核心視覺修正：明確定義 Noto Sans 字體系統與 16px 基準，並將 CSS 載入模式改為 Vite 模組化導入，徹底修復字體大小異常與開發環境編譯失效的問題。*

---

## [2026-02-15T18:05:00+08:00] Reverted to Production Baseline (Tailwind CDN)

### Decisions
- **Abandon Tailwind Build-time Compilation**: Due to significant layout shifts and typography inconsistencies in the local environment compared to production, the decision was made to revert all infrastructure changes.
- **Restore UI Integrity**: Prioritized 100% visual consistency with the live `nichi-nichi.web.app` site over performance micro-optimizations.

### Reverted Changes
- **Infrastructure**: Removed `tailwindcss`, `postcss`, and `vite-plugin-tailwind` from dependencies.
- **Config**: Deleted `tailwind.config.js`, `postcss.config.js`, and reverted `vite.config.js`.
- **Scripts**: Restored Tailwind CSS CDN script and inline configuration in `index.html`.
- **Styling**: Restored original `style.css` and removed module-based CSS imports.

*全面還原：因本地編譯環境與正式版樣式存在偏差，已將所有配置還原至與 `nichi-nichi.web.app` 相同的 CDN 開發模式，確保 UI 視覺 100% 準確。*

---

## [2026-02-16T15:00:00+08:00] Logo Padding & SVG Syntax Fix

### Improved
- **SVG Buffer Space**: Expanded the canvas and added padding to `logo-full-horizontal.svg`, `logo-full-vertical.svg`, and `logo-icon.svg`.
- **Syntax Correction**: Fixed "Invalid character in entity name" error by wrapping CSS within `<![CDATA[ ]]>` blocks, ensuring Google Font URLs with ampersands (`&`) are correctly parsed by all XML editors.
- **Compatibility**: Reset `viewBox` starting coordinates to `0 0` and used `transform: translate` for padding to ensure maximum compatibility with different SVG renderers.

*標誌修復與優化：擴大畫布範圍提供緩衝空間，並修復 SVG 語法錯誤（使用 CDATA 封裝 CSS），解決部分編輯器無法開啟含 & 符號位址的問題。*


---

## [2026-02-17T17:00:00+08:00] Stats Page Mobile Layout & Date Filter Fix

### Fixed
- **Mobile Horizontal Scrolling**: Replaced the side-by-side grid layout for "Custom" date inputs with a vertical stack on small screens. Added "From" and "To" labels for better UX clarity. This ensures the page width remains fixed and prevents unintended horizontal scrolling on mobile devices.
- **Single-Day Statistics**: Fixed a bug where selecting a single day (e.g., 2/17 to 2/17) resulted in zero results. Standardized transaction date comparison by slicing the timestamp to a pure `YYYY-MM-DD` format to match the date picker's output.

### Affected Files
- `js/pages/stats-page.js`

*統計頁面優化：修正選取「自訂」日期範圍時手機版會出現左右滑動的問題（改為垂直堆疊排列），並修復無法顯示單日統計資料的 Bug。*

---

## [2026-02-17T17:15:00+08:00] Page Transition Animation Consistency

### Fixed
- **History Page Entrance Animation**: Added missing `animate-in` class to the History Page (`HistoryPage`). This ensures that when switching to the history view, the page now has the same "fade-in and slide-up" effect as all other main pages (Overview, Stats, Add, Settings), providing a more cohesive and premium user experience.

### Affected Files
- `js/pages/history-page.js`

*介面一致性優化：補上明細頁面缺失的進場動畫，確保所有主要分頁在切換時都具備統一的往上升過場效果。*

---

## [2026-02-28T12:52:00+08:00] Stats Page Daily Average Calculation Logic Update

### Improved
- **Daily Average Precision**: Updated the `Daily Avg` calculation on the Stats page to be based on the number of unique days with recorded transactions, rather than total days in the month or range.
- **Selective Calculation**: This ensures that if a user starts recording mid-month, the average reflects the actual recording activity instead of being diluted by empty days at the start of the period.

### Affected Files
- `js/pages/stats-page.js`

*統計頁面優化：將「每日平均」的計算邏輯改為除以「實際有記錄的天數」，避免月初未記錄的空白天數稀釋平均值，更精確反映實際支出情形。*

---

## [2026-02-28T13:55:00+08:00] Stats Page Daily Average Calculation Logic Adjustment (Option 2)

### Improved
- **Daily Average Calculation (Option 2)**: Adjusted the calculation from using "distinct recorded days" to "recorded date range". The denominator is now calculated from the first transaction date of the period to the end of the period (or today).
- **Better UX Expectations**: This correctly handles 0-spending days within the recording period, providing a more intuitive daily average that aligns with user expectations (e.g., if a month starts from 1/20, the average is calculated across the remaining days of the month).

### Affected Files
- `js/pages/stats-page.js`

*統計頁面優化：將「每日平均」計算方式由「不重複記帳天數」調整為「記錄區間天數」（從該月第一筆起算至月底或今天），確保包含區間內的零支出日，數值更貼近穩定預算。*

---

## [2026-02-28T14:00:00+08:00] Verify Ownership & Canonical URL Update

### Config Update
- **Google Search Console**: Updated the site verification meta tag to the latest provided by the user.
- **Environment Update**: Standardized all project references to the official domain `https://nichi-nichi.web.app/`.

### Affected Files
- `index.html`


---

## [2026-03-06T14:55:00+08:00] UX Optimization: Expanded Date/Month Selectors

### Features
- **Expanded Clickable Areas**: Wrapped date, month, and datetime-local inputs in larger containers (min-height 44px) to meet accessibility standards and improve touch interaction.
- **Global Hit Area Optimization**: Applied CSS to expand the native `::-webkit-calendar-picker-indicator` to cover the entire input area, making the whole field clickable.
- **Programmatic Picker Triggers**: Implemented `triggerPicker` logic using `showPicker()` (with focus/click fallbacks) to ensure the calendar opens reliably when any part of the container is tapped.

### Technical Details
- Modified `js/pages/stats-page.js` and `js/pages/add-page.js` to include the `triggerPicker` method and update templates.
- Updated `style.css` with global positioning rules for `input[type="date"]`, `input[type="month"]`, and `input[type="datetime-local"]`.

### Affected Files
- `js/pages/stats-page.js`
- `js/pages/add-page.js`
- `style.css`

*優化日期與月份選擇器之點擊範圍：透過 CSS 擴大原生指標區域並結合 `showPicker()` 觸發邏輯，讓使用者點擊整個輸入框任一處皆可開啟日曆，大幅提升行動端操作的便利性。*

---

## [2026-03-06T14:56:00+08:00] Deployment: Secure Secret Injection

### Security
- **Secure Secret Handling**: Refactored the GitHub Actions deployment workflow to use environment variables for `GAS_URL` and `SPREADSHEET_URL` instead of direct shell interpolation. This follows security best practices and eliminates IDE warnings.

### Technical Details
- Updated `.github/workflows/deploy.yml` with the correct `env` mapping in the "Inject Secrets" step.

### Affected Files
- `.github/workflows/deploy.yml`


---

## [2026-03-07T00:52:00+08:00] Documentation: Mobile Optimization Guide

### Added
- **Mobile Optimization Guide**: Created a comprehensive guide for converting the web app into a mobile APK.
    - **Performance Enhancements**: Documented Service Worker precaching, Firestore offline persistence, and splash screen strategies.
    - **Mobile UX Refinement**: Detailed touch target enlargement, gesture navigation (edge swipe), and haptic feedback implementation.
    - **Technical Implementation**: Proposed Capacitor/TWA as delivery paths for the APK.
    - **Native Integration**: Suggested Biometric Auth and FCM push notifications.

### Affected Files
- `docs/mobile-optimization-guide.md`


---

## [2026-03-07T01:05:00+08:00] Infrastructure: Capacitor APK Environment Setup

### Added
- **Capacitor Integration**: Initialized a new Capacitor project in `nichinichi-app/` to support APK generation.
- **Android Platform**: Added the Android native project and synced web assets from a localized `www` directory.
- **Automated Asset Generation**: Integrated `@capacitor/assets` and generated all necessary Android `mipmap` icons and splash screens from the provided `appicon.png`.
- **Localized Web Assets**: Created a deployment-ready `www` folder within the app directory containing all optimized JavaScript, CSS, and HTML resources.

### Affected Files
- `nichinichi-app/` (New Capacitor Project)
- `nichinichi-app/android/` (Native Android Project)
- `nichinichi-app/assets/` (Source Assets)
- `nichinichi-app/www/` (Bundled Web Assets)


---

## [2026-03-07T14:18:00+08:00] Bug Fix: Mobile Google Authentication

### Fixed
- **Native Google Login**: Resolved an issue where login failed in the mobile app by installing the native `@codetrix-studio/capacitor-google-auth` plugin.
- **API Logic**: Updated `js/api.js` to correctly bridge the native Google identity with Firebase Auth using `signInWithCredential`.
- **Firebase Configuration**: Added missing `reauthenticateWithCredential` to the Firebase service layer for full account management support in mobile mode.
- **Project Structure**: Synced latest web assets to the `nichinichi-app/www` directory and updated Capacitor sync.

### Affected Files
- `js/api.js`
- `js/firebase-config.js`
- `nichinichi-app/package.json`
- `nichinichi-app/www/`


---

## [2026-03-07T14:25:00+08:00] Infrastructure: Package Name Unification & Google Auth Alignment

### Changed
- **Package ID Unification**: Renamed the Android package ID from `com.keicha.nichinichi` to `com.nichinichi.app` across all configuration files to match the Firebase console and `google-services.json`.
- **Directory Structure**: Relocated `MainActivity.java` to `android/app/src/main/java/com/nichinichi/app/` to align with the new package declaration.
- **Capacitor Configuration**: Updated `capacitor.config.ts` with the new `appId` and added `serverClientId` for enhanced Google Auth stability.
- **Android Resources**: Updated `strings.xml` and `build.gradle` with the unified package identifier and namespace.

### Affected Files
- `capacitor.config.ts`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml` (implicitly via sync)
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/java/com/nichinichi/app/MainActivity.java`


*統一包名與 Google 登入設定：將專案包名全面改為 `com.nichinichi.app` 以匹配 Firebase 設定，並完成 Android 原始碼路徑重構與環境同步。*

---

## [2026-03-07T16:15:00+08:00] Bugfix: White Screen resolved & Dual Currency Widgets implemented

### Fixed
- **App Startup (White Screen)**: Unified JavaScript module imports by removing `?v=...` version suffixes. This prevents multiple module instances and conflicts in the WebView environment, which was the primary cause of startup failure.

### Added
- **Dual Currency Widgets**: Split the single daily expense widget into two separate native Android widgets: `NichiWidgetJpy` and `NichiWidgetTwd`.
    - **NichiWidgetJpy**: Shows only Japanese Yen (JPY) daily expenses.
    - **NichiWidgetTwd**: Shows only Taiwan Dollar (TWD) daily expenses.
- **Native Android Registration**: Registered both `NichiWidgetJpy` and `NichiWidgetTwd` in `AndroidManifest.xml` and created their respective `AppWidgetProvider` classes and XML info files.

### Changed
- **Data Synchronization**: Updated `js/api.js` to calculate and store totals for both currencies in `SharedPreferences` as `today_total_jpy` and `today_total_twd`.

### Affected Files
- `js/app.js`
- `js/api.js`
- `index.html`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/xml/nichi_widget_jpy_info.xml`
- `android/app/src/main/res/xml/nichi_widget_twd_info.xml`
- `android/app/src/main/java/com/nichinichi/app/NichiWidgetJpy.java`
- `android/app/src/main/java/com/nichinichi/app/NichiWidgetTwd.java`

*修復啟動白屏與實作雙幣別獨立小工具：統一模組引用格式解決白屏問題，並在安卓端新增兩個獨立小工具分別顯示 JPY 與 TWD 當日花費。*

---

## [2026-03-07T16:55:00+08:00] Verify: Android Build & Native Widgets Finalization

### Summary
Verified and finalized the Android build environment by ensuring the Capacitor `www` directory matches the project source. Confirmed the implementation of independent JPY and TWD widgets.

### Technical Details
- **Source Alignment:** Discovered that the `nichinichi-app/www` folder (used as source for Capacitor) contained outdated files with incorrect import paths. Synchronized `js/`, `css/`, and `index.html` from the root to `nichinichi-app/www/`.
- **Capacitor Sync:** Ran `npx cap sync android` to update the native `android/` project with the aligned assets.
- **Widget Consistency:** Re-verified that `syncWidget` in the deployed `api.js` now correctly populates `today_total_jpy` and `today_total_twd` for use by the two separate Android widgets.

### Affected Files
- `nichinichi-app/www/index.html` (Updated)
- `nichinichi-app/www/js/app.js` (Updated)
- `nichinichi-app/www/js/api.js` (Updated)
- `android/app/src/main/assets/public/` (Synced)

*最終環境確認：同步 Capacitor web 目錄並推送至 Android 原生專案，確認兩個獨立幣別的小工具逻辑已正確部署且不會產生白屏現象。*

---

## [2026-03-07T16:25:00+08:00] Fix: Widget Real-time Sync & Timezone Consistency

### Summary
Fixed the issue where Android App Widgets failed to update in real-time or displayed incorrect data due to timezone mismatches.

### Technical Details
- **JS Logic (api.js)**: 
    - Migrated from UTC-based today detection to **Local Timezone (ISO)** detection to ensure "Today" in the widget matches the user's local day.
    - Improved Payer identification to correctly include transactions where the payer is stored as a Firebase UID (post-Auth sync).
- **Native Enhancement (MainActivity.java)**:
    - Overhauled `WidgetUpdatePlugin` to use explicit Intent broadcasts for both `NichiWidgetJpy` and `NichiWidgetTwd`.
    - This ensures that native layouts are forced to re-render immediately after JS data is saved to `SharedPreferences`.
- **Consistency**: Re-synchronized web assets and native config.

### Affected Files
- `js/api.js` (Improved sync logic)
- `nichinichi-app/android/app/src/main/java/com/nichinichi/app/MainActivity.java` (Direct widget refresh)

*小工具同步修正：修正時區判定導致的數據偏移問題，並強化原生端的刷新機制，確保 App 紀錄新增後桌面的 JPY/TWD 小工具能立即更新正確數值。*

---

## [2026-03-07T16:35:00+08:00] UI: Bulk Delete UI Migration (History Page)

### Summary
Relocated the bulk delete button in the History Page to improve UI cleanliness and align with common mobile interaction patterns.

### Technical Details
- **UI Structure (HistoryPage)**: 
    - Removed the floating capsule-style "Delete X items" button at the bottom.
    - Integrated a compact **"Delete" (刪除)** button into the top selection bar, positioned to the right of the "Select All" button.
    - Added a subtle separator line for visual hierarchy.
- **Interactions**:
    - The delete button only appears when at least one item is selected.
    - Preserved the batch-deletion confirmation dialog.

### Affected Files
- `js/pages/history-page.js`

*明細頁介面優化：移除底部浮動的刪除按鈕，改為整合於上方「已選取」狀態欄位中（位於「全選」右側），提升操作直覺性並優化視覺清爽度。*

---

## [2026-03-07T16:40:00+08:00] UI: Delete Button Color Update

### Summary
Changed the color of the delete button in the History Page from red to a neutral tone to maintain the "MUJI" minimalist aesthetic.

### Technical Details
- **UI Styling (HistoryPage)**: 
    - Changed CSS class from `text-danger` to `text-txt-secondary`.
    - Set hover state to `text-txt-primary` for subtle feedback.
    - Updated both Web and App versions.
- **Rationale**: Red was deemed too jarring for the current design system.

### Affected Files
- `js/pages/history-page.js`

*刪除按鈕色彩修正：將原本紅色的刪除按鈕改為中性色（次要文字色），以符合整體的極簡風格，並已同步部署至網頁版與 App 版。*

---

## [2026-03-09T23:45:00+08:00] Refactor: Cache-First Rendering & Background Synchronization

### Summary of changes
Implemented a high-performance background synchronization system with cache-first rendering and optimistic UI updates to eliminate loading latency and improve user experience responsiveness.

### Technical details of implementation
- **Cache-First Loading Strategy**: Updated `loadData` to prioritize local cache in `localStorage` for immediate page rendering before data synchronization begins.
- **Optimistic UI Updates**: All data modification operations (Create, Update, Delete) now reflect changes in the local state immediately, allowing the UI to remain responsive during network communication.
- **Non-blocking Background Sync**: Replaced interruptive full-screen loading overlays with a subtle, non-blocking "SYNCING" indicator in the application header.
- **Header UI Refinement**: Simplified the header by removing login status badges and focusing solely on the dynamic synchronization status to maintain MUJI minimalism.
- **Project Detail Decoupling**: Refactored the Project Detail page to use event-based state management, moving API logic to the central `app.js` for consistent background sync handling.

### Affected files or modules
- `/js/app.js`: Core implementation of the background sync and caching engine.
- `/js/components/app-header.js`: Dynamic sync status display logic.
- `/js/pages/project-detail-page.js`: Refactored to emit sync events.
- `index.html`: Updated event bindings for decentralized components.

### Potential side effects or migration notes
- Users will no longer see blocking spinners during data entry; the "SYNCING" status in the top-right is now the primary feedback.
- Manual data refresh can be triggered by the "RETRY SYNC" button if a sync failure occurs.

*效能與架構重構：實作「快取優先」載入與「樂觀更新」機制，數據變動會立即反應在畫面上並於背景同步，大幅提升流暢度。標題列已簡化為僅顯示動態同步狀態。*






