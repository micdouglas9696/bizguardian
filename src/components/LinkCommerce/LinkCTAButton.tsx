import type { ReactNode } from 'react';

interface LinkCTAButtonProps {
    icon: ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    href?: string;
    highlight?: boolean;
    delay?: number;
    trackId?: string;
    onTrack?: (elementId: string) => void;
}

export default function LinkCTAButton({
    icon,
    title,
    description,
    onClick,
    href,
    highlight = false,
    delay = 0,
    trackId,
    onTrack,
}: LinkCTAButtonProps) {
    const handleClick = () => {
        if (trackId && onTrack) onTrack(trackId);
        if (href) {
            window.open(href, '_blank', 'noopener,noreferrer');
        } else if (onClick) {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`
                w-full px-5 py-4 rounded-2xl text-sm font-semibold
                flex items-center gap-4 text-left
                transition-all duration-300
                hover:-translate-y-0.5
                animate-fade-in-up
                ${highlight
                    ? 'border-2 border-accent-gold text-accent-gold hover:bg-accent-gold/10 hover:shadow-[0_0_30px_rgba(225,169,96,0.15)]'
                    : 'bg-[#0a0a0a] border border-white/10 text-white hover:border-white/25 hover:bg-white/[0.03]'
                }
            `}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Icon container */}
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    highlight ? 'bg-accent-gold/15' : 'bg-white/5'
                }`}
            >
                {icon}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className={`font-bold leading-tight ${highlight ? 'text-accent-gold' : 'text-white'}`}>
                    {title}
                </p>
                <p
                    className={`text-[12px] mt-0.5 leading-snug ${
                        highlight ? 'text-accent-gold/70' : 'text-white/45'
                    }`}
                >
                    {description}
                </p>
            </div>

            {/* Arrow */}
            <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    highlight ? 'bg-accent-gold/15' : 'bg-white/5'
                }`}
            >
                <span className={`text-sm ${highlight ? 'text-accent-gold' : 'text-white/50'}`}>→</span>
            </div>

            {/* Pulse ring for highlight */}
            {highlight && (
                <style>{`
                    @keyframes cta-pulse-ring {
                        0% { box-shadow: 0 0 0 0 rgba(225,169,96,0.4); }
                        70% { box-shadow: 0 0 0 8px rgba(225,169,96,0); }
                        100% { box-shadow: 0 0 0 0 rgba(225,169,96,0); }
                    }
                `}</style>
            )}
        </button>
    );
}
