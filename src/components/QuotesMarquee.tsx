

export default function QuotesMarquee() {
    const quotes = [
        {
            text: "Fazer marketing para rede de franquias torna você um profissional com visão mais ampla e em 360 graus, uma vez que o faz avaliar não somente a logística e os resultados, mas também os impactos na empresa, desde a criação até o cliente final. Precisamos pensar que temos dois clientes – o franqueado e o consumidor final – e o objetivo é satisfazer e gerar resultados para ambos",
            source: "MARKETING PARA FRANQUIAS",
            authors: "Denis Santini & Filomena Garcia",
            cover: "/mkt para franquias .jpg"
        },
        {
            text: "O sucesso no marketing para rede de franquias se da quando o franqueador senta na cadeira do franqueado e entende que existem dois targets : o cliente da ponta e o cliente-franqueado. E juntos buscam a satisfação de ambos com resultados positivos",
            source: "MARKETING PARA FRANQUIAS",
            authors: "Denis Santini & Filomena Garcia",
            cover: "/mkt para franquias .jpg"
        },
        {
            text: "We´ve always worked with the truth. We didn´t want to sell the most expensive product; we wanted to sell what was really good for the customer. We want to create the same trust with our customers that doctor has with his patients.",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan",
            cover: "/bold.jpg"
        },
        {
            text: "The processes could not influence the person, the person needed to influence the process.",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan",
            cover: "/bold.jpg"
        },
        {
            text: "What we´ve built is not a company; it´s our universe, our world. You must use your four senses to experience it and as you become part of the brand you´ll have a visual experience, you will smell it, feel it or hear it.",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan",
            cover: "/bold.jpg"
        },
        {
            text: "When we advertise we don´t show our products, we show our “ world” – our identity.",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan",
            cover: "/bold.jpg"
        },
        {
            text: "When I hire a new employee I keep in mind the following questions: is this person capable of being part of our family and will enjoy working with this person ?",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan",
            cover: "/bold.jpg"
        },
        {
            text: "Lojas que crescem mais rápido e deslancham são aquelas que têm por trás um franqueado apaixonado pela marca.....é mais fácil ensinar a fazer fluxo de caixa ou gestão de capital de giro do que ensinar alguém a gostar do negócio.",
            source: "OS 7 FRANQUEAHÁBITOS",
            authors: "Denis Santini",
            cover: "/0s 7 mandamentos.jpg"
        },
        {
            text: "Quem quer empreender em Portugal dou duas dicas : Paciência e Reserva financeira de pelo menos dois anos – O primeiro ano é terrível; no segundo, entende-se o mercado; e no terceiro o negócio pode deslanchar",
            source: "REVISTA VEJA",
            authors: "Setembro 2019",
            cover: null
        }
    ];

    // Double the quotes for seamless loop
    const displayQuotes = [...quotes, ...quotes];

    return (
        <div className="relative z-20 -mt-px border-y border-white/5 bg-black py-16 overflow-hidden">
            {/* Edge Fading Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

            <div className="flex animate-marquee whitespace-nowrap gap-16 md:gap-32 items-stretch will-change-transform">
                {displayQuotes.map((quote, idx) => (
                    <div key={idx} className="flex gap-6 max-w-2xl min-w-[320px] md:min-w-[550px] bg-white/[0.02] border border-white/5 p-6 rounded-xl hover:border-accent-gold/20 transition-colors">
                        {quote.cover && (
                            <div className="flex-shrink-0 w-24 h-36 md:w-32 md:h-48 group overflow-hidden rounded shadow-lg border border-white/10 hidden sm:block">
                                <img src={quote.cover} alt={quote.source} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-105" />
                            </div>
                        )}
                        <div className="flex flex-col gap-4 flex-1 whitespace-normal">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-accent-gold/10 text-accent-gold text-[8px] font-black uppercase tracking-widest rounded-sm border border-accent-gold/20">
                                        {quote.cover ? 'Livro' : 'Artigo'}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-[11px] md:text-xs font-black tracking-widest text-accent-gold uppercase leading-tight">
                                        {quote.source}
                                    </h4>
                                    <p className="text-[9px] md:text-[10px] font-bold tracking-widest text-white/40 uppercase mt-1">
                                        Autor: {quote.authors}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm md:text-base font-medium text-white/80 leading-relaxed tracking-tight italic border-l-2 border-white/10 pl-4 mt-2">
                                "{quote.text}"
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        </div>
    );
}
