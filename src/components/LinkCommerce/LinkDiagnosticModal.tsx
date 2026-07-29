import { useState, useEffect, useRef } from 'react';
import CountryPhoneInput from '../CountryPhoneInput';

const DIAGNOSTIC_QUESTIONS = [
    {
        id: 1,
        title: 'Qual é o seu objetivo principal ao procurar o Marinho hoje?',
        options: [
            { text: 'Sou empresário em Portugal e busco Consultoria Estratégica.', points: 3 },
            { text: 'Quero investir em uma franquia com segurança.', points: 2 },
            { text: 'Quero formatar e expandir minha marca (Dossiê Franqueador).', points: 3 },
        ],
    },
    {
        id: 2,
        title: 'Como você se relaciona com processos e regras de terceiros?',
        options: [
            { text: 'Prefiro ter liberdade para criar do meu jeito.', points: 1 },
            { text: 'Consigo seguir processos, mas gosto de questionar e adaptar.', points: 2 },
            { text: 'Busco um método testado. Prefiro executar com disciplina.', points: 3 },
        ],
    },
    {
        id: 3,
        title: 'Qual é a sua realidade financeira para o investimento?',
        options: [
            { text: 'Tenho a taxa de franquia, mas precisaria financiar o restante.', points: 1 },
            { text: 'Tenho o investimento inicial, mas a reserva pessoal é limitada.', points: 2 },
            { text: 'Tenho investimento + reserva para 6-12 meses sem retirada.', points: 3 },
        ],
    },
    {
        id: 4,
        title: 'Em que momento você está em relação à decisão?',
        options: [
            { text: 'Fase de curiosidade — quero entender melhor o mundo das franquias.', points: 1 },
            { text: 'Já pesquiso marcas, mas não sei como comparar com critério.', points: 2 },
            { text: 'Já tenho marcas em mente e quero analisar com profundidade.', points: 3 },
        ],
    },
    {
        id: 5,
        title: 'Sua família está ciente dos riscos envolvidos?',
        options: [
            { text: 'Ainda não conversei abertamente sobre isso.', points: 1 },
            { text: 'Já comentei a ideia, mas não tivemos conversa profunda.', points: 2 },
            { text: 'Família alinhada sobre riscos e plano B.', points: 3 },
        ],
    },
];

interface ResultTier {
    title: string;
    description: string;
    color: string;
    recommendation: string;
}

const RESULT_TIERS: Record<string, ResultTier> = {
    low: {
        title: 'Fase de Exploração',
        description: 'Você está no início da jornada. Antes de qualquer decisão, é fundamental construir uma base sólida de conhecimento.',
        color: '#e1a960',
        recommendation: 'Recomendo começar pelo Dossiê do Futuro Franqueado — ele vai te dar a clareza que você precisa.',
    },
    mid: {
        title: 'Fase de Preparação',
        description: 'Você já tem noção do caminho, mas precisa de orientação para tomar uma decisão segura.',
        color: '#78866a',
        recommendation: 'Uma conversa estratégica comigo pode ser o próximo passo ideal. Agende abaixo.',
    },
    high: {
        title: 'Pronto para Decidir',
        description: 'Você tem preparo financeiro e emocional. Falta a validação final com quem já viveu isso.',
        color: '#e1a960',
        recommendation: 'Agende uma call para revisarmos sua análise antes de assinar qualquer contrato.',
    },
};

function getResultTier(score: number): ResultTier {
    if (score <= 7) return RESULT_TIERS.low;
    if (score <= 11) return RESULT_TIERS.mid;
    return RESULT_TIERS.high;
}

interface LinkDiagnosticModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: () => void;
    onTrack?: (elementId: string) => void;
    onLeadCapture?: (data: {
        name: string;
        email: string;
        whatsapp: string;
        quiz_score: number;
        quiz_answers: Record<number, number>;
    }) => void;
}

type Phase = 'intro' | 'question' | 'lead' | 'result';

