import { useState, useRef } from 'react';
import VideoModal from '../VideoModal';

interface TestimonialItem {
    id: number;
    name: string;
    role: string;
    company: string;
    videoId: string;
    image: string;
}

interface LinkInstagramFeedProps {
    onTrack?: (elementId: string) => void;
}

const TESTIMONIALS: TestimonialItem[] = [
    { id: 1, name: 'Diego Bim', role: 'Franqueado', company: 'Influx Escola de Inglês', videoId: '/videos/diego.mp4', image: '/diego.webp' },
    { id: 2, name: 'Marcelo Zacarias', role: 'CEO & Founder', company: 'Tio Fafá Hamburgueria', videoId: '/videos/marcelo.mp4', image: '/marcelo.webp' },
    { id: 3, name: 'João Ferrari', role: 'CEO', company: 'Nutrafit', videoId: '/videos/joao.mp4', image: '/joao ferrai.webp' },
    { id: 4, name: 'Adriana Auriemo', role: 'CEO e Founder', company: 'Nutty Bavarian', videoId: '/videos/adriana.webp', image: '/adriana .webp' },
    { id: 5, name: 'Leandro Otávio', role: 'Founder', company: "D'avila Finance", videoId: '/videos/leandro.mp4', image: '/leandro.webp' }
];

export default function LinkInstagramFeed({ onTrack }: LinkInstagramFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

    const handleCardClick = (item: TestimonialItem) => {
        onTrack?.(`click_testimonial_video_${item.id}`);
        setSelectedVideoId(item.videoId);
        setIsVideoModalOpen(true);
    };

    return (
        <div 
            className="w-full animate-fade-in-up"
            style={{ animationDelay: '180ms' }}
        >
            <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-gold flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Depoimentos de Alto Padrão
                </h4>
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">
                    Deslize para ver mais
                </span>
            </div>

            {/* Horizontal scroll carousel */}
            <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-4 scroll-smooth hide-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {TESTIMONIALS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleCardClick(item)}
                        className="flex-shrink-0 w-[150px] aspect-[9/15] rounded-2xl overflow-hidden bg-zinc-900/80 border border-white/15 group relative snap-start text-left focus:outline-none hover:border-accent-gold/60 transition-all duration-300 shadow-lg"
                    >
                        {/* Thumbnail image */}
                        <img 
                            src={item.image} 
                            alt={`Depoimento ${item.name}`} 
                            className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
                            loading="lazy"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-300" />

                        {/* Card Content & Play Button */}
                        <div className="absolute inset-0 p-3.5 flex flex-col justify-end z-10">
                            <div className="w-8 h-8 rounded-full bg-accent-gold flex items-center justify-center mb-2.5 shadow-[0_0_15px_rgba(225,169,96,0.4)] group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-4 h-4 text-black ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                            </div>
                            <h5 className="text-white font-black text-xs uppercase tracking-tight leading-tight mb-1">{item.name}</h5>
                            <p className="text-accent-gold text-[9px] font-bold uppercase tracking-wider leading-none">{item.role}</p>
                            <p className="text-white/40 text-[8px] font-medium uppercase tracking-wider truncate mt-0.5">{item.company}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Video Modal Player */}
            <VideoModal
                isOpen={isVideoModalOpen}
                videoId={selectedVideoId}
                onClose={() => setIsVideoModalOpen(false)}
            />
        </div>
    );
}
