import { CONFIG } from './config.js';
import { API, DEFAULTS } from './api.js';
import { GoogleSheetsService } from './services/google-sheets-service.js';
import { AddPage } from './pages/add-page.js';
import { EditPage } from './pages/edit-page.js';
import { HistoryPage } from './pages/history-page.js';
import { StatsPage } from './pages/stats-page.js';
import { SettingsPage } from './pages/settings-page.js';
import { OverviewPage } from "./pages/overview-page.js";
import { ProjectDetailPage } from './pages/project-detail-page.js';
import { FriendDetailPage } from './pages/friend-detail-page.js';
import { ImportPage } from './pages/import-page.js';
import { SharedLinksPage } from './pages/shared-links-page.js';
import { EditSharedLinksPage } from './pages/edit-shared-links-page.js';
import { ViewDashboard } from './pages/view-dashboard.js';
import { CustomListPage } from './pages/custom-list-page.js';
import { SystemModal } from './components/system-modal.js';
import { AppHeader } from './components/app-header.js';
import { AppFooter } from './components/app-footer.js';
import { IconEditPage } from './pages/icon-edit-page.js';
import { IconPicker } from './components/icon-picker.js';
import { AppSelect } from './components/app-select.js';

const { createApp, ref, onMounted, computed, provide, watch } = window.Vue;

