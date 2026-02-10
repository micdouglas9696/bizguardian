import { useEffect, useState } from 'react';

const ANALYSIS_STEPS = [
    { label: 'CALIBRANDO MATRIZ...', duration: 1800 },
    { label: 'SCANNER FINANCEIRO...', duration: 1400 },
    { label: 'MAPEANDO MERCADOS...', duration: 2200 },
    { label: 'CÁLCULO DE VIABILIDADE...', duration: 1600 },
];

export default function DiagnosticMechanism() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        let timeout: any;

        const runStep = (stepIndex: number) => {
            if (stepIndex >= ANALYSIS_STEPS.length) {
                setIsComplete(true);
                let start = 0;
                const interval = setInterval(() => {
                    start += 1.5;
                    if (start >= 86) {
                        setScore(86);
                        clearInterval(interval);
                    } else {
                        setScore(Math.floor(start));
                    }
                }, 15);
                return;
            }

            setCurrentStep(stepIndex);
            timeout = setTimeout(() => {
                runStep(stepIndex + 1);
            }, ANALYSIS_STEPS[stepIndex].duration);
        };

        runStep(0);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="w-full bg-[#0a0a0a] hud-border p-6 md:p-8 shadow-hud flex flex-col xl:flex-row gap-10 items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none"></div>

            {/* Left: Tactical Scanner */}
            <div className="relative w-64 h-64 flex-shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 border border-white/5"></div>
                <div className="absolute inset-4 border border-white/5"></div>
                <div className="absolute inset-8 border border-white/5"></div>

                {/* Radar Line */}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${isComplete ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-accent-gold/50 shadow-glow-primary animate-scanner-hud"></div>
                </div>

                <div className={`relative z-10 flex flex-col items-center justify-center transition-all duration-1000 ${isComplete ? 'scale-110 opacity-100' : 'scale-75 opacity-20'}`}>
                    <span className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{score}%</span>
                    <span className="text-[10px] uppercase font-black tracking-[0.4em] text-accent-gold mt-2">Maturidade</span>
                </div>

                {/* Tracking Dots */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className={`absolute w-1 h-1 bg-accent-gold shadow-glow-primary transition-all duration-500 ${isComplete ? 'opacity-0' : 'opacity-100 animate-pulse'}`}
                        style={{
                            top: `${20 + i * 20}%`,
                            left: `${20 + (i % 2) * 40}%`
                        }}
                    />
                ))}
            </div>

            {/* Right: Telemetry data */}
            <div className="flex-1 w-full relative z-10 font-mono">
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex flex-col">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">SISTEMA STATUS: ATIVO</h3>
                            <span className="text-[9px] text-white/20 mt-1 uppercase tracking-widest">Protocolo BizGuardian V.2.0</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-accent-gold animate-pulse'}`}></div>
                            <span className="text-[10px] font-black tracking-widest text-white/40">{isComplete ? 'READY' : 'ANALYZING...'}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {ANALYSIS_STEPS.map((step, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className={`w-2 h-2 border ${currentStep > i || isComplete ? 'bg-green-500 border-green-500' : currentStep === i ? 'border-accent-gold animate-pulse' : 'border-white/10'}`}></div>
                                <span className={`text-[11px] font-black tracking-widest transition-colors ${currentStep === i ? 'text-accent-gold' : currentStep > i || isComplete ? 'text-white/60' : 'text-white/20'}`}>
                                    {step.label}
                                </span>
                                {(currentStep === i || (isComplete && i === 3)) && (
                                    <div className="ml-auto flex gap-1">
                                        <div className="w-4 h-1 bg-accent-gold/20 animate-pulse"></div>
                                        <div className="w-4 h-1 bg-accent-gold/40 animate-pulse" style={{ animationDelay: '200ms' }}></div>
                                        <div className="w-4 h-1 bg-accent-gold/60 animate-pulse" style={{ animationDelay: '400ms' }}></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className={`mt-8 p-6 bg-white/5 border-l-2 border-accent-gold transition-all duration-700 transform ${isComplete ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                        <div className="flex items-start gap-4">
                            <div className="text-accent-gold">
                                <span className="material-symbols-outlined text-2xl font-black">terminal</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-white text-[11px] uppercase tracking-[0.2em] mb-2">OUTPUT ESTRATÉGICO:</h4>
                                <p className="text-[11px] text-white/40 leading-relaxed uppercase tracking-tighter font-bold">
                                    SOLICITAÇÃO DE EXPANSÃO: <span className="text-green-500">APROVADA</span> <br />
                                    MÉTRICA DE SEGURANÇA: 0.982 <br />
                                    RECOMENDAÇÃO: INICIAR ESTRUTURAÇÃO JURÍDICA IMEDIATA.
                                </p>
                            </div>
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[8px] text-white/20 mb-2">SIGNED PIN: 8A2-F9</span>
                                <div className="w-12 h-12 bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-accent-gold text-lg">verified</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
