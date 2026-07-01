import { useEffect, useRef } from 'react';

interface LinkHeroCardProps {
    name?: string;
    tagline?: string;
    photoUrl?: string;
}

export default function LinkHeroCard({
    name = 'Marinho Ponci',
    tagline = 'Especialista em Franquias · 38 anos de experiência',
    photoUrl = '/marinho principal.webp',
}: LinkHeroCardProps) {
    const glowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const glow = glowRef.current;
        if (!glow) return;
        let frame: number;
        const pulse = () => {
            const t = Date.now() / 2000;
            const scale = 1 + Math.sin(t) * 0.08;
            const opacity = 0.35 + Math.sin(t) * 0.15;
            glow.style.transform = `scale(${scale})`;
            glow.style.opacity = `${opacity}`;
            frame = requestAnimationFrame(pulse);
        };
        frame = requestAnimationFrame(pulse);
        return () => cancelAnimationFrame(frame);
    }, []);

    return (
        <div className="flex flex-col items-center gap-4 mb-2 animate-fade-in-up">
            {/* Photo with glow */}
            <div className="relative">
                {/* Gold glow behind photo */}
                <div
                    ref={glowRef}
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(225,169,96,0.5) 0%, rgba(225,169,96,0) 70%)',
                        transform: 'scale(1.3)',
                        filter: 'blur(20px)',
                    }}
                />
                {/* Photo */}
                <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-accent-gold/40 ring-offset-2 ring-offset-[#080808]">
                    <img
                        src={photoUrl}
                        alt={name}
                        className="w-full h-full object-cover object-top"
                        loading="eager"
                        decoding="async"
                    />
                </div>
                {/* Verified badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-accent-gold rounded-full flex items-center justify-center ring-2 ring-[#080808]">
                    <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                </div>
            </div>

            {/* Name + Tagline */}
            <div className="text-center mt-1 px-4">
                <h1
                    className="text-2xl font-black tracking-tight text-accent-gold"
                    style={{ fontFamily: "'Satoshi', 'Inter', sans-serif" }}
                >
                    {name}
                </h1>
                <p className="text-sm mt-1.5 text-white/55 font-medium leading-snug max-w-[280px]">
                    {tagline}
                </p>
            </div>
        </div>
    );
}
