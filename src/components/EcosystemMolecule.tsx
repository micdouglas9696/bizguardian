import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

interface Node {
    id: number;
    icon: string;
    label: string;
    angle: number;
    distance: number;
    highlight?: boolean;
    description: string;
}

const NODES: Node[] = [
    { id: 1, icon: 'public', label: 'Internacionalização', angle: 0, distance: 300, highlight: true, description: 'Passo a passo para preparar e fazer o processo de internacionalização de sua marca.' },
    { id: 2, icon: 'school', label: 'Franchise-se', angle: 32.7, distance: 280, description: 'Expo sobre o que é o mundo do franchising para que você avalie se ele é ou não para você.' },
    { id: 3, icon: 'record_voice_over', label: 'Palestras', angle: 65.4, distance: 310, description: 'Palestra de Marinho Pond.' },
    { id: 4, icon: 'psychology', label: 'Mentoria', angle: 98.1, distance: 270, highlight: true, description: 'Mentoria estratégica diretamente com Marinho Pond.' },
    { id: 5, icon: 'gavel', label: 'Conselheiro', angle: 130.8, distance: 320, description: 'Participação em Conselhos Consultivos empresariais.' },
    { id: 6, icon: 'trending_up', label: 'Expansão', angle: 163.5, distance: 290, description: 'Seu negócio está performando e pretende aumentar sua rede, nós preparamos sua equipe de expansão.' },
    { id: 7, icon: 'location_on', label: 'Real State', angle: 196.2, distance: 310, description: 'Você precisa de locais com qualidade para operação das suas unidades, nós encontramos para você.' },
    { id: 8, icon: 'groups', label: 'Eventos', angle: 228.9, distance: 270, highlight: true, description: 'Trazemos comitivas de executivos para conhecer outros mercados.' },
    { id: 9, icon: 'mic', label: 'Podcast', angle: 261.6, distance: 300, description: 'Bate papo com convidados, histórias inspiradoras no segmento do franchising e negócios.' },
    { id: 10, icon: 'handshake', label: 'Representação', angle: 294.3, distance: 320, description: 'Representamos sua marca no mercado internacional.' },
    { id: 11, icon: 'receipt_long', label: 'Licenciamentos', angle: 327, distance: 280, description: 'Licenciamos seus produtos para o mercado internacional.' },
];

