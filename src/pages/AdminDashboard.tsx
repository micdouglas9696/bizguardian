import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUESTIONS } from '../components/FranchiseQuizModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface QuizLead {
    id: string;
    created_at: string;
    name: string;
    email: string;
    whatsapp: string;
    score: number;
    answers: Record<number, number>;
    status: string;
}

interface PriorityLead {
    id: string;
    created_at: string;
    name: string;
    email: string;
    whatsapp: string;
    status: string;
}

interface ContactLead {
    id: string;
    created_at: string;
    name: string;
    email: string;
    whatsapp: string;
    service: string;
    message: string;
    status: string;
}

interface EbookLead {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
}

interface Member {
    id: string;
    created_at: string;
    name: string;
    email: string;
    whatsapp: string;
    access_granted_at: string | null;
    last_login_at: string | null;
    activated: boolean;
    has_access: boolean;
}

type TabType = 'quiz' | 'priority' | 'contact' | 'ebook-leads' | 'members';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [leadType, setLeadType] = useState<TabType>('quiz');
    const [view, setView] = useState<'table' | 'kanban'>('table');
    const [quizLeads, setQuizLeads] = useState<QuizLead[]>([]);
    const [priorityLeads, setPriorityLeads] = useState<PriorityLead[]>([]);
    const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
    const [ebookLeads, setEbookLeads] = useState<EbookLead[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLead, setSelectedLead] = useState<QuizLead | null>(null);

    // Novo membro
    const [showNewMember, setShowNewMember] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newMemberLoading, setNewMemberLoading] = useState(false);
    const [newMemberMsg, setNewMemberMsg] = useState('');
    const [newMemberError, setNewMemberError] = useState('');

    // Toggle acesso
    const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);
    // Reenvio
    const [resendLoadingId, setResendLoadingId] = useState<string | null>(null);
    const [resendMsg, setResendMsg] = useState('');

    const authHeader = () => {
        const token = localStorage.getItem('crm_admin_token') || '';
        return { 'Authorization': `Basic ${token}`, 'Content-Type': 'application/json' };
    };

    const fetchAll = async () => {
        const token = localStorage.getItem('crm_admin_token');
        if (!token) { navigate('/admin'); return; }
        try {
            const [quizRes, priorityRes, contactRes, ebookLeadsRes, membersRes] = await Promise.all([
                fetch(`${API_URL}/api/leads/quiz`, { headers: { 'Authorization': `Basic ${token}` } }),
                fetch(`${API_URL}/api/leads/priority`, { headers: { 'Authorization': `Basic ${token}` } }),
                fetch(`${API_URL}/api/leads/contact`, { headers: { 'Authorization': `Basic ${token}` } }),
                fetch(`${API_URL}/api/admin/ebook/leads`, { headers: { 'Authorization': `Basic ${token}` } }),
                fetch(`${API_URL}/api/admin/members`, { headers: { 'Authorization': `Basic ${token}` } }),
            ]);
            if (!quizRes.ok || !priorityRes.ok || !contactRes.ok) throw new Error('Falha ao carregar dados');
            setQuizLeads(await quizRes.json());
            setPriorityLeads(await priorityRes.json());
            setContactLeads(await contactRes.json());
            if (ebookLeadsRes.ok) setEbookLeads(await ebookLeadsRes.json());
            if (membersRes.ok) setMembers(await membersRes.json());
        } catch (err: any) {
            setError(err.message);
            if (err.message.includes('401') || err.message.includes('403')) {
                localStorage.removeItem('crm_admin_token');
                navigate('/admin');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('crm_admin_token');
        navigate('/admin');
    };

    const handleCreateMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newEmail.trim()) { setNewMemberError('Preencha nome e email.'); return; }
        setNewMemberLoading(true);
        setNewMemberError('');
        setNewMemberMsg('');
        try {
            const res = await fetch(`${API_URL}/api/admin/members`, {
                method: 'POST',
                headers: authHeader(),
                body: JSON.stringify({ name: newName.trim(), email: newEmail.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setNewMemberError(data.error || 'Erro ao criar membro'); return; }
            setNewMemberMsg(`Membro criado! Email de ativação enviado para ${newEmail.trim()}.`);
            setNewName('');
            setNewEmail('');
            fetchAll();
        } catch {
            setNewMemberError('Erro de conexão');
        } finally {
            setNewMemberLoading(false);
        }
    };

    const handleToggleAccess = async (member: Member) => {
        setToggleLoadingId(member.id);
        try {
            await fetch(`${API_URL}/api/admin/members/${member.id}/access`, {
                method: 'PATCH',
                headers: authHeader(),
                body: JSON.stringify({ revoke: member.has_access }),
            });
            fetchAll();
        } catch {
            // silently fail
        } finally {
            setToggleLoadingId(null);
        }
    };

    const handleResend = async (member: Member) => {
        setResendLoadingId(member.id);
        setResendMsg('');
        try {
            const res = await fetch(`${API_URL}/api/admin/members/${member.id}/resend`, {
                method: 'POST',
                headers: authHeader(),
            });
            if (res.ok) setResendMsg(`Email enviado para ${member.email}`);
        } catch {
            // silently fail
        } finally {
            setResendLoadingId(null);
            setTimeout(() => setResendMsg(''), 4000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white/50">
                <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-accent-gold">autorenew</span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Carregando Módulo...</p>
            </div>
        );
    }

    const tabTitle: Record<TabType, string> = {
        quiz: 'Leads: Diagnóstico',
        priority: 'Leads: Internacionalização',
        contact: 'Leads: Contato Direto',
        'ebook-leads': 'Leads: Ebook',
        members: 'Gerenciar Membros',
    };

    const tabSub: Record<TabType, string> = {
        quiz: 'Respostas do questionário avançado',
        priority: 'Lista de espera VIP Internacional',
        contact: 'Mensagens recebidas pelo formulário de contato',
        'ebook-leads': 'Interessados capturados antes do checkout',
        members: 'Acesso e criação manual de membros',
    };

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {/* Nav Header */}
            <header className="fixed top-0 w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5 z-40 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                <div>
                    <img src="/marinho final.png" alt="Marinho Ponci" className="h-8 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.15)]" />
                </div>
                <div className="flex items-center gap-3 md:gap-6">
                    {leadType === 'quiz' && (
                        <div className="flex gap-1 md:gap-2 p-1 bg-white/5 rounded-lg border border-white/10 hidden sm:flex">
                            <button
                                onClick={() => setView('table')}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all ${view === 'table' ? 'bg-accent-gold text-black shadow-glow-primary' : 'text-white/40 hover:text-white'}`}
                            >
                                Lista
                            </button>
                            <button
                                onClick={() => setView('kanban')}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all ${view === 'kanban' ? 'bg-accent-gold text-black shadow-glow-primary' : 'text-white/40 hover:text-white'}`}
                            >
                                Kanban
                            </button>
                        </div>
                    )}
                    <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors flex items-center">
                        <span className="material-symbols-outlined text-xl">logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 px-4 md:px-6 pb-12 max-w-[1600px] mx-auto w-full">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-8 md:mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6 overflow-hidden">
                    <div className="shrink-0">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
                            {tabTitle[leadType]}
                        </h2>
                        <p className="text-white/40 text-sm">{tabSub[leadType]}</p>
                    </div>
                    <div className="flex overflow-x-auto scrollbar-hide bg-[#050505] p-1.5 rounded-xl border border-white/5 shadow-inner shrink-0 w-full xl:w-auto">
                        {([
                            ['quiz', `Diagnóstico (${quizLeads.length})`],
                            ['priority', `Internacionalizar (${priorityLeads.length})`],
                            ['contact', `Contato (${contactLeads.length})`],
                            ['ebook-leads', `Leads Ebook (${ebookLeads.length})`],
                            ['members', `Membros (${members.length})`],
                        ] as [TabType, string][]).map(([type, label]) => (
                            <button
                                key={type}
                                onClick={() => { setLeadType(type); setView('table'); }}
                                className={`px-4 md:px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all whitespace-nowrap ${leadType === type ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ====== TAB: EBOOK LEADS ====== */}
                {leadType === 'ebook-leads' && (
                    <div className="overflow-x-auto bg-[#050505] border border-white/5 rounded-2xl shadow-2xl animate-in fade-in">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 bg-white/[0.02]">
                                    <th className="p-5">Data</th>
                                    <th className="p-5">Nome</th>
                                    <th className="p-5">E-mail</th>
                                    <th className="p-5">Telefone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ebookLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-white/40 text-sm">Nenhum lead de ebook capturado ainda.</td>
                                    </tr>
                                ) : ebookLeads.map(lead => (
                                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-5 text-xs text-white/60">
                                            {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-5 font-bold">{lead.name}</td>
                                        <td className="p-5 text-sm text-white/80">{lead.email}</td>
                                        <td className="p-5">
                                            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-accent-gold text-sm hover:underline">
                                                {lead.phone || '—'}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ====== TAB: MEMBROS ====== */}
                {leadType === 'members' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Criar novo membro */}
                        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-black uppercase tracking-[0.15em] text-sm text-white">Criar Membro Manual</h3>
                                    <p className="text-white/40 text-xs mt-1">Cria o acesso e envia email de ativação automaticamente.</p>
                                </div>
                                <button
                                    onClick={() => { setShowNewMember(v => !v); setNewMemberMsg(''); setNewMemberError(''); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-accent-gold text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all"
                                >
                                    <span className="material-symbols-outlined text-base">person_add</span>
                                    Novo Membro
                                </button>
                            </div>
                            {showNewMember && (
                                <form onSubmit={handleCreateMember} className="grid md:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Nome completo</label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="Nome do membro"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">E-mail</label>
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={e => setNewEmail(e.target.value)}
                                            placeholder="email@exemplo.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            disabled={newMemberLoading}
                                            className="w-full py-3 bg-accent-gold text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {newMemberLoading ? <span className="material-symbols-outlined animate-spin text-base">autorenew</span> : <span className="material-symbols-outlined text-base">send</span>}
                                            {newMemberLoading ? 'Criando...' : 'Criar e Enviar Acesso'}
                                        </button>
                                    </div>
                                    {newMemberError && <p className="md:col-span-3 text-red-400 text-xs font-bold">{newMemberError}</p>}
                                    {newMemberMsg && <p className="md:col-span-3 text-green-400 text-xs font-bold">{newMemberMsg}</p>}
                                </form>
                            )}
                        </div>

                        {/* Lista de membros */}
                        {resendMsg && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl text-sm font-bold">{resendMsg}</div>
                        )}
                        <div className="overflow-x-auto bg-[#050505] border border-white/5 rounded-2xl shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 bg-white/[0.02]">
                                        <th className="p-5">Membro</th>
                                        <th className="p-5 hidden md:table-cell">Entrada</th>
                                        <th className="p-5 hidden lg:table-cell">Último login</th>
                                        <th className="p-5">Status</th>
                                        <th className="p-5 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-white/40 text-sm">Nenhum membro cadastrado ainda.</td>
                                        </tr>
                                    ) : members.map(member => (
                                        <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="p-5">
                                                <div className="font-bold text-sm">{member.name || '—'}</div>
                                                <div className="text-xs text-white/50 mt-0.5">{member.email}</div>
                                            </td>
                                            <td className="p-5 hidden md:table-cell text-xs text-white/50">
                                                {member.access_granted_at ? new Date(member.access_granted_at).toLocaleDateString('pt-BR') : '—'}
                                            </td>
                                            <td className="p-5 hidden lg:table-cell text-xs text-white/50">
                                                {member.last_login_at ? new Date(member.last_login_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.1em] w-fit ${member.has_access ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
                                                        <span className="material-symbols-outlined text-xs">{member.has_access ? 'check_circle' : 'cancel'}</span>
                                                        {member.has_access ? 'Ativo' : 'Revogado'}
                                                    </span>
                                                    {!member.activated && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.1em] w-fit bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                                                            <span className="material-symbols-outlined text-xs">schedule</span>
                                                            Pendente ativação
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleResend(member)}
                                                        disabled={resendLoadingId === member.id}
                                                        title="Reenviar email de ativação"
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded transition-all flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {resendLoadingId === member.id ? (
                                                            <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-sm">mail</span>
                                                        )}
                                                        Reenviar
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleAccess(member)}
                                                        disabled={toggleLoadingId === member.id}
                                                        className={`px-3 py-1.5 border text-[10px] font-black uppercase tracking-[0.1em] rounded transition-all flex items-center gap-1 disabled:opacity-50 ${member.has_access ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/25 text-red-400' : 'bg-green-500/10 hover:bg-green-500/20 border-green-500/25 text-green-400'}`}
                                                    >
                                                        {toggleLoadingId === member.id ? (
                                                            <span className="material-symbols-outlined animate-spin text-sm">autorenew</span>
                                                        ) : (
                                                            <span className="material-symbols-outlined text-sm">{member.has_access ? 'block' : 'check_circle'}</span>
                                                        )}
                                                        {member.has_access ? 'Revogar' : 'Restaurar'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ====== TAB: CONTATO ====== */}
                {leadType === 'contact' && (
                    <div className="overflow-x-auto bg-[#050505] border border-white/5 rounded-2xl shadow-2xl animate-in fade-in">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 bg-white/[0.02]">
                                    <th className="p-5">Data</th>
                                    <th className="p-5">Nome</th>
                                    <th className="p-5">Contato</th>
                                    <th className="p-5">Serviço</th>
                                    <th className="p-5">Mensagem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contactLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-white/40 text-sm">Nenhuma mensagem de contato recebida.</td>
                                    </tr>
                                ) : contactLeads.map(lead => (
                                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-5 text-xs text-white/60">
                                            {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="p-5 font-bold">{lead.name}</td>
                                        <td className="p-5">
                                            <div className="text-sm text-white/80">{lead.email}</div>
                                            <div className="text-[10px] text-accent-gold mt-1">{lead.whatsapp}</div>
                                        </td>
                                        <td className="p-5">
                                            <span className="px-3 py-1 rounded text-[10px] font-black bg-white/5 text-white/70 border border-white/10 uppercase tracking-[0.1em]">
                                                {lead.service || '—'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-sm text-white/60 max-w-xs truncate">{lead.message || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ====== TAB: INTERNACIONALIZAÇÃO ====== */}
                {leadType === 'priority' && (
                    <div className="overflow-x-auto bg-[#050505] border border-white/5 rounded-2xl shadow-2xl animate-in fade-in">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 bg-white/[0.02]">
                                    <th className="p-5">Data</th>
                                    <th className="p-5">Nome</th>
                                    <th className="p-5">E-mail</th>
                                    <th className="p-5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {priorityLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-white/40 text-sm">Nenhum lead encontrado nesta lista.</td>
                                    </tr>
                                ) : priorityLeads.map(lead => (
                                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="p-5 text-xs text-white/60">
                                            {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="p-5 font-bold">{lead.name}</td>
                                        <td className="p-5">
                                            <div className="text-sm text-white/80">{lead.email}</div>
                                            <div className="text-[10px] text-accent-gold mt-1">{lead.whatsapp}</div>
                                        </td>
                                        <td className="p-5 text-right">
                                            <span className="px-3 py-1 rounded text-[10px] font-black bg-accent-gold/10 text-accent-gold border border-accent-gold/20 uppercase tracking-[0.2em]">
                                                Aguardando
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ====== TAB: DIAGNÓSTICO ====== */}
                {leadType === 'quiz' && (
                    view === 'table' ? (
                        <div className="overflow-x-auto bg-[#050505] border border-white/5 rounded-2xl shadow-2xl animate-in fade-in">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 bg-white/[0.02]">
                                        <th className="p-5">Data</th>
                                        <th className="p-5">Nome</th>
                                        <th className="p-5">Contato</th>
                                        <th className="p-5 shrink-0">Score</th>
                                        <th className="p-5 text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-white/40 text-sm">Nenhum lead encontrado no diagnóstico.</td>
                                        </tr>
                                    ) : quizLeads.map(lead => (
                                        <tr key={lead.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                            <td className="p-5 text-xs text-white/60">
                                                {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                            </td>
                                            <td className="p-5 font-bold">{lead.name}</td>
                                            <td className="p-5">
                                                <div className="text-xs text-white/80">{lead.email}</div>
                                                <div className="text-[10px] text-accent-gold mt-1">{lead.whatsapp}</div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-[0.1em] ${lead.score >= 20 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : lead.score >= 12 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                                    {lead.score} PTS
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => setSelectedLead(lead)}
                                                    className="px-4 py-2 bg-white/5 hover:bg-accent-gold border border-white/10 hover:border-accent-gold text-white hover:text-black text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded"
                                                >
                                                    Respostas
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                            {['Quente (20+)', 'Morno (12-19)', 'Frio (<12)'].map((col, idx) => (
                                <div key={col} className="bg-[#050505] border border-white/5 rounded-2xl flex flex-col h-[70vh]">
                                    <div className="p-4 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 flex items-center justify-between">
                                        {col}
                                        <span className="bg-white/10 px-2 py-0.5 rounded text-white">{
                                            quizLeads.filter(l =>
                                                idx === 0 ? l.score >= 20 :
                                                    idx === 1 ? (l.score >= 12 && l.score < 20) :
                                                        l.score < 12
                                            ).length
                                        }</span>
                                    </div>
                                    <div className="p-4 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                        {quizLeads.filter(l =>
                                            idx === 0 ? l.score >= 20 :
                                                idx === 1 ? (l.score >= 12 && l.score < 20) :
                                                    l.score < 12
                                        ).map(lead => (
                                            <div key={lead.id} onClick={() => setSelectedLead(lead)} className="bg-[#080808] border border-white/10 p-5 rounded-xl cursor-pointer hover:border-accent-gold/50 hover:-translate-y-1 transition-all shadow-lg group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="font-bold text-sm truncate">{lead.name}</h4>
                                                    <span className="text-[10px] text-accent-gold/50 shrink-0">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                                                </div>
                                                <div className="text-[11px] text-white/40 truncate">{lead.email}</div>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Score: <span className={lead.score >= 20 ? 'text-green-500' : lead.score >= 12 ? 'text-yellow-500' : 'text-red-500'}>{lead.score}</span></span>
                                                    <span className="material-symbols-outlined text-sm text-white/20 group-hover:text-accent-gold transition-colors">arrow_forward</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>

            {/* Lead Details Modal */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#050505] w-full max-w-3xl max-h-[90vh] border border-white/10 rounded-2xl md:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
                        <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
                            <div>
                                <span className="inline-block px-3 py-1 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-4">
                                    Detalhes do Lead
                                </span>
                                <h3 className="text-2xl md:text-3xl font-black">{selectedLead.name}</h3>
                                <div className="flex gap-4 mt-2 text-sm text-white/60">
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">mail</span> {selectedLead.email}</span>
                                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">call</span> {selectedLead.whatsapp}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 md:p-8 overflow-y-auto space-y-6">
                            <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1">Score Total do Quiz</div>
                                    <div className="text-3xl font-black text-accent-gold">{selectedLead.score} Pontos</div>
                                </div>
                                <div className="text-right text-xs text-white/50 max-w-xs">
                                    {selectedLead.score >= 20 ? 'Perfil altamente compatível com o roadmap de internacionalização.' :
                                        selectedLead.score >= 12 ? 'Perfil mediano. Necessita alinhamento sobre expectativas.' :
                                            'Perfil de alto risco/imaturidade para o momento atual.'}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 border-b border-white/10 pb-2">Respostas do Questionário</h4>
                                <div className="grid gap-3">
                                    {Object.entries(selectedLead.answers).map(([qId, points], i) => {
                                        const questionIndex = parseInt(qId);
                                        const question = QUESTIONS[questionIndex];
                                        const selectedOption = question?.options.find(opt => opt.points === points);
                                        return (
                                            <div key={qId} className="flex items-start gap-4 p-4 border border-white/5 rounded-lg bg-black/30">
                                                <div className="w-8 h-8 rounded shrink-0 bg-white/5 flex items-center justify-center text-xs font-bold text-white/50 mt-1">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-white/90 mb-2 leading-relaxed">
                                                        {question ? question.title : `Pergunta #${questionIndex + 1} respondida`}
                                                    </div>
                                                    <div className="text-xs text-white/60 mb-3 leading-relaxed bg-white/5 p-3 rounded border border-white/5">
                                                        {selectedOption ? selectedOption.text : 'Resposta não encontrada'}
                                                    </div>
                                                    <div className="text-[10px] text-accent-gold font-bold bg-accent-gold/10 inline-block px-2 py-1 rounded uppercase tracking-wider">Score obtido: {String(points)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
