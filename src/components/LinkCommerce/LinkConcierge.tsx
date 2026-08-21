import { useState, useEffect, useRef } from 'react';
import CountryPhoneInput from '../CountryPhoneInput';

interface LinkConciergeProps {
    onTrack?: (elementId: string) => void;
    onOpenSchedule?: () => void;
    onOpenDiagnostic?: () => void;
}

interface Message {
    id: string;
    sender: 'bot' | 'user';
    text: string;
    options?: { text: string; nextStep: string }[];
}

const FLOW: Record<string, { text: string; options?: { text: string; nextStep: string }[]; action?: string }> = {
    start: {
        text: 'Olá! Sou o Concierge de IA do Marinho. Meu objetivo é entender seu momento para te indicar o direcionamento ideal. Qual é o seu principal foco hoje?',
        options: [
            { text: 'Sou empresário e busco Consultoria/Conselho', nextStep: 'consultoria_empresarial' },
            { text: 'Quero investir em uma franquia com segurança', nextStep: 'investir' },
            { text: 'Quero expandir ou estruturar minha marca', nextStep: 'expandir' },
            { text: 'Quero internacionalizar meu negócio', nextStep: 'internacionalizar' },
            { text: 'Quero tirar dúvidas ou agendar reunião', nextStep: 'duvidas' }
        ]
    },
    consultoria_empresarial: {
        text: 'Com quase 40 anos de experiência empresarial, Marinho ajuda empresários através de Consultoria Estratégica a organizar os seus negócios, melhorar a gestão e aplicar métodos práticos para crescer com sustentabilidade.',
        options: [
            { text: 'Conhecer a Consultoria Estratégica', nextStep: 'action_consultoria' },
            { text: 'Agendar conversa direta com Marinho', nextStep: 'action_schedule' }
        ]
    },
    investir: {
        text: 'Excelente decisão. O franchising é um modelo poderoso, mas exige validação rigorosa. Você já tem experiência prévia gerindo empresas ou negócios?',
        options: [
            { text: 'Sim, já fui empresário/gestor', nextStep: 'investir_experiente' },
            { text: 'Não, seria meu primeiro negócio próprio', nextStep: 'investir_iniciante' }
        ]
    },
    investir_iniciante: {
        text: 'Entendido. Para quem está começando, o maior perigo é a empolgação cega. O método mais seguro é avaliar seu perfil e planejar a reserva financeira.',
        options: [
            { text: 'Quero fazer um Diagnóstico de Perfil', nextStep: 'action_diagnostic' },
            { text: 'Quero conhecer o Ebook Dossiê', nextStep: 'action_dossie' }
        ]
    },
    investir_experiente: {
        text: 'Ótimo. Para experientes, o foco deve ser a análise da Circular de Oferta (COF) e validação dos números fornecidos pela franqueadora com franqueados ativos.',
        options: [
            { text: 'Quero agendar uma conversa estratégica', nextStep: 'action_schedule' },
            { text: 'Quero o Dossiê para analisar COFs', nextStep: 'action_dossie' }
        ]
    },
    expandir: {
        text: 'Para expandir no franchising, você precisa de formatação de processos clara, governança e marketing robusto para atrair os franqueados certos.',
        options: [
            { text: 'Quero agendar uma reunião de Expansão', nextStep: 'action_schedule' }
        ]
    },
    internacionalizar: {
        text: 'A internacionalização envolve desafios jurídicos, cambiais e operacionais complexos (Mercado Americano ou Europeu). Onde você planeja expandir?',
        options: [
            { text: 'Mercado Americano (EUA)', nextStep: 'internacional_eua' },
            { text: 'Europa / Portugal', nextStep: 'internacional_europa' }
        ]
    },
    internacional_eua: {
        text: 'Os EUA oferecem escala incrível, mas a regulação de franchising varia por estado. Marinho Ponci formata e apoia operações na Flórida há mais de uma década.',
        options: [
            { text: 'Falar com Marinho sobre os EUA', nextStep: 'action_schedule' }
        ]
    },
    internacional_europa: {
        text: 'Europa/Portugal é a porta de entrada lógica pela facilidade de língua e tratados bilaterais. Exige adequação fiscal detalhada.',
        options: [
            { text: 'Conversar sobre expansão para Europa', nextStep: 'action_schedule' }
        ]
    },
    duvidas: {
        text: 'Perfeito. Se você já sabe exatamente o que precisa, podemos agendar diretamente um horário na agenda para alinharmos.',
        options: [
            { text: 'Acessar agenda de compromissos', nextStep: 'action_schedule' },
            { text: 'Falar no WhatsApp corporativo', nextStep: 'action_whatsapp' }
        ]
    }
};

