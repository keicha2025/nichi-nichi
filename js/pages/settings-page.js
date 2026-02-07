import { CONFIG } from '../config.js';
import { API } from '../api.js';
// IconPicker removed as it's now a standalone page IconEditPage

export const SettingsPage = {
    template: `
    <section class="space-y-4 py-4 animate-in fade-in pb-24">
        <!-- 0. 基本設定卡片 -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-6">
            <h3 class="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium px-2">System Config</h3>
            
            <div class="space-y-4">
                <!-- 1. 使用者名稱 -->
                <div class="flex items-center justify-between px-2">
                    <span class="text-xs text-gray-500">使用者名稱</span>
                    <input type="text" v-model="localConfig.user_name" class="text-right text-xs bg-gray-50 px-3 py-2 rounded-xl outline-none w-32 placeholder-gray-300">
                </div>

                <!-- 2. 當前匯率 -->
                <div class="flex items-center justify-between px-2">
                    <span class="text-xs text-gray-500">當前匯率 (1 JPY = ? TWD)</span>
                    <input type="number" v-model="localConfig.fx_rate" step="0.001" class="text-right text-xs bg-gray-50 px-3 py-2 rounded-xl outline-none w-32">
                </div>

                <!-- 3. 帶入預設資料 (Guest Only) -->
                <div v-if="appMode === 'GUEST'" class="flex items-center justify-between px-2 bg-gray-50 p-3 rounded-xl">
                    <span class="text-xs text-gray-500">帶入記帳資料</span>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="localConfig.import_default" class="sr-only peer">
                        <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4A4A4A]"></div>
                    </label>
                </div>
            </div>

            <!-- 更新按鈕 -->
            <button @click="saveSettings" :disabled="saving" class="w-full bg-[#4A4A4A] text-white py-4 rounded-2xl text-[10px] font-medium tracking-[0.3em] uppercase active:scale-95 transition-all">
                {{ saving ? 'Saving...' : '更新設定' }}
            </button>

             <!-- 清除訪客資料 -->
             <div v-if="appMode === 'GUEST'" class="pt-2 border-t border-gray-100">
                <button @click="$emit('clear-guest-data')" class="w-full text-red-400 text-[10px] tracking-widest py-2 rounded-lg transition-colors">
                    清除訪客資料
                </button>
            </div>
        </div>

        <!-- NEW: 類別管理 -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-4">
            <h3 class="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium px-2 flex justify-between items-center">
                <span>類別管理</span>
                <div class="flex items-center space-x-3">
                    <button v-if="isCategoryModeEdit" @click="addCategory" class="text-gray-400 hover:text-gray-600">
                        <span class="material-symbols-rounded text-lg">add</span>
                    </button>
                    <button @click="isCategoryModeEdit = !isCategoryModeEdit" :class="isCategoryModeEdit ? 'text-gray-800' : 'text-gray-400'" class="hover:text-gray-600 transition-colors">
                        <span class="material-symbols-rounded text-lg">{{ isCategoryModeEdit ? 'check_circle' : 'edit' }}</span>
                    </button>
                </div>
            </h3>
            <div class="space-y-2">
                <!-- 編輯模式 -->
                <template v-if="isCategoryModeEdit">
                    <div v-for="(cat, idx) in sortedCategories" :key="'edit-cat-'+cat.id" class="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl">
                        <!-- Reorder -->
                        <div class="flex flex-col space-y-0.5">
                            <button @click="moveItem('categories', idx, -1)" class="text-gray-300 hover:text-gray-500 text-[10px]" :disabled="idx===0">▲</button>
                            <button @click="moveItem('categories', idx, 1)" class="text-gray-300 hover:text-gray-500 text-[10px]" :disabled="idx===sortedCategories.length-1">▼</button>
                        </div>
                        <!-- Icon -->
                        <button @click="openIconPicker('category', idx)" class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 shadow-sm border border-gray-100">
                             <span class="material-symbols-rounded text-lg">{{ cat.icon }}</span>
                        </button>
                        <!-- Name input -->
                        <input type="text" v-model="cat.name" @change="debouncedUpdate" class="bg-transparent text-xs font-medium text-gray-700 w-full outline-none">
                        <!-- Delete -->
                        <button @click="deleteItem('categories', idx)" class="text-gray-300 hover:text-red-400 px-2">
                            <span class="material-symbols-rounded text-sm">remove_circle</span>
                        </button>
                    </div>
                </template>
                <!-- 預覽模式 -->
                <template v-else>
                    <div class="grid grid-cols-5 gap-2 px-2">
                        <div v-for="cat in sortedCategories" :key="'view-cat-'+cat.id" class="flex flex-col items-center p-2 rounded-xl bg-gray-50">
                             <span class="material-symbols-rounded text-lg text-gray-400 mb-1">{{ cat.icon }}</span>
                             <span class="text-[9px] text-gray-500 truncate w-full text-center">{{ cat.name }}</span>
                        </div>
                    </div>
                </template>
            </div>
             <p v-if="isCategoryModeEdit" class="text-[9px] text-gray-300 text-center pt-2">可編輯名稱、圖示與排序</p>
        </div>

        <!-- NEW: 支付方式管理 -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-4">
             <h3 class="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium px-2 flex justify-between items-center">
                <span>支付方式管理</span>
                <div class="flex items-center space-x-3">
                    <button v-if="isPaymentModeEdit" @click="addPaymentMethod" class="text-gray-400 hover:text-gray-600">
                        <span class="material-symbols-rounded text-lg">add</span>
                    </button>
                    <button @click="isPaymentModeEdit = !isPaymentModeEdit" :class="isPaymentModeEdit ? 'text-gray-800' : 'text-gray-400'" class="hover:text-gray-600 transition-colors">
                        <span class="material-symbols-rounded text-lg">{{ isPaymentModeEdit ? 'check_circle' : 'edit' }}</span>
                    </button>
                </div>
            </h3>
             <div class="space-y-2">
                <!-- 編輯模式 -->
                <template v-if="isPaymentModeEdit">
                    <div v-for="(pm, idx) in sortedPaymentMethods" :key="'edit-pm-'+pm.id" class="flex items-center space-x-2 bg-gray-50 p-2 rounded-xl">
                        <div class="flex flex-col space-y-0.5">
                             <button @click="moveItem('paymentMethods', idx, -1)" class="text-gray-300 hover:text-gray-500 text-[10px]" :disabled="idx===0">▲</button>
                             <button @click="moveItem('paymentMethods', idx, 1)" class="text-gray-300 hover:text-gray-500 text-[10px]" :disabled="idx===sortedPaymentMethods.length-1">▼</button>
                        </div>
                        <!-- Icon -->
                        <button @click="openIconPicker('payment', idx)" class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-500 shadow-sm border border-gray-100">
                             <span class="material-symbols-rounded text-lg">{{ pm.icon || 'payments' }}</span>
                        </button>
                        <input type="text" v-model="pm.name" @change="debouncedUpdate" class="bg-transparent text-xs font-medium text-gray-700 w-full outline-none px-2">
                        <button @click="deleteItem('paymentMethods', idx)" class="text-gray-300 hover:text-red-400 px-2">
                            <span class="material-symbols-rounded text-sm">remove_circle</span>
                        </button>
                    </div>
                </template>
                <!-- 預覽模式 -->
                <template v-else>
                    <div class="grid grid-cols-2 gap-2 px-2">
                         <div v-for="pm in sortedPaymentMethods" :key="'view-pm-'+pm.id" class="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                             <span class="material-symbols-rounded text-base text-gray-400">{{ pm.icon || 'payments' }}</span>
                             <span class="text-xs text-gray-600 font-medium">{{ pm.name }}</span>
                         </div>
                    </div>
                </template>
            </div>
        </div>


        <!-- 1. 旅行計畫 (Projects) -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-4">
            <h3 class="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium px-2 flex justify-between items-center">
                <span>旅行計畫</span>
                <button @click="isAddingProject = !isAddingProject" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <span class="material-symbols-rounded text-lg">{{ isAddingProject ? 'remove' : 'add' }}</span>
                </button>
            </h3>
            
            <!-- 新增專案表單 -->
            <div v-if="isAddingProject" class="bg-gray-50 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                <input type="text" v-model="newProject.name" placeholder="計畫名稱 (例如: 京都之旅)" class="w-full bg-white px-3 py-2 rounded-lg text-xs outline-none">
                <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <input type="date" v-model="newProject.startDate" class="bg-white px-3 py-2 rounded-lg text-xs outline-none text-gray-500 w-full">
                    <span class="text-gray-300">~</span>
                    <input type="date" v-model="newProject.endDate" class="bg-white px-3 py-2 rounded-lg text-xs outline-none text-gray-500 w-full">
                </div>
                <button @click="createProject" :disabled="projectSaving" class="w-full bg-gray-800 text-white py-2 rounded-lg text-[10px] tracking-widest uppercase">
                    {{ projectSaving ? '新增中...' : '新增計畫' }}
                </button>
            </div>

            <div class="space-y-3">
                 <div v-if="!projects || projects.length === 0" class="text-xs text-gray-300 px-2">無專案</div>
                 <div v-for="p in projects" :key="p.id" 
                      @click="$emit('view-project', p)"
                      class="flex justify-between items-center p-3 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors cursor-pointer">
                    <div class="flex flex-col">
                        <span class="text-xs font-medium text-gray-700">{{ typeof p.name === 'object' ? p.name.name : p.name }}</span>
                        <span class="text-[9px] text-gray-400">{{ p.startDate }} ~ {{ p.endDate }}</span>
                    </div>
                    <span :class="p.status === 'Active' ? 'bg-[#4A4A4A] text-white' : 'bg-gray-200 text-gray-500'" class="text-[9px] px-2 py-1 rounded-full">{{ getStatusLabel(p.status) }}</span>
                 </div>
            </div>
        </div>

        <!-- 2. 朋友名單管理 -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-4">
            <h3 class="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium px-2">Friends List</h3>
            <div class="grid grid-cols-1 divide-y divide-gray-50">
                <div v-for="f in friends" :key="f" @click="$emit('view-friend', f)" 
                     class="py-4 flex justify-between items-center active:bg-gray-50 transition-colors px-2 cursor-pointer">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span class="material-symbols-rounded text-gray-400 text-sm">person</span>
                        </div>
                        <span class="text-xs text-gray-600 font-medium">{{ f }}</span>
                    </div>
                    <span class="material-symbols-rounded text-gray-200 text-sm">arrow_forward_ios</span>
                </div>
            </div>
        </div>

        <!-- 4. Account & Sync -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-4">
             <h3 class="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium px-2">Account</h3>
             
             <!-- ADMIN MODE (Logged In) -->
             <div v-if="appMode === 'ADMIN'" class="space-y-4">
                 <div class="flex items-center space-x-3 px-2">
                     <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                         <img v-if="config.photoURL" :src="config.photoURL" class="w-full h-full object-cover">
                         <span v-else class="material-symbols-rounded text-gray-400 p-2">person</span>
                     </div>
                     <div class="flex flex-col">
                         <span class="text-xs font-bold text-gray-700">{{ currentUser?.displayName || config.user_name || 'User' }}</span>
                         <span class="text-[9px] text-gray-400">{{ currentUser?.email }}</span>
                     </div>
                 </div>

                 <!-- SHARED LINK TOGGLE -->
                 <div class="bg-gray-50 p-4 rounded-xl space-y-3">
                     <div class="flex items-center justify-between">
                         <span class="text-xs text-gray-600 font-medium">公開分享連結 (唯讀)</span>
                         <label class="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" v-model="isSharedLinkEnabled" @change="toggleShare" class="sr-only peer">
                             <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4A4A4A]"></div>
                         </label>
                     </div>
                     <div v-if="sharedLink" class="space-y-2 animate-in fade-in">
                        <p class="text-[9px] text-gray-400">將此連結分享給朋友，他們能檢視但無法編輯。</p>
                        <div class="flex items-center space-x-2 bg-white px-2 py-2 rounded-lg border border-gray-100">
                             <input type="text" readonly :value="sharedLink" class="w-full text-[10px] text-gray-500 outline-none">
                             <button @click="copyLink" class="text-gray-400 hover:text-gray-600">
                                 <span class="material-symbols-rounded text-sm">{{ copied ? 'check' : 'content_copy' }}</span>
                             </button>
                        </div>
                     </div>
                 </div>

                 <button @click="$emit('logout')" class="w-full border border-gray-200 text-gray-500 py-3 rounded-xl text-xs font-medium active:bg-gray-50">
                     登出 Google 帳號
                 </button>
             </div>

             <!-- GUEST MODE -->
             <div v-else-if="appMode === 'GUEST'" class="space-y-4">
                 <p class="text-[10px] text-gray-400 px-2 leading-relaxed">
                    登入 Google 帳號以開啟雲端同步、多裝置存取與分享功能。
                 </p>
                 <button @click="$emit('login')" class="w-full bg-[#4285F4] text-white py-3 rounded-xl flex items-center justify-center space-x-2 shadow-sm active:scale-95 transition-transform">
                     <svg class="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                     </svg>
                     <span class="text-xs font-medium tracking-wide">使用 Google 帳號登入</span>
                 </button>
             </div>
             <!-- VIEWER MODE -->
             <div v-else class="space-y-3">
                 <div class="text-[10px] text-gray-400 px-2">閱覽模式 (唯讀)</div>
             </div>
        </div>
        
        <!-- Icon Picker Modal Removed -->
    </section>
    `,
    props: ['config', 'friends', 'projects', 'transactions', 'appMode', 'currentUser', 'categories', 'paymentMethods'],
    emits: ['update-config', 'update-user-data', 'view-project', 'view-friend', 'login', 'logout', 'clear-guest-data', 'create-project', 'open-icon-edit'],
    data() {
        return {
            localConfig: { user_name: '', fx_rate: 0.22 },
            saving: false,
            sheetUrl: CONFIG.SPREADSHEET_URL,
            isAddingProject: false,
            projectSaving: false,
            newProject: { name: '', startDate: '', endDate: '' },
            selectedProject: null,
            isSharedLinkEnabled: false,
            sharedLink: '',
            copied: false,

            // Customization Data
            isCategoryModeEdit: false,
            isPaymentModeEdit: false,
            sortedCategories: [],
            sortedPaymentMethods: [],
            debouncedTimeout: null
        };
    },
    watch: {
        config: {
            handler(newVal) {
                if (newVal) {
                    this.localConfig = { ...newVal };
                    if (newVal.sharedId) {
                        this.isSharedLinkEnabled = true;
                        this.sharedLink = window.location.origin + window.location.pathname + '?mode=view&id=' + newVal.sharedId;
                    } else {
                        this.isSharedLinkEnabled = false;
                        this.sharedLink = '';
                    }
                }
            },
            immediate: true,
            deep: true
        },
        categories: {
            handler(val) { this.sortedCategories = JSON.parse(JSON.stringify(val || [])).sort((a, b) => (a.order || 99) - (b.order || 99)); },
            immediate: true,
            deep: true
        },
        paymentMethods: {
            handler(val) { this.sortedPaymentMethods = JSON.parse(JSON.stringify(val || [])).sort((a, b) => (a.order || 99) - (b.order || 99)); },
            immediate: true,
            deep: true
        }
    },
    methods: {
        async saveSettings() {
            this.saving = true;
            try {
                this.$emit('update-config', this.localConfig);
            } finally {
                this.saving = false;
            }
        },
        async createProject() {
            if (!this.newProject.name) return this.dialog.alert("Please enter a name");
            this.projectSaving = true;
            try {
                // ... same old logic, using emit
                await this.$emit('create-project', this.newProject);
                this.isAddingProject = false;
                this.newProject = { name: '', startDate: '', endDate: '' };
            } catch (e) {
                // error handled
            } finally {
                this.projectSaving = false;
            }
        },
        async toggleShare() {
            if (this.isSharedLinkEnabled) {
                // Enable
                try {
                    const id = await API.updateSharedLink(true);
                    this.sharedLink = window.location.origin + window.location.pathname + '?mode=view&id=' + id;
                    // update local config to reflect change
                    this.localConfig.sharedId = id;
                } catch (e) {
                    console.error(e);
                    this.dialog.alert("開啟失敗: " + e.message);
                    this.isSharedLinkEnabled = false;
                }
            } else {
                // Disable
                if (await this.dialog.confirm("確定要關閉分享嗎？舊的連結將失效。")) {
                    await API.updateSharedLink(false);
                    this.sharedLink = '';
                    this.localConfig.sharedId = null;
                } else {
                    this.isSharedLinkEnabled = true; // revert
                }
            }
        },
        copyLink() {
            navigator.clipboard.writeText(this.sharedLink);
            this.copied = true;
            setTimeout(() => this.copied = false, 2000);
        },

        // --- Customization Logic ---
        debouncedUpdate() {
            if (this.debouncedTimeout) clearTimeout(this.debouncedTimeout);
            this.debouncedTimeout = setTimeout(() => {
                this.saveCustomData();
            }, 1000); // Auto-save after 1s of no typing
        },
        async saveCustomData() {
            // Re-assign orders based on index
            this.sortedCategories.forEach((c, i) => c.order = i + 1);
            this.sortedPaymentMethods.forEach((p, i) => p.order = i + 1);

            // Emit update to parent
            this.$emit('update-user-data', {
                categories: this.sortedCategories,
                paymentMethods: this.sortedPaymentMethods
            });
        },
        moveItem(type, index, direction) {
            const list = type === 'categories' ? this.sortedCategories : this.sortedPaymentMethods;
            if (index + direction < 0 || index + direction >= list.length) return;

            // Swap
            const temp = list[index];
            list[index] = list[index + direction];
            list[index + direction] = temp;

            this.saveCustomData(); // Save immediately on reorder
        },
        async deleteItem(type, index) {
            if (!await this.dialog.confirm("確定刪除此項目？")) return;
            const list = type === 'categories' ? this.sortedCategories : this.sortedPaymentMethods;
            list.splice(index, 1);
            this.saveCustomData();
        },
        addCategory() {
            this.sortedCategories.push({
                id: 'cat_' + Date.now(),
                name: '新類別',
                icon: 'star',
                type: '支出',
                order: this.sortedCategories.length + 1
            });
            this.saveCustomData();
        },
        addPaymentMethod() {
            this.sortedPaymentMethods.push({
                id: 'pm_' + Date.now(),
                name: '新支付',
                icon: 'payments',
                order: this.sortedPaymentMethods.length + 1
            });
            this.saveCustomData();
        },
        openIconPicker(type, index) {
            const list = type === 'category' ? this.sortedCategories : this.sortedPaymentMethods;
            const item = list[index];
            this.$emit('open-icon-edit', {
                type,
                index,
                name: item.name,
                icon: item.icon || 'payments'
            });
        },

        formatNumber(num) { return new Intl.NumberFormat().format(Math.round(num || 0)); },
        getStatusLabel(status) {
            const map = { 'Active': '進行中', 'Archived': '已封存', 'Planned': '計劃中' };
            return map[status] || status;
        }
    },
    inject: ['dialog'],
    mounted() {
        this.localConfig = { ...this.config };
    }
};
