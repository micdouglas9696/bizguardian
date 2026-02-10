import { useEffect, useState, useRef, type ReactNode } from 'react';

interface ManifestoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

function RevealSection({ children, className = "", delay = 0 }: RevealProps) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersecting(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-1000 ease-out transform ${isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                } ${className}`}
        >
            {children}
        </div>
    );
}

export default function ManifestoModal({ isOpen, onClose }: ManifestoModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsVisible(true), 50);
            document.body.style.overflow = 'hidden';
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 scale-105'}`}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={onClose}></div>

            {/* Scrollable Content Container */}
            <div className="relative flex-1 overflow-y-auto overflow-x-hidden pt-32 pb-48 px-6 md:px-12 lg:px-24 scroll-smooth">
                <div className="max-w-[1200px] mx-auto relative">

                    {/* Close Action */}
                    <button
                        onClick={onClose}
                        className={`fixed top-8 right-8 md:top-12 md:right-12 z-[110] flex items-center gap-4 group transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-accent-gold transition-colors hidden sm:block">Fechar Manifesto</span>
                        <div className="w-12 h-12 border border-white/20 flex items-center justify-center group-hover:border-accent-gold transition-colors bg-black/50 backdrop-blur-md">
                            <span className="material-symbols-outlined text-white text-lg group-hover:text-accent-gold">close</span>
                        </div>
                    </button>

                    {/* Manifesto Header */}
                    <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <span className="inline-block py-2 px-6 border border-accent-gold/40 text-accent-gold text-[10px] font-black tracking-[0.5em] uppercase mb-12">
                            The Reality Check
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-16 uppercase italic">
                            Manifesto <br /> <span className="text-accent-gold">Marinho Ponci.</span>
                        </h1>
                        <p className="text-2xl md:text-3xl font-serif italic text-white/60 mb-24 max-w-3xl leading-snug">
                            "Vamos ver se o seu sonho aguenta a realidade"
                        </p>
                    </div>

                    {/* Manifesto Body Blocks - Scroll Triggered */}
                    <div className="space-y-48">

                        {/* Block 1 */}
                        <RevealSection className="max-w-4xl">
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-10 border-l-4 border-accent-gold pl-8">
                                Eu não vendo sonho. Eu te conto a verdade.
                            </h2>
                            <div className="text-lg md:text-2xl text-white/40 font-medium leading-relaxed space-y-8">
                                <p>Passei 38 anos nos bastidores das empresas especialmente no mundo do franchising onde as decisões reais são tomadas, longe dos palcos, longe dos slides bonitos, longe das promessas vazias.</p>
                                <div className="grid sm:grid-cols-2 gap-8 text-white/60">
                                    <p className="border-t border-white/5 pt-4 italic">"Vi gente certa no projeto errado. Vi gente errada no projeto certo."</p>
                                    <p className="border-t border-white/5 pt-4 italic text-white/80">"Vi marcas quebrarem por falta de cultura — e por não se aculturarem quando mudaram de país."</p>
                                </div>
                                <p>Vi franqueados quebrarem por falta de preparo. Vi empresários perderem tudo por tomarem descisões intempestuosas e precipitadas.</p>
                            </div>
                        </RevealSection>

                        {/* Block 2 */}
                        <RevealSection className="max-w-4xl ml-auto">
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-10 border-r-4 border-accent-gold pr-8 text-right">
                                Não sou o guru de palco com fórmulas mágicas.
                            </h2>
                            <div className="text-lg md:text-2xl text-white/40 font-medium leading-relaxed space-y-8 text-right">
                                <p>EU NÃO SOU MAIS UM ESPECIALISTA. Não sou um influencer de lifestyle vendendo liberdade financeira. Não sou o cara do “acredite no seu sonho”.</p>
                                <p className="text-white text-3xl md:text-5xl font-black italic tracking-tighter leading-none">Eu sou aquele do “vamos ver se o seu sonho aguenta a realidade”.</p>
                                <p>Porque sonho sem preparo vira pesadelo. Porque expansão sem estratégia e consciência vira caos. Porque internacionalização sem aculturamento vira prejuízo.</p>
                            </div>
                        </RevealSection>

                        {/* Block 3 */}
                        <RevealSection className="max-w-4xl">
                            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-10 border-l-4 border-accent-gold pl-8">
                                Eu sou o cara que conecta.
                            </h2>
                            <div className="text-lg md:text-2xl text-white/40 font-medium leading-relaxed space-y-8">
                                <p>Não ensino franquia. Eu preparo gente pra errar menos em suas apostas. Não tenho curso. Eu conecto projeto bom com profissionais sérios que entregam o que prometem com excelência.</p>
                                <p className="bg-white/5 p-8 border border-white/10 text-white italic">
                                    "Não prometo resultado rápido. Eu trago clareza, contexto e conexão — pra tomada de decisão acertada, no momento certo, com as pessoas certas."
                                </p>
                                <p>Porque experiência não é só saber fazer. É saber escolher quem trazer pro jogo. MINHA HISTÓRIA É MEU LASTRO.</p>
                            </div>
                        </RevealSection>

                        {/* Timeline Fragment */}
                        <RevealSection className="grid md:grid-cols-3 gap-0">
                            <div className="border border-white/10 p-10 hover:bg-accent-gold transition-colors group">
                                <span className="text-accent-gold font-black text-4xl block mb-6 group-hover:text-black">1987</span>
                                <p className="text-sm font-black uppercase tracking-widest text-white/80 mb-4 group-hover:text-black">Mobitel / Portugal Telecom</p>
                                <p className="text-xs text-white/40 leading-relaxed uppercase group-hover:text-black/60">Saí 12 anos depois com a maior operação de pagers da América Latina.</p>
                            </div>
                            <div className="border border-white/10 p-10 hover:bg-accent-gold transition-colors group">
                                <span className="text-accent-gold font-black text-4xl block mb-6 group-hover:text-black">Era Chilli Beans</span>
                                <p className="text-sm font-black uppercase tracking-widest text-white/80 mb-4 group-hover:text-black">Start-up & Expansão</p>
                                <p className="text-xs text-white/40 leading-relaxed uppercase group-hover:text-black/60">De zero a 853 pontos globais. Escala sem padrão é uma bomba-relógio.</p>
                            </div>
                            <div className="border border-white/10 p-10 hover:bg-accent-gold transition-colors group">
                                <span className="text-accent-gold font-black text-4xl block mb-6 group-hover:text-black">Hoje</span>
                                <p className="text-sm font-black uppercase tracking-widest text-white/80 mb-4 group-hover:text-black">BizGuardian</p>
                                <p className="text-xs text-white/40 leading-relaxed uppercase group-hover:text-black/60">Mentor de CEOs. Playbook de internacionalização na pele. Brasil :: Europa.</p>
                            </div>
                        </RevealSection>

                        {/* Final Section */}
                        <RevealSection className="max-w-4xl mx-auto text-center">
                            <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-24 italic leading-tight">
                                Eu não convenço. <br /> <span className="text-accent-gold">Eu testo.</span>
                            </h2>

                            <div className="grid md:grid-cols-3 gap-12 text-left mb-32">
                                <div className="space-y-4">
                                    <p className="text-accent-gold text-[10px] font-black uppercase tracking-[0.3em]">Investimento</p>
                                    <p className="text-sm text-white/40 leading-relaxed">Entender se você tem perfil e se aguentará a rotina antes do contrato.</p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-accent-gold text-[10px] font-black uppercase tracking-[0.3em]">Expansão</p>
                                    <p className="text-sm text-white/40 leading-relaxed">Escala com qualidade, padrão e cultura. Sem colocar a marca em risco.</p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-accent-gold text-[10px] font-black uppercase tracking-[0.3em]">Ponte Global</p>
                                    <p className="text-sm text-white/40 leading-relaxed">Cultura local, leis, comportamento de consumo e o time certo.</p>
                                </div>
                            </div>

                            <div className="pt-24 border-t border-white/10 flex flex-col items-center">
                                <p className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-20 leading-tight">
                                    SE VOCÊ QUER BRINCAR, NÃO ME CHAMA.<br />
                                    <span className="text-accent-gold">SE QUER FAZER DIREITO, ESTOU AQUI.</span>
                                </p>

                                {/* Signature */}
                                <div className="relative group">
                                    <img src="/marinho-signature.png" alt="Assinatura Marinho Ponci" className="h-40 md:h-64 w-auto object-contain mb-12 filter brightness-100 transition-all duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-accent-gold/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
                                </div>

                                <p className="text-[12px] font-black uppercase tracking-[0.6em] text-white leading-none">Marinho Ponci Neto</p>
                                <div className="h-px w-24 bg-accent-gold my-6"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">38 anos conectando marcas, pessoas e mercados.</p>
                            </div>
                        </RevealSection>

                    </div>
                </div>
            </div>
        </div>
    );
}
