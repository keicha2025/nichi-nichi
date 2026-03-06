import { Theme } from '../theme.js';
import { AppSelect } from '../components/app-select.js';
import { API } from '../api.js';

export const StatsPage = {
    components: {
        'app-select': AppSelect
    },
    template: `
    <section class="space-y-6 py-4 animate-in fade-in pb-10">
        <!-- 1. 模式切換與統計總額 -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-default space-y-6">
            <!-- 1. 頂部控制列 -->
            <div class="flex-1 flex bg-bg-subtle rounded-xl p-1 mb-2">
                 <button @click="filterMode = 'normal'" :class="filterMode === 'normal' ? 'bg-white text-txt-primary shadow-sm' : 'text-txt-secondary'" class="flex-1 py-2 text-[10px] tracking-widest rounded-lg transition-all font-medium">一般模式</button>
                 <button @click="filterMode = 'project'" :class="filterMode === 'project' ? 'bg-white text-txt-primary shadow-sm' : 'text-txt-secondary'" class="flex-1 py-2 text-[10px] tracking-widest rounded-lg transition-all font-medium">專案分析</button>
            </div>

            <!-- 時間切換 (只在一般模式顯示) -->
            <div v-show="filterMode === 'normal'" class="flex bg-bg-subtle rounded-xl p-1 mb-2">
                <button @click="dateMode = 'month'" :class="dateMode === 'month' ? 'bg-white text-txt-primary shadow-sm' : 'text-txt-secondary'" class="flex-1 py-1.5 text-[10px] tracking-widest rounded-lg transition-all font-medium">按月</button>
                <button @click="dateMode = 'range'" :class="dateMode === 'range' ? 'bg-white text-txt-primary shadow-sm' : 'text-txt-secondary'" class="flex-1 py-1.5 text-[10px] tracking-widest rounded-lg transition-all font-medium">自訂</button>
                <button @click="dateMode = 'all'" :class="dateMode === 'all' ? 'bg-white text-txt-primary shadow-sm' : 'text-txt-secondary'" class="flex-1 py-1.5 text-[10px] tracking-widest rounded-lg transition-all font-medium">所有</button>
            </div>

            <!-- 一般模式下的日期選擇與過濾 -->
            <div v-show="filterMode === 'normal'" class="flex flex-col space-y-2">
               <input v-if="dateMode === 'month'" type="month" v-model="selectedMonth" class="text-xs bg-bg-subtle px-3 h-9 rounded-xl outline-none text-txt-primary border border-transparent focus:bg-white focus:border-bdr-default transition-all">
                <div v-else-if="dateMode === 'range'" class="flex flex-col space-y-2">
                    <div class="flex items-center space-x-2">
                        <span class="text-[9px] text-txt-muted w-4">從</span>
                        <input type="date" v-model="startDate" class="flex-1 text-xs bg-bg-subtle px-3 h-9 rounded-xl outline-none text-txt-primary border border-transparent focus:bg-white focus:border-bdr-default transition-all">
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="text-[9px] text-txt-muted w-4">至</span>
                        <input type="date" v-model="endDate" class="flex-1 text-xs bg-bg-subtle px-3 h-9 rounded-xl outline-none text-txt-primary border border-transparent focus:bg-white focus:border-bdr-default transition-all">
                    </div>
                </div>
               
               <!-- 過濾選項區塊 -->
               <div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 pt-1">
                   <!-- 個人份額切換 -->
                   <div class="flex items-center space-x-2">
                       <div @click="isMyShareOnly = !isMyShareOnly" class="w-4 h-4 rounded border border-bdr-outline flex items-center justify-center transition-colors cursor-pointer" :class="isMyShareOnly ? 'bg-action-primary-bg border-action-primary-bg' : 'bg-white'">
                           <span v-if="isMyShareOnly" class="material-symbols-rounded text-white text-[10px]">check</span>
                       </div>
                       <span @click="isMyShareOnly = !isMyShareOnly" class="text-[10px] text-txt-secondary cursor-pointer">僅顯示個人份額</span>
                   </div>
 
                   <!-- 排除專案選項 -->
                   <div class="flex items-center space-x-2">
                       <div @click="excludeProjects = !excludeProjects" class="w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer" :class="excludeProjects ? 'bg-action-primary-bg border-action-primary-bg' : 'bg-white border-bdr-outline'">
                           <span v-if="excludeProjects" class="material-symbols-rounded text-white text-[10px]">check</span>
                       </div>
                       <span @click="excludeProjects = !excludeProjects" class="text-[10px] text-txt-secondary cursor-pointer">不包含專案/旅行花費</span>
                   </div>
               </div>
            </div>

            <!-- 專案模式下的專案選擇 -->
             <div v-show="filterMode === 'project'" class="w-full pt-1 space-y-4">
                <app-select v-model="selectedProjectId" :options="projectSelectOptions" placeholder="未選取專案 (合併統計)"></app-select>

                 <!-- 個人份額切換 (專案模式) -->
                 <div class="flex items-center space-x-2 px-1">
                     <div @click="isMyShareOnly = !isMyShareOnly" class="w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer" :class="isMyShareOnly ? 'bg-action-primary-bg border-action-primary-bg' : 'bg-white border-bdr-outline'">
                         <span v-if="isMyShareOnly" class="material-symbols-rounded text-white text-[10px]">check</span>
                     </div>
                     <span @click="isMyShareOnly = !isMyShareOnly" class="text-[10px] text-txt-secondary cursor-pointer">僅顯示個人份額</span>
                 </div>
            </div>

            <div class="grid grid-cols-2 divide-x divide-bdr-default pt-2 px-2">
                 <div>
                     <p class="text-[9px] text-txt-muted uppercase tracking-tighter mb-1">Total ({{ baseCurrency }})</p>
                     <p class="text-xl font-light text-txt-primary">{{ getCurrencySymbol }} {{ formatNumber(totalPeriodAmount) }}</p>
                 </div>
                 <div class="px-4">
                     <p class="text-[9px] text-txt-muted uppercase tracking-tighter mb-1">Daily Avg</p>
                     <p class="text-xl font-light text-txt-primary">{{ getCurrencySymbol }} {{ formatNumber(dailyAverage) }}</p>
                 </div>
             </div>
        </div>

        <!-- 2. 圖表區域 -->
        <div @click="resetChartSelection" class="bg-white p-8 rounded-[2rem] muji-shadow border border-bdr-subtle cursor-pointer min-h-[460px]">
            <h3 class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium mb-4 text-center">Category Distribution</h3>
            <div class="relative w-full aspect-square max-w-[240px] mx-auto">
                <canvas ref="categoryChart" style="min-height: 200px;"></canvas>
            </div>
        </div>

        <!-- 3. 支付方式 -->
         <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-default space-y-5">
             <h3 class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium px-2">Payment Breakdown</h3>
             <div class="space-y-4">
                 <div v-for="(val, method) in paymentStats" :key="method" class="space-y-1.5 px-2">
                     <div class="flex justify-between items-baseline">
                         <span class="text-[10px] text-txt-secondary">{{ getPaymentName(method) }}</span>
                         <div class="flex space-x-2 items-baseline">
                             <span class="text-xs font-medium text-txt-primary">{{ getCurrencySymbol }} {{ formatNumber(val) }}</span>
                             <span class="text-[9px] text-txt-muted">{{ getIntPercentage(val, totalPeriodAmount) }}%</span>
                         </div>
                     </div>
                     <div class="w-full bg-bg-subtle h-1 rounded-full overflow-hidden">
                         <div class="bg-action-primary-bg h-full transition-all duration-1000" :style="{ width: getIntPercentage(val, totalPeriodAmount) + '%' }"></div>
                     </div>
                 </div>
             </div>
         </div>

        <!-- 4. 分類列表 -->
         <div class="space-y-3">
             <h3 class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium px-4">Categories</h3>
             <div v-for="cat in sortedCategoryData" :key="cat.id" 
                  @click.stop="$emit('drill-down', cat.id)" 
                  class="bg-white p-5 rounded-3xl muji-shadow flex justify-between items-center active:scale-[0.98] transition-transform">
                 <div class="flex items-center space-x-4">
                     <div class="w-10 h-10 bg-bg-subtle rounded-full flex items-center justify-center">
                         <span class="material-symbols-rounded text-txt-secondary text-xl">{{ cat.icon }}</span>
                     </div>
                     <div class="flex flex-col">
                         <span class="text-xs font-medium text-txt-primary">{{ cat.name }}</span>
                         <span class="text-[9px] text-txt-muted">{{ cat.count }}筆資料</span>
                     </div>
                 </div>
                 <div class="flex items-baseline space-x-2 text-right">
                     <span class="text-sm font-medium text-txt-primary">{{ getCurrencySymbol }} {{ formatNumber(cat.total) }}</span>
                     <span class="text-[10px] text-txt-muted">{{ getIntPercentage(cat.total, totalPeriodAmount) }}%</span>
                 </div>
             </div>
             </div>
         </div>

         <!-- 5. Word Cloud (Keywords) -->
         <div v-if="wordCloudData.length > 0" class="bg-white p-6 rounded-[2rem] muji-shadow border border-bdr-default space-y-4">
             <h3 class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium px-2">Common Keywords</h3>
            <div class="relative w-full aspect-square max-w-[300px] mx-auto">
                <span v-for="w in wordCloudData" :key="w.label" 
                      :style="{ 
                          fontSize: w.fontSize + 'px', 
                          opacity: w.opacity,
                          fontWeight: w.fontWeight,
                          color: w.color,
                          left: 'calc(50% + ' + w.x + 'px)',
                          top: 'calc(50% + ' + w.y + 'px)',
                          zIndex: w.level <= 2 ? 10 : 1
                      }"
                      class="word-cloud-tag absolute transform -translate-x-1/2 -translate-y-1/2">
                    {{ w.label }}
                </span>
             </div>
         </div>
    </section>
    `,
    props: ['transactions', 'categories', 'fxRate', 'paymentMethods', 'projects', 'currentUser'],
    setup() {
        const { inject, computed } = window.Vue;
        const baseCurrency = inject('baseCurrency');
        const toggleBaseCurrency = inject('toggleBaseCurrency');
        const getCurrencySymbol = computed(() => baseCurrency.value === 'JPY' ? '¥' : '$');
        return { baseCurrency, toggleBaseCurrency, getCurrencySymbol };
    },
    data() {
        const now = new Date();
        return {
            dateMode: 'month',
            selectedMonth: now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'),
            startDate: now.toISOString().slice(0, 10),
            endDate: now.toISOString().slice(0, 10),
            isMyShareOnly: true,
            categoryChart: null,
            centerAmount: 0,
            centerLabel: 'TOTAL',
            filterMode: 'normal', // normal, project
            selectedProjectId: '',
            excludeProjects: false
        };
    },
    computed: {
        activeProjects() { return (this.projects || []).filter(p => true); },
        projectSelectOptions() {
            const options = [
                { label: '未選取專案 (合併統計)', value: '' }
            ];
            this.activeProjects.forEach(p => {
                options.push({
                    label: `${p.name} (${this.getStatusLabel(p.status)})`,
                    value: p.id
                });
            });
            return options;
        },
        filteredList() {
            return this.transactions.filter(t => {
                if (t.type !== '支出') return false;

                if (this.filterMode === 'project') {
                    if (!this.selectedProjectId) {
                        return !!t.projectId; // 只回傳有 projectId 的
                    }
                    return t.projectId === this.selectedProjectId;
                } else {
                    const tDate = t.spendDate.slice(0, 10).replace(/\//g, '-');
                    let timeMatch = true;
                    if (this.dateMode === 'month') timeMatch = tDate.startsWith(this.selectedMonth);
                    else if (this.dateMode === 'range') timeMatch = (tDate >= this.startDate && tDate <= this.endDate);
                    else if (this.dateMode === 'all') timeMatch = true;

                    if (!timeMatch) return false;

                    // 排除專案支出
                    if (this.excludeProjects && t.projectId) return false;

                    return true;
                }
            });
        },
        processedList() {
            return this.filteredList.map(t => {
                const currency = t.currency || 'JPY'; // Use 'currency' field, default JPY
                const amount = Number(t.amount || 0);
                const personal = Number(t.personalShare || 0);
                const rate = Number(this.fxRate);

                let finalVal = 0;

                // 邏輯修正：直接依據 payer, personalShare, currency, fxRate計算
                const isMe = t.payer === '我' || (this.currentUser && t.payer === this.currentUser.uid);
                if (this.isMyShareOnly || !isMe) {
                    // 顯示個人份額 (來源貨幣 -> 目標貨幣)
                    if (this.baseCurrency === currency) {
                        finalVal = personal;
                    } else if (this.baseCurrency === 'JPY') { // TWD -> JPY
                        finalVal = personal / rate;
                    } else { // JPY -> TWD
                        finalVal = personal * rate;
                    }
                } else {
                    // 顯示總金額 (來源貨幣 -> 目標貨幣)
                    if (this.baseCurrency === currency) {
                        finalVal = amount;
                    } else if (this.baseCurrency === 'JPY') { // TWD -> JPY
                        finalVal = amount / rate;
                    } else { // JPY -> TWD
                        finalVal = amount * rate;
                    }
                }

                return { ...t, convertedAmount: finalVal };
            });
        },
        totalPeriodAmount() { return this.processedList.reduce((acc, cur) => acc + cur.convertedAmount, 0); },
        dailyAverage() {
            if (this.processedList.length === 0) return 0;

            // 方案 2：計算「記錄區間天數」 (Recorded Date Range)
            const dates = this.processedList.map(t => new Date(t.spendDate.split(' ')[0].replace(/\//g, '-')));
            const minRecordDate = new Date(Math.min(...dates));
            minRecordDate.setHours(0, 0, 0, 0);

            let calcStartDate = minRecordDate;
            let calcEndDate = new Date(Math.max(...dates));
            calcEndDate.setHours(0, 0, 0, 0);

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (this.dateMode === 'month') {
                const [year, month] = this.selectedMonth.split('-').map(Number);
                const monthEnd = new Date(year, month, 0);

                calcStartDate = minRecordDate;
                const isCurrentMonth = (now.getFullYear() === year && (now.getMonth() + 1) === month);
                calcEndDate = isCurrentMonth ? now : monthEnd;
            } else if (this.dateMode === 'range') {
                calcStartDate = minRecordDate;
                calcEndDate = new Date(this.endDate);
                calcEndDate.setHours(0, 0, 0, 0);
                if (calcEndDate > now) calcEndDate = now;
            } else if (this.dateMode === 'all') {
                // 所有模式下，從第一筆算到最後一筆（或今天）
                calcStartDate = minRecordDate;
                // calcEndDate 已經預設為 Math.max(...dates)
                if (calcEndDate > now) calcEndDate = now;
            }

            // 確保結束日期不早於開始日期 (防呆)
            if (calcEndDate < calcStartDate) calcEndDate = calcStartDate;

            const diff = calcEndDate - calcStartDate;
            const days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);

            return this.totalPeriodAmount / days;
        },
        paymentStats() {
            const stats = {};
            if (this.paymentMethods) {
                this.paymentMethods.forEach(pm => stats[pm.id] = 0);
            }
            this.processedList.forEach(t => {
                if (t.paymentMethod) {
                    if (stats[t.paymentMethod] === undefined) stats[t.paymentMethod] = 0;
                    stats[t.paymentMethod] += t.convertedAmount;
                }
            });
            return stats;
        },
        sortedCategoryData() {
            const map = {};
            this.processedList.forEach(t => {
                if (!map[t.categoryId]) {
                    const cat = this.categories.find(c => c.id === t.categoryId);
                    map[t.categoryId] = { id: t.categoryId, name: cat ? cat.name : '其他', icon: cat ? cat.icon : 'sell', total: 0, count: 0 };
                }
                map[t.categoryId].total += t.convertedAmount;
                map[t.categoryId].count++;
            });
            return Object.values(map).sort((a, b) => b.total - a.total);
        },
        wordCloudData() {
            if (this.processedList.length === 0) return [];

            // 1. Initial count of trimmed names (case-insensitive grouping)
            let groups = {}; // lowercase -> { originalCounts: { "Mos": 5 }, totalWeight: 8 }

            this.processedList.forEach(t => {
                const raw = (t.name || '').trim();
                if (!raw) return;
                const lower = raw.toLowerCase();

                if (!groups[lower]) {
                    groups[lower] = { originalCounts: {}, totalWeight: 0 };
                }
                groups[lower].originalCounts[raw] = (groups[lower].originalCounts[raw] || 0) + 1;
                groups[lower].totalWeight += 1;
            });

            // 2. Advanced Match: Merge longer strings into their substrings (e.g. "mos早餐" -> "mos")
            let keys = Object.keys(groups).sort((a, b) => a.length - b.length);
            let mergedKeys = new Set();

            for (let i = 0; i < keys.length; i++) {
                const parent = keys[i];
                if (mergedKeys.has(parent)) continue;

                for (let j = i + 1; j < keys.length; j++) {
                    const child = keys[j];
                    if (mergedKeys.has(child)) continue;

                    if (child.includes(parent)) {
                        // Merge child into parent
                        const childData = groups[child];
                        for (let form in childData.originalCounts) {
                            groups[parent].originalCounts[form] = (groups[parent].originalCounts[form] || 0) + childData.originalCounts[form];
                        }
                        groups[parent].totalWeight += childData.totalWeight;
                        mergedKeys.add(child);
                    }
                }
            }

            // 3. Finalize data and pick representative labels
            let result = [];
            for (let key in groups) {
                if (mergedKeys.has(key)) continue;

                const data = groups[key];
                // Pick most frequent original form
                let maxCount = -1;
                let bestLabel = '';
                for (let form in data.originalCounts) {
                    if (data.originalCounts[form] > maxCount) {
                        maxCount = data.originalCounts[form];
                        bestLabel = form;
                    }
                }

                result.push({
                    label: bestLabel,
                    weight: data.totalWeight
                });
            }

            if (result.length === 0) return [];

            // 4. Scaling (Dynamic range based on word count)
            const weights = result.map(r => r.weight);
            const minW = Math.min(...weights);
            const maxW = Math.max(...weights);

            const wordCount = result.length;
            let minS = 10, maxS = 24;
            if (wordCount < 10) {
                minS = 16; maxS = 36;
            } else if (wordCount < 20) {
                minS = 12; maxS = 28;
            }

            const baseList = result.map((r, idx) => {
                // Normalized weight (0 to 1)
                const norm = maxW > minW ? (r.weight - minW) / (maxW - minW) : 1;
                // Power scale for "pop" (0.6 makes high weights much larger)
                const powerNorm = Math.pow(norm, 0.6);

                const size = minS + powerNorm * (maxS - minS);

                // Level logic: Level 1 is strictly Top-1.
                let level = 5;
                const rank = (idx / wordCount);
                if (idx === 0) level = 1;
                else if (rank < 0.25) level = 2;
                else if (rank < 0.55) level = 3;
                else if (rank < 0.85) level = 4;

                // Scaling properties based on level/rank
                const fontWeight = level === 1 ? 600 : (level === 2 ? 500 : (level === 3 ? 400 : 300));
                const color = level <= 2 ? 'var(--txt-primary)' : 'var(--txt-secondary)';
                const opacity = level === 5 ? 0.45 : (level === 4 ? 0.75 : 1);

                return {
                    ...r,
                    level,
                    fontSize: Math.round(size),
                    fontWeight,
                    color,
                    opacity
                };
            });

            // 5. Archimedean Spiral Layout
            const placed = [];
            const sortedList = [...baseList].sort((a, b) => a.level - b.level || b.weight - a.weight);

            return sortedList.map((item, index) => {
                let x = 0;
                let y = 0;

                // Heuristic box size with level-based padding
                const padding = item.level <= 2 ? 14 : 26;
                const w = item.label.length * item.fontSize * 0.6 + padding;
                const h = item.fontSize + padding;

                let found = false;
                let t = 0; // theta for spiral
                const tStep = 0.12; // Spiral resolution
                const k = wordCount < 12 ? 1.6 : 1.0; // r = k * theta growth factor

                // Force Rank #1 (Level 1) to absolute center
                if (index === 0) {
                    x = 0;
                    y = 0;
                    found = true;
                }

                while (!found && t < 1200) {
                    // Archimedean Spiral: r = k * theta
                    const r = k * t;
                    const angle = t;

                    x = r * Math.cos(angle);
                    y = r * Math.sin(angle);

                    // Check for collisions with previously placed items
                    const collides = placed.some(p => {
                        return Math.abs(x - p.x) < (w + p.w) / 2 &&
                            Math.abs(y - p.y) < (h + p.h) / 2;
                    });

                    if (!collides) {
                        found = true;
                    } else {
                        t += tStep;
                    }
                }

                placed.push({ x, y, w, h });
                return { ...item, x, y };
            });
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
        resetChartSelection() { this.centerLabel = 'TOTAL'; this.updateCenterFromVisible(this.categoryChart); },
        updateCenterFromVisible(chart) {
            if (!chart) return;
            const datasets = chart.data.datasets[0];
            let visibleTotal = 0;
            datasets.data.forEach((val, index) => { if (chart.getDataVisibility(index)) visibleTotal += val; });
            this.centerAmount = visibleTotal;
        },
        renderChart() {
            this.$nextTick(() => {
                if (!this.$refs.categoryChart) return;
                const ctx = this.$refs.categoryChart.getContext('2d');
                if (this.categoryChart) this.categoryChart.destroy();
                const data = this.sortedCategoryData;
                if (!data || data.length === 0) return;

                this.centerAmount = this.totalPeriodAmount;
                this.centerLabel = 'TOTAL';

                this.categoryChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: data.map(d => d.name),
                        datasets: [{
                            data: data.map(d => d.total),
                            backgroundColor: Theme.getChartPalette(),
                            borderWidth: 0, hoverOffset: 15
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, cutout: '80%',
                        plugins: {
                            legend: {
                                display: true,
                                position: 'bottom',
                                labels: {
                                    boxWidth: 8,
                                    padding: 15,
                                    font: { size: 10, weight: '300' },
                                    color: Theme.resolveColor('--chart-legend-text')
                                },
                                onClick: (e, legendItem, legend) => {
                                    legend.chart.toggleDataVisibility(legendItem.index);
                                    legend.chart.update();
                                    this.resetChartSelection();
                                }
                            },
                            tooltip: { enabled: false }
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
                            if (!meta.data || !meta.data[0]) return;
                            const x = meta.data[0].x; const y = meta.data[0].y;
                            ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                            ctx.font = '300 10px Noto Sans TC'; ctx.fillStyle = Theme.resolveColor('--chart-txt-label');
                            ctx.fillText(this.centerLabel, x, y - 12);
                            ctx.font = '400 18px Noto Sans TC'; ctx.fillStyle = Theme.resolveColor('--chart-txt-value');
                            ctx.fillText(this.getCurrencySymbol + ' ' + this.formatNumber(this.centerAmount), x, y + 8);
                            ctx.restore();
                        }
                    }]
                });
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
        transactions: { handler() { this.$nextTick(() => this.renderChart()); }, deep: true },
        categories: { handler() { this.$nextTick(() => this.renderChart()); }, deep: true }
    }
};
