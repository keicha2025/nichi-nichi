export const AppHeader = {
    props: ['appMode', 'syncStatus', 'currentTab', 'historyFilter', 'effectiveRates', 'systemConfig'],
    components: { 'currency-select': window.CurrencySelect || {} }, // Ensure CurrencySelect is available globally or imported if module
    setup() {
        const { inject } = window.Vue;
        const baseCurrency = inject('baseCurrency');
        const setBaseCurrency = inject('setBaseCurrency');
        const toggleBaseCurrency = inject('toggleBaseCurrency');

        return { baseCurrency, setBaseCurrency, toggleBaseCurrency };
    },
    computed: {
        // activeCodes and activeOptions removed as they are no longer used in header
    },
    template: `
    <header class="w-full max-w-md mx-auto px-4 pt-6 pb-2 flex justify-between items-end border-b border-gray-50/50">
        <h1 class="text-lg font-light tracking-[0.3em] text-gray-300 uppercase">Nichi-Nichi</h1>
        <div class="flex items-center space-x-2">
            
            <!-- Currency Toggle (Simple) -->
            <button @click="toggleBaseCurrency" 
                    class="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full text-[10px] font-medium tracking-wider transition-colors">
                {{ baseCurrency }}
            </button>

            <!-- Filter Clear Button -->
            <div v-if="currentTab === 'history'"
                 @click="$emit('clear-filter')"
                 class="flex items-center space-x-1 text-[9px] bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full cursor-pointer transition-colors hover:bg-gray-200">
                <span class="material-symbols-rounded !text-xs">filter_list_off</span>
                <span>CLEAR</span>
            </div>

        </div>
    </header>
    `
};
