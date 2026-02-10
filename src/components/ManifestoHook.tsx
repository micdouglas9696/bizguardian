import { useState, useEffect } from 'react';

const phrases = [
    "EU NÃO VENDO SONHO.",
    "EU TE CONTO A VERDADE.",
    "O SEU SONHO AGUENTA A REALIDADE?",
    "SONHO SEM PREPARO VIRA PESADELO.",
    "EU SOU O ADULTO NA SALA.",
    "QUEM FALA A VERDADE SE DESTACA."
];

interface ManifestoHookProps {
    onOpen: () => void;
}

export default function ManifestoHook({ onOpen }: ManifestoHookProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % phrases.length);
                setIsVisible(true);
            }, 500);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-8 group/hook">
            <button
                onClick={onOpen}
                className="w-full sm:w-auto px-12 py-6 bg-transparent border border-accent-gold text-accent-gold text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent-gold hover:text-black transition-all duration-500 shadow-glow-primary group flex items-center justify-center gap-4 relative overflow-hidden"
            >
                <span className="relative z-10 transition-transform group-hover:-translate-x-1">Ver Manifesto</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform relative z-10">arrow_forward</span>

                {/* Animated background fill */}
                <div className="absolute inset-0 bg-accent-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo"></div>
            </button>

            <div className="h-12 flex flex-col justify-center overflow-hidden">
                <div className={`transition-all duration-700 ease-in-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold/40 max-w-[200px] leading-relaxed">
                        {phrases[currentIndex]}
                    </p>
                </div>
            </div>
        </div>
    );
}
