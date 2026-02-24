import { useEffect } from 'react';

interface QuotesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const quotes = [
    {
        text: "Fazer marketing para rede de franquias torna você um profissional com visão mais ampla e em 360 graus, uma vez que o faz avaliar não somente a logística e os resultados, mas também os impactos na empresa, desde a criação até o cliente final. Precisamos pensar que temos dois clientes – o franqueado e o consumidor final – e o objetivo é satisfazer e gerar resultados para ambos",
        source: "MARKETING PARA FRANQUIAS",
        authors: "Denis Santini & Filomena Garcia"
    },
    {
        text: "O sucesso no marketing para rede de franquias se da quando o franqueador senta na cadeira do franqueado e entende que existem dois targets : o cliente da ponta e o cliente-franqueado. E juntos buscam a satisfação de ambos com resultados positivos",
        source: "MARKETING PARA FRANQUIAS",
        authors: "Denis Santini & Filomena Garcia"
    },
    {
        text: "We've always worked with the truth. We didn't want to sell the most expensive product; we wanted to sell what was really good for the customer. We want to create the same trust with our customers that doctor has with his patients.",
        source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
        authors: "Shaun Smith & Andy Milligan"
    },
    {
        text: "The processes could not influence the person, the person needed to influence the process.",
        source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
        authors: "Shaun Smith & Andy Milligan"
    },
    {
        text: "What we've built is not a company; it's our universe, our world. You must use your four senses to experience it and as you become part of the brand you'll have a visual experience, you will smell it, feel it or hear it.",
        source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
        authors: "Shaun Smith & Andy Milligan"
    },
    {
        text: "When we advertise we don't show our products, we show our 'world' – our identity.",
        source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
        authors: "Shaun Smith & Andy Milligan"
    },
    {
        text: "When I hire a new employee I keep in mind the following questions: is this person capable of being part of our family and will enjoy working with this person?",
        source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
        authors: "Shaun Smith & Andy Milligan"
    },
    {
        text: "Lojas que crescem mais rápido e deslancham são aquelas que têm por trás um franqueado apaixonado pela marca.....é mais fácil ensinar a fazer fluxo de caixa ou gestão de capital de giro do que ensinar alguém a gostar do negócio.",
        source: "OS 7 FRANQUEAHÁBITOS",
        authors: "Denis Santini"
    },
    {
        text: "Quem quer empreender em Portugal dou duas dicas : Paciência e Reserva financeira de pelo menos dois anos – O primeiro ano é terrível; no segundo, entende-se o mercado; e no terceiro o negócio pode deslanchar",
        source: "REVISTA VEJA",
        authors: "Setembro 2019"
    }
];

export default function QuotesModal({ isOpen, onClose }: QuotesModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fadeIn"
                onClick={onClose}
            />

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl max-h-[85vh] overflow-y-auto mx-4 sm:mx-8 px-6 sm:px-12 py-12 sm:py-16 bg-[#0a0a0a] border border-white/5 rounded-2xl animate-fadeIn">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/30 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>

                {/* Header */}
                <div className="mb-12 border-b border-white/5 pb-8">
                    <span className="inline-block py-1.5 px-4 bg-accent-gold/5 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-5">
                        Biblioteca
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                        Minhas <span className="text-accent-gold italic">Citações.</span>
                    </h2>
                </div>

                {/* Quotes Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {quotes.map((quote, idx) => (
                        <div
                            key={idx}
                            className="group p-6 sm:p-8 bg-white/[0.02] border border-white/5 rounded-xl hover:border-accent-gold/20 transition-all duration-500"
                            style={{ animationDelay: `${idx * 80}ms` }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[9px] font-black tracking-[0.3em] text-accent-gold/60 uppercase">
                                    {quote.source}
                                </span>
                            </div>

                            <p className="text-sm sm:text-base text-white/70 font-medium leading-relaxed italic mb-5">
                                "{quote.text}"
                            </p>

                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <div className="w-1 h-4 bg-accent-gold/30 rounded-full"></div>
                                <span className="text-[9px] font-bold tracking-[0.15em] text-white/25 uppercase">
                                    {quote.authors}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
