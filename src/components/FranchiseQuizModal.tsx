import { useState, useEffect } from 'react';

export interface Option {
    text: string;
    points: number;
}

export interface Question {
    id: number;
    title: string;
    options: Option[];
}

interface Statement {
    quote: string;
    author: string;
    buttonText: string;
}

export const QUESTIONS: Question[] = [
    {
        id: 1,
        title: "O que está te movendo a considerar uma franquia agora?",
        options: [
            { text: "Estou cansado do meu trabalho atual e quero mais liberdade e autonomia.", points: 1 },
            { text: "Quero construir um negócio próprio e a franquia me parece um modelo mais seguro do que começar do zero.", points: 2 },
            { text: "Tenho capital disponível, já estudei o modelo e quero entrar com o máximo de clareza sobre os riscos.", points: 3 },
        ]
    },
    {
        id: 2,
        title: "Como você se relaciona com processos, padrões e regras definidas por terceiros?",
        options: [
            { text: "Prefiro ter liberdade para criar e adaptar do meu jeito.", points: 1 },
            { text: "Consigo seguir processos, mas sinto necessidade de questionar e adaptar.", points: 2 },
            { text: "Busco justamente um método testado. Prefiro executar com disciplina do que reinventar a roda.", points: 3 },
        ]
    },
    {
        id: 3,
        title: "Nos primeiros 12 meses de operação, qual é a sua disponibilidade real para o negócio?",
        options: [
            { text: "Quero um modelo que rode com pouca presença minha no dia a dia.", points: 1 },
            { text: "Consigo dedicar algumas horas por dia, mas manterei outras atividades paralelas.", points: 2 },
            { text: "Estou disposto a dedicação integral no início, sabendo que é o preço da construção.", points: 3 },
        ]
    },
    {
        id: 4,
        title: "Considerando o investimento total (taxa, instalação, capital de giro e reserva pessoal), qual é a sua realidade financeira hoje?",
        options: [
            { text: "Tenho o valor da taxa de franquia, mas precisaria financiar o restante.", points: 1 },
            { text: "Tenho o investimento inicial, mas minha reserva pessoal para os primeiros meses é limitada.", points: 2 },
            { text: "Tenho o investimento total e uma reserva pessoal para manter minha família por 6 a 12 meses sem retirada do negócio.", points: 3 },
        ]
    },
    {
        id: 5,
        title: "Por quanto tempo sua família consegue se manter financeiramente sem nenhuma retirada da franquia?",
        options: [
            { text: "Até 3 meses.", points: 1 },
            { text: "Entre 3 e 6 meses.", points: 2 },
            { text: "6 meses ou mais.", points: 3 },
        ]
    },
    {
        id: 6,
        title: "Ao receber uma projeção financeira (DRE) de uma franqueadora, você se sente capaz de identificar se os custos estão subestimados ou se o cenário é otimista demais?",
        options: [
            { text: "Confio no que a franqueadora apresenta. Se a marca é grande, os números devem ser confiáveis.", points: 1 },
            { text: "Tenho uma noção básica, mas não sei como validar esses números com a realidade do mercado local.", points: 2 },
            { text: "Sei quais perguntas fazer para confrontar os números com franqueados reais e montar meus próprios cenários.", points: 3 },
        ]
    },
    {
        id: 7,
        title: "Como você pretende validar uma franquia antes de assinar qualquer contrato?",
        options: [
            { text: "Vou visitar as unidades que a própria franqueadora me indicar e confiar na apresentação deles.", points: 1 },
            { text: "Vou visitar algumas unidades por conta própria e pesquisar avaliações online.", points: 2 },
            { text: "Vou visitar unidades em diferentes estágios (novas e maduras) e buscar conversar também com ex-franqueados.", points: 3 },
        ]
    },
    {
        id: 8,
        title: "Você sabe o que é uma COF (Circular de Oferta de Franquia) e quais cláusulas merecem atenção especial antes de assinar?",
        options: [
            { text: "Não conheço esse documento em detalhes.", points: 1 },
            { text: "Já ouvi falar, mas não sei exatamente o que analisar.", points: 2 },
            { text: "Conheço a COF e entendo a importância de revisá-la com apoio jurídico especializado em franchising.", points: 3 },
        ]
    },
    {
        id: 9,
        title: "Sua família (cônjuge, filhos, dependentes) está ciente dos riscos reais envolvidos nessa decisão?",
        options: [
            { text: "Ainda não conversei abertamente sobre isso. Prefiro ter mais certeza antes de envolver a família.", points: 1 },
            { text: "Já comentei a ideia, mas ainda não tivemos uma conversa profunda sobre riscos e plano B.", points: 2 },
            { text: "Minha família já está alinhada sobre os riscos, o período de instabilidade inicial e o que faremos se o negócio demorar mais para dar retorno.", points: 3 },
        ]
    },
    {
        id: 10,
        title: "Como você reage emocionalmente quando um resultado demora mais do que o esperado?",
        options: [
            { text: "Fico muito ansioso e começo a questionar se tomei a decisão certa.", points: 1 },
            { text: "Sinto o peso, mas consigo me manter focado se tiver clareza sobre o que está acontecendo.", points: 2 },
            { text: "Entendo que negócios têm ciclos. Consigo tomar decisões com a cabeça fria mesmo sob pressão.", points: 3 },
        ]
    },
    {
        id: 11,
        title: "Em que momento você está hoje em relação à decisão de abrir uma franquia?",
        options: [
            { text: "Ainda estou na fase de curiosidade. Quero entender melhor o mundo das franquias antes de qualquer coisa.", points: 1 },
            { text: "Já estou pesquisando marcas e segmentos, mas ainda não sei como comparar e escolher com critério.", points: 2 },
            { text: "Já tenho marcas em mente e quero um método para analisar com profundidade antes de tomar a decisão final.", points: 3 },
        ]
    },
    {
        id: 12,
        title: "Qual frase representa melhor a sua visão sobre o risco de investir em uma franquia?",
        options: [
            { text: "\"A franquia já tem um modelo testado, então o risco é bem menor do que abrir um negócio do zero.\"", points: 1 },
            { text: "\"Sei que há riscos, mas ainda não tenho clareza sobre quais são os principais e como me preparar para eles.\"", points: 2 },
            { text: "\"Franquia reduz alguns riscos, mas não os elimina. Meu papel como franqueado é me preparar para gerenciar os riscos que permanecem.\"", points: 3 },
        ]
    }
];

