export default function LaunchSection() {
    // This component is designed to be interchangeable. 
    // Currently set to: Franchise-se Immersion

    return (
        <section className="relative z-30 bg-black py-20 px-6 md:px-12 border-y border-white/5 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="max-w-[1700px] mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Launch Branding :: High Impact Glass Card */}
                    <div className="w-full lg:w-1/2 order-2 lg:order-1">
                        <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl relative overflow-hidden group hover:border-accent-gold/30 transition-all duration-700 shadow-2xl">
                            {/* Animated Detail Line */}
                            <div className="absolute top-0 left-0 w-2 h-0 bg-accent-gold group-hover:h-full transition-all duration-1000"></div>

                            <div className="flex items-center gap-6 mb-8">
                                <span className="inline-block py-1 px-4 bg-accent-gold text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-full">
                                    Destaque Agora
                                </span>
                                <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">
                                    Lançamento Exclusivo
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 uppercase leading-tight tracking-tighter">
                                FRANCHISE-SE: <br />
                                <span className="text-accent-gold">IMERSÃO ESTRATÉGICA</span>
                            </h2>

                            <p className="text-lg text-white/60 mb-8 font-medium leading-relaxed">
                                2 dias intensos de imersão presencial que mudarão sua percepção sobre expansão, seguidos por uma mentoria em grupo para consolidação do seu legado.
                            </p>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold block mb-2">Formato</span>
                                    <span className="text-sm font-bold text-white uppercase tracking-widest">2 Dias + Mentoria</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold block mb-2">Vagas</span>
                                    <span className="text-sm font-bold text-white uppercase tracking-widest">Altamente Limitadas</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <button className="px-10 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-accent-gold hover:text-white transition-all shadow-glow-primary rounded-lg">
                                    Garantir Minha Vaga
                                </button>
                                <div className="hidden sm:flex flex-col gap-1">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Início em</span>
                                    <span className="text-xs font-black uppercase tracking-widest text-white">Março 2026</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Anchor :: Immersive Imagery */}
                    <div className="w-full lg:w-1/2 order-1 lg:order-2">
                        <div className="relative aspect-[16/9] lg:aspect-square group overflow-hidden rounded-3xl border border-white/10">
                            <img
                                src="/Marinho-185.jpg"
                                alt="Franchise-se Immersion"
                                className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-105 group-hover:scale-110"
                            />
                            {/* Gradient Overlay :: Aesthetic Depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 lg:opacity-60 transition-opacity"></div>

                            {/* Floating Stats :: HUD Style */}
                            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                                <div className="flex flex-col gap-2">
                                    <div className="h-0.5 w-12 bg-accent-gold"></div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">
                                        Expansão & Mentoria
                                    </span>
                                </div>
                                <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest text-center leading-tight">
                                        Vagas<br />09/30
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
