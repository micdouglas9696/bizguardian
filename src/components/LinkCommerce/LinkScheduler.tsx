import { useState } from 'react';
import CountryPhoneInput from '../CountryPhoneInput';

interface LinkSchedulerProps {
    onTrack?: (elementId: string) => void;
    onSuccess?: () => void;
}

type Step = 'date' | 'time' | 'service' | 'form' | 'success';

const SERVICES = [
    { id: 'diagnostico', name: 'Diagnóstico de Perfil de Franqueado', desc: 'Avaliação do seu perfil de investidor e alinhamento de expectativas.' },
    { id: 'consultoria', name: 'Consultoria Estratégica 1:1', desc: 'Reunião para avaliar marcas, circular de oferta (COF) ou modelo de negócios.' },
    { id: 'internacionalizacao', name: 'Internacionalização de Marcas', desc: 'Para marcas que buscam expandir sua operação para o mercado americano/europeu.' }
];

const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
];

export default function LinkScheduler({ onTrack, onSuccess }: LinkSchedulerProps) {
    const [step, setStep] = useState<Step>('date');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [selectedService, setSelectedService] = useState<string>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Obter dias do mês atual para o calendário
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        // Placeholders para dias da semana anterior
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Dias reais
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        setCurrentMonth(prev => {
            const next = new Date(prev);
            next.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
            return next;
        });
    };

    const isDateDisabled = (date: Date | null) => {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Não permitir dias passados, hoje ou fins de semana
        return date < today || date.getDay() === 0 || date.getDay() === 6;
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        onTrack?.('scheduler_select_date');
        setStep('time');
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        onTrack?.('scheduler_select_time');
        setStep('service');
    };

    const handleServiceSelect = (serviceId: string) => {
        setSelectedService(serviceId);
        onTrack?.('scheduler_select_service');
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDate || !selectedTime || !selectedService) return;
        
        setLoading(true);
        setSubmitError('');
        onTrack?.('scheduler_submit_start');
        
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const serviceName = SERVICES.find(s => s.id === selectedService)?.name || selectedService;

        try {
            const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${API}/api/link/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    whatsapp: phone,
                    date: formattedDate,
                    time: selectedTime,
                    service: serviceName,
                    message,
                    visitor_id: localStorage.getItem('lc_visitor_id') || 'anonymous'
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                onTrack?.('scheduler_submit_success');
                setStep('success');
                onSuccess?.();
            } else {
                throw new Error(data.error || 'Não foi possível confirmar o agendamento.');
            }
        } catch (error: any) {
            console.error('Schedule submission failed:', error);
            setSubmitError(error.message || 'Erro de conexão. Verifique sua conexão e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const days = getDaysInMonth(currentMonth);
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <div 
            id="bio-scheduler"
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden animate-fade-in-up"
            style={{ animationDelay: '240ms' }}
        >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-accent-gold">
                        Agendamento Estratégico
                    </h3>
                    <p className="text-[11px] text-white/40 mt-0.5">
                        Agende uma conversa direta com Marinho Ponci
                    </p>
                </div>
                
                {/* Stepper Progress */}
                {step !== 'success' && (
                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-accent-gold">
                            Passo {step === 'date' ? 1 : step === 'time' ? 2 : step === 'service' ? 3 : 4}/4
                        </span>
                    </div>
                )}
            </div>

            {/* Stepper indicator visually */}
            {step !== 'success' && (
                <div className="flex h-[2px] bg-white/5">
                    <div 
                        className="bg-accent-gold transition-all duration-300"
                        style={{ 
                            width: step === 'date' ? '25%' : step === 'time' ? '50%' : step === 'service' ? '75%' : '100%' 
                        }}
                    />
                </div>
            )}

            {/* Content area */}
            <div className="p-5">
                {/* 1. SELECIONAR DIA */}
                {step === 'date' && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                onClick={() => handleMonthChange('prev')}
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                ‹
                            </button>
                            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </span>
                            <button 
                                onClick={() => handleMonthChange('next')}
                                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                ›
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                                <div key={i} className="text-[10px] font-bold text-white/20 py-1">{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5">
                            {days.map((date, idx) => {
                                if (!date) return <div key={idx} />;
                                const disabled = isDateDisabled(date);
                                const isSelected = selectedDate && selectedDate.getDate() === date.getDate() && selectedDate.getMonth() === date.getMonth();

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleDateSelect(date)}
                                        disabled={disabled}
                                        className={`
                                            aspect-square rounded-xl text-xs font-bold transition-all duration-200
                                            ${isSelected 
                                                ? 'bg-accent-gold text-black border border-accent-gold shadow-[0_0_15px_rgba(225,169,96,0.25)]' 
                                                : disabled 
                                                    ? 'text-white/10 cursor-not-allowed bg-transparent' 
                                                    : 'bg-white/[0.02] border border-white/5 text-white/70 hover:border-accent-gold/40 hover:text-white'
                                            }
                                        `}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 2. SELECIONAR HORÁRIO */}
                {step === 'time' && (
                    <div className="animate-fadeIn">
                        <button 
                            onClick={() => setStep('date')}
                            className="text-[10px] font-bold text-white/40 hover:text-white/70 uppercase tracking-wider mb-4 block"
                        >
                            ← Voltar para calendário
                        </button>
                        <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
                            Horários disponíveis para {selectedDate?.toLocaleDateString('pt-BR')}
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                            {TIME_SLOTS.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => handleTimeSelect(time)}
                                    className={`
                                        py-3 rounded-xl text-xs font-bold border transition-all duration-200
                                        ${selectedTime === time
                                            ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                                            : 'border-white/5 bg-white/[0.02] text-white/70 hover:border-white/20 hover:text-white'
                                        }
                                    `}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. SELECIONAR SERVIÇO */}
                {step === 'service' && (
                    <div className="animate-fadeIn">
                        <button 
                            onClick={() => setStep('time')}
                            className="text-[10px] font-bold text-white/40 hover:text-white/70 uppercase tracking-wider mb-4 block"
                        >
                            ← Voltar para horários
                        </button>
                        <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-3">
                            Selecione o tipo de reunião
                        </h4>
                        <div className="space-y-2">
                            {SERVICES.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => handleServiceSelect(s.id)}
                                    className={`
                                        w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1
                                        ${selectedService === s.id
                                            ? 'border-accent-gold bg-accent-gold/10'
                                            : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                                        }
                                    `}
                                >
                                    <span className={`text-xs font-bold ${selectedService === s.id ? 'text-accent-gold' : 'text-white'}`}>
                                        {s.name}
                                    </span>
                                    <span className="text-[10px] text-white/40 leading-snug">
                                        {s.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. FORMULÁRIO DE DADOS */}
                {step === 'form' && (
                    <form onSubmit={handleSubmit} className="animate-fadeIn space-y-4">
                        <button 
                            type="button"
                            onClick={() => setStep('service')}
                            className="text-[10px] font-bold text-white/40 hover:text-white/70 uppercase tracking-wider mb-2 block"
                        >
                            ← Voltar para serviços
                        </button>
                        
                        {/* Resumo da reserva */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] text-white/60 space-y-1.5">
                            <div>
                                <span className="font-bold text-white/40 uppercase tracking-wider mr-2">Reunião:</span>
                                <span className="text-accent-gold font-bold">
                                    {SERVICES.find(s => s.id === selectedService)?.name}
                                </span>
                            </div>
                            <div>
                                <span className="font-bold text-white/40 uppercase tracking-wider mr-2">Data e Hora:</span>
                                <span className="text-white font-bold">
                                    {selectedDate?.toLocaleDateString('pt-BR')} às {selectedTime}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                Nome completo
                            </label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Seu nome"
                                className="w-full bg-black border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                Email corporativo
                            </label>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="seu@email.com"
                                className="w-full bg-black border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20"
                            />
                        </div>

                        <CountryPhoneInput 
                            value={phone}
                            onChange={setPhone}
                            required
                            label="WhatsApp"
                        />

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-2">
                                Mensagem / Desafio (opcional)
                            </label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Conte-nos brevemente o seu desafio..."
                                rows={3}
                                className="w-full bg-black border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:outline-none focus:border-accent-gold/50 transition-all placeholder:text-white/20 resize-none"
                            />
                        </div>

                        {submitError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs text-center font-semibold leading-relaxed">
                                {submitError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-accent-gold text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
                        </button>
                    </form>
                )}

                {/* 5. SUCCESS STATE */}
                {step === 'success' && (
                    <div className="text-center py-6 animate-fadeIn">
                        <div className="w-14 h-14 rounded-full bg-accent-gold/10 border border-accent-gold/30 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-2">
                            Solicitação Enviada!
                        </h4>
                        <p className="text-[12px] text-white/50 leading-relaxed max-w-[280px] mx-auto mb-6">
                            Sua solicitação de agendamento foi registrada. Em breve nossa equipe entrará em contato via WhatsApp ({phone}) para confirmar.
                        </p>
                        <button
                            onClick={() => {
                                setSelectedDate(null);
                                setSelectedTime('');
                                setSelectedService('');
                                setName('');
                                setEmail('');
                                setPhone('');
                                setMessage('');
                                setSubmitError('');
                                setStep('date');
                            }}
                            className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-white/25 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white transition-all"
                        >
                            Agendar Nova Reunião
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