const STATEMENTS: Record<number, Statement> = {
    3: {
        quote: "O mercado não reconhece empolgação, desejo ou oportunidade. O mercado responde a um bom preparo, boa execução e escolha consciente. Feeling é importante mas, na maioria das vezes, não paga conta.",
        author: "Marinho Ponci",
        buttonText: "Continuar para o Raio-X Financeiro"
    },
    6: {
        quote: "Entrar no franchising sem planejamento financeiro é como saltar de paraquedas confiando que alguém o dobrou para você, sem você checar o equipamento. Você tem o sonho de voar, mas a falta de preparo transforma a liberdade em queda livre.",
        author: "Marinho Ponci",
        buttonText: "Continuar para Investigação de Campo"
    },
    8: {
        quote: "Franquia é como uma Fórmula 1: você recebe um carro de alta performance, o suporte da escuderia e os melhores manuais para performar. Mas, se você não souber dirigir, frear na hora certa e respeitar as condições da corrida, é acidente na certa — e muitas vezes fatal.",
        author: "Marinho Ponci",
        buttonText: "Continuar para Alinhamento Familiar"
    },
    10: {
        quote: "Abrir uma franquia é uma decisão da família, mesmo que no contrato esteja só o seu CPF. É muito melhor ter conversas difíceis antes, do que tentar justificar decisões tomadas no impulso depois que o dinheiro já foi investido.",
        author: "Marinho Ponci",
        buttonText: "Finalizar Diagnóstico"
    }
};

interface FranchiseQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGoToForm: () => void;
}

type QuizPhase = 'start' | 'question' | 'statement' | 'lead' | 'result';

