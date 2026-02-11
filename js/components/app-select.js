export const AppSelect = {
    template: `
    <div class="relative w-full" ref="container">
        <!-- Trigger -->
        <div @click="isOpen = !isOpen" 
             class="w-full bg-bg-subtle px-3 h-9 rounded-xl flex items-center justify-between cursor-pointer border border-transparent transition-all hover:bg-bg-subtle"
             :class="{'bg-white border-bdr-subtle shadow-sm': isOpen}">
            <span class="text-xs" :class="selectedLabel ? 'text-txt-primary' : 'text-txt-secondary'">
                {{ selectedLabel || placeholder || '請選擇' }}
            </span>
            <span class="material-symbols-rounded text-txt-secondary text-sm transition-transform duration-300" :class="{'rotate-180': isOpen}">
                expand_more
            </span>
        </div>

        <!-- Dropdown Menu -->
        <teleport to="body">
            <div v-if="isOpen" 
                 class="fixed inset-0 z-[60]" 
                 @click="isOpen = false">
            </div>
            <div v-if="isOpen" 
                 :style="dropdownStyle"
                 class="fixed z-[70] min-w-[160px] bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-bdr-default p-2 animate-spring-up overflow-hidden">
                <div class="max-h-[240px] overflow-y-auto no-scrollbar">
                    <div v-for="opt in options" :key="opt.value"
                         @click="selectOption(opt)"
                         class="px-4 py-3 rounded-xl hover:bg-bg-subtle/50 transition-colors cursor-pointer flex items-center space-x-2 group">
                        <span class="text-xs transition-colors" :class="modelValue === opt.value ? 'text-txt-primary font-bold' : 'text-txt-secondary'">
                            {{ opt.label }}
                        </span>
                        <span v-if="modelValue === opt.value" class="material-symbols-rounded text-txt-secondary text-sm ml-auto">check</span>
                    </div>
                </div>
            </div>
        </teleport>
    </div>
    `,
    props: ['modelValue', 'options', 'placeholder'],
    emits: ['update:modelValue'],
    data() {
        return {
            isOpen: false,
            top: 0,
            left: 0,
            width: 0
        };
    },
    computed: {
        selectedLabel() {
            const opt = this.options.find(o => o.value === this.modelValue);
            return opt ? opt.label : '';
        },
        dropdownStyle() {
            return {
                top: `${this.top}px`,
                left: `${this.left}px`,
                width: `${this.width}px`
            };
        }
    },
    methods: {
        selectOption(opt) {
            this.$emit('update:modelValue', opt.value);
            this.isOpen = false;
        },
        updatePosition() {
            if (!this.$refs.container) return;
            const rect = this.$refs.container.getBoundingClientRect();
            this.top = rect.bottom + 8;
            this.left = rect.left;
            this.width = rect.width;

            // Ensure it doesn't go off screen
            const padding = 16;
            if (this.left + this.width > window.innerWidth - padding) {
                this.left = window.innerWidth - this.width - padding;
            }
        }
    },
    watch: {
        isOpen(val) {
            if (val) {
                this.updatePosition();
                window.addEventListener('resize', this.updatePosition);
                window.addEventListener('scroll', this.updatePosition, true);
            } else {
                window.removeEventListener('resize', this.updatePosition);
                window.removeEventListener('scroll', this.updatePosition, true);
            }
        }
    }
};
