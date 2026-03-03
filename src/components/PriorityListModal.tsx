import { useState, useEffect } from 'react';

interface PriorityListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PriorityListModal({ isOpen, onClose }: PriorityListModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Reset when opened and handle body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setName('');
            setEmail('');
            setPhone('');
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3001/api/leads/priority', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, whatsapp: phone }),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar formulário');
            }

            setSuccess(true);
        } catch (error) {
            console.error('Erro:', error);
            alert('Houve um erro ao enviar seus dados. Tente novamente mais tarde.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex bg-[#030303] overflow-y-auto animate-in slide-in-from-bottom-[100%] fade-in duration-700 ease-out">
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 fixed">
                <button onClick={onClose} className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:rotate-90 hover:scale-110 transition-all duration-300 shadow-glow-primary">
                    <span className="material-symbols-outlined text-2xl">close</span>
                </button>
            </div>

            <div className="w-full max-w-6xl mx-auto px-6 py-16 sm:px-12 md:py-24 relative min-h-screen flex flex-col justify-start items-center">

                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-accent-gold/5 blur-[150px] rounded-full pointer-events-none"></div>

                {success ? (
                    <div className="text-center py-24 my-auto animate-in zoom-in-95 duration-500 w-full max-w-2xl">
                        <div className="w-24 h-24 bg-accent-gold/10 border border-accent-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow-primary">
                            <span className="material-symbols-outlined text-accent-gold text-5xl">check</span>
                        </div>
                        <h3 className="text-3xl sm:text-5xl font-black text-white mb-6 uppercase tracking-tighter">
                            Presença Confirmada
                        </h3>
                        <p className="text-white/60 text-lg sm:text-xl font-medium mb-12">
                            Você está na lista. Fique atento ao seu e-mail para os próximos passos da Internacionalização.
                        </p>
                        <button
                            onClick={onClose}
                            className="px-12 py-6 bg-white text-black text-xs font-black uppercase tracking-[0.3em] hover:bg-accent-gold transition-all duration-300 rounded shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)]"
                        >
                            Voltar para o site
                        </button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col animate-in slide-in-from-bottom-8 duration-700">
                        {/* Header Section */}
                        <div className="text-center mb-10 md:mb-16">
                            <span className="inline-block py-1.5 px-6 bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs font-black tracking-[0.4em] uppercase mb-6 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                                Acesso Exclusivo
                            </span>
                            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight cinematic-text-shadow">
                                <span className="text-accent-gold italic font-serif opacity-90 pr-3">Expansão</span>
                                Internacional
                            </h2>
                            <p className="text-white/50 text-base sm:text-lg mt-6 max-w-2xl mx-auto font-medium">
                                Assista ao material restrito preparado por Marinho Ponci e cadastre-se para a lista de prioridades.
                            </p>
                        </div>

                        {/* Video Full Width Netflix Style Container */}
                        <div className="w-full mb-12 relative bg-black shadow-[0_30px_60px_rgba(0,0,0,0.9)]">
                            <div className="relative w-full aspect-[16/9] overflow-hidden">
                                <iframe
                                    src="https://drive.google.com/file/d/1azIYNuIGXTlqGS9ZPhyh-FYbWoUtNeXp/preview?rm=minimal"
                                    className="absolute inset-0 w-full h-[calc(100%+60px)] -top-[30px] border-0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                ></iframe>
                                {/* Overlay to block interaction with Google Drive top bar (pop-out arrow) */}
                                <div className="absolute top-0 inset-x-0 h-16 pointer-events-auto bg-transparent z-10"></div>
                            </div>
                        </div>

                        {/* Horizontal Form Box under video */}
                        <div className="w-full max-w-4xl mx-auto bg-white/[0.02] p-8 sm:p-12 md:p-14 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>

                            <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-8">
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Garanta seu lugar</h3>
                                    <p className="text-white/40 text-sm sm:text-base mt-2 font-medium">Cadastre-se para ser um dos primeiros avisados da próxima expansão internacional.</p>
                                </div>
                                <div className="text-xs font-black tracking-[0.3em] uppercase text-accent-gold/70 bg-accent-gold/10 px-4 py-2 rounded">
                                    Vagas Limitadas
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3 px-1">
                                            Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ex: João Silva"
                                            required
                                            className="w-full bg-black/60 border border-white/10 px-6 py-5 text-base text-white focus:outline-none focus:border-accent-gold/60 focus:bg-white/[0.03] transition-all rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3 px-1">
                                            WhatsApp
                                        </label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="(11) 99999-9999"
                                            required
                                            className="w-full bg-black/60 border border-white/10 px-6 py-5 text-base text-white focus:outline-none focus:border-accent-gold/60 focus:bg-white/[0.03] transition-all rounded-xl"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3 px-1">
                                            E-mail Profissional
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="seu@diretoria.com"
                                            required
                                            className="w-full bg-black/60 border border-white/10 px-6 py-5 text-base text-white focus:outline-none focus:border-accent-gold/60 focus:bg-white/[0.03] transition-all rounded-xl"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-6 py-6 border border-accent-gold bg-accent-gold/10 hover:bg-accent-gold text-accent-gold hover:text-black text-xs font-black uppercase tracking-[0.4em] transition-all duration-500 shadow-[0_0_30px_rgba(234,179,8,0.15)] hover:shadow-[0_0_50px_rgba(234,179,8,0.4)] rounded-xl flex items-center justify-center gap-4 group"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            Entrar na Lista de Prioridades
                                            <span className="material-symbols-outlined text-lg group-hover:translate-x-2 transition-transform">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
