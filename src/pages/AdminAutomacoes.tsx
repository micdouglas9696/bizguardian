import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Template {
    id: string;
    slug: string;
    channel: 'whatsapp' | 'email';
    subject: string | null;
    body: string;
    audio_url: string | null;
    is_active: boolean;
    description: string | null;
}

interface CampaignRun {
    id: string;
    template_slug: string;
    recipient_name: string;
    recipient_email: string;
    status: 'queued' | 'sent' | 'failed';
    sent_at: string | null;
    created_at: string;
}

interface Campaign {
    id: string;
    name: string;
    kind: string;
    template_slug: string;
    status: string;
    total_recipients: number;
    sent_count: number;
    fail_count: number;
    created_at: string;
}

interface Setting {
    key: string;
    value: string;
    description: string | null;
}

interface Stats {
    total_campaigns: number;
    total_sent: number;
    total_failed: number;
    total_queued: number;
}

type TabType = 'campaigns' | 'templates' | 'new' | 'settings';

export default function AdminAutomacoes() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<TabType>('campaigns');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [settings, setSettings] = useState<Setting[]>([]);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [newTpl, setNewTpl] = useState<{ slug: string; channel: string; subject: string; body: string; description: string } | null>(null);
    const [savingTpl, setSavingTpl] = useState(false);

    // Campanha
    const [campaignName, setCampaignName] = useState('');
    const [campaignTemplate, setCampaignTemplate] = useState('');
    const [campaignSource, setCampaignSource] = useState('leads_quiz');
    const [csvRecipients, setCsvRecipients] = useState('');
    const [sourceMode, setSourceMode] = useState<'source' | 'csv'>('source');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

    // Runs de campanha
    const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
    const [campaignRuns, setCampaignRuns] = useState<Record<string, CampaignRun[]>>({});
    const [loadingRuns, setLoadingRuns] = useState<string | null>(null);

    const token = (): string => {
        const t = localStorage.getItem('crm_admin_token');
        if (!t) { navigate('/admin'); return ''; }
        return t;
    };
    const authHeaders = () => ({ 'Authorization': `Basic ${token()}` });

    const loadAll = async () => {
        setLoading(true);
        try {
            const [tplR, campR, statR] = await Promise.all([
                fetch(`${API_URL}/api/admin/automacoes/templates`, { headers: authHeaders() }),
                fetch(`${API_URL}/api/admin/automacoes/campaigns`, { headers: authHeaders() }),
                fetch(`${API_URL}/api/admin/automacoes/stats`, { headers: authHeaders() }),
            ]);
            if (tplR.status === 401 || tplR.status === 403) {
                localStorage.removeItem('crm_admin_token');
                navigate('/admin');
                return;
            }
            const setR = await fetch(`${API_URL}/api/admin/automacoes/settings`, { headers: authHeaders() });
            setTemplates(await tplR.json());
            setCampaigns(await campR.json());
            setStats(await statR.json());
            setSettings(await setR.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

    const toggleCampaignRuns = async (campaignId: string) => {
        if (expandedCampaign === campaignId) { setExpandedCampaign(null); return; }
        setExpandedCampaign(campaignId);
        if (campaignRuns[campaignId]) return;
        setLoadingRuns(campaignId);
        try {
            const res = await fetch(`${API_URL}/api/admin/automacoes/campaigns/${campaignId}/runs`, { headers: authHeaders() });
            if (res.ok) {
                const data = await res.json();
                setCampaignRuns(prev => ({ ...prev, [campaignId]: data }));
            }
        } finally {
            setLoadingRuns(null);
        }
    };

    const createTemplate = async () => {
        if (!newTpl?.slug || !newTpl.channel || !newTpl.body) return;
        setSavingTpl(true);
        const res = await fetch(`${API_URL}/api/admin/automacoes/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify(newTpl),
        });
        setSavingTpl(false);
        if (res.ok) { setNewTpl(null); loadAll(); }
        else { const d = await res.json(); alert(d.error || 'Erro ao criar template'); }
    };

    const saveSetting = async (key: string, value: string) => {
        setSavingKey(key);
        await fetch(`${API_URL}/api/admin/automacoes/settings/${key}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ value }),
        });
        setSavingKey(null);
        loadAll();
    };

    const msToHuman = (ms: number): string => {
        if (ms < 60000) return `${Math.round(ms / 1000)}s`;
        if (ms < 3600000) return `${Math.round(ms / 60000)} min`;
        if (ms < 86400000) return `${Math.round(ms / 3600000)}h`;
        return `${Math.round(ms / 86400000)} dias`;
    };

    const saveTemplate = async () => {
        if (!editingTemplate) return;
        const res = await fetch(`${API_URL}/api/admin/automacoes/templates/${editingTemplate.slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({
                subject: editingTemplate.subject,
                body: editingTemplate.body,
                audio_url: editingTemplate.audio_url,
                is_active: editingTemplate.is_active,
                description: editingTemplate.description,
            }),
        });
        if (res.ok) { setEditingTemplate(null); loadAll(); }
        else alert('Erro ao salvar template');
    };

    const launchCampaign = async () => {
        if (!campaignName || !campaignTemplate) { setFeedback('Preencha nome e template'); return; }
        setSubmitting(true);
        setFeedback('');
        const body: Record<string, unknown> = { name: campaignName, template_slug: campaignTemplate };
        if (sourceMode === 'source') {
            body.source = campaignSource;
        } else {
            const lines = csvRecipients.split('\n').map(l => l.trim()).filter(Boolean);
            body.recipients = lines.map(l => {
                const [name, email, phone] = l.split(',').map(s => s?.trim());
                return { name, email, phone };
            });
        }
        try {
            const res = await fetch(`${API_URL}/api/admin/automacoes/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.ok) {
                setFeedback(`✅ Campanha disparada — ${data.queued} destinatários na fila`);
                setCampaignName('');
                setCsvRecipients('');
                loadAll();
            } else {
                setFeedback(`❌ ${data.error || 'erro'}`);
            }
        } catch (err: unknown) {
            setFeedback(`❌ ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const statusColor = (s: string) => {
        if (s === 'done') return 'text-green-400 bg-green-500/10 border-green-500/20';
        if (s === 'running') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        if (s === 'failed') return 'text-red-400 bg-red-500/10 border-red-500/20';
        return 'text-white/40 bg-white/5 border-white/10';
    };

    const runStatusColor = (s: string) => {
        if (s === 'sent') return 'bg-green-400';
        if (s === 'failed') return 'bg-red-400';
        return 'bg-amber-400 animate-pulse';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white/50">
                <span className="material-symbols-outlined animate-spin text-4xl mb-4 text-accent-gold">autorenew</span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Carregando Módulo...</p>
            </div>
        );
    }

    const tabs: { key: TabType; label: string; icon: string }[] = [
        { key: 'campaigns', label: 'Campanhas', icon: 'campaign' },
        { key: 'new', label: 'Nova Campanha', icon: 'add_circle' },
        { key: 'templates', label: 'Templates', icon: 'description' },
        { key: 'settings', label: 'Configurações', icon: 'settings' },
    ];

    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {/* Header */}
            <header className="fixed top-0 w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5 z-40 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                <div>
                    <img src="/marinho final.webp" alt="Marinho Ponci" className="h-8 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.15)]" />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-white/40 hover:text-white transition-colors flex items-center gap-1.5 text-xs uppercase tracking-widest"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                        <span className="hidden md:inline">Dashboard</span>
                    </button>
                </div>
            </header>

            <main className="pt-24 px-4 md:px-6 pb-12 max-w-[1400px] mx-auto w-full">

                {/* Título */}
                <div className="mb-8 md:mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-accent-gold text-3xl">smart_toy</span>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Automações</h1>
                    </div>
                    <p className="text-white/40 text-sm ml-10">WhatsApp + e-mail automáticos · captura de leads · recuperação · pós-venda</p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                        {[
                            { label: 'Campanhas', value: stats.total_campaigns, icon: 'campaign', color: 'text-white' },
                            { label: 'Enviadas', value: stats.total_sent, icon: 'check_circle', color: 'text-green-400' },
                            { label: 'Falhas', value: stats.total_failed, icon: 'error', color: 'text-red-400' },
                            { label: 'Na fila', value: stats.total_queued, icon: 'schedule', color: 'text-amber-400' },
                        ].map(s => (
                            <div key={s.label} className="bg-[#050505] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                                <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
                                <div>
                                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-0.5">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide bg-[#050505] p-1.5 rounded-xl border border-white/5 shadow-inner mb-6 w-full md:w-fit">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all whitespace-nowrap ${tab === t.key ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                        >
                            <span className="material-symbols-outlined text-sm">{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* ====== CAMPANHAS ====== */}
                {tab === 'campaigns' && (
                    <div className="space-y-2 animate-in fade-in">
                        {campaigns.length === 0 && (
                            <div className="bg-[#050505] border border-white/5 rounded-2xl p-12 text-center text-white/30 text-sm">
                                Nenhuma campanha disparada ainda.
                            </div>
                        )}
                        {campaigns.map(c => (
                            <div key={c.id} className="bg-[#050505] border border-white/5 rounded-2xl overflow-hidden">
                                <div
                                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                                    onClick={() => toggleCampaignRuns(c.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${expandedCampaign === c.id ? 'rotate-90' : ''} text-white/30`}>chevron_right</span>
                                        <div>
                                            <div className="font-bold text-sm">{c.name}</div>
                                            <div className="text-xs text-white/40 mt-0.5">
                                                {c.kind} · <code className="text-accent-gold/70">{c.template_slug}</code> · {new Date(c.created_at).toLocaleString('pt-BR')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4 flex items-center gap-3">
                                        <div>
                                            <div className="text-sm font-bold">
                                                <span className="text-green-400">{c.sent_count}</span>
                                                <span className="text-white/30"> / {c.total_recipients}</span>
                                                {c.fail_count > 0 && <span className="text-red-400 ml-1.5 text-xs">({c.fail_count} falhas)</span>}
                                            </div>
                                            <div className="flex justify-end mt-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.1em] border ${statusColor(c.status)}`}>
                                                    {c.status === 'running' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1" />}
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {expandedCampaign === c.id && (
                                    <div className="border-t border-white/5 p-5 bg-black/20">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">
                                            Execuções — {c.sent_count} de {c.total_recipients} enviadas
                                        </p>
                                        {loadingRuns === c.id ? (
                                            <div className="flex items-center gap-2 text-white/30 text-sm">
                                                <span className="material-symbols-outlined animate-spin text-base">autorenew</span>
                                                Carregando...
                                            </div>
                                        ) : (campaignRuns[c.id] || []).length === 0 ? (
                                            <p className="text-white/20 text-xs">Nenhuma execução registrada.</p>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {(campaignRuns[c.id] || []).map(run => (
                                                    <div key={run.id} className="flex items-center justify-between bg-white/[0.03] border border-white/5 px-4 py-2.5 rounded-xl text-xs">
                                                        <div className="flex items-center gap-3">
                                                            <span className={`w-2 h-2 rounded-full shrink-0 ${runStatusColor(run.status)}`} />
                                                            <div>
                                                                <span className="font-bold text-white/80">{run.recipient_name || run.recipient_email}</span>
                                                                <span className="text-white/30 ml-2">{run.recipient_email}</span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-4">
                                                            <code className="text-accent-gold/60 text-[10px]">{run.template_slug}</code>
                                                            <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${run.status === 'sent' ? 'text-green-400' : run.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                                                                {run.status === 'sent' && run.sent_at
                                                                    ? new Date(run.sent_at).toLocaleString('pt-BR')
                                                                    : run.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* ====== NOVA CAMPANHA ====== */}
                {tab === 'new' && (
                    <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 max-w-2xl animate-in fade-in">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-6">Disparar nova campanha</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Nome da campanha</label>
                                <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-accent-gold/50 transition-colors"
                                    placeholder="Ex: Recuperação Black Friday" />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Template (WhatsApp)</label>
                                <select value={campaignTemplate} onChange={e => setCampaignTemplate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors">
                                    <option value="">— escolha —</option>
                                    {templates.filter(t => t.channel === 'whatsapp' && t.is_active).map(t => (
                                        <option key={t.slug} value={t.slug}>{t.slug} — {t.description}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Origem dos destinatários</label>
                                <div className="flex gap-4 mb-3 text-sm">
                                    {[['source', 'Lista existente'], ['csv', 'Colar lista (CSV)']].map(([val, lbl]) => (
                                        <label key={val} className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" checked={sourceMode === val} onChange={() => setSourceMode(val as 'source' | 'csv')} className="accent-amber-400" />
                                            <span className="text-white/70">{lbl}</span>
                                        </label>
                                    ))}
                                </div>
                                {sourceMode === 'source' ? (
                                    <select value={campaignSource} onChange={e => setCampaignSource(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-gold/50 transition-colors">
                                        <option value="leads_quiz">Leads do quiz</option>
                                        <option value="leads_priority">Leads lista prioritária</option>
                                        <option value="leads_contact">Leads contato</option>
                                        <option value="ebook_customers">Compradores do ebook</option>
                                    </select>
                                ) : (
                                    <textarea value={csvRecipients} onChange={e => setCsvRecipients(e.target.value)}
                                        rows={5}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm font-mono focus:outline-none focus:border-accent-gold/50 transition-colors"
                                        placeholder={'João,joao@x.com,+5511999999999\nMaria,maria@y.com,+5511988888888'} />
                                )}
                            </div>

                            {feedback && (
                                <div className={`text-sm px-4 py-3 rounded-lg font-bold ${feedback.startsWith('✅') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                                    {feedback}
                                </div>
                            )}

                            <button onClick={launchCampaign} disabled={submitting}
                                className="flex items-center gap-2 px-6 py-3 bg-accent-gold text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
                                <span className="material-symbols-outlined text-base">{submitting ? 'autorenew' : 'rocket_launch'}</span>
                                {submitting ? 'Disparando...' : 'Disparar Campanha'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ====== TEMPLATES ====== */}
                {tab === 'templates' && (
                    <div className="animate-in fade-in">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setNewTpl({ slug: '', channel: 'whatsapp', subject: '', body: '', description: '' })}
                                className="flex items-center gap-2 px-4 py-2.5 bg-accent-gold text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all"
                            >
                                <span className="material-symbols-outlined text-base">add</span>
                                Novo Template
                            </button>
                        </div>
                        <div className="space-y-3">
                            {templates.map(t => (
                                <div key={t.slug} className="bg-[#050505] border border-white/5 rounded-2xl p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined text-lg ${t.channel === 'whatsapp' ? 'text-green-400' : 'text-blue-400'}`}>
                                                {t.channel === 'whatsapp' ? 'chat' : 'mail'}
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <code className="text-sm font-bold text-accent-gold">{t.slug}</code>
                                                    {!t.is_active && <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/10 text-red-400 border border-red-500/20 uppercase">inativo</span>}
                                                </div>
                                                <p className="text-xs text-white/40 mt-0.5">{t.description}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setEditingTemplate(t)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Editar
                                        </button>
                                    </div>
                                    <pre className="text-xs text-white/50 whitespace-pre-wrap font-mono bg-black/30 p-3 rounded-lg border border-white/5 max-h-32 overflow-y-auto">{t.body}</pre>
                                    {t.audio_url && <p className="text-xs text-accent-gold/70 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-sm">mic</span> {t.audio_url}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ====== CONFIGURAÇÕES ====== */}
                {tab === 'settings' && (
                    <div className="space-y-4 max-w-2xl animate-in fade-in">
                        {/* Delays */}
                        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-accent-gold mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">timer</span>
                                Delays de Recuperação
                            </h2>
                            <p className="text-xs text-white/30 mb-5">Tempo de espera antes de enviar cada mensagem (WhatsApp + email)</p>
                            {[
                                { key: 'recovery_5min_delay_ms', label: '1ª mensagem', hint: 'ex: 300000 = 5 min' },
                                { key: 'recovery_24h_delay_ms', label: '2ª mensagem', hint: 'ex: 86400000 = 24h' },
                                { key: 'recovery_7d_delay_ms', label: '3ª mensagem (cupom)', hint: 'ex: 604800000 = 7 dias' },
                            ].map(({ key, label, hint }) => {
                                const s = settings.find(x => x.key === key);
                                const ms = Number(s?.value || 0);
                                return (
                                    <div key={key} className="mb-4">
                                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{label}</label>
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="number"
                                                defaultValue={s?.value || ''}
                                                onBlur={e => saveSetting(key, e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white w-44 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                                placeholder={hint}
                                            />
                                            <span className="text-accent-gold text-sm font-bold">{ms > 0 ? `= ${msToHuman(ms)}` : ''}</span>
                                            {savingKey === key && <span className="text-white/30 text-xs">salvando...</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Canais */}
                        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-accent-gold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">cell_tower</span>
                                Canais Ativos
                            </h2>
                            {[
                                { key: 'n8n_recovery_enabled', label: 'Recovery via WhatsApp (n8n)', icon: 'chat' },
                                { key: 'email_recovery_enabled', label: 'Recovery via Email', icon: 'mail' },
                            ].map(({ key, label, icon }) => {
                                const s = settings.find(x => x.key === key);
                                const active = s?.value !== 'false';
                                return (
                                    <label key={key} className="flex items-center gap-3 mb-3 cursor-pointer group">
                                        <div className={`relative w-10 h-5 rounded-full transition-colors ${active ? 'bg-accent-gold' : 'bg-white/10'}`} onClick={() => saveSetting(key, active ? 'false' : 'true')}>
                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                        </div>
                                        <span className="material-symbols-outlined text-base text-white/40">{icon}</span>
                                        <span className="text-sm text-white/70">{label}</span>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${active ? 'text-green-400' : 'text-red-400'}`}>{active ? 'ativo' : 'inativo'}</span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Admin WhatsApp */}
                        <div className="bg-[#050505] border border-white/5 rounded-2xl p-6">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-accent-gold mb-1 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">phone_iphone</span>
                                WhatsApp do Admin
                            </h2>
                            <p className="text-xs text-white/30 mb-4">Número que recebe notificações de novo lead e nova venda</p>
                            {(() => {
                                const s = settings.find(x => x.key === 'admin_whatsapp');
                                return (
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="text"
                                            defaultValue={s?.value || ''}
                                            onBlur={e => saveSetting('admin_whatsapp', e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white w-56 focus:outline-none focus:border-accent-gold/50 transition-colors"
                                            placeholder="558196696184"
                                        />
                                        {savingKey === 'admin_whatsapp' && <span className="text-white/30 text-xs">salvando...</span>}
                                    </div>
                                );
                            })()}
                            <p className="text-xs text-white/20 mt-2">Formato: código país + DDD + número (ex: 558196696184)</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal novo template */}
            {newTpl && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setNewTpl(null)}>
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-1">Novo Template</h2>
                        <p className="text-xs text-white/40 mb-5">Use <code className="text-accent-gold">{'{{name}}'}</code>, <code className="text-accent-gold">{'{{email}}'}</code>, <code className="text-accent-gold">{'{{phone}}'}</code>, <code className="text-accent-gold">{'{{link}}'}</code></p>
                        {[
                            { label: 'Slug (identificador único)', field: 'slug', type: 'input', placeholder: 'ex: recovery_black_friday_wa' },
                        ].map(({ label, field, type, placeholder }) => (
                            <div key={field} className="mb-4">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">{label}</label>
                                {type === 'input' && <input type="text" value={(newTpl as Record<string, string>)[field]}
                                    onChange={e => setNewTpl({ ...newTpl, [field]: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                    placeholder={placeholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-accent-gold/50" />}
                            </div>
                        ))}
                        <div className="mb-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Canal</label>
                            <select value={newTpl.channel} onChange={e => setNewTpl({ ...newTpl, channel: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-gold/50">
                                <option value="whatsapp">WhatsApp</option>
                                <option value="email">Email</option>
                            </select>
                        </div>
                        {newTpl.channel === 'email' && (
                            <div className="mb-4">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Assunto</label>
                                <input type="text" value={newTpl.subject} onChange={e => setNewTpl({ ...newTpl, subject: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-gold/50" />
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Mensagem</label>
                            <textarea value={newTpl.body} rows={6} onChange={e => setNewTpl({ ...newTpl, body: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-accent-gold/50" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Descrição (opcional)</label>
                            <input type="text" value={newTpl.description} onChange={e => setNewTpl({ ...newTpl, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-gold/50" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={createTemplate} disabled={savingTpl}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-gold text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
                                <span className="material-symbols-outlined text-sm">{savingTpl ? 'autorenew' : 'save'}</span>
                                {savingTpl ? 'Salvando...' : 'Criar Template'}
                            </button>
                            <button onClick={() => setNewTpl(null)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal editar template */}
            {editingTemplate && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setEditingTemplate(null)}>
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4" onClick={e => e.stopPropagation()}>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-1">Editar template</h2>
                        <code className="text-accent-gold text-sm">{editingTemplate.slug}</code>
                        <p className="text-xs text-white/40 mt-2 mb-5">
                            Variáveis: <code className="text-accent-gold">{'{{name}}'}</code> <code className="text-accent-gold">{'{{email}}'}</code> <code className="text-accent-gold">{'{{phone}}'}</code> <code className="text-accent-gold">{'{{link}}'}</code> <code className="text-accent-gold">{'{{amount}}'}</code>
                        </p>
                        {editingTemplate.channel === 'email' && (
                            <div className="mb-4">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Assunto</label>
                                <input type="text" value={editingTemplate.subject || ''}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-gold/50" />
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Mensagem</label>
                            <textarea value={editingTemplate.body} rows={8}
                                onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-accent-gold/50" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">URL de áudio (opcional, WhatsApp)</label>
                            <input type="text" value={editingTemplate.audio_url || ''}
                                onChange={e => setEditingTemplate({ ...editingTemplate, audio_url: e.target.value })}
                                placeholder="https://...audio.ogg"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accent-gold/50" />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer mb-6">
                            <div className={`relative w-10 h-5 rounded-full transition-colors ${editingTemplate.is_active ? 'bg-accent-gold' : 'bg-white/10'}`}
                                onClick={() => setEditingTemplate({ ...editingTemplate, is_active: !editingTemplate.is_active })}>
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editingTemplate.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </div>
                            <span className="text-sm text-white/70">Template ativo</span>
                        </label>
                        <div className="flex gap-3">
                            <button onClick={saveTemplate}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-gold text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-lg hover:brightness-110 transition-all">
                                <span className="material-symbols-outlined text-sm">save</span>
                                Salvar
                            </button>
                            <button onClick={() => setEditingTemplate(null)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
