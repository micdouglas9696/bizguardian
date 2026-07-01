import React from 'react';

interface SocialLink {
    name: string;
    url: string;
    icon: React.ReactNode;
}

interface LinkSocialIconsProps {
    onTrack?: (elementId: string) => void;
}

export default function LinkSocialIcons({ onTrack }: LinkSocialIconsProps) {
    const socials: SocialLink[] = [
        {
            name: 'Instagram',
            url: 'https://instagram.com/marinhoponci',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
            ),
        },
        {
            name: 'YouTube',
            url: 'https://www.youtube.com/@marinhoponci',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                </svg>
            ),
        },
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/marinhoponci/',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                </svg>
            ),
        },
    ];

    return (
        <div className="flex justify-center gap-3 py-2 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            {socials.map((social) => (
                <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onTrack?.(`click_social_${social.name.toLowerCase()}`)}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/70 hover:text-accent-gold transition-all duration-300 hover:scale-110 hover:border-accent-gold/40"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1.5px solid rgba(255,255,255,0.08)',
                    }}
                    title={social.name}
                    aria-label={`Abrir ${social.name}`}
                >
                    {social.icon}
                </a>
            ))}
        </div>
    );
}
