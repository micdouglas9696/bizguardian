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

            {/* Desktop Content (sm+) */}
            <div className="relative z-20 w-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-24 h-screen hidden sm:flex flex-col justify-center pt-20 md:pt-24 lg:pt-28">
                <div
                    className="max-w-3xl animate-reveal-skew"
                    style={{
                        transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 4}px)`
                    }}
                >
                    {/* Headline — Scaled down for 14" */}
                    <div className="relative mb-6 lg:mb-8">
                        <div className="absolute -inset-6 bg-accent-gold/5 blur-[60px] rounded-full pointer-events-none"></div>
                        <h1 className="relative font-black text-white leading-[0.92] tracking-tighter uppercase cinematic-text-shadow max-w-[90vw] lg:max-w-none text-[clamp(1.5rem,4vw,3.75rem)]">
                            <span className="block text-[clamp(2.5rem,5.5vw,4.5rem)] text-accent-gold italic drop-shadow-[0_0_30px_rgba(225,169,96,0.3)]" style={{ textShadow: '0 0 50px rgba(225,169,96,0.2), 0 4px 40px rgba(0,0,0,0.9)' }}>38 ANOS</span>
                            <span className="text-accent-gold italic drop-shadow-[0_0_20px_rgba(225,169,96,0.2)]">CONECTANDO</span> <br />
                            MARCAS, PESSOAS <br />
                            E MERCADOS.
                        </h1>
                    </div>

                    {/* Subtitle */}
                    <div className="relative pl-5 border-l-2 border-accent-gold/60 mb-8 lg:mb-10 max-w-lg">
                        <p className="text-sm md:text-base text-white/65 font-semibold leading-relaxed tracking-tight">
                            Construindo pontes entre visões empresariais e execuções globais com a maturidade de quem viveu a internacionalização nos últimos 38 anos.
                        </p>
                    </div>

                    {/* Two CTA Buttons — single-line text, bigger font */}
                    <div className="flex flex-row flex-wrap items-center gap-4 lg:gap-5">
                        <button
                            onClick={() => document.getElementById('herobillboard')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group relative px-8 md:px-10 py-4 md:py-5 bg-white text-black font-black uppercase hover:bg-accent-gold hover:text-white transition-all duration-500 shadow-glow-primary overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative block text-xs md:text-sm tracking-[0.15em] lg:tracking-[0.2em] whitespace-nowrap">SOU/QUERO SER UM FRANQUEADO</span>
                        </button>

                        <button
                            onClick={() => document.getElementById('internacionalize')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group relative px-8 md:px-10 py-4 md:py-5 bg-transparent border-2 border-accent-gold text-accent-gold font-black uppercase hover:bg-accent-gold hover:text-black transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-gold/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative block text-xs md:text-sm tracking-[0.15em] lg:tracking-[0.2em] whitespace-nowrap">TENHO/QUERO CRIAR UMA MARCA</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══ MOBILE LAYOUT (<sm) ═══ */}
            <div className="flex flex-col sm:hidden min-h-screen">
                <div className="relative w-full h-[50vh] flex-shrink-0 overflow-hidden">
                    <img
                        src="/marinho principal.webp"
                        srcSet="/marinho-principal-800.webp 800w, /marinho principal.webp 1200w"
                        sizes="100vw"
                        alt="Marinho Ponci"
                        loading="eager"
                        fetchPriority="high"
                        className="w-full h-full object-cover object-[65%_15%] scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                    <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/40 to-transparent"></div>
                    <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/40 to-transparent"></div>
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent"></div>
                </div>

                <div className="relative z-20 flex-1 flex flex-col justify-center items-center text-center px-6 pb-8 -mt-12">
                    <div className="relative mb-5">
                        <div className="absolute -inset-6 bg-accent-gold/5 blur-[50px] rounded-full pointer-events-none"></div>
                        <h1 className="relative text-[clamp(1.25rem,5vw,1.65rem)] font-black text-white leading-[0.92] tracking-tighter uppercase cinematic-text-shadow">
                            <span className="block text-[clamp(1.8rem,7vw,2.2rem)] text-accent-gold italic drop-shadow-[0_0_25px_rgba(225,169,96,0.25)]" style={{ textShadow: '0 0 30px rgba(225,169,96,0.15), 0 4px 30px rgba(0,0,0,0.9)' }}>38 ANOS</span>
                            <span className="text-accent-gold italic drop-shadow-[0_0_15px_rgba(225,169,96,0.2)]">CONECTANDO</span> <br />
                            MARCAS, PESSOAS <br />
                            E MERCADOS.
                        </h1>
                    </div>

                    <div className="relative pl-4 border-l-2 border-accent-gold/50 mb-7 text-left max-w-xs">
                        <p className="text-[13px] text-white/60 font-semibold leading-relaxed tracking-tight">
                            Construindo pontes entre visões empresariais e execuções globais com a maturidade de quem viveu a internacionalização nos últimos 38 anos.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => document.getElementById('herobillboard')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group relative w-full px-6 py-4 bg-white text-black font-black uppercase hover:bg-accent-gold hover:text-white transition-all duration-500 shadow-glow-primary overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative block text-[11px] tracking-[0.2em]">SOU/QUERO SER UM FRANQUEADO</span>
                        </button>

                        <button
                            onClick={() => document.getElementById('internacionalize')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group relative w-full px-6 py-4 bg-transparent border-2 border-accent-gold text-accent-gold font-black uppercase hover:bg-accent-gold hover:text-black transition-all duration-500 overflow-hidden text-center"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-gold/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                            <span className="relative block text-[11px] tracking-[0.2em]">TENHO/QUERO CRIAR UMA MARCA</span>
                        </button>
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
