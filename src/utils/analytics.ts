/**
 * Analytics Utility for Marinho Ponci & Biz Guardian
 * Integrates Google Tag Manager / GA4 (dataLayer) and Meta Pixel (fbq).
 * Includes automatic detection and tracking for Generative AI search engines (ChatGPT, Perplexity, Claude, Gemini, Copilot).
 */

declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
        fbq?: (action: string, eventName: string, params?: Record<string, unknown>) => void;
    }
}

export function initDataLayer(): Array<Record<string, unknown>> {
    if (typeof window === 'undefined') return [];
    window.dataLayer = window.dataLayer || [];
    return window.dataLayer;
}

/**
 * Detects if the current visitor arrived from an AI Search / Assistant engine.
 * Inspects document.referrer and common UTM/query parameters.
 */
export function detectAndTrackAISource(): void {
    if (typeof window === 'undefined') return;

    try {
        const hasTracked = sessionStorage.getItem('ai_referral_logged');
        if (hasTracked) return;

        const referrer = document.referrer ? document.referrer.toLowerCase() : '';
        const search = window.location.search.toLowerCase();
        let aiEngine: string | null = null;

        if (referrer.includes('chatgpt.com') || referrer.includes('chat.openai.com') || referrer.includes('com.openai.chatgpt') || search.includes('utm_source=chatgpt')) {
            aiEngine = 'ChatGPT';
        } else if (referrer.includes('perplexity.ai') || search.includes('utm_source=perplexity')) {
            aiEngine = 'Perplexity';
        } else if (referrer.includes('claude.ai') || search.includes('utm_source=claude')) {
            aiEngine = 'Claude';
        } else if (referrer.includes('gemini.google.com') || referrer.includes('bard.google.com') || search.includes('utm_source=gemini')) {
            aiEngine = 'Google Gemini';
        } else if (referrer.includes('copilot.microsoft.com') || referrer.includes('bing.com/chat') || search.includes('utm_source=copilot')) {
            aiEngine = 'Microsoft Copilot';
        }

        if (aiEngine) {
            sessionStorage.setItem('ai_referral_logged', aiEngine);
            const dataLayer = initDataLayer();
            dataLayer.push({
                event: 'ai_engine_referral',
                ai_engine: aiEngine,
                referrer_url: document.referrer,
                landing_page: window.location.pathname,
                timestamp: new Date().toISOString()
            });
        }
    } catch {
        // Silent fail for storage restrictions
    }
}

/**
 * Tracks a Virtual Page View on client-side route changes.
 */
export function trackPageView(path: string, title?: string): void {
    if (typeof window === 'undefined') return;

    const dataLayer = initDataLayer();
    dataLayer.push({
        event: 'page_view',
        page_path: path,
        page_location: window.location.href,
        page_title: title || document.title
    });

    if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
    }
}

/**
 * Tracks clicks on product links or cards.
 */
export function trackProductClick(productName: string, productId?: string, price?: number): void {
    const dataLayer = initDataLayer();
    dataLayer.push({
        event: 'select_item',
        ecommerce: {
            items: [{
                item_name: productName,
                item_id: productId || productName.toLowerCase().replace(/\s+/g, '-'),
                price: price || 0
            }]
        }
    });

    if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', 'ProductClick', {
            product_name: productName,
            product_id: productId,
            price: price
        });
    }
}

/**
 * Tracks when a user begins the checkout flow for a product.
 */
export function trackBeginCheckout(productName: string, price: number, currency: string = 'BRL'): void {
    const dataLayer = initDataLayer();
    dataLayer.push({
        event: 'begin_checkout',
        ecommerce: {
            currency,
            value: price,
            items: [{
                item_name: productName,
                price
            }]
        }
    });

    if (typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
            content_name: productName,
            value: price,
            currency
        });
    }
}

/**
 * Tracks voluntary lead capture events.
 */
export function trackLeadSubmission(formName: string, details?: Record<string, unknown>): void {
    const dataLayer = initDataLayer();
    dataLayer.push({
        event: 'generate_lead',
        form_name: formName,
        ...details
    });

    if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', {
            content_name: formName
        });
    }
}

/**
 * Tracks purchases and sales conversions.
 */
export function trackPurchase(orderId: string, productName: string, value: number, currency: string = 'BRL'): void {
    const dataLayer = initDataLayer();
    dataLayer.push({
        event: 'purchase',
        ecommerce: {
            transaction_id: orderId,
            value,
            currency,
            items: [{
                item_name: productName,
                price: value
            }]
        }
    });

    if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', {
            content_name: productName,
            value,
            currency
        });
    }
}
