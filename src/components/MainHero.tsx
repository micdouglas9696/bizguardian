import { useState, useRef } from 'react';

export default function MainHero() {
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

            {/* Background Image — DESKTOP ONLY (hidden on mobile) */}
            <div className="absolute inset-0 hidden sm:flex justify-end overflow-hidden pointer-events-none">
                <div
                    className="relative w-full lg:w-full h-full transition-transform duration-1000 ease-out"
                    style={{
                        transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -10}px)`
                    }}
                >
                    <img
                        src="/marinho prinicipal.png"
                        alt="Marinho Ponci"
                        className="w-full h-full object-contain object-right lg:object-[80%_center] scale-[1.4] opacity-90 transition-opacity duration-700 hover:opacity-100"
                    />
                </div>
            </div>

            {/* Gradient Overlays — DESKTOP ONLY */}
            <div className="absolute inset-0 z-[2] pointer-events-none hidden sm:block">
                <div className="absolute inset-y-0 left-0 w-1/2 lg:w-[35%] bg-gradient-to-r from-black to-transparent z-10"></div>
                <div className="absolute inset-y-0 left-0 w-full lg:w-[65%] bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[5]"></div>
                <div className="absolute inset-y-0 right-0 w-full lg:w-[70%] bg-gradient-to-l from-transparent via-black/20 to-black z-[4] pointer-events-none"></div>
                <div className="absolute inset-y-0 left-1/4 w-full lg:w-1/2 bg-gradient-to-r from-black/40 to-transparent pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black to-transparent opacity-20"></div>
            </div>

            {/* Desktop Content (sm+) — Left side, left-aligned */}
            <div className="relative z-20 w-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-24 h-screen hidden sm:flex flex-col justify-center pt-24 md:pt-32 lg:pt-40">
                <div
                    className="max-w-4xl animate-reveal-skew"
                    style={{
                        transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 4}px)`
                    }}
                >
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tighter uppercase mb-10 cinematic-text-shadow">
                        38 ANOS <br />
                        <span className="text-accent-gold italic drop-shadow-[0_0_20px_rgba(234,179,8,0.2)]">CONECTANDO</span> <br />
                        MARCAS, PESSOAS <br />
                        E MERCADOS.
                    </h1>
                    <p className="text-sm md:text-base text-white/50 max-w-lg font-medium leading-relaxed mb-12 tracking-tight">
                        Construindo pontes entre visões empresariais e execuções globais com a maturidade de quem viveu a internacionalização nos últimos 38 anos.
                    </p>
                    <div className="flex flex-row flex-wrap items-center gap-10">
                        <button
                            onClick={() => document.getElementById('ecossistema')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-10 md:px-12 py-5 md:py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent-gold hover:text-white transition-all duration-500 shadow-glow-primary group text-center"
                        >
                            Explorar Conexões
                        </button>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Protocolo Global</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-accent-gold">Season 2026</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                MOBILE LAYOUT (<sm) — Stacked: Photo on top, text centered below
            ═══════════════════════════════════════════════════════ */}

            <div className="flex flex-col sm:hidden min-h-screen">
                {/* Photo Block — Contained, clear face visibility */}
                <div className="relative w-full h-[55vh] flex-shrink-0 overflow-hidden">
                    <img
                        src="/marinho prinicipal.png"
                        alt="Marinho Ponci"
                        className="w-full h-full object-cover object-[65%_15%] scale-110"
                    />
                    {/* Bottom fade to black — seamless blend into text area */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                    {/* Subtle side fades */}
                    <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/40 to-transparent"></div>
                    <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/40 to-transparent"></div>
                    {/* Top fade for header blend */}
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent"></div>
                </div>

                {/* Text Block — Centered, no overlap with photo */}
                <div className="relative z-20 flex-1 flex flex-col justify-center items-center text-center px-6 pb-12 -mt-16">
                    <h1 className="text-[1.75rem] font-black text-white leading-[0.95] tracking-tighter uppercase mb-5 cinematic-text-shadow">
                        38 ANOS <br />
                        <span className="text-accent-gold italic drop-shadow-[0_0_20px_rgba(234,179,8,0.2)]">CONECTANDO</span> <br />
                        MARCAS, PESSOAS <br />
                        E MERCADOS.
                    </h1>

                    <p className="text-[13px] text-white/45 font-medium leading-relaxed mb-8 tracking-tight max-w-xs">
                        Construindo pontes entre visões empresariais e execuções globais com a maturidade de quem viveu a internacionalização nos últimos 38 anos.
                    </p>

                    <button
                        onClick={() => document.getElementById('ecossistema')?.scrollIntoView({ behavior: 'smooth' })}
                        className="w-full px-8 py-4 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] hover:bg-accent-gold hover:text-white transition-all duration-500 shadow-glow-primary mb-5"
                    >
                        Explorar Conexões
                    </button>

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Protocolo Global</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent-gold">Season 2026</span>
                    </div>
                </div>
            </div>

            {/* Aesthetic Detail :: Alignment Marks — DESKTOP ONLY */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-20 hidden md:flex flex-col items-center gap-3 opacity-20 pointer-events-none">
                <div className="w-px h-16 bg-gradient-to-b from-white to-transparent"></div>
                <div className="text-[8px] font-black uppercase tracking-[0.8em]">Scroll</div>
            </div>

            {/* Side Branding HUD — DESKTOP ONLY */}
            <div className="absolute right-8 md:right-12 bottom-12 z-20 hidden sm:flex flex-col items-end gap-1 text-[8px] font-black uppercase tracking-[0.5em] text-white/10 select-none">
                <span>Marinho Ponci</span>
                <span>Production 2026</span>
            </div>
        </section>
    );
}
