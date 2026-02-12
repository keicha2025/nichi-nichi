import { API } from '../api.js';

export const FriendDetailPage = {
    template: `
    <section class="animate-in fade-in pb-20">
        <!-- Main Content Card -->
        <div class="bg-white p-6 rounded-[2.5rem] muji-shadow border border-bdr-subtle flex flex-col min-h-[60vh] relative mt-2">
            
            <!-- Navigation -->
            <div class="flex items-center justify-between pb-2 shrink-0">
                <button @click="$emit('back')" class="text-txt-secondary hover:text-txt-primary transition-colors flex items-center space-x-1">
                    <span class="material-symbols-rounded text-xl">arrow_back</span>
                    <span class="text-[10px] tracking-widest uppercase">BACK</span>
                </button>
                <div class="flex items-center space-x-4">
                    <button v-if="!isEditing" @click="isEditing = true" class="text-txt-secondary hover:text-txt-primary transition-colors">
                        <span class="material-symbols-rounded text-lg">edit</span>
                    </button>
                </div>
            </div>

            <!-- Read Only View -->
            <div v-if="!isEditing" class="flex-1 flex flex-col justify-center space-y-10 py-6">
                <!-- Header Info -->
                <div class="text-center space-y-3">
                    <div class="w-16 h-16 bg-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
                        <span class="material-symbols-rounded text-txt-secondary text-3xl">person</span>
                    </div>
                    <h2 class="text-2xl font-light text-txt-primary tracking-wide">{{ friend.name }}</h2>
                    <p class="text-[10px] text-txt-muted tracking-[0.2em] uppercase">{{ friend.visible !== false ? '顯示中' : '已隱藏' }}</p>
                </div>

                <!-- Debt Stats (Normalized) -->
                <div class="text-center space-y-2">
                    <p class="text-[9px] text-txt-secondary uppercase tracking-[0.2em] font-medium">目前的淨債務狀態</p>
                    <div class="flex items-center justify-center space-x-3">
                         <!-- Currency Switcher -->
                         <div @click="toggleBaseCurrency" class="flex items-center space-x-1 bg-bg-subtle px-2.5 py-1 rounded-lg cursor-pointer hover:bg-bg-subtle/80 transition-colors border border-bdr-subtle/50">
                            <span class="text-[9px] font-bold text-txt-secondary">{{ baseCurrency }}</span>
                            <span class="material-symbols-rounded text-[10px] text-txt-secondary">sync_alt</span>
                         </div>

                         <span :class="netAmount > 0 ? 'text-txt-primary' : (netAmount < 0 ? 'text-txt-primary opacity-80' : 'text-txt-muted')" 
                               class="text-4xl font-light tracking-tighter">
                            {{ getCurrencySymbol }}{{ formatNumber(Math.abs(netAmount)) }}
                         </span>
                         <span v-if="netAmount !== 0" 
                               :class="netAmount > 0 ? 'bg-bg-subtle text-txt-primary border border-bdr-subtle' : 'bg-bg-subtle text-txt-secondary border border-bdr-subtle'" 
                               class="text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-medium">
                            {{ netAmount > 0 ? '應向其收取' : '我欠對方' }}
                         </span>
                         <span v-else class="text-[9px] text-txt-muted uppercase tracking-widest">已清帳</span>
                    </div>
                </div>

                <!-- Original Currency Data (Horizontal Grid) -->
                <div class="grid grid-cols-2 gap-4 bg-bg-subtle/50 p-6 rounded-[2rem] border border-bdr-subtle/30">
                     <div class="text-center">
                         <p class="text-[9px] text-txt-secondary uppercase tracking-[0.2em] mb-2 font-medium">JPY 淨額</p>
                         <p :class="rawStats.jpy > 0 ? 'text-txt-primary' : (rawStats.jpy < 0 ? 'text-txt-secondary' : 'text-txt-muted')" 
                            class="text-lg font-light">
                            {{ rawStats.jpy > 0 ? '+' : (rawStats.jpy < 0 ? '-' : '') }}¥{{ formatNumber(Math.abs(rawStats.jpy)) }}
                         </p>
                     </div>
                     <div class="text-center border-l border-bdr-subtle">
                         <p class="text-[9px] text-txt-secondary uppercase tracking-[0.2em] mb-2 font-medium">TWD 淨額</p>
                         <p :class="rawStats.twd > 0 ? 'text-txt-primary' : (rawStats.twd < 0 ? 'text-txt-secondary' : 'text-txt-muted')" 
                            class="text-lg font-light">
                            {{ rawStats.twd > 0 ? '+' : (rawStats.twd < 0 ? '-' : '') }}\${{ formatNumber(Math.abs(rawStats.twd)) }}
                         </p>
                     </div>
                </div>

                <!-- Actions -->
                <button @click="$emit('view-history', { type: 'friend', id: friend.id, name: friend.name })" class="w-full bg-bg-subtle text-txt-secondary py-4 rounded-2xl text-[10px] tracking-[0.3em] uppercase hover:bg-bg-subtle hover:text-txt-primary transition-all font-medium border border-bdr-subtle/50">
                    查看往來明細
                </button>
            </div>

            <!-- Edit View -->
            <div v-else class="space-y-8 pt-6">
                <!-- Name Edit -->
                <div class="space-y-3">
                    <label class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium ml-2">好友名稱</label>
                    <input type="text" v-model="editForm.name" placeholder="請輸入好友名稱"
                           class="w-full bg-bg-subtle px-6 py-4 rounded-2xl text-sm outline-none text-txt-primary transition-all focus:bg-white focus:shadow-sm border border-transparent focus:border-bdr-subtle">
                </div>

                <!-- Visibility Toggle -->
                <div class="bg-bg-subtle p-5 rounded-2xl flex items-center justify-between">
                    <div class="space-y-0.5">
                        <span class="text-xs text-txt-primary font-medium block">顯示在記帳區</span>
                        <p class="text-[9px] text-txt-secondary">關閉後，此好友將不會出現在記帳的分帳選單中。</p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="editForm.visible" class="sr-only peer">
                        <div class="w-10 h-5 bg-bdr-default rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-bdr-subtle after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--action-primary-bg)]"></div>
                    </label>
                </div>

                <!-- Save Actions -->
                <div class="space-y-4 pt-4">
                    <button @click="saveFriend" :disabled="saving" 
                            class="w-full bg-[var(--action-primary-bg)] text-white py-4 rounded-2xl text-[10px] font-medium tracking-[0.3em] uppercase shadow-lg active:scale-95 transition-all">
                        {{ saving ? 'Saving...' : '儲存變更' }}
                    </button>
                    <button @click="isEditing = false" class="w-full py-2 text-[10px] text-txt-secondary tracking-[0.2em] font-medium uppercase hover:text-txt-primary">
                        取消編輯
                    </button>
                </div>
            </div>
        </div>
    </section>
    `,
    props: ['friend', 'transactions', 'fxRate'],
    inject: ['dialog'],
    setup() {
        const { inject, computed } = window.Vue;
        const baseCurrency = inject('baseCurrency');
        const toggleBaseCurrency = inject('toggleBaseCurrency');
        const getCurrencySymbol = computed(() => baseCurrency.value === 'JPY' ? '¥' : '$');
        return { baseCurrency, toggleBaseCurrency, getCurrencySymbol };
    },
    data() {
        return {
            isEditing: false,
            editForm: {
                id: '',
                name: '',
                visible: true
            },
            saving: false
        };
    },
    computed: {
        rawStats() {
            if (!this.friend || !this.transactions) return { jpy: 0, twd: 0 };
            const name = (this.friend.name || '').trim();
            const id = (this.friend.id || '').trim();
            let jpy = 0;
            let twd = 0;

            this.transactions.forEach(t => {
                // 1. Determine Currency and Amount
                const currency = t.originalCurrency || t.currency || 'JPY';
                let rawAmt = 0;
                if (t.amount !== undefined && t.amount !== null) rawAmt = Number(t.amount);
                else rawAmt = (currency === 'TWD' ? Number(t.amountTWD || 0) : Number(t.amountJPY || 0));

                const personalShare = Number(t.personalShare || 0);
                const friendList = t.friendName ? t.friendName.split(',').map(s => s.trim()).filter(Boolean) : [];

                // 2. Identify Parties
                const isFriendPayer = (t.payer === id || (name && t.payer === name));
                const isFriendInList = friendList.includes(id) || (name && friendList.includes(name));
                const isMePayer = (t.payer === '我' || t.payer === 'Me');
                const isMeInList = friendList.includes('我') || friendList.includes('Me');

                if (t.type === '支出' && !t.isAlreadyPaid) {
                    if (isFriendPayer) {
                        // --- CASE: Friend Paid ---
                        if (t.isSplit || friendList.length > 1) {
                            // Split: I only owe my share if I'm in the group
                            if (isMeInList) {
                                // Default share if personalShare is 0 but I'm in the list
                                let myShare = personalShare;
                                if (myShare === 0 && friendList.length > 0) myShare = rawAmt / friendList.length;

                                if (currency === 'JPY') jpy -= myShare;
                                else twd -= myShare;
                            }
                        } else {
                            // 1-on-1: Friend paid for Me. I owe the whole thing (or my share)
                            const myShare = personalShare || rawAmt;
                            if (currency === 'JPY') jpy -= myShare;
                            else twd -= myShare;
                        }
                    } else if (isMePayer) {
                        // --- CASE: I Paid ---
                        if (isFriendInList) {
                            // Friend owes me.
                            let friendShare = 0;
                            if (t.isSplit || friendList.length > 1) {
                                // Group Split: (Total - MyShare) / others
                                const othersCount = friendList.filter(f => f !== '我' && f !== 'Me').length;
                                const totalLend = rawAmt - personalShare;
                                friendShare = othersCount > 0 ? totalLend / othersCount : totalLend;
                            } else {
                                // 1-on-1: They owe the full amount (minus my share)
                                friendShare = rawAmt - personalShare;
                            }

                            if (currency === 'JPY') jpy += friendShare;
                            else twd += friendShare;
                        }
                    }
                } else if (t.type === '收款') {
                    // --- CASE: Repayment ---
                    // Rule: If Friend is Payer -> They paid me back -> My credit decreases
                    // Rule: If I am Payer -> I paid them back -> My debt decreases
                    const involved = isFriendPayer || isFriendInList || t.friendName === name || t.friendName === id;

                    if (involved) {
                        if (isMePayer) {
                            // I paid THEM back
                            if (currency === 'JPY') jpy += rawAmt;
                            else twd += rawAmt;
                        } else {
                            // THEY paid me back
                            if (currency === 'JPY') jpy -= rawAmt;
                            else twd -= rawAmt;
                        }
                    }
                }
            });
            return { jpy, twd };
        },
        netAmount() {
            const stats = this.rawStats;
            const rate = Number(this.fxRate || 0.22);
            if (this.baseCurrency === 'JPY') {
                return stats.jpy + (stats.twd / rate);
            } else {
                return stats.twd + (stats.jpy * rate);
            }
        }
    },
    watch: {
        friend: {
            handler(newVal) {
                if (newVal) {
                    this.editForm = {
                        ...newVal,
                        visible: newVal.visible !== false
                    };
                }
            },
            immediate: true
        }
    },
    methods: {
        formatNumber(num) { return new Intl.NumberFormat().format(Math.round(num || 0)); },
        async saveFriend() {
            if (!this.editForm.name.trim()) {
                this.dialog.alert("名稱不能為空");
                return;
            }
            this.saving = true;
            try {
                // Emit update to parent
                this.$emit('update-friend', {
                    id: this.friend.id,
                    newName: this.editForm.name.trim(),
                    visible: this.editForm.visible
                });
                this.isEditing = false;
                this.dialog.alert("好友資料已更新", 'success');
            } catch (e) {
                this.dialog.alert("儲存失敗: " + e.toString());
            } finally {
                this.saving = false;
            }
        }
    }
};
