import { CurrencySelect } from '../components/currency-select.js';
import { convert, formatCurrency, getSymbol } from '../utils/currency-utils.js';

export const OverviewPage = {
    template: `
    <section class="space-y-6 py-4 animate-in fade-in pb-10">
        <!-- 1. 本日支出 (混合總額邏輯) -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-4">

            <div class="flex justify-between items-center px-2">
                <div class="flex items-center space-x-2">
                        <p class="text-[10px] text-gray-400 uppercase tracking-widest">{{ selectedDateLabel }} 支出</p>
                    </div>
                    <h2 class="text-3xl font-light text-gray-700 mt-1">{{ formatCurrency(displayAmount, baseCurrency) }}</h2>
                </div>
                <button @click="isMyShareOnly = !isMyShareOnly" class="text-[9px] px-3 py-1.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100 active:bg-gray-200 transition-all uppercase tracking-widest">
                    {{ isMyShareOnly ? '我的份額' : '混合總額' }}
                </button>
            </div>
            <div class="h-32 w-full pt-2">
                <canvas ref="barChart"></canvas>
            </div>
        </div>

        <!-- 2. 月度與總統計 -->
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white p-5 rounded-[2rem] muji-shadow border border-gray-50 flex flex-col justify-center space-y-1">
                <span class="text-[9px] text-gray-400 font-medium uppercase tracking-widest">本月日幣支出</span>
                <span class="text-lg font-light text-gray-700">{{ formatCurrency(monthlyJPYTotal, 'JPY') }}</span>
            </div>
            <div class="bg-white p-5 rounded-[2rem] muji-shadow border border-gray-50 flex flex-col justify-center space-y-1">
                <span class="text-[9px] text-gray-400 font-medium uppercase tracking-widest">本月台幣支出</span>
                <span class="text-lg font-light text-gray-700">{{ formatCurrency(monthlyTWDTotal, 'TWD') }}</span>
            </div>
            <div class="bg-white p-5 rounded-[2rem] muji-shadow border border-gray-50 flex flex-col justify-center space-y-1">
                <span class="text-[9px] text-gray-400 font-medium uppercase tracking-widest">總支出 (全期間)</span>
                <span class="text-lg font-light text-gray-700">{{ formatCurrency(totalOutflowCombined, baseCurrency) }}</span>
                <span class="text-[8px] text-gray-300 font-bold">{{ baseCurrency }}</span>
            </div>
             <div class="bg-white p-5 rounded-[2rem] muji-shadow border border-gray-50 flex flex-col justify-center space-y-1">
                <span class="text-[9px] text-gray-400 font-medium uppercase tracking-widest">總收入 (全期間)</span>
                <span class="text-lg font-light text-gray-700">{{ formatCurrency(totalIncome, baseCurrency) }}</span>
                <span class="text-[8px] text-gray-300 font-bold">{{ baseCurrency }}</span>
            </div>
        </div>

        <!-- 4. 淨欠款狀態 -->
        <div class="bg-white p-6 rounded-2xl muji-shadow border border-gray-50 flex justify-between items-center active:scale-[0.98] transition-all" @click="$emit('go-to-history', { mode: 'debt' })">
                <div>
                    <p class="text-[10px] text-gray-400 font-medium uppercase tracking-widest">債務資料 ({{ baseCurrency }})</p>
                    <p class="text-xl font-light mt-1" :class="debtColorClass">
                        {{ formatCurrency(debtDisplayValue, baseCurrency) }}
                    </p>
                </div>
            <span class="material-symbols-rounded text-gray-200">arrow_forward_ios</span>
        </div>
    </section>
    `,
    components: { 'currency-select': CurrencySelect },
    props: ['transactions', 'stats', 'fxRate', 'effectiveRates'],
    setup() {
        const { inject } = window.Vue;
        const baseCurrency = inject('baseCurrency');
        const setBaseCurrency = inject('setBaseCurrency'); // Try to inject this
        return { baseCurrency, setBaseCurrency, formatCurrency };
    },
    data() {
        return { isMyShareOnly: false, selectedDateStr: '', chartInstance: null };
    },
    computed: {
        activeCurrencyCodes() {
            const extras = this.effectiveRates ? Object.keys(this.effectiveRates) : [];
            const set = new Set([this.baseCurrency, ...extras]); // baseCurrency is string here? computed?
            // In App.js baseCurrency is likely ref. In template it's unwrapped.
            // In setup() it's a Ref.
            // Wait, inside computed, `this.baseCurrency` is the value (proxy).
            return Array.from(set);
        },
        activeCurrencyOptions() {
            return this.activeCurrencyCodes.map(c => ({ label: c, value: c }));
        },
        todayStr() {
            const now = new Date();
            return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
        },
        selectedDateLabel() { return this.selectedDateStr === this.todayStr ? '本日' : this.selectedDateStr.substring(5); },
        displayAmount() {
            const targetDate = this.selectedDateStr || this.todayStr;
            return (this.transactions || []) // Ensure array
                .filter(t => t && t.spendDate && t.spendDate.startsWith(targetDate) && t.type === '支出')
                .reduce((acc, t) => acc + this.getNormalizedAmount(t), 0);
        },

        // Dynamic Monthly Stats (Split by original currency)
        monthlyJPYTotal() {
            const ym = this.todayStr.substring(0, 7);
            return this.transactions
                .filter(t => t && t.spendDate && t.spendDate.startsWith(ym) && t.type === '支出' && (t.currency === 'JPY' || (!t.currency && t.originalCurrency !== 'TWD')))
                .reduce((acc, t) => {
                    // Always return raw amount for specific currency total, but check share
                    const val = this.isMyShareOnly || t.payer !== '我' ? Number(t.personalShare || 0) : Number(t.amount || (t.amountJPY) || 0);
                    return acc + val;
                }, 0);
        },
        monthlyTWDTotal() {
            const ym = this.todayStr.substring(0, 7);
            return this.transactions
                .filter(t => t && t.spendDate && t.spendDate.startsWith(ym) && t.type === '支出' && (t.currency === 'TWD' || t.originalCurrency === 'TWD'))
                .reduce((acc, t) => {
                    const val = this.isMyShareOnly || t.payer !== '我' ? Number(t.personalShare || 0) : Number(t.amount || (t.amountTWD) || 0);
                    return acc + val;
                }, 0);
        },

        totalOutflowCombined() { // Life Total (All Time)
            return (this.transactions || [])
                .filter(t => {
                    if (!t || !t.type) return false;
                    return t.type === '支出';
                })
                .reduce((acc, t) => acc + this.getNormalizedAmount(t), 0);
        },
        totalIncome() {
            return (this.transactions || [])
                .filter(t => {
                    if (!t || !t.type) return false;
                    return t.type === '收入';
                })
                .reduce((acc, t) => acc + this.getNormalizedAmount(t), 0);
        },

        debtDisplayValue() {
            // Calculate Net Debt locally
            // Debt (-): I owe someone (Payer != Me, !Paid) -> My Share
            // Credit (+): Someone owes me (Payer == Me, Split/Friend, !Paid) -> (Total - MyShare)

            let net = 0;
            const rates = this.effectiveRates || { 'TWD': 0.22 };

            (this.transactions || []).forEach(t => {
                if (!t || !t.type) return;
                if (t.type === '支出' && !t.isAlreadyPaid) {
                    const currency = t.currency || t.originalCurrency || (t.amountTWD ? 'TWD' : 'JPY');
                    const rawAmt = Number(t.amount || (currency === 'TWD' ? t.amountTWD : t.amountJPY) || 0);
                    const myShareRaw = (t.payer !== '我' || t.isSplit) ? Number(t.personalShare || 0) : rawAmt;

                    if (t.payer !== '我') {
                        // I owe them My Share
                        // Convert My Share (in original currency) to Base Currency
                        net -= convert(myShareRaw, currency, this.baseCurrency, rates);
                    } else if (t.friendName || t.isSplit) {
                        // They owe me (Total - My Share)
                        const lendRaw = rawAmt - myShareRaw;
                        net += convert(lendRaw, currency, this.baseCurrency, rates);
                    }
                }
            });
            return net;
        },
        debtColorClass() {
            if (this.debtDisplayValue > 0) return 'text-emerald-500';
            if (this.debtDisplayValue < 0) return 'text-red-500';
            return 'text-gray-400';
        }
    },
    methods: {
        getNormalizedAmount(t) {
            const rates = this.effectiveRates || { 'TWD': 0.22 };
            const currency = t.currency || t.originalCurrency || (t.amountTWD ? 'TWD' : 'JPY');

            // 1. Determine the value in ORIGINAL currency
            // If my share only or not payer -> Personal Share. Else -> Full Amount.
            let val = 0;
            if (this.isMyShareOnly || t.payer !== '我') {
                val = Number(t.personalShare || 0);
            } else {
                // Full Amount
                val = Number(t.amount || (currency === 'TWD' ? t.amountTWD : t.amountJPY) || 0);
            }

            // 2. Convert to BASE currency
            return convert(val, currency, this.baseCurrency, rates);
        },
        renderChart() {
            if (!this.$refs.barChart) return;
            const ctx = this.$refs.barChart.getContext('2d');
            if (this.chartInstance) this.chartInstance.destroy();
            const days = [];
            for (let i = 4; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                const val = (this.transactions || []).filter(t => t && t.spendDate && t.spendDate.startsWith(ds) && t.type === '支出').reduce((acc, t) => acc + this.getNormalizedAmount(t), 0);
                days.push({ date: ds, label: ds.substring(5), val });
            }
            this.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: days.map(d => d.label),
                    datasets: [{ data: days.map(d => d.val), backgroundColor: days.map(d => d.date === this.selectedDateStr ? '#4A4A4A' : '#E5E5E5'), borderRadius: 4, barThickness: 20 }]
                },
                options: {
                    responsive: true, animation: false, maintainAspectRatio: false,
                    scales: { y: { display: false }, x: { grid: { display: false }, border: { display: false } } },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    onClick: (e, el) => { if (el.length > 0) this.selectedDateStr = days[el[0].index].date; }
                }
            });
        }
    },
    beforeUnmount() { if (this.chartInstance) this.chartInstance.destroy(); },
    mounted() { this.selectedDateStr = this.todayStr; this.$nextTick(() => this.renderChart()); },

    watch: {
        isMyShareOnly() { this.renderChart(); },
        selectedDateStr() { this.renderChart(); },
        baseCurrency() { this.renderChart(); },
        transactions: { handler() { this.renderChart(); }, deep: true }
    }
};
