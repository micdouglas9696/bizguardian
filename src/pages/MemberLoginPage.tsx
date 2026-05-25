import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL, isMemberAuthenticated, setMemberToken } from '../lib/memberAuth';

export default function MemberLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'Entrar | Área do Membro · O Dossiê';
        if (isMemberAuthenticated()) {
            navigate('/membro', { replace: true });
        }
    }, [navigate]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const resp = await fetch(`${API_URL}/api/ebook/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Falha no login');
            setMemberToken(data.token);
            navigate('/membro', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Erro ao entrar');
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
                            src="/marinho final.webp"
                            alt="Marinho Ponci"
                            className="h-14 mx-auto mb-6 opacity-90"
                        />
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-[0.95]">
                        Área do{' '}
                        <span className="italic text-accent-gold">Membro</span>
                    </h1>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 p-8 hud-border">
                    <form onSubmit={handleSubmit} className="space-y-5">
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

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-black/60 border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/60 transition-all"
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
                                    Entrando…
                                </>
                            ) : (
                                <>
                                    Entrar
                                    <span className="material-symbols-outlined text-base">
                                        login
                                    </span>
                                </>
                            )}
                        </button>
                    </form>

                    <Link
                        to="/membro/esqueci-senha"
                        className="block text-center text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-accent-gold transition-colors mt-5 font-bold"
                    >
                        Esqueci minha senha
                    </Link>

                    <p className="text-center text-[11px] text-white/40 mt-5 leading-[1.6]">
                        Acabou de comprar e ainda não definiu senha?{' '}
                        <span className="text-accent-gold/80">
                            Verifique o link de ativação no seu email.
                        </span>
                    </p>
                </div>

                <p className="text-center text-[11px] text-white/30 mt-6 uppercase tracking-[0.25em] font-bold">
                    © Marinho Ponci · Área do Membro
                </p>
            </div>
        </div>
    );
}
