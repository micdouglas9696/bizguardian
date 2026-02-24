import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    source: string;
    notes?: string;
    created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    new: { label: 'Novo', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    contacted: { label: 'Contatado', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    qualified: { label: 'Qualificado', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    converted: { label: 'Convertido', color: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30' },
    lost: { label: 'Perdido', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export default function FranchiseCRMPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [noteText, setNoteText] = useState('');

    // Load leads from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('franchise_leads');
        if (stored) {
            try {
                setLeads(JSON.parse(stored));
            } catch {
                setLeads([]);
            }
        }
    }, []);

    // Persist leads to localStorage
    const persistLeads = useCallback((updatedLeads: Lead[]) => {
        setLeads(updatedLeads);
        localStorage.setItem('franchise_leads', JSON.stringify(updatedLeads));
    }, []);

    // Filtered leads
    const filteredLeads = useMemo(() => {
        return leads
            .filter((l) => {
                if (statusFilter !== 'all' && l.status !== statusFilter) return false;
                if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    return l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q);
                }
                return true;
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [leads, searchQuery, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        return {
            total: leads.length,
            newToday: leads.filter((l) => new Date(l.created_at).toDateString() === today).length,
            contacted: leads.filter((l) => l.status === 'contacted').length,
            converted: leads.filter((l) => l.status === 'converted').length,
        };
    }, [leads]);

    const updateStatus = (leadId: string, newStatus: string) => {
        const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l));
        persistLeads(updated);
        if (selectedLead?.id === leadId) {
            setSelectedLead({ ...selectedLead, status: newStatus });
        }
    };

    const addNote = (leadId: string) => {
        if (!noteText.trim()) return;
        const updated = leads.map((l) =>
            l.id === leadId ? { ...l, notes: l.notes ? `${l.notes}\n---\n${noteText}` : noteText } : l
        );
        persistLeads(updated);
        if (selectedLead?.id === leadId) {
            setSelectedLead({
                ...selectedLead,
                notes: selectedLead.notes ? `${selectedLead.notes}\n---\n${noteText}` : noteText,
            });
        }
        setNoteText('');
    };

    const deleteLead = (leadId: string) => {
        const updated = leads.filter((l) => l.id !== leadId);
        persistLeads(updated);
        if (selectedLead?.id === leadId) setSelectedLead(null);
    };

    const exportCSV = () => {
        const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Fonte', 'Data de Cadastro', 'Notas'];
        const rows = leads.map((l) => [
            l.name,
            l.email,
            l.phone,
            STATUS_LABELS[l.status]?.label || l.status,
            l.source,
            new Date(l.created_at).toLocaleDateString('pt-BR'),
            (l.notes || '').replace(/\n/g, ' '),
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `franchise_leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const formatDateTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/franquia" className="group">
                            <img src="/LOGO FUNDO ESCURO.png" alt="Franchise-se" className="h-7 sm:h-8 w-auto object-contain" />
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hidden sm:inline">
                            / CRM Dashboard
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportCSV}
                            className="px-4 sm:px-6 py-2.5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:bg-white hover:text-black transition-all duration-500 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            <span className="hidden sm:inline">Exportar CSV</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="pt-20 pb-12">
                {/* Stats Bar */}
                <section className="px-4 sm:px-6 md:px-12 py-8">
                    <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { value: stats.total, label: 'Total Leads', icon: 'group', accent: false },
                            { value: stats.newToday, label: 'Novos Hoje', icon: 'person_add', accent: true },
                            { value: stats.contacted, label: 'Contatados', icon: 'phone_in_talk', accent: false },
                            { value: stats.converted, label: 'Convertidos', icon: 'verified', accent: true },
                        ].map((s, i) => (
                            <div key={i} className="bg-[#0a0a0a] border border-white/5 p-4 sm:p-6 text-center hover:border-white/10 transition-colors duration-500">
                                <span className="material-symbols-outlined text-accent-gold/40 text-xl mb-2 block">{s.icon}</span>
                                <span className={`text-2xl sm:text-3xl font-black block mb-1 ${s.accent ? 'text-accent-gold' : 'text-white'}`}>
                                    {s.value}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Filters */}
                <section className="px-4 sm:px-6 md:px-12 mb-6">
                    <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-lg">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nome, email ou telefone..."
                                className="w-full bg-[#0a0a0a] border border-white/10 pl-11 pr-5 py-3.5 text-sm text-white focus:outline-none focus:border-accent-gold/30 transition-all placeholder:text-white/20"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: 'Todos' },
                                { key: 'new', label: 'Novos' },
                                { key: 'contacted', label: 'Contatados' },
                                { key: 'qualified', label: 'Qualificados' },
                                { key: 'converted', label: 'Convertidos' },
                                { key: 'lost', label: 'Perdidos' },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setStatusFilter(f.key)}
                                    className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] border transition-all duration-300 ${statusFilter === f.key
                                            ? 'bg-accent-gold text-black border-accent-gold'
                                            : 'bg-[#0a0a0a] text-white/40 border-white/10 hover:border-white/20 hover:text-white/60'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Lead Table + Detail Panel */}
                <section className="px-4 sm:px-6 md:px-12">
                    <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-6">
                        {/* Table */}
                        <div className="flex-1 overflow-x-auto">
                            {filteredLeads.length === 0 ? (
                                <div className="bg-[#0a0a0a] border border-white/5 p-12 sm:p-16 text-center">
                                    <span className="material-symbols-outlined text-white/10 text-5xl mb-4 block">inbox</span>
                                    <p className="text-sm font-black uppercase tracking-wider text-white/20 mb-2">
                                        Nenhum lead encontrado
                                    </p>
                                    <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest">
                                        {leads.length === 0
                                            ? 'Os leads aparecerão aqui quando alguém se inscrever na página de vendas'
                                            : 'Tente ajustar os filtros de busca'}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-[#0a0a0a] border border-white/5 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="px-4 sm:px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Nome</th>
                                                <th className="px-4 sm:px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hidden md:table-cell">Email</th>
                                                <th className="px-4 sm:px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hidden lg:table-cell">Telefone</th>
                                                <th className="px-4 sm:px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Status</th>
                                                <th className="px-4 sm:px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hidden sm:table-cell">Data</th>
                                                <th className="px-4 sm:px-6 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLeads.map((lead) => (
                                                <tr
                                                    key={lead.id}
                                                    className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedLead?.id === lead.id ? 'bg-accent-gold/5' : ''}`}
                                                    onClick={() => {
                                                        setSelectedLead(lead);
                                                        setNoteText('');
                                                    }}
                                                >
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <span className="text-sm font-black text-white">{lead.name}</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                                        <span className="text-[11px] font-bold text-white/40">{lead.email}</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                                                        <span className="text-[11px] font-bold text-white/40">{lead.phone}</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${STATUS_LABELS[lead.status]?.color || 'text-white/40'}`}>
                                                            {STATUS_LABELS[lead.status]?.label || lead.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                                                        <span className="text-[10px] font-bold text-white/20">{formatDate(lead.created_at)}</span>
                                                    </td>
                                                    <td className="px-4 sm:px-6 py-4">
                                                        <span className="material-symbols-outlined text-white/10 text-sm">chevron_right</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Count */}
                                    <div className="px-4 sm:px-6 py-3 border-t border-white/5">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/15">
                                            {filteredLeads.length} de {leads.length} leads
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Detail Panel */}
                        {selectedLead && (
                            <div className="lg:w-[380px] bg-[#0a0a0a] border border-white/5 p-6 sm:p-8 flex-shrink-0">
                                <div className="flex items-start justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedLead.name}</h3>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                                            Desde {formatDateTime(selectedLead.created_at)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedLead(null)}
                                        className="text-white/20 hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-accent-gold/40 text-sm">mail</span>
                                        <a href={`mailto:${selectedLead.email}`} className="text-sm font-medium text-white/60 hover:text-accent-gold transition-colors">
                                            {selectedLead.email}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-accent-gold/40 text-sm">phone</span>
                                        <a href={`tel:${selectedLead.phone}`} className="text-sm font-medium text-white/60 hover:text-accent-gold transition-colors">
                                            {selectedLead.phone}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-accent-gold/40 text-sm">language</span>
                                        <span className="text-sm font-medium text-white/60">{selectedLead.source}</span>
                                    </div>
                                </div>

                                {/* Status Update */}
                                <div className="mb-8">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">
                                        Alterar Status
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
                                            <button
                                                key={key}
                                                onClick={() => updateStatus(selectedLead.id, key)}
                                                className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border transition-all duration-300 ${selectedLead.status === key
                                                        ? color
                                                        : 'bg-white/5 text-white/30 border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="mb-8">
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">
                                        Notas
                                    </label>
                                    {selectedLead.notes && (
                                        <div className="bg-black/50 border border-white/5 p-4 mb-3 max-h-32 overflow-y-auto">
                                            <p className="text-[11px] text-white/40 whitespace-pre-wrap leading-relaxed">{selectedLead.notes}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            placeholder="Adicionar nota..."
                                            className="flex-1 bg-black/50 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-gold/30 transition-all placeholder:text-white/20"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') addNote(selectedLead.id);
                                            }}
                                        />
                                        <button
                                            onClick={() => addNote(selectedLead.id)}
                                            className="px-4 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold hover:bg-accent-gold hover:text-black transition-all duration-300"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-col gap-2 pt-6 border-t border-white/5">
                                    <a
                                        href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-green-500/20 transition-all duration-300"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                        Enviar WhatsApp
                                    </a>
                                    <button
                                        onClick={() => {
                                            if (confirm('Tem certeza que deseja excluir este lead?')) {
                                                deleteLead(selectedLead.id);
                                            }
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all duration-300"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                        Excluir Lead
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
