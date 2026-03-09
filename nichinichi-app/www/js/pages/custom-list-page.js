
export const CustomListPage = {
    template: `
    <section class="animate-in fade-in pb-32">
        <div class="bg-white p-6 rounded-[2.5rem] muji-shadow border border-bdr-subtle flex flex-col relative mt-2">
            
            <!-- Header -->
            <div class="flex justify-between items-center px-1 border-b border-bdr-subtle pb-5 mb-6">
                <div class="flex flex-col">
                    <span class="text-[10px] text-txt-secondary uppercase tracking-[0.3em] font-medium">介面自定義</span>
                    <span class="text-[8px] text-txt-muted mt-1">管理分類與支付方式</span>
                </div>
                <button @click="$emit('back')" class="text-[10px] text-txt-muted uppercase tracking-widest hover:text-txt-secondary transition-colors">返回</button>
            </div>

            <!-- Tabs/Sections Navigation -->
            <div class="flex space-x-4 mb-8 px-1 overflow-x-auto no-scrollbar">
                <button v-for="tab in tabs" :key="tab.id" 
                    @click="activeTab = tab.id"
                    :class="activeTab === tab.id ? 'text-txt-secondary border-b-2 border-[var(--action-primary-bg)] pb-1' : 'text-txt-secondary opacity-50'"
                    class="text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap">
                    {{ tab.name }}
                </button>
            </div>

            <!-- List Content Area -->
            <div class="space-y-4">
                <div v-for="(item, idx) in activeList" :key="item.id" 
                    class="flex items-center space-x-3 bg-bg-subtle p-3 rounded-2xl border border-bdr-subtle/30 animate-in slide-in-from-bottom-2">
                    
                    <!-- Sorting Controls -->
                    <div class="flex flex-col space-y-1">
                        <button @click="moveItem(idx, -1)" :disabled="idx === 0" class="text-[10px] text-txt-secondary disabled:opacity-20 hover:opacity-100 opacity-60">▲</button>
                        <button @click="moveItem(idx, 1)" :disabled="idx === activeList.length - 1" class="text-[10px] text-txt-secondary disabled:opacity-20 hover:opacity-100 opacity-60">▼</button>
                    </div>

                    <!-- Icon Picker Trigger -->
                    <button @click="openIconPicker(item)" class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[var(--action-primary-bg)] shadow-sm border border-bdr-subtle/50 shrink-0 active:scale-95 transition-transform">
                        <span class="material-symbols-rounded text-xl">{{ item.icon || 'star' }}</span>
                    </button>

                    <!-- Name Input -->
                    <div class="flex-1 min-w-0">
                        <input type="text" v-model="item.name" class="w-full bg-transparent text-xs font-bold text-txt-secondary outline-none py-1 border-b border-transparent focus:border-bdr-default transition-colors" placeholder="輸入名稱">
                    </div>

                    <!-- Delete Button -->
                    <button @click="removeItem(idx)" class="w-8 h-8 flex items-center justify-center text-txt-secondary hover:text-danger hover:bg-danger/5 rounded-full transition-colors opacity-60 hover:opacity-100">
                        <span class="material-symbols-rounded text-lg">delete</span>
                    </button>
                </div>

                <!-- Empty State -->
                <div v-if="activeList.length === 0" class="py-10 text-center">
                    <span class="text-[10px] text-txt-secondary opacity-60 uppercase tracking-widest">目前沒有項目</span>
                </div>

                <button @click="addItem" class="w-full py-4 border-2 border-dashed border-bdr-subtle rounded-2xl text-txt-secondary hover:border-txt-secondary/30 transition-all flex items-center justify-center space-x-2 opacity-80 hover:opacity-100">
                    <span class="material-symbols-rounded text-lg">add</span>
                    <span class="text-[10px] font-bold tracking-[0.2em] uppercase">新增項目</span>
                </button>
            </div>

            <!-- Global Save Action -->
            <div class="mt-4 pt-6 border-t border-bdr-subtle">
                <button @click="handleSave" :disabled="saving" 
                    class="w-full bg-[var(--action-primary-bg)] text-white py-5 rounded-2xl text-[10px] font-medium tracking-[0.4em] uppercase shadow-lg active:scale-95 transition-all disabled:opacity-50">
                    {{ saving ? '儲存中...' : '儲存所有變更' }}
                </button>
            </div>
        </div>
    </section>
    `,
    props: ['categories', 'paymentMethods', 'appMode'],
    emits: ['update-user-data', 'back', 'open-icon-edit'],
    data() {
        return {
            activeTab: 'expense',
            tabs: [
                { id: 'expense', name: '支出類別' },
                { id: 'income', name: '收入類別' },
                { id: 'payment', name: '支付方式' }
            ],
            localCategories: [],
            localPaymentMethods: [],
            saving: false
        };
    },
    computed: {
        activeList() {
            if (this.activeTab === 'expense') return this.expenseCategories;
            if (this.activeTab === 'income') return this.incomeCategories;
            return this.localPaymentMethods;
        },
        expenseCategories() {
            return this.localCategories.filter(c => c.type === '支出');
        },
        incomeCategories() {
            return this.localCategories.filter(c => c.type === '收入');
        }
    },
    created() {
        this.initializeLocalData();
    },
    methods: {
        initializeLocalData() {
            // Deep copy from props
            this.localCategories = JSON.parse(JSON.stringify(this.categories || []))
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            this.localPaymentMethods = JSON.parse(JSON.stringify(this.paymentMethods || []))
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            // Restore edit session if we are coming back from IconEditPage
            this.restoreEditState();
        },
        addItem() {
            const id = (this.activeTab === 'payment' ? 'pm_' : 'cat_') + Date.now();
            const newItem = {
                id: id,
                name: '新項目',
                icon: this.activeTab === 'payment' ? 'payments' : 'star',
                order: 999
            };

            if (this.activeTab === 'payment') {
                this.localPaymentMethods.push(newItem);
            } else {
                newItem.type = this.activeTab === 'expense' ? '支出' : '收入';
                this.localCategories.push(newItem);
            }
        },
        removeItem(index) {
            if (this.activeTab === 'payment') {
                this.localPaymentMethods.splice(index, 1);
            } else {
                // Find global index in categories
                const item = this.activeList[index];
                const globalIdx = this.localCategories.findIndex(c => c.id === item.id);
                if (globalIdx !== -1) this.localCategories.splice(globalIdx, 1);
            }
        },
        moveItem(index, direction) {
            const list = this.activeTab === 'payment' ? this.localPaymentMethods : this.localCategories;

            if (this.activeTab === 'payment') {
                const targetIdx = index + direction;
                const item = list[index];
                list.splice(index, 1);
                list.splice(targetIdx, 0, item);
            } else {
                // For categories, we need to move within the filtered list but update the global array
                const subList = this.activeList;
                const targetIdx = index + direction;
                if (targetIdx < 0 || targetIdx >= subList.length) return;

                const itemA = subList[index];
                const itemB = subList[targetIdx];

                // Swap in global list
                const idxA = this.localCategories.findIndex(c => c.id === itemA.id);
                const idxB = this.localCategories.findIndex(c => c.id === itemB.id);

                // Just swap the objects in the array to keep it simple for now as they will be re-ordered on save
                const temp = this.localCategories[idxA];
                this.localCategories[idxA] = this.localCategories[idxB];
                this.localCategories[idxB] = temp;

                // Force reactivity for the computed activeList
                this.localCategories = [...this.localCategories];
            }
        },
        openIconPicker(item) {
            this.saveEditState();
            this.$emit('open-icon-edit', {
                type: this.activeTab === 'payment' ? 'payment' : 'category',
                id: item.id,
                name: item.name,
                icon: item.icon || 'star'
            });
        },
        saveEditState() {
            sessionStorage.setItem('custom_list_edit_state', JSON.stringify({
                activeTab: this.activeTab,
                localCategories: this.localCategories,
                localPaymentMethods: this.localPaymentMethods
            }));
        },
        restoreEditState() {
            const saved = sessionStorage.getItem('custom_list_edit_state');
            if (saved) {
                const state = JSON.parse(saved);
                this.activeTab = state.activeTab;
                this.localCategories = state.localCategories;
                this.localPaymentMethods = state.localPaymentMethods;
                sessionStorage.removeItem('custom_list_edit_state');
            }
        },
        async handleSave() {
            this.saving = true;
            try {
                // Re-assign orders
                this.localCategories.forEach((c, idx) => c.order = idx + 1);
                this.localPaymentMethods.forEach((p, idx) => p.order = idx + 1);

                await this.$emit('update-user-data', {
                    categories: this.localCategories,
                    paymentMethods: this.localPaymentMethods
                });

                // Clear state
                sessionStorage.removeItem('custom_list_edit_state');
                this.$emit('back');
            } catch (e) {
                console.error(e);
            } finally {
                this.saving = false;
            }
        }
    }
};
