import { API } from '../api.js';

export const ProjectLanding = {
    template: `
    <div class="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center px-6 overflow-hidden touch-none select-none">
        
        <!-- Background Elements (Consistent with InviteLanding) -->
        <div class="absolute top-[10%] left-[-10%] w-64 h-64 bg-bg-subtle rounded-full blur-3xl opacity-50"></div>
        <div class="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-bg-subtle rounded-full blur-3xl opacity-50"></div>

        <div class="w-full max-w-sm flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-1000 z-10 w-full">
            
            <!-- Loading State -->
            <div v-if="loading" class="flex flex-col items-center justify-center space-y-4 py-8">
                <div class="w-8 h-8 border-2 border-bdr-subtle border-t-[var(--action-primary-bg)] rounded-full animate-spin"></div>
                <p class="text-[10px] tracking-widest text-txt-muted uppercase">專案資訊讀取中...</p>
            </div>

            <!-- Content Card -->
            <div v-else-if="project" class="w-full bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 muji-shadow border border-bdr-subtle/50 text-center space-y-6">
                
                <div class="space-y-2">
                    <p class="text-[10px] text-txt-muted uppercase tracking-[0.3em] font-sans">Project Invitation</p>
                    <h2 class="text-xl font-light text-txt-primary tracking-wide">
                        <span class="font-medium text-[var(--action-primary-bg)]">{{ displayHostName }}</span> 
                        邀請您加入計畫
                    </h2>
                </div>

                <!-- Project Info highlight -->
                 <div class="bg-bg-subtle/50 p-6 rounded-3xl border border-bdr-subtle/30 space-y-3">
                    <span class="material-symbols-rounded text-[var(--action-primary-bg)] text-3xl">flight_takeoff</span>
                    <h3 class="text-2xl font-light text-txt-primary tracking-tight">{{ project.name }}</h3>
                    <div class="flex items-center justify-center space-x-2 text-[11px] text-txt-secondary">
                        <span class="material-symbols-rounded text-sm">calendar_today</span>
                        <span>{{ project.startDate }} ~ {{ project.endDate }}</span>
                    </div>
                </div>

                <div class="space-y-4 py-4">
                    <div class="flex items-start space-x-3 text-left">
                        <span class="material-symbols-rounded text-lg text-txt-secondary mt-0.5">sync</span>
                        <div>
                            <p class="text-[11px] font-medium text-txt-primary">實時同步紀錄</p>
                            <p class="text-[9px] text-txt-secondary leading-relaxed">紀錄將與 {{ displayHostName }} 共享，即時結算不卡關。</p>
                        </div>
                    </div>
                    <div class="flex items-start space-x-3 text-left">
                        <span class="material-symbols-rounded text-lg text-txt-secondary mt-0.5">group</span>
                        <div>
                            <p class="text-[11px] font-medium text-txt-primary">建立好友鏈結</p>
                            <p class="text-[9px] text-txt-secondary leading-relaxed">自動將對方加入好友，方便未來各項分帳管理。</p>
                        </div>
                    </div>
                </div>

                <!-- Action Button -->
                <div class="space-y-3 pt-4">
                    <button @click="handleJoin" :disabled="joining" 
                            class="w-full bg-[var(--action-primary-bg)] text-white py-4 rounded-2xl text-[11px] font-medium tracking-[0.2em] shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2">
                        <span v-if="joining" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <svg v-else-if="!user" class="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>{{ user ? '確認加入並建立鏈結' : '透過 Google 帳號加入' }}</span>
                    </button>
                    
                    <button @click="openGuide" class="w-full bg-white text-txt-secondary py-3.5 rounded-2xl text-[10px] font-medium tracking-[0.1em] border border-bdr-subtle active:bg-bg-subtle transition-colors">
                        快速上手指南
                    </button>

                    <button @click="$emit('close')" class="w-full py-2 text-[9px] text-txt-muted uppercase tracking-[0.2em] active:opacity-60 transition-opacity">
                        稍後再說
                    </button>
                </div>
            </div>

            <!-- Error State -->
            <div v-else class="w-full bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 muji-shadow border border-bdr-subtle/50 text-center space-y-4">
                <span class="material-symbols-rounded text-4xl text-txt-muted">link_off</span>
                <p class="text-xs text-txt-secondary">連結無效或計畫已關閉</p>
                <button @click="$emit('close')" class="text-[10px] text-[var(--action-primary-bg)] uppercase tracking-widest font-bold underline decoration-2 underline-offset-4">返回首頁</button>
            </div>

            <!-- Logo -->
            <div class="flex flex-col items-center pt-2 opacity-80">
                <img src="./logo-header.png" alt="Nichi-Nichi" class="h-8">
            </div>

        </div>
    </div>
    `,
    props: ['hostId', 'projectId', 'inviterName', 'token'],
    emits: ['close', 'joined', 'login'],
    setup(props, { emit }) {
        const { ref, computed, onMounted, inject } = window.Vue;
        const dialog = inject('dialog');
        const project = ref(null);
        const loading = ref(false);
        const joining = ref(false);
        const user = ref(null);
        const fetchedHostName = ref(null);

        const displayHostName = computed(() => fetchedHostName.value || props.inviterName || '好友');

        onMounted(() => {
            // Listen for auth state
            API.onAuthStateChanged(u => {
                user.value = u;
                if (u) fetchProjectInfo();
            });
            // Initial fetch
            fetchProjectInfo();
        });

        const fetchProjectInfo = async () => {
            if (!props.hostId || !props.projectId) return;
            loading.value = true;
            try {
                // Pre-validation: check token before showing project info
                const userDoc = await API.getDoc(API.doc(API.db, 'users', props.hostId));
                if (userDoc.exists()) {
                    const hostData = userDoc.data();
                    if (hostData.config?.invite_token !== props.token) {
                        console.warn("[ProjectLanding] Invalid token");
                        loading.value = false;
                        return; // Will show error state
                    }
                    fetchedHostName.value = hostData.config?.user_name || props.inviterName || '';
                }

                console.log("[ProjectLanding] Fetching Project:", `users/${props.hostId}/projects/${props.projectId}`);
                const snap = await API.getDoc(API.doc(API.db, 'users', props.hostId, 'projects', props.projectId));
                if (snap.exists() && snap.data().collaborationEnabled) {
                    project.value = { ...snap.data(), id: snap.id };
                }
            } catch (e) {
                console.error("Fetch Project Info Failed", e);
            } finally {
                loading.value = false;
            }
        };

        const handleJoin = async () => {
            if (!user.value) {
                emit('login');
                return;
            }
            joining.value = true;
            try {
                const joinedProject = await API.joinProject(props.hostId, props.projectId, props.token, props.inviterName);
                emit('joined', joinedProject);
                dialog.alert(`成功加入專案：${joinedProject.name}！已同步與 ${displayHostName.value} 建立好友關係。`, 'success');
            } catch (error) {
                dialog.alert(error.message || "加入失敗");
                emit('close');
            } finally {
                joining.value = false;
            }
        };

        const openGuide = () => {
            window.location.href = 'guide.html';
        };

        return { project, displayHostName, loading, joining, user, handleJoin, openGuide };
    }
};
