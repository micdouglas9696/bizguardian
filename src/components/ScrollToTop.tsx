import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
    interface Window {
        fbq?: (action: string, eventName: string, params?: Record<string, unknown>) => void;
    }
}

export default function ScrollToTop() {
    const { pathname } = useLocation();
    const isFirstRender = useRef(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        // O primeiro PageView já é disparado no carregamento inicial pelo snippet no index.html.
        // Dispara PageView nos acessos subsequentes via navegação SPA do React Router.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
            window.fbq('track', 'PageView');
        }
    }, [pathname]);

    return null;
}
