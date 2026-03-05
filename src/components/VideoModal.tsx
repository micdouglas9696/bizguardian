import { useEffect, useState } from 'react';

interface VideoModalProps {
    isOpen: boolean;
    videoId: string | null;
    onClose: () => void;
}

export default function VideoModal({ isOpen, videoId, onClose }: VideoModalProps) {
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
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-700 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 scale-105'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/98 backdrop-blur-3xl"
                onClick={onClose}
            ></div>

            {/* Content Container */}
            <div className={`relative w-full h-[100dvh] sm:h-auto sm:aspect-video max-w-5xl bg-black/40 border-0 sm:border sm:border-white/10 shadow-2xl transition-all duration-700 sm:duration-1000 sm:delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:-top-16 sm:right-0 flex items-center gap-2 sm:gap-4 group transition-colors z-50 bg-black/50 sm:bg-transparent rounded-full sm:rounded-none px-3 py-1.5 sm:p-0 backdrop-blur-md border border-white/20 sm:border-0"
                >
                    <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-accent-gold transition-colors">Fechar</span>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 border border-transparent sm:border-white/20 flex items-center justify-center group-hover:border-accent-gold transition-colors sm:bg-black/50 rounded-full sm:rounded-none">
                        <span className="material-symbols-outlined text-white text-base sm:text-lg group-hover:text-accent-gold">close</span>
                    </div>
                </button>

                {/* Google Drive Iframe Player */}
                {videoId && (
                    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center rounded-xl sm:rounded-none">
                        <iframe
                            key={videoId}
                            src={`https://drive.google.com/file/d/${videoId}/preview`}
                            className="absolute border-0 w-full h-full inset-0"
                            allow="autoplay; fullscreen"
                            title="Depoimento Video Player"
                            loading="eager"
                        ></iframe>

                        {/* Overlay to block the top-right button while allowing central interaction */}
                        <div className="absolute top-0 right-0 w-[80px] h-[60px] bg-transparent z-30 cursor-default"></div>
                        <div className="absolute top-0 left-0 w-full h-[60px] bg-transparent z-30 cursor-default"></div>
                    </div>
                )}

                {/* Aesthetic Detail: HUD-like accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-accent-gold/40 pointer-events-none z-20"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-accent-gold/40 pointer-events-none z-20"></div>
            </div>
        </div>
    );
}
