export const GoogleSheetsService = {
    // --- Internal Helpers ---

    /**
     * Fetch with Automatic Retry for 401/403 Errors
     * @param {string} url 
     * @param {object} options 
     * @param {string} token - Initial valid token
     * @param {function} onTokenExpired - Async callback to get a new token. Should return new token string.
     */
    async _fetchWithRetry(url, options, token, onTokenExpired) {
        let currentToken = token;

        // Helper to construct headers
        const getHeaders = (t) => {
            const h = { 'Authorization': `Bearer ${t}`, ...options.headers };
            // Remove 'Content-Type' if it's FormData (browser handles it), BUT our calls usually send JSON
            return h;
        };

        try {
            // First Attempt
            options.headers = getHeaders(currentToken);
            let res = await fetch(url, options);

            // Check for Auth Error
            if (res.status === 401 || res.status === 403) {
                console.warn("[GoogleSheetsService] Token expired or invalid. Attempting refresh...");

                if (typeof onTokenExpired === 'function') {
                    // 1. Invalidate old token (handled by caller ideally, but we can assume onTokenExpired does the job of getting a FRESH one)
                    // 2. Get New Token
                    try {
                        const newToken = await onTokenExpired();
                        if (newToken) {
                            console.log("[GoogleSheetsService] Token refreshed. Retrying request...");
                            currentToken = newToken;
                            // Update Headers
                            options.headers = getHeaders(currentToken);
                            // Retry
                            res = await fetch(url, options);
                        } else {
                            throw new Error("Failed to refresh token");
                        }
                    } catch (refreshErr) {
                        console.error("[GoogleSheetsService] Re-auth failed", refreshErr);
                        throw refreshErr; // Propagate the refresh error
                    }
                } else {
                    console.warn("[GoogleSheetsService] No refresh callback provided.");
                }
            }

            // Final Response Check
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error?.message || `Request Failed: ${res.status}`);
            }
            return await res.json();

        } catch (error) {
            throw error;
        }
    },

    // --- Drive Folder & File Helpers ---

    async ensureFolder(name, token, onTokenExpired) {
        let folder = await this.findFolder(name, token, onTokenExpired);
        if (!folder) folder = await this.createFolder(name, token, onTokenExpired);
        return folder;
    },

    async findFolder(name, token, onTokenExpired) {
        const q = `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`;

        const data = await this._fetchWithRetry(url, { method: 'GET' }, token, onTokenExpired);
        return data.files?.[0];
    },

    async createFolder(name, token, onTokenExpired) {
        const url = 'https://www.googleapis.com/drive/v3/files';
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' })
        };
        return await this._fetchWithRetry(url, options, token, onTokenExpired);
    },

    async moveFileToFolder(fileId, folderId, token, onTokenExpired) {
        // Get current parents
        const getUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=parents`;
        const fileData = await this._fetchWithRetry(getUrl, { method: 'GET' }, token, onTokenExpired);
        const prevParents = fileData.parents?.join(',') || '';

        const moveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${folderId}&removeParents=${prevParents}`;
        await this._fetchWithRetry(moveUrl, { method: 'PATCH' }, token, onTokenExpired);
    },

    async saveJsonFile(folderId, name, data, token, onTokenExpired) {
        const metadata = { name, parents: [folderId], mimeType: 'application/json' };
        const fileContent = JSON.stringify(data, null, 2);

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([fileContent], { type: 'application/json' }));

        const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        const options = {
            method: 'POST',
            body: form
            // Do NOT set Content-Type for FormData
        };
        return await this._fetchWithRetry(url, options, token, onTokenExpired);
    },

    // --- Sheets API Helpers ---

    async createSpreadsheet(title, token, onTokenExpired) {
        const url = 'https://sheets.googleapis.com/v4/spreadsheets';
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ properties: { title } })
        };
        return await this._fetchWithRetry(url, options, token, onTokenExpired);
    },

    async writeData(spreadsheetId, range, values, token, onTokenExpired) {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
        const options = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values })
        };
        return await this._fetchWithRetry(url, options, token, onTokenExpired);
    },

    // --- High Level Functions ---

    /**
     * Backup Full Data to JSON in '/日日記' folder
     * @param {object} data 
     * @param {string} token 
     * @param {function} onTokenExpired - Callback to refresh token
     */
    async backupFullData(data, token, onTokenExpired) {
        const folder = await this.ensureFolder('日日記', token, onTokenExpired);
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const fileName = `backup_${dateStr}.json`;

        await this.saveJsonFile(folder.id, fileName, data, token, onTokenExpired);
        return { folder: folder.name, file: fileName };
    },

    /**
     * Export Readable Spreadsheet to '/日日記' folder
     * @param {object} data
     * @param {string} token
     * @param {function} onTokenExpired - Callback to refresh token
     */
    async exportReadableSheet(data, token, onTokenExpired) {
        const folder = await this.ensureFolder('日日記', token, onTokenExpired);
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        // dateStr for Export Title: 記帳匯出_20240208123045
        const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        const title = `記帳匯出_${dateStr}`;

        // 1. Create Sheet (Root)
        const ss = await this.createSpreadsheet(title, token, onTokenExpired);

        // 2. Move to Folder
        const moveToken = token; // Can reuse token or if refreshed?
        // Note: The previous call might have refreshed the token but we don't return it up the chain easily.
        // Ideally, if a token is refreshed, we should use the new one.
        // BUT, since we pass onTokenExpired to EACH call, if the next call fails (401), it will refresh AGAIN.
        // It's slightly inefficient (double refresh potentially if the first refresh wasn't persisted by caller),
        // but since onTokenExpired updates app state/storage, the SECOND call to onTokenExpired (by the app) 
        // should either return the valid token immediately or just do a quick check.
        // To make it better: onTokenExpired usually invokes API.requestIncrementalScope which sets Storage.
        // So the second call should be fast.

        await this.moveFileToFolder(ss.spreadsheetId, folder.id, token, onTokenExpired);

        // 3. Prepare Readable Data
        const rows = this.prepareReadableRows(data);

        // 4. Write
        await this.writeData(ss.spreadsheetId, 'A1', rows, token, onTokenExpired);

        return { url: ss.spreadsheetUrl, folder: folder.name };
    },

    /**
     * Helper to convert IDs to Names for Export
     */
    prepareReadableRows(data) {
        const { transactions, categories, paymentMethods, projects } = data;
        const headers = ["日期", "項目名稱", "分類", "金額", "幣別", "支付方式", "分帳狀態", "個人金額", "備註", "付款人", "專案", "分帳對象"];
        const rows = [headers];

        transactions.forEach(t => {
            const cat = categories.find(c => c.id === t.categoryId);
            const pm = paymentMethods.find(p => p.id === t.paymentMethod);
            const proj = projects.find(p => p.id === t.projectId);

            const catName = cat ? cat.name : (t.categoryId === 'income' ? '收入' : '其他');
            const pmName = pm ? pm.name : (t.paymentMethod || '');
            const projName = proj ? proj.name : '';

            // Format Friend Name (Split Object)
            // Logic: t.friendName string
            const friendName = t.friendName || '';

            rows.push([
                t.spendDate,
                t.name,
                catName,
                t.amount,
                t.originalCurrency || t.currency || 'JPY',
                pmName,
                t.isSplit ? '是' : '否',
                t.personalShare || t.amount,
                t.note || '',
                t.payer || '我',
                projName,
                friendName
            ]);
        });
        return rows;
    }
};