export default function LinkDiagnosticModal({
    isOpen,
    onClose,
    onSchedule,
    onTrack,
    onLeadCapture,
}: LinkDiagnosticModalProps) {
    const [phase, setPhase] = useState<Phase>('intro');
    const [qIndex, setQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [transitioning, setTransitioning] = useState(false);
    const [clickedIdx, setClickedIdx] = useState<number | null>(null);

    // Lead form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            setPhase('intro');
            setQIndex(0);
            setAnswers({});
            setClickedIdx(null);
            setName('');
            setEmail('');
            setPhone('');

            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            const scrollYStr = document.body.style.top;
            if (document.body.style.position === 'fixed') {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                if (scrollYStr) window.scrollTo(0, parseInt(scrollYStr || '0') * -1);
            }
        }
        return () => {
            if (document.body.style.position === 'fixed') {
                const scrollYStr = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                if (scrollYStr) window.scrollTo(0, parseInt(scrollYStr || '0') * -1);
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const question = DIAGNOSTIC_QUESTIONS[qIndex];
    const progress = ((qIndex + (phase === 'lead' || phase === 'result' ? 1 : 0)) / DIAGNOSTIC_QUESTIONS.length) * 100;
    const totalScore = Object.values(answers).reduce((sum, v) => sum + v, 0);

    const handleAnswer = (points: number, idx: number) => {
        if (transitioning) return;
        setClickedIdx(idx);
        const newAnswers = { ...answers, [qIndex]: points };
        setAnswers(newAnswers);
        setTransitioning(true);

        setTimeout(() => {
            if (qIndex + 1 >= DIAGNOSTIC_QUESTIONS.length) {
                setPhase('lead');
            } else {
                setQIndex(qIndex + 1);
            }
            setTransitioning(false);
            setClickedIdx(null);
        }, 350);
    };

    const handleSubmitLead = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        onTrack?.('diagnostic_lead_submit');

        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API}/api/link/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    whatsapp: phone,
                    journey_type: 'diagnostico',
                    source: 'cta_diagnostico',
                    quiz_score: totalScore,
                    quiz_answers: answers,
                }),
            });
            
            if (!res.ok) {
                throw new Error(`Erro no servidor (HTTP ${res.status}). Por favor, aguarde o deploy ou tente novamente.`);
            }

            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await res.json();
                if (data.success) {
                    onLeadCapture?.({ name, email, whatsapp: phone, quiz_score: totalScore, quiz_answers: answers });
                    setPhase('result');
                } else {
                    throw new Error(data.error || 'Não foi possível salvar seus dados de contato.');
                }
            } else {
                throw new Error('Resposta inesperada do servidor. O backend pode estar desatualizado.');
            }
        } catch (error: any) {
            console.error('Diagnostic lead submission failed:', error);
            setSubmitError(error.message || 'Erro de conexão. Verifique sua conexão e tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const tier = getResultTier(totalScore);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-[420px] max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-y-auto animate-slide-up-spring">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors z-10"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>

                {/* Progress bar */}
                {phase !== 'intro' && (
                    <div className="h-1 bg-white/5">
                        <div
                            className="h-full bg-accent-gold transition-all duration-500 ease-out"
                            style={{ width: `${phase === 'result' ? 100 : progress}%` }}
                        />
                    </div>
                )}

                <div className="p-6">
                    {/* INTRO */}
                    {phase === 'intro' && (
                        <div className="text-center py-6 animate-fade-in-up">
                            <div className="w-16 h-16 rounded-2xl bg-accent-gold/15 flex items-center justify-center mx-auto mb-5">
                                <svg className="w-8 h-8 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4" /><path d="M12 8h.01" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-black text-white mb-2">Diagnóstico Completo</h2>
                            <p className="text-sm text-white/50 mb-6 leading-relaxed">
                                5 perguntas rápidas para entender seu momento e te direcionar para o melhor próximo passo.
                            </p>
                            <button
                                onClick={() => { setPhase('question'); onTrack?.('diagnostic_start'); }}
                                className="w-full py-4 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-white transition-colors"
                            >
                                Iniciar Diagnóstico
                            </button>
                            <p className="text-[10px] text-white/25 mt-3">⏱ Menos de 2 minutos</p>
                        </div>
                    )}

                    {/* QUESTION */}
                    {phase === 'question' && question && (
                        <div className={`py-4 transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold/60 mb-4">
                                Pergunta {qIndex + 1} de {DIAGNOSTIC_QUESTIONS.length}
                            </p>
                            <h3 className="text-base font-bold text-white leading-snug mb-6">
                                {question.title}
                            </h3>
                            <div className="space-y-3">
                                {question.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(opt.points, idx)}
                                        disabled={transitioning}
                                        className={`
                                            w-full text-left p-4 rounded-xl border text-sm transition-all duration-200
                                            ${clickedIdx === idx
                                                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                                                : 'border-white/10 bg-white/[0.02] text-white/70 hover:border-white/20 hover:bg-white/[0.04]'
                                            }
                                        `}
                                    >
                                        {opt.text}
                                    </button>
                                ))}
                            </div>
                            {qIndex > 0 && (
                                <button
                                    onClick={() => {
                                        setTransitioning(true);
                                        setTimeout(() => { setQIndex(qIndex - 1); setTransitioning(false); }, 300);
                                    }}
                                    className="mt-4 text-xs text-white/30 hover:text-white/50 transition-colors"
                                >
                                    ← Voltar
                                </button>
                            )}
                        </div>
                    )}

                    {/* LEAD CAPTURE */}
                    {phase === 'lead' && (
                        <form onSubmit={handleSubmitLead} className="py-4 animate-fade-in-up">
                            <div className="w-12 h-12 rounded-xl bg-accent-gold/15 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-accent-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor" stroke="none" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-black text-white text-center mb-1">Diagnóstico Concluído!</h3>
                            <p className="text-sm text-white/45 text-center mb-6">
                                Deixe seus dados para ver o resultado personalizado.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Nome</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        placeholder="Seu nome"
                                        className="w-full bg-black border border-white/10 px-4 py-3.5 text-sm text-white rounded-xl focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="seu@email.com"
                                        className="w-full bg-black border border-white/10 px-4 py-3.5 text-sm text-white rounded-xl focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                                    />
                                </div>
                                <CountryPhoneInput value={phone} onChange={setPhone} required label="WhatsApp" />
                            </div>
                            {submitError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center font-semibold leading-relaxed">
                                    {submitError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full mt-6 py-4 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Processando...' : 'Ver Meu Resultado'}
                            </button>
                        </form>
                    )}

                    {/* RESULT */}
                    {phase === 'result' && (
                        <div className="py-4 animate-fade-in-up">
                            <div className="text-center mb-6">
                                <div
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.15em] mb-4"
                                    style={{ background: `${tier.color}20`, color: tier.color }}
                                >
                                    Score: {totalScore}/{DIAGNOSTIC_QUESTIONS.length * 3}
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">{tier.title}</h3>
                                <p className="text-sm text-white/50 leading-relaxed">{tier.description}</p>
                            </div>
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6">
                                <p className="text-sm text-white/70 leading-relaxed italic">
                                    "{tier.recommendation}"
                                </p>
                                <p className="text-[10px] text-accent-gold/60 font-bold uppercase tracking-widest mt-2">— Marinho Ponci</p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => { onClose(); window.location.href = '/empresarial'; }}
                                    className="w-full py-4 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-white transition-colors"
                                >
                                    Conhecer Consultoria em Portugal
                                </button>
                                <button
                                    onClick={() => { onClose(); onSchedule(); }}
                                    className="w-full py-3.5 bg-transparent border border-accent-gold/40 text-accent-gold text-xs font-bold uppercase tracking-[0.15em] rounded-xl hover:bg-accent-gold hover:text-black transition-all"
                                >
                                    Agendar Reunião no WhatsApp
                                </button>
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <button
                                        onClick={() => { onClose(); window.open('/ebook', '_blank'); }}
                                        className="py-2.5 bg-white/[0.03] border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:border-white/25 hover:text-white transition-all text-center"
                                    >
                                        Dossiê Franqueado
                                    </button>
                                    <button
                                        onClick={() => { onClose(); window.open('/franqueador', '_blank'); }}
                                        className="py-2.5 bg-white/[0.03] border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-wider rounded-lg hover:border-white/25 hover:text-white transition-all text-center"
                                    >
                                        Dossiê Franqueador
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