export default function EcosystemMolecule() {
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    const [selectedNode, setSelectedNode] = useState<number | null>(null);
    const requestRef = useRef<number | undefined>(undefined);
    const currentPos = useRef({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) / (rect.width / 2);
        const dy = (e.clientY - centerY) / (rect.height / 2);

        // Smoothly interpolate towards target
        const update = () => {
            currentPos.current.x += (dx * 15 - currentPos.current.x) * 0.1;
            currentPos.current.y += (dy * 15 - currentPos.current.y) * 0.1;
            setMouseOffset({ x: currentPos.current.x, y: currentPos.current.y });
            requestRef.current = requestAnimationFrame(update);
        };

        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(update);
    };

    useEffect(() => {
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <>
            {/* Desktop Cinematic Molecule */}
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                    if (requestRef.current) cancelAnimationFrame(requestRef.current);
                    const reset = () => {
                        currentPos.current.x *= 0.9;
                        currentPos.current.y *= 0.9;
                        setMouseOffset({ x: currentPos.current.x, y: currentPos.current.y });
                        if (Math.abs(currentPos.current.x) > 0.1) {
                            requestRef.current = requestAnimationFrame(reset);
                        }
                    };
                    requestRef.current = requestAnimationFrame(reset);
                }}
                className="hidden lg:flex relative w-full h-full items-center justify-center pointer-events-auto"
                style={{ perspective: '1200px' }}
            >
                {/* Background Orbits */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                    <div className="w-[300px] h-[300px] border border-white/5 rounded-full animate-orbit-slow"></div>
                    <div className="w-[500px] h-[500px] border border-white/5 rounded-full animate-orbit-reverse opacity-50"></div>
                    <div className="w-[700px] h-[700px] border border-white/5 rounded-full animate-orbit-slow opacity-30"></div>
                </div>

                {/* Central Hub */}
                <div
                    className="relative z-10 transition-transform duration-150 ease-out will-change-gpu"
                    style={{
                        transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 50px) rotateX(${mouseOffset.y * -0.5}deg) rotateY(${mouseOffset.x * 0.5}deg)`
                    }}
                >
                    <Link to="/dashboard" className="group relative block">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-b from-accent-gold to-[#a47e4b] rounded-full shadow-hud flex flex-col items-center justify-center relative z-10 border border-white/20">
                            <span className="material-symbols-outlined text-4xl md:text-5xl text-white mb-1 group-hover:rotate-180 transition-transform duration-700 ease-in-out">hub</span>
                            <div className="absolute inset-0 rounded-full animate-pulse-glow bg-accent-gold/20"></div>
                        </div>
                    </Link>
                </div>

                {/* Satellite Nodes */}
                {NODES.map((node) => {
                    const rad = (node.angle * Math.PI) / 180;
                    const x = Math.cos(rad) * node.distance;
                    const y = Math.sin(rad) * node.distance;

                    return (
                        <div
                            key={node.id}
                            className="absolute will-change-gpu transition-all duration-300 ease-out z-20 group"
                            style={{
                                transform: `translate3d(${x + mouseOffset.x * 0.5}px, ${y + mouseOffset.y * 0.5}px, 0) scale(${selectedNode === node.id ? 1.2 : 1})`
                            }}
                            onMouseEnter={() => setSelectedNode(node.id)}
                            onMouseLeave={() => setSelectedNode(null)}
                        >
                            {/* Connecting Line with Pulsing Data */}
                            <div
                                className="absolute top-1/2 left-1/2 w-px bg-gradient-to-t from-accent-gold/40 to-transparent pointer-events-none"
                                style={{
                                    height: `${node.distance}px`,
                                    transformOrigin: 'top center',
                                    transform: `rotate(${node.angle + 90}deg) translateY(-100%)`,
                                    opacity: 0.2
                                }}
                            >
                                <div className="w-[3px] h-8 bg-accent-gold shadow-glow-gold animate-scanner-hud absolute top-0 left-[-1px]"></div>
                            </div>

                            <div className="flex flex-col items-center gap-3 relative">
                                <div className="relative">
                                    {/* Gold Circular Orb - Premium Ball Effect */}
                                    <div className={`
                                        relative flex items-center justify-center rounded-full transition-all duration-500 transform-style-3d group-hover:scale-110 cursor-pointer
                                        ${node.highlight || selectedNode === node.id
                                            ? 'w-20 h-20 bg-gradient-to-b from-accent-gold to-[#a47e4b] shadow-[0_0_30px_rgba(234,179,8,0.4)] border-2 border-accent-gold/50'
                                            : 'w-16 h-16 bg-gradient-to-b from-accent-gold to-[#a47e4b] shadow-[0_0_20px_rgba(234,179,8,0.25)] border border-accent-gold/30 group-hover:w-20 group-hover:h-20 group-hover:shadow-[0_0_30px_rgba(234,179,8,0.4)]'
                                        }
                                        ${selectedNode === node.id ? 'ring-4 ring-accent-gold/30 ring-offset-4 ring-offset-black' : ''}
                                    `}>
                                        {/* Inner Icon - White for Contrast */}
                                        <span className={`material-symbols-outlined transition-all duration-300 font-bold ${node.highlight || selectedNode === node.id ? 'text-3xl text-white drop-shadow-lg' : 'text-2xl text-white/90 group-hover:text-3xl group-hover:text-white'}`}>
                                            {node.icon}
                                        </span>
                                        {/* Shine Effect */}
                                        <div className="absolute top-1 left-2 w-3 h-3 bg-white/40 rounded-full blur-sm"></div>
                                    </div>
                                    {/* Label */}
                                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] mt-4 block transition-all duration-300 text-center whitespace-nowrap ${selectedNode === node.id ? 'text-accent-gold opacity-100' : 'text-white/30 group-hover:text-accent-gold group-hover:opacity-100'}`}>
                                        {node.label}
                                    </span>
                                </div>

                                {/* Floating Description :: Increased Hotzone for hover persistence */}
                                {selectedNode === node.id && (
                                    <div className="absolute top-full mt-2 w-80 p-8 pt-10 bg-[#0a0a0a]/95 border border-accent-gold/30 rounded-2xl shadow-2xl backdrop-blur-xl z-50 animate-reveal-skew pointer-events-auto">
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0a0a0a] border-t border-l border-accent-gold/30 rotate-45"></div>
                                        <h4 className="text-accent-gold font-black uppercase tracking-widest text-xs mb-4">{node.label}</h4>
                                        <p className="text-white/60 text-[11px] leading-relaxed mb-6 font-medium">
                                            {node.description}
                                        </p>
                                        <a
                                            href={node.label === 'Internacionalização' ? '/internationalization' : node.label === 'Franchise-se' ? '#franchise' : '#contato'}
                                            onClick={(e) => {
                                                if (node.label === 'Franchise-se') {
                                                    e.preventDefault();
                                                    document.getElementById('franchise')?.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }}
                                            className="inline-block w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] text-center rounded hover:bg-accent-gold hover:text-white transition-all shadow-glow-primary"
                                        >
                                            Saiba Mais
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile/Tablet Card Grid Layout */}
            <div className="lg:hidden w-full space-y-4 px-2 overflow-y-auto max-h-[700px] py-8 custom-scrollbar">
                {NODES.map((node) => (
                    <div
                        key={node.id}
                        className={`p-6 rounded-2xl border transition-all duration-300 ${node.highlight
                            ? 'bg-accent-gold/5 border-accent-gold/30 shadow-glow-primary'
                            : 'bg-white/5 border-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {/* Gold Circular Orb for Mobile */}
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${node.highlight ? 'bg-gradient-to-b from-accent-gold to-[#a47e4b] border-accent-gold/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-gradient-to-b from-accent-gold to-[#a47e4b] border-accent-gold/30'}`}>
                                <span className="material-symbols-outlined text-xl text-white font-bold">
                                    {node.icon}
                                </span>
                            </div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest leading-none">{node.label}</h4>
                        </div>
                        <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-relaxed mb-6">
                            {node.description}
                        </p>
                        <a
                            href={node.label === 'Internacionalização' ? '/internationalization' : node.label === 'Franchise-se' ? '#franchise' : '#contato'}
                            className="inline-block px-8 py-3 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded hover:bg-white hover:text-black transition-all"
                        >
                            Explorar Unidade
                        </a>
                    </div>
                ))}
            </div>
        </>
    );
}
