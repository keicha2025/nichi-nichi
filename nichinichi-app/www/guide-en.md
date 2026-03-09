# Nichi-Nichi Log User Guide

**The Privacy-First, Dual-Currency Expense Tracker for Global Citizens**

Nichi-Nichi Log is a minimalist ledger application designed specifically for **expats, digital nomads, and frequent travelers** who manage finances across borders. Unlike traditional expense trackers that simply convert currencies for display, Nichi-Nichi Log offers:

- **True Dual-Currency Recording**: Record every transaction in its **Original Currency** (e.g., JPY used in Tokyo) while maintaining a base view in your **Home Currency** (e.g., TWD). The app preserves the original amount and exchange rate at the moment of spending, ensuring historical accuracy regardless of future market fluctuations.
- **Timezone-Aware Tracking**: Automatically captures the **Timezone Offset** for each entry. Whether you're in New York or Taipei, your "Today's Expenses" reflect your actual local day, keeping your daily logs precise and consistent.
- **Data Sovereignty & Export**: Your financial data is yours alone. We provide full **CSV and JSON export** capabilities, allowing you to backup, migrate, or analyze your spending in external tools like Excel or Google Sheets.
- **Offline-First PWA**: Built as a Progressive Web App, it works flawlessly without an internet connection—perfect for recording expenses on flights or in remote areas.

---

