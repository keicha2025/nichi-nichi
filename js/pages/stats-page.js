import { Theme } from '../theme.js';

export const StatsPage = {
    template: `
    <section class="space-y-6 py-4 animate-in fade-in pb-10">
        <!-- 1. 模式切換與統計總額 -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-6">
            <div class="grid grid-cols-1 gap-2 p-1 bg-gray-100 rounded-xl relative">
                <div class="flex p-0.5 space-x-1">
                    <button @click="isMyShareOnly = false" :class="!isMyShareOnly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'" class="flex-1 py-1 text-[8px] rounded-lg transition-all font-bold">總和模式</button>
                    <button @click="isMyShareOnly = true" :class="isMyShareOnly ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'" class="flex-1 py-1 text-[8px] rounded-lg transition-all font-bold">個人份額</button>
                </div>
                
                <!-- Currency Toggle Added -->
                <div @click="toggleBaseCurrency" class="absolute -top-7 right-2 flex items-center justify-center space-x-1 bg-gray-100 px-3 py-1.5 rounded-full cursor-pointer transition-colors hover:bg-gray-200">
                    <span class="text-[9px] font-bold text-gray-400">{{ baseCurrency.value }}</span>
                    <span class="material-symbols-rounded text-[10px] text-gray-400">sync_alt</span>
                </div>
            </div>

            <!-- 1. 頂部控制列 (Reordered) -->
            <div class="flex bg-gray-50 rounded-xl p-1 mb-2">
                 <button @click="filterMode = 'normal'" :class="filterMode === 'normal' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'" class="flex-1 py-2 text-[10px] tracking-widest rounded-lg transition-all font-medium">一般模式</button>
                 <button @click="filterMode = 'project'" :class="filterMode === 'project' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'" class="flex-1 py-2 text-[10px] tracking-widest rounded-lg transition-all font-medium">專案分析</button>
            </div>

            <!-- 時間切換 (只在一般模式顯示) -->
            <div v-show="filterMode === 'normal'" class="flex bg-gray-50 rounded-xl p-1 mb-2">
                <button @click="dateMode = 'month'" :class="dateMode === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'" class="flex-1 py-1.5 text-[10px] tracking-widest rounded-lg transition-all font-medium">按月份</button>
                <button @click="dateMode = 'range'" :class="dateMode === 'range' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'" class="flex-1 py-1.5 text-[10px] tracking-widest rounded-lg transition-all font-medium">自訂區間</button>
            </div>

                <!-- 一般模式下的日期選擇與過濾 -->
                <div v-show="filterMode === 'normal'" class="flex flex-col space-y-2">
                   <input v-if="dateMode === 'month'" type="month" v-model="selectedMonth" class="text-xs bg-gray-50 px-3 py-2 rounded-xl outline-none text-gray-600 border border-transparent focus:bg-white focus:border-gray-200 transition-all">
                   <div v-else class="grid grid-cols-2 gap-3">
                       <input type="date" v-model="startDate" class="text-[10px] bg-gray-50 px-2 py-1 rounded-lg outline-none text-gray-600">
                       <input type="date" v-model="endDate" class="text-[10px] bg-gray-50 px-2 py-1 rounded-lg outline-none text-gray-600">
                   </div>
                   <!-- 排除專案支出選項 -->
                   <div class="flex items-center space-x-2 px-1 pt-1">
                       <div @click="excludeProjects = !excludeProjects" class="w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer" :class="excludeProjects ? 'bg-gray-700 border-gray-700' : 'bg-white border-gray-300'">
                           <span v-if="excludeProjects" class="material-symbols-rounded text-white text-[10px]">check</span>
                       </div>
                       <span @click="excludeProjects = !excludeProjects" class="text-[10px] text-gray-400 cursor-pointer">不包含專案/旅行花費</span>
                   </div>
                </div>

                <!-- 專案模式下的專案選擇 -->
                 <div v-show="filterMode === 'project'" class="w-full pt-1">
                    <select v-model="selectedProjectId" class="w-full text-xs bg-gray-50 px-3 py-2 rounded-xl outline-none text-gray-600 border border-transparent focus:bg-white focus:border-gray-200 transition-all">
                        <option value="">未選取專案 (合併統計)</option>
                        <option v-for="p in activeProjects" :key="p.id" :value="p.id">{{ p.name }} ({{ getStatusLabel(p.status) }})</option>
                    </select>
                </div>


            <div class="grid grid-cols-2 divide-x divide-gray-50 pt-2 px-2">
                <div>
                    <p class="text-[9px] text-gray-300 uppercase tracking-tighter mb-1">Total ({{ baseCurrency.value }})</p>
                    <p class="text-xl font-light text-gray-700">{{ getCurrencySymbol }} {{ formatNumber(totalAmount) }}</p>
                </div>
                <div class="px-4">
                    <p class="text-[9px] text-gray-300 uppercase tracking-tighter mb-1">Daily Avg</p>
                    <p class="text-xl font-light text-gray-700">{{ getCurrencySymbol }} {{ formatNumber(dailyAverage) }}</p>
                </div>
            </div>
        </div>

        <!-- 2. 圖表區域 -->
        <div @click="resetChartSelection" class="bg-white p-8 rounded-[2rem] muji-shadow border border-gray-50 cursor-pointer">
            <h3 class="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-8 text-center">Category Distribution</h3>
            <div class="relative w-full aspect-square max-w-[260px] mx-auto">
                <canvas ref="categoryChart"></canvas>
            </div>
        </div>

        <!-- 3. 支付方式 -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-5">
            <h3 class="text-[10px] text-gray-400 uppercase tracking-widest font-medium px-2">Payment Breakdown</h3>
            <div class="space-y-4">
                <div v-for="(val, method) in paymentStats" :key="method" class="space-y-1.5 px-2">
                    <div class="flex justify-between items-baseline">
                        <span class="text-[10px] text-gray-500">{{ getPaymentName(method) }}</span>
                        <div class="flex space-x-2 items-baseline">
                            <span class="text-xs font-medium text-gray-700">{{ getCurrencySymbol }} {{ formatNumber(val) }}</span>
                            <span class="text-[9px] text-gray-300">{{ getIntPercentage(val, totalAmount) }}%</span>
                        </div>
                    </div>
                    <div class="w-full bg-gray-50 h-1 rounded-full overflow-hidden">
                        <div class="bg-gray-300 h-full transition-all duration-1000" :style="{ width: getIntPercentage(val, totalAmount) + '%' }"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 4. 分類列表 -->
        <div class="space-y-3">
            <h3 class="text-[10px] text-gray-400 uppercase tracking-widest font-medium px-4">Categories</h3>
            <div v-for="cat in processedList" :key="cat.id" 
                 @click.stop="$emit('drill-down', cat.id)" 
                 class="bg-white p-5 rounded-3xl muji-shadow flex justify-between items-center active:scale-[0.98] transition-transform">
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                        <span class="material-symbols-rounded text-gray-400 text-xl">{{ cat.icon }}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-xs font-medium text-gray-700">{{ cat.name }}</span>
                        <!-- note: cat.count not available in aggregated processedList easily unless we add it back. Let's assume processedList has it or remove line -->
                    </div>
                </div>
                <div class="flex items-baseline space-x-2 text-right">
                    <span class="text-sm font-medium text-gray-700">{{ getCurrencySymbol }} {{ formatNumber(cat.amount) }}</span>
                    <span class="text-[10px] text-gray-300">{{ getIntPercentage(cat.amount, totalAmount) }}%</span>
                </div>
            </div>
        </div>
    </section>
    `,
    props: ['transactions', 'categories', 'fxRate', 'paymentMethods', 'projects'],
    setup() {
        const baseCurrency = window.Vue.inject('baseCurrency');
        const toggleBaseCurrency = window.Vue.inject('toggleBaseCurrency');
        return { baseCurrency, toggleBaseCurrency };
    },
    data() {
        // Removed local baseCurrency
        const now = new Date();
        return {
            dateMode: 'month',
            selectedMonth: now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'),
            startDate: now.toISOString().slice(0, 10),
            endDate: now.toISOString().slice(0, 10),
            isMyShareOnly: true,
            chartInstance: null,
            centerAmount: 0,
            centerLabel: 'TOTAL',
            filterMode: 'normal',
            selectedProjectId: '',
            excludeProjects: false
        };
    },
    computed: {
        getCurrencySymbol() { return this.baseCurrency.value === 'JPY' ? '¥' : '$'; },
        activeProjects() { return (this.projects || []).filter(p => true); },
        filteredList() {
            // ... same filter logic from line 140
            return this.transactions.filter(t => {
                if (t.type !== '支出') return false;

                if (this.filterMode === 'project') {
                    if (!this.selectedProjectId) {
                        return !!t.projectId;
                    }
                    return t.projectId === this.selectedProjectId;
                } else {
                    const tDate = t.spendDate.split(' ')[0].replace(/\//g, '-');
                    const timeMatch = (this.dateMode === 'month') ? tDate.startsWith(this.selectedMonth) : (tDate >= this.startDate && tDate <= this.endDate);
                    if (!timeMatch) return false;

                    if (this.excludeProjects && t.projectId) return false;

                    return true;
                }
            });
        },
        processedList() {
            // Aggregate by Category
            const map = {};
            const rate = Number(this.fxRate) || 0.22;

            this.filteredList.forEach(t => {
                const currency = t.originalCurrency || t.currency || 'JPY';
                let val = 0;

                if (this.isMyShareOnly || t.payer !== '我') {
                    val = Number(t.personalShare || 0);
                } else {
                    if (t.amount !== undefined && t.amount !== null) val = Number(t.amount);
                    else if (currency === 'TWD') val = Number(t.amountTWD || 0);
                    else val = Number(t.amountJPY || 0);
                }

                let finalVal = 0;
                // Convert to BASE currency
                // Note: filteredList items are raw transactions. 
                // We need to accumulate them.

                if (this.baseCurrency.value === 'JPY') {
                    if (currency === 'TWD') finalVal = val / rate;
                    else finalVal = val;
                } else { // TWD
                    if (currency === 'JPY') finalVal = val * rate;
                    else finalVal = val;
                }

                if (!map[t.categoryId]) map[t.categoryId] = 0;
                map[t.categoryId] += finalVal;
            });

            return Object.keys(map).map(id => {
                const cat = this.categories.find(c => c.id === id);
                return {
                    id: id,
                    name: cat ? cat.name : 'Unknown',
                    icon: cat ? cat.icon : 'help',
                    amount: map[id]
                };
            }).sort((a, b) => b.amount - a.amount);
        },
        totalAmount() {
            return this.processedList.reduce((acc, item) => acc + item.amount, 0);
        },
        dailyAverage() {
            if (this.processedList.length === 0) return 0;
            let days = 1;
            if (this.dateMode === 'month') {
                const parts = this.selectedMonth.split('-');
                const now = new Date();
                const isCurrent = (now.getFullYear() === parseInt(parts[0]) && (now.getMonth() + 1) === parseInt(parts[1]));
                days = isCurrent ? now.getDate() : new Date(parts[0], parts[1], 0).getDate();
            } else {
                const diff = new Date(this.endDate) - new Date(this.startDate);
                days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
            }
            return this.totalAmount / days;
        },
        paymentStats() {
            const stats = {};
            if (this.paymentMethods) this.paymentMethods.forEach(pm => stats[pm.id] = 0);
            // We need raw transactions with converted amounts for payment stats
            // But processedList is aggregated. 
            // We need to re-derive from filteredList or add a new computed 'convertedList'.
            // For now, let's just re-map filteredList here to get converted amounts since we didn't add convertedList computed property globally in this file yet (it was in my previous thought but I might have missed adding it).
            // Actually, in the code view, I 'processedList' is AGGREGATED.
            // So paymentStats using 'processedList' (line 229 in view) is WRONG if processedList is categories.
            // I need to iterate over filteredList and convert.

            const rate = Number(this.fxRate) || 0.22;
            this.filteredList.forEach(t => {
                const currency = t.originalCurrency || t.currency || 'JPY';
                let val = 0;
                if (this.isMyShareOnly || t.payer !== '我') {
                    val = Number(t.personalShare || 0);
                } else {
                    if (t.amount !== undefined && t.amount !== null) val = Number(t.amount);
                    else if (currency === 'TWD') val = Number(t.amountTWD || 0);
                    else val = Number(t.amountJPY || 0);
                }

                let finalVal = 0;
                if (this.baseCurrency.value === 'JPY') {
                    if (currency === 'TWD') finalVal = val / rate;
                    else finalVal = val;
                } else {
                    if (currency === 'JPY') finalVal = val * rate;
                    else finalVal = val;
                }

                if (t.paymentMethod) {
                    if (stats[t.paymentMethod] === undefined) stats[t.paymentMethod] = 0;
                    stats[t.paymentMethod] += finalVal;
                }
            });
            return stats;
        },
        sortedCategoryData() {
            // processedList is already sorted and formatted for categories
            return this.processedList;
        }
    },
    methods: {
        getPaymentName(id) { const pm = this.paymentMethods.find(p => p.id === id); return pm ? pm.name : id; },
        getStatusLabel(status) {
            const map = { 'Active': '進行中', 'Archived': '已封存' };
            return map[status] || status;
        },
        formatNumber(num) { return new Intl.NumberFormat().format(Math.round(num || 0)); },
        getIntPercentage(val, total) { return total > 0 ? Math.round((val / total) * 100) : 0; },
        resetChartSelection() { this.centerLabel = 'TOTAL'; this.updateCenterFromVisible(this.chartInstance); },
        updateCenterFromVisible(chart) {
            if (!chart) return;
            const datasets = chart.data.datasets[0];
            let visibleTotal = 0;
            datasets.data.forEach((val, index) => { if (chart.getDataVisibility(index)) visibleTotal += val; });
            this.centerAmount = visibleTotal;
        },
        renderChart() {
            const ctx = this.$refs.categoryChart?.getContext('2d');
            if (!ctx) return;
            if (this.chartInstance) this.chartInstance.destroy();
            const data = this.sortedCategoryData;
            this.centerAmount = this.totalPeriodAmount;
            this.centerLabel = 'TOTAL';
            this.chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(d => d.name),
                    datasets: [{
                        data: data.map(d => d.total),
                        backgroundColor: Theme.colors.chart,
                        borderWidth: 0, hoverOffset: 15
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '80%',
                    plugins: {
                        legend: {
                            position: 'bottom', labels: { boxWidth: 12, padding: 20, font: { size: 10, weight: '300' } },
                            onClick: (e, legendItem, legend) => {
                                legend.chart.toggleDataVisibility(legendItem.index);
                                legend.chart.update();
                                this.resetChartSelection();
                            }
                        }, tooltip: { enabled: false }
                    },
                    onClick: (evt, elements) => {
                        if (elements.length > 0) {
                            if (evt.native) evt.native.stopPropagation();
                            const idx = elements[0].index;
                            this.centerAmount = data[idx].total;
                            this.centerLabel = data[idx].name;
                        } else { this.resetChartSelection(); }
                    }
                },
                plugins: [{
                    id: 'centerText',
                    beforeDraw: (chart) => {
                        const { ctx } = chart; const meta = chart.getDatasetMeta(0);
                        if (!meta.data[0]) return;
                        const x = meta.data[0].x; const y = meta.data[0].y;
                        ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                        ctx.font = '300 10px Noto Sans TC'; ctx.fillStyle = Theme.colors.textSecondary;
                        ctx.fillText(this.centerLabel, x, y - 12);
                        ctx.font = '400 18px Noto Sans TC'; ctx.fillStyle = Theme.colors.primary;
                        ctx.fillText(this.getCurrencySymbol + ' ' + this.formatNumber(this.centerAmount), x, y + 8);
                        ctx.restore();
                    }
                }]
            });
        }
    },
    mounted() { this.$nextTick(() => this.renderChart()); },
    watch: {
        baseCurrency() { this.$nextTick(() => this.renderChart()); },
        isMyShareOnly() { this.$nextTick(() => this.renderChart()); },
        dateMode() { this.$nextTick(() => this.renderChart()); },
        selectedMonth() { this.$nextTick(() => this.renderChart()); },
        startDate() { this.$nextTick(() => this.renderChart()); },
        endDate() { this.$nextTick(() => this.renderChart()); },
        filterMode() { this.$nextTick(() => this.renderChart()); },
        excludeProjects() { this.$nextTick(() => this.renderChart()); },
        selectedProjectId() { this.$nextTick(() => this.renderChart()); },
        transactions: { handler() { this.$nextTick(() => this.renderChart()); }, deep: true }
    }
};
