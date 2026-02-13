# Changelog

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
