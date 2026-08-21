import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CountryPhoneInput from '../components/CountryPhoneInput';
import VideoModal from '../components/VideoModal';

export default function EmpresarialPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeStep, setActiveStep] = useState(0);

    // Video modal state
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('+351 ');
    const [companyName, setCompanyName] = useState('');
    const [location, setLocation] = useState('');
    const [mainChallenge, setMainChallenge] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const mainRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setMousePos({ x, y });
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll reveal observer
    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );
        el.querySelectorAll('.section-reveal').forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, []);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const leadData = {
            name,
            email,
            phone,
            companyName,
            location,
            mainChallenge,
            type: 'consultoria_empresarial',
            created_at: new Date().toISOString()
        };

        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            await fetch(`${API}/api/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
        } catch {
            // silent fail fallback to direct WhatsApp
        }

        setSubmitting(false);
        setSubmitSuccess(true);

        const waText = encodeURIComponent(
            `*Agendamento de Consultoria Empresarial*\n\n` +
            `*Nome:* ${name}\n` +
            `*E-mail:* ${email}\n` +
            `*Telefone:* ${phone}\n` +
            `*Empresa:* ${companyName || 'N/A'}\n` +
            `*Localização:* ${location || 'Não informada'}\n` +
            `*Desafio Principal:* ${mainChallenge || 'Não informado'}\n\n` +
            `Gostaria de agendar uma conversa inicial com o Marinho Ponci.`
        );

        setTimeout(() => {
            window.open(`https://wa.me/351967284661?text=${waText}`, '_blank');
        }, 800);
    };

    const scrollToForm = () => {
        document.getElementById('agendar-conversa')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/10' : 'bg-transparent py-6 sm:py-8'}`}>
                <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-col leading-none select-none cursor-pointer group">
                            <img src="/marinho final.webp" alt="Marinho Ponci" width="400" height="144" className="h-10 sm:h-14 md:h-18 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        <Link to="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45 hover:text-accent-gold transition-all duration-300">
                            Home
                        </Link>
                        <a href="#para-quem" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45 hover:text-accent-gold transition-all duration-300">
                            Para Quem É
                        </a>
                        <a href="#sobre" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45 hover:text-accent-gold transition-all duration-300">
                            Sobre o Marinho
                        </a>
                        <a href="#como-ajudo" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45 hover:text-accent-gold transition-all duration-300">
                            Como Posso Ajudar
                        </a>
                        <a href="#como-funciona" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45 hover:text-accent-gold transition-all duration-300">
                            Metodologia
                        </a>
                        <Link to="/ebook" className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold hover:text-white transition-all duration-300">
                            Dossiê
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={scrollToForm}
                            className="hidden sm:inline-flex px-6 py-3 bg-accent-gold text-black font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white transition-all duration-300 shadow-[0_0_25px_rgba(225,169,96,0.3)]"
                        >
                            Agendar Conversa
                        </button>

                        {/* Hamburger Button Mobile */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[5px] group"
                            aria-label="Menu"
                        >
                            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
                            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-[45] lg:hidden transition-all duration-500 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileMenuOpen(false)}
                />
                <div className={`absolute top-0 right-0 h-full w-full sm:w-[320px] bg-[#0a0a0a] border-l border-white/10 transition-transform duration-500 p-8 pt-24 flex flex-col justify-between ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <nav className="flex flex-col gap-5">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] text-white/70 hover:text-accent-gold">
                            Home
                        </Link>
                        <a href="#para-quem" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] text-white/70 hover:text-accent-gold">
                            Para Quem É
                        </a>
                        <a href="#sobre" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] text-white/70 hover:text-accent-gold">
                            Sobre o Marinho
                        </a>
                        <a href="#como-ajudo" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] text-white/70 hover:text-accent-gold">
                            Como Posso Ajudar
                        </a>
                        <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] text-white/70 hover:text-accent-gold">
                            Metodologia
                        </a>
                        <Link to="/ebook" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black uppercase tracking-[0.2em] text-accent-gold hover:text-white">
                            Dossiê
                        </Link>
                    </nav>

                    <button
                        onClick={() => { setMobileMenuOpen(false); scrollToForm(); }}
                        className="w-full py-4 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.2em]"
                    >
                        Agendar uma Conversa
                    </button>
                </div>
            </div>

            <main ref={mainRef}>
                {/* ═══ HERO SECTION ═══ */}
                <section
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
                    className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col justify-center border-b border-white/10"
                >
                    {/* Background Image — DESKTOP ONLY */}
                    <div className="absolute inset-0 hidden sm:flex justify-end overflow-hidden pointer-events-none">
                        <div
                            className="relative w-full lg:w-full h-full transition-transform duration-1000 ease-out"
                            style={{
                                transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -10}px)`
                            }}
                        >
                            <img
                                src="/marinho principal.webp"
                                srcSet="/marinho-principal-800.webp 800w, /marinho principal.webp 1200w"
                                sizes="(max-width: 1024px) 800px, 1200px"
                                alt="Marinho Ponci"
                                loading="eager"
                                fetchPriority="high"
                                className="w-full h-full object-contain object-right lg:object-[82%_center] scale-[1.35] opacity-90 transition-opacity duration-700 hover:opacity-100"
                            />
                        </div>
                    </div>

                    {/* Gradient Overlays — DESKTOP ONLY */}
                    <div className="absolute inset-0 z-[2] pointer-events-none hidden sm:block">
                        <div className="absolute inset-y-0 left-0 w-1/2 lg:w-[40%] bg-gradient-to-r from-black to-transparent z-10"></div>
                        <div className="absolute inset-y-0 left-0 w-full lg:w-[70%] bg-gradient-to-r from-black/90 via-black/50 to-transparent z-[5]"></div>
                        <div className="absolute inset-y-0 right-0 w-full lg:w-[70%] bg-gradient-to-l from-transparent via-black/20 to-black z-[4] pointer-events-none"></div>
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black to-transparent opacity-30"></div>
                    </div>

                    {/* Desktop Content (sm+) */}
                    <div className="relative z-20 w-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-24 min-h-screen hidden sm:flex flex-col justify-center pt-28 md:pt-32 pb-16">
                        <div
                            className="max-w-3xl animate-reveal-skew"
                            style={{
                                transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 4}px)`
                            }}
                        >
                            {/* Headline */}
                            <div className="relative mb-6 lg:mb-8">
                                <div className="absolute -inset-6 bg-accent-gold/5 blur-[60px] rounded-full pointer-events-none"></div>
                                <h1 className="relative font-black text-white leading-[0.96] tracking-tighter uppercase cinematic-text-shadow text-[clamp(1.75rem,3.6vw,3.25rem)]">
                                    CONSTRUIR UMA EMPRESA É DIFÍCIL. <br />
                                    <span className="block text-[clamp(1.75rem,3.6vw,3.25rem)] text-accent-gold italic drop-shadow-[0_0_30px_rgba(225,169,96,0.3)] mt-1.5" style={{ textShadow: '0 0 40px rgba(225,169,96,0.2), 0 4px 40px rgba(0,0,0,0.9)' }}>
                                        NÃO PRECISA FAZER ESSE CAMINHO SOZINHO.
                                    </span>
                                </h1>
                            </div>

                            {/* Subtitle */}
                            <div className="relative pl-5 border-l-2 border-accent-gold/60 mb-8 lg:mb-10 max-w-xl">
                                <p className="text-sm md:text-base text-white/70 font-semibold leading-relaxed tracking-tight">
                                    Com quase 40 anos de experiência na criação, gestão, expansão e internacionalização de empresas em diferentes países, ajudo empresários a organizar seus negócios, tomar melhores decisões e construir empresas mais sólidas, sustentáveis e preparadas para crescer.
                                </p>
                            </div>

                            {/* CTA Buttons Stack */}
                            <div className="flex flex-row items-center gap-4 lg:gap-5">
                                <button
                                    onClick={scrollToForm}
                                    className="group relative px-8 md:px-10 py-4 md:py-5 bg-accent-gold text-black font-black uppercase hover:bg-white transition-all duration-500 shadow-glow-primary overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                    <span className="relative block text-xs md:text-sm tracking-[0.18em] whitespace-nowrap">AGENDAR UMA CONVERSA</span>
                                </button>

                                <a
                                    href="#como-ajudo"
                                    className="group relative px-8 md:px-10 py-4 md:py-5 bg-transparent border-2 border-white/20 text-white font-black uppercase hover:border-accent-gold hover:text-accent-gold transition-all duration-500 overflow-hidden"
                                >
                                    <span className="relative block text-xs md:text-sm tracking-[0.18em] whitespace-nowrap">CONHEÇA O MÉTODO</span>
                                </a>
                            </div>

                            {/* Stats Counter */}
                            <div className="flex items-center gap-12 mt-12 pt-8 border-t border-white/10">
                                <div>
                                    <span className="block text-2xl lg:text-3xl font-black text-accent-gold">38+ ANOS</span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">De Experiência Empresarial</span>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div>
                                    <span className="block text-2xl lg:text-3xl font-black text-white">5 PAÍSES</span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-gold/70">Empresas Construídas & Acompanhadas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Hero (<sm) */}
                    <div className="flex flex-col sm:hidden pt-24 pb-12 px-6">
                        <div className="relative w-full h-[45vh] overflow-hidden rounded-xl mb-6">
                            <img
                                src="/marinho principal.webp"
                                alt="Marinho Ponci"
                                className="w-full h-full object-cover object-[70%_15%]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        </div>

                        <div className="relative z-10 flex flex-col text-left">
                            <h1 className="text-xl font-black uppercase text-white leading-tight tracking-tighter mb-4 cinematic-text-shadow">
                                CONSTRUIR UMA EMPRESA É DIFÍCIL.{' '}
                                <span className="block text-accent-gold italic mt-1">
                                    NÃO PRECISA FAZER ESSE CAMINHO SOZINHO.
                                </span>
                            </h1>

                            <div className="pl-4 border-l-2 border-accent-gold/50 mb-6">
                                <p className="text-xs text-white/70 font-medium leading-relaxed">
                                    Com quase 40 anos de experiência na criação, gestão e expansão de empresas em diferentes países, ajudo empresários a organizar seus negócios, tomar melhores decisões e construir empresas mais sólidas.
                                </p>
                            </div>

                            <button
                                onClick={scrollToForm}
                                className="w-full py-4 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.2em] text-center"
                            >
                                AGENDAR UMA CONVERSA
                            </button>
                        </div>
                    </div>
                </section>

                {/* ═══ PARA QUEM É (Immersive interactive card grid + CTA button) ═══ */}
                <section id="para-quem" className="py-24 md:py-32 bg-[#050505] relative border-b border-white/5 overflow-hidden">
                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent-gold/5 blur-[160px] rounded-full pointer-events-none" />

                    <div className="max-w-[1350px] mx-auto px-6 md:px-12 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-white cinematic-text-shadow">
                                Esta consultoria é para você se...
                            </h2>
                            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent mx-auto mt-4 rounded-full"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {[
                                {
                                    num: '01',
                                    title: 'Início com Base Sólida',
                                    desc: 'Está iniciando um negócio e quer construir uma base sólida desde o primeiro dia.'
                                },
                                {
                                    num: '02',
                                    title: 'Organização e Direção',
                                    desc: 'Já tem uma empresa, mas sente falta de organização, clareza e direção estratégica.'
                                },
                                {
                                    num: '03',
                                    title: 'Crescimento com Controle',
                                    desc: 'Quer crescer o faturamento sem perder o controle da gestão operacional.'
                                },
                                {
                                    num: '04',
                                    title: 'Visão Estratégica em Decisões',
                                    desc: 'Tem decisões complexas para tomar e precisa de uma visão experiente, externa e isenta.'
                                },
                                {
                                    num: '05',
                                    title: 'Processos, Time e Resultados',
                                    desc: 'Quer melhorar o desempenho dos processos internos, alinhar o time e alavancar resultados.'
                                },
                                {
                                    num: '06',
                                    title: 'Experiência Prática',
                                    desc: 'Procura alguém com experiência prática comprovada para ajudar a evitar erros caros e encurtar o caminho.'
                                }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="relative p-8 rounded-2xl bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-black border border-white/10 hover:border-accent-gold/50 transition-all duration-500 flex flex-col justify-between group hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(225,169,96,0.12)] overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/5 blur-2xl group-hover:bg-accent-gold/15 transition-all duration-500 pointer-events-none" />

                                    <div>
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-3xl font-black text-white/20 group-hover:text-accent-gold transition-colors duration-500 tracking-wider font-mono">{item.num}</span>
                                            <span className="w-9 h-9 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center text-accent-gold group-hover:scale-110 group-hover:bg-accent-gold group-hover:text-black transition-all duration-500">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-3 group-hover:text-accent-gold transition-colors duration-300">{item.title}</h3>
                                        <p className="text-sm text-white/65 leading-relaxed font-normal">{item.desc}</p>
                                    </div>

                                    <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-accent-gold to-transparent transition-all duration-500 mt-6"></div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button in "Esta consultoria é para você se..." */}
                        <div className="mt-16 text-center">
                            <button
                                onClick={scrollToForm}
                                className="px-10 py-5 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.2em] rounded hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(225,169,96,0.25)] inline-flex items-center gap-3 group"
                            >
                                <span>Agendar uma Conversa</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ═══ SOBRE O MARINHO ═══ */}
                <section id="sobre" className="py-24 md:py-32 bg-black relative border-b border-white/5 overflow-hidden">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                            
                            {/* Seamless Non-Boxed Photo / Left */}
                            <div className="lg:col-span-5 relative flex justify-center">
                                <div className="relative w-full max-w-lg aspect-[4/5] overflow-hidden">
                                    <img
                                        src="/sobre.webp"
                                        alt="Marinho Ponci"
                                        className="w-full h-full object-cover filter brightness-[0.95] opacity-90 hover:opacity-100 transition-opacity duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 pointer-events-none" />
                                    <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black via-black/40 to-transparent pointer-events-none" />
                                    <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black via-black/40 to-transparent pointer-events-none" />
                                    
                                    <div className="absolute bottom-4 left-4 right-4 text-center">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold">38 Anos de Experiência Prática</span>
                                    </div>
                                </div>
                            </div>

                            {/* Text & Authentic Headline / Right */}
                            <div className="lg:col-span-7 flex flex-col justify-center">
                                <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] block mb-2">Sobre o Marinho</span>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter uppercase text-white mb-6 cinematic-text-shadow leading-snug">
                                    NÃO É TEORIA DE LIVRO. É A MATURIDADE DE QUASE 40 ANOS GERINDO NEGÓCIOS REAIS.
                                </h2>

                                <div className="space-y-5 text-base text-white/70 leading-relaxed font-normal">
                                    <p>
                                        Durante quase quatro décadas participei da construção, expansão e desenvolvimento de empresas em diferentes setores, em diferentes países, acompanhando empresários em momentos decisivos de suas jornadas.
                                    </p>
                                    <p className="border-l-2 border-accent-gold pl-4 text-white font-medium italic bg-white/[0.02] py-2">
                                        Ao longo dessa trajetória percebi que o verdadeiro crescimento de uma empresa começa muito antes dos números. Começa nas decisões, na organização e na capacidade do empresário de liderar o próprio negócio com clareza.
                                    </p>
                                    <p>
                                        Hoje coloco toda essa experiência a serviço de pequenos e médios empresários — em qualquer país ou mercado — que querem construir empresas mais fortes e se preparar para o futuro.
                                    </p>
                                </div>

                                {/* Merged "O Meu Compromisso" Box */}
                                <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[#121212] via-[#0c0c0c] to-black border-l-4 border-accent-gold border-y border-r border-white/10">
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-accent-gold mb-2">O Meu Compromisso</div>
                                    <p className="text-sm text-white/80 leading-relaxed italic">
                                        "Você não vai encontrar fórmulas mágicas aqui. Cada empresa tem a sua história e cada empresário enfrenta desafios diferentes. Meu trabalho é entender a realidade concreta do seu negócio e ajudar você a encontrar soluções práticas, sustentadas por quase 40 anos de experiência."
                                    </p>
                                </div>

                                {/* Clean signature image */}
                                <div className="mt-8 pt-4 flex items-center">
                                    <img src="/marinho final.webp" alt="Assinatura Marinho Ponci" className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity" />
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ═══ COMO POSSO AJUDAR (6 PILARES - SVG ICONS) ═══ */}
                <section id="como-ajudo" className="py-24 md:py-32 bg-[#080808] relative border-b border-white/5">
                    <div className="max-w-[1350px] mx-auto px-6 md:px-12">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] block mb-2">Áreas de Atuação</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-white cinematic-text-shadow">
                                Como Posso Ajudar
                            </h2>
                            <p className="text-sm text-white/60 mt-3 max-w-xl mx-auto">
                                Um acompanhamento personalizado nos pilares essenciais para a sustentabilidade e o crescimento da sua empresa — independentemente do país onde ela opera.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {[
                                {
                                    title: 'Estruturar o seu negócio',
                                    desc: 'Organizar a empresa para crescer com bases sólidas.',
                                    icon: (
                                        <svg className="w-6 h-6 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Melhorar a gestão',
                                    desc: 'Criar processos e métodos que facilitam a tomada de decisão.',
                                    icon: (
                                        <svg className="w-6 h-6 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                            <line x1="8" y1="21" x2="16" y2="21" />
                                            <line x1="12" y1="17" x2="12" y2="21" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Desenvolver estratégia',
                                    desc: 'Definir prioridades e construir um plano claro para o crescimento.',
                                    icon: (
                                        <svg className="w-6 h-6 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Organizar as finanças',
                                    desc: 'Compreender os números para decidir com mais segurança.',
                                    icon: (
                                        <svg className="w-6 h-6 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="1" x2="12" y2="23" />
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Desenvolver a liderança',
                                    desc: 'Fortalecer o papel do empresário como líder do negócio e do time.',
                                    icon: (
                                        <svg className="w-6 h-6 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                    )
                                },
                                {
                                    title: 'Preparar o crescimento',
                                    desc: 'Construir uma empresa preparada para crescer de forma sustentável.',
                                    icon: (
                                        <svg className="w-6 h-6 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                            <polyline points="17 6 23 6 23 12" />
                                        </svg>
                                    )
                                }
                            ].map((pillar, idx) => (
                                <div
                                    key={idx}
                                    className="p-8 rounded-2xl bg-black border border-white/10 hover:border-accent-gold/50 transition-all duration-300 flex flex-col justify-between group hover:shadow-[0_10px_30px_rgba(225,169,96,0.1)]"
                                >
                                    <div>
                                        <div className="w-12 h-12 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            {pillar.icon}
                                        </div>
                                        <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-3 group-hover:text-accent-gold transition-colors">{pillar.title}</h3>
                                        <p className="text-sm text-white/60 leading-relaxed font-normal">{pillar.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ HISTÓRIAS DE ALTO PADRÃO (DEPOIMENTOS / CASES) ═══ */}
                <section className="py-24 md:py-32 bg-[#050505] relative border-b border-white/5 overflow-hidden">
                    <div className="max-w-[1350px] mx-auto px-6 md:px-12 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] block mb-2">Cases & Prova Real</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-white cinematic-text-shadow leading-tight">
                                Histórias de <br /><span className="text-accent-gold italic">Alto Padrão.</span>
                            </h2>
                            <p className="text-sm text-white/60 mt-4 max-w-xl mx-auto font-normal">
                                Empresários que transformaram seus negócios através da internacionalização e consultoria estratégica.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                            {[
                                { id: 1, name: 'Diego Bim', role: 'Franqueado', company: 'Influx Escola de Inglês', videoId: '/videos/diego.mp4', image: 'diego.webp' },
                                { id: 2, name: 'Marcelo Zacarias', role: 'CEO & Founder', company: 'Tio Fafá Hamburgueria', videoId: '/videos/marcelo.mp4', image: 'marcelo.webp' },
                                { id: 3, name: 'João Ferrari', role: 'CEO', company: 'Nutrafit', videoId: '/videos/joao.mp4', image: 'joao ferrai.webp' },
                                { id: 4, name: 'Adriana Auriemo', role: 'CEO e Founder', company: 'Nutty Bavarian', videoId: '/videos/adriana.webp', image: 'adriana .webp' },
                                { id: 5, name: 'Leandro Otávio', role: 'Founder', company: "D'avila Finance", videoId: '/videos/leandro.mp4', image: 'leandro.webp' }
                            ].map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (item.videoId) {
                                            setSelectedVideoId(item.videoId);
                                            setIsVideoModalOpen(true);
                                        }
                                    }}
                                    className="group relative aspect-[9/16] sm:aspect-[10/16] overflow-hidden cursor-pointer bg-zinc-900/60 rounded-2xl border border-white/10 hover:border-accent-gold/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_15px_35px_rgba(225,169,96,0.15)]"
                                >
                                    <img
                                        src={`/${item.image}`}
                                        alt={`Depoimento ${item.name}`}
                                        className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.4] group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105 transition-all duration-700 ease-out"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500"></div>
                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                        <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(225,169,96,0.4)] group-hover:scale-110 transition-transform duration-300">
                                            <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                        </div>
                                        <h4 className="text-white font-black text-lg uppercase tracking-tight leading-none mb-1.5">{item.name}</h4>
                                        <p className="text-accent-gold text-[10px] font-bold uppercase tracking-wider">{item.role}</p>
                                        <p className="text-white/40 text-[9px] uppercase tracking-wider">{item.company}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ COMO FUNCIONA (Pipeline + CTA Button) ═══ */}
                <section id="como-funciona" className="py-24 md:py-32 bg-black relative border-b border-white/5 overflow-hidden">
                    <div className="absolute top-1/2 right-1/4 w-[600px] h-[400px] bg-accent-gold/5 blur-[150px] pointer-events-none" />

                    <div className="max-w-[1350px] mx-auto px-6 md:px-12 relative z-10">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] block mb-2">Metodologia Prática</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-white cinematic-text-shadow">
                                Como Funciona
                            </h2>
                            <p className="text-sm text-white/60 mt-3">Um acompanhamento em 4 etapas estratégicas e contínuas.</p>
                        </div>

                        {/* Interactive Step Timeline Pipeline */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                            {[
                                {
                                    step: '01',
                                    title: 'Conversa Inicial',
                                    desc: 'Entendemos o seu negócio, os desafios e os objetivos reais.',
                                    icon: (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    )
                                },
                                {
                                    step: '02',
                                    title: 'Diagnóstico',
                                    desc: 'Identificamos oportunidades de melhoria e os pontos prioritários.',
                                    icon: (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                        </svg>
                                    )
                                },
                                {
                                    step: '03',
                                    title: 'Plano de Ação',
                                    desc: 'Definimos prioridades e metas com ações práticas e aplicáveis.',
                                    icon: (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                    )
                                },
                                {
                                    step: '04',
                                    title: 'Acompanhamento',
                                    desc: 'Implementamos as melhorias lado a lado e acompanhamos a evolução.',
                                    icon: (
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                            <polyline points="17 6 23 6 23 12" />
                                        </svg>
                                    )
                                }
                            ].map((st, idx) => {
                                const isActive = activeStep === idx;
                                return (
                                    <div
                                        key={idx}
                                        onMouseEnter={() => setActiveStep(idx)}
                                        className={`relative p-8 rounded-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between group ${
                                            isActive
                                                ? 'bg-gradient-to-b from-[#181818] to-black border-2 border-accent-gold shadow-[0_10px_40px_rgba(225,169,96,0.15)] -translate-y-2'
                                                : 'bg-[#0a0a0a] border border-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-6">
                                                <span className={`text-4xl font-black font-mono transition-colors duration-300 ${isActive ? 'text-accent-gold' : 'text-white/20'}`}>
                                                    {st.step}
                                                </span>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                    isActive ? 'bg-accent-gold text-black scale-110' : 'bg-white/5 text-white/50'
                                                }`}>
                                                    {st.icon}
                                                </div>
                                            </div>

                                            <h3 className={`text-lg font-bold uppercase tracking-tight mb-3 transition-colors ${isActive ? 'text-accent-gold' : 'text-white'}`}>
                                                {st.title}
                                            </h3>
                                            <p className="text-xs text-white/60 leading-relaxed font-normal">
                                                {st.desc}
                                            </p>
                                        </div>

                                        <div className="mt-8 flex items-center gap-2">
                                            <div className={`h-1 rounded-full transition-all duration-500 ${isActive ? 'w-full bg-accent-gold' : 'w-6 bg-white/10'}`}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* CTA Button in "Como Funciona" */}
                        <div className="mt-16 text-center">
                            <button
                                onClick={scrollToForm}
                                className="px-10 py-5 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.2em] rounded hover:bg-white transition-all duration-300 shadow-[0_0_30px_rgba(225,169,96,0.25)] inline-flex items-center gap-3 group"
                            >
                                <span>Agendar uma Conversa</span>
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ═══ FRASE DE POSICIONAMENTO (QUOTE BANNER) ═══ */}
                <section className="py-24 md:py-32 bg-black relative border-b border-white/5 overflow-hidden">
                    <div className="max-w-[1200px] mx-auto px-6 md:px-12 text-center relative z-10">
                        <div className="text-4xl font-serif text-accent-gold/40 mb-4">“</div>
                        
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white max-w-4xl mx-auto leading-tight tracking-tighter uppercase mb-8 cinematic-text-shadow">
                            TODA EMPRESA PRECISA DE{' '}
                            <span className="text-accent-gold italic drop-shadow-[0_0_20px_rgba(225,169,96,0.3)]">DIREÇÃO</span>{' '}
                            ANTES DE PRECISAR DE VELOCIDADE.
                        </h2>

                        <p className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto font-medium leading-relaxed">
                            Acredito que empresas bem organizadas tomam melhores decisões, desenvolvem melhores pessoas e constroem resultados mais consistentes.
                        </p>
                    </div>
                </section>

                {/* ═══ CTA FINAL & FORMULÁRIO DE AGENDAMENTO ═══ */}
                <section id="agendar-conversa" className="py-24 md:py-32 bg-gradient-to-b from-[#080808] to-black relative">
                    <div className="max-w-[1100px] mx-auto px-6 md:px-12">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                            
                            {/* Call out left */}
                            <div className="lg:col-span-5 flex flex-col justify-center">
                                <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] block mb-2">Agendamento Inicial</span>
                                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white leading-tight mb-6">
                                    Vamos conversar sobre o futuro do seu negócio?
                                </h2>
                                <p className="text-base text-white/70 leading-relaxed font-normal mb-8">
                                    Se você procura mais organização, clareza e estratégia para construir uma empresa mais forte, será um prazer conhecer a sua realidade. Atendo empresários em português e inglês, presencialmente ou por videochamada, em qualquer fuso horário.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <svg className="w-5 h-5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Conversa inicial sem compromisso</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <svg className="w-5 h-5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Atendimento direto e exclusivo com Marinho Ponci</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-white/80">
                                        <svg className="w-5 h-5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Atendimento global · Português e inglês (+351 967 284 661)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Form right */}
                            <div className="lg:col-span-7">
                                <div className="p-8 sm:p-10 rounded-2xl bg-[#0c0c0c] border border-white/15 shadow-2xl">
                                    <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-2">Agendar Reunião Estratégica</h3>
                                    <p className="text-xs text-white/50 mb-6">Preencha os dados abaixo para alinharmos o melhor horário na agenda do Marinho, no seu fuso horário.</p>

                                    {submitSuccess ? (
                                        <div className="p-6 rounded-xl bg-accent-gold/10 border border-accent-gold/30 text-center animate-in fade-in">
                                            <svg className="w-12 h-12 text-accent-gold mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                            <h4 className="text-lg font-bold uppercase text-white mb-2">Solicitação enviada com sucesso!</h4>
                                            <p className="text-xs text-white/70 mb-4">Você está sendo redirecionado para o WhatsApp corporativo para confirmar os detalhes.</p>
                                            <button
                                                onClick={() => setSubmitSuccess(false)}
                                                className="text-xs font-bold text-accent-gold underline"
                                            >
                                                Enviar outra mensagem
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleFormSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                                                    Seu Nome Completo *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Ex: João Silva"
                                                    className="w-full bg-black border border-white/15 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent-gold transition-all"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                                                        E-mail Corporativo *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="seu.email@empresa.com"
                                                        className="w-full bg-black border border-white/15 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent-gold transition-all"
                                                    />
                                                </div>

                                                <CountryPhoneInput
                                                    value={phone}
                                                    onChange={(val) => setPhone(val)}
                                                    required={true}
                                                    label="WhatsApp *"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                                                        Nome da Empresa
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={companyName}
                                                        onChange={(e) => setCompanyName(e.target.value)}
                                                        placeholder="Sua Marca / Empresa"
                                                        className="w-full bg-black border border-white/15 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent-gold transition-all"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                                                        Cidade / País
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={location}
                                                        onChange={(e) => setLocation(e.target.value)}
                                                        placeholder="Ex: Lisboa, São Paulo, Madrid, Miami"
                                                        className="w-full bg-black border border-white/15 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent-gold transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">
                                                    Qual é o seu principal desafio hoje?
                                                </label>
                                                <textarea
                                                    rows={3}
                                                    value={mainChallenge}
                                                    onChange={(e) => setMainChallenge(e.target.value)}
                                                    placeholder="Descreva resumidamente o momento atual da empresa..."
                                                    className="w-full bg-black border border-white/15 rounded px-4 py-3.5 text-sm text-white focus:outline-none focus:border-accent-gold transition-all resize-none"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full py-4 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.25em] rounded hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(225,169,96,0.2)] disabled:opacity-50"
                                            >
                                                {submitting ? 'Enviando...' : 'Agendar uma Conversa'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-black border-t border-white/10 py-12 text-center text-xs text-white/40">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/marinho final.webp" alt="Marinho Ponci" className="h-8 w-auto opacity-70" />
                        <span className="text-[10px] uppercase tracking-widest text-white/30">Biz Guardian World Connections</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest">
                        © {new Date().getFullYear()} Marinho Ponci · Todos os direitos reservados
                    </div>
                </div>
            </footer>

            {/* Video Modal Player */}
            <VideoModal
                isOpen={isVideoModalOpen}
                videoId={selectedVideoId}
                onClose={() => setIsVideoModalOpen(false)}
            />
        </div>
    );
}
