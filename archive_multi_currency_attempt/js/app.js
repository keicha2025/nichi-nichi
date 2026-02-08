import { CONFIG } from './config.js?v=1.3';
import { API } from './api.js';
import { GoogleSheetsService } from './services/google-sheets-service.js';
import { AddPage } from './pages/add-page.js';
import { EditPage } from './pages/edit-page.js';
import { HistoryPage } from './pages/history-page.js';
import { StatsPage } from './pages/stats-page.js';
import { SettingsPage } from './pages/settings-page.js';
import { OverviewPage } from "./pages/overview-page.js";
import { ProjectDetailPage } from './pages/project-detail-page.js';

import { ViewDashboard } from './pages/view-dashboard.js';
import { SystemModal } from './components/system-modal.js';
import { AppHeader } from './components/app-header.js';
import { AppFooter } from './components/app-footer.js';
import { IconEditPage } from './pages/icon-edit-page.js';
import { CurrencyEditPage } from './pages/currency-edit-page.js';
import { IconPicker } from './components/icon-picker.js';
import { AppSelect } from './components/app-select.js';

import { convert, formatCurrency } from './utils/currency-utils.js';

const { createApp, ref, onMounted, computed, provide, watch } = window.Vue;

createApp({
    components: {
        'overview-page': OverviewPage,
        'add-page': AddPage,
        'edit-page': EditPage,
        'history-page': HistoryPage,
        'stats-page': StatsPage,
        'settings-page': SettingsPage,
        'project-detail-page': ProjectDetailPage,
        'view-dashboard': ViewDashboard,
        'system-modal': SystemModal,
        'app-header': AppHeader,
        'app-footer': AppFooter,
        'icon-picker': IconPicker,
        'icon-edit-page': IconEditPage,
        'currency-edit-page': CurrencyEditPage,

        'app-select': AppSelect
    },
    setup() {
        const getLocalISOString = () => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            return now.toISOString().slice(0, 16);
        };
        const currentTab = ref('add'); // overview, add, stats, settings, history, edit, project-detail, icon-edit, currency-edit
        const loading = ref(false);
        const currentUser = ref(null); // Firebase User

        // Scroll to top on tab change
        watch(currentTab, () => {
            window.scrollTo({ top: 0, behavior: 'instant' });
        });

        const categories = ref([]);
        const friends = ref([]);
        const paymentMethods = ref([]);
        const projects = ref([]);
        const transactions = ref([]);
        const fxRate = ref(CONFIG.TWD_FIXED_RATE); // Legacy ref, keep for now
        const stats = ref({ monthlyLifeTotal: 0, allOneTimeTotal: 0, debtTotal: 0, totalInvestment: 0 });
        const historyFilter = ref({ mode: 'all', categoryId: null, friendName: null, currency: null, keyword: '' });

        // Load Guest Config
        const savedGuestConfig = JSON.parse(localStorage.getItem('guest_config') || '{}');
        const systemConfig = ref({
            user_name: savedGuestConfig.user_name || '',
            fx_rate: savedGuestConfig.fx_rate || 0.22,
            exchangeRates: savedGuestConfig.exchangeRates || { 'TWD': savedGuestConfig.fx_rate || 0.22 }, // Initialize with legacy or default
            activeCurrencies: savedGuestConfig.activeCurrencies || ['JPY', 'TWD'],
            import_default: savedGuestConfig.import_default || false
        });

        const effectiveRates = computed(() => {
            return systemConfig.value.exchangeRates || { 'TWD': 0.22 };
        });

        const editForm = ref(null);
        const selectedProject = ref(null);
        const iconEditContext = ref(null);
        const isSettingsDirty = ref(false);

        // --- Global Dialog System ---
        const modalState = ref({
            visible: false,
            config: {
                type: 'info',
                title: '',
                message: '',
                confirmText: '確認',
                secondaryText: '',
                showCancel: false,
                data: null
            },
            resolve: null
        });

        const dialog = {
            alert: (message, type = 'error', title = '') => {
                return new Promise(resolve => {
                    modalState.value.config = {
                        type,
                        title: title || (type === 'error' ? '錯誤' : '提示'),
                        message,
                        confirmText: '確認',
                        secondaryText: '',
                        showCancel: false
                    };
                    modalState.value.resolve = resolve;
                    modalState.value.visible = true;
                });
            },
            confirm: (message, options = {}) => {
                return new Promise(resolve => {
                    modalState.value.config = {
                        type: 'confirm',
                        title: options.title || '確認',
                        message,
                        confirmText: options.confirmText || '確定',
                        secondaryText: options.secondaryText || '取消',
                        showCancel: true
                    };
                    modalState.value.resolve = resolve;
                    modalState.value.visible = true;
                });
            },
            showTransactionSuccess: (item, onSecondaryAction, options = {}) => {
                modalState.value.config = {
                    type: 'transaction_success',
                    title: options.title || '已新增',
                    message: '',
                    confirmText: options.confirmText || '確認',
                    secondaryText: options.secondaryText || '看明細',
                    showCancel: false,
                    data: item,
                    onSecondary: onSecondaryAction
                };
                modalState.value.resolve = options.onConfirm ? options.onConfirm : () => { };
                modalState.value.visible = true;
            }
        };
        provide('dialog', dialog);

        // Global Currency State
        const params = new URLSearchParams(window.location.search);
        const urlCurrency = params.get('currency');
        const baseCurrency = ref(urlCurrency === 'TWD' ? 'TWD' : 'JPY');
        const toggleBaseCurrency = () => { baseCurrency.value = baseCurrency.value === 'JPY' ? 'TWD' : 'JPY'; };
        const setBaseCurrency = (code) => { baseCurrency.value = code; };
        provide('baseCurrency', baseCurrency);
        provide('toggleBaseCurrency', toggleBaseCurrency);
        provide('setBaseCurrency', setBaseCurrency);

        const handleModalConfirm = () => {
            modalState.value.visible = false;
            if (modalState.value.resolve) modalState.value.resolve(true);
        };

        const handleModalCancel = () => {
            modalState.value.visible = false;
            if (modalState.value.config.onSecondary) modalState.value.config.onSecondary();
            if (modalState.value.resolve) modalState.value.resolve(false);
        };

        const form = ref({
            type: '支出', currency: 'JPY', amount: '', spendDate: getLocalISOString(),
            categoryId: 'cat_001', name: '', note: '', paymentMethod: '',
            isOneTime: false, isSplit: false, friendName: '', personalShare: 0, payer: systemConfig.value.user_name || '我', isAlreadyPaid: false,
            projectId: '',
            action: 'add'
        });

        // Update payer when user_name loads
        watch(() => systemConfig.value.user_name, (newName) => {
            if (newName && (form.value.payer === '我' || !form.value.payer)) {
                form.value.payer = newName;
            }
        });

        const syncStatus = ref('idle');

        // Determine App Mode
        const appMode = computed(() => {
            if (currentUser.value) return 'ADMIN';
            if (window.location.href.includes('view') || window.location.search.includes('mode=view')) return 'VIEWER';
            return 'GUEST';
        });

        const filteredTransactions = computed(() => {
            let list = (transactions.value || []).filter(t => t); // Filter out undefined/null
            const filter = historyFilter.value;

            if (filter.mode === 'monthly') {
                const now = new Date();
                list = list.filter(t => t.spendDate && new Date(t.spendDate).getMonth() === now.getMonth() && new Date(t.spendDate).getFullYear() === now.getFullYear() && !t.isOneTime);
            } else if (filter.mode === 'onetime') {
                list = list.filter(t => t.isOneTime);
            } else if (filter.mode === 'debt') {
                list = list.filter(t => t.debtAmount !== 0 || t.type === '收款');
            } else if (filter.mode === 'general') {
                list = list.filter(t => !t.projectId);
            } else if (filter.mode === 'project') {
                list = list.filter(t => !!t.projectId);
            }

            if (filter.categoryId) list = list.filter(t => t.categoryId === filter.categoryId);
            if (filter.friendName) {
                list = list.filter(t =>
                    (t.friendName && t.friendName.includes(filter.friendName)) ||
                    (t.payer && t.payer === filter.friendName)
                );
            }
            if (filter.currency) list = list.filter(t => t.originalCurrency === filter.currency);

            if (filter.keyword) {
                const k = filter.keyword.toLowerCase();
                const matchingProjectIds = projects.value
                    .filter(p => p.name.toLowerCase().includes(k) || p.id.toLowerCase() === k)
                    .map(p => p.id);

                list = list.filter(t => {
                    const cat = categories.value.find(c => c.id === t.categoryId);
                    const catName = cat ? cat.name.toLowerCase() : '';
                    const pm = paymentMethods.value.find(p => p.id === t.paymentMethod);
                    const pmName = pm ? pm.name.toLowerCase() : (t.paymentMethod || '').toLowerCase();

                    return (
                        (t.name && String(t.name).toLowerCase().includes(k)) ||
                        (t.note && String(t.note).toLowerCase().includes(k)) ||
                        (t.friendName && String(t.friendName).toLowerCase().includes(k)) ||
                        catName.includes(k) ||
                        pmName.includes(k) ||
                        (t.projectId && matchingProjectIds.includes(t.projectId)) ||
                        (t.projectId && String(t.projectId).toLowerCase() === k)
                    );
                });
            }
            return list;
        });

        const handleViewHistory = (keyword) => {
            historyFilter.value = { mode: 'all', categoryId: null, friendName: null, currency: null, keyword: keyword };
            currentTab.value = 'history';
        };

        const loadData = async (isSilent = false) => {
            if (!isSilent) loading.value = true;
            try {
                if (appMode.value === 'GUEST') {
                    // Guest Mode Logic (LocalStorage Only)
                    const localData = localStorage.getItem('guest_data');
                    let localTransactions = [];
                    if (localData) {
                        try {
                            const parsed = JSON.parse(localData);
                            localTransactions = parsed.transactions || [];
                        } catch (e) { console.error("Guest data parse error", e); }
                    }

                    // Fallback Defaults
                    const savedCats = localStorage.getItem('guest_categories');
                    const savedPMs = localStorage.getItem('guest_payments');

                    if (savedCats) {
                        categories.value = JSON.parse(savedCats);
                    } else if (categories.value.length === 0) {
                        categories.value = [
                            { id: 'cat_001', name: '餐飲', icon: 'restaurant', type: '支出', order: 1 },
                            { id: 'cat_002', name: '交通', icon: 'train', type: '支出', order: 2 },
                            { id: 'cat_003', name: '購物', icon: 'shopping_bag', type: '支出', order: 3 },
                            { id: 'cat_004', name: '娛樂', icon: 'movie', type: '支出', order: 4 },
                            { id: 'cat_999', name: '其他', icon: 'more_horiz', type: '支出', order: 5 }
                        ];
                    }

                    if (savedPMs) {
                        paymentMethods.value = JSON.parse(savedPMs);
                    } else if (paymentMethods.value.length === 0) {
                        paymentMethods.value = [{ id: 'pm_01', name: '現金', order: 1 }, { id: 'pm_02', name: 'PayPay', order: 2 }];
                    }

                    const rawLocal = localTransactions || [];
                    const cleanLocal = rawLocal.filter(t => t && typeof t === 'object' && t.type);
                    console.log('[App-Guest] Load Validated:', { total: rawLocal.length, clean: cleanLocal.length });

                    transactions.value = cleanLocal.map(t => {
                        const currency = t.currency || t.originalCurrency || (t.amountTWD ? 'TWD' : 'JPY');
                        const amount = t.amount !== undefined ? Number(t.amount) : (currency === 'TWD' ? Number(t.amountTWD) : Number(t.amountJPY));
                        return {
                            ...t,
                            currency,
                            originalCurrency: currency,
                            amount,
                            type: t.type || '支出'
                        };
                    });
                    // Recalc Stats
                    let total = 0;
                    transactions.value.forEach(t => {
                        if (!t.isOneTime && t.type === '支出') {
                            // Dynamic Conversion for Guest
                            const rawAmt = parseFloat(t.amount || (t.originalCurrency === 'JPY' ? t.amountJPY : t.amountTWD));
                            const currency = t.currency || t.originalCurrency || (t.amountTWD ? 'TWD' : 'JPY');

                            // Guest mode uses systemConfig directly or fallback
                            const rates = systemConfig.value.exchangeRates || { 'TWD': systemConfig.value.fx_rate || 0.22 };
                            total += convert(rawAmt, currency, 'JPY', rates);
                        }
                    });
                    stats.value = { monthlyLifeTotal: total, allOneTimeTotal: 0, debtTotal: 0, totalInvestment: 0 };
                    return;
                }

                // ADMIN / VIEWER (Firestore)
                let data; // Declare variable
                if (appMode.value === 'VIEWER') {
                    const params = new URLSearchParams(window.location.search);
                    const sharedId = params.get('id');
                    if (!sharedId) throw new Error("Missing Shared ID");
                    data = await API.fetchSharedData(sharedId);
                } else {
                    data = await API.fetchInitialData();
                }

                categories.value = data.categories || [];
                friends.value = data.friends || [];
                paymentMethods.value = data.paymentMethods || [];
                projects.value = data.projects || [];
                const rawData = data.transactions || [];
                const cleanData = rawData.filter(t => t && typeof t === 'object' && t.type);
                console.log('[App] Load Validated:', { total: rawData.length, clean: cleanData.length, removed: rawData.length - cleanData.length });
                if (rawData.length !== cleanData.length) console.warn('[App] Removed invalid transactions:', rawData.filter(t => !t || !typeof t === 'object' || !t.type));

                transactions.value = cleanData.map(t => {
                    // Normalize on Load
                    const currency = t.currency || t.originalCurrency || (t.amountTWD ? 'TWD' : 'JPY');
                    const amount = t.amount !== undefined ? Number(t.amount) : (currency === 'TWD' ? Number(t.amountTWD) : Number(t.amountJPY));
                    return {
                        ...t,
                        currency,
                        originalCurrency: currency, // Consistency
                        amount,
                        type: t.type || '支出' // Fallback
                    };
                });

                if (data.stats) stats.value = data.stats;

                // Merge Remote Config
                if (data.config) {
                    systemConfig.value = { ...data.config }; // Remote config overrides local for logged-in user
                    if (data.config.fx_rate) fxRate.value = parseFloat(data.config.fx_rate);
                }

                if (appMode.value === 'VIEWER') currentTab.value = 'overview';

                // Recalc Stats (Dynamic Conversion)
                // Recalc Stats (Dynamic Conversion)
                let lifeTotal = 0;
                let oneTimeTotal = 0;

                transactions.value.forEach(t => {
                    if (!t || !t.type) {
                        console.warn("Invalid transaction skipped:", t);
                        return;
                    }
                    if (t.type === '支出') {
                        // Normalize amount and currency
                        const rawAmt = t.amount !== undefined ? Number(t.amount) : (t.originalCurrency === 'TWD' ? Number(t.amountTWD) : Number(t.amountJPY));
                        // Default to JPY if currency missing (Legacy)
                        const currency = t.currency || t.originalCurrency || (t.amountTWD ? 'TWD' : 'JPY');

                        // Convert to Base (JPY)
                        const amountInJPY = convert(rawAmt, currency, 'JPY', effectiveRates.value);

                        if (t.isOneTime) oneTimeTotal += amountInJPY;
                        else lifeTotal += amountInJPY;
                    }
                });
                stats.value.monthlyLifeTotal = lifeTotal;
                stats.value.allOneTimeTotal = oneTimeTotal;

            } catch (err) {
                console.error("Load Data Error", err);
                if (!isSilent) dialog.alert("資料載入失敗: " + err.message);
            } finally {
                if (!isSilent) loading.value = false;
            }
        };

        const handleSubmit = async (targetForm) => {
            if (appMode.value === 'VIEWER') return;
            if (loading.value) return; // Prevent double submit

            const dataToSave = targetForm || form.value;
            if (!dataToSave.amount || !dataToSave.name) return;

            loading.value = true; // Lock UI

            try {
                // Prepare Payload
                const now = new Date();
                let utcOffset = '';
                if (dataToSave.action === 'edit' && dataToSave.utc) {
                    utcOffset = dataToSave.utc;
                } else {
                    const tzo = now.getTimezoneOffset();
                    const sign = tzo <= 0 ? '+' : '-';
                    const h = Math.abs(Math.floor(tzo / 60)).toString().padStart(2, '0');
                    const m = Math.abs(tzo % 60).toString().padStart(2, '0');
                    utcOffset = `${sign}${h}:${m}`;
                }

                const payload = {
                    ...dataToSave,
                    amount: Number(dataToSave.amount), // Store Raw Amount
                    currency: dataToSave.currency,
                    originalCurrency: dataToSave.currency,
                    id: dataToSave.id || "tx_" + now.getTime(),
                    entryDate: dataToSave.action === 'edit' ? (dataToSave.entryDate || now.toISOString()) : now.toISOString(),
                    spendDate: dataToSave.spendDate,
                    utc: utcOffset
                };

                // OPTIMISTIC UPDATE
                if (dataToSave.action === 'edit') {
                    const idx = transactions.value.findIndex(t => t.id === payload.id);
                    if (idx !== -1) transactions.value[idx] = { ...payload };
                } else {
                    transactions.value.unshift({ ...payload });
                }

                if (appMode.value === 'ADMIN') {
                    await API.saveTransaction(payload);
                } else if (appMode.value === 'GUEST') {
                    const localOnly = transactions.value.filter(t => !t.isRemote);
                    localStorage.setItem('guest_data', JSON.stringify({ transactions: localOnly }));
                }

                const goHistory = () => { currentTab.value = 'history'; resetForm(); };
                const doReload = () => { loadData(true); };

                if (dataToSave.action === 'edit') {
                    dialog.showTransactionSuccess({ ...dataToSave }, doReload, {
                        title: '已更新',
                        confirmText: '返回明細',
                        secondaryText: '重新整理',
                        onConfirm: goHistory
                    });
                } else {
                    dialog.showTransactionSuccess({ ...dataToSave }, goHistory, {
                        title: '已新增',
                        confirmText: '確認',
                        secondaryText: '看明細'
                    });
                    resetForm();
                }
            } catch (e) {
                console.error("Save Error", e);
                dialog.alert("儲存錯誤: " + e.message);
                // Revert optimistic update if needed?
            } finally {
                loading.value = false; // Unlock
            }
        };

        const handleTabChange = async (newTab) => {
            if (isSettingsDirty.value) {
                if (await dialog.confirm("您有未儲存的修改，確定要離開嗎？")) {
                    isSettingsDirty.value = false;
                    currentTab.value = newTab;
                }
            } else {
                currentTab.value = newTab;
            }
        };

        const handleDelete = async (row) => {
            if (appMode.value === 'VIEWER') return;
            // NOTE: row is legacy, we need ID.
            // Old data might not have ID? We should have migrated or handle gracefully.
            // Assumption: transactions loaded from Firestore HAVE IDs.
            // Guest data might use row? 
            // Only Firestore data has ID guaranteed.

            // Let's find the ID.
            let idToDelete = null;
            let item = null;

            // Try matching by row or id
            if (typeof row === 'string' && row.startsWith('tx_')) {
                idToDelete = row; // passed ID directly
                item = transactions.value.find(t => t.id === row);
            } else {
                item = transactions.value.find(t => t.row === row);
                if (item) idToDelete = item.id;
            }

            if (appMode.value === 'GUEST') {
                if (!confirm("體驗模式：確定刪除？")) return;
                if (item) {
                    transactions.value = transactions.value.filter(t => t !== item);
                    const localOnly = transactions.value.filter(t => !t.isRemote);
                    localStorage.setItem('guest_data', JSON.stringify({ transactions: localOnly }));
                    dialog.showTransactionSuccess(item, () => { currentTab.value = 'history'; editForm.value = null; }, {
                        title: '已刪除', confirmText: '返回明細', secondaryText: ''
                    });
                }
                return;
            }

            if (!await dialog.confirm("確定要永久刪除此筆資料嗎？")) return;

            // Optimistic Delete
            if (item) {
                transactions.value = transactions.value.filter(t => t.id !== item.id);
            }

            if (appMode.value === 'ADMIN' && idToDelete) {
                try {
                    await API.saveTransaction({ action: 'delete', id: idToDelete });
                } catch (e) {
                    console.error("Delete failed", e);
                    dialog.alert("刪除失敗");
                }
            } else if (!idToDelete) {
                dialog.alert("無法刪除：找不到 ID");
            }

            if (item) {
                const goHistory = () => { currentTab.value = 'history'; editForm.value = null; };
                dialog.showTransactionSuccess(item, goHistory, {
                    title: '已刪除',
                    confirmText: '返回明細',
                    secondaryText: '',
                    onConfirm: goHistory
                });
            }
        };

        const resetForm = () => {
            const defaultPayer = systemConfig.value.user_name || '我';
            form.value = {
                type: '支出', currency: 'JPY', amount: '', spendDate: getLocalISOString(),
                categoryId: 'cat_001', name: '', note: '', paymentMethod: '',
                isSplit: false, friendName: '', personalShare: 0, payer: defaultPayer, isAlreadyPaid: false,
                projectId: '',
                action: 'add'
            };
            editForm.value = null;
        };

        const handleEditItem = (item) => {
            const formattedDate = item.spendDate ? item.spendDate.replace(/\//g, "-").replace(" ", "T") : getLocalISOString();
            const hasSplit = item.friendName && item.friendName.trim() !== "";
            editForm.value = JSON.parse(JSON.stringify({
                ...item,
                spendDate: formattedDate,
                amount: item.amount !== undefined ? item.amount : (item.originalCurrency === 'TWD' ? item.amountTWD : item.amountJPY),
                currency: item.currency || item.originalCurrency || (item.amountTWD ? 'TWD' : 'JPY'),
                action: 'edit',
                isSplit: hasSplit,
                projectId: item.projectId || ''
            }));
            currentTab.value = 'edit';
        };

        const getTabIcon = (t) => {
            const icons = { overview: 'dashboard', history: 'list_alt', add: 'add', stats: 'bar_chart', settings: 'settings', 'project-detail': 'flight_takeoff' };
            return icons[t] || 'help';
        };

        // SETUP AUTH LISTENER
        onMounted(() => {
            // Wait for Auth init
            API.onAuthStateChanged((user) => {
                const prevUser = currentUser.value;
                currentUser.value = user;

                // If user changed (e.g. login or logout), reload data
                // Also first load
                loadData();
            });
        });

        // Expose for Debugging
        window.DEBUG_APP = {
            transactions,
            paymentMethods,
            systemConfig,
            appMode,
            localData: () => JSON.parse(localStorage.getItem('guest_data')),
            clear: () => { localStorage.removeItem('guest_data'); window.location.reload(); }
        };

        const handleUpdateUserData = async (data, silent = false) => {
            if (appMode.value === 'GUEST') {
                if (data.categories) localStorage.setItem('guest_categories', JSON.stringify(data.categories));
                if (data.paymentMethods) localStorage.setItem('guest_payments', JSON.stringify(data.paymentMethods));
                if (data.friends) localStorage.setItem('guest_friends', JSON.stringify(data.friends));
                await loadData();
                return;
            }
            if (appMode.value !== 'ADMIN') return;
            if (!silent) loading.value = true;
            try {
                await API.updateUserData(data);
                await loadData();
            } finally {
                if (!silent) loading.value = false;
            }
        };

        const handleAddFriendToList = async (n) => {
            if (!friends.value.includes(n)) {
                friends.value.push(n);
                // Silent update in background
                handleUpdateUserData({ friends: friends.value }, true);
            }
        };

        const methods = {
            currentTab, handleTabChange, loading, categories, friends, paymentMethods, projects, transactions, filteredTransactions, historyFilter, form, editForm, stats, systemConfig, fxRate, selectedProject, isSettingsDirty, effectiveRates,
            appMode, syncStatus, currentUser,
            convert, formatCurrency,
            handleSubmit, handleDelete, handleEditItem,
            formatNumber: (n) => new Intl.NumberFormat().format(Math.round(n || 0)),
            getTabIcon,
            toggleCurrency: () => form.value.currency = (form.value.currency === 'JPY' ? 'TWD' : 'JPY'),
            handleAddFriendToList,
            resetForm,
            handleDrillDown: (id) => { historyFilter.value = { mode: 'all', categoryId: id, friendName: null, currency: null, keyword: '' }; currentTab.value = 'history'; },

            modalState, handleModalConfirm, handleModalCancel,
            baseCurrency, toggleBaseCurrency, setBaseCurrency,

            handleUpdateConfig: async (c) => {
                if (appMode.value === 'GUEST') {
                    systemConfig.value = { ...systemConfig.value, ...c };
                    localStorage.setItem('guest_config', JSON.stringify(systemConfig.value));
                    await loadData();
                    dialog.alert("設定已更新 (Guest)", 'success');
                    return;
                }
                if (appMode.value !== 'ADMIN') return dialog.alert("權限不足", 'error');
                loading.value = true;
                await API.saveTransaction({ action: 'updateConfig', ...c });
                await loadData();
            },
            handleUpdateUserData,
            handleViewFriend: (n) => { historyFilter.value = { mode: 'all', categoryId: null, friendName: n, currency: null, keyword: '' }; currentTab.value = 'history'; },
            handleViewProject: (p) => { selectedProject.value = p; currentTab.value = 'project-detail'; },
            handleViewHistory,
            handleUpdateProject: async () => { await loadData(); },

            iconEditContext,
            handleOpenIconEdit: (ctx) => {
                iconEditContext.value = ctx;
                currentTab.value = 'icon-edit';
            },
            handleCurrencySave: (newConfig) => {
                // Update systemConfig with new active list and rates
                if (appMode.value === 'GUEST') {
                    systemConfig.value.activeCurrencies = newConfig.activeCurrencies;
                    systemConfig.value.exchangeRates = newConfig.exchangeRates;
                    localStorage.setItem('guest_config', JSON.stringify(systemConfig.value));
                    dialog.alert("匯率設定已更新", 'success');
                } else if (appMode.value === 'ADMIN') {
                    // Save to Cloud
                    methods.handleUpdateConfig({
                        activeCurrencies: newConfig.activeCurrencies,
                        exchangeRates: newConfig.exchangeRates
                    });
                }
                currentTab.value = 'settings';
            },
            handleClearAccountData: async () => {
                loading.value = true;
                try {
                    await API.clearAccountData();
                    await API.logout();
                    // Force full reload to clean all states
                    window.location.href = window.location.origin + window.location.pathname;
                } catch (e) {
                    console.error(e);
                    dialog.alert("刪除失敗，請稍後再試");
                } finally {
                    loading.value = false;
                }
            },
            handleSelectIcon: ({ icon, name }) => {
                if (!iconEditContext.value) return;
                const { type, id } = iconEditContext.value;

                // Update root state
                if (type === 'category') {
                    const cat = categories.value.find(c => c.id === id);
                    if (cat) {
                        cat.icon = icon;
                        cat.name = name;
                    }
                } else if (type === 'payment') {
                    const pm = paymentMethods.value.find(p => p.id === id);
                    if (pm) {
                        pm.icon = icon;
                        pm.name = name;
                    }
                }

                currentTab.value = 'settings';
                // Trigger a refresh of settings-page if it's watching id? 
                // Actually, settings-page will react if it uses these props.
            },

            // NEW: Auth Methods
            handleGoogleLogin: async () => {
                try {
                    await API.login();
                    // AuthStateChanged will handle reload
                    dialog.alert("登入成功", "success");
                } catch (e) {
                    dialog.alert("登入失敗: " + e.message);
                }
            },
            handleLogout: async () => {
                if (await dialog.confirm("確定要登出嗎？")) {
                    await API.logout();
                }
            },

            clearGuestData: async () => {
                if (await dialog.confirm("確定要清除所有訪客資料嗎？", "清除資料")) {
                    localStorage.removeItem('guest_data');
                    window.location.reload();
                }
            },
            retrySync: () => { }, // No-op now
            handleCreateProject: async (input) => {
                if (appMode.value !== 'ADMIN') return dialog.alert("權限不足");
                if (!input) return;

                let name = '';
                let startDate = getLocalISOString().split('T')[0];
                let endDate = getLocalISOString().split('T')[0];

                if (typeof input === 'object') {
                    name = input.name;
                    startDate = input.startDate || startDate;
                    endDate = input.endDate || endDate;
                } else {
                    name = input;
                }

                if (!name) return;
                if (!name) return;
                // Silent update
                try {
                    await API.saveTransaction({
                        action: 'updateProject',
                        name: name,
                        startDate: startDate,
                        endDate: endDate
                    });
                    await loadData();
                    // dialog.alert("Project Created!", 'success'); // Silent, don't alert
                } catch (e) {
                    dialog.alert("Error creating project: " + e, 'error');
                }
            }
        };

        const autoBackupIfNeeded = async () => {
            if (currentUser.value?.uid && systemConfig.value.auto_backup) {
                const today = new Date().toISOString().slice(0, 10);
                const lastBackup = localStorage.getItem('last_backup_date');
                if (lastBackup === today) return;

                const currentHour = new Date().getHours();
                if (currentHour < 23 && lastBackup) return;

                try {
                    const token = API.getGoogleToken();
                    if (!token) return;
                    await GoogleSheetsService.backupTransactions(transactions.value, categories.value, token);
                    localStorage.setItem('last_backup_date', today);
                    console.log("Auto-backup completed.");
                } catch (e) {
                    console.error("Auto-backup failed", e);
                }
            }
        };

        onMounted(() => {
            setTimeout(autoBackupIfNeeded, 5000);
        });

        return methods;
    },
    template: `
        <div class="min-h-screen bg-gray-50 flex flex-col font-sans mb-safe">
            <app-header 
                :current-tab="currentTab" 
                :loading="loading" 
                :sync-status="syncStatus" 
                :current-user="currentUser"
                :effective-rates="effectiveRates"
                :system-config="systemConfig"
                @tab-change="handleTabChange"
                :title="getTabIcon(currentTab)"
            ></app-header>

            <main class="flex-1 overflow-y-auto pb-24 pt-24 px-4 custom-scrollbar">
                <overview-page v-if="currentTab === 'overview'" :stats="stats" :transactions="transactions" :app-mode="appMode" :friends="friends" :projects="projects" :effective-rates="effectiveRates" :system-config="systemConfig" @view-history="handleViewHistory" @view-project="handleViewProject"></overview-page>
                
                <add-page v-if="currentTab === 'add'" :loading="loading" :categories="categories" :friends="friends" :payment-methods="paymentMethods" :projects="projects" :form="form" :system-config="systemConfig" :effective-rates="effectiveRates" @submit="handleSubmit" @toggle-currency="toggleCurrency" @add-friend="handleAddFriendToList"></add-page>
                
                <edit-page v-if="currentTab === 'edit'" :loading="loading" :categories="categories" :friends="friends" :payment-methods="paymentMethods" :projects="projects" :form="editForm" :system-config="systemConfig" :effective-rates="effectiveRates" @submit="handleSubmit" @delete="handleDelete" @cancel="currentTab = 'history'" @add-friend="handleAddFriendToList"></edit-page>
                
                <history-page v-if="currentTab === 'history'" :transactions="filteredTransactions" :filter="historyFilter" :categories="categories" :friends="friends" :app-mode="appMode" :projects="projects" @edit-item="handleEditItem" @drill-down="handleDrillDown" @clear-filter="handleViewHistory('')"></history-page>
                
                <stats-page v-if="currentTab === 'stats'" :transactions="transactions" :categories="categories" :projects="projects" :effective-rates="effectiveRates" :base-currency="baseCurrency"></stats-page>
                
                <settings-page 
                    v-if="currentTab === 'settings'" 
                    :config="systemConfig" 
                    :friends="friends" 
                    :projects="projects" 
                    :transactions="transactions"
                    :app-mode="appMode" 
                    :current-user="currentUser" 
                    :categories="categories"
                    :payment-methods="paymentMethods"
                    @update-config="handleUpdateConfig" 
                    @update-user-data="handleUpdateUserData" 
                    @view-project="handleViewProject" 
                    @view-friend="handleViewFriend" 
                    @login="handleGoogleLogin" 
                    @logout="handleLogout" 
                    @clear-guest-data="clearGuestData" 
                    @create-project="handleCreateProject"
                    @open-icon-edit="handleOpenIconEdit"
                    @open-currency-edit="currentTab = 'currency-edit'"
                    @clear-account-data="handleClearAccountData"
                ></settings-page>

                <project-detail-page v-if="currentTab === 'project-detail'" :project="selectedProject" :transactions="transactions.filter(t => t.projectId === selectedProject.id)" :all-transactions="transactions" :effective-rates="effectiveRates" @back="currentTab = 'overview'" @edit="handleUpdateProject"></project-detail-page>

                <view-dashboard v-if="currentTab === 'view-dashboard'" :transactions="transactions" :categories="categories"></view-dashboard>
                
                <!-- Icon Edit Page -->
                <icon-edit-page
                    v-if="currentTab === 'icon-edit'"
                    :context="iconEditContext"
                    @cancel="currentTab = 'settings'"
                    @select="handleSelectIcon"
                ></icon-edit-page>

                <!-- Currency Edit Page -->
                <currency-edit-page
                    v-if="currentTab === 'currency-edit'"
                    :active-currencies="systemConfig.activeCurrencies"
                    :exchange-rates="systemConfig.exchangeRates"
                    :base-currency="systemConfig.baseCurrency"
                    @cancel="currentTab = 'settings'"
                    @save="handleCurrencySave"
                ></currency-edit-page>

            </main>

            <app-footer :current-tab="currentTab" :app-mode="appMode" @tab-change="handleTabChange"></app-footer>

            <system-modal :visible="modalState.visible" :config="modalState.config" @confirm="handleModalConfirm" @cancel="handleModalCancel"></system-modal>

            <!-- Loading Overlay -->
            <div v-if="loading" class="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[100] flex items-center justify-center">
                <div class="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 animate-spring-up">
                    <div class="w-10 h-10 border-4 border-gray-100 border-t-[#4A4A4A] rounded-full animate-spin"></div>
                    <span class="text-xs font-bold text-gray-600 tracking-widest">PROCESSING</span>
                </div>
            </div>
        </div>
    `
}).mount('#app');
