import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// =====================================================================
// EBOOK LANDING PAGE — /ebook-ingles
// "The Future Franchisee Dossier" — Marinho Ponci
// =====================================================================

const PRICE_PARCELA = '3× of R$ 89.00 interest-free';
const PRICE_PIX = 'R$ 222.30 via Pix (10% off) or Credit Card';

// 6 modules of the Dossier
const MODULES = [
    {
        n: 'MOD 01',
        title: 'Assessing your current situation',
        text: 'Before looking at brands, look inward. Profile, financial health, family. The correct decision starts here.',
        pills: ['Video', 'Self-Assessment'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 02',
        title: 'The reality of franchising',
        text: 'No guaranteed salary. No magic formula. What changes when you transition from employee to unit owner.',
        pills: ['Video', 'Timeline'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 03',
        title: 'Market research and purpose',
        text: '"Which franchise makes the most money?" is the wrong question. Marinho shows you the right question to start.',
        pills: ['Video', 'Affinity Map'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 04',
        title: 'Real financial planning',
        text: 'Personal financial X-ray. Real working capital. The danger of excessive leverage. Honest numbers.',
        pills: ['Video', 'Financial X-Ray'],
        value: 'R$ 297',
    },
    {
        n: 'MOD 05',
        title: 'The transition and Garden Theory',
        text: 'How to leave your job without jumping in the dark. The logic of 2/3 preparation for 1/3 execution.',
        pills: ['Video', 'Transition Plan'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 06',
        title: 'The moment of decision',
        text: 'How to turn months of study into conscious action. And how to know when "yes" is ready, or "no" is wiser.',
        pills: ['Video', 'Decision Checklist'],
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
        return { ok: false, error: 'Server response missing checkout URL' };
    } catch (err: any) {
        return { ok: false, error: err.message || 'Failed to start checkout' };
    }
}

const FAQ_ITEMS = [
    {
        q: 'Is the Dossier just a PDF e-book?',
        a: 'It is not just a PDF. It is an interactive program with 6 video modules recorded by Marinho, practical exercises applicable to your real situation, guided reflections, and the exclusive bonus "The Meeting with the Franchisor". All inside a secure member area with permanent access.',
    },
    {
        q: 'How long does it take to get access?',
        a: 'Immediate access. For credit card purchases, you receive the login credentials in your email within seconds. For Pix, within 2 minutes after payment confirmation.',
    },
    {
        q: 'What if I do not like it? Is there a guarantee?',
        a: 'Yes. 7-day unconditional guarantee. You access, test, and do the exercises. If it does not make sense, just send an email requesting a refund and we return 100% of your money. No questions asked, no bureaucracy. And you keep the bonuses.',
    },
    {
        q: 'Does it work if I have not chosen the business segment yet?',
        a: 'It works best for you. Most of the Dossier is about the decision before the decision: profile, purpose, financial capacity, life moment. Those who enter with a chosen segment are the ones who re-evaluate the most.',
    },
    {
        q: 'How long does it take to consume the material?',
        a: 'On average, 6 to 8 hours spread across modules. But the recommendation is not to rush: each module brings exercises that require reflection. Those who decide well sleep on the question before answering.',
    },
    {
        q: 'Will I learn which franchise to buy?',
        a: 'No. That is the mistake the Dossier fights. You learn to ask the right questions so that the answer to "which brand" comes from you, informed, not sold. Marinho does not recommend brands. He gives a method.',
    },
    {
        q: 'Can I pay in installments?',
        a: 'Yes, up to 3× of R$ 89.00 interest-free on credit cards, or Pix with a 10% discount (R$ 222.30).',
    },
    {
        q: 'How does the invoice work?',
        a: 'Issued automatically after payment and sent by email within 24 hours.',
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
    name: 'The Future Franchisee Dossier',
    description:
        'Interactive program with 6 video modules, practical exercises, and reflections for those about to invest in a franchise. By Marinho Ponci, 38 years behind the scenes in franchising.',
    image: 'https://marinhoponci.com/og-dossie.jpg',
    brand: { '@type': 'Brand', name: 'Marinho Ponci' },
    offers: {
        '@type': 'Offer',
        price: '247.00',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url: 'https://marinhoponci.com/ebook-ingles',
    },
};

export default function EbookLandingPageEn() {
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
                    source: 'ebook-en',
                }),
            });
        } catch (err) {
            console.error('Lead error:', err);
        }

        setShowLeadModal(false);
        setCheckoutError(null);
        setCheckoutLoading(true);
        const result = await startCheckout('dossie_futuro_franqueado_en');
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
        document.title = 'The Future Franchisee Dossier | Marinho Ponci — 38 years in franchising';

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

        const description = 'Discover the truth about investing in a franchise. The questions you should ask, the numbers nobody mentions, and what it really means to own a franchise.';
        
        setMeta('description', description);
        setMeta('robots', 'index,follow,max-image-preview:large');
        setMeta('og:title', 'The Future Franchisee Dossier | Marinho Ponci', true);
        setMeta('og:description', description, true);
        setMeta('og:type', 'product', true);
        setMeta('og:url', 'https://marinhoponci.com/ebook-ingles', true);
        setMeta('og:image', 'https://marinhoponci.com/og-dossie-en.jpg', true);
        setMeta('og:locale', 'en_US', true);
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', 'The Future Franchisee Dossier');
        setMeta('twitter:description', description);

        let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://marinhoponci.com/ebook-ingles');

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
                                to="/franqueador"
                                className="text-[10px] font-black uppercase tracking-[0.18em] border border-white/25 text-white/60 hover:text-accent-gold hover:border-accent-gold px-3 py-2 transition-all mr-1 flex items-center gap-1"
                                title="Dossiê para Franqueadores"
                            >
                                For Franchisors <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>

                            <Link
                                to="/ebook"
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
                                    Get the Dossier <span className="material-symbols-outlined text-base">arrow_forward</span>
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
                                            For those about to invest in a franchise
                                        </span>
                                    </div>
                                    <h1 className="font-black text-white leading-[0.92] tracking-tighter uppercase cinematic-text-shadow text-[clamp(2.1rem,4.4vw,4.2rem)] mb-5">
                                        The truth that<br />
                                        <span className="italic text-accent-gold drop-shadow-[0_0_30px_rgba(225,169,96,0.3)]">nobody tells you.</span>
                                    </h1>
                                    <p className="text-sm md:text-base text-white/65 leading-[1.7] max-w-lg mb-6">
                                        The questions you should ask, the numbers nobody mentions, the truth about what it means{' '}
                                        <span className="italic text-accent-gold/90">to own a franchise unit</span>.
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
                                            Get the Dossier <span className="material-symbols-outlined text-base">arrow_forward</span>
                                        </span>
                                    </button>
                                </div>

                                {/* Mockup do livro enquadrado à direita com relevo 3D */}
                                <div 
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    className="relative w-[380px] h-[570px] flex-none hidden lg:flex items-center justify-center reveal-on-scroll mr-12 select-none cursor-pointer"
                                    style={tiltStyle}
                                >
                                    <div className="absolute -inset-10 bg-accent-gold/[0.08] blur-3xl rounded-full pointer-events-none"></div>
                                    <img
                                        src="/dossie_ingles.png"
                                        alt="The Future Franchisee Dossier"
                                        className="h-full w-auto object-contain shadow-[25px_35px_60px_rgba(0,0,0,0.9)] border border-white/10"
                                    />
                                    {/* Efeito Lombo 3D */}
                                    <div className="absolute inset-y-0 left-0 w-[10px] bg-gradient-to-r from-black/70 via-black/20 to-transparent pointer-events-none" />
                                    {/* Efeito Brilho Glossy */}
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
                                        src="/dossie_ingles.png"
                                        alt="The Future Franchisee Dossier"
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
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-gold">For those investing in a franchise</span>
                                </div>

                                <h1 className="font-black text-white leading-[0.9] tracking-tighter uppercase cinematic-text-shadow text-[clamp(1.85rem,6.2vw,2.3rem)] mb-3">
                                    The truth that<br />
                                    <span className="italic text-accent-gold drop-shadow-[0_0_20px_rgba(225,169,96,0.3)]">nobody tells you.</span>
                                </h1>

                                <p className="text-[13px] text-white/65 leading-[1.65] mb-4">
                                    The questions you should ask, the numbers nobody mentions, the truth about what it means{' '}
                                    <span className="italic text-accent-gold/90">to own a franchise unit</span>.
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
                                        Get the Dossier <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        2. IDENTIFICATION  ·  Pain mirroring
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-[#050505]">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/[0.04] blur-[120px] rounded-full pointer-events-none"></div>

                        <div className="max-w-[1300px] mx-auto px-6 md:px-12">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    Do you recognize any of these?
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    You are not the only one
                                    <br />
                                    <span className="italic text-accent-gold">
                                        at this crossroads.
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Most people who arrive here are exactly at this point. 
                                    See if one of these situations is yours.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-px bg-white/5 reveal-on-scroll">
                                {[
                                    {
                                        icon: 'sentiment_dissatisfied',
                                        headline: 'You are tired of your 9-to-5',
                                        text: 'You want to leave, but you are afraid of making a mistake. A franchise seems like the safe path, but something inside you is suspicious.',
                                    },
                                    {
                                        icon: 'visibility_off',
                                        headline: 'The numbers do not add up',
                                        text: 'The franchisor shows encouraging projections. You feel something is missing, but you do not know where to look.',
                                    },
                                    {
                                        icon: 'forum',
                                        headline: 'The consultant feels like a friend',
                                        text: 'They answer fast, send WhatsApp audios, and tell you "this is your chance". You know they earn commission, but you keep listening.',
                                    },
                                    {
                                        icon: 'schedule',
                                        headline: 'They are rushing you',
                                        text: '"The entry fee goes up next week", "only 2 territories left". The pressure is real and you feel you need to decide now.',
                                    },
                                    {
                                        icon: 'family_restroom',
                                        headline: 'The family is divided',
                                        text: 'Some think it is a great idea, others are afraid. You need real information to talk with clarity, not just faith.',
                                    },
                                    {
                                        icon: 'savings',
                                        headline: 'It is a lifetime of savings',
                                        text: 'This money came from years of hard work. Making a mistake is not just losing money: it is losing years. You want certainty before moving.',
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
                                    If you identify with this,{' '}
                                    <span className="text-accent-gold">the Dossier is for you.</span>
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
                                    What changes in 30 days
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    Decide with{' '}
                                    <span className="italic text-accent-gold">clarity</span>
                                    ,<br />
                                    not with pressure.
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Three concrete results you will achieve by completing the Dossier.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-5 reveal-on-scroll">
                                {[
                                    {
                                        big: '01',
                                        icon: 'psychology_alt',
                                        title: 'You will KNOW',
                                        text: 'Know if franchising is the path, or if you are running away from something else. The difference between passion and purpose becomes clear.',
                                    },
                                    {
                                        big: '02',
                                        icon: 'fact_check',
                                        title: 'You will ASK',
                                        text: 'Enter meetings with the franchisor armed with a checklist. Hear what they say and what they do NOT say. Negociate like an adult.',
                                    },
                                    {
                                        big: '03',
                                        icon: 'shield_lock',
                                        title: 'You will PROTECT',
                                        text: 'Real working capital, realistic timeframe, plan B on the table. If you decide to enter, you enter protected. If not, you exit without scars.',
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

                            <div className="text-center mt-10 reveal-on-scroll">
                                <p className="text-lg md:text-xl font-black italic text-white/80 max-w-2xl mx-auto leading-[1.45]">
                                    In the end, the answer will be{' '}
                                    <span className="text-accent-gold">yours</span>, not the franchisor’s.
                                </p>
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
                                    Everything you receive
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    Six modules
                                    <br />
                                    <span className="italic text-accent-gold">
                                        + 1 exclusive bonus.
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Each module combines Marinho’s video, practical exercises, and guided reflections. Permanent access.
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
                                                    Individual Value
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
                                    Exclusive Bonus
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-10 reveal-on-scroll">
                                {[
                                    {
                                        label: 'BONUS',
                                        title: 'The Meeting with the Franchisor',
                                        text: 'A complete guide for when you enter that meeting: what to ask, what to observe, what it means when they hesitate, what it means when they speak too fast. Here you learn the body language of the "unspoken".',
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
                                                Individual Value
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
                                            Total Value of Everything You Receive
                                        </div>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-2xl text-white/40 line-through tabular-nums">
                                                R$
                                            </span>
                                            <span className="text-5xl md:text-6xl font-black text-white/40 line-through tabular-nums tracking-tighter">
                                                1,779
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
                                            Get Secure Access Now
                                            <span className="material-symbols-outlined">
                                                arrow_forward
                                            </span>
                                        </span>
                                    </button>
                                    <p className="text-center text-[10px] text-white/30 mt-3 font-bold uppercase tracking-[0.2em]">
                                        🔒 Secure Stripe Payment · Immediate Access
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
                                    Who created this material
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
                                                    { n: '850+', l: 'Units\nopened' },
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
                                            "I am not a coach or an influencer, and I am not here to motivate you with pretty midnight quotes. I am here because, after 38 years of watching the same story repeat itself—the same mistakes, the same illusions, the same rushed decisions—I decided it was time to open the microphone for real."
                                        </p>
                                        <p className="text-[11px] uppercase tracking-[0.3em] text-accent-gold/80 font-bold mt-4">
                                            Marinho Ponci
                                        </p>
                                    </div>

                                    <p className="text-[15px] text-white/60 leading-[1.85] mb-4">
                                        I decided to share what I learned during all these years: the method, the questions that matter, the reality that nobody tells you.
                                    </p>
                                    <p className="text-[15px] text-white/60 leading-[1.85]">
                                        Because you deserve to enter franchising (if you decide to enter) with your eyes wide open.{' '}
                                        <span className="italic text-accent-gold">
                                            Not in shock, under pressure, and without clarity.
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        6. RISK REVERSAL  ·  Guarantee + Comparison + FAQ
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
                                    Unconditional Guarantee
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.8rem,4vw,2.8rem)] mb-5">
                                    7 days.{' '}
                                    <span className="italic text-accent-gold">
                                        Zero risk.
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Access it, do the exercises, and test the method. If it does not make sense to you within 7 days,{' '}
                                    <strong className="text-white">
                                        we refund 100% of your money, no questions asked
                                    </strong>{' '}
                                    and you keep the bonuses.
                                </p>
                            </div>

                            {/* COMPARISON */}
                            <div className="text-center max-w-2xl mx-auto mb-10 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                                    The real difference
                                </span>
                                <h3 className="font-black text-white leading-[1] tracking-tighter uppercase text-[clamp(1.5rem,3.2vw,2.3rem)]">
                                    Without the method{' '}
                                    <span className="italic text-accent-gold">vs</span> with the method
                                </h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-px bg-white/10 mb-16 reveal-on-scroll">
                                <div className="bg-[#080808] p-8 md:p-10 relative">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-7">
                                        WITHOUT the Dossier
                                    </div>
                                    <ul className="space-y-4">
                                        {[
                                            'Decision driven by the consultant’s enthusiasm',
                                            'Underestimated working capital',
                                            'Superficial personal profile assessment',
                                            'Wrong question: "which brand?"',
                                            'Entering the franchisor meeting blind',
                                            'Risk of promised payback being 2x to 3x longer than reality',
                                        ].map((item, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-3 text-[14px] md:text-[15px] text-white/45 leading-[1.7]"
                                            >
                                                <span className="material-symbols-outlined text-red-500/60 text-lg shrink-0 mt-0.5">
                                                    close
                                                </span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-[#0a0a0a] p-8 md:p-10 relative border-t-2 border-accent-gold">
                                    <div className="absolute top-0 right-0 px-4 py-2 bg-accent-gold text-black text-[9px] font-black uppercase tracking-[0.25em]">
                                        Recommended
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-7">
                                        WITH the Dossier
                                    </div>
                                    <ul className="space-y-4">
                                        {[
                                            'Decision guided by a 38-year validated method',
                                            'Working capital calculated based on reality',
                                            'Complete self-assessment of profile and life moment',
                                            'Right question first: alignment',
                                            'Franchisor meeting with a checklist in hand',
                                            'You sign with clarity, or discover that now is not the time',
                                        ].map((item, i) => (
                                            <li
                                                key={i}
                                                className="flex items-start gap-3 text-[14px] md:text-[15px] text-white/85 leading-[1.7]"
                                            >
                                                <span className="material-symbols-outlined text-accent-gold text-lg shrink-0 mt-0.5">
                                                    check
                                                </span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* FAQ */}
                            <div className="text-center mb-10 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                                    Frequently Asked Questions
                                </span>
                                <h3 className="font-black text-white leading-[1] tracking-tighter uppercase text-[clamp(1.5rem,3.2vw,2.3rem)]">
                                    FAQ{' '}
                                    <span className="italic text-accent-gold">
                                        without beating around the bush.
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
                        7. CTA  ·  Final Call
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
                                Before signing,{' '}
                                <span className="italic text-accent-gold">read this.</span>
                            </h2>
                            <p className="text-base md:text-lg text-white/55 leading-[1.75] max-w-xl mx-auto mb-10">
                                R$ 247 is the cost of clarity before you commit R$ 150k or more. 
                                Permanent access, 7-day guarantee.
                            </p>

                            <button
                                onClick={handleCheckout} disabled={checkoutLoading}
                                className="cta-glow group relative inline-block px-12 md:px-16 py-5 md:py-6 bg-accent-gold text-black text-sm md:text-base font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    Get the Dossier Now
                                    <span className="material-symbols-outlined">
                                        arrow_forward
                                    </span>
                                </span>
                            </button>

                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8">
                                {[
                                    { i: 'verified', l: 'Stripe Payment' },
                                    { i: 'lock', l: 'Immediate Access' },
                                    { i: 'autorenew', l: '7-Day Guarantee' },
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

                {/* ============== CTA FLUTUANTE MOBILE ============== */}
                <div className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden transition-all duration-500 ease-out ${pastHero ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
                    <div className="bg-black/95 backdrop-blur-xl border-t border-accent-gold/20 px-4 py-3">
                        <button
                            onClick={handleCheckout}
                            disabled={checkoutLoading}
                            className="cta-glow group relative w-full py-3.5 bg-accent-gold text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative flex items-center justify-center gap-2">
                                Get the Dossier
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </button>
                        <p className="text-center text-[9px] text-white/30 mt-2 font-bold uppercase tracking-[0.15em]">
                            3× R$ 89 interest-free · Pix R$ 222
                        </p>
                    </div>
                </div>

                {/* ============== MODAL CAPTURA DE LEAD PRÉ-CHECKOUT ============== */}
                {showLeadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-[#080808] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6">
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <div>
                                    <span className="inline-block px-3 py-1 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-3">
                                        Almost there
                                    </span>
                                    <h3 className="text-xl font-black text-white">Before continuing</h3>
                                    <p className="text-white/50 text-sm mt-1">Fill in to guarantee your access.</p>
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
                                        placeholder="your@email.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Phone / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={leadPhone}
                                        onChange={e => setLeadPhone(e.target.value)}
                                        placeholder="Phone number"
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
                                        <><span className="material-symbols-outlined animate-spin text-base">autorenew</span> Wait...</>
                                    ) : (
                                        'Go to payment'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* ============== TOAST DE ERRO DE CHECKOUT ============== */}
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