export default function LinkConcierge({ onTrack, onOpenSchedule, onOpenDiagnostic }: LinkConciergeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    
    // Captura de Lead no Chat
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadActionType, setLeadActionType] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                {
                    id: 'msg_start',
                    sender: 'bot',
                    text: FLOW.start.text,
                    options: FLOW.start.options
                }
            ]);
            onTrack?.('concierge_open');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showLeadForm]);

    const handleOptionSelect = (optionText: string, nextStep: string) => {
        onTrack?.(`concierge_select_${nextStep}`);
        
        // Add user message
        const userMsg: Message = {
            id: `msg_user_${Date.now()}`,
            sender: 'user',
            text: optionText
        };

        setMessages(prev => [...prev, userMsg]);

        // Process bot reply with delay
        setTimeout(() => {
            if (nextStep.startsWith('action_')) {
                handleActionStep(nextStep);
            } else {
                const stepData = FLOW[nextStep];
                if (stepData) {
                    const botMsg: Message = {
                        id: `msg_bot_${Date.now()}`,
                        sender: 'bot',
                        text: stepData.text,
                        options: stepData.options
                    };
                    setMessages(prev => [...prev, botMsg]);
                }
            }
        }, 600);
    };

    const handleActionStep = (action: string) => {
        setLeadActionType(action);
        setShowLeadForm(true);
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        onTrack?.(`concierge_lead_submit_${leadActionType}`);

        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API}/api/link/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    whatsapp: phone,
                    journey_type: 'concierge',
                    source: `concierge_${leadActionType}`,
                    concierge_path: messages.map(m => ({ sender: m.sender, text: m.text }))
                })
            });

            if (!res.ok) {
                throw new Error(`Erro no servidor (HTTP ${res.status}). Por favor, aguarde o deploy ou tente novamente.`);
            }

            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success) {
                    setSubmitting(false);
                    setShowLeadForm(false);

                    // Success reply
                    const successMsg: Message = {
                        id: `msg_success_${Date.now()}`,
                        sender: 'bot',
                        text: 'Excelente! Registrei seus dados de contato. Agora clique no botão abaixo para concluir sua ação:'
                    };
                    setMessages(prev => [...prev, successMsg]);

                    // Action routing helper
                    executeAction(leadActionType);
                } else {
                    throw new Error(data.error || 'Não foi possível registrar seu contato.');
                }
            } else {
                throw new Error('Resposta inesperada do servidor. O backend pode estar desatualizado.');
            }
        } catch (error: any) {
            console.error('Concierge lead submission failed:', error);
            setSubmitError(error.message || 'Erro de conexão. Verifique sua conexão e tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const executeAction = (action: string) => {
        setIsOpen(false);
        if (action === 'action_schedule') {
            onOpenSchedule?.();
        } else if (action === 'action_diagnostic') {
            onOpenDiagnostic?.();
        } else if (action === 'action_consultoria' || action === 'action_mentoria') {
            window.location.href = '/empresarial';
        } else if (action === 'action_dossie') {
            window.open('/ebook', '_blank');
        } else if (action === 'action_whatsapp') {
            window.open('https://wa.me/5511999999999', '_blank'); // Substituir pelo oficial
        }
    };

    return (
        <>
            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-accent-gold text-black rounded-full shadow-[0_4px_20px_rgba(225,169,96,0.4)] hover:shadow-[0_4px_30px_rgba(225,169,96,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center z-40 border border-black/10"
                aria-label="Falar com o Concierge"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742h.01m4.62 0h.01M9 16.5h6m-12.75 0h19.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border border-black" />
            </button>

            {/* Chat Drawer/Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsOpen(false)} />

                    {/* Chat Window */}
                    <div className="relative w-full max-w-[420px] h-[100dvh] sm:h-[600px] bg-[#0a0a0a] border border-white/10 rounded-none sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-slide-up-spring">
                        {/* Header */}
                        <div className="p-4 pt-[calc(env(safe-area-inset-top)+1rem)] sm:pt-4 border-b border-white/10 bg-black flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-accent-gold/15 flex items-center justify-center text-accent-gold">
                                    🤖
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                                        IA Concierge
                                    </h4>
                                    <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online e Pronto
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                                >
                                    <div 
                                        className={`
                                            max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed
                                            ${msg.sender === 'user'
                                                ? 'bg-accent-gold text-black font-semibold rounded-tr-none shadow-[0_2px_8px_rgba(225,169,96,0.15)]'
                                                : 'bg-white/[0.03] border border-white/5 text-white/80 rounded-tl-none'
                                            }
                                        `}
                                    >
                                        {msg.text}

                                        {/* Bot choices */}
                                        {msg.sender === 'bot' && msg.options && (
                                            <div className="mt-4.5 space-y-2">
                                                {msg.options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleOptionSelect(opt.text, opt.nextStep)}
                                                        className="w-full text-left p-3 rounded-xl border border-accent-gold/25 bg-accent-gold/5 text-accent-gold hover:bg-accent-gold hover:text-black font-semibold transition-all duration-200"
                                                    >
                                                        {opt.text}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Lead Form Inside Chat */}
                            {showLeadForm && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3 animate-fade-in-up">
                                    <h5 className="text-[11px] font-bold text-accent-gold uppercase tracking-wider text-center">
                                        Desbloquear recomendação
                                    </h5>
                                    <form onSubmit={handleLeadSubmit} className="space-y-3">
                                        <input 
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            placeholder="Seu nome"
                                            className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white rounded-xl focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                                        />
                                        <input 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Seu e-mail corporativo"
                                            className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs text-white rounded-xl focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                                        />
                                        <CountryPhoneInput 
                                            value={phone}
                                            onChange={setPhone}
                                            required
                                            label=""
                                        />
                                        {submitError && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-xl text-[10px] text-center font-semibold leading-relaxed">
                                                {submitError}
                                            </div>
                                        )}
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-3 bg-accent-gold text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-white transition-colors"
                                        >
                                            {submitting ? 'Aguarde...' : 'Ver recomendação final'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div ref={chatEndRef} className="h-[calc(env(safe-area-inset-bottom)+1rem)] sm:h-4" />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
