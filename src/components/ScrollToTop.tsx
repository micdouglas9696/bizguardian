import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, detectAndTrackAISource } from '../utils/analytics';

export default function ScrollToTop() {
    const { pathname } = useLocation();
    const isFirstRender = useRef(true);

    useEffect(() => {
        window.scrollTo(0, 0);

        // Detect AI engine referral on initial load and navigation
        detectAndTrackAISource();

        // O primeiro PageView já é disparado no carregamento inicial pelo snippet no index.html.
        // Dispara PageView nos acessos subsequentes via navegação SPA do React Router.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        trackPageView(pathname);
    }, [pathname]);

    return null;
}
