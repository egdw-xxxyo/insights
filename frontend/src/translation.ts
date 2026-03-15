import { frappeRequest } from "frappe-ui";
import type { App } from "vue";
import { reactive } from "vue";

const state = reactive({
    messages: {} as Record<string, string>,
    loaded: false,
});

function translate(message: string): string;
function translate(message: string, ...args: string[]): string;
function translate(message: string, ...args: string[]): string {
    const translatedMessage = state.messages[message] || message;
    if (args.length === 0) {
        return translatedMessage;
    }
    return translatedMessage.replace(/{(\d+)}/g, function (match, index) {
        return typeof args[index] != 'undefined' ? args[index] : match;
    });
}

export const __ = translate;

export async function loadTranslations() {
    try {
        const data = await frappeRequest({
            url: "/api/method/insights.api.translations.get_translations",
            method: "GET",
        });
        if (data && typeof data === "object") {
            Object.assign(state.messages, data);
            (window as any).translatedMessages = state.messages;
            state.loaded = true;
        }
    } catch (e) {
        console.warn("Failed to load translations", e);
    }
}

export function translationPlugin(app: App<Element>) {
    app.config.globalProperties.__ = translate;
    (window as any).__ = translate;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    __: typeof translate;
  }
}
