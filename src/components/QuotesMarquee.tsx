export default function QuotesMarquee() {
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
            text: "We´ve always worked with the truth. We didn´t want to sell the most expensive product; we wanted to sell what was really good for the customer. We want to create the same trust with our customers that doctor has with his patients.",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan"
        },
        {
            text: "The processes could not influence the person, the person needed to influence the process.",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan"
        },
        {
            text: "What we´ve built is not a company; it´s our universe, our world. You must use your four senses to experience it and as you become part of the brand you´ll have a visual experience, you will smell it, feel it or hear it.",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan"
        },
        {
            text: "When we advertise we don´t show our products, we show our “ world” – our identity.",
            source: "BOLD - HOW TO BE BRAVE IN BUSINESS AND WIN",
            authors: "Shaun Smith & Andy Milligan"
        },
        {
            text: "When I hire a new employee I keep in mind the following questions: is this person capable of being part of our family and will enjoy working with this person ?",
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

    // Double the quotes for seamless loop
    const displayQuotes = [...quotes, ...quotes];

    return (
        <div className="relative z-20 -mt-px border-y border-white/5 bg-black py-12 overflow-hidden">
            {/* Edge Fading Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-black via-black/80 to-transparent z-10"></div>

            <div className="flex animate-marquee whitespace-nowrap gap-48 items-center will-change-transform">
                {displayQuotes.map((quote, idx) => (
                    <div key={idx} className="flex flex-col gap-4 max-w-xl min-w-[450px]">
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black tracking-[0.4em] text-accent-gold/60 uppercase">
                                {quote.source}
                            </span>
                            <div className="h-[1px] w-8 bg-accent-gold/10"></div>
                            <span className="text-[8px] font-bold tracking-[0.1em] text-white/10 uppercase">
                                {quote.authors}
                            </span>
                        </div>

                        <p className="text-lg md:text-xl font-medium text-white/80 leading-snug tracking-tight whitespace-normal max-w-lg italic">
                            "{quote.text}"
                        </p>
                    </div>
                ))}
            </div>

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        </div>
    );
}
