import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// =====================================================================
// EBOOK LANDING PAGE — /franqueador-ingles
// "The Future Franchisor Dossier" — Marinho Ponci
// =====================================================================

const PRICE_PARCELA = '3× of R$ 89.00 interest-free';
const PRICE_PIX = 'R$ 222.30 via Pix (10% off) or Credit Card';

// 6 modules of the Future Franchisor Dossier
const MODULES = [
    {
        n: 'MOD 01',
        title: 'Is your business franchisable?',
        text: 'How to assess, coldly and realistically, whether your successful company is truly ready to be replicated (maturity, margin and real market differentiators).',
        pills: ['Video', 'Franchisability Checklist'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 02',
        title: 'Legal and Operational Structuring',
        text: 'The truth about the FDD (Franchise Disclosure Document), contracts and operations manuals. How to build the pillars that protect your brand from liabilities.',
        pills: ['Video', 'Disclosure Document Guide'],
        value: 'R$ 297',
    },
    {
        n: 'MOD 03',
        title: 'Network Economics and Royalties',
        text: 'How to calculate and price the franchise fee, royalties and the advertising fund sustainably. The financial equation that secures the franchisor\'s profit.',
        pills: ['Video', 'Royalty Calculator'],
        value: 'R$ 297',
    },
    {
        n: 'MOD 04',
        title: 'Support and Training Structure',
        text: 'How to structure support without bloating your operation. From franchisee onboarding to continuous coaching and training across the network.',
        pills: ['Video', 'Support Matrix'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 05',
        title: 'Selecting Partner Franchisees',
        text: 'How to design the ideal profile and select your first franchisees. The danger of selling to anyone just for the quick cash of the franchise fee.',
        pills: ['Video', 'Interview Script'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 06',
        title: 'Expansion and Conflict Management',
        text: 'How to plan regional or national expansion organically and with structure. Practical strategies to handle conflict and keep the network engaged.',
        pills: ['Video', 'Crisis Management Playbook'],
        value: 'R$ 297',
    },
];

async function startCheckout(productKey?: string): Promise<{ ok: boolean; error?: string }> {
    if (!STRIPE_PK) {
        document.getElementById('cta-final')?.scrollIntoView({ behavior: 'smooth' });
        return { ok: true };
    }
    try {
        const resp = await fetch(`${API_URL}/api/checkout/create-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productKey }),
        });
        if (!resp.ok) {
            const err = await resp.json().catch(() => ({ error: 'Error' }));
            return { ok: false, error: err.error || `HTTP ${resp.status}` };
        }
        const data = await resp.json();
        if (data.url) {
            window.location.href = data.url;
            return { ok: true };
        }
        return { ok: false, error: 'Server response is missing the checkout URL' };
    } catch (err: any) {
        return { ok: false, error: err.message || 'Failed to start checkout' };
    }
}

const FAQ_ITEMS = [
    {
        q: 'Is the Dossier just an e-book?',
        a: 'No. It is a decision-making program with 6 video modules recorded by Marinho, plus scripts and practical checklists so you can understand the real process of structuring and expanding your brand — including the bonus "The First Franchise Sales Meeting". All content lives in a secure members area.',
    },
    {
        q: 'How fast do I get access?',
        a: 'Immediate access. Credit card and Pix payments release your access credentials by e-mail within seconds.',
    },
    {
        q: 'Is there a guarantee if I do not like it?',
        a: 'Yes. You have a 7-day unconditional guarantee. If you access the material and feel it does not fit your current business moment, simply request a refund by e-mail and we return 100% of your money.',
    },
    {
        q: 'Does this dossier replace legal counsel?',
        a: 'No. The dossier provides the conceptual method and strategic direction based on Marinho\'s 38 years of experience, so you can audit your own business and speak on equal terms with lawyers and consultants. It does not replace specialised legal advice to draft your disclosure document and manuals.',
    },
    {
        q: 'Is it useful if I only have an idea so far?',
        a: 'The dossier is ideal for those who already run a profitable, operating company and want to understand the strategic path to turn it into a franchise. If you only have an idea on paper, I recommend validating your pilot operation first.',
    },
];

const FAQ_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
};

const PRODUCT_SCHEMA = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'The Future Franchisor Dossier',
    description:
        'A complete method and franchisability checklists for successful business owners who want to structure and expand their business through franchising. By Marinho Ponci.',
    image: 'https://marinhoponci.com/og-dossie-franqueador.jpg',
    brand: { '@type': 'Brand', name: 'Marinho Ponci' },
    offers: {
        '@type': 'Offer',
        price: '247.00',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url: 'https://marinhoponci.com/franqueador-ingles',
    },
};

export default function FranqueadorLandingPageEn() {
    const [scrolled, setScrolled] = useState(false);
    const [pastHero, setPastHero] = useState(false);
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const mainRef = useRef<HTMLElement>(null);

    // Lead capture modal state
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [leadName, setLeadName] = useState('');
    const [leadEmail, setLeadEmail] = useState('');
    const [leadPhone, setLeadPhone] = useState('');
    const [leadSubmitting, setLeadSubmitting] = useState(false);
    const [leadError, setLeadError] = useState('');

    const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({
        transform: 'perspective(1200px) rotateY(-10deg) rotateX(3deg) rotateZ(-1deg)',
        transition: 'transform 0.5s ease-out, box-shadow 0.5s ease-out'
    });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const w = rect.width;
        const h = rect.height;
        const rx = -(y - h / 2) / (h / 2) * 15;
        const ry = (x - w / 2) / (w / 2) * 15;
        setTiltStyle({
            transform: `perspective(1200px) rotateY(${ry - 10}deg) rotateX(${rx + 3}deg) rotateZ(-1deg) scale(1.03)`,
            transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
            boxShadow: `${-ry}px ${rx + 25}px 60px rgba(0,0,0,0.9)`
        });
    };

    const handleMouseLeave = () => {
        setTiltStyle({
            transform: 'perspective(1200px) rotateY(-10deg) rotateX(3deg) rotateZ(-1deg)',
            transition: 'transform 0.5s ease-out, box-shadow 0.5s ease-out'
        });
    };

    const handleCheckout = useCallback(() => {
        if (checkoutLoading) return;
        setLeadError('');
        setShowLeadModal(true);
    }, [checkoutLoading]);

    const handleLeadSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) {
            setLeadError('Please fill in all fields.');
            return;
        }
        setLeadSubmitting(true);
        setLeadError('');
        try {
            await fetch(`${API_URL}/api/leads/ebook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: leadName,
                    email: leadEmail,
                    phone: leadPhone,
                    source: 'franqueador_en',
                }),
            });
        } catch (err) {
            console.error('Lead error:', err);
        }

        setShowLeadModal(false);
        setCheckoutError(null);
        setCheckoutLoading(true);
        const result = await startCheckout('dossie_futuro_franqueador');
        if (!result.ok) {
            setCheckoutError(result.error || 'Error starting checkout');
            setCheckoutLoading(false);
        }
    }, [leadName, leadEmail, leadPhone]);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 50);

            const heroEl = document.getElementById('hero');
            if (heroEl) {
                const heroHeight = heroEl.offsetHeight;
                setPastHero(offset > heroHeight - 80);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // SEO & GEO metadata
    useEffect(() => {
        const previousTitle = document.title;
        document.title = 'The Future Franchisor Dossier | Marinho Ponci — 38 years in franchising';

        const setMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let tag = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attr, name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        const description = 'Learn how to structure your business and build a successful franchise network. Disclosure document, royalties, franchisability matrix and legal protection with Marinho Ponci.';
        
        setMeta('description', description);
        setMeta('robots', 'index,follow,max-image-preview:large');
        setMeta('og:title', 'The Future Franchisor Dossier | Marinho Ponci', true);
        setMeta('og:description', description, true);
        setMeta('og:type', 'product', true);
        setMeta('og:url', 'https://marinhoponci.com/franqueador-ingles', true);
        setMeta('og:image', 'https://marinhoponci.com/og-dossie-franqueador.jpg', true);
        setMeta('og:locale', 'en_US', true);
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', 'The Future Franchisor Dossier');
        setMeta('twitter:description', description);

        let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://marinhoponci.com/franqueador-ingles');

        return () => {
            document.title = previousTitle;
        };
    }, []);

    const toggleFAQ = (idx: number) => {
        setOpenFAQ(openFAQ === idx ? null : idx);
    };

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
            <script type="application/ld+json">{JSON.stringify(PRODUCT_SCHEMA)}</script>

            <div className="min-h-screen bg-black text-white font-sans selection:bg-accent-gold selection:text-black">
                {/* ===========================================================
                    HEADER / NAV
                =========================================================== */}
                <header
                    className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
                        scrolled
                            ? 'bg-black/90 backdrop-blur-xl py-3'
                            : 'bg-transparent py-5 sm:py-7'
                    }`}
                >
                    <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
                        <Link
                            to="/"
                            className="flex flex-col leading-none select-none cursor-pointer group"
                        >
                            <img
                                src="/marinho final.webp"
                                alt="Marinho Ponci"
                                className="h-9 sm:h-12 md:h-16 lg:h-20 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link
                                to="/ebook-ingles"
                                className="text-[10px] font-black uppercase tracking-[0.18em] border border-white/25 text-white/60 hover:text-accent-gold hover:border-accent-gold px-3 py-2 transition-all mr-1 flex items-center gap-1"
                                title="Dossier for Franchisees"
                            >
                                For Franchisees <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>

                            <Link
                                to="/franqueador"
                                className="text-[10px] font-black uppercase tracking-[0.18em] border border-white/25 text-white/60 hover:text-accent-gold hover:border-accent-gold px-3 py-2 transition-all mr-1 flex items-center gap-1"
                                title="Versão em Português"
                            >
                                <span className="material-symbols-outlined text-[14px]">language</span> PT
                            </Link>

                            <Link
                                to="/membro/login"
                                className="group relative px-4 py-2 bg-accent-gold text-black text-[10px] font-black uppercase tracking-[0.18em] hover:bg-white transition-all duration-300 whitespace-nowrap"
                            >
                                Member
                            </Link>

                            <button
                                onClick={handleCheckout}
                                disabled={checkoutLoading}
                                className={`cta-glow group relative px-5 py-2 bg-accent-gold text-black text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] hover:bg-white transition-all duration-500 overflow-hidden hidden sm:inline-flex ${pastHero ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="relative flex items-center gap-2">
                                    I want the Dossier <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                <main ref={mainRef}>
                    {/* ===========================================================
                        1. ATTENTION  ·  Hook
                    =========================================================== */}
                    <section id="hero" className="relative overflow-hidden">

                        {/* ── DESKTOP (sm+) ── */}
                        <div className="hidden sm:block relative min-h-[88vh] bg-[#030303] bg-[radial-gradient(circle_at_75%_50%,rgba(184,146,42,0.18),transparent_60%)]">
                            {/* Background Gradients */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-neutral-900/20 via-transparent to-black">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-gold/[0.03] blur-[150px] rounded-full"></div>
                            </div>

                            <div className="relative z-10 w-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between min-h-[88vh] pt-28 pb-12 gap-12">
                                <div className="max-w-xl reveal-on-scroll">
                                    <div className="inline-flex items-center gap-3 mb-5 px-3 py-2 border border-accent-gold/40 bg-accent-gold/5">
                                        <span className="w-2 h-2 bg-accent-gold rounded-full pulse-ring"></span>
                                        <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.22em] text-accent-gold">
                                            For those turning their business into a franchise
                                        </span>
                                    </div>
                                    <h1 className="font-black text-white leading-[0.92] tracking-tighter uppercase cinematic-text-shadow text-[clamp(2.1rem,4.4vw,4.2rem)] mb-5">
                                        The truth about<br />
                                        <span className="italic text-accent-gold drop-shadow-[0_0_30px_rgba(225,169,96,0.3)]">franchising your brand.</span>
                                    </h1>
                                    <p className="text-sm md:text-base text-white/65 leading-[1.7] max-w-lg mb-6">
                                        The real steps to structure your model, the critical mistakes that break early-stage brands, and the truths standard consultancies never tell you about the expansion market.
                                    </p>
                                    <div className="flex items-center gap-3 text-[11px] md:text-[12px] uppercase tracking-[0.2em] text-white/55 font-bold mb-7">
                                        <span className="material-symbols-outlined text-accent-gold text-base">verified</span>
                                        By Marinho Ponci <span className="text-white/20">·</span> 38 years in franchising
                                    </div>
                                    <button
                                        onClick={handleCheckout} disabled={checkoutLoading}
                                        className="cta-glow group relative px-8 py-4 bg-accent-gold text-black text-[13px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        <span className="relative flex items-center gap-2">
                                            I want the Dossier <span className="material-symbols-outlined text-base">arrow_forward</span>
                                        </span>
                                    </button>
                                </div>

                                {/* 3D-tilted book mockup on the right */}
                                <div 
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    className="relative w-[380px] h-[570px] flex-none hidden lg:flex items-center justify-center reveal-on-scroll mr-12 select-none cursor-pointer"
                                    style={tiltStyle}
                                >
                                    <div className="absolute -inset-10 bg-accent-gold/[0.08] blur-3xl rounded-full pointer-events-none"></div>
                                    <img
                                        src="/capa_franqueador.png"
                                        alt="The Future Franchisor Dossier"
                                        className="h-full w-auto object-contain shadow-[25px_35px_60px_rgba(0,0,0,0.9)] border border-white/10"
                                    />
                                    {/* 3D spine effect */}
                                    <div className="absolute inset-y-0 left-0 w-[10px] bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />
                                    {/* Glossy highlight effect */}
                                    <div className="absolute inset-y-0 left-[10px] right-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 pointer-events-none mix-blend-overlay" />
                                </div>
                            </div>
                        </div>

                        {/* ── MOBILE (<sm) ── */}
                        <div className="sm:hidden flex flex-col bg-black" style={{ minHeight: '100dvh' }}>
                            <div className="relative w-full flex-none flex items-center justify-center overflow-hidden bg-black" style={{ height: '68vh', paddingTop: '4.5rem' }}>
                                <div 
                                    className="relative h-[85%] select-none animate-fadeIn"
                                    style={{
                                        perspective: '1200px',
                                        transform: 'perspective(1200px) rotateY(-8deg) rotateX(2deg)',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <img
                                        src="/capa_franqueador.png"
                                        alt="The Future Franchisor Dossier"
                                        loading="eager"
                                        fetchPriority="high"
                                        className="h-full w-auto object-contain shadow-[15px_25px_40px_rgba(0,0,0,0.9)] border border-white/5"
                                    />
                                    <div className="absolute inset-y-0 left-0 w-[8px] bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none" />
                                    <div className="absolute inset-y-0 left-[8px] right-0 bg-gradient-to-r from-white/8 via-transparent to-white/5 pointer-events-none mix-blend-overlay" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
                            </div>

                            <div className="flex flex-col px-5 pt-2 pb-10">
                                <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 border border-accent-gold/40 bg-accent-gold/5 self-start">
                                    <span className="w-1.5 h-1.5 bg-accent-gold rounded-full pulse-ring"></span>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-gold">For those structuring a franchise</span>
                                </div>

                                <h1 className="font-black text-white leading-[0.9] tracking-tighter uppercase cinematic-text-shadow text-[clamp(1.85rem,6.2vw,2.3rem)] mb-3">
                                    The truth about<br />
                                    <span className="italic text-accent-gold drop-shadow-[0_0_20px_rgba(225,169,96,0.3)]">franchising your brand.</span>
                                </h1>

                                <p className="text-[13px] text-white/70 leading-[1.7] mb-7">
                                    The real steps to structure your model, the critical mistakes that break early-stage brands, and the truths standard consultancies never tell you about the expansion market.
                                </p>

                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold mb-6">
                                    <span className="material-symbols-outlined text-accent-gold text-sm">verified</span>
                                    Marinho Ponci · 38 years in franchising
                                </div>

                                <button
                                    onClick={handleCheckout} disabled={checkoutLoading}
                                    className="cta-glow group relative w-full py-4 bg-accent-gold text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <span className="relative flex items-center justify-center gap-2">
                                        I want the Dossier <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        2. IDENTIFICATION  ·  Pain mirror
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-[#050505]">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/[0.04] blur-[120px] rounded-full pointer-events-none"></div>

                        <div className="max-w-[1300px] mx-auto px-6 md:px-12">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    Do these challenges sound familiar?
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    Is franchising the right move
                                    <br />
                                    <span className="italic text-accent-gold">
                                        for your business right now?
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Turning a successful operation into a replicable network demands absolute clarity about risk and structure.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-px bg-white/5 reveal-on-scroll">
                                {[
                                    {
                                        icon: 'timer',
                                        headline: 'You want to grow, but lack the manpower',
                                        text: 'Day-to-day operations eat your time. You can see the potential to expand geographically, but you do not know how to delegate control and keep the standard.',
                                    },
                                    {
                                        icon: 'price_change',
                                        headline: 'The fees look confusing',
                                        text: 'How do you set the ideal franchise fee? How much should you charge in royalties to stay profitable without choking the financial health of the franchisee unit?',
                                    },
                                    {
                                        icon: 'gavel',
                                        headline: 'Fear of legal liability',
                                        text: 'The fear that a problematic franchisee could sue the brand or trigger labour claims that splash back onto your head office.',
                                    },
                                    {
                                        icon: 'description',
                                        headline: 'How to protect your trade secrets',
                                        text: 'How to put your process manuals on paper without former employees or franchisees copying your business model and becoming direct competitors.',
                                    },
                                    {
                                        icon: 'groups',
                                        headline: 'Pressure to sell units fast',
                                        text: 'Expansion consultancies promising to sell 10 franchises in the first month. You fear you will not have the support structure to serve that sudden demand.',
                                    },
                                    {
                                        icon: 'trending_up',
                                        headline: 'Structuring costs are high',
                                        text: 'Consultancies charge R$ 50,000 to R$ 100,000 to structure a franchise. You want to understand the process step by step before committing that kind of money.',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.headline}
                                        className="bg-[#080808] p-7 md:p-9 group hover:bg-[#0a0a0a] transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-11 h-11 border border-accent-gold/30 flex items-center justify-center shrink-0 group-hover:border-accent-gold transition-colors">
                                                <span className="material-symbols-outlined text-accent-gold text-xl">
                                                    {item.icon}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-lg md:text-xl mb-2 tracking-tight">
                                                    {item.headline}
                                                </h3>
                                                <p className="text-[14px] md:text-[15px] text-white/55 leading-[1.7]">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-10 reveal-on-scroll">
                                <p className="text-lg md:text-xl font-black italic text-white/80 max-w-xl mx-auto leading-[1.45]">
                                    If you want to franchise with clarity,{' '}
                                    <span className="text-accent-gold">this Dossier is for you.</span>
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        3. DESIRE  ·  Future pacing
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-black">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-accent-gold/[0.06] blur-[140px] rounded-full"></div>
                        </div>

                        <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    What changes in your expansion
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    Expand with{' '}
                                    <span className="italic text-accent-gold">control</span>
                                    ,<br />
                                    avoiding the usual traps.
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Three fundamental pillars you will master by the end of this guide.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-5 reveal-on-scroll">
                                {[
                                    {
                                        big: '01',
                                        icon: 'check_circle',
                                        title: 'Know if franchising is viable',
                                        text: 'Apply the real franchisability matrix to your pilot business. Understand whether your margins and differentiators survive a franchised operation.',
                                    },
                                    {
                                        big: '02',
                                        icon: 'fact_check',
                                        title: 'Legal protection and disclosure',
                                        text: 'Know what must be included and how to audit your manuals and disclosure document so you avoid labour and corporate litigation.',
                                    },
                                    {
                                        big: '03',
                                        icon: 'price_change',
                                        title: 'Sustainable royalties',
                                        text: 'Run the exact maths behind royalties, franchise fee and the national advertising fund to finance support and protect your margin.',
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.big}
                                        className="relative bg-[#0a0a0a] border border-white/10 p-8 md:p-10 hover:border-accent-gold/40 transition-all group"
                                    >
                                        <span className="absolute top-5 right-7 text-7xl font-black italic text-accent-gold/[0.06] leading-none select-none group-hover:text-accent-gold/[0.1] transition-colors">
                                            {item.big}
                                        </span>
                                        <div className="w-12 h-12 border border-accent-gold/30 flex items-center justify-center mb-6 group-hover:border-accent-gold group-hover:bg-accent-gold/5 transition-all">
                                            <span className="material-symbols-outlined text-accent-gold text-2xl">
                                                {item.icon}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-white text-xl md:text-2xl mb-4 tracking-tight uppercase">
                                            {item.title}
                                        </h3>
                                        <p className="text-[14px] md:text-[15px] text-white/60 leading-[1.75]">
                                            {item.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        4. VALUE  ·  Stack Slide
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-[#050505]">
                        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]"></div>

                        <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    Complete Structure
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    Six strategic modules
                                    <br />
                                    <span className="italic text-accent-gold">
                                        + 1 exclusive bonus.
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Lifetime access to Marinho Ponci's conceptual method for franchise structuring and expansion.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 md:gap-5 mb-10 reveal-on-scroll">
                                {MODULES.map((m, i) => (
                                    <div
                                        key={m.n}
                                        className="group relative bg-[#0a0a0a] border border-white/[0.07] p-7 md:p-8 hover:border-accent-gold/50 hover:bg-[#0c0c0c] transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/0 to-transparent group-hover:via-accent-gold/60 transition-all duration-500"></div>

                                        <span className="absolute top-4 right-6 text-7xl font-black italic text-white/[0.04] group-hover:text-accent-gold/[0.12] leading-none select-none transition-colors duration-500">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>

                                        <div className="relative">
                                            <div className="text-[11px] font-black uppercase tracking-[0.28em] text-accent-gold mb-4">
                                                {m.n}
                                            </div>

                                            <h3 className="font-black text-white text-xl md:text-2xl tracking-tight leading-[1.15] uppercase mb-4">
                                                {m.title}
                                            </h3>

                                            <p className="text-[14px] md:text-[15px] text-white/60 leading-[1.7] mb-5">
                                                {m.text}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-5">
                                                {m.pills.map((p) => (
                                                    <span
                                                        key={p}
                                                        className="text-[10px] uppercase tracking-[0.2em] text-accent-gold/85 border border-accent-gold/30 px-2.5 py-1 font-bold"
                                                    >
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                                                <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-bold">
                                                    Standalone value
                                                </span>
                                                <span className="text-sm font-black text-accent-gold/80 line-through tabular-nums">
                                                    {m.value}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mb-10 reveal-on-scroll">
                                <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold border border-accent-gold/40 px-4 py-2">
                                    Exclusive bonus
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-10 reveal-on-scroll">
                                {[
                                    {
                                        label: 'BONUS',
                                        title: 'The First Franchise Sales Meeting',
                                        text: 'How to present your franchise opportunity to qualified candidates: what to reveal, what to hold back during initial screening, and how to structure the brand\'s commercial proposal professionally.',
                                        value: 'R$ 397',
                                    },
                                ].map((b) => (
                                    <div
                                        key={b.title}
                                        className="bg-[#0a0a0a] border border-accent-gold/20 p-7 hover:border-accent-gold/50 transition-all relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent"></div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-accent-gold mb-3">
                                            {b.label}
                                        </div>
                                        <h3 className="font-black text-white text-lg md:text-xl mb-3 tracking-tight">
                                            {b.title}
                                        </h3>
                                        <p className="text-[14px] md:text-[15px] text-white/60 leading-[1.7] mb-5">
                                            {b.text}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-bold">
                                                Standalone value
                                            </span>
                                            <span className="text-sm font-black text-accent-gold/75 line-through tabular-nums">
                                                {b.value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="max-w-2xl mx-auto reveal-on-scroll">
                                <div className="bg-black border border-accent-gold/30 p-8 md:p-10 hud-border">
                                    <div className="text-center mb-7">
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4">
                                            Everything you get, added up
                                        </div>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-2xl text-white/40 line-through tabular-nums">
                                                R$
                                            </span>
                                            <span className="text-5xl md:text-6xl font-black text-white/40 line-through tabular-nums tracking-tighter">
                                                1.779
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-center mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold">
                                            Today, you do not pay that
                                        </span>
                                    </div>
                                    <div className="flex items-baseline justify-center gap-1 mb-2">
                                        <span className="text-3xl font-black text-white/80 align-super">
                                            R$
                                        </span>
                                        <span className="text-7xl md:text-8xl font-black shimmer-text leading-none tracking-tighter">
                                            247
                                        </span>
                                    </div>
                                    <div className="text-center text-sm text-white/55 mb-1">
                                        {PRICE_PARCELA}
                                    </div>
                                    <div className="text-center text-[12px] text-white/35 mb-7">
                                        {PRICE_PIX}
                                    </div>

                                    <button
                                        onClick={handleCheckout} disabled={checkoutLoading}
                                        className="cta-glow group relative w-full py-5 bg-accent-gold text-black text-sm md:text-base font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        <span className="relative flex items-center justify-center gap-2">
                                            I want to secure my access
                                            <span className="material-symbols-outlined">
                                                arrow_forward
                                            </span>
                                        </span>
                                    </button>
                                    <p className="text-center text-[10px] text-white/30 mt-3 font-bold uppercase tracking-[0.2em]">
                                        🔒 Secure Stripe payment · Instant access
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        5. AUTHORITY  ·  Marinho Ponci
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-black">
                        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    Who signs this material
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)]">
                                    Marinho Ponci,{' '}
                                    <span className="italic text-accent-gold">
                                        38 years in the market.
                                    </span>
                                </h2>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 reveal-on-scroll">
                                <div className="relative order-2 lg:order-2">
                                    <div className="absolute -inset-6 bg-accent-gold/8 blur-3xl rounded-full pointer-events-none"></div>
                                    <div className="relative aspect-[4/5] bg-[#0a0a0a] border border-white/10 hud-border overflow-hidden">
                                        <img
                                            src="/marinho principal.webp"
                                            alt="Marinho Ponci, franchising specialist"
                                            className="w-full h-full object-cover object-top opacity-90"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

                                        <div className="absolute bottom-7 left-7 right-7">
                                            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/15">
                                                {[
                                                    { n: '38', l: 'Years in\nfranchising' },
                                                    { n: '850+', l: 'Locations\nopened' },
                                                    { n: '3K+', l: 'Candidates\ninterviewed' },
                                                ].map((s) => (
                                                    <div key={s.n} className="text-center">
                                                        <div className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none mb-1">
                                                            {s.n}
                                                        </div>
                                                        <div className="text-[8px] uppercase tracking-[0.18em] text-accent-gold font-bold leading-[1.4] whitespace-pre-line">
                                                            {s.l}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-1 lg:order-1">
                                    <div className="border-l-2 border-accent-gold pl-6 mb-8">
                                        <p className="text-xl md:text-3xl font-black italic text-white leading-[1.35]">
                                            "I am not a coach or an influencer, and I am not here to motivate you with a pretty midnight quote. I am here because after 38 years watching the same story repeat itself — the same mistakes, the same illusions, the same rushed decisions — I decided it was time to open the microphone for real."
                                        </p>
                                        <p className="text-[11px] uppercase tracking-[0.3em] text-accent-gold/80 font-bold mt-4">
                                            Marinho Ponci
                                        </p>
                                    </div>

                                    <p className="text-[15px] text-white/60 leading-[1.85] mb-4">
                                        I decided to gather the strategic structuring knowledge that saves early-stage brands from spending fortunes on off-the-shelf consultancies before they have the proper groundwork.
                                    </p>
                                    <p className="text-[15px] text-white/60 leading-[1.85]">
                                        Franchising is excellent — as long as you know exactly where you are stepping and how to protect your network.{' '}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        6. OBJECTION HANDLING  ·  Guarantee + FAQ
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-[#050505]">
                        <div className="max-w-[1300px] mx-auto px-6 md:px-12">
                            {/* GUARANTEE */}
                            <div className="text-center max-w-2xl mx-auto mb-10 reveal-on-scroll">
                                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 hud-border bg-black float-y">
                                    <span className="material-symbols-outlined text-accent-gold text-4xl">
                                        verified
                                    </span>
                                </div>

                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                                    Unconditional guarantee
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.8rem,4vw,2.8rem)] mb-5">
                                    7 days.{' '}
                                    <span className="italic text-accent-gold">
                                        Zero risk.
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Access the material, use the worksheets and watch the strategic lessons. If it does not make sense for your brand within 7 days, we refund 100% of your money.
                                </p>
                            </div>

                            {/* FAQ */}
                            <div className="text-center mb-10 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                                    Frequently asked questions
                                </span>
                                <h3 className="font-black text-white leading-[1] tracking-tighter uppercase text-[clamp(1.5rem,3.2vw,2.3rem)]">
                                    Straight answers,{' '}
                                    <span className="italic text-accent-gold">
                                        no spin.
                                    </span>
                                </h3>
                            </div>

                            <div className="max-w-3xl mx-auto divide-y divide-white/[0.07] border-y border-white/[0.07] reveal-on-scroll">
                                {FAQ_ITEMS.map((item, idx) => (
                                    <div key={idx}>
                                        <button
                                            onClick={() => toggleFAQ(idx)}
                                            className="w-full text-left py-6 flex items-start justify-between gap-6 group"
                                            aria-expanded={openFAQ === idx}
                                        >
                                            <span className="font-black text-white text-base md:text-lg leading-snug group-hover:text-accent-gold transition-colors">
                                                {item.q}
                                            </span>
                                            <span
                                                className={`shrink-0 w-8 h-8 border border-accent-gold/30 flex items-center justify-center transition-all duration-300 ${
                                                    openFAQ === idx
                                                        ? 'rotate-45 border-accent-gold bg-accent-gold/10'
                                                        : ''
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-accent-gold text-base">
                                                    add
                                                </span>
                                            </span>
                                        </button>
                                        <div
                                            className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                                                openFAQ === idx
                                                    ? 'grid-rows-[1fr]'
                                                    : 'grid-rows-[0fr]'
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <p className="text-white/55 leading-[1.8] pb-6 pr-12 text-[14px] md:text-[15px]">
                                                    {item.a}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        7. CTA  ·  Lean close
                    =========================================================== */}
                    <section
                        id="cta-final"
                        className="py-16 md:py-24 relative overflow-hidden bg-black"
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent-gold/[0.06] blur-[140px] rounded-full"></div>
                            <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]"></div>
                        </div>

                        <div className="relative max-w-[820px] mx-auto px-6 md:px-12 text-center reveal-on-scroll">
                            <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(2rem,4.5vw,3.4rem)] mb-6">
                                The Future Franchisor Dossier
                            </h2>
                            <p className="text-base md:text-lg text-white/55 leading-[1.75] max-w-xl mx-auto mb-10">
                                R$ 247 is what it costs to understand the real strategic path to expanding your business — before you spend a fortune on legal advice or unprepared consultancies.
                            </p>

                            <button
                                onClick={handleCheckout} disabled={checkoutLoading}
                                className="cta-glow group relative inline-block px-12 md:px-16 py-5 md:py-6 bg-accent-gold text-black text-sm md:text-base font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    I want the Dossier now
                                    <span className="material-symbols-outlined">
                                        arrow_forward
                                    </span>
                                </span>
                            </button>

                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8">
                                {[
                                    { i: 'verified', l: 'Stripe payment' },
                                    { i: 'lock', l: 'Instant access' },
                                    { i: 'autorenew', l: '7-day guarantee' },
                                ].map((b) => (
                                    <div
                                        key={b.l}
                                        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/40 font-bold"
                                    >
                                        <span className="material-symbols-outlined text-accent-gold text-base">
                                            {b.i}
                                        </span>
                                        {b.l}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>

                {/* ============== FLOATING MOBILE CTA ============== */}
                <div className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden transition-all duration-500 ease-out ${pastHero ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                    <div className="bg-black/95 backdrop-blur-xl border-t border-accent-gold/20 px-4 py-3">
                        <button
                            onClick={handleCheckout}
                            disabled={checkoutLoading}
                            className="cta-glow group relative w-full py-3.5 bg-accent-gold text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                I want the Dossier
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </button>
                        <p className="text-center text-[9px] text-white/30 mt-2 font-bold uppercase tracking-[0.15em]">
                            3× R$ 89 interest-free · Pix R$ 222
                        </p>
                    </div>
                </div>

                {/* ============== PRE-CHECKOUT LEAD CAPTURE MODAL ============== */}
                {showLeadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#080808] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-3">
                                        Almost there
                                    </span>
                                    <h3 className="text-xl font-black text-white">Before you continue</h3>
                                    <p className="text-white/50 text-sm mt-1">Fill this in to secure your access.</p>
                                </div>
                                <button onClick={() => setShowLeadModal(false)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 ml-4">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleLeadSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Full name</label>
                                    <input
                                        type="text"
                                        value={leadName}
                                        onChange={e => setLeadName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">E-mail</label>
                                    <input
                                        type="email"
                                        value={leadEmail}
                                        onChange={e => setLeadEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Phone / WhatsApp</label>
                                    <input
                                        type="tel"
                                        value={leadPhone}
                                        onChange={e => setLeadPhone(e.target.value)}
                                        placeholder="+1 555 000 0000"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    />
                                </div>
                                {leadError && (
                                    <p className="text-red-400 text-xs font-bold">{leadError}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={leadSubmitting}
                                    className="w-full py-4 bg-accent-gold text-black font-black text-[11px] uppercase tracking-[0.3em] rounded-lg hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {leadSubmitting ? (
                                        <><span className="material-symbols-outlined animate-spin text-base">autorenew</span> Please wait...</>
                                    ) : (
                                        'Go to payment'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ============== CHECKOUT ERROR TOAST ============== */}
                {checkoutError && (
                    <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#0a0a0a] border border-red-500/40 p-4 shadow-[0_0_30px_rgba(239,68,68,0.25)] animate-fadeIn">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-400 text-xl shrink-0">
                                error
                            </span>
                            <div className="flex-1">
                                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-red-400 mb-1">
                                    Checkout failed
                                </div>
                                <p className="text-[13px] text-white/70 leading-snug">
                                    {checkoutError}
                                </p>
                            </div>
                            <button
                                onClick={() => setCheckoutError(null)}
                                className="text-white/40 hover:text-white transition-colors"
                                aria-label="Close"
                            >
                                <span className="material-symbols-outlined text-base">
                                    close
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ============== FOOTER ============== */}
                <footer className="bg-black border-t border-white/5 py-10 md:py-12">
                    <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-5">
                        <Link to="/" className="flex items-center gap-3">
                            <img
                                src="/marinho final.webp"
                                alt="Marinho Ponci"
                                className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity"
                            />
                        </Link>
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25 text-center">
                            © {new Date().getFullYear()} Marinho Ponci · All rights reserved
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
