import { useRef } from 'react';

interface IGPost {
    id: string;
    imageUrl: string;
    likes: number;
    comments: number;
    url: string;
}

interface LinkInstagramFeedProps {
    onTrack?: (elementId: string) => void;
}

const INSTAGRAM_POSTS: IGPost[] = [
    {
        id: 'post_1',
        imageUrl: '/1.png',
        likes: 142,
        comments: 28,
        url: 'https://instagram.com/marinhoponci'
    },
    {
        id: 'post_2',
        imageUrl: '/2.jpg',
        likes: 289,
        comments: 42,
        url: 'https://instagram.com/marinhoponci'
    },
    {
        id: 'post_3',
        imageUrl: '/3.jpg',
        likes: 195,
        comments: 17,
        url: 'https://instagram.com/marinhoponci'
    },
    {
        id: 'post_4',
        imageUrl: '/44.jpg',
        likes: 310,
        comments: 53,
        url: 'https://instagram.com/marinhoponci'
    }
];

export default function LinkInstagramFeed({ onTrack }: LinkInstagramFeedProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const handlePostClick = (post: IGPost) => {
        onTrack?.(`click_ig_${post.id}`);
        window.open(post.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div 
            className="w-full animate-fade-in-up"
            style={{ animationDelay: '180ms' }}
        >
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-accent-gold mb-3 flex items-center gap-1.5 px-1">
                <svg className="w-3.5 h-3.5 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                @marinhoponci
            </h4>

            {/* Horizontal scroll */}
            <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-4 scroll-smooth hide-scrollbar snap-x snap-mandatory cursor-grab active:cursor-grabbing"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
            >
                {INSTAGRAM_POSTS.map((post) => (
                    <button
                        key={post.id}
                        onClick={() => handlePostClick(post)}
                        className="flex-shrink-0 w-[150px] aspect-[4/5] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group relative snap-start text-left focus:outline-none"
                    >
                        {/* Post image */}
                        <img 
                            src={post.imageUrl} 
                            alt="Instagram Post" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                        />

                        {/* Hover Overlay with metrics */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-white">
                                ❤️ {post.likes}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-white">
                                💬 {post.comments}
                            </span>
                        </div>

                        {/* Minimal IG indicator icon bottom-left */}
                        <div className="absolute bottom-2.5 left-2.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                <circle cx="12" cy="12" r="4" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
