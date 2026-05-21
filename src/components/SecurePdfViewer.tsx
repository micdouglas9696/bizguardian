import { useEffect, useState } from 'react';

interface Props {
    pagesUrl: string;
    pageCount: number;
    onClose: () => void;
    onPiracyAlert: () => void;
}

export default function SecurePdfViewer({
    pagesUrl,
    pageCount,
    onClose,
    onPiracyAlert,
}: Props) {
    const [loadedCount, setLoadedCount] = useState(0);

    // Trava scroll do body no iOS enquanto o viewer estiver aberto
    useEffect(() => {
        const scrollY = window.scrollY;
        const prev = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
        };
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        return () => {
            Object.assign(document.body.style, prev);
            window.scrollTo(0, scrollY);
        };
    }, []);

    const blockContext = (e: React.MouseEvent) => {
        e.preventDefault();
        onPiracyAlert();
    };

    const progress = pageCount > 0 ? Math.round((loadedCount / pageCount) * 100) : 0;
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

    return (
        <div
            className="fixed inset-0 z-[200] bg-black flex flex-col"
            onContextMenu={blockContext}
        >
            <style dangerouslySetInnerHTML={{
                __html: `@media print { body { display: none !important; } }`,
            }} />

            {/* Barra superior */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0a0a0a] flex-shrink-0">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/35">
                    <span className="material-symbols-outlined text-accent-gold text-[15px]">lock</span>
                    Conteúdo protegido · Uso pessoal exclusivo
                </span>
                <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/45 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-base">close</span>
                    Fechar
                </button>
            </div>

            {/* Barra de progresso */}
            {pageCount > 0 && loadedCount < pageCount && (
                <div className="flex-shrink-0 h-1 bg-white/5">
                    <div
                        className="h-full bg-accent-gold transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#111] overscroll-none">
                {pageCount === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-20">
                        <span className="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
                        <p className="text-[13px] text-white/70 text-center max-w-md px-6">
                            Nenhuma página disponível.
                        </p>
                    </div>
                ) : (
                    <div className="py-4 px-4 space-y-2 select-none max-w-3xl mx-auto">
                        {pages.map((n) => (
                            <div
                                key={n}
                                className="overflow-hidden shadow-xl bg-[#1a1a1a]"
                                style={{ aspectRatio: '0.707' }}
                            >
                                <img
                                    src={`${pagesUrl}/${n}`}
                                    alt=""
                                    loading="eager"
                                    decoding="async"
                                    draggable={false}
                                    onLoad={() => setLoadedCount((c) => c + 1)}
                                    onError={() => setLoadedCount((c) => c + 1)}
                                    className="block w-full h-full object-contain pointer-events-none"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
