import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/memberAuth';

export default function MemberForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Esqueci minha senha | Marinho Ponci';
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const resp = await fetch(`${API_URL}/api/ebook/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!resp.ok) {
                const data = await resp.json().catch(() => ({}));
                throw new Error(data.error || 'Erro ao enviar email');
            }
            setSent(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao processar solicitação');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent-gold/10 blur-[160px] rounded-full pointer-events-none"></div>

            <div className="relative max-w-md w-full">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block">
                        <img
                            src="/marinho final.png"
                            alt="Marinho Ponci"
                            className="h-14 mx-auto mb-6 opacity-90"
                        />
                    </Link>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3 block">
                        Recuperar acesso
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-[0.95]">
                        Esqueci minha{' '}
                        <span className="italic text-accent-gold">senha.</span>
                    </h1>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 p-8 hud-border">
                    {sent ? (
                        <div className="text-center py-4">
                            <span className="material-symbols-outlined text-accent-gold text-5xl mb-4 inline-block">
                                mark_email_read
                            </span>
                            <h2 className="font-black text-white text-xl uppercase tracking-tight mb-3">
                                Email enviado
                            </h2>
                            <p className="text-[14px] text-white/60 leading-[1.7] mb-6">
                                Se esse email estiver cadastrado, você vai receber um link
                                para redefinir sua senha em alguns instantes.
                            </p>
                            <Link
                                to="/membro/login"
                                className="inline-block px-6 py-3 border border-accent-gold/50 text-accent-gold text-xs font-black uppercase tracking-[0.25em] hover:bg-accent-gold hover:text-black transition-colors"
                            >
                                Voltar para o login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <p className="text-[14px] text-white/60 leading-[1.65]">
                                Informe o email da sua conta. Enviaremos um link para você
                                criar uma nova senha.
                            </p>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-black/60 border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/60 transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 text-[13px]">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-accent-gold text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-base">
                                            progress_activity
                                        </span>
                                        Enviando…
                                    </>
                                ) : (
                                    <>
                                        Enviar link de recuperação
                                        <span className="material-symbols-outlined text-base">
                                            send
                                        </span>
                                    </>
                                )}
                            </button>

                            <Link
                                to="/membro/login"
                                className="block text-center text-[11px] uppercase tracking-[0.2em] text-white/40 hover:text-accent-gold transition-colors mt-4 font-bold"
                            >
                                ← Voltar para o login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
