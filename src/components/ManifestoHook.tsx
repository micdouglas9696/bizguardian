interface ManifestoHookProps {
    onOpen: () => void;
}

export default function ManifestoHook({ onOpen }: ManifestoHookProps) {
    return (
        <button
            onClick={onOpen}
            className="w-full sm:w-auto px-10 py-5 bg-transparent border border-accent-gold text-accent-gold text-xs sm:text-sm font-black uppercase tracking-[0.2em] hover:bg-accent-gold hover:text-black transition-all duration-500 shadow-glow-primary group flex items-center justify-center gap-4 relative overflow-hidden"
        >
            <span className="relative z-10 transition-transform group-hover:-translate-x-1">Ver Manifesto</span>
            <span className="material-symbols-outlined text-base group-hover:translate-x-2 transition-transform relative z-10">arrow_forward</span>

            {/* Animated background fill */}
            <div className="absolute inset-0 bg-accent-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo"></div>
        </button>
    );
}
