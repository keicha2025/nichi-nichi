export const AppFooter = {
    props: ['currentTab', 'appMode'],
    template: `
    <footer class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-bdr-subtle px-6 pb-10 pt-4 z-50">
        <div class="max-w-md mx-auto flex items-center justify-between">
            <button v-for="tab in tabs" :key="tab" @click="$emit('update:currentTab', tab)"
                    v-show="shouldShowTab(tab)"
                    :class="[currentTab === tab ? 'text-txt-primary' : 'text-txt-muted', tab === 'add' ? 'add-btn-wrap' : 'nav-item']"
                    class="transition-colors duration-200">
                <div v-if="tab === 'add'" class="add-btn active:scale-90 transition-transform shadow-md">
                    <span class="material-symbols-rounded !text-3xl">add</span>
                </div>
                <span v-else class="material-symbols-rounded text-2xl">{{ getTabIcon(tab) }}</span>
            </button>
        </div>
    </footer>
    `,
    data() {
        return {
            tabs: ['overview', 'history', 'add', 'stats', 'settings']
        };
    },
    methods: {
        shouldShowTab(tab) {
            if (this.appMode === 'VIEWER') {
                if (tab === 'add' || tab === 'settings') return false;
            }
            return true;
        },
        getTabIcon(tab) {
            const icons = {
                overview: 'grid_view',
                history: 'calendar_month', // or history
                stats: 'pie_chart',
                settings: 'settings',
                add: 'add'
            };
            return icons[tab] || 'circle';
        }
    }
};
