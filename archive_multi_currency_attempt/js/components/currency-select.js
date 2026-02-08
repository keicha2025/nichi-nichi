import { CURRENCIES, getSymbol } from '../utils/currency-utils.js';

export const CurrencySelect = {
    template: `
    <div class="relative inline-block" ref="container">
        <!-- Trigger Button -->
        <button @click.stop="toggleDropdown" 
                class="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-sm active:scale-95 transition-all">
            <span class="text-xs font-medium text-gray-700">{{ modelValue }}</span>
            <span class="material-symbols-rounded text-gray-400 text-[10px] transition-transform duration-300" :class="{'rotate-180': isOpen}">expand_more</span>
        </button>

        <!-- Dropdown Menu -->
        <teleport to="body">
            <div v-if="isOpen" class="fixed inset-0 z-[60]" @click="isOpen = false"></div>
            <div v-if="isOpen" 
                 :style="dropdownStyle"
                 class="fixed z-[70] bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-1.5 animate-spring-up min-w-[120px]">
                 <div class="max-h-[200px] overflow-y-auto no-scrollbar space-y-1">
                    <button v-for="curr in availableCurrencies" :key="curr.code"
                            @click="selectCurrency(curr.code)"
                            class="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div class="flex items-center space-x-2">
                            <span class="text-[10px] font-bold w-4 text-center text-gray-400 group-hover:text-gray-600">{{ curr.symbol }}</span>
                            <span class="text-xs font-medium text-gray-700">{{ curr.code }}</span>
                        </div>
                        <span v-if="modelValue === curr.code" class="material-symbols-rounded text-[10px] text-gray-800">check</span>
                    </button>
                 </div>
            </div>
        </teleport>
    </div>
    `,
    props: ['modelValue', 'options'], // options can be array of codes ['JPY', 'TWD']
    emits: ['update:modelValue'],
    data() {
        return {
            isOpen: false,
            top: 0,
            left: 0
        };
    },
    computed: {
        availableCurrencies() {
            // Use passed options or default to all CURRENCIES
            const codes = this.options || Object.keys(CURRENCIES);
            return codes.map(code => CURRENCIES[code] || { code, symbol: '$' });
        },
        dropdownStyle() {
            return {
                top: `${this.top}px`,
                left: `${this.left}px`
            };
        }
    },
    methods: {
        toggleDropdown() {
            this.isOpen = !this.isOpen;
            if (this.isOpen) this.$nextTick(() => this.updatePosition());
        },
        selectCurrency(code) {
            this.$emit('update:modelValue', code);
            this.isOpen = false;
        },
        updatePosition() {
            if (!this.$refs.container) return;
            const rect = this.$refs.container.getBoundingClientRect();
            this.top = rect.bottom + 8;
            this.left = rect.left;

            // Adjust if off-screen
            if (this.left + 120 > window.innerWidth) {
                this.left = window.innerWidth - 130;
            }
        }
    },
    watch: {
        isOpen(val) {
            if (val) {
                window.addEventListener('resize', this.updatePosition);
                window.addEventListener('scroll', this.updatePosition, true);
            } else {
                window.removeEventListener('resize', this.updatePosition);
                window.removeEventListener('scroll', this.updatePosition, true);
            }
        }
    }
};
