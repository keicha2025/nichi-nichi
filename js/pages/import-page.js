import { API } from '../api.js';

export const ImportPage = {
    template: `
    <div class="fixed inset-0 bg-white z-50 flex flex-col">
        <!-- Header -->
        <header class="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
            <button @click="$emit('back')" class="p-2 -ml-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <h1 class="text-base font-medium text-gray-800 tracking-wide">匯入資料</h1>
            <div class="w-10"></div> <!-- Spacer for center alignment -->
        </header>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
            
            <!-- Warning -->
            <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <span class="material-symbols-rounded text-amber-500">warning</span>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm text-amber-700">
                            注意：匯入過程將會<strong>覆蓋或合併</strong>現有資料。建議在匯入前先進行備份。
                        </p>
                    </div>
                </div>
            </div>

            <!-- File Input -->
            <div class="space-y-2">
                <label class="block text-xs font-medium text-gray-700 uppercase tracking-wider">選擇備份檔案 (.json)</label>
                <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-400 transition-colors cursor-pointer"
                     @click="$refs.fileInput.click()"
                     @dragover.prevent @drop.prevent="handleDrop">
                    <div class="space-y-1 text-center">
                        <span class="material-symbols-rounded text-gray-400 text-4xl">upload_file</span>
                        <div class="flex text-sm text-gray-600">
                            <span class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                點擊上傳
                            </span>
                            <p class="pl-1">或拖放檔案至此</p>
                        </div>
                        <p class="text-xs text-gray-500">僅支援 JSON 格式</p>
                    </div>
                    <input ref="fileInput" type="file" class="hidden" accept=".json" @change="handleFileSelect">
                </div>
            </div>

            <!-- Preview / Confirmation -->
            <div v-if="parsedData" class="bg-gray-50 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                <h3 class="text-sm font-medium text-gray-800">檔案預覽</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <div class="text-xs text-gray-500">交易紀錄</div>
                        <div class="text-lg font-bold text-gray-800">{{ (parsedData.transactions || []).length }} 筆</div>
                    </div>
                    <div class="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                        <div class="text-xs text-gray-500">專案</div>
                        <div class="text-lg font-bold text-gray-800">{{ (parsedData.projects || []).length }} 個</div>
                    </div>
                </div>
                
                <div class="pt-2">
                    <button @click="confirmImport" :disabled="importing" 
                        class="w-full bg-blue-600 text-white py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="importing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span v-else>確認匯入</span>
                    </button>
                    <button @click="parsedData = null" :disabled="importing" class="w-full mt-2 text-xs text-gray-500 py-2 hover:text-gray-700">
                        取消
                    </button>
                </div>
            </div>

            <!-- Console / Progress Log -->
            <div v-if="logs.length > 0" class="bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-green-400 max-h-48 overflow-y-auto">
                <div v-for="(log, i) in logs" :key="i">> {{ log }}</div>
            </div>
        </div>
    </div>
    `,
    emits: ['back', 'refresh-data'],
    data() {
        return {
            parsedData: null,
            importing: false,
            logs: []
        };
    },
    inject: ['dialog'],
    methods: {
        log(msg) {
            this.logs.push(msg);
            // Auto scroll to bottom
            this.$nextTick(() => {
                const container = this.$el.querySelector('.font-mono');
                if (container) container.scrollTop = container.scrollHeight;
            });
        },
        handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) this.processFile(file);
        },
        handleDrop(event) {
            const file = event.dataTransfer.files[0];
            if (file) this.processFile(file);
        },
        processFile(file) {
            if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
                return this.dialog.alert('請上傳 JSON 格式檔案');
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    // Basic validation
                    if (!json.transactions && !json.projects && !json.categories) {
                        throw new Error("無效的備份檔案格式 (缺少必要欄位)");
                    }
                    this.parsedData = json;
                    this.log(`檔案解析成功: ${file.name}`);
                    this.log(`包含 ${json.transactions?.length || 0} 筆交易, ${json.projects?.length || 0} 個專案`);
                } catch (err) {
                    console.error(err);
                    this.dialog.alert('檔案解析失敗: ' + err.message);
                }
            };
            reader.readAsText(file);
        },
        async confirmImport() {
            if (!this.parsedData) return;

            if (!await this.dialog.confirm("確定要匯入此資料嗎？\n這將會覆蓋資料庫中的相同項目。", "開始匯入")) return;

            this.importing = true;
            this.log("開始匯入...");

            try {
                const result = await API.importData(this.parsedData, (msg) => this.log(msg));
                this.log("匯入完成！");
                await this.dialog.alert(`匯入成功！\n新增/更新了 ${result.count} 筆資料。`);

                // Refresh App Data
                this.$emit('refresh-data');
                this.$emit('back'); // Or stay here? Back seems better.
            } catch (e) {
                console.error(e);
                this.log("錯誤: " + e.message);
                this.dialog.alert("匯入失敗: " + e.message);
            } finally {
                this.importing = false;
            }
        }
    }
};
