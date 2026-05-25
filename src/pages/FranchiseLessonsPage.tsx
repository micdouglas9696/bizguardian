import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const LESSONS = [
    {
        day: '01',
        title: 'A Fundação',
        subtitle: 'O cenário real das franquias',
        desc: 'Entenda o que funciona, o que quebra, e como se posicionar para vencer no mundo do franchising. Marinho vai compartilhar os bastidores de quase 4 décadas de experiência.',
        topics: [
            'O que ninguém te conta sobre franquias',
            'Perfil do franqueado de sucesso',
            'Os 5 erros fatais de quem começa',
            'Case Chilli Beans: por dentro da expansão',
        ],
        available: true,
        icon: 'foundation',
    },
    {
        day: '02',
        title: 'O Modelo',
        subtitle: 'Construindo sua franquia',
        desc: 'Como construir sua modelagem de franquia do zero. Padronização, formatação, documentação e estratégia de expansão — o playbook completo.',
        topics: [
            'Formatação do modelo de negócio',
            'COF e documentos legais essenciais',
            'Padronização de operação',
            'Manual do franqueado: o que incluir',
        ],
        available: false,
        icon: 'architecture',
    },
    {
        day: '03',
        title: 'A Escala',
        subtitle: 'Expansão e internacionalização',
        desc: 'Domine a captação de franqueados, operação multi-unidade e o caminho para a internacionalização inteligente.',
        topics: [
            'Captação e seleção de franqueados',
            'Gestão de múltiplas unidades',
            'Quando e como internacionalizar',
            'O futuro do franchising com IA',
        ],
        available: false,
        icon: 'public',
    },
];

