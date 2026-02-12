import { Theme } from '../theme.js';

export const OverviewPage = {
    template: `
    <section class="space-y-6 py-4 animate-in fade-in pb-10">
        <!-- 1. 本日支出 (混合總額邏輯，統一為 JPY) -->
        <!-- 1. 本日支出 (混合總額邏輯) -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-default space-y-4">

            <div class="flex justify-between items-center px-2">
                <div class="flex flex-col">
                    <p class="text-[10px] text-txt-secondary uppercase tracking-widest">{{ selectedDateLabel }} 支出 ({{ baseCurrency }})</p>
                    <h2 class="text-3xl font-light text-txt-primary mt-1">{{ getCurrencySymbol }} {{ formatNumber(displayAmount) }}</h2>
                </div>
                <button @click="isMyShareOnly = !isMyShareOnly" class="text-[9px] px-3 py-1.5 rounded-full bg-bg-subtle text-txt-secondary border border-bdr-default active:bg-bg-main transition-all uppercase tracking-widest">
                    {{ isMyShareOnly ? '我的份額' : '混合總額' }}
                </button>
            </div>
            <div class="h-32 w-full pt-2">
                <canvas ref="barChart"></canvas>
            </div>
        </div>

        <!-- 2. 月度與總統計 -->
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white p-5 rounded-[2rem] muji-shadow border border-bdr-default flex flex-col justify-center space-y-1">
                <span class="text-[9px] text-txt-secondary font-medium uppercase tracking-widest">本月日幣支出</span>
                <span class="text-lg font-light text-txt-secondary">¥ {{ formatNumber(monthlyJPYTotal) }}</span>
            </div>
            <div class="bg-white p-5 rounded-[2rem] muji-shadow border border-bdr-default flex flex-col justify-center space-y-1">
                <span class="text-[9px] text-txt-secondary font-medium uppercase tracking-widest">本月台幣支出</span>
                <span class="text-lg font-light text-txt-secondary">$ {{ formatNumber(monthlyTWDTotal) }}</span>
            </div>
            <div class="bg-white p-5 rounded-[2rem] muji-shadow border border-bdr-default flex flex-col justify-center space-y-1">
                <span class="text-[9px] text-txt-secondary font-medium uppercase tracking-widest">總支出 (全期間)</span>
                <span class="text-lg font-light text-txt-secondary">{{ getCurrencySymbol }} {{ formatNumber(totalOutflowCombined) }}</span>
                <span class="text-[8px] text-txt-muted font-bold">{{ baseCurrency }}</span>
            </div>
             <div class="bg-white p-5 rounded-[2rem] muji-shadow border border-bdr-default flex flex-col justify-center space-y-1">
                <span class="text-[9px] text-txt-secondary font-medium uppercase tracking-widest">總收入 (全期間)</span>
                <span class="text-lg font-light text-txt-secondary">{{ getCurrencySymbol }} {{ formatNumber(totalIncome) }}</span>
                <span class="text-[8px] text-txt-muted font-bold">{{ baseCurrency }}</span>
            </div>
        </div>

        <!-- 4. 淨欠款狀態 -->
        <div class="bg-white p-6 rounded-2xl muji-shadow border border-bdr-default flex justify-between items-center active:scale-[0.98] transition-all" @click="$emit('go-to-history', { mode: 'debt' })">
                <div>
                    <p class="text-[10px] text-txt-secondary font-medium uppercase tracking-widest">債務資料 ({{ baseCurrency }})</p>
                    <p class="text-xl font-light mt-1 text-txt-secondary">
                        {{ getCurrencySymbol }} {{ formatNumber(debtDisplayValue) }}
                    </p>
                </div>
            <span class="material-symbols-rounded text-txt-muted">arrow_forward_ios</span>
        </div>
    </section>
    `,
    props: ['transactions', 'stats', 'fxRate'],
    setup() {
        const { inject, computed } = window.Vue;
        const baseCurrency = inject('baseCurrency');
        const getCurrencySymbol = computed(() => baseCurrency.value === 'JPY' ? '¥' : '$');
        return { baseCurrency, getCurrencySymbol };
    },
    data() {
        return { isMyShareOnly: false, selectedDateStr: '', barChart: null };
    },
    computed: {
        todayStr() {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        },
        selectedDateLabel() { return this.selectedDateStr === this.todayStr ? '本日' : this.selectedDateStr.substring(5); },
        displayAmount() {
            const targetDate = this.selectedDateStr || this.todayStr;
            return this.transactions
                .filter(t => t.spendDate.startsWith(targetDate) && t.type === '支出')
                .reduce((acc, t) => acc + this.getNormalizedAmount(t), 0);
        },

        // Dynamic Monthly Stats (Split by original currency)
        monthlyJPYTotal() {
            const ym = this.todayStr.substring(0, 7);
            return this.transactions
                .filter(t => t.spendDate.startsWith(ym) && t.type === '支出' && (t.currency === 'JPY' || !t.currency))
                .reduce((acc, t) => {
                    const val = this.isMyShareOnly || t.payer !== '我' ? Number(t.personalShare || 0) : Number(t.amount || 0);
                    return acc + val;
                }, 0);
        },
        monthlyTWDTotal() {
            const ym = this.todayStr.substring(0, 7);
            return this.transactions
                .filter(t => t.spendDate.startsWith(ym) && t.type === '支出' && t.currency === 'TWD')
                .reduce((acc, t) => {
                    const val = this.isMyShareOnly || t.payer !== '我' ? Number(t.personalShare || 0) : Number(t.amount || 0);
                    return acc + val;
                }, 0);
        },

        totalOutflowCombined() { // Life Total (All Time)
            // Use pre-calc stats from App.js if available, but need conversion.
            // Or recalc locally for instant reactivity. Local is safer for currency toggle.
            return this.transactions
                .filter(t => t.type === '支出')
                .reduce((acc, t) => acc + this.getNormalizedAmount(t), 0);
        },
        totalIncome() {
            return this.transactions
                .filter(t => t.type === '收入')
                .reduce((acc, t) => acc + this.getNormalizedAmount(t), 0);
        },

        debtDisplayValue() {
            let net = 0;
            const rate = Number(this.fxRate || 0.22);

            this.transactions.forEach(t => {
                const currency = t.originalCurrency || t.currency || 'JPY';
                const rawAmt = t.amount !== undefined ? Number(t.amount) : (currency === 'TWD' ? Number(t.amountTWD) : Number(t.amountJPY));

                const toBase = (v, c) => {
                    if (this.baseCurrency === 'JPY') return (c === 'TWD') ? v / rate : v;
                    else return (c === 'JPY') ? v * rate : v;
                };

                if (t.type === '支出' && !t.isAlreadyPaid) {
                    const myShareRaw = (t.payer !== '我' || t.isSplit) ? Number(t.personalShare || 0) : rawAmt;
                    const myShareBase = toBase(myShareRaw, currency);

                    if (t.payer !== '我') {
                        // I owe them My Share
                        net -= myShareBase;
                    } else if (t.friendName || t.isSplit) {
                        // They owe me (Total - My Share)
                        const lendRaw = rawAmt - myShareRaw;
                        net += toBase(lendRaw, currency);
                    }
                } else if (t.type === '收款') {
                    // Repayment / Settlement
                    const valBase = toBase(rawAmt, currency);
                    // Assumption: friendName is the friend involved. 
                    // If I am receiving money (default for 收款), net lend decreases.
                    // If I am payer (me paying them), net lend increases.
                    if (t.payer === '我') {
                        net += valBase;
                    } else {
                        net -= valBase;
                    }
                }
            });
            return net;
        }
    },
    methods: {
        formatNumber(num) { return new Intl.NumberFormat().format(Math.round(num || 0)); },
        getNormalizedAmount(t) {
            const rate = Number(this.fxRate || 0.22);
            let val = 0;
            const currency = t.originalCurrency || t.currency || 'JPY';

            // 1. Determine the value in ORIGINAL currency
            // If my share only or not payer -> Personal Share. Else -> Full Amount.
            // If personalShare is missing (legacy), fallback? Legacy usually had it.
            if (this.isMyShareOnly || t.payer !== '我') {
                val = Number(t.personalShare || 0);
            } else {
                // Full Amount
                if (t.amount !== undefined && t.amount !== null) val = Number(t.amount);
                else if (currency === 'TWD') val = Number(t.amountTWD || 0);
                else val = Number(t.amountJPY || 0);
            }

            // 2. Convert to BASE currency
            if (this.baseCurrency === 'JPY') {
                if (currency === 'TWD') return val / rate;
                return val;
            } else {
                // Target TWD
                if (currency === 'JPY') return val * rate;
                return val;
            }
        },
        renderChart() {
            if (!this.$refs.barChart) return;
            const ctx = this.$refs.barChart.getContext('2d');
            if (this.barChart) this.barChart.destroy();
            const days = [];
            for (let i = 4; i >= 0; i--) {
                const d = new Date(); d.setDate(d.getDate() - i);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const ds = `${y}-${m}-${dd}`;
                const label = `${m}-${dd}`;
                const val = this.transactions.filter(t => t.spendDate.startsWith(ds) && t.type === '支出').reduce((acc, t) => acc + this.getNormalizedAmount(t), 0);
                days.push({ date: ds, label, val });
            }

            const primaryColor = Theme.resolveColor('--action-primary-bg', '#424242');
            const secondaryColor = Theme.resolveColor('--chart-color-6', '#E5E5E5');

            this.barChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: days.map(d => d.label),
                    datasets: [{
                        data: days.map(d => d.val),
                        backgroundColor: days.map(d => d.date === this.selectedDateStr ? primaryColor : secondaryColor),
                        borderRadius: 4,
                        barThickness: 20
                    }]
                },
                options: {
                    responsive: true, animation: false, maintainAspectRatio: false,
                    scales: {
                        y: { display: false, beginAtZero: true },
                        x: {
                            grid: { display: false },
                            border: { display: false },
                            ticks: { font: { size: 10 }, padding: 4, color: Theme.resolveColor('--chart-legend-text') }
                        }
                    },
                    layout: { padding: { bottom: 0, left: 10, right: 10, top: 5 } },
                    plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    onClick: (e, el) => {
                        if (el.length > 0) {
                            if (e.native) e.native.stopPropagation();
                            this.selectedDateStr = days[el[0].index].date;
                        }
                    }
                }
            });
        }
    },
    beforeUnmount() { if (this.barChart) this.barChart.destroy(); },
    mounted() { this.selectedDateStr = this.todayStr; this.$nextTick(() => this.renderChart()); },
    watch: {
        isMyShareOnly() { this.renderChart(); },
        selectedDateStr() { this.renderChart(); },
        baseCurrency() { this.renderChart(); },
        transactions: { handler() { this.renderChart(); }, deep: true }
    }
};
