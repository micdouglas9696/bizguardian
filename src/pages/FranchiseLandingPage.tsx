import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FranchiseQuizModal from '../components/FranchiseQuizModal';

const BENEFITS = [
    {
        icon: 'rocket_launch',
        title: 'Método Validado',
        desc: 'Aprenda com quem já construiu redes com mais de 850 pontos de venda em 10 países.',
    },
    {
        icon: 'shield',
        title: 'Sem Achismo',
        desc: 'Playbook completo do que dá certo e do que quebra uma franquia — direto da trincheira.',
    },
    {
        icon: 'groups',
        title: 'Comunidade Exclusiva',
        desc: 'Acesso ao grupo de WhatsApp com futuros franqueados e mentoria estratégica ao vivo.',
    },
    {
        icon: 'trending_up',
        title: 'Escala Real',
        desc: 'De zero a franqueador: modelagem de negócio, padronização e expansão inteligente.',
    },
];

const TIMELINE_DAYS = [
    {
        day: '01',
        title: 'A Fundação',
        desc: 'Entenda o cenário real das franquias. O que funciona, o que quebra, e como se posicionar para vencer.',
        icon: 'foundation',
    },
    {
        day: '02',
        title: 'O Modelo',
        desc: 'Construa sua modelagem de franquia do zero. Padronização, formatação e estratégia de expansão.',
        icon: 'architecture',
    },
    {
        day: '03',
        title: 'A Escala',
        desc: 'Domine a captação de franqueados, operação multi-unidade e internacionalização estratégica.',
        icon: 'public',
    },
];

const FAQ_ITEMS = [
    {
        q: 'Preciso já ter um negócio para participar?',
        a: 'Não! O evento é para quem quer entrar no mundo das franquias, seja como franqueador ou franqueado. Você vai sair com clareza total sobre qual caminho seguir.',
    },
    {
        q: 'O conteúdo fica disponível por quanto tempo?',
        a: 'As aulas ficam disponíveis durante o período do evento. Entre no grupo de WhatsApp para receber todos os links e materiais complementares.',
    },
    {
        q: 'Quem é o Marinho Ponci?',
        a: 'Com quase 4 décadas de experiência, Marinho formatou a Chilli Beans ao lado de Caito Maia, consolidando 853 pontos globais. Hoje atua como mentor e conselheiro estratégico através da BizGuardian World Connections.',
    },
    {
        q: 'O evento é online ou presencial?',
        a: 'O evento é 100% online e gratuito. Você assiste de onde estiver, basta ter conexão com internet.',
    },
    {
        q: 'Como funciona o grupo de WhatsApp?',
        a: 'Após a inscrição, você receberá o link para entrar no grupo exclusivo. Lá você terá acesso a conteúdos extras, networking e suporte direto.',
    },
];

/* ------------------------------------------------------------------ */
/*  Stagger helper — generates sequential delay styles                */
/* ------------------------------------------------------------------ */

