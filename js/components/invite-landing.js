export const InviteLanding = {
    template: `
    <div class="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center px-6 overflow-hidden touch-none select-none">
        <!-- Background Elements -->
        <div class="absolute top-[10%] left-[-10%] w-64 h-64 bg-bg-subtle rounded-full blur-3xl opacity-50"></div>
        <div class="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-bg-subtle rounded-full blur-3xl opacity-50"></div>

        <div class="w-full max-w-sm flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-1000">
            <!-- Content Card -->
            <div class="w-full bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 muji-shadow border border-bdr-subtle/50 text-center space-y-6">
                <div class="space-y-2">
                    <p class="text-[10px] text-txt-muted uppercase tracking-[0.3em] font-sans">Invitation</p>
                    <h2 class="text-xl font-light text-txt-primary tracking-wide">
                        <span class="font-medium text-[var(--action-primary-bg)]">{{ inviterName }}</span> 
                        邀請您一起使用日日記
                    </h2>
                </div>

                <div class="space-y-4 py-4">
                    <div class="flex items-start space-x-3 text-left">
                        <span class="material-symbols-rounded text-lg text-txt-secondary mt-0.5">group</span>
                        <div>
                            <p class="text-[11px] font-medium text-txt-primary">輕鬆分帳</p>
                            <p class="text-[9px] text-txt-secondary leading-relaxed">與好友連結，自動計算代墊金額與債務。</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-3 text-left">
                        <span class="material-symbols-rounded text-lg text-txt-secondary mt-0.5">currency_exchange</span>
                        <div>
                            <p class="text-[11px] font-medium text-txt-primary">雙幣管理</p>
                            <p class="text-[9px] text-txt-secondary leading-relaxed">完美支援日圓與台幣，旅行與代購最速記錄。</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-3 text-left">
                        <span class="material-symbols-rounded text-lg text-txt-secondary mt-0.5">cloud_done</span>
                        <div>
                            <p class="text-[11px] font-medium text-txt-primary">雲端同步</p>
                            <p class="text-[9px] text-txt-secondary leading-relaxed">記帳資料自動備份至雲端，多裝置無縫使用。</p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3 pt-4">
                    <button @click="$emit('login')" class="w-full bg-[var(--action-primary-bg)] text-white py-4 rounded-2xl text-[11px] font-medium tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2">
                        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>透過 Google 帳號加入</span>
                    </button>
                    
                    <button @click="openGuide" class="w-full bg-white text-txt-secondary py-3.5 rounded-2xl text-[10px] font-medium tracking-[0.1em] border border-bdr-subtle active:bg-bg-subtle transition-colors">
                        快速上手指南
                    </button>
                </div>
            </div>

            <!-- Logo as Signature -->
            <div class="flex flex-col items-center pt-4">
                <img src="./logo-header.png" alt="Nichi-Nichi" class="h-9">
            </div>
        </div>
    </div>
    `,
    props: ['inviterName', 'token'],
    methods: {
        openGuide() {
            window.location.href = 'guide.html';
        }
    }
};
