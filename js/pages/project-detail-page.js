import { API } from '../api.js';

export const ProjectDetailPage = {
    template: `
    <section class="animate-in fade-in pb-20">
        <!-- Main Content Card -->
        <div class="bg-white p-6 rounded-[2.5rem] muji-shadow border border-bdr-subtle flex flex-col min-h-[60vh] relative mt-2">
            
            <!-- Navigation & Controls -->
            <div class="flex items-center justify-between pb-2 shrink-0">
                <button @click="$emit('back')" class="text-txt-secondary hover:text-txt-primary transition-colors flex items-center space-x-1">
                    <span class="material-symbols-rounded text-xl">arrow_back</span>
                    <span class="text-[10px] tracking-widest uppercase">BACK</span>
                </button>
                <div class="flex items-center space-x-4">
                    <button v-if="!isEditing" @click="isEditing = true" class="text-txt-secondary hover:text-txt-primary transition-colors">
                        <span class="material-symbols-rounded text-lg">edit</span>
                    </button>
                </div>
            </div>

            <!-- Read Only View (Centered Content) -->
            <div v-if="!isEditing" class="flex-1 flex flex-col justify-center space-y-8">
                <!-- ... content ... -->
                <div class="text-center space-y-3">
                    <span :class="project.status === 'Active' ? 'bg-[var(--action-primary-bg)] text-white' : 'bg-bg-subtle text-txt-secondary'" 
                          class="text-[10px] px-3 py-1 rounded-full inline-block tracking-widest uppercase">
                          {{ getStatusLabel(project.status) }}
                    </span>
                    <h2 class="text-2xl font-light text-txt-primary tracking-wide">{{ project.name }}</h2>
                    <p class="text-[11px] text-txt-secondary tracking-wider font-light">{{ project.startDate }} ~ {{ project.endDate }}</p>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-4 bg-bg-subtle p-6 rounded-3xl relative">
                     <div class="text-center">
                         <p class="text-[9px] text-txt-secondary uppercase tracking-widest mb-1 font-medium">總花費</p>
                         <p class="text-xl font-light text-txt-primary">{{ getCurrencySymbol }}{{ formatNumber(stats.total) }}</p>
                     </div>
                     <div class="text-center border-l border-bdr-default">
                         <p class="text-[9px] text-txt-secondary uppercase tracking-widest mb-1 font-medium">平均日花費</p>
                         <p class="text-xl font-light text-txt-primary">{{ getCurrencySymbol }}{{ formatNumber(stats.daily) }}</p>
                     </div>
                </div>

                <!-- Sharing Scope (Read Only) -->
                <div v-if="project.collaborationEnabled" class="space-y-1 px-1">
                    <p class="text-[10px] text-txt-secondary uppercase tracking-[0.2em] font-medium">
                        已開啟共享功能 | {{ project.sharingMode === 'FULL' ? '所有明細' : '僅限相關' }}
                    </p>
                </div>

                <!-- Members Section (New) -->
                <div v-if="project.collaborationEnabled && collaborators.length > 0" class="space-y-3">
                    <p class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium px-1">參與成員</p>
                    <div class="flex flex-wrap gap-2 px-1">
                        <div class="flex items-center space-x-1.5 bg-bg-subtle px-3 py-1.5 rounded-full border border-bdr-subtle/30">
                            <span class="material-symbols-rounded text-sm text-[var(--action-primary-bg)]">stars</span>
                            <span class="text-[10px] text-txt-primary font-medium">擁有者 (我)</span>
                        </div>
                        <div v-for="c in collaborators" :key="c.uid" class="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-full border border-bdr-subtle/50">
                            <span class="material-symbols-rounded text-sm text-txt-muted">person</span>
                            <span class="text-[10px] text-txt-secondary">{{ c.name }}</span>
                        </div>
                    </div>
                </div>

                <!-- Bottom Action Area -->
                <div v-if="project.id && project.collaborationEnabled && !project.hostId" class="space-y-3 pt-2">
                    <div class="flex space-x-3">
                        <button @click="copyInviteLink" :disabled="generating" class="flex-1 bg-white text-txt-primary py-3 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all muji-shadow border border-bdr-subtle disabled:opacity-50">
                            <span class="material-symbols-rounded text-base">{{ copyIcon }}</span>
                            <span class="text-[11px] font-medium tracking-widest uppercase">{{ copyText }}</span>
                        </button>
                        <button @click="shareInviteLink" class="w-14 bg-white text-txt-primary py-3 rounded-2xl flex items-center justify-center active:scale-95 transition-all muji-shadow border border-bdr-subtle">
                            <span class="material-symbols-rounded text-xl">ios_share</span>
                        </button>
                    </div>
                </div>

                <!-- Unified View History Button -->
                <button @click="$emit('view-history', project.id)" class="w-full bg-bg-subtle text-txt-secondary py-4 rounded-2xl text-[10px] tracking-widest uppercase hover:bg-bg-subtle hover:text-txt-primary transition-colors font-medium">
                    查看明細
                </button>
            </div>

            <!-- Edit View -->
            <div v-else class="space-y-6 pt-2">
                <div class="space-y-2">
                    <label class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium ml-2">計畫名稱</label>
                    <input type="text" v-model="editForm.name" class="w-full bg-bg-subtle px-5 py-4 rounded-2xl text-sm outline-none text-txt-primary placeholder-gray-300 transition-all focus:bg-white focus:shadow-sm border border-transparent focus:border-bdr-subtle">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium ml-2">開始日期</label>
                        <input type="date" v-model="editForm.startDate" class="w-full bg-bg-subtle px-4 py-3 rounded-2xl text-xs outline-none text-txt-primary">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium ml-2">結束日期</label>
                        <input type="date" v-model="editForm.endDate" class="w-full bg-bg-subtle px-4 py-3 rounded-2xl text-xs outline-none text-txt-primary">
                    </div>
                </div>

                <!-- Collaboration Section -->
                <div v-if="!project.hostId" class="space-y-4 pt-4 border-t border-bdr-subtle/30">
                        <div class="flex items-center justify-between" @click.stop="editForm.collaborationEnabled = !editForm.collaborationEnabled">
                            <div class="space-y-0.5">
                                <span class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium">雙向協作功能</span>
                                <p class="text-[9px] text-txt-muted">開啟後，您可以邀請好友共同記錄此計畫</p>
                            </div>
                            <div class="w-10 h-5 rounded-full shadow-sm relative transition-colors" :class="editForm.collaborationEnabled ? 'bg-[var(--action-primary-bg)]' : 'bg-bg-subtle'">
                                <div class="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform" :class="{'translate-x-5': editForm.collaborationEnabled}"></div>
                            </div>
                        </div>

                    <div v-if="editForm.collaborationEnabled" class="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                        <div class="space-y-2">
                            <label class="text-[10px] text-txt-secondary uppercase tracking-widest font-medium">共享範圍</label>
                            <div class="flex bg-bg-subtle rounded-xl p-1">
                                <button @click="editForm.sharingMode = 'FULL'" :class="editForm.sharingMode === 'FULL' ? 'bg-white text-txt-primary shadow-sm' : 'text-txt-secondary'" class="flex-1 py-2 text-[10px] tracking-widest rounded-lg transition-all font-medium">所有明細</button>
                                <button @click="editForm.sharingMode = 'RELATED'" :class="editForm.sharingMode === 'RELATED' ? 'bg-white text-txt-primary shadow-sm' : 'text-txt-secondary'" class="flex-1 py-2 text-[10px] tracking-widest rounded-lg transition-all font-medium">僅限相關</button>
                            </div>
                            <p class="text-[8px] text-txt-muted px-1">
                                {{ editForm.sharingMode === 'FULL' ? '參與者可查看此計畫中記錄的所有花費。' : '參與者僅能查看與其有關（付款人或分帳有他）的花費。' }}
                            </p>
                        </div>

                        </div>
                    </div>
                    
                    <div class="space-y-4 pt-6">
                        <button @click="saveProject" :disabled="saving" class="w-full bg-[var(--action-primary-bg)] text-white py-4 rounded-2xl text-[10px] font-medium tracking-[0.3em] uppercase active:scale-95 transition-all">
                            {{ saving ? 'Saving...' : '更新計畫設定' }}
                        </button>
                        <button @click="handleDeleteProject" class="w-full py-2 text-[10px] text-danger tracking-widest uppercase font-medium">刪除此計劃</button>
                        <button @click="isEditing = false" class="w-full py-2 text-[10px] text-txt-secondary tracking-widest uppercase hover:text-txt-primary">取消編輯</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `,
    props: ['project', 'transactions', 'fxRate', 'config'],
    inject: ['dialog'],
    setup() {
        const { inject, computed } = window.Vue;
        const baseCurrency = inject('baseCurrency');
        const getCurrencySymbol = computed(() => baseCurrency.value === 'JPY' ? '¥' : '$');
        return { baseCurrency, getCurrencySymbol };
    },
    data() {
        return {
            isEditing: false,
            editForm: {},
            saving: false,
            copyIcon: 'link',
            copyText: '複製連結',
            generating: false,
            collaborators: []
        };
    },
    computed: {

        stats() {
            if (!this.project || !this.transactions) return { total: 0, daily: 0 };

            // Filter transactions for this project
            const txs = this.transactions.filter(t => t.projectId === this.project.id && t.type === '支出');
            const rate = Number(this.fxRate || 0.22);
            const targetCurr = this.baseCurrency;

            let total = 0;
            txs.forEach(t => {
                const currency = t.originalCurrency || t.currency || 'JPY';
                const amt = t.amount !== undefined ? Number(t.amount) : (currency === 'TWD' ? Number(t.amountTWD) : Number(t.amountJPY));

                if (targetCurr === 'JPY') {
                    total += (currency === 'TWD') ? amt / rate : amt;
                } else {
                    total += (currency === 'JPY') ? amt * rate : amt;
                }
            });

            // Use date range for daily avg
            const start = new Date(this.project.startDate);
            const end = new Date(this.project.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            return {
                total: total,
                daily: diffDays > 0 ? total / diffDays : 0
            };
        }
    },
    watch: {
        project: {
            handler(newVal) {
                if (newVal) {
                    this.editForm = {
                        ...newVal,
                        collaborationEnabled: newVal.collaborationEnabled || false,
                        sharingMode: newVal.sharingMode || 'FULL'
                    };
                    if (newVal.collaborationEnabled) {
                        this.fetchCollaborators();
                    }
                }
            },
            immediate: true
        }
    },
    methods: {
        formatNumber(num) { return new Intl.NumberFormat().format(Math.round(num || 0)); },
        getStatusLabel(status) {
            const map = { 'Active': '進行中', 'Archived': '已封存' };
            return map[status] || status;
        },
        async getShortInviteUrl() {
            const token = this.config.invite_token;
            if (!token) throw new Error("邀請碼尚未就緒，請重新整理頁面。");

            const params = {
                tab: 'project-landing',
                host_uid: window.API.auth.currentUser.uid,
                invite_project_id: this.project.id,
                name: this.config.user_name || '好友',
                token: token
            };

            const shortId = await window.API.createShortInvite(params);
            const baseUrl = window.location.origin + window.location.pathname;
            return `${baseUrl}?i=${shortId}`;
        },
        async handleDeleteProject() {
            if (confirm('確定要刪除此計畫嗎？相關的所有支出紀錄與好友連結將會被移除且無法恢復。')) {
                try {
                    await API.deleteProject(this.project.hostId, this.project.id);
                    this.$emit('close');
                    this.$emit('refresh'); // Assuming parent can refresh list
                } catch (error) {
                    alert('刪除失敗: ' + error.message);
                }
            }
        },
        async copyInviteLink() {
            if (this.generating) return;
            this.generating = true;
            try {
                const inviteUrl = await this.getShortInviteUrl();

                if (navigator.clipboard) {
                    await navigator.clipboard.writeText(inviteUrl);
                } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = inviteUrl;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand("copy");
                    document.body.removeChild(textArea);
                }

                this.copyIcon = 'check';
                this.copyText = '已複製';
                setTimeout(() => {
                    this.copyIcon = 'link';
                    this.copyText = '複製連結';
                }, 2500);
            } catch (err) {
                console.error('Copy failed:', err);
                this.dialog.alert('複製失敗: ' + err.message);
            } finally {
                this.generating = false;
            }
        },
        async shareInviteLink() {
            try {
                const inviteUrl = await this.getShortInviteUrl();
                const shareTitle = `日日記 | ${this.project.name} 協作邀請`;

                if (navigator.share) {
                    await navigator.share({
                        title: shareTitle,
                        text: `邀請你一起參與「${this.project.name}」的記帳協作`,
                        url: inviteUrl
                    });
                } else {
                    this.copyInviteLink();
                }
            } catch (e) {
                if (e.name !== 'AbortError') console.error("Share failed", e);
            }
        },
        async toggleSharingMode(mode) {
            if (this.project.sharingMode === mode) return;
            try {
                const payload = {
                    action: 'updateProject',
                    id: this.project.id,
                    sharingMode: mode
                };
                await API.saveTransaction(payload);
                this.$emit('update-project', { ...this.project, sharingMode: mode });
            } catch (e) {
                this.dialog.alert("變更共享範圍失敗: " + e.toString());
            }
        },
        async saveProject() {
            this.saving = true;
            try {
                const payload = {
                    action: 'updateProject',
                    id: this.editForm.id,
                    name: this.editForm.name,
                    startDate: this.editForm.startDate,
                    endDate: this.editForm.endDate,
                    status: this.editForm.status,
                    collaborationEnabled: this.editForm.collaborationEnabled,
                    sharingMode: this.editForm.sharingMode
                };

                await API.saveTransaction(payload);
                this.$emit('update-project', this.editForm);
                this.isEditing = false;
                this.dialog.alert("已儲存變更", 'success');
                if (this.editForm.collaborationEnabled) this.fetchCollaborators();
            } catch (e) {
                this.dialog.alert("儲存失敗: " + e.toString());
            } finally {
                this.saving = false;
            }
        },
        async fetchCollaborators() {
            if (!this.project || !this.project.id) return;
            try {
                // If I am a host, I look into my project doc
                // If I am a guest, my host is project.hostId
                const hostId = this.project.hostId || window.API.auth.currentUser.uid;
                const members = await window.API.getProjectCollaborators(hostId, this.project.id);
                // Filter out myself from the list to show "Others"
                this.collaborators = members.filter(m => m.uid !== window.API.auth.currentUser.uid);
            } catch (e) {
                console.warn("Fetch collaborators failed", e);
            }
        }
    }
};
