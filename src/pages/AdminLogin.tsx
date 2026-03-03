import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Encode Base64 logic credential for our simple Node Auth
            const token = btoa(`${user}:${password}`);

            // Validate credential against API
            const response = await fetch('http://localhost:3001/api/leads/priority', {
                headers: {
                    'Authorization': `Basic ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Usuário ou senha inválidos.');
                }
                throw new Error('Erro de conexão com o servidor.');
            }

            // Save token and push to dashboard
            localStorage.setItem('crm_admin_token', token);
            navigate('/admin/dashboard');

        } catch (err: any) {
            setError(err.message || 'Falha na autenticação');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4">

            {/* Visual Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-accent-gold/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                        BizGuardian <span className="text-accent-gold italic font-serif">CRM</span>
                    </h1>
                    <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em]">Painel Administrativo Interno</p>
                </div>

                <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
                    <form onSubmit={handleLogin} className="space-y-6">

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3 px-1">
                                Usuário
                            </label>
                            <input
                                type="text"
                                value={user}
                                onChange={(e) => setUser(e.target.value)}
                                required
                                className="w-full bg-black/60 border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/60 focus:bg-white/[0.03] transition-all rounded-xl"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3 px-1">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-black/60 border border-white/10 px-6 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/60 focus:bg-white/[0.03] transition-all rounded-xl"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-5 bg-accent-gold/10 hover:bg-accent-gold border border-accent-gold/50 text-accent-gold hover:text-black text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] flex justify-center items-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                                    Validando...
                                </>
                            ) : (
                                <>
                                    Acessar Painel
                                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">lock_open</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
