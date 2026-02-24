import { useState } from 'react';

interface ServiceNode {
    id: number;
    icon: string;
    label: string;
    description: string;
}

const SERVICES: ServiceNode[] = [
    { id: 1, icon: 'public', label: 'Internacionalização', description: 'Passo a passo para preparar e fazer o processo de internacionalização de sua marca.' },
    { id: 2, icon: 'school', label: 'Franchise-se', description: 'Expo sobre o que é o mundo do franchising para que você avalie se ele é ou não para você.' },
    { id: 3, icon: 'record_voice_over', label: 'Palestras', description: 'Palestra de Marinho Ponci sobre franchising, internacionalização e negócios globais.' },
    { id: 4, icon: 'psychology', label: 'Mentoria', description: 'Mentoria estratégica diretamente com Marinho Ponci.' },
    { id: 5, icon: 'gavel', label: 'Conselheiro', description: 'Participação em Conselhos Consultivos empresariais.' },
    { id: 6, icon: 'trending_up', label: 'Expansão', description: 'Preparamos sua equipe de expansão para aumentar sua rede.' },
    { id: 7, icon: 'location_on', label: 'Real State', description: 'Encontramos locais com qualidade para operação das suas unidades.' },
    { id: 8, icon: 'groups', label: 'Eventos', description: 'Trazemos comitivas de executivos para conhecer outros mercados.' },
    { id: 9, icon: 'mic', label: 'Podcast', description: 'Bate papo com convidados e histórias inspiradoras no franchising.' },
    { id: 10, icon: 'handshake', label: 'Representação', description: 'Representamos sua marca no mercado internacional.' },
    { id: 11, icon: 'receipt_long', label: 'Licenciamentos', description: 'Licenciamos seus produtos para o mercado internacional.' },
];

export { SERVICES };

export default function EcosystemMolecule() {
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const handleServiceClick = (service: ServiceNode) => {
        // Scroll to contact form and pre-select service
        const contactSection = document.getElementById('contato');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });

            // Wait for scroll, then set the service dropdown value
            setTimeout(() => {
                const serviceSelect = document.getElementById('contact-service-select') as HTMLSelectElement;
                if (serviceSelect) {
                    serviceSelect.value = service.label;
                    serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, 800);
        }
    };

    return (
        <>
            {/* Desktop: 2x2 Block Grid */}
            <div className="hidden lg:flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-3">
                    {SERVICES.map((service) => (
                        <div
                            key={service.id}
                            onClick={() => handleServiceClick(service)}
                            onMouseEnter={() => setHoveredId(service.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`group relative p-6 rounded-xl border cursor-pointer transition-all duration-300 overflow-hidden ${hoveredId === service.id
                                ? 'bg-accent-gold/10 border-accent-gold/40 scale-[1.02]'
                                : 'bg-white/[0.03] border-white/5 hover:border-accent-gold/20 hover:bg-white/[0.05]'
                                }`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${hoveredId === service.id
                                    ? 'bg-gradient-to-b from-accent-gold to-[#a47e4b] shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                                    : 'bg-gradient-to-b from-accent-gold/80 to-[#a47e4b]/80 group-hover:from-accent-gold group-hover:to-[#a47e4b]'
                                    }`}>
                                    <span className="material-symbols-outlined text-white font-bold text-lg">
                                        {service.icon}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className={`text-sm font-black uppercase tracking-[0.12em] leading-tight block transition-colors duration-300 ${hoveredId === service.id ? 'text-accent-gold' : 'text-white/70 group-hover:text-white'
                                        }`}>
                                        {service.label}
                                    </span>
                                    <p className={`text-sm leading-relaxed mt-1.5 font-medium transition-colors duration-300 ${hoveredId === service.id ? 'text-white/60' : 'text-white/30 group-hover:text-white/40'
                                        }`}>
                                        {service.description}
                                    </p>
                                </div>
                                {/* Arrow indicator */}
                                <span className={`material-symbols-outlined text-sm transition-all duration-300 ${hoveredId === service.id ? 'text-accent-gold translate-x-0 opacity-100' : 'text-white/10 -translate-x-2 opacity-0 group-hover:opacity-50 group-hover:translate-x-0'
                                    }`}>arrow_forward</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile/Tablet: Compact Grid */}
            <div className="lg:hidden w-full px-2 py-6">
                <div className="grid grid-cols-2 gap-2.5">
                    {SERVICES.map((service) => (
                        <div
                            key={service.id}
                            onClick={() => handleServiceClick(service)}
                            className="relative p-3.5 rounded-xl border cursor-pointer transition-colors duration-200 bg-white/[0.03] border-white/5 active:bg-accent-gold/10 active:border-accent-gold/30"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-b from-accent-gold to-[#a47e4b]">
                                    <span className="material-symbols-outlined text-white font-bold text-base">
                                        {service.icon}
                                    </span>
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-[0.1em] leading-tight min-w-0 text-white/60">
                                    {service.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
