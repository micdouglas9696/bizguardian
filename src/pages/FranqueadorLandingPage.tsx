import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// =====================================================================
// EBOOK LANDING PAGE — /franqueador
// "O Dossiê do Futuro Franqueador" — Marinho Ponci
// =====================================================================

const PRICE_PARCELA = '3× de R$ 89,00 sem juros';
const PRICE_PIX = 'R$ 222,30 via Pix (10% off) ou Cartão';

// 6 módulos do Dossiê do Futuro Franqueador
const MODULES = [
    {
        n: 'MOD 01',
        title: 'Franqueabilidade do seu Negócio',
        text: 'Como avaliar de forma fria e realista se a sua empresa de sucesso está realmente pronta para ser replicada (Maturidade, Margem e Diferenciais de mercado).',
        pills: ['Vídeo', 'Checklist de Franqueabilidade'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 02',
        title: 'Formatação Jurídica e Operacional',
        text: 'A verdade sobre a COF (Circular de Oferta de Franquia), Contratos e os Manuais de Operações. Como estruturar os pilares que protegem a sua marca de passivos.',
        pills: ['Vídeo', 'Guia da COF'],
        value: 'R$ 297',
    },
    {
        n: 'MOD 03',
        title: 'Economia da Rede e Royalties',
        text: 'Como calcular e precificar de forma sustentável a Taxa de Franquia, os Royalties e o Fundo de Propaganda. A equação financeira que garante o lucro do Franqueador.',
        pills: ['Vídeo', 'Calculadora de Royalties'],
        value: 'R$ 297',
    },
    {
        n: 'MOD 04',
        title: 'Estrutura de Suporte e Treinamento',
        text: 'Como estruturar o suporte sem inchar a sua operação. Do onboarding do franqueado ao acompanhamento e treinamento contínuo da rede.',
        pills: ['Vídeo', 'Matriz de Suporte'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 05',
        title: 'Seleção de Franqueados Parceiros',
        text: 'Como desenhar o perfil ideal e selecionar os primeiros franqueados. O perigo de vender para qualquer um pelo caixa rápido da taxa de franquia.',
        pills: ['Vídeo', 'Roteiro de Entrevista'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 06',
        title: 'Expansão e Gestão de Conflitos',
        text: 'Como planejar a expansão regional ou nacional de forma orgânica e estruturada. Estratégias práticas para lidar com conflitos e manter a rede engajada.',
        pills: ['Vídeo', 'Manual de Gestão de Crise'],
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
            const err = await resp.json().catch(() => ({ error: 'Erro' }));
            return { ok: false, error: err.error || `HTTP ${resp.status}` };
        }
        const data = await resp.json();
        if (data.url) {
            window.location.href = data.url;
            return { ok: true };
        }
        return { ok: false, error: 'Resposta do servidor sem URL de checkout' };
    } catch (err: any) {
        return { ok: false, error: err.message || 'Falha ao iniciar checkout' };
    }
}

const FAQ_ITEMS = [
    {
        q: 'O Dossiê é apenas um e-book?',
        a: 'Não. É um programa decisório com 6 módulos em vídeo gravados pelo Marinho, roteiros e checklists práticos aplicados para que você possa entender o processo real de formatação da sua marca e expansão, incluindo o bônus "A Primeira Reunião de Venda". Todo o material fica em uma área de membros segura.',
    },
    {
        q: 'Em quanto tempo recebo o acesso?',
        a: 'Acesso imediato. Pagamentos via cartão de crédito e Pix liberam as credenciais de acesso no seu e-mail em segundos.',
    },
    {
        q: 'Tenho garantia se eu não gostar?',
        a: 'Sim. Você tem 7 dias de garantia incondicional. Se você acessar o material e achar que ele não serve para o momento do seu negócio, basta solicitar o reembolso por e-mail e devolvemos 100% do seu dinheiro.',
    },
    {
        q: 'Este dossiê substitui uma consultoria jurídica?',
        a: 'Não. O dossiê fornece o método conceitual e o direcionamento estratégico baseado em 38 anos de experiência do Marinho para que você saiba auditar o seu negócio e dialogar com advogados e consultores, mas não substitui a assessoria jurídica especializada para confeccionar sua COF e Manuais.',
    },
    {
        q: 'O material serve para quem ainda tem apenas uma ideia?',
        a: 'O dossiê é ideal para quem já tem uma empresa operando e faturando com sucesso, e quer entender o caminho estratégico para transformá-la em franquia. Se você tem apenas uma ideia no papel, recomendo primeiro validar a sua operação piloto.',
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
    name: 'O Dossiê do Futuro Franqueador',
    description:
        'Método completo e checklists de franqueabilidade para empresários de sucesso que querem formatar e expandir seu negócio através do franchising. Por Marinho Ponci.',
    image: 'https://marinhoponci.com/og-dossie-franqueador.jpg',
    brand: { '@type': 'Brand', name: 'Marinho Ponci' },
    offers: {
        '@type': 'Offer',
        price: '247.00',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url: 'https://marinhoponci.com/franqueador',
    },
};

export default function FranqueadorLandingPage() {
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
            setLeadError('Por favor, preencha todos os campos.');
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
                    source: 'franqueador',
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
            setCheckoutError(result.error || 'Erro ao iniciar checkout');
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
        document.title = 'O Dossiê do Futuro Franqueador | Marinho Ponci — 38 anos de franchising';

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

        const description = 'Descubra como formatar seu negócio e criar uma rede de franquias de sucesso. Circular de Oferta (COF), royalties, matriz de franqueabilidade e blindagem jurídica com Marinho Ponci.';
        
        setMeta('description', description);
        setMeta('robots', 'index,follow,max-image-preview:large');
        setMeta('og:title', 'O Dossiê do Futuro Franqueador | Marinho Ponci', true);
        setMeta('og:description', description, true);
        setMeta('og:type', 'product', true);
        setMeta('og:url', 'https://marinhoponci.com/franqueador', true);
        setMeta('og:image', 'https://marinhoponci.com/og-dossie-franqueador.jpg', true);
        setMeta('og:locale', 'pt_BR', true);
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', 'O Dossiê do Futuro Franqueador');
        setMeta('twitter:description', description);

        let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://marinhoponci.com/franqueador');

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
                                to="/ebook"
                                className="text-[10px] font-black uppercase tracking-[0.18em] border border-white/25 text-white/60 hover:text-accent-gold hover:border-accent-gold px-3 py-2 transition-all mr-1 flex items-center gap-1"
                                title="Dossiê para Franqueados"
                            >
                                Sou Franqueado <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>

                            <Link
                                to="/membro/login"
                                className="group relative px-4 py-2 bg-accent-gold text-black text-[10px] font-black uppercase tracking-[0.18em] hover:bg-white transition-all duration-300 whitespace-nowrap"
                            >
                                Membro
                            </Link>

                            <button
                                onClick={handleCheckout}
                                disabled={checkoutLoading}
                                className={`cta-glow group relative px-5 py-2 bg-accent-gold text-black text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] hover:bg-white transition-all duration-500 overflow-hidden hidden sm:inline-flex ${pastHero ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="relative flex items-center gap-2">
                                    Quero o Dossiê <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </header>

                <main ref={mainRef}>
                    {/* ===========================================================
                        1. ATENÇÃO  ·  Hook
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
                                            Para quem quer transformar seu negócio em franquia
                                        </span>
                                    </div>
                                    <h1 className="font-black text-white leading-[0.92] tracking-tighter uppercase cinematic-text-shadow text-[clamp(2.1rem,4.4vw,4.2rem)] mb-5">
                                        A verdade sobre<br />
                                        <span className="italic text-accent-gold drop-shadow-[0_0_30px_rgba(225,169,96,0.3)]">franquear sua marca.</span>
                                    </h1>
                                    <p className="text-sm md:text-base text-white/65 leading-[1.7] max-w-lg mb-6">
                                        Os passos reais para formatar, os erros cruciais que quebram marcas iniciantes e as verdades que as consultorias padrão não te revelam sobre o mercado de expansão.
                                    </p>
                                    <div className="flex items-center gap-3 text-[11px] md:text-[12px] uppercase tracking-[0.2em] text-white/55 font-bold mb-7">
                                        <span className="material-symbols-outlined text-accent-gold text-base">verified</span>
                                        Por Marinho Ponci <span className="text-white/20">·</span> 38 anos de franchising
                                    </div>
                                    <button
                                        onClick={handleCheckout} disabled={checkoutLoading}
                                        className="cta-glow group relative px-8 py-4 bg-accent-gold text-black text-[13px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                        <span className="relative flex items-center gap-2">
                                            Quero o Dossiê <span className="material-symbols-outlined text-base">arrow_forward</span>
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
                                        src="/capa_franqueador.png"
                                        alt="O Dossiê do Futuro Franqueador"
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
                                        src="/capa_franqueador.png"
                                        alt="O Dossiê do Futuro Franqueador"
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
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-gold">Para quem vai formatar uma franquia</span>
                                </div>

                                <h1 className="font-black text-white leading-[0.9] tracking-tighter uppercase cinematic-text-shadow text-[clamp(1.85rem,6.2vw,2.3rem)] mb-3">
                                    A verdade sobre<br />
                                    <span className="italic text-accent-gold drop-shadow-[0_0_20px_rgba(225,169,96,0.3)]">franquear sua marca.</span>
                                </h1>

                                <p className="text-[13px] text-white/70 leading-[1.7] mb-7">
                                    Os passos reais para formatar, os erros cruciais que quebram marcas iniciantes e as verdades que as consultorias padrão não te revelam sobre o mercado de expansão.
                                </p>

                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold mb-6">
                                    <span className="material-symbols-outlined text-accent-gold text-sm">verified</span>
                                    Marinho Ponci · 38 anos de franchising
                                </div>

                                <button
                                    onClick={handleCheckout} disabled={checkoutLoading}
                                    className="cta-glow group relative w-full py-4 bg-accent-gold text-black text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <span className="relative flex items-center justify-center gap-2">
                                        Quero o Dossiê <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        2. IDENTIFICAÇÃO  ·  Espelho da dor
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-[#050505]">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/[0.04] blur-[120px] rounded-full pointer-events-none"></div>

                        <div className="max-w-[1300px] mx-auto px-6 md:px-12">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    Identifica estes desafios?
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    Franquear é o passo certo
                                    <br />
                                    <span className="italic text-accent-gold">
                                        para o seu negócio agora?
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Transformar uma operação de sucesso em uma rede replicável exige clareza absoluta sobre riscos e estrutura.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-px bg-white/5 reveal-on-scroll">
                                {[
                                    {
                                        icon: 'timer',
                                        headline: 'Você quer crescer, mas falta braço',
                                        text: 'A operação do dia a dia consome seu tempo. Você vê o potencial de expandir geograficamente, mas não sabe como delegar o controle e o padrão.',
                                    },
                                    {
                                        icon: 'price_change',
                                        headline: 'As taxas parecem confusas',
                                        text: 'Como definir a taxa de franquia ideal? De quanto cobrar de royalties para ter lucro sem sufocar a saúde financeira da unidade do franqueado?',
                                    },
                                    {
                                        icon: 'gavel',
                                        headline: 'Medo de passivo jurídico',
                                        text: 'O receio de que um franqueado problemático possa processar a marca ou gerar processos trabalhistas que respinguem na sua matriz.',
                                    },
                                    {
                                        icon: 'description',
                                        headline: 'Como blindar seus segredos comerciais',
                                        text: 'Como colocar seus manuais de processos em papel sem risco de ex-funcionários ou franqueados copiarem seu modelo de negócio e virarem concorrentes diretos.',
                                    },
                                    {
                                        icon: 'groups',
                                        headline: 'Pressão por vender unidades rápido',
                                        text: 'Consultorias de expansão prometendo vender 10 franquias no primeiro mês. Você teme não ter estrutura de suporte para atender a essa demanda repentina.',
                                    },
                                    {
                                        icon: 'trending_up',
                                        headline: 'Investimento de formatar é alto',
                                        text: 'Consultorias cobram R$ 50 mil a R$ 100 mil para formatar. Você quer o caminho das pedras para entender o processo antes de investir esse valor.',
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
                                    Se você quer franquear com clareza,{' '}
                                    <span className="text-accent-gold">este Dossiê é para você.</span>
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        3. DESEJO  ·  Future pacing
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-black">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-accent-gold/[0.06] blur-[140px] rounded-full"></div>
                        </div>

                        <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    O que muda na sua expansão
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    Expandir com{' '}
                                    <span className="italic text-accent-gold">controle</span>
                                    ,<br />
                                    evitando as armadilhas comuns.
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Três pilares fundamentais que você dominará ao concluir este guia.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-5 reveal-on-scroll">
                                {[
                                    {
                                        big: '01',
                                        icon: 'check_circle',
                                        title: 'Saber se dá para franquear',
                                        text: 'Aplicar a matriz real de franqueabilidade no seu negócio piloto. Entender se suas margens e diferenciais resistem a uma operação franqueada.',
                                    },
                                    {
                                        big: '02',
                                        icon: 'fact_check',
                                        title: 'Blindagem Jurídica e COF',
                                        text: 'Saber o que deve constar e como auditar seus manuais e Circular de Oferta para não cair em litígios trabalhistas ou societários.',
                                    },
                                    {
                                        big: '03',
                                        icon: 'price_change',
                                        title: 'Sustentabilidade dos Royalties',
                                        text: 'Calcular a matemática exata de royalties, taxa de franquia e fundo nacional de propaganda para financiar o suporte e garantir sua margem.',
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
                        4. VALOR  ·  Stack Slide
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-[#050505]">
                        <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]"></div>

                        <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    Estrutura Completa
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                    Seis módulos estratégicos
                                    <br />
                                    <span className="italic text-accent-gold">
                                        + 1 bônus exclusivo.
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Acesso permanente ao método conceitual do Marinho Ponci de formatação e franquias.
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
                                                    Valor avulso
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
                                    Bônus exclusivo
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 mb-10 reveal-on-scroll">
                                {[
                                    {
                                        label: 'BÔNUS',
                                        title: 'A Primeira Reunião de Venda de Franquia',
                                        text: 'Como apresentar a sua oportunidade de franquia para candidatos qualificados: o que expor, o que ocultar na triagem inicial, e como estruturar a proposta comercial da marca de forma profissional.',
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
                                                Valor avulso
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
                                            Soma de tudo que você recebe
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
                                            Hoje, você não paga isso
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
                                            Quero garantir meu acesso
                                            <span className="material-symbols-outlined">
                                                arrow_forward
                                            </span>
                                        </span>
                                    </button>
                                    <p className="text-center text-[10px] text-white/30 mt-3 font-bold uppercase tracking-[0.2em]">
                                        🔒 Pagamento seguro Stripe · Acesso imediato
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        5. AUTORIDADE  ·  Marinho Ponci
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-black">
                        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                            <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                    Quem assina este material
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)]">
                                    Marinho Ponci,{' '}
                                    <span className="italic text-accent-gold">
                                        38 anos de mercado.
                                    </span>
                                </h2>
                            </div>

                            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 reveal-on-scroll">
                                <div className="relative order-2 lg:order-2">
                                    <div className="absolute -inset-6 bg-accent-gold/8 blur-3xl rounded-full pointer-events-none"></div>
                                    <div className="relative aspect-[4/5] bg-[#0a0a0a] border border-white/10 hud-border overflow-hidden">
                                        <img
                                            src="/marinho principal.webp"
                                            alt="Marinho Ponci, especialista em franchising"
                                            className="w-full h-full object-cover object-top opacity-90"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

                                        <div className="absolute bottom-7 left-7 right-7">
                                            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-white/15">
                                                {[
                                                    { n: '38', l: 'Anos de\nfranchising' },
                                                    { n: '850+', l: 'Pontos\ninaugurados' },
                                                    { n: '3K+', l: 'Candidatos\nentrevistados' },
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
                                            "Não sou coach e nem influencer e também não estou aqui para te motivar com frase bonita de meia-noite. Estou aqui porque, depois de 38 anos vendo a mesma história se repetir os mesmos erros, as mesmas ilusões, as mesmas decisões precipitadas decidi que precisava abrir o microfone de verdade."
                                        </p>
                                        <p className="text-[11px] uppercase tracking-[0.3em] text-accent-gold/80 font-bold mt-4">
                                            Marinho Ponci
                                        </p>
                                    </div>

                                    <p className="text-[15px] text-white/60 leading-[1.85] mb-4">
                                        Decidi reunir o conhecimento estratégico de formatação que poupa marcas iniciantes de gastarem fortunas em consultorias padrão sem o devido preparo de base.
                                    </p>
                                    <p className="text-[15px] text-white/60 leading-[1.85]">
                                        Franquear é excelente, desde que você saiba exatamente onde está pisando e como blindar sua rede.{' '}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ===========================================================
                        6. REDUÇÃO DE OBJEÇÃO  ·  Garantia + FAQ
                    =========================================================== */}
                    <section className="py-14 md:py-20 relative overflow-hidden bg-[#050505]">
                        <div className="max-w-[1300px] mx-auto px-6 md:px-12">
                            {/* GARANTIA */}
                            <div className="text-center max-w-2xl mx-auto mb-10 reveal-on-scroll">
                                <div className="inline-flex items-center justify-center w-20 h-20 mb-6 hud-border bg-black float-y">
                                    <span className="material-symbols-outlined text-accent-gold text-4xl">
                                        verified
                                    </span>
                                </div>

                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                                    Garantia incondicional
                                </span>
                                <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.8rem,4vw,2.8rem)] mb-5">
                                    7 dias.{' '}
                                    <span className="italic text-accent-gold">
                                        Risco zero.
                                    </span>
                                </h2>
                                <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                    Acesse o material, utilize as tabelas e assista às aulas estratégicas. Se não fizer sentido para a sua marca em 7 dias, devolvemos 100% do seu valor.
                                </p>
                            </div>

                            {/* FAQ */}
                            <div className="text-center mb-10 reveal-on-scroll">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                                    Perguntas frequentes
                                </span>
                                <h3 className="font-black text-white leading-[1] tracking-tighter uppercase text-[clamp(1.5rem,3.2vw,2.3rem)]">
                                    Tira-dúvidas{' '}
                                    <span className="italic text-accent-gold">
                                        sem rodeio.
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
                        7. CTA  ·  Close enxuto
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
                                O Dossiê do Futuro Franqueador
                            </h2>
                            <p className="text-base md:text-lg text-white/55 leading-[1.75] max-w-xl mx-auto mb-10">
                                R$ 247 é o custo para entender o caminho estratégico real de expansão do seu negócio antes de gastar fortunas com assessoria jurídica ou consultorias sem preparo.
                            </p>

                            <button
                                onClick={handleCheckout} disabled={checkoutLoading}
                                className="cta-glow group relative inline-block px-12 md:px-16 py-5 md:py-6 bg-accent-gold text-black text-sm md:text-base font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    Quero o Dossiê agora
                                    <span className="material-symbols-outlined">
                                        arrow_forward
                                    </span>
                                </span>
                            </button>

                            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8">
                                {[
                                    { i: 'verified', l: 'Pagamento Stripe' },
                                    { i: 'lock', l: 'Acesso imediato' },
                                    { i: 'autorenew', l: '7 dias de garantia' },
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
                                Quero o Dossiê
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </span>
                        </button>
                        <p className="text-center text-[9px] text-white/30 mt-2 font-bold uppercase tracking-[0.15em]">
                            3× R$ 89 sem juros · Pix R$ 222
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
                                        Quase lá
                                    </span>
                                    <h3 className="text-xl font-black text-white">Antes de continuar</h3>
                                    <p className="text-white/50 text-sm mt-1">Preencha para garantir seu acesso.</p>
                                </div>
                                <button onClick={() => setShowLeadModal(false)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 ml-4">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleLeadSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Nome completo</label>
                                    <input
                                        type="text"
                                        value={leadName}
                                        onChange={e => setLeadName(e.target.value)}
                                        placeholder="Seu nome"
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
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Telefone / WhatsApp</label>
                                    <input
                                        type="tel"
                                        value={leadPhone}
                                        onChange={e => setLeadPhone(e.target.value)}
                                        placeholder="(11) 99999-9999"
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
                                        <><span className="material-symbols-outlined animate-spin text-base">autorenew</span> Aguarde...</>
                                    ) : (
                                        'Ir para o pagamento'
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
                                erro
                            </span>
                            <div className="flex-1">
                                <div className="text-[11px] font-black uppercase tracking-[0.25em] text-red-400 mb-1">
                                    Falha no checkout
                                </div>
                                <p className="text-[13px] text-white/70 leading-snug">
                                    {checkoutError}
                                </p>
                            </div>
                            <button
                                onClick={() => setCheckoutError(null)}
                                className="text-white/40 hover:text-white transition-colors"
                                aria-label="Fechar"
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
                            © {new Date().getFullYear()} Marinho Ponci · Todos os direitos reservados
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
