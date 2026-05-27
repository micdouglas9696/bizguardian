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

interface Stats {
    total_campaigns: number;
    total_sent: number;
    total_failed: number;
    total_queued: number;
}

export default function AdminAutomacoes() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'campaigns' | 'templates' | 'new'>('campaigns');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    // New campaign form
    const [campaignName, setCampaignName] = useState('');
    const [campaignTemplate, setCampaignTemplate] = useState('');
    const [campaignSource, setCampaignSource] = useState('leads_quiz');
    const [csvRecipients, setCsvRecipients] = useState('');
    const [sourceMode, setSourceMode] = useState<'source' | 'csv'>('source');
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState('');

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
            setTemplates(await tplR.json());
            setCampaigns(await campR.json());
            setStats(await statR.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAll(); }, []);

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
        if (res.ok) {
            setEditingTemplate(null);
            loadAll();
        } else {
            alert('Erro ao salvar template');
        }
    };

    const launchCampaign = async () => {
        if (!campaignName || !campaignTemplate) {
            setFeedback('Preencha nome e template');
            return;
        }
        setSubmitting(true);
        setFeedback('');
        const body: any = { name: campaignName, template_slug: campaignTemplate };
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
        } catch (err: any) {
            setFeedback(`❌ ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black text-white flex items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight">🤖 Automações</h1>
                        <p className="text-white/50 text-sm mt-1">WhatsApp + e-mail automáticos · lead capture · recuperação · pós-venda</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/dashboard')}
                        className="text-white/60 hover:text-white text-sm uppercase tracking-widest"
                    >← Dashboard</button>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <Stat label="Campanhas" value={stats.total_campaigns} />
                        <Stat label="Enviadas" value={stats.total_sent} color="text-emerald-400" />
                        <Stat label="Falhas" value={stats.total_failed} color="text-red-400" />
                        <Stat label="Na fila" value={stats.total_queued} color="text-amber-400" />
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-white/10 mb-6">
                    <TabBtn active={tab === 'campaigns'} onClick={() => setTab('campaigns')}>Campanhas</TabBtn>
                    <TabBtn active={tab === 'new'} onClick={() => setTab('new')}>＋ Nova campanha</TabBtn>
                    <TabBtn active={tab === 'templates'} onClick={() => setTab('templates')}>Templates</TabBtn>
                </div>

                {/* CAMPAIGNS TAB */}
                {tab === 'campaigns' && (
                    <div className="space-y-2">
                        {campaigns.length === 0 && <p className="text-white/40 text-sm">Nenhuma campanha ainda.</p>}
                        {campaigns.map(c => (
                            <div key={c.id} className="bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                                <div>
                                    <div className="font-bold">{c.name}</div>
                                    <div className="text-xs text-white/50 mt-1">
                                        {c.kind} · template <code className="text-amber-300">{c.template_slug}</code> · {new Date(c.created_at).toLocaleString('pt-BR')}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm">
                                        <span className="text-emerald-400">{c.sent_count}</span> / {c.total_recipients}
                                        {c.fail_count > 0 && <span className="text-red-400 ml-2">({c.fail_count} falhas)</span>}
                                    </div>
                                    <div className={`text-xs uppercase tracking-wider mt-1 ${statusColor(c.status)}`}>{c.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* NEW CAMPAIGN TAB */}
                {tab === 'new' && (
                    <div className="bg-white/5 border border-white/10 p-6 max-w-2xl">
                        <h2 className="text-lg font-bold mb-4">Disparar nova campanha</h2>

                        <Field label="Nome da campanha">
                            <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)}
                                className="w-full bg-black border border-white/20 px-3 py-2 text-sm"
                                placeholder="Ex: Recuperação Black Friday" />
                        </Field>

                        <Field label="Template (WhatsApp)">
                            <select value={campaignTemplate} onChange={e => setCampaignTemplate(e.target.value)}
                                className="w-full bg-black border border-white/20 px-3 py-2 text-sm">
                                <option value="">— escolha —</option>
                                {templates.filter(t => t.channel === 'whatsapp' && t.is_active).map(t => (
                                    <option key={t.slug} value={t.slug}>{t.slug} — {t.description}</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Origem dos destinatários">
                            <div className="flex gap-4 mb-2 text-sm">
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={sourceMode === 'source'} onChange={() => setSourceMode('source')} />
                                    Lista existente
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={sourceMode === 'csv'} onChange={() => setSourceMode('csv')} />
                                    Colar lista (CSV)
                                </label>
                            </div>
                            {sourceMode === 'source' ? (
                                <select value={campaignSource} onChange={e => setCampaignSource(e.target.value)}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm">
                                    <option value="leads_quiz">Leads do quiz</option>
                                    <option value="leads_priority">Leads lista prioritária</option>
                                    <option value="leads_contact">Leads contato</option>
                                    <option value="ebook_customers">Compradores do ebook</option>
                                </select>
                            ) : (
                                <textarea value={csvRecipients} onChange={e => setCsvRecipients(e.target.value)}
                                    rows={6}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm font-mono"
                                    placeholder={'João,joao@x.com,+5511999999999\nMaria,maria@y.com,+5511988888888'} />
                            )}
                        </Field>

                        {feedback && (
                            <div className={`text-sm mb-4 ${feedback.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>{feedback}</div>
                        )}

                        <button onClick={launchCampaign} disabled={submitting}
                            className="bg-amber-400 text-black px-6 py-3 text-sm uppercase font-black tracking-wider disabled:opacity-50">
                            {submitting ? 'Disparando...' : '🚀 Disparar'}
                        </button>
                    </div>
                )}

                {/* TEMPLATES TAB */}
                {tab === 'templates' && (
                    <div className="space-y-2">
                        {templates.map(t => (
                            <div key={t.slug} className="bg-white/5 border border-white/10 p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <span className="text-xs uppercase tracking-widest text-amber-300">{t.channel}</span>
                                        <code className="ml-2 text-sm">{t.slug}</code>
                                        {!t.is_active && <span className="ml-2 text-xs text-red-400">[inativo]</span>}
                                    </div>
                                    <button onClick={() => setEditingTemplate(t)}
                                        className="text-xs uppercase tracking-wider text-amber-300 hover:text-amber-200">Editar</button>
                                </div>
                                <p className="text-xs text-white/50 mb-2">{t.description}</p>
                                <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono bg-black/30 p-2">{t.body}</pre>
                                {t.audio_url && <p className="text-xs text-amber-300 mt-2">🎤 Áudio: {t.audio_url}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {/* EDIT MODAL */}
                {editingTemplate && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50" onClick={() => setEditingTemplate(null)}>
                        <div className="bg-zinc-900 border border-white/20 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <h2 className="text-lg font-bold mb-4">Editar template: <code className="text-amber-300">{editingTemplate.slug}</code></h2>
                            <p className="text-xs text-white/50 mb-4">
                                Use <code>{'{{name}}'}</code>, <code>{'{{email}}'}</code>, <code>{'{{phone}}'}</code>, <code>{'{{link}}'}</code>, <code>{'{{product}}'}</code>, <code>{'{{amount}}'}</code>
                            </p>

                            {editingTemplate.channel === 'email' && (
                                <Field label="Assunto">
                                    <input type="text" value={editingTemplate.subject || ''}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                        className="w-full bg-black border border-white/20 px-3 py-2 text-sm" />
                                </Field>
                            )}

                            <Field label="Mensagem">
                                <textarea value={editingTemplate.body} rows={8}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm font-mono" />
                            </Field>

                            <Field label="URL de áudio (opcional, WhatsApp)">
                                <input type="text" value={editingTemplate.audio_url || ''}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, audio_url: e.target.value })}
                                    placeholder="https://...audio.ogg"
                                    className="w-full bg-black border border-white/20 px-3 py-2 text-sm" />
                            </Field>

                            <label className="flex items-center gap-2 text-sm mb-6">
                                <input type="checkbox" checked={editingTemplate.is_active}
                                    onChange={e => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })} />
                                Ativo
                            </label>

                            <div className="flex gap-2">
                                <button onClick={saveTemplate} className="bg-amber-400 text-black px-4 py-2 text-sm font-bold uppercase">Salvar</button>
                                <button onClick={() => setEditingTemplate(null)} className="border border-white/20 px-4 py-2 text-sm">Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
    return (
        <div className="bg-white/5 border border-white/10 p-4">
            <div className={`text-3xl font-black ${color || 'text-white'}`}>{value}</div>
            <div className="text-xs uppercase tracking-widest text-white/50 mt-1">{label}</div>
        </div>
    );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick}
            className={`px-4 py-2 text-sm uppercase tracking-wider ${active ? 'text-amber-300 border-b-2 border-amber-300' : 'text-white/50 hover:text-white'}`}>
            {children}
        </button>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="mb-4">
            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">{label}</label>
            {children}
        </div>
    );
}

function statusColor(status: string): string {
    switch (status) {
        case 'done': return 'text-emerald-400';
        case 'running': return 'text-amber-400';
        case 'failed': return 'text-red-400';
        default: return 'text-white/40';
    }
}
