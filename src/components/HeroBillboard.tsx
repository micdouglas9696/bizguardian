import { useState, useRef } from 'react';
import FranchiseQuizModal from './FranchiseQuizModal';

export default function HeroBillboard() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToForm = () => {
        document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
    };

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
            id="herobillboard"
        >
            {/* ═══ DESKTOP LAYOUT (sm+) ═══ */}

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

            {/* Desktop Content (sm+) */}
            <div className="relative z-20 w-full max-w-[1700px] mx-auto px-6 md:px-12 lg:px-24 h-screen hidden sm:flex flex-col justify-center pt-24 pb-20 lg:pt-32 lg:pb-24">
                <div
                    className="max-w-xl xl:max-w-2xl animate-reveal-skew"
                    style={{
                        transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 4}px)`
                    }}
                >
                    {/* Headline — large bold italic uppercase like reference */}
                    <h1 className="font-black text-white leading-[1.0] tracking-tighter uppercase italic mb-10 cinematic-text-shadow max-w-[95vw] lg:max-w-none text-[clamp(1.5rem,3.5vw,3.5rem)] xl:text-[clamp(2rem,4vw,4.5rem)]">
                        Franquia pode ser o <span className="text-accent-gold">melhor</span> ou o <span className="text-accent-gold">pior</span> negócio da sua vida!
                    </h1>

                    {/* Subtitle — aligned with button */}
                    <p className="text-base md:text-lg text-white/50 font-medium leading-relaxed mb-8 max-w-md">
                        Depende se você tem{' '}
                        <strong className="text-white">perfil, objetivo e preparo.</strong>{' '}
                        Eu te ajudo a descobrir isso antes de assinar qualquer coisa.
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={() => setIsQuizOpen(true)}
                        className="group relative px-10 md:px-14 py-5 md:py-6 bg-accent-gold text-black text-sm md:text-base font-black uppercase tracking-[0.2em] hover:bg-white transition-all duration-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <span className="relative">Fazer o diagnóstico gratuito</span>
                    </button>
                </div>
            </div>

            {/* ═══ MOBILE LAYOUT (<sm) ═══ */}
            <div className="flex flex-col sm:hidden min-h-screen">
                {/* Photo Block */}
                <div className="relative w-full h-[50vh] flex-shrink-0 overflow-hidden">
                    <img
                        src="/banner final 02.png"
                        alt="Marinho Ponci"
                        className="w-full h-full object-cover object-[60%_25%] scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                    <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/30 to-transparent"></div>
                    <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black/30 to-transparent"></div>
                    <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent"></div>
                </div>

                {/* Text Block */}
                <div className="relative z-20 flex-1 flex flex-col justify-center items-center text-center px-6 pb-12 -mt-8">
                    <h1 className="font-black text-white leading-[1.1] tracking-tight italic mb-5 text-[clamp(1.25rem,5vw,1.6rem)]">
                        Franquia pode ser o <span className="text-accent-gold">melhor</span> ou o <span className="text-accent-gold">pior</span> negócio da sua vida!
                    </h1>

                    <p className="text-[14px] text-white/60 font-medium leading-relaxed mb-8 tracking-tight max-w-xs italic">
                        Depende se você tem{' '}
                        <strong className="text-white not-italic">perfil, objetivo e preparo.</strong>{' '}
                        Eu te ajudo a descobrir isso antes de assinar qualquer coisa.
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={() => setIsQuizOpen(true)}
                        className="group relative w-full max-w-xs px-8 py-5 bg-accent-gold text-black text-sm font-black uppercase tracking-[0.15em] hover:bg-white transition-all duration-500 shadow-[0_0_30px_rgba(234,179,8,0.3)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <span className="relative">Fazer o diagnóstico gratuito</span>
                    </button>
                </div>
            </div>

            {/* Aesthetic Details — DESKTOP ONLY */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-20 hidden sm:flex flex-col items-center gap-2 opacity-20 pointer-events-none select-none">
                <div className="w-px h-12 bg-gradient-to-b from-white to-transparent"></div>
                <div className="text-[8px] font-black uppercase tracking-[0.8em]">Role para Explorar</div>
            </div>

            <div className="absolute right-8 md:right-12 bottom-12 z-20 hidden sm:flex flex-col items-end gap-1 text-[8px] font-black uppercase tracking-[0.5em] text-white/10 select-none">
                <span>Marinho Ponci</span>
                <span>Production 2026</span>
            </div>

            <FranchiseQuizModal
                isOpen={isQuizOpen}
                onClose={() => setIsQuizOpen(false)}
                onGoToForm={() => {
                    setIsQuizOpen(false);
                    setTimeout(scrollToForm, 300);
                }}
            />
        </section>
    );
}
