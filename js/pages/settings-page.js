import { CONFIG } from '../config.js';
import { API } from '../api.js';
import { GoogleSheetsService } from '../services/google-sheets-service.js';
// IconPicker removed as it's now a standalone page IconEditPage

export const SettingsPage = {
    template: `
    <section class="space-y-4 py-4 animate-in fade-in pb-24">
        <!-- 帳號管理 (GUEST 模式下置頂) -->
        <template v-if="appMode === 'GUEST'">
            <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-subtle space-y-6">
                <h3 class="text-[10px] text-txt-secondary uppercase tracking-[0.2em] font-medium px-2">Account</h3>
                
                <!-- 系統環境設定 (併入區塊) -->
                <div class="bg-bg-subtle p-4 rounded-xl space-y-4">
                    <div class="flex items-center justify-between px-1">
                        <div class="flex items-center space-x-2">
                           <span class="material-symbols-rounded text-base text-txt-secondary">settings_applications</span>
                           <span class="text-xs text-txt-primary font-medium">系統環境設定</span>
                        </div>
                        <button @click="saveSettings" :disabled="saving" class="active:scale-90 transition-all hover:opacity-100 disabled:opacity-30">
                            <span v-if="saving" class="block w-3 h-3 border-2 border-bdr-default border-t-txt-secondary rounded-full animate-spin"></span>
                            <span v-else class="material-symbols-rounded text-sm text-txt-secondary opacity-40">save</span>
                        </button>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="flex items-center justify-between px-1">
                            <span class="text-[10px] text-txt-secondary font-medium uppercase tracking-wider">使用者名稱</span>
                            <input type="text" v-model="localConfig.user_name" @change="saveSettings" 
                                class="text-right text-[11px] bg-white px-3 py-1.5 rounded-lg border border-bdr-subtle outline-none w-36 placeholder-txt-muted shadow-sm focus:border-txt-secondary transition-colors text-txt-primary font-medium">
                        </div>
                        <div class="flex items-center justify-between px-1">
                            <span class="text-[10px] text-txt-secondary font-medium uppercase tracking-wider">當前匯率 (1 JPY = ? TWD)</span>
                            <input type="number" v-model="localConfig.fx_rate" step="0.001" @change="saveSettings" 
                                class="text-right text-[11px] bg-white px-3 py-1.5 rounded-lg border border-bdr-subtle outline-none w-36 shadow-sm focus:border-txt-secondary transition-colors text-txt-primary font-medium">
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <p class="text-[10px] text-txt-secondary px-2 leading-relaxed opacity-80">
                        登入 Google 帳號以開啟雲端同步、多裝置存取與分享功能。
                    </p>
                    
                    <button @click="navigateToGuide" class="w-full border border-bdr-outline text-txt-secondary py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform hover:bg-bg-subtle">
                        <span class="material-symbols-rounded text-base">map</span>
                        <span class="text-xs font-medium tracking-wide">使用指南</span>
                    </button>
    
                    <button @click="$emit('login')" class="w-full border border-bdr-outline text-txt-secondary py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform hover:bg-bg-subtle">
                        <svg class="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                           <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span class="text-xs font-medium tracking-wide">使用 Google 帳號登入</span>
                    </button>

                    <div class="pt-2 border-t border-bdr-subtle">
                        <button @click="$emit('clear-guest-data')" class="w-full text-danger/60 text-[10px] tracking-widest py-2 rounded-lg transition-colors hover:text-danger">
                            清除訪客預覽資料
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <!-- 1. 旅行計畫 (Projects) -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-subtle space-y-4">
            <h3 class="text-[10px] text-txt-secondary uppercase tracking-[0.2em] font-medium px-2 flex justify-between items-center">
                <span>旅行計畫</span>
                <button @click="isAddingProject = !isAddingProject" class="text-txt-secondary hover:text-txt-primary transition-colors">
                    <span class="material-symbols-rounded text-lg">{{ isAddingProject ? 'remove' : 'add' }}</span>
                </button>
            </h3>
            
            <div v-if="isAddingProject" class="bg-bg-subtle p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                <input type="text" v-model="newProject.name" placeholder="計畫名稱" class="w-full bg-white px-3 py-2 rounded-lg text-xs outline-none">
                <div class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <input type="date" v-model="newProject.startDate" class="bg-white px-3 py-2 rounded-lg text-xs outline-none text-txt-secondary w-full">
                    <span class="text-txt-muted">~</span>
                    <input type="date" v-model="newProject.endDate" class="bg-white px-3 py-2 rounded-lg text-xs outline-none text-txt-secondary w-full">
                </div>
                 <button @click="createProject" :disabled="projectSaving" class="w-full bg-action-primary-bg text-white py-2 rounded-lg text-[10px] tracking-widest uppercase shadow-sm active:scale-95 transition-all">
                     {{ projectSaving ? '新增中...' : '新增計畫' }}
                 </button>
            </div>

            <div class="space-y-3">
                 <div v-for="p in projects" :key="p.id" 
                      @click="$emit('view-project', p)"
                      class="flex justify-between items-center p-3 bg-bg-subtle rounded-xl active:bg-bg-subtle transition-colors cursor-pointer border border-transparent hover:border-bdr-subtle">
                    <div class="flex flex-col">
                        <span class="text-xs font-medium text-txt-primary">{{ typeof p.name === 'object' ? p.name.name : p.name }}</span>
                        <span class="text-[9px] text-txt-secondary opacity-70">{{ p.startDate }} ~ {{ p.endDate }}</span>
                    </div>
                    <span :class="p.status === 'Active' ? 'bg-[var(--action-primary-bg)] text-white' : 'bg-bg-default text-txt-secondary'" class="text-[8px] px-2 py-1 rounded-full font-bold tracking-wider uppercase scale-90">{{ getStatusLabel(p.status) }}</span>
                 </div>
            </div>
        </div>

        <!-- 2. 好友清單管理 -->
         <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-subtle space-y-4">
             <h3 class="text-[10px] text-txt-secondary uppercase tracking-[0.2em] font-medium px-2 flex justify-between items-center">
                 <span>Friends List</span>
                 <button @click="isAddingFriend = !isAddingFriend" class="text-txt-secondary hover:text-txt-primary transition-colors">
                     <span class="material-symbols-rounded text-lg">{{ isAddingFriend ? 'remove' : 'add' }}</span>
                 </button>
             </h3>
             
             <div v-if="isAddingFriend" class="bg-bg-subtle p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                 <input type="text" v-model="newFriendName" placeholder="好友名稱" @keyup.enter="createFriend" class="w-full bg-white px-3 py-2 rounded-lg text-xs outline-none">
                  <button @click="createFriend" class="w-full bg-action-primary-bg text-white py-2 rounded-lg text-[10px] tracking-widest uppercase shadow-sm active:scale-95 transition-all">
                      新增好友
                  </button>
             </div>

             <div class="grid grid-cols-1 divide-y divide-bdr-default">
                <div v-for="f in friends" :key="f.name || f" @click="$emit('view-friend', f)" 
                     class="py-4 flex justify-between items-center active:bg-bg-subtle transition-colors px-2 cursor-pointer group">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-bg-subtle rounded-full flex items-center justify-center relative group-hover:bg-bdr-subtle transition-colors">
                            <span class="material-symbols-rounded text-txt-secondary text-sm">person</span>
                            <div v-if="f.visible === false" class="absolute -top-1 -right-1 w-3 h-3 bg-bg-subtle border border-white rounded-full flex items-center justify-center">
                                <span class="material-symbols-rounded text-[8px] text-txt-muted">visibility_off</span>
                            </div>
                        </div>
                        <span class="text-xs text-txt-primary font-medium">{{ f.name || f }}</span>
                    </div>
                    <span class="material-symbols-rounded text-txt-muted text-sm opacity-50 group-hover:opacity-100 transition-opacity">arrow_forward_ios</span>
                </div>
            </div>
        </div>

        <!-- 3. 介面自定義 -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-subtle space-y-6">
            <div class="flex flex-col space-y-1 px-2">
                <h3 class="text-[10px] text-txt-secondary uppercase tracking-[0.2em] font-medium">介面自定義</h3>
                <p class="text-[9px] text-txt-muted">管理支出類別、收入類別與支付方式</p>
            </div>
            
            <div class="space-y-4 px-2">
                <div class="space-y-6">
                    <div class="space-y-3">
                        <span class="text-[9px] text-txt-muted uppercase tracking-widest">支出類別 ({{ expenseCategories.length }})</span>
                        <div class="grid grid-cols-3 gap-2">
                            <div v-for="cat in expenseCategories" :key="cat.id" class="flex items-center space-x-1.5 bg-bg-subtle px-2 py-1.5 rounded-lg min-w-0">
                                <span class="material-symbols-rounded text-[10px] text-txt-secondary shrink-0">{{ cat.icon }}</span>
                                <span class="text-[9px] text-txt-secondary truncate">{{ cat.name }}</span>
                            </div>
                        </div>
                    </div>

                    <div v-if="incomeCategories.length > 0" class="space-y-3">
                        <span class="text-[9px] text-txt-muted uppercase tracking-widest">收入類別 ({{ incomeCategories.length }})</span>
                        <div class="grid grid-cols-3 gap-2">
                            <div v-for="cat in incomeCategories" :key="cat.id" class="flex items-center space-x-1.5 bg-bg-subtle px-2 py-1.5 rounded-lg min-w-0">
                                <span class="material-symbols-rounded text-[10px] text-txt-secondary shrink-0">{{ cat.icon }}</span>
                                <span class="text-[9px] text-txt-secondary truncate">{{ cat.name }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <span class="text-[9px] text-txt-muted uppercase tracking-widest">支付方式 ({{ sortedPaymentMethods.length }})</span>
                        <div class="grid grid-cols-3 gap-2">
                            <div v-for="pm in sortedPaymentMethods" :key="pm.id" class="flex items-center space-x-1.5 bg-bg-subtle px-2 py-1.5 rounded-lg min-w-0">
                                <span class="material-symbols-rounded text-[10px] text-txt-secondary shrink-0">{{ pm.icon || 'payments' }}</span>
                                <span class="text-[9px] text-txt-secondary truncate">{{ pm.name }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button @click="$emit('current-tab-change', 'custom-list')" class="w-full border border-bdr-outline text-txt-secondary py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform hover:bg-bg-subtle">
                    <span class="material-symbols-rounded text-base">edit_note</span>
                    <span class="text-xs font-medium tracking-wide">管理分類與支付方式</span>
                </button>
            </div>
        </div>

        <!-- 4. 帳號管理 (ADMIN/VIEWER 模式下置底) -->
        <div v-if="appMode !== 'GUEST'" class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-subtle space-y-6">
             <h3 class="text-[10px] text-txt-secondary uppercase tracking-[0.2em] font-medium px-2">Account</h3>
             
             <!-- ADMIN MODE (Logged In) -->
             <div v-if="appMode === 'ADMIN'" class="space-y-6">
                  <!-- User Profile Info (Moved to top of block) -->
                  <div class="flex items-center space-x-3 px-2">
                      <div class="w-10 h-10 rounded-full bg-bg-subtle overflow-hidden">
                          <img v-if="config.photoURL" :src="config.photoURL" class="w-full h-full object-cover">
                          <span v-else class="material-symbols-rounded text-txt-secondary p-2">person</span>
                      </div>
                      <div class="flex flex-col justify-center">
                          <span class="text-xs font-medium text-txt-primary">{{ currentUser?.email }}</span>
                          <span class="text-[9px] text-txt-secondary opacity-70">已登入 Google 帳號</span>
                      </div>
                  </div>

                  <!-- 系統環境設定 (併入區塊) -->
                  <div class="bg-bg-subtle p-4 rounded-xl space-y-4">
                      <div class="flex items-center justify-between px-1">
                          <div class="flex items-center space-x-2">
                             <span class="material-symbols-rounded text-base text-txt-secondary">settings_applications</span>
                             <span class="text-xs text-txt-primary font-medium">系統環境設定</span>
                          </div>
                          <button @click="saveSettings" :disabled="saving" class="active:scale-90 transition-all hover:opacity-100 disabled:opacity-30">
                              <span v-if="saving" class="block w-3 h-3 border-2 border-bdr-default border-t-txt-secondary rounded-full animate-spin"></span>
                              <span v-else class="material-symbols-rounded text-sm text-txt-secondary opacity-40">save</span>
                          </button>
                      </div>
                      
                      <div class="space-y-3">
                          <div class="flex items-center justify-between px-1">
                              <span class="text-[10px] text-txt-secondary font-medium uppercase tracking-wider">使用者名稱</span>
                              <input type="text" v-model="localConfig.user_name" @change="debouncedUpdate" 
                                  class="text-right text-[11px] bg-white px-3 py-1.5 rounded-lg border border-bdr-subtle outline-none w-36 placeholder-txt-muted shadow-sm focus:border-txt-secondary transition-colors text-txt-primary font-medium">
                          </div>
                          <div class="flex items-center justify-between px-1">
                              <span class="text-[10px] text-txt-secondary font-medium uppercase tracking-wider">當前匯率 (1 JPY = ? TWD)</span>
                              <input type="number" v-model="localConfig.fx_rate" step="0.001" @change="debouncedUpdate" 
                                  class="text-right text-[11px] bg-white px-3 py-1.5 rounded-lg border border-bdr-subtle outline-none w-36 shadow-sm focus:border-txt-secondary transition-colors text-txt-primary font-medium">
                          </div>
                      </div>
                  </div>

                  <!-- 記帳資料管理 (GOOGLE SERVICES) -->
                  <div class="bg-bg-subtle p-4 rounded-xl space-y-4">
                      <div class="flex items-center space-x-2 px-1">
                         <span class="material-symbols-rounded text-base text-txt-secondary">cloud_sync</span>
                         <span class="text-xs text-txt-primary font-medium">記帳資料管理</span>
                      </div>
                      
                      <p class="text-[10px] text-txt-secondary px-1 pb-2 opacity-80 leading-relaxed">
                          檔案將儲存至「日日記」備份資料夾
                      </p>
                      <div class="grid grid-cols-2 gap-3">
                           <button @click="handleBackup" :disabled="backingUp" class="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-bdr-subtle active:scale-95 transition-all disabled:opacity-50 hover:bg-bg-subtle shadow-sm">
                               <span v-if="backingUp" class="w-4 h-4 border-2 border-bdr-default border-t-txt-primary rounded-full animate-spin"></span>
                               <span v-else class="material-symbols-rounded text-xl text-txt-secondary">cloud_upload</span>
                              <span class="text-[10px] text-txt-secondary mt-2 font-medium tracking-wide">雲端存檔</span>
                          </button>
                           <button @click="handleExport" :disabled="exporting" class="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-bdr-subtle active:scale-95 transition-all disabled:opacity-50 hover:bg-bg-subtle shadow-sm">
                               <span v-if="exporting" class="w-4 h-4 border-2 border-bdr-default border-t-txt-primary rounded-full animate-spin"></span>
                               <span v-else class="material-symbols-rounded text-xl text-txt-secondary">download</span>
                              <span class="text-[10px] text-txt-secondary mt-2 font-medium tracking-wide">匯出檔案</span>
                          </button>
                      </div>
                      <div class="flex items-center justify-between px-1">
                          <div class="flex flex-col">
                              <span class="text-[10px] text-txt-primary font-medium tracking-wide">每日自動備份</span>
                          </div>
                          <label class="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" v-model="localConfig.auto_backup" @change="debouncedUpdate" class="sr-only peer">
                              <div class="w-9 h-5 bg-bg-subtle shadow-sm peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-bdr-default after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--action-primary-bg)]"></div>
                          </label>
                      </div>
                  </div>

                  <!-- 公開分享連結管理 -->
                  <div class="bg-bg-subtle p-4 rounded-xl relative">
                      <div class="flex items-center justify-between">
                          <div class="space-y-0.5">
                              <span class="text-xs text-txt-primary font-medium block">公開分享連結管理</span>
                              <p class="text-[9px] text-txt-secondary opacity-70">建立多個分享連結，並可設定不同的分享範圍與權限。</p>
                          </div>
                          <button @click="$emit('manage-shared-links')" class="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm border border-bdr-subtle active:scale-95 transition-all text-txt-secondary hover:text-txt-primary mt-1">
                              <span class="material-symbols-rounded text-sm">edit</span>
                          </button>
                      </div>
                  </div>

                  <div class="space-y-3">
                     <button @click="$emit('view-import')" class="w-full border border-bdr-outline text-txt-secondary py-3 rounded-xl text-xs font-medium active:bg-bg-subtle">
                         匯入資料
                     </button>
                     <button @click="$emit('logout')" class="w-full border border-bdr-outline text-txt-secondary py-3 rounded-xl text-xs font-medium active:bg-bg-subtle">
                         登出 Google 帳號
                     </button>
                  </div>

                  <div class="pt-4 border-t border-bdr-subtle space-y-1">
                      <button @click="confirmDeleteData" class="w-full py-2 text-[10px] text-txt-muted tracking-widest uppercase hover:text-txt-secondary transition-colors">
                          刪除記帳資料
                      </button>
                      <button @click="$emit('delete-account')" class="w-full py-2 text-[10px] text-txt-muted tracking-widest uppercase hover:text-txt-secondary transition-colors">
                          註銷帳戶
                      </button>
                  </div>
             </div>

             <!-- VIEWER MODE -->
             <div v-if="appMode === 'VIEWER'" class="space-y-3">
                  <div class="text-[10px] text-txt-secondary px-2">閱覽模式 (唯讀)</div>
             </div>
        </div>

        <!-- 使用指南入口 (底部連結) -->
        <div class="pt-4 pb-12 flex justify-start px-2">
            <button @click="navigateToGuide" class="text-[10px] text-txt-muted hover:text-txt-secondary tracking-[0.2em] uppercase font-medium transition-colors">
                使用指南
            </button>
        </div>
    </section>

    `,
    props: ['config', 'friends', 'projects', 'transactions', 'appMode', 'currentUser', 'categories', 'paymentMethods'],
    emits: ['update-config', 'update-user-data', 'view-project', 'view-friend', 'login', 'logout', 'clear-guest-data', 'create-project', 'open-icon-edit', 'clear-account-data', 'view-import', 'delete-account', 'manage-shared-links', 'current-tab-change'],
    data() {
        return {
            localConfig: { user_name: '', fx_rate: 0.22 },
            saving: false,
            sheetUrl: CONFIG.SPREADSHEET_URL,
            isAddingProject: false,
            projectSaving: false,
            newProject: { name: '', startDate: '', endDate: '' },
            isAddingFriend: false,
            newFriendName: '',
            selectedProject: null,
            isSharedLinkEnabled: false,
            sharedLink: '',
            copied: false,

            debouncedTimeout: null,
            exporting: false,
            backingUp: false
        };
    },
    computed: {
        expenseCategories() {
            return (this.categories || [])
                .filter(c => c.type === '支出')
                .sort((a, b) => (a.order || 99) - (b.order || 99));
        },
        incomeCategories() {
            return (this.categories || [])
                .filter(c => c.type === '收入')
                .sort((a, b) => (a.order || 99) - (b.order || 99));
        },
        sortedPaymentMethods() {
            return [...(this.paymentMethods || [])].sort((a, b) => (a.order || 99) - (b.order || 99));
        }
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
        }
    },
    methods: {
        async saveSettings() {
            this.saving = true;
            try {
                this.$emit('update-config', JSON.parse(JSON.stringify(this.localConfig)));
            } finally {
                this.saving = false;
            }
        },
        async debouncedUpdate() {
            if (this.debouncedTimeout) clearTimeout(this.debouncedTimeout);

            // Special check for Auto Backup authorization
            if (this.localConfig.auto_backup && !API.getGoogleToken()) {
                if (await this.dialog.confirm("開啟自動備份需要授權存取 Google Drive 與試算表，以便將資料備份至您的雲端硬碟。", {
                    title: '需要 Google 授權',
                    confirmText: '由此去授權',
                    secondaryText: '先不要'
                })) {
                    try {
                        this.saving = true;
                        await API.requestIncrementalScope();
                    } catch (e) {
                        console.error("Auth failed", e);
                        this.localConfig.auto_backup = false;
                        return;
                    } finally {
                        this.saving = false;
                    }
                } else {
                    this.localConfig.auto_backup = false;
                    return;
                }
            }

            this.debouncedTimeout = setTimeout(() => {
                this.saveSettings();
            }, 800);
        },
        async createProject() {
            if (!this.newProject.name) return this.dialog.alert("請輸入計畫名稱");
            this.projectSaving = true;
            try {
                await this.$emit('create-project', this.newProject);
                this.isAddingProject = false;
                this.newProject = { name: '', startDate: '', endDate: '' };
            } catch (e) {
                console.error(e);
            } finally {
                this.projectSaving = false;
            }
        },
        createFriend() {
            if (!this.newFriendName) return this.dialog.alert("請輸入好友名稱");
            const newFriend = {
                id: 'f_' + Date.now(),
                name: this.newFriendName,
                visible: true
            };
            const updatedFriends = [...(this.friends || []), newFriend];
            this.$emit('update-user-data', { friends: updatedFriends });
            this.newFriendName = '';
            this.isAddingFriend = false;
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
        clearEditState() {
            sessionStorage.removeItem('settings_edit_state');
        },

        formatNumber(num) { return new Intl.NumberFormat().format(Math.round(num || 0)); },
        getStatusLabel(status) {
            const map = { 'Active': '進行中', 'Archived': '已封存', 'Planned': '計劃中' };
            return map[status] || status;
        },
        async confirmDeleteData() {
            if (await this.dialog.confirm("確定要刪除所有記帳資料嗎？\n此動作將清空雲端與本地的所有紀錄，且無法復原。", { confirmText: '確定刪除', cancelText: '取消' })) {
                this.$emit('clear-account-data');
            }
        },
        async handleExport() {
            if (this.exporting) return;
            this.exporting = true;
            try {
                const data = {
                    transactions: this.transactions,
                    categories: this.categories,
                    paymentMethods: this.paymentMethods,
                    projects: this.projects,
                    friends: this.friends,
                    config: this.config
                };

                // Generate timestamp
                const ts = GoogleSheetsService._getTimestamp();

                // Generate file contents
                const jsonContent = JSON.stringify(data, null, 2);
                const csvContent = GoogleSheetsService.generateCsvContent(data);

                // Create ZIP using JSZip
                if (typeof JSZip === 'undefined') {
                    throw new Error('縮檔工具載入失敗，請重新整理頁面');
                }
                const zip = new JSZip();
                zip.file(`系統還原用備份檔_${ts}.json`, jsonContent);
                zip.file(`瀏覽用記帳匯出_${ts}.csv`, '\uFEFF' + csvContent); // BOM for Excel CJK support

                const blob = await zip.generateAsync({ type: 'blob' });

                // Trigger download
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `日日記備份_${ts}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);

                this.dialog.alert(`匯出完成！\n檔案：日日記備份_${ts}.zip`, { title: '匯出檔案' });
            } catch (e) {
                console.error(e);
                this.dialog.alert('匯出失敗: ' + e.message);
            } finally {
                this.exporting = false;
            }
        },
        async handleBackup() {
            if (this.backingUp) return;
            this.backingUp = true;
            try {
                let token = API.getGoogleToken();
                if (!token) token = await API.requestIncrementalScope();
                if (!token) throw new Error('尚未獲得授權');

                const data = {
                    transactions: this.transactions,
                    categories: this.categories,
                    paymentMethods: this.paymentMethods,
                    projects: this.projects,
                    friends: this.friends,
                    config: this.config
                };

                // Cloud Save: JSON + Spreadsheet simultaneously
                const result = await GoogleSheetsService.cloudSave(data, token, API.requestIncrementalScope);

                this.dialog.alert(`雲端存檔完成！\n備份檔：${result.backupFile}\n記帳表已同步至「${result.folder}」資料夾。`, { title: '雲端存檔' });
            } catch (e) {
                console.error(e);
                this.dialog.alert('雲端存檔失敗: ' + e.message);
            } finally {
                this.backingUp = false;
            }
        },
        navigateToGuide() {
            window.location.href = 'guide.html';
        }
    },
    inject: ['dialog'],
    created() {
        this.localConfig = { ...this.config };
    }
};
