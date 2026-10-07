interface LinkWhatsAppFloatProps {
    phone?: string;
    message?: string;
    onTrack?: (elementId: string) => void;
}

export default function LinkWhatsAppFloat({
    phone = '351967284661',
    message = 'Olá Marinho, vim pelo link da sua bio e gostaria de conversar.',
    onTrack,
}: LinkWhatsAppFloatProps) {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    const handleClick = () => {
        onTrack?.('whatsapp_direct');
    };

    return (
        <aside aria-label="Contato rápido via WhatsApp" className="fixed bottom-6 right-6 z-40">
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-accent-gold text-black shadow-[0_4px_20px_rgba(225,169,96,0.45)] hover:shadow-[0_4px_30px_rgba(225,169,96,0.7)] hover:scale-110 active:scale-95 transition-all duration-300 border border-black/10 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2 focus:ring-offset-[#080808]"
                aria-label="Conversar com Marinho Ponci no WhatsApp"
            >
                {/* Subtle outer pulse effect */}
                <span className="absolute -inset-1 rounded-full bg-accent-gold/30 animate-ping opacity-60 pointer-events-none" />

                {/* WhatsApp Vector Icon */}
                <svg
                    className="w-7 h-7 text-black fill-current relative z-10 transition-transform duration-300 group-hover:rotate-6"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>

                {/* Status online badge */}
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 z-20">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#080808]" />
                </span>

                {/* Tooltip on desktop hover */}
                <span className="hidden md:block pointer-events-none absolute right-16 px-3 py-1.5 bg-[#121212]/95 backdrop-blur-sm border border-accent-gold/30 text-accent-gold text-[11px] font-bold tracking-wide rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Conversar no WhatsApp
                </span>
            </a>
        </aside>
    );
}
