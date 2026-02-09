/**
 * Design Theme
 * 集中管理 JavaScript 中使用的設計變數 (如 Chart.js 顏色配置)
 * 數值應與 css/design-tokens.css 保持一致
 */

export const Theme = {
    colors: {
        // Semantic Tokens
        primary: 'var(--action-primary-bg)',
        bgMain: 'var(--bg-main)',
        bgCanvas: 'var(--bg-canvas)',
        textPrimary: 'var(--txt-primary)',
        textSecondary: 'var(--txt-secondary)',

        // Status
        success: 'var(--p-success-500)',
        danger: 'var(--p-danger-500)',
        warning: 'var(--p-warn-500)',
        info: 'var(--p-info-500)',

        // Chart Palette (Original remote colors - first color is brand for highest amount)
        chart: [
            '#4A4A4A', // Brand color for highest amount
            '#7A7A7A',
            '#9A9A9A',
            '#BDBDBD',
            '#D1C7BD',
            '#E5E5E5'
        ]
    },
    fonts: {
        main: '"Noto Sans TC", sans-serif'
    },

    /**
     * 解析 CSS 變數值 (用於 Canvas fillStyle 等不支持 var() 的場景)
     * 支援多層嵌套引用並提供硬編碼回退方案，確保圖表絕對可見。
     * @param {string} varName 變數名稱
     * @param {string} fallback 回退色值
     * @returns {string} 解析後的顏色值
     */
    resolveColor(varName, fallback = '#1A1A1A') {
        if (typeof window === 'undefined') return fallback;

        // 取得純粹的變數名稱 (--name)
        let name = varName.trim();
        if (name.startsWith('var(')) {
            const match = name.match(/var\((--[^,)]+).*\)/);
            name = match ? match[1] : name;
        }
        if (!name.startsWith('--')) name = '--' + name;

        // 遞歸解析 (最多 5 層，避免無限循環)
        let val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        let depth = 0;
        while (val && val.includes('var(') && depth < 5) {
            const nextMatch = val.match(/var\((--[^,)]+).*\)/);
            if (!nextMatch) break;
            val = getComputedStyle(document.documentElement).getPropertyValue(nextMatch[1]).trim();
            depth++;
        }

        // 如果解析出有效的色值，直接回傳
        if (val && (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl'))) return val;

        // 硬編碼回退表 (針對品牌色，防止 CSS 未載入時的渲染失敗)
        const brandFallbacks = {
            '--action-primary-bg': '#424242',
            '--p-brand-500': '#4A4A4A',
            '--p-brand-400': '#8C8C8C',
            '--p-brand-300': '#B3B3B3',
            '--p-brand-200': '#D6D6D6',
            '--p-brand-600': '#424242',
            '--p-brand-700': '#333333',
            '--p-brand-800': '#262626',
            '--p-brand-900': '#1A1A1A',
            '--txt-secondary': '#6B7280',
            '--chart-color-1': '#424242', // brand-600
            '--chart-color-2': '#4A4A4A', // brand-500
            '--chart-color-3': '#8C8C8C', // brand-400
            '--chart-color-4': '#B3B3B3', // brand-300
            '--chart-color-5': '#D6D6D6', // brand-200
            '--chart-color-6': '#D1D5DB'  // gray-300
        };

        return brandFallbacks[name] || fallback;
    },

    /**
     * 獲取解析後的圖表配色陣列
     */
    getChartPalette() {
        return this.colors.chart;
    }
};
