import { useState, useRef } from 'react';

export default function HeroBillboard() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        setMousePos({ x, y });
    };

    return (
        <section
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            className="relative w-full min-h-screen overflow-hidden bg-black"
        >
            {/* ═══════════════════════════════════════════════════════
                DESKTOP LAYOUT (sm+) — Side-by-side parallax, unchanged
            ═══════════════════════════════════════════════════════ */}

            {/* Background Image — DESKTOP ONLY */}
            <div className="absolute inset-0 hidden sm:flex justify-end overflow-hidden">
                <div
                    className="relative w-full lg:w-3/4 h-full transition-transform duration-700 ease-out"
                    style={{
                        transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -10}px)`
                    }}
                >
                    <img
                        src="/banner final 02.png"
                        alt="Marinho Ponci"
                        className="w-full h-full object-cover object-[center_20%] lg:object-right scale-110"
                    />
                </div>
            </div>

            {/* Gradient Overlays — DESKTOP ONLY */}
            <div className="absolute inset-0 z-[2] pointer-events-none hidden sm:block">
                <div className="absolute inset-y-0 left-0 w-1/2 lg:w-[40%] bg-gradient-to-r from-black via-black to-transparent"></div>
                <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/20 to-transparent"></div>
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black to-transparent opacity-30"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>
            </div>

            {/* Desktop Content (sm+) — Left side, left-aligned */}
            <div className="relative z-20 w-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-24 h-screen hidden sm:flex flex-col justify-center pt-24 pb-20 lg:pt-40 lg:pb-32">
                <div
                    className="max-w-4xl animate-reveal-skew"
                    style={{
                        transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 4}px)`
                    }}
                >
                    <h1 className="text-3xl md:text-5xl lg:text-[4rem] font-black text-white leading-[0.95] tracking-tighter uppercase mb-8 cinematic-text-shadow">
                        TÁ PENSANDO EM <br />
                        <span className="flex flex-wrap gap-x-4">
                            ENTRAR PARA O
                            <span className="text-accent-gold italic drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">MUNDO</span>
                        </span>
                        <span className="text-accent-gold italic drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">DAS FRANQUIAS?</span>
                    </h1>

                    <p className="text-sm md:text-base text-white/40 max-w-lg font-medium leading-relaxed mb-10 tracking-tight">
                        sem rodeios vou te contar o que vi dar certo e o que vi dar errado em décadas acompanhando franqueadores e franqueados
                    </p>

                    <div className="flex flex-row items-center gap-12">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-accent-gold/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <img
                                src="/LOGO FUNDO ESCURO.png"
                                alt="Franchise-se Logo"
                                className="h-16 md:h-20 w-auto object-contain relative z-10 brightness-[1.1] drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]"
                            />
                        </div>

                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => document.getElementById('franchise')?.scrollIntoView({ behavior: 'smooth' })}
                                className="group flex items-center gap-4 text-white transition-all duration-500"
                            >
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent-gold group-hover:bg-accent-gold/10 transition-all duration-500 relative">
                                    <div className="absolute inset-0 rounded-full border border-accent-gold opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                                    <span className="material-symbols-outlined font-black text-xl group-hover:scale-110 transition-transform text-accent-gold">play_arrow</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-accent-gold transition-colors">Iniciar</span>
                                    <span className="text-xs font-black uppercase tracking-widest group-hover:text-white">Conhecer E-book</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                MOBILE LAYOUT (<sm) — Stacked: Banner on top, text centered below
            ═══════════════════════════════════════════════════════ */}

            <div className="flex flex-col sm:hidden min-h-screen">
                {/* Photo Block — Banner displayed clearly */}
                <div className="relative w-full h-[50vh] flex-shrink-0 overflow-hidden">
                    <img
                        src="/banner final 02.png"
                        alt="Marinho Ponci"
                        className="w-full h-full object-cover object-[60%_25%] scale-105"
                    />
                    {/* Bottom fade to black */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                    {/* Side fades */}
                    <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/30 to-transparent"></div>
                    <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/30 to-transparent"></div>
                    {/* Top fade for header */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent"></div>

                    {/* Franchise-se logo centered over the bottom of the photo */}
                    <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center">
                        <img
                            src="/LOGO FUNDO ESCURO.png"
                            alt="Franchise-se Logo"
                            className="h-10 w-auto object-contain brightness-[1.1] drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                        />
                    </div>
                </div>

                {/* Text Block — Centered, no overlap */}
                <div className="relative z-20 flex-1 flex flex-col justify-center items-center text-center px-6 pb-12 -mt-8">
                    <h1 className="text-[1.6rem] font-black text-white leading-[0.95] tracking-tighter uppercase mb-4 cinematic-text-shadow">
                        TÁ PENSANDO EM <br />
                        ENTRAR PARA O <br />
                        <span className="text-accent-gold italic drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">MUNDO</span> <br />
                        <span className="text-accent-gold italic drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">DAS FRANQUIAS?</span>
                    </h1>

                    <p className="text-[13px] text-white/40 font-medium leading-relaxed mb-8 tracking-tight max-w-xs">
                        sem rodeios vou te contar o que vi dar certo e o que vi dar errado em décadas acompanhando franqueadores e franqueados
                    </p>

                    {/* CTA — Centered play button */}
                    <button
                        onClick={() => document.getElementById('franchise')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group flex items-center justify-center gap-4 text-white transition-all duration-500 mb-5"
                    >
                        <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent-gold group-hover:bg-accent-gold/10 transition-all duration-500 relative">
                            <div className="absolute inset-0 rounded-full border border-accent-gold opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
                            <span className="material-symbols-outlined font-black text-xl group-hover:scale-110 transition-transform text-accent-gold">play_arrow</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Iniciar</span>
                            <span className="text-xs font-black uppercase tracking-widest">Conhecer E-book</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Unified HUD Branding — DESKTOP ONLY */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-20 hidden sm:flex flex-col items-center gap-2 opacity-20 pointer-events-none select-none">
                <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
                <div className="text-[8px] font-black uppercase tracking-[0.8em]">Role para Explorar</div>
            </div>

            {/* Side Branding HUD — DESKTOP ONLY */}
            <div className="absolute right-8 md:right-12 bottom-12 z-20 hidden sm:flex flex-col items-end gap-1 text-[8px] font-black uppercase tracking-[0.5em] text-white/10 select-none">
                <span>Marinho Ponci</span>
                <span>Production 2026</span>
            </div>
        </section>
    );
}
