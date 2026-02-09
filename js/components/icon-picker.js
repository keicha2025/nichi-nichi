
export const IconPicker = {
    template: `
    <div v-if="visible" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300"
             @click="$emit('close')"></div>
             
        <!-- Modal Card -->
        <div class="relative bg-white w-full max-w-[320px] rounded-[2.5rem] shadow-2xl flex flex-col max-h-[70vh] animate-spring-up overflow-hidden border border-bdr-subtle">
            <!-- Header (edit-page style) -->
            <div class="flex justify-between items-center px-6 py-5 border-b border-bdr-subtle shrink-0">
                <span class="text-[10px] text-txt-secondary uppercase tracking-[0.3em] font-medium">選取圖示</span>
                <button @click="$emit('close')" class="text-[10px] text-txt-muted uppercase tracking-widest hover:text-txt-secondary transition-colors">取消</button>
            </div>
            
            <!-- Icon Grid Container -->
            <div class="flex-1 overflow-y-auto p-6 no-scrollbar">
                <div v-for="(group, name) in iconGroups" :key="name" class="mb-6 last:mb-0">
                    <h4 class="text-[9px] text-txt-muted font-medium mb-3 uppercase tracking-[0.2em] px-1">{{ name }}</h4>
                    <div class="grid grid-cols-4 gap-3">
                        <button v-for="icon in group" :key="icon" 
                            @click="$emit('select', icon)"
                            class="aspect-square rounded-2xl bg-bg-subtle flex items-center justify-center text-txt-secondary hover:bg-[var(--action-primary-bg)] hover:text-white active:scale-95 transition-all">
                            <span class="material-symbols-rounded text-xl">{{ icon }}</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Bottom Spacer -->
            <div class="h-4 shrink-0"></div>
        </div>
    </div>
    `,
    props: ['visible'],
    data() {
        return {
            iconGroups: {
                'General': ['home', 'star', 'favorite', 'verified', 'person', 'settings', 'search', 'info', 'check_circle', 'warning'],
                'Food & Drink': ['restaurant', 'lunch_dining', 'local_cafe', 'fastfood', 'local_bar', 'ramen_dining', 'bakery_dining', 'icecream', 'liquor', 'coffee'],
                'Transport': ['directions_bus', 'train', 'flight', 'directions_car', 'local_taxi', 'directions_bike', 'directions_boat', 'subway', 'tram', 'commute'],
                'Shopping': ['shopping_cart', 'shopping_bag', 'store', 'local_mall', 'credit_card', 'receipt', 'card_giftcard', 'checkroom', 'watch', 'diamond'],
                'Entertainment': ['movie', 'stadium', 'sports_esports', 'music_note', 'local_activity', 'fitness_center', 'casino', 'pool', 'travel_explore', 'palette'],
                'Life & Services': ['school', 'work', 'medical_services', 'local_hospital', 'pets', 'child_care', 'cleaning_services', 'build', 'wifi', 'local_laundry_service'],
                'Finance': ['payments', 'account_balance', 'attach_money', 'savings', 'currency_exchange', 'trending_up', 'pie_chart', 'wallet', 'qr_code'],
                'Income': ['monetization_on', 'paid', 'savings', 'add_card', 'currency_yen']
            }
        };
    }
};
