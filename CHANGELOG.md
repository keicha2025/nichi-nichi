# Changelog

## [2026-02-13] Transaction Name Resolution & UI Refinement

### Added
- **Data Persistence Strategy**: Enhanced transaction storage to include both `payerUid` and `payerFid`, ensuring accurate identity tracking even if display names change.

### Improved
- **Smart Name Resolution**: Upgraded `getFriendName` in `HistoryPage` and `EditPage` to resolve UIDs and FIDs against friend lists and project collaborators.
- **Privacy Shielding**: Implemented UI logic to mask raw Firebase UIDs, displaying a fallback "朋友" (Friend) label when resolution fails.
- **Project Detail UI Refinement**:
  - Replaced the interactive sharing scope switcher in preview mode with a clean, read-only text status: "已開啟共享功能 | [範圍]".
  - Unified "查看明細" button styles across all project viewing states.

### Fixed
- **History Page Syntax Error**: Resolved a syntax error introduced during the name resolution refactor.

*優化了交易名稱解析機制，解決了明細頁面顯示 UID 的問題，並優化了專案詳情頁在預覽模式下的 UI 顯示與按鈕一致性。*

## [2026-02-13] Project Landing Bug Fix & UI Refinement

### Fixed
- **Project Landing inviteName Bug**: Resolved a `ReferenceError` where `inviterName` was undefined in the `API.joinProject` method. Improved parameter passing from `ProjectLanding.js`.
- **System Modal Logic**: Fixed broken click event handlers (`handleConfirm`, `handleSecondaryAction`) in `system-modal.js` by reverting to standard `$emit` patterns.

### Updated
- **Project Detail UI Enhancements**:
  - **Action Button Styling**: "Copy Link" and "IOS Share" buttons updated to white background with shadows and normalized height for a premium feel.
  - **Sharing Scope Switcher**: Replaced traditional radio buttons with a modern capsule-styled segmented control, matching the Stats Page aesthetic.
  - **Mode-Specific Visibility**: Restructured the UI to hide edit-related buttons ("Update Settings", "Cancel") while in preview mode to prevent user confusion.
- **System Modal Styling**: Standardized secondary buttons with a dedicated gray background (`bg-bg-subtle`) for better visual hierarchy.

### Added
- **Project Deletion**: Implemented `API.deleteProject` logic and added a "Delete Plan" action button within the project edit interface.

*修復了加入專案時的程式錯誤，並優化了專案詳情頁的 UI，包含按鈕樣式美化、共享範圍切換器改版，並新增了刪除計畫的功能。*


## [2026-02-13] Collaboration Data Flow Fix & UI Optimization

### Fixed
- **Collaboration Data Flow Fix**: Resolved an issue where `collaborationEnabled` was not being saved to Firestore during project creation in `app.js`.
- **Project Detail UI Optimization**:
  - Replaced the bottom "View History" button with a prominent "Copy Link" and "Share" action row in preview mode for collaborative projects.
  - Moved "View History" to a secondary text link below the sharing tools.
  - Removed the redundant invitation block from the middle of the project details to create a cleaner layout.
- **Form State Reset**: Updated `settings-page.js` to ensure the project creation form resets with `collaborationEnabled: true` correctly.

*修復了建立專案時協作狀態無法儲存的 Bug，並優化了詳情頁預覽模式下的按鈕佈局，將分享工具移至底部最醒目的位置。*

## [2026-02-13] Invitation System Refinement & UI Polishing

### Added
- **Project Landing UI Sync**: Updated `ProjectLanding.js` to match `InviteLanding.js` aesthetics, including "Quick Guide" and "Google Login" buttons.
- **Persistent Invitation Tools**: Moved "Copy Link" and "Share" buttons in `ProjectDetailPage.js` to be persistently visible in preview mode whenever collaboration is enabled.
- **In-Form Collaboration Toggle**: Added a "Enable Two-way Collaboration" pill-style toggle to the project creation form in `SettingsPage.js`.

### Fixed
- **Short URL Resolution**: Improved `app.js` to ensure even logged-in users are correctly routed to invitation landing pages when using short links.
- **Privacy UI Split**: Separated "Copy" and "Share" actions into distinct buttons across the app for better usability.
- **Gmail persistent display**: Enhanced logic to ensure friend Gmail addresses are captured and displayed in the settings list.

*優化了邀請系統的 UI 與邏輯，包含統一開關樣式、簡化複製內容、修復已登入使用者的跳轉問題，並確保好友 Gmail 資訊正確顯示。*

## [2026-02-13] Short URL Mapping & Privacy UI Split
- **[New] Firestore Short Invite Mapping**: Implemented a `short_invites` collection to map long invitation URLs to 6-character short IDs.
- **[UI] Split Invitation Buttons**: Separated "Copy Invite Link" into distinct "Link" (Copy) and "Share" (Native iOS/Android Share) icons.
- **[UI] Renamed Section**: Updated "Social & Privacy Management" to "Privacy Settings".

## [2026-02-14] (Future Records - Legacy Context)
*(Previous records archived below)*

- **Multi-site Hosting Support**: Configured Firebase Hosting for `prod` and `beta` targets.
- **Data Consistency & UID Refactoring**: Refactored "Me" label to persistent UIDs and updated migration tools.
- **Color System Unification**: Replaced hardcoded colors with semantic design tokens.
- **Collaborative Projects**: Implemented host-based sharing and security rules.
