import { useState, useEffect } from 'react';
import LinkHeroCard from '../components/LinkCommerce/LinkHeroCard';
import LinkSocialIcons from '../components/LinkCommerce/LinkSocialIcons';
import LinkCTAButton from '../components/LinkCommerce/LinkCTAButton';
import LinkInstagramFeed from '../components/LinkCommerce/LinkInstagramFeed';
import LinkScheduler from '../components/LinkCommerce/LinkScheduler';
import LinkConcierge from '../components/LinkCommerce/LinkConcierge';
import LinkDiagnosticModal from '../components/LinkCommerce/LinkDiagnosticModal';

export default function LinkCommercePage() {
    const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
    const [visitorId, setVisitorId] = useState('');

    useEffect(() => {
        // Obter ou gerar ID do visitante único e persistente no localStorage
        let storedId = localStorage.getItem('lc_visitor_id');
        if (!storedId) {
            storedId = 'vis_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('lc_visitor_id', storedId);
        }
        setVisitorId(storedId);

        // Track page view
        trackEvent('page_view', 'link_page');
    }, []);

    const trackEvent = async (eventType: string, elementId: string, metadata: Record<string, any> = {}) => {
        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const searchParams = new URLSearchParams(window.location.search);
            
            await fetch(`${API}/api/link/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_type: eventType,
                    element_id: elementId,
                    visitor_id: visitorId || localStorage.getItem('lc_visitor_id') || 'anonymous',
                    metadata: {
                        ...metadata,
                        utm_source: searchParams.get('utm_source'),
                        utm_medium: searchParams.get('utm_medium'),
                        utm_campaign: searchParams.get('utm_campaign')
                    },
                    referrer: document.referrer,
                    user_agent: navigator.userAgent
                })
            });
        } catch {
            // silent track error
        }
    };

    const handleScheduleSuccess = () => {
        trackEvent('schedule_success', 'scheduler');
    };

    return (
        <div className="min-h-screen bg-[#080808] text-white flex justify-center py-10 px-5 sm:px-6 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-30%] w-[80%] h-[60%] rounded-full opacity-10 blur-[120px] pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(225,169,96,0.6) 0%, rgba(0,0,0,0) 70%)' }} />
            <div className="absolute bottom-[-20%] right-[-30%] w-[80%] h-[60%] rounded-full opacity-5 blur-[120px] pointer-events-none"
                 style={{ background: 'radial-gradient(circle, rgba(120,134,106,0.6) 0%, rgba(0,0,0,0) 70%)' }} />

            {/* Container */}
            <div className="w-full max-w-[420px] flex flex-col gap-6 relative z-10">
                {/* 1. Hero Card */}
                <LinkHeroCard />

                {/* 2. Social Media Row */}
                <LinkSocialIcons onTrack={(elementId) => trackEvent('click', elementId)} />

                {/* 3. CTA Buttons Stack */}
                <div className="flex flex-col gap-3.5">
                    {/* CTA 1: Diagnóstico Completo (Highlight) */}
                    <LinkCTAButton
                        icon={
                            <svg className="w-5 h-5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        }
                        title="Descubra se você está pronto"
                        description="Responda 5 perguntas rápidas e inicie o Concierge de IA."
                        onClick={() => setIsDiagnosticOpen(true)}
                        highlight={true}
                        delay={100}
                        trackId="click_diagnostico"
                        onTrack={(elementId) => trackEvent('click', elementId)}
                    />

                    {/* CTA 2: O Dossiê do Futuro Franqueado */}
                    <LinkCTAButton
                        icon={
                            <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                                <path d="M6 6h10M6 10h10" />
                            </svg>
                        }
                        title="Dossiê do Futuro Franqueado"
                        description="O método definitivo para avaliar marcas e assinar com clareza."
                        href="/ebook"
                        delay={130}
                        trackId="click_dossie"
                        onTrack={(elementId) => trackEvent('click', elementId)}
                    />

                    {/* CTA 3: O que penso sobre franquias (Blog) */}
                    <LinkCTAButton
                        icon={
                            <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                        }
                        title="O que penso sobre franquias"
                        description="Nossos artigos mais recentes, cases e análise de mercado."
                        href="/blog"
                        delay={160}
                        trackId="click_blog"
                        onTrack={(elementId) => trackEvent('click', elementId)}
                    />
                </div>

                {/* 4. Instagram Feed Horizontal Section */}
                <LinkInstagramFeed onTrack={(elementId) => trackEvent('click', elementId)} />

                {/* 5. Custom Inline Scheduler */}
                <LinkScheduler 
                    onTrack={(elementId) => trackEvent('click', elementId)}
                    onSuccess={handleScheduleSuccess}
                />

                {/* Footer branding */}
                <div className="mt-8 text-center text-[10px] text-white/20 uppercase tracking-[0.3em] py-4 flex flex-col gap-1.5 border-t border-white/5">
                    <span>© {new Date().getFullYear()} Biz Guardian</span>
                    <span>world connections</span>
                </div>
            </div>

            {/* Float Concierge FAB (drawer inside) */}
            <LinkConcierge 
                onTrack={(elementId) => trackEvent('click', elementId)}
                onOpenSchedule={() => {
                    const el = document.querySelector('.bg-[#0a0a0a].border.border-white\\/10.rounded-2xl');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
            />

            {/* Diagnostic Modal */}
            <LinkDiagnosticModal
                isOpen={isDiagnosticOpen}
                onClose={() => setIsDiagnosticOpen(false)}
                onSchedule={() => {
                    setIsDiagnosticOpen(false);
                    const el = document.querySelector('.bg-[#0a0a0a].border.border-white\\/10.rounded-2xl');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onTrack={(elementId) => trackEvent('click', elementId)}
            />
        </div>
    );
}