createApp({
    components: {
        'overview-page': OverviewPage,
        'add-page': AddPage,
        'edit-page': EditPage,
        'history-page': HistoryPage,
        'stats-page': StatsPage,
        'settings-page': SettingsPage,
        'import-page': ImportPage,
        'project-detail-page': ProjectDetailPage,
        'view-dashboard': ViewDashboard,
        'system-modal': SystemModal,
        'app-header': AppHeader,
        'app-footer': AppFooter,
        'icon-picker': IconPicker,
        'icon-edit-page': IconEditPage,
        'app-select': AppSelect,
        'shared-links-page': SharedLinksPage,
        'edit-shared-links-page': EditSharedLinksPage,
        'friend-detail-page': FriendDetailPage,
        'custom-list-page': CustomListPage
    },
    setup() {
        const getLocalISOString = () => {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            return now.toISOString().slice(0, 16);
        };
        const generateId = (prefix = 'f') => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
        const params = new URLSearchParams(window.location.search);
        const currentTab = ref(params.get('tab') || 'add');
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
        const fxRate = ref(CONFIG.TWD_FIXED_RATE);

        // Widget Sync Watcher
        watch(transactions, (newVal) => {
            if (newVal && window.Capacitor && window.Capacitor.isNativePlatform()) {
                API.syncWidget(newVal);
            }
        }, { deep: true });

        const stats = ref({ monthlyLifeTotal: 0, allOneTimeTotal: 0, debtTotal: 0, totalInvestment: 0 });
        const historyFilter = ref({ mode: 'all', categoryId: null, friendName: null, currency: null, keyword: '' });

        // Load Guest Config
        const savedGuestConfig = JSON.parse(localStorage.getItem('guest_config') || '{}');
        const systemConfig = ref({
            user_name: savedGuestConfig.user_name || '',
            fx_rate: savedGuestConfig.fx_rate || 0.22
        });


        const editForm = ref(null);
        const selectedProject = ref(null);
        const selectedFriend = ref(null);
        const iconEditContext = ref(null);
        const editingLink = ref(null);
        const isSettingsDirty = ref(false);

        // Batch Updates State
        const pendingUpdates = ref({ friends: [], projects: [] });

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
        const urlCurrency = params.get('currency');
        const baseCurrency = ref(urlCurrency === 'TWD' ? 'TWD' : 'JPY');
        const toggleBaseCurrency = () => { baseCurrency.value = baseCurrency.value === 'JPY' ? 'TWD' : 'JPY'; };
        provide('baseCurrency', baseCurrency);
        provide('toggleBaseCurrency', toggleBaseCurrency);

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
            isOneTime: false, isSplit: false, friendName: '', personalShare: 0, payer: '我', isAlreadyPaid: false,
            projectId: '',
            action: 'add'
        });

        // Update payer when user_name loads
        /* 
           [UX CHANGE] Payer always defaults to '我' (Me). 
           Disabled auto-override by systemConfig.user_name to ensure consistent pre-selection.
        */
        // watch(() => systemConfig.value.user_name, (newName) => {
        //     if (newName && (form.value.payer === '我' || !form.value.payer)) {
        //         form.value.payer = newName;
        //     }
        // });

        const syncStatus = ref('idle');

        // Determine App Mode
        const appMode = computed(() => {
            if (currentUser.value) return 'ADMIN';
            if (window.location.href.includes('view') || window.location.search.includes('mode=view')) return 'VIEWER';
            return 'GUEST';
        });

        const filteredTransactions = computed(() => {
            let list = transactions.value;
            const filter = historyFilter.value;

            if (filter.mode === 'monthly') {
                const now = new Date();
                list = list.filter(t => new Date(t.spendDate).getMonth() === now.getMonth() && new Date(t.spendDate).getFullYear() === now.getFullYear() && !t.isOneTime);
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
                const targetRef = filter.friendName; // could be ID or Name
                list = list.filter(t => {
                    // Try to match by name or by ID
                    const matchName = (t.friendName && t.friendName.includes(targetRef)) || (t.payer && t.payer === targetRef);
                    if (matchName) return true;

                    // If not matched, try to lookup friend by targetRef and check their alternative identity
                    const friendObj = friends.value.find(f => f.id === targetRef || f.name === targetRef);
                    if (friendObj) {
                        return (t.friendName && (t.friendName.includes(friendObj.id) || t.friendName.includes(friendObj.name))) ||
                            (t.payer && (t.payer === friendObj.id || t.payer === friendObj.name));
                    }
                    return false;
                });
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

        // Computed: Check if we have multiple currencies (for Viewer Mode)
        const hasMultipleCurrencies = computed(() => {
            if (!transactions.value || transactions.value.length === 0) return false;
            const currencies = new Set(transactions.value.map(t => t.originalCurrency || (t.amountTWD ? 'TWD' : 'JPY')));
            return currencies.has('JPY') && currencies.has('TWD');
        });

        const handleViewHistory = (filter) => {
            // Default filter
            const newFilter = { mode: 'all', categoryId: null, friendName: null, currency: null, keyword: '' };

            if (typeof filter === 'string') {
                // Heuristic mapping
                if (currentTab.value === 'friend-detail' && selectedFriend.value) {
                    newFilter.friendName = filter;
                } else if (currentTab.value === 'project-detail' || filter.startsWith('p_')) {
                    newFilter.keyword = filter;
                } else {
                    newFilter.keyword = filter;
                }
            } else if (filter && typeof filter === 'object') {
                // Support both types of object keys
                if (filter.id && filter.type === 'friend') {
                    newFilter.friendName = filter.id;
                    newFilter.mode = 'friend';
                } else {
                    Object.assign(newFilter, filter);
                }
            }

            historyFilter.value = newFilter;
            currentTab.value = 'history';
        };

        const loadData = async (isSilent = false) => {
            // --- Cache-First Rendering ---
            const cacheKey = appMode.value === 'ADMIN' ? `cache_data_${currentUser.value?.uid}` : 'guest_data';
            const cached = localStorage.getItem(cacheKey);

            if (cached && !isSilent && transactions.value.length === 0) {
                try {
                    const data = JSON.parse(cached);
                    if (data.transactions) {
                        transactions.value = data.transactions;
                        if (data.categories) categories.value = data.categories;
                        if (data.paymentMethods) paymentMethods.value = data.paymentMethods;
                        if (data.projects) projects.value = data.projects;
                        if (data.friends) friends.value = data.friends;
                        if (data.stats) stats.value = data.stats;
                        if (data.config) {
                            systemConfig.value = { ...data.config };
                            if (data.config.fx_rate) fxRate.value = parseFloat(data.config.fx_rate);
                        }
                        console.log("[Cache-First] Rendered from cache:", cacheKey);
                    }
                } catch (e) { console.warn("[Cache-First] Failed to parse cache", e); }
            }

            if (!isSilent) syncStatus.value = 'syncing';

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
                        categories.value = [...DEFAULTS.categories];
                    }

                    if (savedPMs) {
                        paymentMethods.value = JSON.parse(savedPMs);
                    } else if (paymentMethods.value.length === 0) {
                        paymentMethods.value = [...DEFAULTS.paymentMethods];
                    }

                    // Load Friends
                    const savedFriends = localStorage.getItem('guest_friends');
                    if (savedFriends) {
                        friends.value = JSON.parse(savedFriends);
                    } else {
                        friends.value = [];
                    }

                    // Load Projects
                    const savedProjects = localStorage.getItem('guest_projects');
                    if (savedProjects) {
                        projects.value = JSON.parse(savedProjects);
                    } else {
                        projects.value = [];
                    }

                    // Sync FX Rate
                    fxRate.value = systemConfig.value.fx_rate || 0.22;

                    transactions.value = localTransactions;
                    // [Smart Currency Detection]
                    if (transactions.value.length > 0) {
                        const latest = transactions.value[0];
                        const detected = latest.originalCurrency || latest.currency || 'JPY';
                        if (detected === 'TWD' || detected === 'JPY') baseCurrency.value = detected;
                    }

                    // Recalc Stats
                    let total = 0;
                    transactions.value.forEach(t => {
                        if (!t.isOneTime && t.type === '支出') {
                            const rate = systemConfig.value.fx_rate || 0.22;
                            const amt = parseFloat(t.amount || (t.originalCurrency === 'JPY' ? t.amountJPY : t.amountTWD));
                            if (t.originalCurrency === 'TWD') total += amt / rate;
                            else total += amt;
                        }
                    });
                    stats.value = { monthlyLifeTotal: total, allOneTimeTotal: 0, debtTotal: 0, totalInvestment: 0 };

                    // Update cache for guest
                    localStorage.setItem('guest_data', JSON.stringify({
                        transactions: transactions.value,
                        categories: categories.value,
                        paymentMethods: paymentMethods.value,
                        projects: projects.value,
                        friends: friends.value,
                        stats: stats.value,
                        config: systemConfig.value
                    }));

                    return;
                }

                // ADMIN / VIEWER (Firestore)
                let data;
                if (appMode.value === 'VIEWER') {
                    const params = new URLSearchParams(window.location.search);
                    const sharedId = params.get('id');
                    const uid = params.get('uid');
                    if (!sharedId) throw new Error("Missing Shared ID");
                    data = await API.fetchSharedData(sharedId, uid);
                } else {
                    data = await API.fetchInitialData();
                }

                categories.value = data.categories || [];

                let friendsNeedUpdate = false;
                friends.value = (data.friends || []).map(f => {
                    let obj = typeof f === 'string' ? { name: f, visible: true } : { ...f };
                    if (!obj.id) {
                        obj.id = generateId('f');
                        friendsNeedUpdate = true;
                    }
                    return obj;
                });

                if (friendsNeedUpdate && appMode.value === 'ADMIN' && !isSilent) {
                    API.updateUserData({ friends: JSON.parse(JSON.stringify(friends.value)) });
                }

                paymentMethods.value = data.paymentMethods || [];
                projects.value = data.projects || [];
                transactions.value = data.transactions || [];

                if (transactions.value.length > 0) {
                    const latest = transactions.value[0];
                    const detected = latest.originalCurrency || latest.currency || 'JPY';
                    if (detected === 'TWD' || detected === 'JPY') {
                        baseCurrency.value = detected;
                    }
                }

                if (data.stats) stats.value = data.stats;

                if (data.config) {
                    systemConfig.value = { ...data.config };
                    if (data.config.fx_rate) fxRate.value = parseFloat(data.config.fx_rate);
                }
                if (data.linkConfig) {
                    systemConfig.value = { ...systemConfig.value, ...data.linkConfig };
                }

                if (appMode.value === 'VIEWER') currentTab.value = 'overview';

                // Recalc Stats
                let lifeTotal = 0;
                let oneTimeTotal = 0;
                const rate = fxRate.value || 0.22;

                transactions.value.forEach(t => {
                    if (t.type === '支出') {
                        const rawAmt = t.amount !== undefined ? Number(t.amount) : (t.originalCurrency === 'TWD' ? Number(t.amountTWD) : Number(t.amountJPY));
                        const isTWD = t.originalCurrency === 'TWD';
                        const amountInJPY = isTWD ? rawAmt / rate : rawAmt;
                        if (t.isOneTime) oneTimeTotal += amountInJPY;
                        else lifeTotal += amountInJPY;
                    }
                });
                stats.value.monthlyLifeTotal = lifeTotal;
                stats.value.allOneTimeTotal = oneTimeTotal;

                // --- Update Persistent Cache for Admin ---
                if (appMode.value === 'ADMIN') {
                    localStorage.setItem(cacheKey, JSON.stringify({
                        transactions: transactions.value,
                        categories: categories.value,
                        paymentMethods: paymentMethods.value,
                        projects: projects.value,
                        friends: friends.value,
                        stats: stats.value,
                        config: systemConfig.value
                    }));
                }

            } catch (err) {
                console.error("Load Data Error", err);
                if (!isSilent) dialog.alert("資料載入失敗: " + err.message);
            } finally {
                syncStatus.value = 'idle';

                // POST-LOGIN MERGE CHECK
                if (appMode.value === 'ADMIN' && localStorage.getItem('merge_guest_data') === 'true') {
                    localStorage.removeItem('merge_guest_data');
                    try {
                        const guestData = JSON.parse(localStorage.getItem('guest_data') || '{"transactions":[]}');
                        const guestProjects = JSON.parse(localStorage.getItem('guest_projects') || '[]');
                        const importPayload = {
                            transactions: guestData.transactions || [],
                            projects: guestProjects,
                        };

                        if (importPayload.transactions.length > 0 || importPayload.projects.length > 0) {
                            syncStatus.value = 'syncing';
                            await API.importData(importPayload, (msg) => console.log(msg));
                            syncStatus.value = 'idle';
                            dialog.alert("訪客資料已成功合併至您的帳戶！", "success");
                            await loadData(true);
                        }
                    } catch (e) {
                        console.error("Merge Guest Data Failed", e);
                        syncStatus.value = 'idle';
                        dialog.alert("合併訪客資料失敗，請手動匯入", "error");
                    }
                }
            }
        };

        const handleSubmit = async (targetForm) => {
            if (appMode.value === 'VIEWER') return;
            // Removed blocking loading.value check to allow optimistic updates
            // if (loading.value) return; 

            // Immediate scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            const dataToSave = targetForm || form.value;
            if (!dataToSave.amount || !dataToSave.name) return;

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
                    amount: Number(dataToSave.amount),
                    currency: dataToSave.currency,
                    originalCurrency: dataToSave.currency,
                    id: dataToSave.id || "tx_" + now.getTime(),
                    entryDate: dataToSave.action === 'edit' ? (dataToSave.entryDate || now.toISOString()) : now.toISOString(),
                    spendDate: dataToSave.spendDate,
                    utc: utcOffset
                };

                const dbPayload = { ...payload };
                if (dbPayload.payer === '我' && currentUser.value) {
                    dbPayload.payer = currentUser.value.uid;
                }
                if (dbPayload.beneficiaries) {
                    dbPayload.beneficiaries = dbPayload.beneficiaries.map(b => (b === '我' && currentUser.value) ? currentUser.value.uid : b);
                }

                // --- 1. OPTIMISTIC UI UPDATE ---
                if (dataToSave.action === 'edit') {
                    const idx = transactions.value.findIndex(t => t.id === payload.id);
                    if (idx !== -1) transactions.value[idx] = { ...payload };
                } else {
                    transactions.value.unshift({ ...payload });
                }

                // --- 2. IMMEDIATE FEEDBACK ---
                const goHistory = () => {
                    currentTab.value = 'history';
                    resetForm();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                };

                if (dataToSave.action === 'edit') {
                    dialog.showTransactionSuccess({ ...dataToSave }, () => loadData(true), {
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

                // --- 3. BACKGROUND SYNC ---
                (async () => {
                    syncStatus.value = 'syncing';
                    try {
                        if (appMode.value === 'ADMIN') {
                            await API.saveTransaction(dbPayload);
                            console.log("[Background Sync] Save success", payload.id);
                        } else if (appMode.value === 'GUEST') {
                            const localOnly = transactions.value.filter(t => !t.isRemote);
                            localStorage.setItem('guest_data', JSON.stringify({ transactions: localOnly }));
                        }
                    } catch (bgError) {
                        console.error("[Background Sync] Failed", bgError);
                    } finally {
                        syncStatus.value = 'idle';
                    }
                })();

            } catch (e) {
                console.error("Save Error", e);
                dialog.alert("儲存錯誤: " + e.message);
            }
        };

        const handleTabChange = async (newTab) => {
            if (isSettingsDirty.value) {
                // Ask if user wants to save changes
                if (await dialog.confirm("是否儲存當前編輯狀態？", {
                    confirmText: "儲存",
                    secondaryText: "不儲存"
                })) {
                    // User clicked "儲存" - trigger save via event
                    // Emit a global event that settings page can listen to
                    window.dispatchEvent(new CustomEvent('settings-save-requested'));

                    // Wait a bit for save to complete
                    await new Promise(resolve => setTimeout(resolve, 300));

                    isSettingsDirty.value = false;
                    currentTab.value = newTab;
                } else {
                    // User clicked "不儲存" - discard changes and clear edit state
                    sessionStorage.removeItem('settings_edit_state');
                    isSettingsDirty.value = false;
                    currentTab.value = newTab;
                }
            } else {
                currentTab.value = newTab;
            }
        };

        const handleDelete = async (row) => {
            if (appMode.value === 'VIEWER') return;
            let idToDelete = null;
            let item = null;

            if (typeof row === 'string' && row.startsWith('tx_')) {
                idToDelete = row;
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

            // --- 1. OPTIMISTIC UI ---
            if (item) {
                transactions.value = transactions.value.filter(t => t.id !== item.id);
            }

            // --- 2. IMMEDIATE FEEDBACK ---
            const goHistory = () => { currentTab.value = 'history'; editForm.value = null; };
            if (item) {
                dialog.showTransactionSuccess(item, goHistory, {
                    title: '已刪除',
                    confirmText: '返回明細',
                    secondaryText: '',
                    onConfirm: goHistory
                });
            }

            // --- 3. BACKGROUND SYNC ---
            if (appMode.value === 'ADMIN' && idToDelete) {
                (async () => {
                    syncStatus.value = 'syncing';
                    try {
                        await API.saveTransaction({ action: 'delete', id: idToDelete });
                        console.log("[Background Sync] Delete success", idToDelete);
                    } catch (e) {
                        console.error("[Background Sync] Delete failed", e);
                    } finally {
                        syncStatus.value = 'idle';
                    }
                })();
            }
        };

        const handleDeleteMultiple = async (ids) => {
            if (appMode.value === 'VIEWER') return;
            if (ids.length === 0) return;

            // 1. OPTIMISTIC UI
            transactions.value = transactions.value.filter(t => !ids.includes(t.id));

            if (appMode.value === 'GUEST') {
                const localOnly = transactions.value.filter(t => !t.isRemote);
                localStorage.setItem('guest_data', JSON.stringify({ transactions: localOnly }));
                dialog.alert(`已刪除 ${ids.length} 筆訪客資料 (Guest)`, 'success');
                return;
            }

            // 2. BACKGROUND SYNC
            (async () => {
                syncStatus.value = 'syncing';
                try {
                    await API.deleteMultipleTransactions(ids);
                    console.log("[Background Sync] Multiple delete success", ids.length);
                } catch (e) {
                    console.error("[Background Sync] Multiple delete failed", e);
                } finally {
                    syncStatus.value = 'idle';
                }
            })();

            dialog.alert(`已成功刪除 ${ids.length} 筆資料`, 'success');
        };

        const resetForm = () => {
            const defaultPayer = '我'; // UX: Always default to '我'
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
            API.onAuthStateChanged(async (user) => {
                const prevUser = currentUser.value;
                currentUser.value = user;

                // If user changed (e.g. login or logout), reload data
                // Also first load
                loadData();
            });

            // Capacitor Deep link handling
            if (window.Capacitor && window.Capacitor.isNativePlatform()) {
                const { App } = window.Capacitor.Plugins;
                if (App) {
                    App.addListener('appUrlOpen', data => {
                        console.log('App opened with URL: ' + data.url);
                        // Handle schemes like: nichinichi://add
                        try {
                            const urlStr = data.url;
                            if (urlStr.includes('://add')) {
                                currentTab.value = 'add';
                            } else if (urlStr.includes('://home')) {
                                currentTab.value = 'overview';
                            }
                        } catch (e) { console.error("Deep link error", e); }
                    });
                }
            }
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
            console.log('[DEBUG] handleUpdateUserData called with:', JSON.stringify(data));

            if (appMode.value === 'GUEST') {
                if (data.categories) localStorage.setItem('guest_categories', JSON.stringify(data.categories));
                if (data.paymentMethods) localStorage.setItem('guest_payments', JSON.stringify(data.paymentMethods));
                if (data.friends) localStorage.setItem('guest_friends', JSON.stringify(data.friends));
                await loadData(true);
                return;
            }
            if (appMode.value !== 'ADMIN') return;

            // Background Sync for User Data
            (async () => {
                syncStatus.value = 'syncing';
                try {
                    console.log('[DEBUG] Calling API.updateUserData...');
                    await API.updateUserData(data);
                    console.log('[DEBUG] API.updateUserData completed successfully');
                    await loadData(true);
                } catch (e) {
                    console.error("User data sync failed", e);
                    if (!silent) dialog.alert("設定同步失敗: " + e.message);
                } finally {
                    syncStatus.value = 'idle';
                }
            })();
        };

        const handleAddFriendToList = async (n) => {
            const exists = friends.value.some(f => f.name === n);
            if (!exists) {
                const newFriend = { id: generateId('f'), name: n, visible: true };
                friends.value.push(newFriend);

                if (appMode.value === 'ADMIN') {
                    (async () => {
                        syncStatus.value = 'syncing';
                        try {
                            await API.updateUserData({ friends: JSON.parse(JSON.stringify(friends.value)) });
                            await loadData(true);
                        } catch (e) {
                            console.error("Friend sync failed", e);
                        } finally {
                            syncStatus.value = 'idle';
                        }
                    })();
                } else if (appMode.value === 'GUEST') {
                    localStorage.setItem('guest_friends', JSON.stringify(friends.value));
                    await loadData(true);
                }
            }
        };

        const methods = {
            currentTab, handleTabChange, loading, currentUser, categories, friends, paymentMethods, projects,
            transactions, filteredTransactions, systemConfig, form, editForm, selectedProject, selectedFriend, fxRate, historyFilter,
            syncStatus, hasMultipleCurrencies, appMode,
            handleDeleteFriend: async (id) => {
                const friend = friends.value.find(f => f.id === id);
                if (!friend) return;

                if (appMode.value === 'GUEST') {
                    friends.value = friends.value.filter(f => f.id !== id);
                    localStorage.setItem('guest_friends', JSON.stringify(friends.value));
                    currentTab.value = 'settings';
                    return;
                }

                if (appMode.value !== 'ADMIN') return;

                if (!await dialog.confirm(`確定要刪除 ${friend.name} 嗎？`)) return;

                // --- 1. OPTIMISTIC UI ---
                friends.value = friends.value.filter(f => f.id !== id);
                currentTab.value = 'settings';

                // --- 2. BACKGROUND SYNC ---
                (async () => {
                    syncStatus.value = 'syncing';
                    try {
                        await API.deleteFriend(id);
                        console.log("[Background Sync] Friend delete success", id);
                        await loadData(true);
                    } catch (e) {
                        console.error("[Background Sync] Friend delete failed", e);
                        dialog.alert("刪除失敗: " + e.message);
                    } finally {
                        syncStatus.value = 'idle';
                    }
                })();
            },

            handleSubmit, handleDelete, handleDeleteMultiple, handleEditItem,
            formatNumber: (n) => new Intl.NumberFormat().format(Math.round(n || 0)),
            getTabIcon,
            toggleCurrency: () => {
                const target = currentTab.value === 'edit' ? editForm.value : form.value;
                if (target) {
                    target.currency = target.currency === 'JPY' ? 'TWD' : 'JPY';
                }
            },
            handleAddFriendToList,
            resetForm,
            handleDrillDown: (id) => { historyFilter.value = { mode: 'all', categoryId: id, friendName: null, currency: null, keyword: '' }; currentTab.value = 'history'; },

            modalState, handleModalConfirm, handleModalCancel,
            baseCurrency, toggleBaseCurrency,

            handleUpdateConfig: async (c) => {
                if (appMode.value === 'GUEST') {
                    systemConfig.value = { ...systemConfig.value, ...c };
                    localStorage.setItem('guest_config', JSON.stringify(systemConfig.value));
                    await loadData(true);
                    return;
                }
                if (appMode.value !== 'ADMIN') return dialog.alert("權限不足", 'error');

                // Optimistic Local State
                systemConfig.value = { ...systemConfig.value, ...c };

                // Background Sync
                (async () => {
                    syncStatus.value = 'syncing';
                    try {
                        await API.saveTransaction({ action: 'updateConfig', ...c });
                        await loadData(true);
                        console.log("[Background Sync] Config update success");
                    } catch (e) {
                        console.error("[Background Sync] Config update failed", e);
                    } finally {
                        syncStatus.value = 'idle';
                    }
                })();
            },
            handleUpdateUserData,
            handleViewFriend: (f) => { selectedFriend.value = f; currentTab.value = 'friend-detail'; },
            handleUpdateFriend: async (data) => {
                const { id, newName, visible } = data;

                const idx = friends.value.findIndex(f => f.id === id);
                if (idx !== -1) {
                    const oldName = friends.value[idx].name;
                    const oldVisible = friends.value[idx].visible;

                    // 1. OPTIMISTIC LOCAL UPDATE
                    friends.value[idx] = { ...friends.value[idx], name: newName, visible: visible };

                    if (selectedFriend.value && (selectedFriend.value.id === id || selectedFriend.value.name === oldName)) {
                        selectedFriend.value = { ...friends.value[idx] };
                    }

                    // [NEW] OPTIMISTIC LOCAL UPDATE (Transactions)
                    // Update all transaction references to the old name to keep them linked
                    if (oldName !== newName) {
                        transactions.value.forEach(t => {
                            if (t.payer === oldName) t.payer = newName;
                            if (t.friendName) {
                                if (t.friendName === oldName) {
                                    t.friendName = newName;
                                } else if (t.friendName.includes(oldName)) {
                                    // Replace only whole words to avoid partial matching (e.g. "Bob" vs "Bobby")
                                    const regex = new RegExp('\\b' + oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
                                    t.friendName = t.friendName.replace(regex, newName);
                                }
                            }
                        });
                    }

                    // 2. BACKGROUND SYNC
                    if (appMode.value === 'ADMIN') {
                        (async () => {
                            syncStatus.value = 'syncing';
                            try {
                                // Background sync friends list
                                await API.updateUserData({ friends: JSON.parse(JSON.stringify(friends.value)) });

                                // If name changed, trigger legacy rename for transactions
                                if (oldName !== newName) {
                                    await API.saveTransaction({ action: 'renameFriend', oldName, newName, id });
                                }

                                // Silent reload to stay in sync
                                await loadData(true);
                                console.log("[Background Sync] Friend update success", id);
                            } catch (e) {
                                console.error("[Background Sync] Friend update failed", e);
                                // Rollback local state on failure (optional, but good for robustness)
                                // friends.value[idx] = { ...friends.value[idx], name: oldName, visible: oldVisible };
                            } finally {
                                syncStatus.value = 'idle';
                            }
                        })();
                    } else {
                        // Guest mode: just save and reload
                        localStorage.setItem('guest_friends', JSON.stringify(friends.value));
                        await loadData(true);
                    }
                }
            },
            handleViewProject: (p) => { selectedProject.value = p; currentTab.value = 'project-detail'; },
            handleViewHistory,
            handleUpdateProject: async (projectData) => {
                if (!projectData || !projectData.id) {
                    await loadData(true);
                    return;
                }
                const idx = projects.value.findIndex(p => p.id === projectData.id);
                if (idx !== -1) {
                    // 1. OPTIMISTIC UPDATE
                    projects.value[idx] = { ...projects.value[idx], ...projectData };
                    if (selectedProject.value && selectedProject.value.id === projectData.id) {
                        selectedProject.value = { ...projects.value[idx] };
                    }

                    // 2. BACKGROUND SYNC
                    if (appMode.value === 'ADMIN') {
                        (async () => {
                            syncStatus.value = 'syncing';
                            try {
                                await API.saveTransaction({
                                    action: 'updateProject',
                                    ...projectData
                                });
                                await loadData(true);
                            } catch (e) {
                                console.error("Project update failed", e);
                            } finally {
                                syncStatus.value = 'idle';
                            }
                        })();
                    } else if (appMode.value === 'GUEST') {
                        localStorage.setItem('guest_projects', JSON.stringify(projects.value));
                        await loadData(true);
                    }
                }
            },
            handleDeleteProject: async (projectId) => {
                if (!projectId || appMode.value === 'VIEWER') return;

                // --- 1. OPTIMISTIC UI ---
                projects.value = projects.value.filter(p => p.id !== projectId);
                currentTab.value = 'settings';

                // --- 2. BACKGROUND SYNC ---
                if (appMode.value === 'ADMIN') {
                    (async () => {
                        syncStatus.value = 'syncing';
                        try {
                            await API.saveTransaction({
                                action: 'updateProject',
                                id: projectId,
                                visible: false
                            });
                            await loadData(true);
                        } catch (e) {
                            console.error("Project delete failed", e);
                            dialog.alert("刪除失敗: " + e.message);
                        } finally {
                            syncStatus.value = 'idle';
                        }
                    })();
                } else if (appMode.value === 'GUEST') {
                    localStorage.setItem('guest_projects', JSON.stringify(projects.value));
                    await loadData(true);
                }
            },


            iconEditContext,
            handleOpenIconEdit: (ctx) => {
                iconEditContext.value = ctx;
                currentTab.value = 'icon-edit';
            },
            handleClearAccountData: async () => {
                loading.value = true;
                try {
                    await API.clearAccountData();
                    await API.logout();
                    await dialog.alert("記帳資料已全數刪除。", "success");
                } catch (e) {
                    console.error(e);
                    await dialog.alert("刪除失敗，請稍後再試: " + e.message);
                } finally {
                    loading.value = false;
                    // Force full reload to clean all states only after alert is dismissed
                    window.location.href = window.location.origin + window.location.pathname;
                }
            },
            handleSelectIcon: ({ icon, name }) => {
                console.log('[DEBUG handleSelectIcon] Received:', { icon, name, context: iconEditContext.value });

                if (!iconEditContext.value) return;
                const { type, id } = iconEditContext.value;

                // Check if we're in edit mode (from sessionStorage)
                const editState = sessionStorage.getItem('settings_edit_state');
                let inEditMode = false;

                if (editState) {
                    try {
                        const state = JSON.parse(editState);
                        inEditMode = state.isCategoryModeEdit || state.isPaymentModeEdit;

                        // Update the sessionStorage state
                        if (type === 'category' && state.isCategoryModeEdit) {
                            const cat = state.localCategories.find(c => c.id === id);
                            if (cat) {
                                cat.icon = icon;
                                cat.name = name;
                                sessionStorage.setItem('settings_edit_state', JSON.stringify(state));
                                console.log('[DEBUG handleSelectIcon] Updated localCategories in sessionStorage');
                            }
                        } else if (type === 'payment' && state.isPaymentModeEdit) {
                            const pm = state.localPaymentMethods.find(p => p.id === id);
                            if (pm) {
                                pm.icon = icon;
                                pm.name = name;
                                sessionStorage.setItem('settings_edit_state', JSON.stringify(state));
                                console.log('[DEBUG handleSelectIcon] Updated localPaymentMethods in sessionStorage');
                            }
                        }
                    } catch (e) {
                        console.error('Failed to parse edit state:', e);
                    }
                }

                // If NOT in edit mode, update the root state and save to database
                if (!inEditMode) {
                    console.log('[DEBUG handleSelectIcon] Not in edit mode, saving directly to database');

                    if (type === 'category') {
                        const cat = categories.value.find(c => c.id === id);
                        if (cat) {
                            cat.icon = icon;
                            cat.name = name;
                        }
                        // Save to database
                        handleUpdateUserData({ categories: categories.value }, true);
                    } else if (type === 'payment') {
                        const pm = paymentMethods.value.find(p => p.id === id);
                        if (pm) {
                            pm.icon = icon;
                            pm.name = name;
                        }
                        // Save to database
                        handleUpdateUserData({ paymentMethods: paymentMethods.value }, true);
                    }
                }

                // Check if we're in custom list edit mode
                const customEditState = sessionStorage.getItem('custom_list_edit_state');
                if (customEditState) {
                    try {
                        const state = JSON.parse(customEditState);
                        if (type === 'category') {
                            const cat = state.localCategories.find(c => c.id === id);
                            if (cat) { cat.icon = icon; cat.name = name; }
                        } else if (type === 'payment') {
                            const pm = state.localPaymentMethods.find(p => p.id === id);
                            if (pm) { pm.icon = icon; pm.name = name; }
                        }
                        sessionStorage.setItem('custom_list_edit_state', JSON.stringify(state));
                        currentTab.value = 'custom-list';
                        return;
                    } catch (e) {
                        console.error('Failed to parse custom edit state:', e);
                    }
                }

                currentTab.value = 'settings';
            },
            handleIconEditCancel: () => {
                const customEditState = sessionStorage.getItem('custom_list_edit_state');
                if (customEditState) {
                    currentTab.value = 'custom-list';
                } else {
                    currentTab.value = 'settings';
                }
            },

            // NEW: Auth Methods
            handleGoogleLogin: async () => {
                // Check if there is guest data to merge
                if (appMode.value === 'GUEST' && transactions.value.length > 0) {
                    const confirmMerge = await dialog.confirm("偵測到訪客資料，是否將目前資料存入 Google 帳戶？", {
                        title: "資料同步",
                        confirmText: "是，存入帳戶",
                        secondaryText: "否，僅登入",
                        showCancel: true
                    });

                    if (confirmMerge) {
                        localStorage.setItem('merge_guest_data', 'true');
                    }
                }

                try {
                    await API.login();
                    // AuthStateChanged will handle reload
                    dialog.alert("登入成功", "success");
                } catch (e) {
                    dialog.alert("登入失敗: " + e.message);
                    localStorage.removeItem('merge_guest_data'); // Clear flag on error
                }
            },
            handleLogout: async () => {
                if (await dialog.confirm("確定要登出嗎？")) {
                    await API.logout();
                }
            },

            handleDeleteAccount: async () => {
                // 1. Confirm Request
                const confirmMessage = "請重新登入驗證身分以刪除帳戶，此操作無法復原。";
                const confirmed = await dialog.confirm(confirmMessage, {
                    title: "註銷帳戶",
                    confirmText: "進行驗證",
                    cancelText: "取消"
                }
                );

                if (!confirmed) return;

                // 2. Re-authenticate & Verify Identity
                const originalEmail = currentUser.value.email;

                try {
                    const newUser = await API.reauthenticate(); // Re-auth instead of generic login

                    // Verification Check
                    if (newUser.email !== originalEmail) {
                        await dialog.alert("驗證身分不符，請登入原本的帳戶 (" + originalEmail + ")", "驗證失敗");
                        // Optional: logout the wrong user to avoid confusion? 
                        // Actually API.login updates auth state globally.
                        // We should probably help them switch back or just stop here.
                        return;
                    }

                    loading.value = true;
                    // 3. Delete Account
                    await API.deleteFullAccount();

                    await dialog.alert("帳戶已成功註銷。", "success");
                    // window.location.reload(); // Moved to finally
                } catch (e) {
                    console.error("Delete Account Failed", e);
                    await dialog.alert("驗證失敗或刪除錯誤: " + e.message);
                } finally {
                    loading.value = false;
                    window.location.reload(); // Force reload regardless of success/fail after verification confirmation
                }
            },

            clearGuestData: async () => {
                if (await dialog.confirm("確定要清除所有訪客資料嗎？", "清除資料")) {
                    localStorage.removeItem('guest_data');
                    window.location.reload();
                }
            },
            retrySync: async () => { await loadData(true); }, // Manual background refresh
            handleCreateProject: async (input) => {
                if (appMode.value !== 'ADMIN' && appMode.value !== 'GUEST') return dialog.alert("權限不足");
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

                let newProject = null;

                // Guest Mode Project Creation
                if (appMode.value === 'GUEST') {
                    newProject = {
                        id: 'proj_' + Date.now(),
                        name: name,
                        startDate: startDate,
                        endDate: endDate,
                        status: 'Planned',
                        createdAt: new Date().toISOString()
                    };
                    projects.value.push(newProject);
                    localStorage.setItem('guest_projects', JSON.stringify(projects.value));
                } else {
                    // ADMIN: Optimistic Update & Immediate Sync
                    newProject = {
                        id: 'proj_' + Math.floor(Math.random() * 1000000), // Temp ID
                        name: name,
                        startDate: startDate,
                        endDate: endDate,
                        status: 'Active'
                    };
                    projects.value.push(newProject);

                    // BACKGROUND SYNC
                    (async () => {
                        syncStatus.value = 'syncing';
                        try {
                            await API.saveTransaction({
                                action: 'updateProject',
                                id: newProject.id,
                                name: newProject.name,
                                startDate: newProject.startDate,
                                endDate: newProject.endDate,
                                status: newProject.status
                            });
                            await loadData(true);
                        } catch (e) {
                            console.error("Project sync failed", e);
                        } finally {
                            syncStatus.value = 'idle';
                        }
                    })();
                }

                // Auto Select Project
                if (newProject) {
                    if (currentTab.value === 'add' && form.value) {
                        form.value = { ...form.value, projectId: newProject.id };
                    } else if (currentTab.value === 'edit' && editForm.value) {
                        editForm.value = { ...editForm.value, projectId: newProject.id };
                    }
                }
            }
        };

        const autoBackupIfNeeded = async () => {
            if (currentUser.value?.uid && systemConfig.value.auto_backup) {
                const today = new Date().toISOString().slice(0, 10);
                const lastBackup = localStorage.getItem('last_backup_date');
                if (lastBackup === today) return;

                try {
                    const token = API.getGoogleToken();
                    if (!token) return;

                    const data = {
                        transactions: transactions.value,
                        categories: categories.value,
                        paymentMethods: paymentMethods.value,
                        projects: projects.value,
                        friends: friends.value,
                        config: systemConfig.value
                    };

                    // Cloud Save: JSON + Spreadsheet simultaneously
                    await GoogleSheetsService.cloudSave(data, token, API.requestIncrementalScope);
                    localStorage.setItem('last_backup_date', today);
                    console.log("Auto cloud save completed (JSON + Spreadsheet).");
                } catch (e) {
                    console.error("Auto cloud save failed", e);
                }
            }
        };

        onMounted(() => {
            setTimeout(autoBackupIfNeeded, 5000);
        });

        return methods;
    }
}).mount('#app');
