import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUESTIONS } from '../components/FranchiseQuizModal';

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

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [leadType, setLeadType] = useState<'quiz' | 'priority'>('quiz');
    const [view, setView] = useState<'table' | 'kanban'>('table');
    const [quizLeads, setQuizLeads] = useState<QuizLead[]>([]);
    const [priorityLeads, setPriorityLeads] = useState<PriorityLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedLead, setSelectedLead] = useState<QuizLead | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('crm_admin_token');
        if (!token) {
            navigate('/admin');
            return;
        }

        const fetchLeads = async () => {
            try {
                const [quizRes, priorityRes] = await Promise.all([
                    fetch('http://localhost:3001/api/leads/quiz', {
                        headers: { 'Authorization': `Basic ${token}` }
                    }),
                    fetch('http://localhost:3001/api/leads/priority', {
                        headers: { 'Authorization': `Basic ${token}` }
                    })
                ]);

                if (!quizRes.ok || !priorityRes.ok) throw new Error('Falha ao carregar dados');

                const quizData = await quizRes.json();
                const priorityData = await priorityRes.json();

                setQuizLeads(quizData);
                setPriorityLeads(priorityData);
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

        fetchLeads();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('crm_admin_token');
        navigate('/admin');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white/50">
                <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-accent-gold">autorenew</span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Carregando Módulo...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {/* Nav Header */}
            <header className="fixed top-0 w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5 z-40 px-6 py-4 flex items-center justify-between">
                <div>
                    <img src="/marinho final.png" alt="Marinho Ponci" className="h-10 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.15)]" />
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
                        <button
                            onClick={() => setView('table')}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all ${view === 'table' ? 'bg-accent-gold text-black shadow-glow-primary' : 'text-white/40 hover:text-white'}`}
                        >
                            Lista
                        </button>
                        {leadType === 'quiz' && (
                            <button
                                onClick={() => setView('kanban')}
                                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded transition-all ${view === 'kanban' ? 'bg-accent-gold text-black shadow-glow-primary' : 'text-white/40 hover:text-white'}`}
                            >
                                Kanban
                            </button>
                        )}
                    </div>
                    <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors flex items-center">
                        <span className="material-symbols-outlined text-xl">logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 px-6 pb-12 max-w-[1600px] mx-auto">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8">
                        {error}
                    </div>
                )}

                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">
                            {leadType === 'quiz' ? 'Leads: Diagnóstico' : 'Leads: Internacionalização'}
                        </h2>
                        <p className="text-white/40 text-sm">
                            {leadType === 'quiz' ? 'Respostas do questionário avançado' : 'Lista de espera VIP Internacional'}
                        </p>
                    </div>
                    <div className="flex bg-[#050505] p-1.5 rounded-xl border border-white/5 shadow-inner shrink-0">
                        <button
                            onClick={() => { setLeadType('quiz'); }}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${leadType === 'quiz' ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                        >
                            Diagnóstico ({quizLeads.length})
                        </button>
                        <button
                            onClick={() => { setLeadType('priority'); setView('table'); }}
                            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all ${leadType === 'priority' ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                        >
                            Internacionalizar ({priorityLeads.length})
                        </button>
                    </div>
                </div>

                {leadType === 'priority' ? (
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
                                ) : (
                                    priorityLeads.map(lead => (
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
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
                                    ) : (
                                        quizLeads.map(lead => (
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                            {/* Kanban Columns Based on Score */}
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
