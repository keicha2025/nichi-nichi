export const AppHeader = {
    props: ['appMode', 'syncStatus', 'currentTab', 'historyFilter', 'showCurrencySwitcher'],
    setup() {
        const baseCurrency = window.Vue.inject('baseCurrency');
        const toggleBaseCurrency = window.Vue.inject('toggleBaseCurrency');
        return { baseCurrency, toggleBaseCurrency };
    },
    template: `
    <header class="w-full max-w-md mx-auto px-4 pt-6 pb-2 flex justify-between items-end border-b border-bdr-subtle/50">
        <h1 class="text-lg font-light tracking-[0.3em] text-txt-muted uppercase">Nichi-Nichi</h1>
        <div class="flex items-center space-x-2">
            <!-- Currency Toggle (Overview & Stats) -->
            <div v-if="['overview', 'stats'].includes(currentTab) && showCurrencySwitcher" @click="toggleBaseCurrency" 
                 class="flex items-center justify-center space-x-1 bg-bg-subtle px-3 py-1.5 rounded-full cursor-pointer transition-colors hover:bg-bg-subtle">
                <span class="text-[9px] font-bold text-txt-secondary">{{ baseCurrency }}</span>
                <span class="material-symbols-rounded text-[10px] text-txt-secondary">sync_alt</span>
            </div>

            <!-- Filter Clear Button -->
            <div v-if="currentTab === 'history'"
                 @click="$emit('clear-filter')"
                 class="flex items-center space-x-1 text-[9px] bg-bg-subtle text-txt-secondary px-3 py-1.5 rounded-full cursor-pointer transition-colors hover:bg-bg-subtle">
                <span class="material-symbols-rounded !text-xs">filter_list_off</span>
                <span>CLEAR</span>
            </div>

        </div>
    </header>
    `
};
