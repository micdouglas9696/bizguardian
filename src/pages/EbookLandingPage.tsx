import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

// =====================================================================
// EBOOK LANDING PAGE — /ebook
// "O Dossiê do Futuro Franqueado" — Marinho Ponci
//
// Estrutura: ATENÇÃO → IDENTIFICAÇÃO → DESEJO → VALOR → PROVA →
//            REDUÇÃO DE OBJEÇÃO → CTA
// Métodos: Russell Brunson (Hook · Stack Close · Risk Reversal ·
//          Future Pacing · Epiphany Bridge)
// =====================================================================

const PRICE_PARCELA = '3× de R$ 89,00 sem juros';
const PRICE_PIX = 'R$ 222,30 via Pix (10% off)';

// 6 módulos do Dossiê (extraído para usar no carrossel)
const MODULES = [
    {
        n: 'MOD 01',
        title: 'Avaliando a sua situação atual',
        text: 'Antes de olhar para marcas, olhe para dentro. Perfil, saúde financeira, família. A decisão correta começa aqui.',
        pills: ['Vídeo', 'Autoavaliação'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 02',
        title: 'A realidade do franchising',
        text: 'Sem salário garantido. Sem fórmula mágica. O que muda quando você passa de colaborador a dono de unidade.',
        pills: ['Vídeo', 'Linha do tempo'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 03',
        title: 'Pesquisa de mercado e propósito',
        text: '"Qual franquia dá mais dinheiro?" é a pergunta errada. Marinho mostra qual é a pergunta certa para começar.',
        pills: ['Vídeo', 'Mapa de afinidades'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 04',
        title: 'Planejamento financeiro real',
        text: 'Raio-X financeiro pessoal. Capital de giro real. O perigo do financiamento excessivo. Os números honestos.',
        pills: ['Vídeo', 'Raio-X financeiro'],
        value: 'R$ 297',
    },
    {
        n: 'MOD 05',
        title: 'A transição e a Teoria do Jardim',
        text: 'Como sair do emprego sem saltar no escuro. A lógica dos 2/3 de preparação para 1/3 de execução.',
        pills: ['Vídeo', 'Plano de transição'],
        value: 'R$ 197',
    },
    {
        n: 'MOD 06',
        title: 'O momento da decisão',
        text: 'Como transformar meses de estudo em ação consciente. E como saber quando o "sim" está pronto, ou o "não" é mais sábio.',
        pills: ['Vídeo', 'Checklist de decisão'],
        value: 'R$ 297',
    },
];

// Stripe checkout: chama o backend, recebe a URL e redireciona.
// Se o Stripe ainda não foi configurado (sem VITE_STRIPE_PUBLISHABLE_KEY),
// fallback gracioso = scroll pro CTA final.
async function startCheckout(): Promise<{ ok: boolean; error?: string }> {
    if (!STRIPE_PK) {
        document.getElementById('cta-final')?.scrollIntoView({ behavior: 'smooth' });
        return { ok: true };
    }
    try {
        const resp = await fetch(`${API_URL}/api/checkout/create-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
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

// ---------------------------------------------------------------------
// FAQ + Schema.org
// ---------------------------------------------------------------------
const FAQ_ITEMS = [
    {
        q: 'O Dossiê é um e-book em PDF?',
        a: 'Não é só um PDF. É um programa interativo com 6 módulos em vídeo gravados pelo Marinho, exercícios práticos aplicáveis à sua situação real, reflexões guiadas e o bônus exclusivo "A Reunião com o Franqueador". Tudo dentro de uma área de membro segura, com acesso permanente.',
    },
    {
        q: 'Em quanto tempo recebo o acesso?',
        a: 'Acesso imediato. No cartão, você recebe as credenciais de login no email em segundos. No Pix, em até 2 minutos após a confirmação do pagamento.',
    },
    {
        q: 'E se eu não gostar? Tem garantia?',
        a: 'Sim. 7 dias incondicionais. Você acessa, testa, faz os exercícios. Se não fizer sentido, basta um email pedindo reembolso e devolvemos 100%. Sem perguntas, sem burocracia. E você fica com os bônus.',
    },
    {
        q: 'Funciona se eu ainda não escolhi o segmento?',
        a: 'Funciona principalmente para você. A maior parte do Dossiê é sobre a decisão antes da decisão: perfil, propósito, capacidade financeira, momento de vida. Quem entra com segmento já escolhido é quem mais reavalia.',
    },
    {
        q: 'Quanto tempo leva para consumir o material?',
        a: 'Em média, 6 a 8 horas distribuídas pelos módulos. Mas a recomendação é não consumir corrido: cada módulo traz exercícios que pedem reflexão. Quem decide bem é quem dorme com a pergunta antes de responder.',
    },
    {
        q: 'Vou aprender qual franquia comprar?',
        a: 'Não. Esse é o erro que o Dossiê combate. Você aprende a fazer as perguntas certas para que a resposta de "qual marca" venha de você, informada, não vendida. Marinho não recomenda marcas. Ele dá método.',
    },
    {
        q: 'Posso parcelar? Tem Pix?',
        a: '3× de R$ 89,00 sem juros no cartão. No Pix à vista, 10% de desconto (R$ 222,30). Boleto também disponível.',
    },
    {
        q: 'Como funciona a nota fiscal?',
        a: 'Emitida automaticamente após o pagamento, enviada por email em até 24h. Pode ser usada como despesa de capacitação profissional na sua declaração.',
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
    name: 'O Dossiê do Futuro Franqueado',
    description:
        'Programa interativo com 6 módulos em vídeo, exercícios práticos e reflexões para quem está prestes a investir em uma franquia. Por Marinho Ponci, 38 anos de bastidores no franchising.',
    image: 'https://marinhoponci.com/og-dossie.jpg',
    brand: { '@type': 'Brand', name: 'Marinho Ponci' },
    offers: {
        '@type': 'Offer',
        price: '247.00',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url: 'https://marinhoponci.com/ebook',
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '127',
    },
};

// =====================================================================
// PAGE
// =====================================================================
export default function EbookLandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [pastHero, setPastHero] = useState(false);
    const [openFAQ, setOpenFAQ] = useState<number | null>(0);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const mainRef = useRef<HTMLElement>(null);

    const handleCheckout = useCallback(async () => {
        if (checkoutLoading) return;
        setCheckoutError(null);
        setCheckoutLoading(true);
        const result = await startCheckout();
        if (!result.ok) {
            setCheckoutError(result.error || 'Erro ao iniciar checkout');
            setCheckoutLoading(false);
        }
        // Se OK, navegação para Stripe substitui a página — não precisa resetar.
    }, [checkoutLoading]);

    // SEO meta tags
    useEffect(() => {
        const previousTitle = document.title;
        document.title =
            'O Dossiê do Futuro Franqueado | Marinho Ponci — 38 anos de franchising';

        const setMeta = (name: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let tag = document.head.querySelector(
                `meta[${attr}="${name}"]`,
            ) as HTMLMetaElement | null;
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attr, name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        const description =
            'Descubra a verdade que o consultor da franqueadora esconde de você. Programa interativo com 6 módulos em vídeo do Marinho Ponci. Decida com clareza antes de investir.';

        setMeta('description', description);
        setMeta('robots', 'index,follow,max-image-preview:large');
        setMeta('og:title', 'O Dossiê do Futuro Franqueado', true);
        setMeta('og:description', description, true);
        setMeta('og:type', 'product', true);
        setMeta('og:url', 'https://marinhoponci.com/ebook', true);
        setMeta('og:image', 'https://marinhoponci.com/og-dossie.jpg', true);
        setMeta('og:locale', 'pt_BR', true);
        setMeta('twitter:card', 'summary_large_image');
        setMeta('twitter:title', 'O Dossiê do Futuro Franqueado');
        setMeta('twitter:description', description);

        let canonical = document.head.querySelector(
            'link[rel="canonical"]',
        ) as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://marinhoponci.com/ebook');

        const productScript = document.createElement('script');
        productScript.type = 'application/ld+json';
        productScript.text = JSON.stringify(PRODUCT_SCHEMA);
        document.head.appendChild(productScript);

        const faqScript = document.createElement('script');
        faqScript.type = 'application/ld+json';
        faqScript.text = JSON.stringify(FAQ_SCHEMA);
        document.head.appendChild(faqScript);

        return () => {
            document.title = previousTitle;
            productScript.remove();
            faqScript.remove();
        };
    }, []);

    // Sticky header
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 50);
            setPastHero(window.scrollY > window.innerHeight * 0.85);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Reveal observer com stagger
    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add('revealed');
                        obs.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
        );
        el.querySelectorAll('.reveal-on-scroll').forEach((s) => obs.observe(s));
        return () => obs.disconnect();
    }, []);

    const toggleFAQ = useCallback((idx: number) => {
        setOpenFAQ((cur) => (cur === idx ? null : idx));
    }, []);

    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* Inline CSS for sequenced reveals + transitions */}
            <style>{`
                .reveal-on-scroll{opacity:0;transform:translateY(40px);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1)}
                .reveal-on-scroll.revealed{opacity:1;transform:translateY(0)}
                .reveal-on-scroll.revealed > *{animation:childReveal .8s cubic-bezier(.16,1,.3,1) backwards}
                .reveal-on-scroll.revealed > *:nth-child(1){animation-delay:.1s}
                .reveal-on-scroll.revealed > *:nth-child(2){animation-delay:.2s}
                .reveal-on-scroll.revealed > *:nth-child(3){animation-delay:.3s}
                .reveal-on-scroll.revealed > *:nth-child(4){animation-delay:.4s}
                .reveal-on-scroll.revealed > *:nth-child(5){animation-delay:.5s}
                @keyframes childReveal{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(225,169,96,.4)}50%{box-shadow:0 0 0 16px rgba(225,169,96,0)}}
                .pulse-ring{animation:pulseRing 2.5s ease-out infinite}
                .section-divider{background:linear-gradient(90deg,transparent,rgba(225,169,96,.4),transparent);height:1px;width:100%}
                @keyframes shimmerGold{0%{background-position:-200% center}100%{background-position:200% center}}
                .shimmer-text{background:linear-gradient(90deg,#e1a960 0%,#fff5d4 50%,#e1a960 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shimmerGold 3.5s linear infinite}
                @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
                .float-y{animation:floatY 4s ease-in-out infinite}
                @keyframes ctaGlow{0%,100%{box-shadow:0 0 0 0 rgba(225,169,96,.55),0 0 30px rgba(225,169,96,.3)}50%{box-shadow:0 0 0 10px rgba(225,169,96,0),0 0 50px rgba(225,169,96,.6)}}
                .cta-glow{animation:ctaGlow 2.5s ease-in-out infinite}
            `}</style>

            {/* ============== HEADER ============== */}
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
                            src="/marinho final.png"
                            alt="Marinho Ponci"
                            className="h-9 sm:h-12 md:h-16 lg:h-20 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/membro/login"
                            className="group relative px-4 py-2 bg-accent-gold text-black text-[10px] font-black uppercase tracking-[0.18em] hover:bg-white transition-all duration-300 whitespace-nowrap"
                        >
                            Membro
                        </Link>

                        {/* Escondido no mobile — aparece como CTA flutuante */}
                        <button
                            onClick={handleCheckout}
                            disabled={checkoutLoading}
                            className={`cta-glow group relative px-5 py-2 bg-accent-gold text-black text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] hover:bg-white transition-all duration-500 overflow-hidden hidden sm:inline-flex ${pastHero ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative flex items-center gap-1.5 whitespace-nowrap">
                                Quero o Dossiê
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
                    <div className="hidden sm:block relative min-h-[88vh]">
                        <div className="absolute inset-0 pointer-events-none">
                            <img
                                src="/capaebookdesk_franqueado.png"
                                alt=""
                                loading="eager"
                                fetchPriority="high"
                                className="w-full h-full object-cover"
                                style={{ objectPosition: 'center 60%' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/12 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/35"></div>
                        </div>

                        <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 md:px-12 flex items-center min-h-[88vh] pt-24 pb-12">
                            <div className="max-w-xl reveal-on-scroll">
                                <div className="inline-flex items-center gap-3 mb-5 px-3 py-2 border border-accent-gold/40 bg-accent-gold/5">
                                    <span className="w-2 h-2 bg-accent-gold rounded-full pulse-ring"></span>
                                    <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.22em] text-accent-gold">
                                        Para quem está prestes a investir em franquia
                                    </span>
                                </div>
                                <h1 className="font-black text-white leading-[0.92] tracking-tighter uppercase cinematic-text-shadow text-[clamp(2.1rem,4.4vw,4.2rem)] mb-5">
                                    A verdade que<br />
                                    <span className="italic text-accent-gold drop-shadow-[0_0_30px_rgba(225,169,96,0.3)]">ninguém te conta.</span>
                                </h1>
                                <p className="text-sm md:text-base text-white/65 leading-[1.7] max-w-lg mb-6">
                                    As perguntas que você deveria fazer, os números que ninguém menciona, a verdade sobre o que significa{' '}
                                    <span className="italic text-accent-gold/90">ser dono de uma unidade franqueada</span>.
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
                        </div>
                    </div>

                    {/* ── MOBILE (<sm) ── */}
                    <div className="sm:hidden flex flex-col bg-black" style={{ minHeight: '100dvh' }}>
                        {/* Mockup — capa inteira, leve zoom para presença visual */}
                        <div className="relative w-full flex-none flex items-center justify-center overflow-hidden bg-black" style={{ height: '68vh', paddingTop: '4.5rem' }}>
                            <img
                                src="/obile final ebook.png"
                                alt="O Dossiê do Futuro Franqueado"
                                loading="eager"
                                fetchPriority="high"
                                className="h-full w-auto object-contain scale-[1.13] origin-center"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent"></div>
                        </div>

                        {/* Texto — abaixo do mockup */}
                        <div className="flex flex-col px-5 pt-2 pb-10">
                            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 border border-accent-gold/40 bg-accent-gold/5 self-start">
                                <span className="w-1.5 h-1.5 bg-accent-gold rounded-full pulse-ring"></span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent-gold">Para quem vai investir em franquia</span>
                            </div>

                            <h1 className="font-black text-white leading-[0.9] tracking-tighter uppercase cinematic-text-shadow text-[clamp(1.85rem,6.2vw,2.3rem)] mb-3">
                                A verdade que<br />
                                <span className="italic text-accent-gold drop-shadow-[0_0_20px_rgba(225,169,96,0.3)]">ninguém te conta.</span>
                            </h1>

                            <p className="text-[13px] text-white/65 leading-[1.65] mb-4">
                                As perguntas que você deveria fazer, os números que ninguém menciona, a verdade sobre o que significa{' '}
                                <span className="italic text-accent-gold/90">ser dono de uma unidade franqueada</span>.
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
                                Reconhece alguma destas?
                            </span>
                            <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                Você não é o único
                                <br />
                                <span className="italic text-accent-gold">
                                    nesse momento.
                                </span>
                            </h2>
                            <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                A maioria de quem chega aqui está exatamente neste
                                ponto. Veja se uma destas situações é sua.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-px bg-white/5 reveal-on-scroll">
                            {[
                                {
                                    icon: 'sentiment_dissatisfied',
                                    headline: 'Você está cansado do CLT',
                                    text: 'Quer sair, mas tem medo de errar a vez. A franquia parece o caminho seguro, mas algo dentro de você desconfia.',
                                },
                                {
                                    icon: 'visibility_off',
                                    headline: 'Os números não batem',
                                    text: 'A franqueadora mostra projeções animadoras. Você sente que falta alguma coisa, mas não sabe onde olhar.',
                                },
                                {
                                    icon: 'forum',
                                    headline: 'O consultor parece amigo',
                                    text: 'Atende rápido, manda áudio no WhatsApp, fala que "é a sua chance". Você sabe que ele ganha comissão, mas continua escutando.',
                                },
                                {
                                    icon: 'schedule',
                                    headline: 'Estão te apressando',
                                    text: '"A taxa de adesão sobe semana que vem", "só sobraram 2 territórios". A pressão é real e você sente que precisa decidir agora.',
                                },
                                {
                                    icon: 'family_restroom',
                                    headline: 'A família está dividida',
                                    text: 'Uns acham ótima ideia, outros têm medo. Você precisa de informação real para conversar com clareza, não com fé.',
                                },
                                {
                                    icon: 'savings',
                                    headline: 'É a poupança da vida',
                                    text: 'Esse dinheiro veio de anos de trabalho. Errar não é só perder dinheiro: é perder anos. Você quer certeza antes de mover.',
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
                                Se você se identifica,{' '}
                                <span className="text-accent-gold">o Dossiê é para você.</span>
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
                                O que muda em 30 dias
                            </span>
                            <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                Decidir com{' '}
                                <span className="italic text-accent-gold">clareza</span>
                                ,<br />
                                não com pressão.
                            </h2>
                            <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                Três entregas concretas que você passa a ter ao
                                concluir o Dossiê.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-5 reveal-on-scroll">
                            {[
                                {
                                    big: '01',
                                    icon: 'psychology_alt',
                                    title: 'Você vai SABER',
                                    text: 'Saber se franquia é caminho, ou se você está fugindo de outra coisa. A diferença entre paixão e propósito fica nítida.',
                                },
                                {
                                    big: '02',
                                    icon: 'fact_check',
                                    title: 'Você vai PERGUNTAR',
                                    text: 'Entrar nas reuniões com franqueador armado de checklist. Ouvir o que ele diz e o que ele NÃO diz. Negociar como adulto.',
                                },
                                {
                                    big: '03',
                                    icon: 'shield_lock',
                                    title: 'Você vai PROTEGER',
                                    text: 'Capital de giro real, prazo realista, plano B na mesa. Se decidir entrar, entra com proteção. Se decidir não, sai sem cicatriz.',
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
                                A resposta no fim será{' '}
                                <span className="text-accent-gold">sua</span>, não da
                                franqueadora.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ===========================================================
                    4. VALOR  ·  Stack Slide (Russell Brunson)
                =========================================================== */}
                <section className="py-14 md:py-20 relative overflow-hidden bg-[#050505]">
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]"></div>

                    <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative">
                        <div className="text-center max-w-3xl mx-auto mb-12 reveal-on-scroll">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                Tudo que você recebe
                            </span>
                            <h2 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(1.9rem,4.2vw,3.2rem)] mb-5">
                                Seis módulos
                                <br />
                                <span className="italic text-accent-gold">
                                    + 1 bônus.
                                </span>
                            </h2>
                            <p className="text-[15px] md:text-base text-white/55 leading-[1.75]">
                                Cada módulo combina vídeo do Marinho, exercício prático
                                e reflexão guiada. Acesso permanente.
                            </p>
                        </div>

                        {/* Grid de módulos — 2 colunas, refinado */}
                        <div className="grid md:grid-cols-2 gap-4 md:gap-5 mb-10 reveal-on-scroll">
                            {MODULES.map((m, i) => (
                                <div
                                    key={m.n}
                                    className="group relative bg-[#0a0a0a] border border-white/[0.07] p-7 md:p-8 hover:border-accent-gold/50 hover:bg-[#0c0c0c] transition-all duration-500 overflow-hidden"
                                >
                                    {/* Top gold accent on hover */}
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-gold/0 to-transparent group-hover:via-accent-gold/60 transition-all duration-500"></div>

                                    {/* Numeração XL decorativa */}
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

                        {/* Bônus */}
                        <div className="text-center mb-10 reveal-on-scroll">
                            <span className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold border border-accent-gold/40 px-4 py-2">
                                + 1 Bônus exclusivo
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-10 reveal-on-scroll">
                            {[
                                {
                                    label: 'BÔNUS',
                                    title: 'A Reunião com o Franqueador',
                                    text: 'Um guia completo para quando você entrar naquela reunião: o que perguntar, o que observar, o que significa quando ele hesita, o que significa quando ele fala rápido demais. Aqui você aprende a linguagem corporal do "não dito".',
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

                        {/* Stack total — Russell Brunson Stack Close */}
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
                                            2.573
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
                                        Quero garantir agora
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
                    5. PROVA  ·  Autoridade + Depoimentos + Marinho
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

                        {/* Marinho block: foto + bio + stats (única instância das stats) */}
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 reveal-on-scroll">
                            <div className="relative order-2 lg:order-2">
                                <div className="absolute -inset-6 bg-accent-gold/8 blur-3xl rounded-full pointer-events-none"></div>
                                <div className="relative aspect-[4/5] bg-[#0a0a0a] border border-white/10 hud-border overflow-hidden">
                                    <img
                                        src="/marinho principal.png"
                                        alt="Marinho Ponci, especialista em franchising há 38 anos"
                                        className="w-full h-full object-cover object-top opacity-90"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent"></div>

                                    {/* Stats — única vez na página */}
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
                                        "Não sou coach e nem influencer e também não estou aqui para te motivar com frase bonita de meia-noite. Estou aqui porque, depois de 38 anos vendo a mesma história se repetir — os mesmos erros, as mesmas ilusões, as mesmas decisões precipitadas — decidi que precisava abrir o microfone de verdade."
                                    </p>
                                    <p className="text-[11px] uppercase tracking-[0.3em] text-accent-gold/80 font-bold mt-4">
                                        Marinho Ponci
                                    </p>
                                </div>

                                <p className="text-[15px] text-white/60 leading-[1.85] mb-4">
                                    Decidi compartilhar o que aprendi nestes anos todos: o método, as perguntas que importam, a realidade que ninguém fala.
                                </p>
                                <p className="text-[15px] text-white/60 leading-[1.85]">
                                    Porque você merece entrar em franquia (se decidir entrar) com os olhos abertos.{' '}
                                    <span className="italic text-accent-gold">
                                        Não no susto, com pressão e sem clareza.
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Depoimentos */}
                        <div className="text-center mb-10 reveal-on-scroll">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                                Quem já passou pelo método
                            </span>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 reveal-on-scroll">
                            {[
                                {
                                    quote:
                                        'Cheguei achando que ia me convencer. Saí entendendo que não era a hora. O Marinho me poupou de R$ 180 mil e dois anos da minha vida.',
                                    name: 'Carlos M.',
                                    role: 'ex-executivo · SP',
                                },
                                {
                                    quote:
                                        'O Módulo 4 me mostrou um buraco de R$ 60 mil que ninguém tinha mencionado. Renegociei e entrei com proteção. Hoje estou 8 meses operando.',
                                    name: 'Patrícia L.',
                                    role: 'franqueada food service · MG',
                                },
                                {
                                    quote:
                                        'Não é motivacional. É cirúrgico. Cada exercício me forçou a uma resposta que eu vinha evitando. Decidi não entrar, e sou grato.',
                                    name: 'Diego R.',
                                    role: 'engenheiro · RJ',
                                },
                            ].map((t, i) => (
                                <div
                                    key={i}
                                    className="bg-[#0a0a0a] border border-white/[0.07] p-7 md:p-8 relative hover:border-accent-gold/30 transition-colors"
                                >
                                    <span className="absolute top-2 right-5 text-[100px] font-black italic text-accent-gold/[0.08] leading-none select-none">
                                        “
                                    </span>
                                    <div className="flex gap-1 mb-5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <span
                                                key={s}
                                                className="material-symbols-outlined text-accent-gold text-base"
                                                style={{ fontVariationSettings: '"FILL" 1' }}
                                            >
                                                star
                                            </span>
                                        ))}
                                    </div>
                                    <p className="relative text-white/75 text-[14.5px] leading-[1.75] mb-7 italic">
                                        "{t.quote}"
                                    </p>
                                    <div className="flex items-center gap-3 pt-5 border-t border-white/[0.07]">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-gold/30 to-accent-gold/10 flex items-center justify-center font-black text-accent-gold">
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-white">
                                                {t.name}
                                            </div>
                                            <div className="text-[11px] text-white/40 uppercase tracking-wider">
                                                {t.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ===========================================================
                    6. REDUÇÃO DE OBJEÇÃO  ·  Garantia + Comparativo + FAQ
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
                                Acesse, faça os exercícios e teste o método. Se não
                                fizer sentido em 7 dias,{' '}
                                <strong className="text-white">
                                    devolvemos 100% sem perguntas
                                </strong>{' '}
                                e você fica com os bônus.
                            </p>
                        </div>

                        {/* COMPARATIVO */}
                        <div className="text-center max-w-2xl mx-auto mb-10 reveal-on-scroll">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                                A diferença real
                            </span>
                            <h3 className="font-black text-white leading-[1] tracking-tighter uppercase text-[clamp(1.5rem,3.2vw,2.3rem)]">
                                Sem método{' '}
                                <span className="italic text-accent-gold">vs</span> com
                                método
                            </h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-px bg-white/10 mb-16 reveal-on-scroll">
                            <div className="bg-[#080808] p-8 md:p-10 relative">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-7">
                                    SEM o Dossiê
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        'Decisão guiada pelo entusiasmo do consultor',
                                        'Capital de giro subestimado em 30-50%',
                                        'Avaliação superficial de perfil pessoal',
                                        'Pergunta errada: "qual marca?"',
                                        'Reunião com franqueador às cegas',
                                        'Risco de payback 2-3× maior que o prometido',
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
                                    Recomendado
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-7">
                                    COM o Dossiê
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        'Decisão guiada por método de 38 anos',
                                        'Capital de giro calculado com a realidade',
                                        'Autoavaliação completa de perfil e momento',
                                        'Pergunta certa primeiro: alinhamento',
                                        'Reunião com checklist na mão',
                                        'Você assina com clareza, ou descobre que não é a hora',
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
                            Antes de assinar,{' '}
                            <span className="italic text-accent-gold">leia isto.</span>
                        </h2>
                        <p className="text-base md:text-lg text-white/55 leading-[1.75] max-w-xl mx-auto mb-10">
                            R$ 247 é o custo de clareza antes de você comprometer R$ 150
                            mil ou mais. Acesso permanente, garantia de 7 dias.
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
                                { i: 'verified_user', l: 'Pagamento Stripe' },
                                { i: 'lock_clock', l: 'Acesso imediato' },
                                { i: 'replay', l: '7 dias de garantia' },
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

            {/* ============== TOAST DE ERRO DE CHECKOUT ============== */}
            {checkoutError && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#0a0a0a] border border-red-500/40 p-4 shadow-[0_0_30px_rgba(239,68,68,0.25)] animate-fadeIn">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-red-400 text-xl shrink-0">
                            error
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
                            src="/marinho final.png"
                            alt="Marinho Ponci"
                            className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity"
                        />
                    </Link>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25 text-center">
                        © 2026 Marinho Ponci · Todos os direitos reservados
                    </div>
                </div>
            </footer>
        </div>
    );
}
