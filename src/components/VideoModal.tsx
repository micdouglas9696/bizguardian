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
            <div className={`relative w-full max-w-5xl aspect-video bg-black/40 border border-white/10 shadow-2xl transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-16 right-0 flex items-center gap-4 group transition-colors"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-accent-gold transition-colors">Fechar</span>
                    <div className="w-10 h-10 border border-white/20 flex items-center justify-center group-hover:border-accent-gold transition-colors bg-black/50 backdrop-blur-md">
                        <span className="material-symbols-outlined text-white text-lg group-hover:text-accent-gold">close</span>
                    </div>
                </button>

                {/* Google Drive Iframe Player */}
                {videoId && (
                    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                        <iframe
                            key={videoId}
                            src={`https://drive.google.com/file/d/${videoId}/preview`}
                            className="absolute border-0 w-full"
                            style={{
                                top: '-45px', // Slightly less aggressive to ensure play button visibility
                                height: 'calc(100% + 90px)',
                                transform: 'scale(1.01)',
                            }}
                            allow="autoplay; fullscreen"
                            title="Depoimento Video Player"
                            loading="eager"
                        ></iframe>

                        {/* Overlay to block the top-right button while allowing central interaction */}
                        <div className="absolute top-0 right-0 w-[200px] h-[60px] bg-transparent z-30 cursor-default"></div>
                    </div>
                )}

                {/* Aesthetic Detail: HUD-like accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-accent-gold/40 pointer-events-none z-20"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-accent-gold/40 pointer-events-none z-20"></div>
            </div>
        </div>
    );
}