## <span class="material-symbols-rounded">list</span> Table of Contents
- [Mobile App Experience (PWA)](#mobile-app-experience-pwa)
- [Application Modes](#application-modes)
- [Recording Expenses](#recording-expenses)
- [Project & Trip Management](#project--trip-management)
- [Shared Links](#shared-links)
- [Data Backup & Export](#data-backup--export)
- [Deep Dive: Advanced Features](#deep-dive-advanced-features)
    - [Split Billing & Settlement Logic](#split-billing--settlement-logic)
    - [Data Sovereignty: Backup & Migration](#data-sovereignty-backup--migration)
    - [Privacy & Sharing Controls](#privacy--sharing-controls)
    - [Currency & Timezone Precision](#currency--timezone-precision)
    - [Advanced Statistical Filtering](#advanced-statistical-filtering)
    - [Overview Dashboard Calculation](#overview-dashboard-calculation)
- [Account & Data Security](#account--data-security)
- [FAQ](#faq)

---

## <span class="material-symbols-rounded">smartphone</span> Mobile App Experience (PWA)

**Web × App Hybrid: Native Experience without Downloads**

No need to visit an app store—simply use Nichi-Nichi Log directly in your browser. Powered by **PWA (Progressive Web App)** technology, you can add it to your home screen for a full-screen, native app experience hidden from the address bar.

Supports **Offline Recording & Auto-Sync**: Even with poor reception (e.g., in subways), your records are saved locally and automatically synced to the cloud once you’re back online.

### How to Install
- **On iOS (Safari)**: Tap the **Share** button (box with upward arrow) and select **Add to Home Screen**.
- **On Android (Chrome)**: Tap the **Three Dots** menu and select **Install App** or **Add to Home Screen**.

---

## <span class="material-symbols-rounded">person</span> Application Modes

The app operates in two primary modes:

### Guest Mode (Local Only)
- Ideal for quick, private use.
- Data is stored only in your browser's local storage.
- **Warning**: Clearing your browser cache may delete your data.

### User Mode (Cloud Sync)
- Enabled when you log in with your **Google Account**.
- Data syncs automatically to a secure cloud database.
- Access your data from any device.

---

## <span class="material-symbols-rounded">edit</span> Recording Expenses

### 1. Basic Recording
1. Tap the **Add** (<span class="material-symbols-rounded">add</span>) icon in the navigation bar.
2. Select a type: **Expense**, **Income**, or **Collection** (Debt repayment).
3. Enter the **Amount** and **Item Name**.
4. Choose a **Category** and **Payment Method**.

### 2. Multi-Currency Support
- Switch between **JPY** and **TWD** using the toggle in the top header.
- View real-time conversions based on the exchange rate set in **Settings**.

---

## <span class="material-symbols-rounded">flight</span> Project & Trip Management

Use **Projects** to group expenses for specific events like a trip to Japan.

1. Create a Project in **Settings** with a name and date range.
2. The app automatically selects the project based on the transaction date.
3. Use the **Stats** page to analyze spending for a specific project.

---

## <span class="material-symbols-rounded">link</span> Shared Links

Share your financial records with others without giving them account access.

1. Go to **Settings** > **Shared Links**.
2. Create a link and set the **Scope**:
    - **All**: Shares all records.
    - **Range**: Shares records within specific dates.
    - **Project**: Shares only one specific project.
3. Configure privacy: Hide friend names or project titles if necessary.
4. Copy the URL and send it to your friends. They will see a **View-only Dashboard**.

---

## <span class="material-symbols-rounded">save</span> Data Backup & Export

You can download your data to your device or save it to the cloud.

### 1. Cloud Save (Google Drive)
Back up your database to your Google Drive. It saves two files:
- A **.json** file for system restoration.
- A **Google Sheet** for easy viewing.

### 2. File Export (ZIP)
Export your local data as a **.zip** package containing:
- **Backup.json**: A full backup of your transactions, categories, and settings.
- **Export.csv**: A spreadsheet-compatible file for external software.

---

## <span class="material-symbols-rounded">search</span> Deep Dive: Advanced Features

### Split Billing & Settlement Logic
The app distinguishes between **Direct Expenses** and **Shared Debts**.
- **Paying for Others**: When you pay for a friend, the app records this as a "Debt" they owe you. 
- **The "Me" Share**: In Split Mode, you can specify exactly how much you paid versus how much was for others.
- **Settlement (Collection)**: To clear a debt, record a transaction as **Collection** type. This subtracts the amount from the friend's debt balance, effectively "closing the tab."

### Data Sovereignty: Backup & Migration
Your data belongs to you. We provide tools to move it freely.
- **From Guest to User**: When you first log in, the app detects local data and asks if you want to **Merge** it into your cloud account.
- **JSON vs. CSV**: 
    - Use **JSON** when moving between devices or Nichi-Nichi accounts. It preserves all metadata (Categories, Projects, Icons).
    - Use **CSV** for external analysis. You can import this into Excel to create your own custom charts.
- **Full Deletion**: You can "Delete Bookkeeping Data" at any time. This wipes the database but keeps your account.

### Privacy & Sharing Controls
Shared links are designed to be "minimal leak."
- **Masking names**: If you enable "Hide Friend Names," all beneficiaries are shown as "Friend" or masked codes.
- **Excluding Projects**: You can share your "Daily Groceries" while completely excluding specific trip expenses from the same link.
- **Revocation**: If you delete a Shared Link in Settings, the URL becomes invalid immediately.

### Currency & Timezone Precision
Recording accurate data is the foundation of bookkeeping.
- **Original Currency Selection**: You must select the currency (JPY/TWD) **at the time of recording**. The app does not simply switch display currencies; it stores the actual currency used in the transaction to preserve historical accuracy.
- **Timezone Capture**: The app automatically records the **Timezone Offset** when you save a transaction. This ensures that even if you travel across timezones, your "Today's Expense" remains consistent with the time and place the spending actually occurred.

### Advanced Statistical Filtering
The **Stats** page includes powerful filters to help you understand your spending habits beyond raw totals.
- **Exclude Projects**: Use this to see your "True Living Expenses." It removes one-time large costs associated with trips (Projects), allowing you to focus on your daily lifestyle patterns.
- **Show Only My Share**: If you frequently pay for others or split bills, this filter calculates the total based **only on the amount you actually consumed**. It excludes debts owed by others, giving you a precise view of your personal financial impact.

### Overview Dashboard Calculation
The Overview page provides a high-level summary:
- **Today's Expense**: Sum of all expenses recorded today, converted to your view currency.
- **Monthly Budget**: Comparison of your current month's spending against your previous performance.
- **Net Debt**: The most critical number. It is the sum of (What people owe you) minus (What you owe the app/others). 
- **Base Currency Detection**: On startup, the app intelligently detects the currency of your most recent entries and sets that as the default dashboard view.

---

## <span class="material-symbols-rounded">security</span> Account & Data Security

We provide two levels of data removal to ensure your privacy while maintaining flexibility.

### 1. Delete Bookkeeping Data
- **What it does**: Wipes all transactions, projects, and categories from your current account.
- **What stays**: Your Google login remains active, and your application settings (Exchange rate, User name) are preserved.
- **Use case**: When you want to "start over" for a new year or a new lifestyle without creating a new account.

### 2. Delete Account (Account Closure)
- **What it does**: Permanently removes your entire identity and all associated data from our systems. 
- **What stays**: Nothing. All cloud data and shared links will immediately become inaccessible.
- **Use case**: When you no longer wish to use Nichi-Nichi Log and want all personal footprints removed.
- **Security Check**: This action requires a fresh Google re-authentication to prevent accidental or unauthorized deletion.

---

## <span class="material-symbols-rounded">help</span> FAQ

### How do I delete many records at once?
1. Go to the **History** page.
2. **Long-press** any record to enter **Multi-Select Mode**.
3. Select the items you want to remove.
4. Tap the **Red Trash** button at the bottom.

### Can I change my default currency?
Yes. Go to **Settings** and update the **Exchange Rate**. You can switch the view currency anytime in the App Header.
