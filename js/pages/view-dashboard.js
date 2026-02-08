import { Theme } from '../theme.js';

export const ViewDashboard = {
    template: `
    <section class="space-y-6 py-4 animate-in fade-in pb-10">
        <!-- Layer 1: Information Container -->
        <div class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 space-y-4">
            <!-- User Name Header -->
            <div class="space-y-1 text-center">
                <h1 class="text-xl font-light text-gray-700 tracking-widest">
                    {{ config.user_name || '使用者' }} 的生活筆記
                </h1>
                <p class="text-[10px] text-gray-300 uppercase tracking-widest">唯讀模式 • 資料已去識別化</p>
            </div>

            <!-- Conditional Info Blocks -->
            <div class="space-y-3 pt-2">
                <!-- FX Rate (Show if multiple currencies OR rate is not default) -->
                <div v-if="shouldShowFxRate" class="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                    <span class="text-[11px] text-gray-400 font-medium">匯率設定 (JPY/TWD)</span>
                    <span class="text-sm font-light text-gray-600 tracking-wider">{{ Number(config.fx_rate || 0.22) }}</span>
                </div>

                <!-- Friends (Show if exists) -->
                <div v-if="friends && friends.length > 0" class="space-y-2">
                    <p class="text-[10px] text-gray-300 uppercase tracking-widest px-1">往來對象</p>
                    <div class="flex flex-wrap gap-2">
                        <span v-for="friend in friends" :key="friend" 
                              class="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[11px] tracking-wider border border-gray-100">
                            {{ friend }}
                        </span>
                    </div>
                </div>

                <!-- Projects (Show if exists) -->
                <div v-if="projects && projects.length > 0" class="space-y-2 pt-1">
                    <p class="text-[10px] text-gray-300 uppercase tracking-widest px-1">記帳專案</p>
                    <div class="space-y-2">
                        <div v-for="proj in projects" :key="proj.id" class="bg-gray-50 rounded-xl p-3 border border-gray-100 flex justify-between items-center">
                            <span class="text-xs text-gray-600 tracking-wider">{{ proj.name }}</span>
                            <span class="text-[10px] text-gray-400" v-if="proj.status === 'Archived'">已封存</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Layer 2: Navigation Shortcuts -->
        <div class="grid grid-cols-2 gap-4">
            <div @click="$emit('switch-tab', 'history')" class="bg-white p-5 rounded-[2rem] muji-shadow border border-gray-50 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 h-32">
                <span class="material-symbols-rounded text-gray-300 text-3xl">list_alt</span>
                <span class="text-sm text-gray-600 font-medium tracking-widest">交易明細</span>
            </div>
            <div @click="$emit('switch-tab', 'stats')" class="bg-white p-5 rounded-[2rem] muji-shadow border border-gray-50 active:scale-95 transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 h-32">
                <span class="material-symbols-rounded text-gray-300 text-3xl">pie_chart</span>
                <span class="text-sm text-gray-600 font-medium tracking-widest">統計分析</span>
            </div>
        </div>
        
        <!-- Layer 3: CTA to Guest Mode -->
        <div @click="enterGuestMode" class="bg-white p-6 rounded-[2rem] muji-shadow border border-gray-50 active:scale-95 transition-all cursor-pointer flex items-center justify-between">
            <div class="flex flex-col">
                <p class="text-sm text-gray-700 font-medium tracking-widest">打造你的專屬帳本</p>
                <p class="text-[10px] text-gray-300 mt-1">無需註冊 • 立即開始體驗</p>
            </div>
            <span class="material-symbols-rounded text-gray-300">arrow_forward</span>
        </div>
    </section>
    `,
    props: ['transactions', 'stats', 'friends', 'projects', 'config', 'hasMultipleCurrencies'],
    computed: {
        shouldShowFxRate() {
            // Show if multiple currencies exist OR if rate is weird (not 1 and not default 0.22 if we cared, but mostly just if relevant)
            // Implementation Plan said: "if multiple currencies OR fxRate != default"
            // Let's assume default is 0.22. But users might have different defaults.
            // Check if hasMultipleCurrencies is true.
            if (this.hasMultipleCurrencies) return true;

            // Or if rate is significantly different from a "standard" that implies it matters?
            // Actually, if there is only one currency (e.g. TWD), FX rate is irrelevant for display usually, UNLESS they have mixed legacy data.
            // User requirement: "如貨幣資料都相同（例如他的資料都是TWD）就不顯示" -> implies strict check on data.
            // So hasMultipleCurrencies is the main switch.
            return false;
        }
    },
    methods: {
        enterGuestMode() { window.location.href = 'index.html'; }
    }
};
