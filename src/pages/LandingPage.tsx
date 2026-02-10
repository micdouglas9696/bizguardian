import { Link } from 'react-router-dom';
import EcosystemMolecule from '../components/EcosystemMolecule';
import HeroBillboard from '../components/HeroBillboard';
import MainHero from '../components/MainHero';
import { useState, useEffect } from 'react';
import ManifestoModal from '../components/ManifestoModal';
import ManifestoHook from '../components/ManifestoHook';
import VideoModal from '../components/VideoModal';
import QuotesMarquee from '../components/QuotesMarquee';
import PhotoMural from '../components/PhotoMural';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [isManifestoOpen, setIsManifestoOpen] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-8'}`}>
                <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-col leading-none select-none cursor-pointer group">
                            <img src="/marinho final.png" alt="Marinho Signature Logo" className="h-10 sm:h-14 md:h-20 lg:h-24 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8">
                        {[
                            { name: 'Quem sou', id: 'sobre' },
                            { name: 'Ecossistema', id: 'ecossistema' },
                            { name: 'Para Franqueados', id: 'franchise' },
                            { name: 'Para Marcas', id: 'internacionalize' },
                            { name: 'Depoimentos', id: 'membros' },
                            { name: 'Fale comigo', id: 'contato' }
                        ].map((item) => (
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

                    <div className="flex items-center gap-6">
                        <Link to="/login" className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-white text-black text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] hover:bg-accent-gold hover:text-white transition-all duration-500 whitespace-nowrap">
                            Área do Membro
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <MainHero />

                <QuotesMarquee />

                <HeroBillboard />

                {/* Section :: Sobre o Marinho */}
                <section className="py-16 sm:py-20 md:py-32 relative overflow-hidden bg-[#050505]" id="sobre">
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
                        <div className="lg:col-span-7 relative z-30 p-5 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center">
                            {/* Signature watermark */}
                            <img src="/2.png" alt="" className="absolute top-4 -left-16 w-48 h-auto opacity-20 pointer-events-none" />
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-accent-gold mb-8 tracking-tight leading-[1.05]">
                                Estratégia, Escala e <br />Legado no Franchising
                            </h2>
                            <span className="inline-block py-2 px-6 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-10 rounded-full">
                                O Especialista
                            </span>
                            <div className="space-y-5 text-sm md:text-base text-white/60 font-medium leading-relaxed">
                                <p>Iniciei minha trajetória em 1987 no time de startup da MOBITEL (Portugal Telecom). Ao longo de 12 anos, trabalhamos para implantar o sistema de pagers no Brasil e consolidar a operação como a MAIOR da América Latina. Um marco que definiu minha paixão por grandes desafios.</p>
                                <p>Posteriormente, tive a honra de formatar a icônica <strong className="text-white">CHILLI BEANS</strong> ao lado de Caito Maia e uma equipe brilhante. Essa união de talentos permitiu uma expansão agressiva, levando a marca a vários países e consolidando 853 pontos de venda globais.</p>
                                <p>Essa bagagem prática me permitiu atuar como professor de MBA e palestrante, compartilhando com o mercado metodologias reais sobre cultura corporativa e padronização de redes.</p>
                                <p>Hoje, com quase 4 décadas de experiência, criei a <strong className="text-white">BIZGUARDIAN World Connections</strong>—um ecossistema completo que integra consultoria estratégica, capacitação de líderes e aceleração de marcas em expansão.</p>
                                <p>Atuo como mentor e conselheiro estratégico de diretores e CEOs, entregando o "playbook" de quem viveu a internacionalização nos últimos 38 anos.</p>
                                <p className="text-white/40 italic">Se você acredita que eu posso ajudar com a minha experiência, vai ser um prazer caminhar ao seu lado e ajudar a construir o próximo capítulo da história da sua marca.</p>
                            </div>
                            <div className="mt-8 sm:mt-12 flex flex-wrap gap-6 sm:gap-8 md:gap-12 border-t border-white/10 pt-8 sm:pt-10">
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-black text-white">850+</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-accent-gold">Pontos Geridos</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-black text-white">10</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-accent-gold">Países Ativos</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-black text-white">38y</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-accent-gold">Experiência</span>
                                </div>
                            </div>
                            <ManifestoHook onOpen={() => setIsManifestoOpen(true)} />
                        </div>
                    </div>
                </section>

                <PhotoMural />

                <div className="relative z-10 bg-black pt-24">
                    {/* Ecosystem Section :: Topological Shift */}
                    <section className="mb-48 relative w-full" id="ecossistema">
                        <div className="max-w-[1700px] mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-16 items-center">
                            <div className="lg:col-span-5 relative z-20">
                                <span className="inline-block py-1.5 px-4 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-10 shadow-glow-primary">
                                    Comando Central
                                </span>
                                <h2 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-10 tracking-tighter leading-tight cinematic-text-shadow animate-reveal-skew opacity-0">
                                    Ecossistema <br /> <span className="text-accent-gold italic block mt-4 animate-reveal-skew opacity-0 [animation-delay:200ms]">Conectado.</span>
                                </h2>
                                <p className="text-xl text-white/40 font-medium max-w-xl leading-relaxed mb-12">
                                    Navegue pela estrutura completa de suporte estratégico europeu. Uma rede integrada projetada para escala global.
                                </p>

                                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-12">
                                    <div>
                                        <span className="text-3xl font-black text-white block mb-1">07</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold">Países Ativos</span>
                                    </div>
                                    <div>
                                        <span className="text-3xl font-black text-white block mb-1">24/7</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold">Monitoramento</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-7 relative h-[600px] md:h-[800px] will-change-gpu">
                                <div className="absolute inset-0 bg-accent-gold/5 rounded-full blur-[120px] opacity-20"></div>
                                <EcosystemMolecule />
                            </div>
                        </div>
                    </section>

                    {/* Section :: Franchise-se */}
                    <section className="mb-20 sm:mb-32 md:mb-48 bg-[#080808] py-16 sm:py-24 md:py-32 sm:rounded-[2rem] md:rounded-[3rem] sm:border sm:border-white/5 sm:mx-6 md:mx-12 overflow-hidden relative" id="franchise">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-gold/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                        <div className="max-w-[1700px] mx-auto grid lg:grid-cols-12 min-h-[600px] relative gap-0">
                            {/* Full-Bleed Immersive Media Area */}
                            <div className="lg:col-span-6 relative h-full min-h-[400px] lg:min-h-0">
                                <div className="absolute inset-x-0 -inset-y-32 lg:-inset-y-32">
                                    <div className="relative w-full h-full group overflow-hidden">
                                        <img src="/Marinho-185.jpg" alt="Marinho Ponci - Franchise Expert" className="w-full h-full object-cover object-top grayscale opacity-60 group-hover:opacity-80 transition-all duration-1000 scale-105 group-hover:scale-100" />

                                        {/* Soft Transparency Masks */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-transparent to-transparent z-10"></div>
                                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#080808] lg:hidden z-10"></div>
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#080808] via-transparent to-[#080808] z-10"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Descriptive Content Area */}
                            <div className="lg:col-span-6 relative z-30 p-5 sm:p-8 md:p-16 lg:p-24 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
                                {/* Franchise-se Logo */}
                                <img src="/LOGO FUNDO ESCURO.png" alt="Franchise-se Logo" className="h-10 md:h-12 w-auto object-contain mb-8" />

                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter leading-[0.95]">
                                    Tá pensando em <br />entrar para o <br /><span className="text-accent-gold italic font-serif">mundo</span> <br />das franquias?
                                </h2>
                                <p className="text-base md:text-lg text-white/50 mb-12 leading-relaxed font-medium max-w-xl">
                                    sem rodeios vou te contar o que vi dar certo e o que vi dar errado em décadas acompanhando franqueadores e franqueados
                                </p>
                                <div className="flex flex-col gap-8 mb-12">
                                    <div className="flex items-center gap-5 group">
                                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent-gold transition-all duration-500 shadow-hud">
                                            <span className="material-symbols-outlined text-white text-lg group-hover:text-black">menu_book</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-widest text-white/80">E-book Premium</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Acesso Vitalício</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-5 group">
                                        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent-gold transition-all duration-500 shadow-hud">
                                            <span className="material-symbols-outlined text-white text-lg group-hover:text-black">school</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black uppercase tracking-widest text-white/80">Mentoria Estratégica</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Expertise Europeia</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-8 w-full sm:w-auto">
                                    <button className="px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 bg-white text-black text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] hover:bg-accent-gold hover:text-white transition-all shadow-glow-primary w-full sm:w-auto">
                                        Adquirir Conhecimento
                                    </button>
                                    <div className="hidden sm:flex flex-col gap-1">
                                        <span className="text-accent-gold text-[10px] font-black uppercase tracking-widest">Venda Liberada</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">Edição 2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section :: Internacionalize-se */}
                    <section className="mb-20 sm:mb-32 md:mb-48 bg-[#080808] py-16 sm:py-24 md:py-32 sm:rounded-[2rem] md:rounded-[3rem] sm:border sm:border-white/5 sm:mx-6 md:mx-12 overflow-hidden relative" id="internacionalize">
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
                                    Internacionalize-se
                                </span>
                                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight cinematic-text-shadow">
                                    Internacionalizar com <br /> <span className="text-accent-gold italic">Inteligência e Estratégia.</span>
                                </h2>
                                <p className="text-lg md:text-xl text-white/40 mb-12 leading-relaxed font-medium max-w-xl">
                                    Um sistema de inteligência e tecnologia que analisa a maturidade do seu negócio com precisão cirúrgica atrelado a 38 anos de experiência em internacionalização.
                                </p>

                                <div className="flex flex-col gap-10 mb-12">
                                    {[
                                        { id: '01', title: 'Roadmap Tático', desc: 'Plano passo a passo, do visto ao primeiro contrato internacional.', icon: 'map' },
                                        { id: '02', title: 'Conexões Diretas', desc: 'Advogados e parceiros logísticos direto no sistema.', icon: 'handshake' },
                                        { id: '03', title: 'Clone IA do Marinho', desc: '38 anos de expertise guiando sua jornada digital.', icon: 'psychology' }
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-start gap-6 group">
                                            <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent-gold transition-all duration-500 shadow-hud flex-shrink-0">
                                                <span className="material-symbols-outlined text-white text-lg group-hover:text-black font-black">{item.icon}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[10px] font-mono font-black text-accent-gold/40">{item.id}</span>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">{item.title}</h3>
                                                </div>
                                                <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-8 w-full sm:w-auto">
                                    <Link
                                        to="/internationalization"
                                        className="px-6 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 bg-white text-black text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] hover:bg-accent-gold hover:text-white transition-all shadow-glow-primary text-center w-full sm:w-auto block sm:inline-block"
                                    >
                                        Iniciar Internacionalização
                                    </Link>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-accent-gold text-[10px] font-black uppercase tracking-widest">Acesso Imediato</span>
                                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Protocolo 2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonials :: Cinematic Reel */}
                    <section className="mb-20 sm:mb-32 md:mb-48 px-3 sm:px-6 md:px-12" id="membros">
                        <div className="max-w-[1700px] mx-auto">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 md:mb-24 border-b border-white/10 pb-8 sm:pb-12 gap-6">
                                <div className="max-w-2xl">
                                    <span className="text-accent-gold font-black uppercase tracking-[0.4em] text-[10px] block mb-6">Membros Registrados</span>
                                    <h3 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-tight animate-reveal-skew opacity-0">
                                        Histórias de <br /><span className="text-accent-gold italic animate-reveal-skew opacity-0 [animation-delay:200ms]">Auto Padrão.</span>
                                    </h3>
                                </div>
                                <div className="hidden md:flex flex-col items-end gap-6">
                                    <p className="text-white/30 text-right text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed max-w-xs">
                                        Empresários que transformaram seus negócios através da internacionalização estratégica.
                                    </p>
                                    <button className="px-10 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                                        Portal de Sucesso
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                                {[
                                    {
                                        id: 1,
                                        name: 'Diego Bim',
                                        role: 'Sócio-Administrador',
                                        company: 'InFlux',
                                        videoId: '1-KrKwsMfvkY4N5F7dIAt7C1nOv1k_Jve',
                                        image: 'diego.png'
                                    },
                                    {
                                        id: 2,
                                        name: 'Marcelo Zacarias',
                                        role: 'CEO & Founder',
                                        company: 'Tio Fafá Company',
                                        videoId: '1EG5DkA2uXy4T-J1uEBe1k-kXvBic1RSd',
                                        image: 'marcelo.png'
                                    },
                                    {
                                        id: 3,
                                        name: 'João Ferrari',
                                        role: 'CEO & Estrategista',
                                        company: 'Expansão de Suplementos',
                                        videoId: '1K4mt7vXUixgIl4iWPpELkQf65luThiKv',
                                        image: 'joao ferrai.png'
                                    },
                                    {
                                        id: 4,
                                        name: 'Adriana Auriemo',
                                        role: 'Franqueadora',
                                        company: 'Nutty Bavarian',
                                        videoId: '1XmOVBBCADaln-Xrok18xYcSDegA5QSeg',
                                        image: 'adriana .png'
                                    },
                                    {
                                        id: 5,
                                        name: 'Leandro Otávio',
                                        role: 'Founder',
                                        company: 'D\'avila Finance',
                                        videoId: '13RlGI5ejkXUb6W7VmicjueK2MjvZxM5P',
                                        image: 'leandro.png'
                                    }
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

                                        {/* Cinematic Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700"></div>

                                        {/* Content */}
                                        <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                            <div className="mb-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                                <div className="w-12 h-12 rounded-full bg-accent-gold flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform duration-500">
                                                    <span className="material-symbols-outlined text-black font-black text-xl">play_arrow</span>
                                                </div>

                                                <h4 className="text-white font-black text-xl uppercase tracking-tighter leading-none mb-2">
                                                    {item.name}
                                                </h4>
                                                <div className="flex flex-col gap-0.5">
                                                    <p className="text-accent-gold text-[10px] font-black uppercase tracking-[0.2em]">
                                                        {item.role}
                                                    </p>
                                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.1em]">
                                                        {item.company}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Action Text */}
                                            <div className="overflow-hidden">
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/0 group-hover:text-white/50 transition-all duration-700 translate-y-full group-hover:translate-y-0">
                                                    Assistir Depoimento
                                                </p>
                                            </div>
                                        </div>

                                        {/* HUD Corner Detail */}
                                        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/10 group-hover:border-accent-gold/40 transition-colors duration-700"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Final :: Contact Form */}
                    <section className="pb-20 sm:pb-32 md:pb-48 px-3 sm:px-6 md:px-12" id="contato">
                        <div className="max-w-[1700px] mx-auto relative overflow-hidden bg-[#050505] p-5 sm:p-10 md:p-16 lg:p-24 xl:p-32 rounded-2xl sm:rounded-[2rem]">
                            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                            <div className="relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-32 items-start">
                                <div>
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[0.9] tracking-tighter mb-6 uppercase">
                                        FALE COM O <br /> <span className="text-accent-gold italic">ESPECIALISTA.</span>
                                    </h2>
                                    <p className="text-sm md:text-base text-white/50 max-w-md font-medium mb-12 leading-relaxed">
                                        Se você acredita que eu posso ajudar com a minha experiência, vai ser um prazer caminhar ao seu lado e ajudar a construir o próximo capítulo da história da sua marca.
                                    </p>
                                    <div className="flex flex-col gap-6">
                                        <a href="mailto:contato@marinhoponci.com" className="flex items-center gap-4 group w-fit">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-accent-gold to-[#a47e4b] flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                                <span className="material-symbols-outlined text-white text-lg">mail</span>
                                            </div>
                                            <span className="text-sm font-medium text-white/70 group-hover:text-accent-gold transition-colors">contato@marinhoponci.com</span>
                                        </a>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-b from-accent-gold to-[#a47e4b] flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                                                <span className="material-symbols-outlined text-white text-lg">public</span>
                                            </div>
                                            <span className="text-sm font-medium text-white/70">Portugal | Espanha | Brasil | Estados Unidos | Áustria</span>
                                        </div>
                                    </div>
                                </div>
                                <form className="space-y-5">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <input type="text" placeholder="NOME COMPLETO" className="bg-zinc-900/60 border border-white/10 rounded-md px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white focus:outline-none focus:border-accent-gold/50 transition-all w-full placeholder:text-white/30" />
                                        <input type="email" placeholder="EMAIL" className="bg-zinc-900/60 border border-white/10 rounded-md px-5 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white focus:outline-none focus:border-accent-gold/50 transition-all w-full placeholder:text-white/30" />
                                    </div>
                                    <textarea placeholder="como posso te ajudar?" rows={5} className="bg-zinc-900/60 border border-white/10 rounded-md px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all w-full resize-none placeholder:text-white/30"></textarea>
                                    <button className="w-full py-5 bg-transparent border-2 border-accent-gold text-accent-gold text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent-gold hover:text-black transition-all duration-500 rounded-md">
                                        Enviar Mensagem
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer :: Quotes + Dark Glass Card */}
            <footer className="bg-black text-white py-24">
                <div className="max-w-[1700px] mx-auto px-6 md:px-12">
                    {/* Logo */}
                    <div className="mb-16">
                        <img src="/marinho final.png" alt="Marinho Ponci Logo" className="h-16 w-auto object-contain" />
                    </div>

                    {/* Main Footer Grid: Quotes Left + Nav Card Right */}
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Rotating Quotes Section */}
                        <div className="space-y-12">
                            <div className="animate-fade-loop">
                                <blockquote className="text-2xl md:text-3xl lg:text-4xl font-black text-accent-gold italic leading-tight uppercase tracking-tight mb-4">
                                    "Sonhar grande e sonhar pequeno dá o mesmo trabalho."
                                </blockquote>
                                <cite className="text-sm font-black text-white/60 uppercase tracking-widest not-italic">
                                    Jorge Paulo Lemann - economista
                                </cite>
                            </div>
                            <div className="pt-8 border-t border-white/5">
                                <blockquote className="text-xl md:text-2xl lg:text-3xl font-black text-accent-gold italic leading-tight uppercase tracking-tight mb-4">
                                    "O único lugar onde sucesso vem antes do trabalho é no dicionário."
                                </blockquote>
                                <cite className="text-sm font-black text-white/60 uppercase tracking-widest not-italic">
                                    Albert Einstein
                                </cite>
                            </div>
                        </div>

                        {/* Dark Glass Navigation Card */}
                        <div className="bg-zinc-900/80 border border-white/5 rounded-lg p-8 md:p-12 backdrop-blur-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                                {/* Navegação */}
                                <div>
                                    <h5 className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px] mb-6">Navegação</h5>
                                    <div className="flex flex-col gap-3">
                                        {['Sobre', 'Ecossistema', 'Franchise-se', 'Internacionalize-se'].map((item) => (
                                            <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all">
                                                {item}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                {/* Legal */}
                                <div>
                                    <h5 className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px] mb-6">Legal</h5>
                                    <div className="flex flex-col gap-3">
                                        {['Privacidade', 'Termos', 'Compliance'].map((item) => (
                                            <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all">
                                                {item}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                                {/* Redes Sociais */}
                                <div>
                                    <h5 className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px] mb-6">Redes Sociais</h5>
                                    <div className="flex flex-wrap gap-3">
                                        <a href="https://www.instagram.com/marinhoponci/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60 group">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                        </a>
                                        <a href="https://www.facebook.com/marinho.ponci/?locale=pt_PT" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60 group">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                        </a>
                                        <a href="https://www.youtube.com/channel/UCGNCj2ncXuC_-Iz0znRbyPA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60 group">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                        </a>
                                        <a href="https://open.spotify.com/user/12159463678?si=7db287e2ae3d4f12" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60 group">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                                        </a>
                                        <a href="https://www.linkedin.com/in/marinhoponci/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/60 group">
                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between gap-6">
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">
                            © 2026 MARINHO PONCI. ALL RIGHTS RESERVED. BORN FOR GLOBAL.
                        </p>
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">
                            DEVELOPED BY AG SOLUTIONS
                        </p>
                    </div>
                </div>
            </footer>

            <ManifestoModal
                isOpen={isManifestoOpen}
                onClose={() => setIsManifestoOpen(false)}
            />

            <VideoModal
                isOpen={isVideoModalOpen}
                videoId={selectedVideoId}
                onClose={() => setIsVideoModalOpen(false)}
            />
        </div>
    );
}