export default function FranchiseLandingPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const mainRef = useRef<HTMLElement>(null);
    const [heroLoaded, setHeroLoaded] = useState(false);
    const [isQuizOpen, setIsQuizOpen] = useState(false);

    // ─── Hero entrance trigger ───
    useEffect(() => {
        const t = setTimeout(() => setHeroLoaded(true), 100);
        return () => clearTimeout(t);
    }, []);

    // ─── Scroll-reveal observer with stagger support ───
    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        // Also reveal stagger children
                        entry.target.querySelectorAll('.stagger-child').forEach((child, idx) => {
                            (child as HTMLElement).style.animationDelay = `${idx * 100}ms`;
                            child.classList.add('stagger-visible');
                        });
                    }
                });
            },
            { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }
        );
        el.querySelectorAll('.section-reveal').forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, []);

    // ─── Live Countdown ───
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
    useEffect(() => {
        const target = new Date();
        target.setDate(target.getDate() + 3);
        target.setHours(20, 0, 0, 0);

        const tick = () => {
            const now = new Date().getTime();
            const diff = target.getTime() - now;
            if (diff <= 0) return;
            setTimeLeft({
                d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                h: Math.floor((diff / (1000 * 60 * 60)) % 24),
                m: Math.floor((diff / (1000 * 60)) % 60),
                s: Math.floor((diff / 1000) % 60),
            });
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    // ─── Form Submit ───
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !phone.trim()) return;
        setIsSubmitting(true);

        const leads = JSON.parse(localStorage.getItem('franchise_leads') || '[]');
        const newLead = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status: 'new',
            source: 'landing_page',
            created_at: new Date().toISOString(),
        };
        leads.push(newLead);
        localStorage.setItem('franchise_leads', JSON.stringify(leads));

        await new Promise((r) => setTimeout(r, 600));
        setIsSubmitting(false);
        navigate(`/franquia/aulas?nome=${encodeURIComponent(name.trim())}`);
    }, [name, email, phone, navigate]);

    const scrollToForm = () => {
        document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' });
    };

    /* =================================================================== */
    /*                           R E N D E R                               */
    /* =================================================================== */
    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* CSS for stagger animations — inline since they are page-scoped */}
            <style>{`
                .stagger-child {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                                transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .stagger-child.stagger-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .hero-el {
                    opacity: 0;
                    transform: translateY(50px);
                    transition: opacity 0.8s cubic-bezier(0.34, 1.56, 0.64, 1),
                                transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .hero-loaded .hero-el {
                    opacity: 1;
                    transform: translateY(0);
                }
                .shimmer-line {
                    position: relative;
                    overflow: hidden;
                }
                .shimmer-line::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(225,169,96,0.15), transparent);
                    animation: shimmer 3s ease-in-out infinite;
                }
                .hover-lift {
                    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                                box-shadow 0.5s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px rgba(225,169,96,0.08);
                }
                .counter-unit {
                    display: inline-block;
                    transition: transform 0.3s ease-out;
                }
                .btn-franchise {
                    position: relative;
                    overflow: hidden;
                }
                .btn-franchise::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                    transform: translateX(-100%);
                    transition: transform 0.6s ease;
                }
                .btn-franchise:hover::before {
                    transform: translateX(100%);
                }
                @media (prefers-reduced-motion: reduce) {
                    .stagger-child, .hero-el, .shimmer-line::after, .hover-lift, .counter-unit, .btn-franchise::before {
                        animation: none !important;
                        transition: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                    }
                }
            `}</style>

            <main ref={mainRef}>
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* HERO — Full-Screen Immersive                              */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <section className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden ${heroLoaded ? 'hero-loaded' : ''}`}>
                    {/* Ambient Background */}
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[#030303]"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-accent-gold/[0.04] rounded-full blur-[250px] animate-glow-breathe"></div>
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/[0.03] rounded-full blur-[180px] -translate-y-1/3 translate-x-1/3 animate-pulse-glow"></div>
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-gold/[0.02] rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3"></div>
                        <div className="absolute inset-0 bg-grid-pattern opacity-[0.015]"></div>
                        {/* Grain texture overlay */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E\")" }}></div>
                    </div>

                    {/* Hero Content — Full Center Stack */}
                    <div className="relative z-10 w-full max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 text-center flex flex-col items-center pt-16 sm:pt-20 md:pt-24 pb-24 sm:pb-32">
                        {/* ── Franchise-se Logo — BIG & Centered ── */}
                        <div className="hero-el mb-6 sm:mb-8" style={{ transitionDelay: '0ms' }}>
                            <img
                                src="/LOGO FUNDO ESCURO.png"
                                alt="Franchise-se"
                                className="h-16 sm:h-20 md:h-28 lg:h-36 w-auto object-contain mx-auto drop-shadow-[0_0_40px_rgba(225,169,96,0.2)]"
                            />
                        </div>

                        {/* ── Urgency Badge — Centered below logo ── */}
                        <div className="hero-el mb-8 sm:mb-12" style={{ transitionDelay: '150ms' }}>
                            <div className="inline-flex items-center gap-2.5 bg-accent-gold/[0.08] border border-accent-gold/25 px-5 sm:px-7 py-2.5 shimmer-line">
                                <span className="w-2 h-2 bg-accent-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(225,169,96,0.6)]"></span>
                                <span className="text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] text-accent-gold">
                                    Evento Gratuito · 3 Dias de Imersão
                                </span>
                            </div>
                        </div>

                        {/* ── Main Headline ── */}
                        <h1
                            className="hero-el text-[2.5rem] sm:text-5xl md:text-7xl lg:text-8xl xl:text-[7rem] font-black uppercase tracking-tighter leading-[0.88] mb-6 sm:mb-8 cinematic-text-shadow px-2"
                            style={{ transitionDelay: '300ms' }}
                        >
                            Tá pensando em<br />
                            <span className="text-accent-gold italic font-serif relative">
                                franquear?
                                <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent"></span>
                            </span>
                        </h1>

                        {/* ── Sub-headline ── */}
                        <p
                            className="hero-el text-sm sm:text-base md:text-lg lg:text-xl text-white/40 font-medium max-w-xl sm:max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed px-4 sm:px-0"
                            style={{ transitionDelay: '450ms' }}
                        >
                            3 aulas ao vivo com quem formatou a <strong className="text-white">Chilli Beans</strong> e gerenciou <strong className="text-white">850+ pontos</strong> em 10 países. Sem rodeios — o que funciona e o que quebra.
                        </p>

                        {/* ── CTA Button ── */}
                        <div className="hero-el flex flex-col items-center gap-4 w-full sm:w-auto" style={{ transitionDelay: '600ms' }}>
                            <button
                                onClick={() => setIsQuizOpen(true)}
                                className="btn-franchise px-8 sm:px-14 md:px-20 py-4 sm:py-5 md:py-6 bg-accent-gold text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:bg-white transition-colors duration-500 shadow-glow-gold w-full sm:w-auto active:scale-95"
                            >
                                Quero Participar Gratuitamente
                            </button>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/15 animate-pulse">
                                Vagas Limitadas
                            </span>
                        </div>

                        {/* ── Countdown — Desktop: row, Mobile: 2x2 grid ── */}
                        <div className="hero-el mt-14 sm:mt-20 w-full max-w-lg mx-auto" style={{ transitionDelay: '750ms' }}>
                            <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-white/15 mb-4 sm:mb-6">Começa em</span>
                            <div className="grid grid-cols-4 gap-3 sm:gap-5">
                                {[
                                    { val: timeLeft.d, label: 'Dias' },
                                    { val: timeLeft.h, label: 'Horas' },
                                    { val: timeLeft.m, label: 'Min' },
                                    { val: timeLeft.s, label: 'Seg' },
                                ].map((t, i) => (
                                    <div key={i} className="flex flex-col items-center py-3 sm:py-4 bg-white/[0.03] border border-white/[0.06]">
                                        <span className="counter-unit text-2xl sm:text-3xl md:text-4xl font-black text-white tabular-nums">
                                            {String(t.val).padStart(2, '0')}
                                        </span>
                                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] text-accent-gold/50 mt-1">{t.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="hero-el absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30" style={{ transitionDelay: '1000ms' }}>
                        <span className="w-[1px] h-8 bg-gradient-to-b from-accent-gold to-transparent animate-pulse"></span>
                    </div>

                    {/* Bottom Gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent"></div>
                </section>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* QUEM É O MARINHO — Authority Section                      */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 md:py-32 relative overflow-hidden bg-[#050505] section-reveal">
                    <div className="max-w-[1700px] mx-auto grid lg:grid-cols-12 min-h-[500px] relative gap-0">
                        {/* Image Area */}
                        <div className="lg:col-span-5 relative h-full min-h-[300px] sm:min-h-[400px] lg:min-h-0 flex items-center justify-center">
                            <div className="absolute inset-x-0 -inset-y-16 lg:-inset-y-32">
                                <div className="relative w-full h-full group overflow-hidden flex items-center justify-center">
                                    <img src="/sobre.png" alt="Marinho Ponci" className="w-full h-full object-contain object-center opacity-80 group-hover:opacity-100 transition-all duration-1000 scale-100 group-hover:scale-[1.03]" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10"></div>
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#050505] lg:hidden z-10"></div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10"></div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-7 relative z-30 p-5 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
                            <span className="stagger-child inline-block py-1.5 px-5 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-8">
                                Seu Mentor
                            </span>
                            <h2 className="stagger-child text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-[0.95]">
                                38 Anos de<br />
                                <span className="text-accent-gold italic">Franchising Real.</span>
                            </h2>
                            <p className="stagger-child text-sm md:text-base text-white/50 mb-8 leading-relaxed font-medium max-w-xl">
                                Marinho Ponci formatou a <strong className="text-white">Chilli Beans</strong> e consolidou <strong className="text-white">853 pontos de venda</strong> globais. Atuou como professor de MBA, palestrante e hoje é mentor estratégico de CEOs e franqueadores.
                            </p>
                            <div className="stagger-child flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-10 border-t border-white/10 pt-8">
                                {[
                                    { value: '850+', label: 'Pontos Geridos' },
                                    { value: '10', label: 'Países Ativos' },
                                    { value: '38y', label: 'Experiência' },
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col gap-1 group">
                                        <span className="text-2xl sm:text-3xl font-black text-white group-hover:text-accent-gold transition-colors duration-500">{stat.value}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-accent-gold">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* BENEFITS — Value Proposition Grid                         */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-black section-reveal">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="text-center mb-12 sm:mb-20">
                            <span className="stagger-child inline-block py-1.5 px-5 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-6 sm:mb-8">
                                O Que Você Vai Receber
                            </span>
                            <h2 className="stagger-child text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight">
                                Não É Teoria.<br />
                                <span className="text-accent-gold italic">É Trincheira.</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            {BENEFITS.map((b, i) => (
                                <div
                                    key={i}
                                    className="stagger-child group relative bg-[#0a0a0a] border border-white/5 p-7 sm:p-9 hover:border-accent-gold/30 transition-all duration-700 overflow-hidden hover-lift"
                                >
                                    {/* Hover glow */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-accent-gold/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-y-1/2 translate-x-1/2"></div>

                                    <div className="relative z-10">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-accent-gold transition-all duration-500 group-hover:scale-110">
                                            <span className="material-symbols-outlined text-white text-xl sm:text-2xl group-hover:text-black transition-colors">{b.icon}</span>
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white mb-3">{b.title}</h3>
                                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider leading-relaxed group-hover:text-white/50 transition-colors duration-500">
                                            {b.desc}
                                        </p>
                                    </div>

                                    {/* HUD Corners */}
                                    <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/10 group-hover:border-accent-gold/40 transition-colors duration-700"></div>
                                    <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/10 group-hover:border-accent-gold/40 transition-colors duration-700"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* TIMELINE — 3 Days Roadmap                                 */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#050505] section-reveal">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="text-center mb-12 sm:mb-20">
                            <span className="stagger-child inline-block py-1.5 px-5 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-6 sm:mb-8">
                                Programação
                            </span>
                            <h2 className="stagger-child text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight">
                                3 Dias Que Vão<br />
                                <span className="text-accent-gold italic">Mudar Sua Visão.</span>
                            </h2>
                        </div>

                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-accent-gold/40 via-accent-gold/20 to-transparent hidden md:block"></div>

                            <div className="flex flex-col gap-6 sm:gap-10">
                                {TIMELINE_DAYS.map((day, i) => (
                                    <div key={i} className="stagger-child group relative flex items-start gap-4 sm:gap-8 md:pl-20">
                                        {/* Day Marker — Desktop */}
                                        <div className="hidden md:flex absolute left-0 top-2 items-center justify-center">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#0a0a0a] border-2 border-accent-gold/30 flex items-center justify-center group-hover:bg-accent-gold group-hover:border-accent-gold transition-all duration-500 group-hover:scale-110">
                                                <span className="text-lg sm:text-xl font-black text-accent-gold group-hover:text-black transition-colors">{day.day}</span>
                                            </div>
                                        </div>

                                        {/* Content Card */}
                                        <div className="flex-1 bg-[#0a0a0a] border border-white/5 p-5 sm:p-7 md:p-10 hover:border-accent-gold/20 transition-all duration-700 group-hover:translate-x-1 sm:group-hover:translate-x-2 hover-lift">
                                            <div className="flex items-center gap-3 sm:gap-4 mb-4">
                                                <div className="md:hidden w-10 h-10 bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-black text-accent-gold">{day.day}</span>
                                                </div>
                                                <div className="w-10 h-10 bg-white/5 flex items-center justify-center group-hover:bg-accent-gold/10 transition-all duration-500 flex-shrink-0">
                                                    <span className="material-symbols-outlined text-accent-gold text-lg">{day.icon}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-gold/50">Dia {day.day}</span>
                                                    <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-white">{day.title}</h3>
                                                </div>
                                            </div>
                                            <p className="text-xs sm:text-sm text-white/40 leading-relaxed font-medium">{day.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* SOCIAL PROOF — Stats + Trust                              */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-black section-reveal">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="bg-[#080808] border border-white/5 p-6 sm:p-10 md:p-14 lg:p-20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent-gold/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 animate-glow-breathe"></div>

                            <div className="relative z-10 grid md:grid-cols-2 gap-10 lg:gap-20 items-center">
                                <div className="text-center md:text-left">
                                    <h2 className="stagger-child text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-[0.95] mb-6 uppercase">
                                        Resultados<br />
                                        <span className="text-accent-gold italic">Que Falam.</span>
                                    </h2>
                                    <p className="stagger-child text-sm text-white/40 leading-relaxed font-medium max-w-md mx-auto md:mx-0">
                                        Não é sobre teoria ou promessas. São décadas de resultados reais no franchising brasileiro e internacional.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                    {[
                                        { value: '853', label: 'Unidades Formatadas' },
                                        { value: '10', label: 'Países com Operação' },
                                        { value: '38', label: 'Anos de Experiência' },
                                        { value: '1987', label: 'Desde' },
                                    ].map((stat, i) => (
                                        <div key={i} className="stagger-child text-center p-4 sm:p-6 border border-white/5 hover:border-accent-gold/20 transition-all duration-500 group hover-lift">
                                            <span className="text-2xl sm:text-3xl md:text-5xl font-black text-white block mb-2 group-hover:text-accent-gold transition-colors duration-500">{stat.value}</span>
                                            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent-gold/60">{stat.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* REGISTRATION FORM — Main CTA                              */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#050505] section-reveal" id="formulario">
                    <div className="max-w-[900px] mx-auto">
                        <div className="text-center mb-10 sm:mb-14">
                            <span className="stagger-child inline-block py-1.5 px-5 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-6 sm:mb-8">
                                Inscrição Gratuita
                            </span>
                            <h2 className="stagger-child text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-tight mb-4 uppercase">
                                Garanta Sua<br />
                                <span className="text-accent-gold italic">Vaga Agora.</span>
                            </h2>
                            <p className="stagger-child text-sm text-white/40 font-medium max-w-md mx-auto">
                                Preencha seus dados e acesse imediatamente a área exclusiva do evento.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-white/5 p-5 sm:p-8 md:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10 space-y-4 sm:space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome completo"
                                        required
                                        className="w-full bg-zinc-900/60 border border-white/10 px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                            E-mail
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            required
                                            className="w-full bg-zinc-900/60 border border-white/10 px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            required
                                            className="w-full bg-zinc-900/60 border border-white/10 px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-franchise w-full py-4 sm:py-5 md:py-6 bg-accent-gold text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white transition-colors duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-gold mt-4 active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Processando...
                                        </span>
                                    ) : (
                                        'Quero Minha Vaga Gratuita'
                                    )}
                                </button>

                                <p className="text-[9px] font-bold text-white/20 text-center uppercase tracking-widest mt-4">
                                    🔒 Seus dados estão seguros. Não enviamos spam.
                                </p>
                            </div>

                            {/* HUD Corners */}
                            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-accent-gold/30"></div>
                            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-accent-gold/30"></div>
                        </form>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* FAQ Section                                               */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-black section-reveal">
                    <div className="max-w-[800px] mx-auto">
                        <div className="text-center mb-10 sm:mb-14">
                            <h2 className="stagger-child text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
                                Perguntas<br />
                                <span className="text-accent-gold italic">Frequentes.</span>
                            </h2>
                        </div>

                        <div className="flex flex-col gap-2">
                            {FAQ_ITEMS.map((faq, i) => (
                                <div key={i} className="stagger-child border border-white/5 hover:border-white/10 transition-all duration-300">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left group"
                                    >
                                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white/70 group-hover:text-white transition-colors pr-4">
                                            {faq.q}
                                        </span>
                                        <span className={`material-symbols-outlined text-accent-gold text-lg flex-shrink-0 transition-transform duration-300 ${openFaq === i ? 'rotate-45' : ''}`}>
                                            add
                                        </span>
                                    </button>
                                    <div className={`overflow-hidden transition-all duration-500 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <p className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 text-xs sm:text-sm text-white/40 leading-relaxed font-medium">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* FINAL CTA                                                 */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#050505] section-reveal">
                    <div className="max-w-[900px] mx-auto text-center">
                        <h2 className="stagger-child text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase mb-6">
                            Não Perca<br />
                            <span className="text-accent-gold italic">Essa Oportunidade.</span>
                        </h2>
                        <p className="stagger-child text-xs sm:text-sm text-white/40 font-medium max-w-md mx-auto mb-8 sm:mb-10">
                            O evento é gratuito, mas as vagas são limitadas. Inscreva-se agora e dê o primeiro passo rumo ao franchising.
                        </p>
                        <button
                            onClick={scrollToForm}
                            className="stagger-child btn-franchise px-8 sm:px-14 md:px-20 py-4 sm:py-5 md:py-6 bg-accent-gold text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:bg-white transition-colors duration-500 shadow-glow-gold active:scale-95"
                        >
                            Garantir Minha Vaga
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-black text-white py-10 sm:py-14 border-t border-white/5">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <img src="/marinho final.png" alt="Marinho Ponci Logo" className="h-10 sm:h-12 w-auto object-contain" />
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/10 text-center">
                            © 2026 MARINHO PONCI. ALL RIGHTS RESERVED. BORN FOR GLOBAL.
                        </p>
                    </div>
                </div>
            </footer>

            <FranchiseQuizModal
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
                onGoToForm={() => {
                    setIsQuizOpen(false);
                    setTimeout(scrollToForm, 300);
                }}
            />
        </div>
    );
}
