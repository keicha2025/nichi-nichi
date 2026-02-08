
import { CURRENCIES } from '../utils/currency-utils.js';

export const CurrencyEditPage = {
    template: `
    <section class="animate-in fade-in pb-20">
        <div class="bg-white p-6 rounded-[2.5rem] muji-shadow border border-gray-50 flex flex-col min-h-[60vh] relative mt-2">
            
            <!-- Header -->
            <div class="flex justify-between items-center px-1 border-b border-gray-50 pb-5 shrink-0">
                <span class="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">匯率與幣別管理</span>
                <button @click="$emit('cancel')" class="text-[10px] text-gray-300 uppercase tracking-widest hover:text-gray-500 transition-colors">取消</button>
            </div>

            <!-- Content Area -->
            <div class="flex-1 overflow-y-auto subtle-scrollbar overscroll-contain px-1 py-4">
                <div class="space-y-3">
                    <div v-for="curr in allCurrencies" :key="curr.code" class="flex items-center justify-between p-4 bg-gray-50 rounded-[2rem] border border-gray-100/50">
                        <!-- Info -->
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-600 shadow-sm border border-gray-50">
                                <span class="text-xs font-bold">{{ curr.symbol }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-sm font-bold text-gray-800">{{ curr.code }}</span>
                                <span class="text-[9px] text-gray-400 font-medium tracking-wider">{{ curr.name }}</span>
                            </div>
                        </div>

                        <!-- Controls -->
                        <div class="flex items-center space-x-4">
                             <!-- Rate Input (Only if active and NOT primary) -->
                             <!-- If Primary, show 1.0 disabled? Or hide? User said "If Toggle OFF... hidden/disabled". Primary is ON. -->
                             <!-- If Primary, we can show "1.00" disabled -->
                             <div v-if="localActive.includes(curr.code)" class="w-24">
                                <input v-if="curr.code !== baseCurrency"
                                       type="number"
                                       v-model.number="localRates[curr.code]"
                                       step="0.001"
                                       placeholder="Rate"
                                       class="text-sm font-bold text-gray-700 bg-transparent outline-none w-full text-right border-b border-gray-200 focus:border-gray-400 transition-colors py-1">
                                <span v-else class="block text-sm font-bold text-gray-400 text-right py-1 border-b border-transparent">1.00</span>
                             </div>

                             <!-- Toggle -->
                             <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" :value="curr.code" v-model="localActive" class="sr-only peer" :disabled="curr.code === baseCurrency">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4A4A4A] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                             </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Action -->
            <div class="pt-6 shrink-0">
                <button @click="handleSave" class="w-full bg-[#4A4A4A] text-white py-5 rounded-2xl text-[10px] font-medium tracking-[0.4em] uppercase shadow-lg active:scale-95 transition-all">
                    儲存設定
                </button>
            </div>
        </div>
    </section>
    `,
    props: {
        activeCurrencies: { type: Array, default: () => [] },
        exchangeRates: { type: Object, default: () => ({}) },
        baseCurrency: { type: String, default: 'JPY' }
    },
    emits: ['save', 'cancel'],
    data() {
        return {
            localActive: [],
            localRates: {}
        };
    },
    computed: {
        allCurrencies() {
            return Object.values(CURRENCIES);
        }
    },
    watch: {
        activeCurrencies: {
            handler(val) {
                this.localActive = [...(val || [])];
                // Ensure base currency is active
                if (!this.localActive.includes(this.baseCurrency)) {
                    this.localActive.push(this.baseCurrency);
                }
            },
            immediate: true
        },
        exchangeRates: {
            handler(val) {
                this.localRates = { ...val };
            },
            immediate: true,
            deep: true
        }
    },
    inject: ['dialog'],
    methods: {
        async handleSave() {
            // Anti-Error Verification
            // Identify changed rates for ACTIVE currencies
            const changes = [];
            this.localActive.forEach(code => {
                if (code === this.baseCurrency) return;
                const oldRate = this.exchangeRates[code];
                const newRate = this.localRates[code];

                // If newly added or rate changed
                if (!this.activeCurrencies.includes(code) || oldRate !== newRate) {
                    changes.push({ code, rate: newRate });
                }
            });

            if (changes.length > 0) {
                // Construct message
                // Request: "1 [Primary] = [Rate] [Active]. Is this correct?"
                // We display the FIRST change or a list if feasible. 
                // Dialog usually takes a string.

                let message = "請確認匯率設定是否正確：\n";
                changes.forEach(c => {
                    message += `\n1 ${this.baseCurrency} = ${c.rate} ${c.code}`;
                });

                const confirmed = await this.dialog.confirm(message, {
                    title: '確認匯率',
                    confirmText: '正確，儲存',
                    cancelText: '返回修改'
                });

                if (!confirmed) return;
            }

            this.$emit('save', {
                activeCurrencies: this.localActive,
                exchangeRates: this.localRates
            });
        }
    }
};
