# **Technical Specification**

## **1\. System Architecture**

### Dual-Mode Persistence

The application operates in two distinct modes based on user authentication, ensuring both privacy for casual users and data portability for power users.

* **Guest Mode (Offline-First)**:  
  * **Storage**: Browser `localStorage`.  
  * **Data Scope**: strictly local to the device.  
  * **Persistence**: Data survives page reloads but is cleared if browser cache is purged.  
* **Admin Mode (Authenticated)**:  
  * **Storage**: Google Cloud Firestore.  
  * **Authentication**: Firebase Authentication (Google Provider).  
  * **Data Scope**: Synced across devices logged into the same Google account.  
  * **Optimization**: Uses optimistic UI updates in   
  * app.js to ensure responsiveness before confirming writes with Firestore.

### No-Build Runtime

* **Architecture**: Native ES Modules (ESM) architecture loaded directly by the browser.  
* **Dependencies**: All external libraries (Vue 3, Tailwind, Firebase SDK, Chart.js) are imported via CDN.  
* **Deployment**: Static file serving (GitHub Pages compatible).

---

## **2\. Data Schema**

### 2.1 Cloud Firestore (Admin Mode)

**Root Collection**: `users/{uid}` Stores user metadata and configuration.

| Field | Type | Description |
| :---- | :---- | :---- |
| `config` | Map | User settings (`user_name`, `fx_rate`, `auto_backup`). |
| `categories` | Array | List of category objects `{id, name, icon, type, order}`. |
| `paymentMethods` | Array | List of payment methods `{id, name, icon, order}`. |
| `friends` | Array | List of friend names (Strings). |
| `projects` | Array | List of project objects `{id, name, startDate, endDate, status}`. |

**Subcollection**: `users/{uid}/transactions` Stores individual financial records.

| Field | Type | Description |
| :---- | :---- | :---- |
| `id` | String | Primary Key (Firestore Document ID). |
| `amount` | Number | Transaction amount. |
| `currency` | String | "JPY" or "TWD". |
| `type` | String | "支出" (Expense), "收入" (Income), "收款" (Collection). |
| `categoryId` | String | Reference to category ID. |
| `paymentMethod` | String | Reference to payment method ID. |
| `spendDate` | String | ISO Date String (Local time). |
| `name` | String | Description. |
| `note` | String | Extended notes. |
| `friendName` | String | Comma-separated names for split interaction. |
| `payer` | String | Name of the payer (defaults to "我"). |
| `personalShare` | Number | The user's specific share in a split bill. |
| `projectId` | String | Reference to Project ID. |
| `utc` | String | Timezone offset (e.g., "+09:00") for sync accuracy. |
| `row` | Number | **\[DEPRECATED\]** Legacy identifier from Google Apps Script version. Preserved for backward compatibility but superseded by `id`. |

### 2.2 LocalStorage (Guest Mode)

Data is serialized as JSON strings under the following keys:

* `guest_data`: `{ transactions: [...] }`  
* `guest_config`: `{ user_name, fx_rate }`  
* `guest_categories`: List of category objects.  
* `guest_payments`: List of payment method objects.  
* `guest_friends`: List of friend names.

---

## **3\. Core Business Logic**

### 3.1 Debt & Share Calculation

The system calculates net debt based on the relationship between `amount`, `payer`, and `personalShare`.  
**Formulas:**

1. **Expense (Paid by Me)**:  
   * *Scenario*: User pays full amount, splits with others.  
   * *Logic*: `Net Debt = Amount - Personal Share`  
   * *Meaning*: Positive value indicates money owed TO the user (Credit).  
2. **Expense (Paid by Friend)**:  
   * *Scenario*: Friend pays, user has a share.  
   * *Logic*: `Net Debt = -Personal Share`  
   * *Meaning*: Negative value indicates money owed BY the user (Debt).  
3. **Collection (Repayment)**:  
   * *Scenario*: Friend pays back money.  
   * *Logic*: `Net Debt = -Amount`  
   * *Meaning*: Reduces existing credit.

### 3.2 Currency Conversion

* **Base Currency**: Toggled globally between JPY and TWD.  
* **Conversion Logic**:  
  * If `Transaction Currency == Base Currency`: No conversion.  
  * If `Transaction != Base`: Apply `fx_rate` (User defined fixed rate).  
  * *Note*: Conversion happens at runtime for display; original amounts are always preserved in DB.

---

## **4\. API & External Integrations**

### 4.1 Transaction Data Flow (Admin Mode)

Sequence from User Action to Database Persistence:  
FirebaseAPI.jsApp.jsAddPageUserFirebaseAPI.jsApp.jsAddPageUserFills form & clicks SaveValidates Input (Amount \> 0)emit('submit', payload)Update Local State (Optimistic UI)saveTransaction(payload)addDoc(users/{uid}/transactions, payload)Returns Document ReferenceReturns SuccessShows "Success" Modal

### 4.2 Google Services Integration

* **Scope Strategy**: Incremental Auth. The app requests `drive.file` and `spreadsheets` scopes *only* when the user triggers Backup or Export, not at login.  
* **Services**:  
  * `GoogleSheetsService.js`: Manages Drive API calls.  
  * **Backup**: Dumps raw JSON state to a specific Drive Folder (`/日日記`).  
  * **Export**: Generates a human-readable Google Sheet with resolved names (Categories, Projects) instead of IDs.

---

## **5\. Routing & State Management**

### 5.1 View Architecture

* **Router**: Custom implementation in   
* app.js using `currentTab` state.  
* **Navigation**:  
  * `Overview`: Dashboard.  
  * History: List view (`historyFilter` state manages search/projects).  
  * Add: Transaction creation.  
  * Stats: Visualization.  
  * Settings: Configuration.  
  * Edit: Contextual view overlay (replaces logic of Add page).  
  * `ProjectDetail`: Contextual view for Trip specifics.

### 5.2 State Propagation

* **Principle**: Unidirectional Data Flow.  
* **Store**:   
* app.js holds the "Truth" (`transactions`, `config`).  
* **Downstream**: Passed to pages via Vue `props`.  
* **Upstream**: Pages emit events (`@submit`, `@update`, `@delete`) which   
* app.js handles to mutate state and trigger `API` calls.

---

## **6\. Known Limitations & Technical Debt**

1. **Legacy `row` Field**: References to a `row` property exist in   
2. edit-page.js and   
3. api.js from the pre-Firestore era. This should be formally deprecated and removed in favor of `id`.  
4. **Real-Time Sync**: Firestore listeners are not active for the transaction list to save bandwidth/reads. Sync is "Fetch on Load" \+ "Push on Write". Multi-device real-time updates require a reload.  
5. **Hardcoded Currencies**: JPY/TWD logic is pervasive in specific template conditions. Adding a 3rd currency would require refactoring   
6. stats-page.js and   
7. overview-page.js.