export default function FranchiseLessonsPage() {
    const [searchParams] = useSearchParams();
    const userName = searchParams.get('nome') || 'Participante';
    const [activeDay, setActiveDay] = useState(0);
    const mainRef = useRef<HTMLElement>(null);

    // Scroll-reveal observer
    useEffect(() => {
        const el = mainRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );
        el.querySelectorAll('.section-reveal').forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, []);

    const lesson = LESSONS[activeDay];

    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-12 py-4 flex items-center justify-between">
                    <Link to="/franquia" className="flex items-center gap-3 group">
                        <img src="/LOGO FUNDO ESCURO.webp" alt="Franchise-se" className="h-7 sm:h-8 w-auto object-contain" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hidden sm:inline">
                            Área do Participante
                        </span>
                        <div className="w-8 h-8 bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center">
                            <span className="text-[10px] font-black text-accent-gold">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main ref={mainRef} className="pt-20">
                {/* Welcome Section */}
                <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 bg-[#050505] section-reveal">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 border-b border-white/5 pb-8">
                            <div>
                                <span className="inline-block py-1.5 px-4 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-[10px] font-black tracking-[0.4em] uppercase mb-6">
                                    ✓ Inscrição Confirmada
                                </span>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                                    Bem-vindo,{' '}
                                    <span className="text-accent-gold italic">{userName}.</span>
                                </h1>
                                <p className="text-sm text-white/40 font-medium mt-3 max-w-xl">
                                    Sua vaga está garantida. Abaixo você encontra as aulas e o acesso ao grupo exclusivo de WhatsApp.
                                </p>
                            </div>
                        </div>

                        {/* WhatsApp CTA Card */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-6 sm:p-8 md:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 hover:border-accent-gold/20 transition-colors duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-all duration-500">
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </div>
                            <div className="relative z-10 flex-1 text-center sm:text-left">
                                <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mb-2">
                                    Entre no Grupo Exclusivo
                                </h3>
                                <p className="text-sm text-white/40 font-medium mb-1">
                                    Receba materiais extras, networking com outros participantes e suporte direto.
                                </p>
                            </div>
                            <a
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative z-10 px-8 sm:px-10 py-4 bg-green-500 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-green-400 transition-all duration-500 flex-shrink-0 text-center"
                            >
                                Entrar no Grupo
                            </a>
                        </div>
                    </div>
                </section>

                {/* Lessons Section */}
                <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 bg-black section-reveal">
                    <div className="max-w-[1200px] mx-auto">
                        {/* Day Tabs */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0 mb-10 sm:mb-12">
                            {LESSONS.map((l, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveDay(i)}
                                    className={`flex-1 py-4 sm:py-5 px-6 text-center transition-all duration-500 border ${activeDay === i
                                            ? 'bg-accent-gold text-black border-accent-gold'
                                            : l.available
                                                ? 'bg-[#0a0a0a] text-white/60 border-white/10 hover:border-white/20 hover:text-white'
                                                : 'bg-[#0a0a0a] text-white/20 border-white/5 cursor-default'
                                        }`}
                                >
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] block mb-1">
                                        Dia {l.day}
                                    </span>
                                    <span className="text-sm font-black uppercase tracking-wider">
                                        {l.title}
                                    </span>
                                    {!l.available && (
                                        <span className="block text-[8px] font-black uppercase tracking-widest mt-1 opacity-50">
                                            Em breve
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Active Lesson Content */}
                        <div className="grid lg:grid-cols-12 gap-8">
                            {/* Video Area */}
                            <div className="lg:col-span-8">
                                <div className="relative aspect-video bg-[#0a0a0a] border border-white/5 overflow-hidden group">
                                    {lesson.available ? (
                                        <>
                                            {/* Placeholder Video Area */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <div className="absolute inset-0 bg-gradient-to-b from-accent-gold/5 via-transparent to-transparent"></div>
                                                <div className="relative z-10 flex flex-col items-center gap-6">
                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-accent-gold/10 border-2 border-accent-gold/30 flex items-center justify-center group-hover:bg-accent-gold/20 transition-all duration-500">
                                                        <span className="material-symbols-outlined text-accent-gold text-4xl sm:text-5xl ml-1">play_arrow</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-gold mb-2">
                                                            Dia {lesson.day}
                                                        </p>
                                                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                                                            {lesson.title}
                                                        </h3>
                                                        <p className="text-sm text-white/30 mt-2">
                                                            Clique para assistir
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* HUD Corners */}
                                            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-accent-gold/30"></div>
                                            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-accent-gold/30"></div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="material-symbols-outlined text-white/10 text-6xl mb-4">lock</span>
                                            <p className="text-sm font-black uppercase tracking-[0.3em] text-white/20">
                                                Disponível em breve
                                            </p>
                                            <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest mt-2">
                                                Fique atento ao grupo de WhatsApp
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lesson Info Sidebar */}
                            <div className="lg:col-span-4">
                                <div className="bg-[#0a0a0a] border border-white/5 p-6 sm:p-8 h-full">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-accent-gold/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-accent-gold text-lg">{lesson.icon}</span>
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-gold/50 block">
                                                Dia {lesson.day}
                                            </span>
                                            <h3 className="text-sm font-black uppercase tracking-wider text-white">{lesson.title}</h3>
                                        </div>
                                    </div>

                                    <p className="text-[11px] font-bold uppercase tracking-wider text-accent-gold/60 mb-4">
                                        {lesson.subtitle}
                                    </p>

                                    <p className="text-sm text-white/40 leading-relaxed font-medium mb-8">
                                        {lesson.desc}
                                    </p>

                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-4">
                                            O que você vai aprender
                                        </h4>
                                        <div className="flex flex-col gap-3">
                                            {lesson.topics.map((topic, j) => (
                                                <div key={j} className="flex items-start gap-3">
                                                    <span className="material-symbols-outlined text-accent-gold text-sm mt-0.5 flex-shrink-0">
                                                        check_circle
                                                    </span>
                                                    <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider leading-relaxed">
                                                        {topic}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Materials/Resources Section */}
                <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 bg-[#050505] section-reveal">
                    <div className="max-w-[1200px] mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-8">
                            Materiais <span className="text-accent-gold italic">Complementares</span>
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { icon: 'description', title: 'E-book: Franchising 101', desc: 'Guia completo para quem está começando', tag: 'Em breve' },
                                { icon: 'slideshow', title: 'Slides das Aulas', desc: 'Material de apoio de cada dia', tag: 'Em breve' },
                                { icon: 'checklist', title: 'Checklist do Franqueador', desc: 'Passo a passo para formatar sua franquia', tag: 'Em breve' },
                            ].map((m, i) => (
                                <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 flex items-start gap-4 relative overflow-hidden group hover:border-white/10 transition-colors duration-500">
                                    <div className="w-10 h-10 bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-gold/10 transition-all duration-500">
                                        <span className="material-symbols-outlined text-white/40 text-lg group-hover:text-accent-gold transition-colors">{m.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-white mb-1">{m.title}</h4>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{m.desc}</p>
                                        <span className="inline-block mt-3 text-[9px] font-black uppercase tracking-[0.3em] text-accent-gold/40 bg-accent-gold/5 px-3 py-1 border border-accent-gold/10">
                                            {m.tag}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-black text-white py-10 border-t border-white/5">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4">
                    <img src="/marinho final.webp" alt="Marinho Ponci Logo" className="h-8 w-auto object-contain" />
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/10 text-center">
                        © 2026 MARINHO PONCI. FRANCHISE-SE. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </footer>
        </div>
    );
}
