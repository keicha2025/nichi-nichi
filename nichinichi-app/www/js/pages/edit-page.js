import { CONFIG } from '../config.js';

export const EditPage = {
    template: `
    <section class="space-y-6 py-4 animate-in fade-in pb-24">
        <div class="bg-white p-6 rounded-[2.5rem] muji-shadow border border-bdr-subtle space-y-6">
            <!-- Header Controls Integrated in Card -->
            <div class="flex justify-between items-center px-1 border-b border-bdr-subtle pb-4">
                <span class="text-[10px] text-txt-secondary uppercase tracking-[0.3em] font-medium">
                    {{ isReadOnly ? '查看紀錄' : '編輯' + form.type }}
                </span>
                <button @click="$emit('cancel')" class="text-[10px] text-txt-muted uppercase tracking-widest hover:text-txt-secondary transition-colors">
                    {{ isReadOnly ? '關閉' : '取消' }}
                </button>
            </div>

            <!-- 1. 金額 -->
            <div class="text-center py-2">
                <p class="text-[10px] text-txt-muted mb-2">{{ form.type }}金額</p>
                <div v-if="isReadOnly" class="text-5xl font-light text-txt-primary">
                    <span class="text-xl mr-1">{{ form.currency === 'TWD' ? '$' : '¥' }}</span>{{ formatNumber(form.amount) }}
                </div>
                <div v-else class="flex items-center justify-center space-x-3">
                    <span @click.stop="$emit('toggle-currency')" class="text-xs font-medium text-txt-secondary border border-bdr-subtle px-3 py-1 rounded-full cursor-pointer">{{ form.currency }}</span>
                    <input type="number" v-model="form.amount" class="text-5xl font-light w-48 text-center bg-transparent outline-none" placeholder="0" inputmode="decimal">
                    <button @click.stop="toggleCalculator" class="p-2 -mr-10 text-txt-secondary hover:text-txt-primary transition-colors">
                        <span class="material-symbols-rounded text-2xl">{{ showCalculator ? 'keyboard' : 'calculate' }}</span>
                    </button>
                </div>
                
                <!-- Calculator Panel -->
                <transition name="calc">
                    <div v-if="!isReadOnly && showCalculator" class="mt-6 bg-bg-subtle p-4 rounded-3xl">
                        <div class="bg-white/50 mb-4 p-3 rounded-xl text-right overflow-hidden border border-bdr-subtle min-h-[40px] flex items-center justify-end">
                            <span class="text-sm font-light tracking-wider text-txt-secondary truncate break-all">{{ calcExpression || '0' }}</span>
                        </div>
                        <div class="grid grid-cols-4 gap-2">
                            <button v-for="btn in ['(', ')', 'C', '÷']" :key="btn" @click.stop="onCalcPress(btn)" 
                                    class="h-12 rounded-xl bg-white/80 text-txt-secondary text-sm font-medium hover:bg-white active:scale-95 transition-all">{{ btn }}</button>
                            <button v-for="btn in ['7', '8', '9', '×']" :key="btn" @click.stop="onCalcPress(btn)" 
                                    class="h-12 rounded-xl bg-white text-txt-primary text-sm font-medium hover:bg-white active:scale-95 transition-all">{{ btn }}</button>
                            <button v-for="btn in ['4', '5', '6', '-']" :key="btn" @click.stop="onCalcPress(btn)" 
                                    class="h-12 rounded-xl bg-white text-txt-primary text-sm font-medium hover:bg-white active:scale-95 transition-all">{{ btn }}</button>
                            <button v-for="btn in ['1', '2', '3', '+']" :key="btn" @click.stop="onCalcPress(btn)" 
                                    class="h-12 rounded-xl bg-white text-txt-primary text-sm font-medium hover:bg-white active:scale-95 transition-all">{{ btn }}</button>
                            <button v-for="btn in ['0', '.', '⌫', '=']" :key="btn" @click.stop="onCalcPress(btn)" 
                                    :class="btn === '=' ? 'bg-[var(--action-primary-bg)] text-white' : 'bg-white text-txt-primary'"
                                    class="h-12 rounded-xl text-sm font-medium hover:opacity-90 active:scale-95 transition-all">{{ btn }}</button>
                        </div>
                    </div>
                </transition>
            </div>

            <div class="space-y-5">
                <!-- 2. 付款/收款對象 -->
                <div class="space-y-2 px-2">
                    <label class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium">
                        {{ form.type === '收款' ? '收款對象' : '付款人' }}
                    </label>
                    <div v-if="isReadOnly" class="text-sm text-txt-primary">
                        {{ form.type === '收款' ? getFriendName(form.friendName) : getFriendName(form.payer) }}
                    </div>
                    <!-- 編輯模式：同步新增頁面的加好友功能 -->
                    <div v-else>
                         <div class="flex flex-wrap gap-2">
                            <template v-if="form.type === '收款'">
                                <button v-for="f in displayFriends" :key="'e-r-'+f.id" @click="form.friendName = f.id" :class="isFriendMatch(form.friendName, f) ? 'bg-[var(--action-primary-bg)] text-white' : 'bg-bg-subtle text-txt-secondary'" class="px-4 py-1.5 rounded-full text-[10px] transition-all">{{ f.name }}</button>
                                <button @click="triggerAddFriend('friendName')" class="px-3 py-1.5 rounded-full bg-bg-subtle text-txt-secondary text-[10px]">+</button>
                            </template>
                            <template v-else>
                                <button @click="form.payer = '我'" :class="isMeMatch(form.payer) ? 'bg-[var(--action-primary-bg)] text-white' : 'bg-bg-subtle text-txt-secondary'" class="px-4 py-1.5 rounded-full text-[10px]">我</button>
                                <button v-for="f in displayFriends" :key="'e-p-'+f.id" @click="form.payer = f.id" :class="isFriendMatch(form.payer, f) ? 'bg-[var(--action-primary-bg)] text-white' : 'bg-bg-subtle text-txt-secondary'" class="px-4 py-1.5 rounded-full text-[10px]">{{ f.name }}</button>
                                <button @click="triggerAddFriend('payer')" class="px-3 py-1.5 rounded-full bg-bg-subtle text-txt-secondary text-[10px]">+</button>
                            </template>
                        </div>
                        <!-- 新增好友輸入框 -->
                        <div v-if="isAddingFriend && (addFriendTarget === 'payer' || addFriendTarget === 'friendName')" class="mt-2 bg-bg-subtle p-3 rounded-2xl flex items-center space-x-2">
                            <input type="text" v-model="newFriendName" :placeholder="addFriendTarget==='payer'?'新付款人':'新收款人'" class="flex-grow bg-white p-2 rounded-xl text-xs outline-none">
                            <button @click="confirmAddFriend" class="bg-[var(--action-primary-bg)] text-white px-4 py-2 rounded-xl text-[10px]">OK</button>
                        </div>
                    </div>
                </div>

                <!-- 3. 日期 -->
                <div class="flex items-center justify-between px-2 h-12 bg-bg-subtle rounded-2xl border border-transparent transition-all cursor-pointer"
                     :class="!isReadOnly ? 'active:scale-[0.98]' : ''"
                     @click="!isReadOnly && triggerPicker($refs.dateInput)">
                    <span class="text-[10px] text-txt-secondary uppercase tracking-widest font-bold">Date</span>
                    <div v-if="isReadOnly" class="text-sm text-txt-primary">{{ formatDateWithTimezone(form.spendDate, form.utc) }}</div>
                    <input v-else 
                        ref="dateInput"
                        type="datetime-local" 
                        v-model="form.spendDate" 
                        class="text-sm bg-transparent outline-none text-right cursor-pointer h-full"
                    >
                </div>

                <!-- 4. [補回] 分類 -->
                <div v-if="form.type !== '收款'" class="space-y-2 px-2">
                    <label class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium">分類</label>
                    <div v-if="isReadOnly" class="flex items-center space-x-2 text-sm text-txt-primary">
                        <span class="material-symbols-rounded text-base text-txt-secondary">{{ getCategoryIcon(form.categoryId) }}</span>
                        <span>{{ getCategoryName(form.categoryId) }}</span>
                    </div>
                    <div v-else class="grid grid-cols-4 gap-4 py-2" v-cloak>
                        <div v-for="cat in filteredCategories" :key="cat.id" @click.stop="form.categoryId = cat.id" :class="form.categoryId === cat.id ? 'bg-[var(--action-primary-bg)] text-white shadow-lg' : 'bg-bg-subtle text-txt-muted'" class="flex flex-col items-center p-3 rounded-2xl transition-all">
                            <span class="material-symbols-rounded text-xl">{{ cat.icon }}</span>
                            <span class="text-[9px] mt-1">{{ cat.name }}</span>
                        </div>
                    </div>
                </div>

                <div class="px-2 space-y-4">
                    <div class="space-y-1">
                        <label class="text-[10px] text-txt-secondary uppercase font-medium">項目名稱</label>
                        <div v-if="isReadOnly" class="text-sm text-txt-primary">{{ form.name }}</div>
                        <template v-else>
                            <!-- Name Suggestions -->
                            <transition name="suggestion-container">
                                <transition-group v-if="nameSuggestions.length > 0" name="suggestion" tag="div" class="flex flex-wrap gap-2 mt-1">
                                    <div v-for="s in nameSuggestions" :key="s" @click="form.name = s" 
                                         class="suggestion-bubble">{{ s }}</div>
                                </transition-group>
                            </transition>
                            <input type="text" v-model="form.name" class="w-full text-sm py-2 border-b border-bdr-subtle outline-none">
                        </template>
                    </div>
                    
                    <!-- 5. [補回] 支付方式 -->
                    <div class="space-y-1">
                        <label class="text-[10px] text-txt-secondary uppercase font-medium">支付方式</label>
                        <div v-if="isReadOnly" class="text-sm text-txt-primary">{{ getPaymentName(form.paymentMethod) }}</div>
                        <div v-else class="flex space-x-2 overflow-x-auto no-scrollbar py-2">
                            <button v-for="pm in paymentMethods" :key="pm.id" @click.stop="form.paymentMethod = pm.id"
                                    :class="pm.id === form.paymentMethod ? 'bg-[var(--action-primary-bg)] text-white shadow-md' : 'bg-bg-subtle text-txt-secondary'"
                                    class="whitespace-nowrap px-4 py-2 rounded-2xl flex items-center space-x-2 transition-all border border-transparent">
                                 <span class="material-symbols-rounded text-base">{{ pm.icon || 'payments' }}</span>
                                 <span class="text-[10px] whitespace-nowrap">{{ pm.name }}</span>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <label class="text-[10px] text-txt-secondary uppercase font-medium">備註</label>
                        <div v-if="isReadOnly" class="text-xs text-txt-secondary whitespace-pre-wrap">{{ form.note || '無備註' }}</div>
                        <template v-else>
                            <textarea v-model="form.note" class="w-full text-sm p-4 bg-bg-subtle rounded-2xl outline-none h-20 resize-none"></textarea>
                            <!-- Note Suggestions -->
                            <transition name="suggestion-container">
                                <transition-group v-if="noteSuggestions.length > 0" name="suggestion" tag="div" class="flex flex-wrap gap-2 mt-1">
                                    <div v-for="s in noteSuggestions" :key="s" @click="form.note = s" 
                                         class="suggestion-bubble">{{ s }}</div>
                                </transition-group>
                            </transition>
                        </template>
                    </div>
                </div>

                <!-- 6. 分帳 (同步新增頁面進階功能) -->
                <div v-if="form.type === '支出'" class="pt-4 border-t border-bdr-subtle space-y-4">
                    <div class="flex items-center justify-between px-2">
                        <span class="text-xs text-txt-secondary">幫朋友代墊 / 需分帳</span>
                        <div v-if="!isReadOnly" class="w-10 h-5 rounded-full shadow-sm relative transition-colors cursor-pointer" :class="form.isSplit ? 'bg-[var(--action-primary-bg)]' : 'bg-bg-subtle'" @click="form.isSplit = !form.isSplit">
                            <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform" :class="{'translate-x-5': form.isSplit}"></div>
                        </div>
                        <div v-else class="text-xs text-txt-secondary">{{ form.isSplit ? '有' : '無' }}</div>
                    </div>
                    <div v-if="form.isSplit" class="bg-bg-subtle p-6 rounded-3xl space-y-6 mx-2">
                        <div v-if="!isReadOnly">
                             <div class="flex flex-wrap gap-2">
                                <button v-for="f in displayFriends" :key="'e-s-'+f.id" @click="toggleFriendInSplit(f.id)" :class="isFriendInSplit(f) ? 'bg-[var(--action-primary-bg)] text-white' : 'bg-white text-txt-secondary'" class="px-4 py-1.5 rounded-full text-[10px]">{{ f.name }}</button>
                                <button @click="triggerAddFriend('split')" class="px-3 py-1.5 rounded-full bg-bg-subtle text-txt-secondary text-[10px]">+</button>
                             </div>
                             <!-- 新增好友輸入框 -->
                             <div v-if="isAddingFriend && addFriendTarget === 'split'" class="mt-2 bg-white p-3 rounded-2xl flex items-center space-x-2 shadow-sm">
                                <input type="text" v-model="newFriendName" placeholder="新分帳人" class="flex-grow bg-bg-subtle p-2 rounded-xl text-xs outline-none">
                                <button @click="confirmAddFriend" class="bg-[var(--action-primary-bg)] text-white px-4 py-2 rounded-xl text-[10px]">OK</button>
                             </div>

                             <div class="flex bg-white rounded-lg p-1 text-[9px] uppercase tracking-widest mt-4">
                                <button @click="splitMode = 'auto'" :class="splitMode === 'auto' ? 'bg-bg-subtle text-txt-primary' : 'text-txt-muted'" class="flex-1 py-1 rounded">自動平分</button>
                                <button @click="splitMode = 'manual'" :class="splitMode === 'manual' ? 'bg-bg-subtle text-txt-primary' : 'text-txt-muted'" class="flex-1 py-1 rounded">手動份額</button>
                            </div>
                        </div>
                        <div v-else class="text-xs text-txt-primary">{{ getFriendNamesFromList(selectedFriends) }}</div>
                        
                        <div class="flex justify-between items-center pt-2 border-t border-bdr-subtle">
                            <span class="text-[10px] text-txt-secondary">我的份額</span>
                            <div v-if="!isReadOnly && splitMode === 'manual'">
                                <input type="number" v-model="form.personalShare" class="text-right bg-white border border-bdr-subtle rounded-lg px-2 text-sm w-24">
                            </div>
                            <span v-else class="text-sm font-medium">¥ {{ formatNumber(splitMode === 'auto' ? autoShareValue : form.personalShare) }}</span>
                        </div>
                        <div class="flex items-center justify-between border-t border-bdr-subtle pt-3">
                            <span class="text-[10px] text-txt-secondary">對方已當場付清</span>
                            <input v-if="!isReadOnly" type="checkbox" v-model="form.isAlreadyPaid" class="accent-gray-600">
                            <div v-else class="text-[10px] text-txt-secondary">{{ form.isAlreadyPaid ? '是' : '否' }}</div>
                        </div>
                    </div>
                </div>

                <!-- 7. 旅行計畫模式 -->
                <div v-if="!isReadOnly" class="pt-4 border-t border-bdr-subtle space-y-4 px-2">
                    <div class="flex items-center justify-between">
                        <span class="text-xs text-txt-secondary font-light">旅行計畫模式</span>
                        <div class="w-10 h-5 rounded-full shadow-sm relative transition-colors cursor-pointer" 
                             :class="form.projectId ? 'bg-[var(--action-primary-bg)]' : 'bg-bg-subtle'"
                             @click="toggleProjectMode">
                            <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform" 
                                 :class="{'translate-x-5': form.projectId}"></div>
                        </div>
                    </div>

                    <div v-if="form.projectId || isProjectModeOpen" class="bg-bg-subtle p-6 rounded-3xl space-y-4 animate-in slide-in-from-top-2">
                         <div class="flex flex-wrap gap-2">
                            <button v-for="p in activeProjects" :key="p.id" 
                                    @click="form.projectId = p.id"
                                    :class="form.projectId === p.id ? 'bg-[var(--action-primary-bg)] text-white' : 'bg-white text-txt-secondary border border-bdr-subtle'" 
                                    class="px-4 py-1.5 rounded-full text-[10px]">{{ p.name }}</button>
                            <button @click="isAddingNewProject = !isAddingNewProject" class="px-3 py-1.5 rounded-full bg-bg-subtle text-txt-secondary text-[10px]">+</button>
                         </div>
                         <div v-if="isAddingNewProject" class="mx-2 bg-white p-3 rounded-2xl flex items-center space-x-2 mt-2 shadow-sm">
                            <input type="text" v-model="newProjectName" placeholder="新旅行計畫" class="flex-grow bg-bg-subtle p-2 rounded-xl text-xs outline-none">
                            <button @click="quickCreateProject" class="bg-[var(--action-primary-bg)] text-white px-4 py-2 rounded-xl text-[10px]">OK</button>
                         </div>
                    </div>
                </div>
                <div v-else-if="currentProjectName" class="px-2 pt-2 border-t border-bdr-subtle">
                    <span class="text-[10px] text-txt-secondary uppercase tracking-widest block mb-1">旅行計畫</span>
                    <span class="bg-[var(--action-primary-bg)] text-white px-4 py-1.5 rounded-full text-[10px] inline-block">{{ currentProjectName }}</span>
                </div>
            </div>

            <!-- 7. 按鈕 -->
            <div class="space-y-4 pt-6">
                <button v-if="isReadOnly" @click="isReadOnly = false" class="w-full bg-[var(--action-primary-bg)] text-white py-5 rounded-2xl text-[10px] font-medium tracking-[0.4em] uppercase shadow-lg">開始編輯</button>
                <template v-else>
                    <button @click="prepareAndSubmit" :disabled="loading" class="w-full bg-[var(--action-primary-bg)] text-white py-5 rounded-2xl text-[10px] font-medium tracking-[0.4em] uppercase shadow-lg active:scale-95 transition-all">更新紀錄</button>
                    <button @click="$emit('delete-item', form.row)" :disabled="loading" class="w-full border border-bdr-outline text-danger py-3 rounded-2xl text-[10px] font-medium tracking-[0.4em] uppercase active:bg-bg-subtle transition-all">刪除此筆資料</button>
                </template>
            </div>
        </div>
    </section>
    `,
    props: ['form', 'categories', 'friends', 'loading', 'paymentMethods', 'projects', 'currentUser', 'transactions'],
    data() {
        return {
            selectedFriends: [],
            isReadOnly: true,
            isProjectModeOpen: false,
            isAddingNewProject: false,
            newProjectName: '',
            // New Sync Data
            isAddingFriend: false,
            addFriendTarget: '',
            newFriendName: '',
            splitMode: 'auto',
            showCalculator: false,
            calcExpression: ''
        };
    },
    computed: {
        filteredCategories() { return this.categories.filter(c => c.type === (this.form.type === '收款' ? '支出' : this.form.type)); },
        autoShareValue() {
            if (!this.form.amount) return 0;
            const totalPeople = (this.form.isSplit ? this.selectedFriends.length : 0) + 1;
            return Math.round(this.form.amount / totalPeople);
        },
        displayFriends() {
            // Show visible friends, OR any friend that is currently selected/involved in this item
            return (this.friends || []).filter(f => {
                const isSelected = this.isFriendMatch(this.form.payer, f) || 
                                 this.isFriendMatch(this.form.friendName, f) || 
                                 this.isFriendInSplit(f);
                return (f.visible !== false) || isSelected;
            });
        },
        activeProjects() {
            const currentId = this.form.projectId;
            return (this.projects || []).filter(p =>
                ((p.status !== 'Archived' && p.status !== 'archived') && p.visible !== false) || p.id === currentId
            );
        },
        currentProjectName() {
            if (!this.form.projectId) return null;
            const p = (this.projects || []).find(pr => pr.id === this.form.projectId);
            return p ? p.name : this.form.projectId;
        },
        nameSuggestions() {
            if (!this.form.name || this.form.name.trim().length === 0) return [];
            const query = this.form.name.toLowerCase().trim();
            const matches = (this.transactions || [])
                .map(t => (t.name || '').trim())
                .filter(name => name && name.toLowerCase().includes(query) && name.toLowerCase() !== this.form.name.toLowerCase().trim())
                .reduce((acc, name) => {
                    if (!acc.find(item => item.toLowerCase() === name.toLowerCase())) acc.push(name);
                    return acc;
                }, []);
            return matches.slice(0, 2);
        },
        noteSuggestions() {
            if (!this.form.note || this.form.note.trim().length === 0) return [];
            const query = this.form.note.toLowerCase().trim();
            const matches = (this.transactions || [])
                .map(t => (t.note || '').trim())
                .filter(note => note && note.toLowerCase().includes(query) && note.toLowerCase() !== this.form.note.toLowerCase().trim())
                .reduce((acc, note) => {
                    if (!acc.find(item => item.toLowerCase() === note.toLowerCase())) acc.push(note);
                    return acc;
                }, []);
            return matches.slice(0, 2);
        }
    },
    methods: {
        // Robust comparison helpers
        isMeMatch(idOrName) {
            if (idOrName === '我' || idOrName === 'Me') return true;
            if (this.currentUser && idOrName === this.currentUser.uid) return true;
            return false;
        },
        isFriendMatch(idOrName, f) {
            if (!idOrName || !f) return false;
            // Support matching by ID, Name, or UID
            return idOrName === f.id || idOrName === f.name || idOrName === f.uid;
        },
        isFriendInSplit(f) {
            // SelectedFriends may contain IDs or Names
            return this.selectedFriends.some(idOrName => this.isFriendMatch(idOrName, f));
        },

        toggleProjectMode() {
            if (this.form.projectId) {
                this.form.projectId = '';
                this.isProjectModeOpen = false;
            } else {
                this.isProjectModeOpen = true;
                if (this.activeProjects.length > 0 && !this.form.projectId) {
                    this.form.projectId = this.activeProjects[0].id;
                }
            }
        },
        async quickCreateProject() {
            if (!this.newProjectName) return;
            this.$emit('create-project', this.newProjectName);
            this.newProjectName = '';
            this.isAddingNewProject = false;
        },
        formatNumber(num) { return new Intl.NumberFormat().format(Math.round(num || 0)); },
        getCategoryName(id) { return this.categories.find(c => c.id === id)?.name || '未分類'; },
        getCategoryIcon(id) { return this.categories.find(c => c.id === id)?.icon || 'sell'; },
        getPaymentName(id) { const pm = this.paymentMethods.find(p => p.id === id); return pm ? pm.name : id; },

        toggleFriendInSplit(id) {
            const idx = this.selectedFriends.indexOf(id);
            if (idx > -1) this.selectedFriends.splice(idx, 1);
            else this.selectedFriends.push(id);
        },
        getFriendName(idOrName) {
            if (this.isMeMatch(idOrName)) return '我';
            if (!idOrName) return '';

            const f = (this.friends || []).find(x => this.isFriendMatch(idOrName, x));
            if (f) return f.name;

            // Fallback for long IDs
            if (idOrName.length > 20 || idOrName.includes('_')) return '朋友';
            return idOrName;
        },
        getFriendNamesFromList(idsOrNames) {
            if (!idsOrNames || idsOrNames.length === 0) return '';
            const list = Array.isArray(idsOrNames) ? idsOrNames : idsOrNames.split(', ').filter(Boolean);
            return list.map(id => this.getFriendName(id)).join(', ');
        },

        // Sync Methods from Add Page
        triggerAddFriend(target) {
            if (this.addFriendTarget === target) {
                this.isAddingFriend = !this.isAddingFriend;
            } else {
                this.addFriendTarget = target;
                this.isAddingFriend = true;
            }
        },
        confirmAddFriend() {
            if (this.newFriendName) {
                const name = this.newFriendName;
                this.$emit('add-friend-to-list', name);
                window.setTimeout(() => {
                    const newF = this.friends.find(f => f.name === name);
                    if (newF) {
                        if (this.addFriendTarget === 'payer') this.form.payer = newF.id;
                        else if (this.addFriendTarget === 'friendName') this.form.friendName = newF.id;
                        else if (this.addFriendTarget === 'split') {
                            if (!this.selectedFriends.includes(newF.id)) this.selectedFriends.push(newF.id);
                        }
                    }
                }, 0);
                this.newFriendName = ''; this.isAddingFriend = false;
            }
        },

        prepareAndSubmit() {
            if (this.form.type === '支出') {
                if (this.form.isSplit) {
                    const share = this.splitMode === 'auto' ? this.autoShareValue : this.form.personalShare;
                    this.form.personalShare = share;
                    if (!this.form.isAlreadyPaid) {
                        this.form.debtAmount = (this.isMeMatch(this.form.payer)) ? (this.form.amount - share) : -share;
                    } else {
                        this.form.debtAmount = 0;
                    }
                    // Always include "我" in the friend list for backward compatibility in Firestore queries
                    const list = [...this.selectedFriends];
                    if (!list.includes('我')) list.push('我');
                    this.form.friendName = list.join(', ');
                } else {
                    // Normal Expense: No split, personal share is total amount
                    this.form.personalShare = this.form.amount;
                    this.form.debtAmount = 0;
                    this.form.friendName = ''; 
                    this.selectedFriends = [];
                }
            } else if (this.form.type === '收款') {
                this.form.debtAmount = -this.form.amount;
                this.form.personalShare = 0;
                this.form.payer = this.form.friendName;
            } else {
                // Income
                this.form.personalShare = this.form.amount;
                this.form.debtAmount = 0;
            }

            this.$emit('submit');
        },
        formatDateWithTimezone(dateStr, utc) {
            if (!dateStr) return '';
            const formatted = dateStr.replace('T', ' ').replace(/-/g, '.');
            if (utc) {
                const zone = utc.replace(':', '');
                return `${formatted} (GMT${zone})`;
            }
            return formatted;
        },
        toggleCalculator() {
            this.showCalculator = !this.showCalculator;
            if (this.showCalculator) {
                this.calcExpression = this.form.amount ? String(this.form.amount) : '';
                if (navigator.vibrate) navigator.vibrate(5);
            }
        },
        onCalcPress(btn) {
            if (navigator.vibrate) navigator.vibrate(2);
            if (btn === 'C') {
                this.calcExpression = '';
            } else if (btn === '⌫') {
                this.calcExpression = this.calcExpression.slice(0, -1);
            } else if (btn === '=') {
                this.evaluateExpression(true);
                return;
            } else {
                const map = { '×': '*', '÷': '/' };
                this.calcExpression += map[btn] || btn;
            }
            this.evaluateExpression(false);
        },
        evaluateExpression(shouldClose) {
            if (!this.calcExpression) return;
            try {
                const sanitized = this.calcExpression.replace(/[^-+*/().0-9]/g, '');
                if (/[+\-*/(.]$/.test(sanitized)) return;
                const openCount = (sanitized.match(/\(/g) || []).length;
                const closeCount = (sanitized.match(/\)/g) || []).length;
                if (openCount !== closeCount && !shouldClose) return;
                const result = new Function(`return ${sanitized}`)();
                if (isFinite(result)) {
                    this.form.amount = Math.round(result * 100) / 100;
                    if (shouldClose) this.showCalculator = false;
                }
            } catch (e) {
                if (shouldClose) console.error('Calculation error:', e);
            }
        },
        triggerPicker(el) {
            if (el && el.showPicker) {
                try { el.showPicker(); } catch (e) { el.focus(); }
            } else if (el) {
                el.focus();
                el.click();
            }
        }
    },
    watch: {
        'form.isSplit'(newVal) {
            if (!newVal) {
                // Immediately reset fields when split is toggled off for better UX
                this.form.personalShare = this.form.amount;
                this.form.debtAmount = 0;
                this.form.friendName = '';
                this.selectedFriends = [];
            }
        },
        'form.row': {
            handler() {
                this.isReadOnly = true;
                // Parse friends using regex to handle inconsistent spacing
                if (this.form.friendName) {
                    this.selectedFriends = this.form.friendName.split(/,\s*/)
                        .filter(f => f && !this.isMeMatch(f));
                } else {
                    this.selectedFriends = [];
                }
                
                this.isProjectModeOpen = !!this.form.projectId;

                // Detection Logic for Split Mode
                if (this.form.isSplit) {
                    const totalPeople = (this.selectedFriends.length) + 1;
                    const auto = Math.round(this.form.amount / totalPeople);
                    if (Math.abs(this.form.personalShare - auto) > 2) {
                        this.splitMode = 'manual';
                    } else {
                        this.splitMode = 'auto';
                    }
                } else {
                    this.splitMode = 'auto';
                }
            },
            immediate: true
        }
    }
};
