import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL, setMemberToken } from '../lib/memberAuth';

interface TokenInfo {
    email: string;
    name: string | null;
    already_set: boolean;
}

export default function MemberActivatePage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isReset = location.pathname.includes('/redefinir');
    const token = params.get('token') || '';

    const [info, setInfo] = useState<TokenInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        document.title = isReset
            ? 'Redefinir senha | Marinho Ponci'
            : 'Ativar acesso | O Dossiê do Futuro Franqueado';
        if (!token) {
            setError('Link inválido — token ausente.');
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const resp = await fetch(
                    `${API_URL}/api/ebook/auth/validate-token?token=${encodeURIComponent(token)}`,
                );
                const data = await resp.json();
                if (cancelled) return;
                if (!resp.ok) {
                    setError(data.error || 'Não foi possível validar o link.');
                } else {
                    setInfo(data);
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message || 'Erro ao validar link');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [token]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password.length < 8) {
            setError('A senha precisa ter ao menos 8 caracteres.');
            return;
        }
        if (password !== confirm) {
            setError('As senhas não conferem.');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const resp = await fetch(`${API_URL}/api/ebook/auth/setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.error || 'Falha ao definir senha');
            setMemberToken(data.token);
            navigate('/membro', { replace: true });
        } catch (err: any) {
            setError(err.message || 'Erro ao definir senha');
            setSubmitting(false);
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
                        {isReset ? 'Redefinição de senha' : 'Ativação de acesso'}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-[0.95]">
                        {isReset ? 'Crie uma' : 'Defina sua'}{' '}
                        <span className="italic text-accent-gold">
                            {isReset ? 'nova senha.' : 'senha.'}
                        </span>
                    </h1>
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 p-8 hud-border">
                    {loading && (
                        <div className="text-center py-8">
                            <span className="material-symbols-outlined text-accent-gold text-3xl animate-spin">
                                progress_activity
                            </span>
                            <p className="text-[12px] uppercase tracking-[0.3em] text-white/40 font-bold mt-4">
                                Validando link…
                            </p>
                        </div>
                    )}

                    {!loading && error && !info && (
                        <div className="text-center py-4">
                            <span className="material-symbols-outlined text-yellow-400 text-4xl mb-3 inline-block">
                                error
                            </span>
                            <p className="text-[15px] text-white/70 leading-[1.7] mb-6">
                                {error}
                            </p>
                            <Link
                                to="/membro/login"
                                className="inline-block px-6 py-3 border border-accent-gold/50 text-accent-gold text-xs font-black uppercase tracking-[0.2em] hover:bg-accent-gold hover:text-black transition-colors"
                            >
                                Já tenho conta
                            </Link>
                        </div>
                    )}

                    {!loading && info && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                                    Email da compra
                                </label>
                                <div className="bg-black/60 border border-white/10 px-5 py-4 text-sm text-white/80">
                                    {info.email}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                                    Nova senha
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    className="w-full bg-black/60 border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/60 transition-all"
                                    placeholder="Mínimo 8 caracteres"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                                    Confirmar senha
                                </label>
                                <input
                                    type="password"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    minLength={8}
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
                                disabled={submitting}
                                className="w-full py-4 bg-accent-gold text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-base">
                                            progress_activity
                                        </span>
                                        Ativando…
                                    </>
                                ) : (
                                    <>
                                        Ativar e entrar
                                        <span className="material-symbols-outlined text-base">
                                            arrow_forward
                                        </span>
                                    </>
                                )}
                            </button>

                            {info.already_set && (
                                <p className="text-center text-[11px] text-yellow-400/80 uppercase tracking-[0.2em] font-bold">
                                    Você já havia definido uma senha — esta vai
                                    substituir a anterior
                                </p>
                            )}
                        </form>
                    )}
                </div>

                <p className="text-center text-[11px] text-white/30 mt-6 uppercase tracking-[0.25em] font-bold">
                    © Marinho Ponci · Área do Membro
                </p>
            </div>
        </div>
    );
}
