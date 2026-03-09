export const MarkdownRenderer = {
    props: {
        content: { type: String, required: true }
    },
    setup(props) {
        const { computed } = window.Vue;

        // Custom Marked Extension for ::: containers
        const customContainerExtension = {
            name: 'customContainer',
            level: 'block',
            start(src) { return src.match(/:::/)?.index; },
            tokenizer(src) {
                const rule = /^::: (tip|warning|danger|info)\s*([^\n]*)\n([\s\S]*?)\n:::/;
                const match = rule.exec(src);
                if (match) {
                    return {
                        type: 'customContainer',
                        raw: match[0],
                        variant: match[1],
                        title: match[2] || match[1].toUpperCase(),
                        text: match[3].trim()
                    };
                }
            },
            renderer(token) {
                // We use marked.parse with the text to allow nested markdown in the container
                const body = window.marked.parse(token.text);
                return `<div class="container-block ${token.variant}">
                    <div class="container-title">${token.title}</div>
                    <div class="container-content">${body}</div>
                </div>`;
            }
        };

        // Helper to generate IDs for headers
        const slugify = (text) => {
            if (!text || typeof text !== 'string') return '';
            return text.toLowerCase()
                .trim()
                // Remove material icons markup completely: <span ...>icon_name</span>
                .replace(/<span[^>]*material-symbols-rounded[^>]*>[^<]*<\/span>/g, '')
                .replace(/<[^>]+>/g, '') // Remove HTML tags
                .replace(/[\s_]+/g, '-') // Replace spaces/underscores with hyphens
                .replace(/[^\p{L}\p{N}-]/gu, '') // Keep Unicode letters, numbers, and hyphens. Remove punctuation.
                .replace(/^-+|-+$/g, '');
        };

        // Custom Extension for Material Icons: :icon_name:
        const iconExtension = {
            name: 'icon',
            level: 'inline',
            start(src) { return src.indexOf(':'); },
            tokenizer(src) {
                const rule = /^:([a-z0-9_]+):/;
                const match = rule.exec(src);
                if (match) {
                    return {
                        type: 'icon',
                        raw: match[0],
                        name: match[1]
                    };
                }
            },
            renderer(token) {
                return `<span class="material-symbols-rounded icon-inline">${token.name}</span>`;
            }
        };

        // Initialize marked only once
        let markedInitialized = false;
        const initMarked = () => {
            if (markedInitialized || typeof window.marked === 'undefined') return;

            const renderer = new window.marked.Renderer();

            // marked v12+ uses an object for arguments
            renderer.heading = (arg1, arg2, arg3) => {
                let text, level, raw;
                if (typeof arg1 === 'object') {
                    text = arg1.text;
                    level = arg1.depth;
                    raw = arg1.raw;
                } else {
                    text = arg1;
                    level = arg2;
                    raw = arg3;
                }
                const id = slugify(raw || text || '');
                return `<h${level} id="${id}">${text}</h${level}>\n`;
            };

            window.marked.use({
                extensions: [customContainerExtension, iconExtension],
                renderer: renderer,
                gfm: true,
                breaks: true,
                headerIds: false // We handle this manually via custom renderer
            });
            markedInitialized = true;
        };

        const renderedHtml = computed(() => {
            if (!props.content) return '';

            if (typeof window.marked === 'undefined') {
                console.error("Marked.js is not loaded");
                return props.content;
            }

            initMarked();

            const html = window.marked.parse(props.content);

            // Sanitize
            if (window.DOMPurify) {
                return window.DOMPurify.sanitize(html, {
                    ADD_TAGS: ['details', 'summary', 'kbd', 'span'],
                    ADD_ATTR: ['target', 'class', 'id'],
                    FORBID_ATTR: ['style', 'onerror', 'onclick']
                });
            }
            return html;
        });

        return { renderedHtml };
    },
    template: `
        <div class="markdown-body" v-html="renderedHtml"></div>
    `
};
