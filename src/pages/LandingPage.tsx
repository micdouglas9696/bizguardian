import { Link } from 'react-router-dom';
import EcosystemMolecule from '../components/EcosystemMolecule';
import HeroBillboard from '../components/HeroBillboard';
import MainHero from '../components/MainHero';
import { useState, useEffect, useCallback, useRef } from 'react';
import ManifestoModal from '../components/ManifestoModal';
import ManifestoHook from '../components/ManifestoHook';
import QuotesModal from '../components/QuotesModal';
import PhotoMural from '../components/PhotoMural';
import VideoModal from '../components/VideoModal';
import PriorityListModal from '../components/PriorityListModal';
import CountryPhoneInput from '../components/CountryPhoneInput';

const NAV_ITEMS = [
    { name: 'Quem sou', id: 'sobre' },
    { name: 'Ecossistema', id: 'ecossistema' },
    { name: 'Para Franqueados', id: 'herobillboard' },
    { name: 'Para Marcas', id: 'internacionalize' },
    { name: 'Fale comigo', id: 'contato' }
];

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [isManifestoOpen, setIsManifestoOpen] = useState(false);
    const [isQuotesOpen, setIsQuotesOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

    // Contact Form State
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactService, setContactService] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Scroll-reveal observer for sections
    const mainRef = useRef<HTMLElement>(null);
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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const handleMobileNavClick = useCallback((id: string) => {
        setMobileMenuOpen(false);
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }, []);

    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-6 sm:py-8'}`}>
                <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-col leading-none select-none cursor-pointer group">
                            <img src="/marinho final.png" alt="Marinho Signature Logo" className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {NAV_ITEMS.map((item) => (
                            <a
                                key={item.name}
                                href={`#${item.id}`}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-accent-gold transition-all duration-300 relative group/nav whitespace-nowrap"
                            >
                                {item.name}
                                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-accent-gold transition-all duration-300 group-hover/nav:w-full"></span>
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Smaller member button */}
                        {/* Removed member area button as requested */}

                        {/* Hamburger Menu — Mobile/Tablet only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[5px] group"
                            aria-label="Menu de navegação"
                        >
                            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : 'group-hover:w-5 group-hover:bg-accent-gold'}`}></span>
                            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-x-0' : 'group-hover:bg-accent-gold'}`}></span>
                            <span className={`block w-6 h-[2px] bg-white transition-all duration-300 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : 'group-hover:w-4 group-hover:bg-accent-gold'}`}></span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-0 z-[45] lg:hidden transition-all duration-500 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Drawer Panel */}
                <div className={`absolute top-0 right-0 h-full w-full sm:w-[380px] bg-[#0a0a0a] border-l border-white/5 transition-transform duration-500 ease-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full pt-28 px-8 pb-12">
                        {/* Nav Links */}
                        <nav className="flex flex-col gap-1 flex-1">
                            {NAV_ITEMS.map((item, index) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleMobileNavClick(item.id)}
                                    className={`text-left py-4 border-b border-white/5 transition-all duration-500 group ${mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                                    style={{ transitionDelay: mobileMenuOpen ? `${index * 60 + 100}ms` : '0ms' }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-mono text-accent-gold/30 font-bold">0{index + 1}</span>
                                            <span className="text-sm font-black uppercase tracking-[0.2em] text-white/70 group-hover:text-accent-gold transition-colors duration-300">
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="material-symbols-outlined text-white/10 text-sm group-hover:text-accent-gold group-hover:translate-x-1 transition-all duration-300">arrow_forward</span>
                                    </div>
                                </button>
                            ))}
                        </nav>

                        {/* Bottom CTA */}
                        <div className={`mt-auto transition-all duration-500 ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: mobileMenuOpen ? '500ms' : '0ms' }}>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.3em] text-center mt-4">
                                Marinho Ponci · Season 2026
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main ref={mainRef}>
                <MainHero />

                {/* Stats Strip — replaces QuotesMarquee */}
                <div className="relative z-20 -mt-px border-y border-white/5 bg-black py-6 sm:py-8 overflow-hidden">
                    <div className="max-w-[1700px] mx-auto px-6 md:px-12">
                        <div className="flex flex-wrap justify-center gap-10 sm:gap-16 md:gap-24 lg:gap-32">
                            <div className="flex flex-col items-center gap-2 group">
                                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter group-hover:text-accent-gold transition-colors duration-500">850+</span>
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold/70">Pontos "inaugurados"</span>
                            </div>
                            <div className="w-px h-16 bg-white/10 hidden sm:block self-center"></div>
                            <div className="flex flex-col items-center gap-2 group">
                                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter group-hover:text-accent-gold transition-colors duration-500">10+</span>
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold/70">"Novos" países</span>
                            </div>
                            <div className="w-px h-16 bg-white/10 hidden sm:block self-center"></div>
                            <div className="flex flex-col items-center gap-2 group">
                                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter group-hover:text-accent-gold transition-colors duration-500">+3.000</span>
                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold/70">Candidatos Entrevistados</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
                </div>

                {/* Section :: Sobre o Marinho */}
                <section className="py-6 sm:py-10 md:py-12 relative overflow-hidden bg-[#050505] section-reveal" id="sobre">
                    <div className="max-w-[1700px] mx-auto grid lg:grid-cols-12 min-h-[700px] relative gap-0">
                        {/* Full-Bleed Immersive Media Area */}
                        <div className="lg:col-span-5 relative h-full min-h-[400px] lg:min-h-0 flex items-center justify-center">
                            <div className="absolute inset-x-0 -inset-y-32 lg:-inset-y-32">
                                <div className="relative w-full h-full group overflow-hidden flex items-center justify-center">
                                    <img src="/sobre.png" alt="Marinho Ponci" className="w-full h-full object-contain object-center opacity-90 group-hover:opacity-100 transition-all duration-1000 scale-100 group-hover:scale-105" />

                                    {/* Soft Transparency Masks */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent z-10"></div>
                                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#050505] lg:hidden z-10"></div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10"></div>
                                </div>
                            </div>
                        </div>

                        {/* Descriptive Content Area */}
                        <div className="lg:col-span-7 relative z-30 p-5 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-accent-gold mb-8 tracking-tight leading-[1.05]">
                                Estratégia, Escala e <br />Legado no Franchising
                            </h2>
                            <div className="space-y-5 text-sm md:text-base text-white/60 font-medium leading-relaxed">
                                <p>Iniciei minha trajetória em 1987 no time de startup da <strong className="text-white">MOBITEL</strong> (Portugal Telecom). Ao longo de 12 anos, trabalhamos para implantar o sistema de pagers no Brasil e consolidar a operação como a MAIOR da América Latina. Um marco que definiu minha paixão por grandes desafios.</p>
                                <p>Posteriormente, tive a honra de formatar a icônica <strong className="text-white">CHILLI BEANS</strong> ao lado de Caito Maia e uma equipe brilhante. Essa união de talentos permitiu uma expansão agressiva, levando a marca a vários países e consolidando 853 pontos de venda globais.</p>
                                <p>Essa bagagem prática me permitiu atuar como professor de MBA e palestrante, compartilhando com o mercado metodologias reais sobre cultura corporativa e padronização de redes.</p>
                                <p>Hoje, com quase 4 décadas de experiência, criei a <strong className="text-white">BIZGUARDIAN World Connections</strong>—um ecossistema completo que integra consultoria estratégica, capacitação de líderes e aceleração de marcas em expansão.</p>
                                <p>Atuo como mentor e conselheiro estratégico de diretores e CEOs, entregando o "playbook" de quem viveu a internacionalização nos últimos 38 anos.</p>
                                <p className="text-white/40 italic">Se você acredita que eu posso ajudar com a minha experiência, vai ser um prazer caminhar ao seu lado e ajudar a construir o próximo capítulo da história da sua marca.</p>
                            </div>

                            {/* Signature — below text, right aligned, less transparent */}
                            <div className="mt-5 sm:mt-6 w-full flex justify-end">
                                <img src="/2.png" alt="Assinatura Marinho Ponci" className="h-10 sm:h-12 w-auto object-contain opacity-70" />
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
                                <ManifestoHook onOpen={() => setIsManifestoOpen(true)} />
                                <button
                                    onClick={() => setIsQuotesOpen(true)}
                                    className="w-full sm:w-auto px-10 py-5 bg-accent-gold text-black text-xs sm:text-sm font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 flex items-center justify-center gap-3 group"
                                >
                                    <span className="transition-transform group-hover:-translate-x-1">CITAÇÕES</span>
                                    <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">auto_stories</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>



                <div className="relative z-10 bg-black pt-6">
                    {/* Ecosystem Section :: Topological Shift */}
                    <section className="mb-12 relative w-full section-reveal" id="ecossistema">
                        <div className="max-w-[1700px] mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-16 items-center">
                            <div className="lg:col-span-5 relative z-20 flex flex-col items-center sm:items-start text-center sm:text-left">
                                <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-tight cinematic-text-shadow animate-reveal-skew opacity-0 text-center sm:text-left mt-6">
                                    Ecossistema <br /> <span className="text-accent-gold italic block mt-4 animate-reveal-skew opacity-0 [animation-delay:200ms]">Bizguardian.</span>
                                </h2>
                                <p className="text-xl text-white/40 font-medium max-w-xl leading-relaxed mb-12">
                                    Navegue pela estrutura completa de suporte estratégico. Uma rede integrada projetada para escala global.
                                </p>

                                <div className="pt-12 text-center sm:text-left">
                                    <div className="inline-block border-t border-white/10 pt-8 mt-4">
                                        <span className="text-3xl font-black text-white block mb-1">🇵🇹 🇪🇸 🇦🇹 🇺🇸 🇧🇷</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold">Parceria presente em</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 relative will-change-gpu">
                                <EcosystemMolecule />
                            </div>
                        </div>
                    </section>

                    <HeroBillboard />

                    {/* Section :: Internacionalize-se */}
                    <section className="mb-12 bg-[#080808] py-16 sm:py-24 md:py-32 sm:rounded-[2rem] md:rounded-[3rem] sm:border sm:border-white/5 sm:mx-6 md:mx-12 overflow-hidden relative section-reveal" id="internacionalize">
                        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-accent-gold/5 rounded-full blur-[150px] -translate-y-1/2 -translate-x-1/2"></div>
                        <div className="max-w-[1700px] mx-auto grid lg:grid-cols-12 min-h-[600px] relative gap-0">
                            {/* Media Area :: Immersive & Bleeding (ORDER 1 ON MOBILE) */}
                            <div className="lg:col-span-6 relative order-1 lg:order-1 h-full min-h-[400px] lg:min-h-0 group">
                                <div className="absolute -inset-x-20 lg:-inset-x-40 -inset-y-32 lg:-inset-y-48">
                                    <div className="relative w-full h-full overflow-hidden">
                                        <img
                                            src="/_DSC4559.jpg"
                                            alt="Internacionalize-se immersion"
                                            className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000 scale-100 group-hover:scale-105"
                                            style={{ objectPosition: 'center 50%' }}
                                        />

                                        {/* Multi-Layer Cinematic Vignette */}
                                        <div className="absolute inset-0 z-10">
                                            {/* Advanced Edge Fading (Aggressive to hide container edges) */}
                                            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent"></div>
                                            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#080808] via-[#080808]/80 to-transparent"></div>

                                            {/* Top/Bottom Blending (Enhanced) */}
                                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#080808] via-[#080808]/60 to-transparent"></div>
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-transparent"></div>
                                        </div>

                                        <div className="absolute inset-0 flex items-center justify-center z-20">
                                            <div className="relative">
                                                <div className="absolute -inset-20 bg-accent-gold/20 blur-[80px] rounded-full animate-pulse opacity-40 group-hover:opacity-60 transition-opacity"></div>
                                                <button className="relative w-32 h-32 bg-black/40 backdrop-blur-2xl border border-white/10 text-white rounded-full flex items-center justify-center hover:bg-accent-gold hover:text-black hover:border-accent-gold transition-all duration-700 transform hover:scale-110 group/play shadow-2xl">
                                                    <span className="material-symbols-outlined text-7xl ml-1 font-black transition-transform group-hover/play:scale-110">play_arrow</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Descriptive Content Area (ORDER 2 ON MOBILE) */}
                            <div className="lg:col-span-6 relative z-30 p-5 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center sm:items-start text-center sm:text-left order-2 lg:order-2 mt-16 sm:mt-24 lg:mt-0">
                                <span className="inline-block py-1.5 px-4 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-10 w-fit">
                                    O Próximo Nível do Ecossistema
                                </span>
                                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight cinematic-text-shadow">
                                    A inteligência da internacionalização agora em <span className="text-accent-gold italic">escala tecnológica.</span>
                                </h2>
                                <p className="text-lg md:text-xl text-white/50 mb-6 leading-relaxed font-medium max-w-xl">
                                    Estamos em fase de construção da primeira plataforma de inteligência aplicada à internacionalização de marcas. Não se trata de automação genérica, mas da codificação do método que levou marcas a mais de 10 países, agora potencializado por IA.
                                </p>
                                <p className="text-base text-white/40 mb-10 leading-relaxed font-semibold max-w-xl">
                                    Estamos estruturando um ecossistema digital onde marcas terão acesso a:
                                </p>

                                <div className="flex flex-col gap-10 mb-12">
                                    {[
                                        { id: '01', title: 'Diagnóstico de Maturidade', desc: 'Análise cirúrgica da prontidão do seu negócio para o mercado global.', icon: 'monitoring' },
                                        { id: '02', title: 'Roadmap Tático Digital', desc: 'O passo a passo estratégico do primeiro contato até a inauguração.', icon: 'map' },
                                        { id: '03', title: 'Conexões de Elite', desc: 'Acesso direto à rede de parceiros fornecedores e jurídicos da Bizguardian.', icon: 'handshake' }
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-start gap-6 group">
                                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent-gold transition-all duration-500 shadow-hud flex-shrink-0">
                                                <span className="material-symbols-outlined text-white text-lg group-hover:text-black font-black">{item.icon}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-mono font-black text-accent-gold/40">{item.id}</span>
                                                    <h3 className="text-base font-black text-white uppercase tracking-wider leading-none">{item.title}</h3>
                                                </div>
                                                <p className="text-sm font-bold text-white/30 uppercase tracking-wider group-hover:text-white/50 transition-colors leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Status Badge */}
                                <div className="mb-10 py-4 px-6 bg-white/[0.03] border border-accent-gold/10 rounded-lg w-fit">
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">
                                        Status: <span className="text-accent-gold">Em Desenvolvimento Estratégico</span> · Lançamento 2026
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-8 w-full sm:w-auto">
                                    <button
                                        onClick={() => setIsPriorityModalOpen(true)}
                                        className="px-8 sm:px-10 md:px-14 py-5 sm:py-6 md:py-7 bg-accent-gold text-black text-sm sm:text-base font-black uppercase tracking-[0.15em] sm:tracking-[0.3em] hover:bg-white transition-all duration-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] text-center w-full sm:w-auto"
                                    >
                                        Quero internacionalizar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>



                    {/* Section :: Depoimentos */}
                    <section className="pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 px-3 sm:px-6 md:px-12 section-reveal" id="membros">
                        <div className="max-w-[1700px] mx-auto">
                            <div className="flex flex-col items-center text-center justify-center mb-12 sm:mb-16 md:mb-24 border-b border-white/10 pb-8 sm:pb-12 gap-6">
                                <div className="max-w-3xl flex flex-col items-center">
                                    <h3 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white mb-4 leading-tight animate-reveal-skew opacity-0 mt-6">
                                        Histórias de <br /><span className="text-accent-gold italic animate-reveal-skew opacity-0 [animation-delay:200ms]">Alto Padrão.</span>
                                    </h3>
                                    <p className="text-white/40 text-center text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] leading-relaxed max-w-lg mt-6">
                                        Empresários que transformaram seus negócios através da internacionalização estratégica.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                                {[
                                    { id: 1, name: 'Diego Bim', role: 'Franqueado', company: 'Influx Escola de Inglês', videoId: '1-KrKwsMfvkY4N5F7dIAt7C1nOv1k_Jve', image: 'diego.png' },
                                    { id: 2, name: 'Marcelo Zacarias', role: 'CEO & Founder', company: 'Tio Fafá Hamburgueria', videoId: '1EG5DkA2uXy4T-J1uEBe1k-kXvBic1RSd', image: 'marcelo.png' },
                                    { id: 3, name: 'João Ferrari', role: 'CEO', company: 'Nutrafit', videoId: '1K4mt7vXUixgIl4iWPpELkQf65luThiKv', image: 'joao ferrai.png' },
                                    { id: 4, name: 'Adriana Auriemo', role: 'CEO e Founder', company: 'Nutty Bavarian', videoId: '1XmOVBBCADaln-Xrok18xYcSDegA5QSeg', image: 'adriana .png' },
                                    { id: 5, name: 'Leandro Otávio', role: 'Founder', company: "D'avila Finance", videoId: '13RlGI5ejkXUb6W7VmicjueK2MjvZxM5P', image: 'leandro.png' }
                                ].map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative aspect-[10/16] overflow-hidden will-change-gpu cursor-pointer bg-zinc-900/40 rounded-sm border border-white/5 hover:border-accent-gold/30 transition-all duration-700"
                                        onClick={() => {
                                            if (item.videoId) {
                                                setSelectedVideoId(item.videoId);
                                                setIsVideoModalOpen(true);
                                            }
                                        }}
                                    >
                                        <img
                                            alt={`Depoimento ${item.name}`}
                                            className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.3] group-hover:grayscale-0 group-hover:brightness-75 group-hover:scale-105 transition-all duration-1000 ease-out"
                                            src={`/${item.image}`}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700"></div>
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                            <div className="mb-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                                <div className="w-12 h-12 rounded-full bg-accent-gold flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform duration-500">
                                                    <span className="material-symbols-outlined text-black font-black text-xl">play_arrow</span>
                                                </div>
                                                <h4 className="text-white font-black text-xl uppercase tracking-tighter leading-none mb-2">{item.name}</h4>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-accent-gold text-[10px] font-black uppercase tracking-[0.2em]">{item.role}</p>
                                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.1em]">{item.company}</p>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/0 group-hover:text-white/50 transition-all duration-700 translate-y-full group-hover:translate-y-0">
                                                    Assistir Depoimento
                                                </p>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10 group-hover:border-accent-gold/40 transition-colors duration-700"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <PhotoMural />

                    {/* CTA Final :: Contact Form */}
                    <section className="pb-16 sm:pb-24 md:pb-32 px-3 sm:px-6 md:px-12 section-reveal" id="contato">
                        <div className="max-w-[1700px] mx-auto relative overflow-hidden bg-[#050505] p-5 sm:p-10 md:p-16 lg:p-24 xl:p-32 rounded-2xl sm:rounded-[2rem]">
                            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                            <div className="relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
                                <div className="text-center sm:text-left">
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] tracking-tighter mb-6 uppercase">
                                        FALE COM <br /> <span className="text-accent-gold italic">MARINHO PONCI.</span>
                                    </h2>
                                    <p className="text-sm md:text-base text-white/50 max-w-md font-medium mb-12 leading-relaxed">
                                        Se você acredita que eu posso ajudar com a minha experiência, vai ser um prazer caminhar ao seu lado e ajudar a construir o próximo capítulo da história da sua marca.
                                    </p>
                                    <div className="flex flex-col gap-6 items-center sm:items-start">
                                        <a href="mailto:info@marinhoponci.com" className="flex items-center gap-4 group w-fit">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-accent-gold to-[#a47e4b] flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                                <span className="material-symbols-outlined text-white text-lg">mail</span>
                                            </div>
                                            <span className="text-sm font-medium text-white/70 group-hover:text-accent-gold transition-colors">info@marinhoponci.com</span>
                                        </a>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-accent-gold to-[#a47e4b] flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                                <span className="material-symbols-outlined text-white text-lg">public</span>
                                            </div>
                                            <span className="text-sm font-medium text-white/70">Portugal | Espanha | Brasil | Estados Unidos | Áustria</span>
                                        </div>
                                    </div>
                                </div>
                                <form className="space-y-5" onSubmit={async (e) => {
                                    e.preventDefault();
                                    setContactSubmitting(true);
                                    try {
                                        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                                        const res = await fetch(`${apiUrl}/api/leads/contact`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                name: contactName,
                                                email: contactEmail,
                                                whatsapp: contactPhone,
                                                service: contactService,
                                                message: contactMessage
                                            })
                                        });
                                        if (!res.ok) throw new Error('Erro');
                                        setContactSuccess(true);
                                        setContactName(''); setContactEmail(''); setContactPhone(''); setContactService(''); setContactMessage('');
                                    } catch {
                                        alert('Erro ao enviar. Tente novamente.');
                                    } finally {
                                        setContactSubmitting(false);
                                    }
                                }}>
                                    {contactSuccess ? (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-accent-gold/10 border border-accent-gold rounded-full flex items-center justify-center mx-auto mb-6">
                                                <span className="material-symbols-outlined text-accent-gold text-3xl">check</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Mensagem Enviada!</h3>
                                            <p className="text-white/50 text-sm mb-6">Entraremos em contato em breve.</p>
                                            <button type="button" onClick={() => setContactSuccess(false)} className="text-accent-gold text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Enviar outra mensagem</button>
                                        </div>
                                    ) : (
                                        <>
                                            <select
                                                id="contact-service-select"
                                                value={contactService}
                                                onChange={(e) => setContactService(e.target.value)}
                                                required
                                                className="bg-zinc-900/60 border border-white/10 rounded-md px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white focus:outline-none focus:border-accent-gold/50 transition-all w-full appearance-none cursor-pointer"
                                            >
                                                <option value="">SELECIONE O SERVIÇO DE INTERESSE</option>
                                                <option value="Internacionalização">INTERNACIONALIZAÇÃO</option>
                                                <option value="Franchise-se">FRANCHISE-SE</option>
                                                <option value="Palestras">PALESTRAS</option>
                                                <option value="Mentoria">MENTORIA</option>
                                                <option value="Conselheiro">CONSELHEIRO</option>
                                                <option value="Expansão">EXPANSÃO</option>
                                                <option value="Real State">REAL STATE</option>
                                                <option value="Eventos">EVENTOS</option>
                                                <option value="Podcast">PODCAST</option>
                                                <option value="Representação">REPRESENTAÇÃO</option>
                                                <option value="Licenciamentos">LICENCIAMENTOS</option>
                                            </select>
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <input type="text" placeholder="NOME COMPLETO" value={contactName} onChange={(e) => setContactName(e.target.value)} required className="bg-zinc-900/60 border border-white/10 rounded-md px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white focus:outline-none focus:border-accent-gold/50 transition-all w-full placeholder:text-white/30" />
                                                <input type="email" placeholder="EMAIL" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="bg-zinc-900/60 border border-white/10 rounded-md px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white focus:outline-none focus:border-accent-gold/50 transition-all w-full placeholder:text-white/30" />
                                            </div>
                                            <CountryPhoneInput
                                                value={contactPhone}
                                                onChange={setContactPhone}
                                                label="Telefone / WhatsApp"
                                            />
                                            <textarea placeholder="como posso te ajudar?" rows={5} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="bg-zinc-900/60 border border-white/10 rounded-md px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all w-full resize-none placeholder:text-white/30"></textarea>
                                            <button type="submit" disabled={contactSubmitting} className="w-full py-5 bg-transparent border-2 border-accent-gold text-accent-gold text-xs sm:text-sm font-black uppercase tracking-[0.3em] hover:bg-accent-gold hover:text-black transition-all duration-500 rounded-md flex items-center justify-center gap-3 disabled:opacity-50">
                                                {contactSubmitting ? (
                                                    <><span className="material-symbols-outlined animate-spin text-sm">autorenew</span> Enviando...</>
                                                ) : 'Enviar Mensagem'}
                                            </button>
                                        </>
                                    )}
                                </form>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-black text-white pt-16 pb-12 border-t border-white/5">
                <div className="max-w-[1700px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 mb-16">
                        {/* Column 1: Brand & Social */}
                        <div className="flex flex-col items-start">
                            <img src="/marinho final.png" alt="Marinho Ponci Logo" className="h-12 w-auto object-contain mb-8" />
                            <p className="text-white/40 text-sm font-medium leading-relaxed mb-8 max-w-sm">
                                Especialista em internacionalização de marcas, expansão de redes e estruturação de ecossistemas empresariais globais.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a href="https://www.linkedin.com/in/marinhoponci/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                </a>
                                <a href="https://www.youtube.com/channel/UCGNCj2ncXuC_-Iz0znRbyPA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                </a>
                                <a href="https://open.spotify.com/user/12159463678?si=7db287e2ae3d4f12" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                                </a>
                                <a href="https://www.instagram.com/marinhoponci/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                                <a href="https://www.facebook.com/marinho.ponci/?locale=pt_PT" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Navigation & Legal */}
                        <div className="flex gap-16 lg:justify-center">
                            <div>
                                <h5 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-6">Navegação</h5>
                                <div className="flex flex-col gap-4">
                                    {['Sobre', 'Ecossistema', 'Internacionalize-se'].map((item) => (
                                        <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-accent-gold transition-all">
                                            {item}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h5 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-6">Legal</h5>
                                <div className="flex flex-col gap-4">
                                    {['Privacidade', 'Termos', 'Compliance'].map((item) => (
                                        <a key={item} href="#" className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-accent-gold transition-all">
                                            {item}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Contact */}
                        <div className="flex flex-col md:items-end md:text-right">
                            <h5 className="text-white font-black uppercase tracking-[0.2em] text-[10px] mb-6">Contato Direto</h5>
                            <a href="mailto:info@marinhoponci.com" className="text-lg font-black text-white hover:text-accent-gold transition-colors mb-4 block">
                                info@marinhoponci.com
                            </a>
                            <p className="text-white/40 text-sm leading-relaxed max-w-xs md:max-w-[200px]">
                                Atendimento global. <br /> Parceria e estruturação estratégica.
                            </p>
                            <button onClick={() => document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' })} className="mt-8 px-8 py-4 bg-transparent border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.3em] hover:bg-accent-gold hover:text-black hover:border-accent-gold transition-all duration-500 rounded-md">
                                Falar Agora
                            </button>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 text-center md:text-left">
                            © 2026 MARINHO PONCI. ALL RIGHTS RESERVED. BORN FOR GLOBAL.
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 text-center md:text-right">
                            DEVELOPED BY AG SOLUTIONS
                        </p>
                    </div>
                </div>
            </footer>

            <ManifestoModal
                isOpen={isManifestoOpen}
                onClose={() => setIsManifestoOpen(false)}
            />

            <QuotesModal
                isOpen={isQuotesOpen}
                onClose={() => setIsQuotesOpen(false)}
            />

            <VideoModal
                isOpen={isVideoModalOpen}
                onClose={() => { setIsVideoModalOpen(false); setSelectedVideoId(null); }}
                videoId={selectedVideoId}
            />

            <PriorityListModal
                isOpen={isPriorityModalOpen}
                onClose={() => setIsPriorityModalOpen(false)}
            />
        </div>
    );
}
