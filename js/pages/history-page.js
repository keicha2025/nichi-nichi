import { SearchBar } from '../components/search-bar.js';

export const HistoryPage = {
    components: { SearchBar },
    template: `
    <section class="relative space-y-4 py-4 fade-in pb-32 min-h-[60dvh] overflow-x-hidden">
        <!-- 搜尋與篩選列 Component -->
        <search-bar v-model="localFilter" v-show="!isSelectionMode"></search-bar>

        <!-- 多選模式標題 (取代搜尋列) -->
        <div v-show="isSelectionMode" class="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-bdr-outline animate-in slide-in-from-top-4 duration-300">
            <div class="flex items-center space-x-3">
                <button @click="cancelSelection" class="text-[11px] font-medium text-txt-secondary hover:text-txt-primary bg-bg-subtle px-3 py-1 rounded-full transition-all active:scale-95">
                    取消
                </button>
                <div class="w-px h-3 bg-bdr-outline"></div>
                <span class="text-xs font-medium text-txt-primary">已選取 {{ selectedIds.length }} 筆資料</span>
            </div>
            <button @click="toggleSelectAll" class="text-[10px] text-txt-secondary tracking-widest hover:text-txt-primary transition-colors uppercase px-2">
                {{ selectedIds.length === transactions.length ? '取消全選' : '全選' }}
            </button>
        </div>

        <!-- 分組顯示列表 -->
        <div v-if="filteredGroupedTransactions.length === 0" class="text-center py-20">
            <span class="text-xs text-txt-secondary">沒有符合的紀錄</span>
        </div>

        <div v-else v-for="(group, dateKey) in filteredGroupedTransactions" :key="dateKey" class="space-y-3">
             <div class="py-2 mb-2">
                 <span class="text-[10px] font-medium text-txt-secondary bg-bg-subtle px-2 py-1 rounded-full ml-4 shadow-sm">{{ formatMonth(group.month) }}</span>
             </div>
             
             <div v-for="item in group.items" :key="item.id" 
                  @click="handleItemClick(item)"
                  @touchstart="handleTouchStart(item, $event)"
                  @touchend="handleTouchEnd"
                  @touchmove="handleTouchMove"
                  @mousedown="handleMouseDown(item)"
                  @mouseup="handleTouchEnd"
                  @mouseleave="handleTouchEnd"
                  class="bg-white p-5 rounded-[1.8rem] muji-shadow flex justify-between items-center active:scale-[0.98] transition-all relative overflow-hidden"
                  :class="{ 'ring-2 ring-gray-100 bg-gray-50/30': isSelected(item.id) }">
                
                <!-- 選取勾選圓圈 -->
                <div v-if="isSelectionMode" class="mr-3 animate-in fade-in duration-200 shrink-0">
                    <div class="w-5 h-5 rounded-full border border-bdr-outline flex items-center justify-center transition-colors"
                         :class="isSelected(item.id) ? 'bg-gray-700 border-gray-700' : 'bg-white'">
                        <span v-if="isSelected(item.id)" class="material-symbols-rounded text-white text-[10px]">check</span>
                    </div>
                </div>

                <div class="flex items-center space-x-4 flex-1 min-w-0 mr-2">
                    <div class="w-11 h-11 bg-bg-subtle rounded-full flex items-center justify-center shrink-0">
                        <span class="material-symbols-rounded text-txt-secondary text-xl">{{ getIcon(item.categoryId) }}</span>
                    </div>
                    <div class="flex flex-col min-w-0">
                        <span class="text-sm font-medium text-txt-primary truncate block">{{ item.name }}</span>
                        <div class="flex flex-wrap items-center gap-x-2 mt-0.5 text-[9px]">
                            <span class="text-txt-secondary whitespace-nowrap flex items-center gap-1">
                                {{ item.spendDate.split('T')[0] }} · 
                                <span class="material-symbols-rounded text-[10px]">{{ getPaymentIcon(item.paymentMethod) }}</span>
                                {{ getPaymentName(item.paymentMethod) }}
                            </span>
                            <span v-if="item.payer !== '我' && item.type === '支出'" class="bg-bg-subtle text-txt-secondary px-1.5 rounded whitespace-nowrap">{{ getFriendName(item.payer) }} 付款</span>
                            <span v-if="item.type === '收款'" class="bg-bg-subtle text-txt-secondary px-1.5 rounded whitespace-nowrap">{{ getFriendName(item.friendName) }} 還款</span>
                            <span v-if="item.projectId" class="text-txt-secondary truncate max-w-[80px]">{{ getProjectName(item.projectId) }}</span>
                        </div>
                    </div>
                </div>
                <div class="text-right shrink-0">
                    <p class="text-sm font-medium" :class="getSignClass(item.type)">
                        {{ getSign(item.type) }} {{ getSymbol(item.currency) }} {{ formatNumber(getConvertedDisplayAmount(item)) }}
                    </p>
                    <div v-if="item.debtAmount !== 0" class="text-[8px] mt-0.5 font-medium" :class="item.debtAmount > 0 ? 'text-txt-secondary' : 'text-danger'">
                        {{ item.debtAmount > 0 ? '債權 +' : '債務 ' }} {{ getSymbol(item.currency) }} {{ formatNumber(getConvertedDebtAmount(item)) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 方案 A: 底部浮動膠囊按鈕 (進一步上移避免重疊) -->
        <div v-if="isSelectionMode" class="fixed bottom-36 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[200px] px-2 pointer-events-none">
            <button v-show="selectedIds.length > 0"
                    @click="deleteSelectedItems" 
                    class="pointer-events-auto w-full bg-white/95 backdrop-blur-md border border-danger/20 text-danger py-3 rounded-full muji-shadow flex items-center justify-center space-x-2 active:scale-95 transition-all animate-in slide-in-from-bottom-4 duration-300">
                <span class="material-symbols-rounded text-lg">delete</span>
                <span class="text-[11px] font-bold tracking-tight">刪除 {{ selectedIds.length }} 筆資料</span>
            </button>
        </div>
    </section>
    `,
    props: ['transactions', 'categories', 'paymentMethods', 'projects', 'fxRate', 'friends'],
    emits: ['edit-item', 'update-filter', 'delete-multiple'],
    inject: ['dialog'],
    data() {
        return {
            localFilter: { keyword: '', mode: 'all' },
            isSelectionMode: false,
            selectedIds: [],
            pressTimer: null,
            startX: 0,
            startY: 0,
            isEnteringMode: false // 保護 Flag: 防止長按放手時的點擊事件
        };
    },
    computed: {
        filteredGroupedTransactions() {
            const groups = {};
            this.transactions.forEach(t => {
                const date = t.spendDate || '';
                const monthKey = date.slice(0, 7);
                if (!groups[monthKey]) groups[monthKey] = [];
                groups[monthKey].push(t);
            });
            return Object.keys(groups).sort((a, b) => b.localeCompare(a)).map(key => ({
                month: key,
                items: groups[key].sort((a, b) => b.spendDate.localeCompare(a.spendDate))
            }));
        }
    },
    watch: {
        localFilter: {
            handler(newVal) {
                this.$emit('update-filter', newVal);
            },
            deep: true
        }
    },
    methods: {
        handleTouchStart(item, e) {
            if (this.isSelectionMode) return;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.pressTimer = setTimeout(() => {
                this.enterSelectionMode(item);
            }, 600);
        },
        handleTouchEnd() {
            clearTimeout(this.pressTimer);
        },
        handleTouchMove(e) {
            const deltaX = Math.abs(e.touches[0].clientX - this.startX);
            const deltaY = Math.abs(e.touches[0].clientY - this.startY);
            if (deltaX > 10 || deltaY > 10) {
                clearTimeout(this.pressTimer);
            }
        },
        handleMouseDown(item) {
            if (this.isSelectionMode) return;
            this.pressTimer = setTimeout(() => {
                this.enterSelectionMode(item);
            }, 600);
        },
        handleItemClick(item) {
            if (this.isEnteringMode) {
                this.isEnteringMode = false;
                return;
            }
            if (this.isSelectionMode) {
                this.toggleSelection(item.id);
            } else {
                this.$emit('edit-item', item);
            }
        },
        enterSelectionMode(item) {
            this.isSelectionMode = true;
            this.isEnteringMode = true; // 設置 Flag
            this.selectedIds = [item.id];
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(50);
            }
        },
        toggleSelection(id) {
            const idx = this.selectedIds.indexOf(id);
            if (idx === -1) {
                this.selectedIds.push(id);
            } else {
                this.selectedIds.splice(idx, 1);
            }
        },
        isSelected(id) {
            return this.selectedIds.includes(id);
        },
        cancelSelection() {
            this.isSelectionMode = false;
            this.selectedIds = [];
            this.isEnteringMode = false;
        },
        toggleSelectAll() {
            if (this.selectedIds.length === this.transactions.length) {
                this.selectedIds = [];
            } else {
                this.selectedIds = this.transactions.map(t => t.id);
            }
        },
        async deleteSelectedItems() {
            if (this.selectedIds.length === 0) return;
            const count = this.selectedIds.length;
            const confirmed = await this.dialog.confirm(`確定要刪除這 ${count} 筆紀錄嗎？\n此動作無法復原。`, {
                confirmText: '批次刪除',
                isDanger: true
            });

            if (confirmed) {
                this.$emit('delete-multiple', [...this.selectedIds]);
                this.cancelSelection();
            }
        },
        getPaymentName(id) { const pm = this.paymentMethods.find(p => p.id === id); return pm ? pm.name : id; },
        getPaymentIcon(id) { const pm = this.paymentMethods.find(p => p.id === id); return pm ? (pm.icon || 'payments') : 'payments'; },
        getProjectName(id) {
            if (!this.projects) return '';
            const p = this.projects.find(proj => proj.id === id);
            return p ? p.name : '';
        },
        getFriendName(idOrName) {
            if (idOrName === '我') return '我';
            if (!idOrName) return '';

            // 1. Try resolving via UID/FID in friends list
            const list = (this.friends || []);
            const f = list.find(x => x.id === idOrName || x.uid === idOrName || x.name === idOrName);
            if (f) return f.name;

            // 2. Try resolving via project's collaborators if applicable
            if (this.projects) {
                for (const p of this.projects) {
                    if (p.collaborators) {
                        const coll = p.collaborators.find(c => c.uid === idOrName || c.name === idOrName);
                        if (coll) return coll.name;
                    }
                }
            }

            // [Security] If it starts with tx_ or looks like a long ID, return fallback
            if (idOrName.length > 20 || idOrName.includes('_')) return '朋友';

            return idOrName;
        },
        getIcon(id) {
            const cat = this.categories.find(c => c.id === id);
            return cat ? cat.icon : 'payments';
        },
        formatNumber(num) { return new Intl.NumberFormat().format(Math.round(num || 0)); },
        getSign(type) { return type === '支出' ? '-' : '+'; },
        getSignClass(type) { return type === '支出' ? 'text-txt-primary' : 'text-txt-secondary'; },
        getSymbol(currency) { return currency === 'JPY' ? '¥' : '$'; },
        formatMonth(ym) {
            if (!ym) return '未知日期';
            const parts = ym.split('-');
            return parts[0] + '年' + parts[1] + '月';
        },
        getConvertedDisplayAmount(item) {
            if (item.type === '收款') {
                return (item.amount !== undefined && item.amount !== null) ? Number(item.amount) : 0;
            } else {
                return Number(item.personalShare || 0);
            }
        },
        getConvertedDebtAmount(item) {
            return Math.abs(item.debtAmount || 0);
        }
    }
};