export default function FranchiseQuizModal({ isOpen, onClose, onGoToForm }: FranchiseQuizModalProps) {
    const [phase, setPhase] = useState<QuizPhase>('start');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});

    // Lead Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset when opened and handle body scroll lock
    useEffect(() => {
        if (isOpen) {
            setPhase('start');
            setCurrentQuestionIndex(0);
            setScore(0);
            setAnswers({});
            setName('');
            setEmail('');
            setPhone('');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            document.body.style.overflow = ''; // Restore scrolling
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const hasStatementNext = Boolean(STATEMENTS[currentQuestionIndex + 1]);

    const handleStart = () => {
        setPhase('question');
    };

    const handleAnswer = (points: number) => {
        setAnswers(prev => ({ ...prev, [currentQuestionIndex]: points }));

        // Go back up to next logically
        setTimeout(() => {
            if (currentQuestionIndex + 1 >= QUESTIONS.length) {
                setPhase('lead');
            } else if (hasStatementNext) {
                setPhase('statement');
            } else {
                setCurrentQuestionIndex(prev => prev + 1);
            }
        }, 300);
    };

    const handleContinueFromStatement = () => {
        if (currentQuestionIndex + 1 >= QUESTIONS.length) {
            setPhase('lead');
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setPhase('question');
        }
    };

    const handleLeadCapture = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Calculate total score
        const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
        setScore(totalScore);

        try {
            const response = await fetch('http://localhost:3001/api/leads/quiz', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    whatsapp: phone,
                    score: totalScore,
                    answers
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar formulário');
            }

            setPhase('result');
        } catch (error) {
            console.error('Erro:', error);
            alert('Houve um erro ao salvar o seu diagnóstico. Tente novamente mais tarde.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getOutcome = () => {
        if (score <= 18) {
            return {
                title: "Seu Nível: Visão Romântica",
                desc: "Seu diagnóstico indica que você ainda está na fase de encantamento com o modelo de franquias — e isso é completamente normal.\n\nO problema é que o mercado não espera pelo encantamento: ele cobra preparo. Antes de conversar com qualquer franqueadora, você precisa entender a realidade operacional, financeira e emocional de ser um franqueado.\n\nA Imersão Franchise-se foi criada exatamente para esse momento: abrir o jogo sobre o que ninguém te conta antes de você assinar um contrato.",
                btnText: "Quero participar da Imersão"
            };
        } else if (score <= 24) {
            return {
                title: "Seu Nível: Explorador Consciente",
                desc: "Você já entendeu que franquia não é atalho e que há riscos reais envolvidos. Isso já te coloca à frente da maioria.\n\nMas o seu diagnóstico mostra que ainda existem pontos cegos importantes — especialmente no campo financeiro — que pode custar caro na hora da decisão.\n\nA Imersão Franchise-se vai te dar as ferramentas práticas para transformar sua consciência em critério técnico de análise.",
                btnText: "Quero preencher meus pontos cegos"
            };
        } else if (score <= 30) {
            return {
                title: "Seu Nível: Analista em Campo",
                desc: "Seu nível de consciência está acima da média de quem chega ao mundo das franquias. Você já sabe que precisa investigar, questionar e planejar.\n\nO que o seu diagnóstico indica é que falta um método estruturado para transformar toda essa consciência em uma decisão técnica.\n\nNa Imersão Franchise-se, você vai encontrar o passo a passo que o Marinho usa há quase 4 décadas para avaliar franqueadoras e orientar franqueados a tomarem decisões com o máximo de clareza possível.",
                btnText: "Quero o método para transformar consciência em decisão"
            };
        } else {
            return {
                title: "Seu Nível: Decisor Informado",
                desc: "Você demonstra um nível de maturidade raro para quem está nessa jornada. Já entende os riscos, já sabe que precisa investigar a fundo e já tem clareza sobre sua realidade financeira e familiar.\n\nO que a Imersão Franchise-se pode te oferecer é um olhar de quem já viu centenas de casos — os que deram certo e os que deram errado — para que você tome sua decisão final com o máximo de informações e o mínimo de dúvidas possível.",
                btnText: "Quero o olhar de quem já viu tudo"
            };
        }
    };

    const outcome = getOutcome();

    return (
        <div className="fixed inset-0 z-[200] flex bg-[#030303] overflow-y-auto animate-in slide-in-from-bottom-[100%] fade-in duration-700 ease-out">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
                <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 hover:rotate-90 hover:scale-110 transition-all duration-300 shadow-glow-primary">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">close</span>
                </button>
            </div>

            <div className="w-full max-w-4xl mx-auto px-4 py-10 sm:px-8 relative min-h-screen flex flex-col">
                <div className="my-auto w-full pt-10 pb-4">

                    {phase === 'start' && (
                        <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
                            <span className="inline-block py-1 px-3 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.3em] uppercase mb-6 rounded-full">
                                Por Marinho Ponci
                            </span>
                            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                                Diagnóstico de Maturidade para <span className="text-accent-gold italic">Franchising</span>
                            </h2>
                            <p className="text-white/60 mb-6 font-medium text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
                                Antes de conversar com qualquer franqueadora, descubra em qual nível de consciência você realmente está.
                            </p>
                            <ul className="text-white/40 text-xs sm:text-sm text-left mx-auto max-w-sm mb-10 space-y-2 font-medium">
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-accent-gold text-lg">check_circle</span> São 12 perguntas essenciais.</li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-accent-gold text-lg">timer</span> Tempo estimado: 3 minutos.</li>
                                <li className="flex items-center gap-2"><span className="material-symbols-outlined text-accent-gold text-lg">psychology</span> Seja honesto — o mercado vai ser.</li>
                            </ul>
                            <button
                                onClick={handleStart}
                                className="w-full sm:w-auto px-10 py-5 bg-accent-gold text-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all duration-300 shadow-glow-primary rounded"
                            >
                                Começar Diagnóstico
                            </button>
                        </div>
                    )}

                    {phase === 'question' && (
                        <div key={currentQuestionIndex} className="animate-in slide-in-from-right-16 fade-in duration-500 ease-out">
                            <div className="flex flex-row items-center justify-between gap-4 mb-5 sm:mb-6">
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent-gold whitespace-nowrap">
                                    Pergunta {currentQuestion.id} <span className="text-white/30">/ {QUESTIONS.length}</span>
                                </span>
                                <div className="flex gap-1 sm:gap-1.5 h-1 flex-1 w-full max-w-[120px] sm:max-w-[200px]">
                                    {QUESTIONS.map((_, i) => (
                                        <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i <= currentQuestionIndex ? 'bg-accent-gold shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>

                            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-6 sm:mb-8 leading-[1.25] tracking-tight">
                                {currentQuestion.title}
                            </h3>

                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(option.points)}
                                        className="w-full text-left p-4 sm:p-5 rounded-none border-l-4 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-accent-gold transition-all duration-300 group flex items-start gap-4 hover:shadow-[0_0_30px_rgba(234,179,8,0.1)] hover:-translate-y-1"
                                    >
                                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-gold group-hover:border-accent-gold transition-colors duration-300 mt-0.5">
                                            <span className="text-white/50 group-hover:text-black font-black text-sm">
                                                {String.fromCharCode(65 + index)}
                                            </span>
                                        </div>
                                        <span className="text-sm sm:text-base font-medium text-white/70 group-hover:text-white pt-1">
                                            {option.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {phase === 'statement' && STATEMENTS[currentQuestionIndex + 1] && (
                        <div className="text-center animate-in zoom-in-95 duration-500 py-6 sm:py-10">
                            <span className="material-symbols-outlined text-4xl sm:text-5xl text-accent-gold/30 mb-6 block">format_quote</span>
                            <blockquote className="text-xl sm:text-3xl text-white font-medium italic leading-relaxed mb-8">
                                {STATEMENTS[currentQuestionIndex + 1].quote}
                            </blockquote>
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-accent-gold mb-12">
                                — {STATEMENTS[currentQuestionIndex + 1].author}
                            </p>
                            <button
                                onClick={handleContinueFromStatement}
                                className="w-full sm:w-auto px-10 py-5 bg-white text-black text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent-gold transition-all duration-300 rounded"
                            >
                                {STATEMENTS[currentQuestionIndex + 1].buttonText} →
                            </button>
                        </div>
                    )}

                    {phase === 'lead' && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <span className="inline-block py-1 px-3 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-[10px] font-black tracking-[0.3em] uppercase mb-6 rounded-full">
                                Passo Final
                            </span>
                            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4 uppercase tracking-tighter">
                                Seu diagnóstico está <span className="text-accent-gold italic">pronto.</span>
                            </h3>
                            <p className="text-white/50 text-sm sm:text-base font-medium mb-8">
                                Para onde devemos enviar o seu Diagnóstico de Maturidade para o Franchising e o próximo passo recomendado pelo Marinho?
                            </p>

                            <form onSubmit={handleLeadCapture} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Seu nome"
                                        required
                                        className="w-full bg-black border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                        className="w-full bg-black border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                        WhatsApp <span className="text-white/20 ml-2">(opcional)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="(11) 99999-9999"
                                        className="w-full bg-black border border-white/10 px-5 py-4 text-sm text-white focus:outline-none focus:border-accent-gold/50 transition-all rounded"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-accent-gold text-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-glow-primary rounded mt-4"
                                >
                                    {isSubmitting ? 'Gerando Resultado...' : 'Ver Meu Resultado →'}
                                </button>
                                <p className="text-[9px] font-bold text-white/20 text-center uppercase tracking-widest mt-4">
                                    Seus dados são usados exclusivamente para envio do resultado e informações sobre a Imersão Franchise-se. Sem spam.
                                </p>
                            </form>
                        </div>
                    )}

                    {phase === 'result' && (
                        <div className="text-center animate-in slide-in-from-bottom-8 duration-700">
                            <div className="w-20 h-20 bg-accent-gold/10 border border-accent-gold rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow-primary">
                                <span className="material-symbols-outlined text-accent-gold text-4xl">verified</span>
                            </div>
                            <h3 className="text-2xl sm:text-4xl font-black text-white mb-6 uppercase tracking-tighter">
                                {outcome.title}
                            </h3>
                            {outcome.desc.split('\n\n').map((paragraph, idx) => (
                                <p key={idx} className="text-sm sm:text-base text-white/60 mb-5 font-medium leading-relaxed max-w-2xl mx-auto">
                                    {paragraph}
                                </p>
                            ))}

                            <div className="mt-10">
                                <button
                                    onClick={() => {
                                        onClose();
                                        onGoToForm();
                                    }}
                                    className="w-full sm:w-auto px-10 py-5 bg-accent-gold text-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-glow-primary rounded"
                                >
                                    {outcome.btnText} →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
