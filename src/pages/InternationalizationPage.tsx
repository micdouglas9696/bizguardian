import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function InternationalizationPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-xl py-4 border-b border-white/5' : 'bg-transparent py-8'}`}>
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
                    <div className="flex items-center">
                        <Link to="/" className="flex flex-col leading-none select-none cursor-pointer group">
                            <img src="/LOGO FUNDO ESCURO.png" alt="Biz Guardian Logo" className="h-14 md:h-20 w-auto object-contain transition-transform group-hover:scale-105" />
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-10">
                        <Link className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-accent-gold transition-colors" to="/">Home</Link>
                        <a className="text-xs font-black uppercase tracking-widest text-white/50 hover:text-accent-gold transition-colors" href="/#ecossistema">Ecossistema</a>
                        <a className="text-xs font-black uppercase tracking-widest text-accent-gold" href="#hero">Diagnóstico</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-6 py-2.5 rounded-md bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-accent-gold hover:text-white transition-all duration-300">
                            Área do Membro
                        </Link>
                    </div>
                </div>
            </header>

            <main className="pt-48 pb-24 max-w-7xl mx-auto px-6 relative">
                <section className="flex flex-col items-center text-center mb-24" id="hero">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-accent-gold/10 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-accent-gold/20 shadow-glow-primary">
                        <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse"></span>
                        Diagnóstico Estratégico
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 max-w-6xl text-white leading-[0.9] cinematic-text-shadow">
                        Internacionalizar com <br /><span className="text-accent-gold italic font-serif">Inteligência e Estratégia.</span>
                    </h1>
                    <p className="text-xl text-white/40 max-w-3xl mb-12 leading-relaxed font-medium">
                        Um sistema de inteligência e tecnologia que analisa a maturidade do seu negócio com precisão cirúrgica atrelado a 38 anos de experiência em internacionalização.
                    </p>

                    <div className="relative w-full max-w-5xl mb-12 group rounded-xl shadow-2xl overflow-hidden border border-white/5 aspect-video bg-black">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                        <img alt="Marinho Ponci Hero Banner" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" src="/_DSC4559.jpg" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <button className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-2xl transform transition duration-500 hover:scale-110 hover:bg-accent-gold hover:text-white">
                                <span className="material-symbols-outlined text-5xl ml-2 font-black">play_arrow</span>
                            </button>
                        </div>
                        <div className="absolute bottom-10 left-10 text-left">
                            <p className="text-white font-black text-lg uppercase tracking-tighter">Trailer Estratégico</p>
                            <p className="text-accent-gold text-xs font-black uppercase tracking-[0.2em]">A verdade sobre expandir</p>
                        </div>
                    </div>
                </section>

                {/* Error/Pain Section */}
                <section className="mb-32 full-width-section -mx-6 md:-mx-0 px-6 py-32 bg-gradient-to-b from-[#0a0a0a] to-black rounded-[2.5rem] text-white relative overflow-hidden border border-white/5 shadow-2xl" id="diagnostic">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-red/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 max-w-5xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">O erro não está <br /> <span className="text-accent-red italic font-serif">no país.</span></h2>
                            <p className="text-white/40 text-xl font-medium max-w-3xl mx-auto leading-relaxed">
                                A maioria falha não por falta de produto, mas por apostar em vez de planejar. O custo da ignorância é sempre maior que o do planejamento.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: 'money_off', title: 'Dinheiro Queimado', desc: 'Investir em marketing antes de validar a aceitação cultural e fiscal do seu produto.' },
                                { icon: 'price_change', title: 'Precificação Errada', desc: 'Ignorar taxas ocultas e custos logísticos que destroem a margem de lucro.' },
                                { icon: 'gavel', title: 'Riscos Legais', desc: 'Entrar sem a estrutura societária correta, expondo patrimônio pessoal e burocracia.' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md p-10 rounded-xl border border-white/5 hover:border-accent-red/30 transition-all group">
                                    <div className="w-12 h-12 rounded-lg bg-accent-red/10 text-accent-red flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined font-black">{item.icon}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tighter leading-tight">{item.title}</h3>
                                    <p className="text-white/40 text-sm font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Method Section */}
                <section className="mb-32" id="method">
                    <div className="text-center mb-20">
                        <span className="text-accent-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Nosso Método</span>
                        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">Inteligência & <span className="text-accent-gold italic font-serif">Conexão Real</span></h2>
                        <p className="text-white/40 mt-6 max-w-2xl mx-auto font-medium text-lg">Não vendemos cursos genéricos. Unimos a experiência de 38 anos de Marinho Ponci com o poder da tecnologia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        <div className="md:col-span-8 bg-[#111] rounded-2xl border border-white/5 relative overflow-hidden group min-h-[400px]">
                            <div className="absolute inset-0">
                                <img src="/44.jpg" alt="Marinho Ponci Clone" className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                            </div>
                            <div className="relative z-10 p-12 h-full flex flex-col justify-center max-w-md">
                                <span className="text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] mb-4 block">Tecnologia Proprietária</span>
                                <h3 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase leading-none">Clone IA do <br /> <span className="text-accent-gold italic font-serif">Marinho Ponci</span></h3>
                                <p className="text-white/50 text-lg font-medium leading-relaxed mb-8">
                                    Você será guiado a cada passo pela inteligência digital que carrega 38 anos de expertise do Marinho.
                                </p>
                                <img src="/marinho-signature.png" alt="Assinatura" className="h-14 w-auto object-contain filter invert opacity-40" />
                            </div>
                        </div>

                        <div className="md:col-span-4 bg-accent-gold text-black p-10 rounded-2xl flex flex-col justify-between group cursor-default">
                            <div className="w-12 h-12 rounded-lg bg-black/10 flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined font-black">speed</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tighter uppercase leading-none mb-4">Maturity <br /> Score</h3>
                                <p className="text-black/70 font-bold text-sm leading-relaxed">Receba uma pontuação clara de 0 a 100 sobre o quão pronta sua empresa está para exportar.</p>
                            </div>
                        </div>

                        <div className="md:col-span-6 bg-white/5 border border-white/5 p-12 rounded-2xl hover:border-accent-gold/20 transition-all group">
                            <div className="w-12 h-12 rounded-lg bg-accent-gold/10 text-accent-gold flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform">
                                <span className="material-symbols-outlined font-black">map</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase mb-4">Roadmap Tático</h3>
                            <p className="text-white/40 font-medium leading-relaxed">Um plano de ação passo a passo, do visto ao primeiro contrato assinado em solo internacional.</p>
                        </div>

                        <div className="md:col-span-6 bg-white text-black p-12 rounded-2xl group hover:bg-accent-gold transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-black/10 flex items-center justify-center mb-8">
                                <span className="material-symbols-outlined font-black">handshake</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter uppercase mb-4">Conexões Diretas</h3>
                            <p className="text-black/60 font-bold leading-relaxed group-hover:text-black">Feche negócios imediatamente com advogados e parceiros logísticos direto pelo sistema Bizguardian.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-32 text-center max-w-5xl mx-auto" id="cta-footer">
                    <div className="bg-gradient-to-br from-[#111] to-black rounded-[3rem] p-16 md:p-24 border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none relative z-10 cinematic-text-shadow">
                            Pronto para atravessar <br /> <span className="text-accent-gold italic font-serif">fronteiras?</span>
                        </h2>
                        <p className="text-xl text-white/40 max-w-2xl mx-auto mb-12 font-medium relative z-10">
                            O mundo é grande demais para você ficar limitado a um único CEP. Descubra a real capacidade de expansão do seu negócio.
                        </p>
                        <button className="bg-white text-black text-xs font-black uppercase tracking-[0.3em] px-12 py-6 rounded-md shadow-2xl hover:bg-accent-gold hover:text-white transition-all transform hover:scale-105 active:scale-95 relative z-10">
                            Iniciar Diagnóstico
                        </button>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-black text-white pt-32 pb-16 border-t border-white/5">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
                    <img src="/LOGO FUNDO ESCURO.png" alt="Biz Guardian Logo" className="h-12 w-auto object-contain mx-auto mb-10 opacity-30" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
                        © 2026 BIZGUARDIAN. BORN FOR GLOBAL.
                    </p>
                </div>
            </footer>
        </div>
    );
}
