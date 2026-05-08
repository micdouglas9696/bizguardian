import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
).href;

interface Props {
    url: string;
    onClose: () => void;
    onPiracyAlert: () => void;
}

export default function SecurePdfViewer({ url, onClose, onPiracyAlert }: Props) {
    const [numPages, setNumPages] = useState(0);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(true);
    const [pageImages, setPageImages] = useState<(string | null)[]>([]);
    const blobUrlsRef = useRef<string[]>([]);

    const cleanUrl = url.split('#')[0];

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

    useEffect(() => {
        let cancelled = false;

        blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        blobUrlsRef.current = [];

        (async () => {
            try {
                setLoadingPdf(true);
                setNumPages(0);
                setPageImages([]);

                const pdf = await pdfjsLib.getDocument(cleanUrl).promise;
                if (cancelled) return;

                const n = pdf.numPages;
                setNumPages(n);
                setPageImages(new Array(n).fill(null));
                setLoadingPdf(false);

                // Largura disponível — usa window.innerWidth para não depender do DOM
                const availableW = Math.min(window.innerWidth - 32, 900);
                // Limita DPR a 2 para evitar estouro de memória no mobile
                const dpr = Math.min(window.devicePixelRatio || 1, 2);

                for (let i = 1; i <= n; i++) {
                    if (cancelled) break;

                    try {
                        const page = await pdf.getPage(i);
                        if (cancelled) break;

                        const naturalW = page.getViewport({ scale: 1 }).width;
                        const scale = (availableW / naturalW) * dpr;
                        const viewport = page.getViewport({ scale });

                        // Canvas offscreen — não vai para o DOM, sem limite de contextos
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        const ctx = canvas.getContext('2d')!;
                        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
                        if (cancelled) break;

                        const blob = await new Promise<Blob>((resolve, reject) => {
                            canvas.toBlob(
                                (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
                                'image/jpeg',
                                0.92,
                            );
                        });
                        if (cancelled) break;

                        const blobUrl = URL.createObjectURL(blob);
                        blobUrlsRef.current.push(blobUrl);

                        setPageImages((prev) => {
                            const next = [...prev];
                            next[i - 1] = blobUrl;
                            return next;
                        });
                    } catch {
                        // pula página com erro silenciosamente
                    }
                }

                pdf.destroy();
            } catch {
                if (!cancelled) {
                    setLoadError('Não foi possível carregar o conteúdo.');
                    setLoadingPdf(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [cleanUrl]);

    useEffect(() => {
        return () => {
            blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        };
    }, []);

    const blockContext = (e: React.MouseEvent) => {
        e.preventDefault();
        onPiracyAlert();
    };

    const renderedCount = pageImages.filter(Boolean).length;
    const progress = numPages > 0 ? Math.round((renderedCount / numPages) * 100) : 0;

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

            {/* Barra de progresso de renderização */}
            {!loadingPdf && !loadError && numPages > 0 && renderedCount < numPages && (
                <div className="flex-shrink-0 h-1 bg-white/5">
                    <div
                        className="h-full bg-accent-gold transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#111] overscroll-none">
                {loadingPdf && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-20">
                        <span className="material-symbols-outlined text-accent-gold text-5xl animate-spin mb-4">
                            progress_activity
                        </span>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/35 font-bold">
                            Carregando…
                        </p>
                    </div>
                )}

                {loadError && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-20">
                        <span className="material-symbols-outlined text-red-400 text-4xl mb-4">error</span>
                        <p className="text-[13px] text-white/50">{loadError}</p>
                    </div>
                )}

                {!loadingPdf && !loadError && (
                    <div className="py-4 px-4 space-y-2 select-none">
                        {pageImages.map((src, i) => (
                            <div key={i} className="overflow-hidden shadow-xl bg-[#1a1a1a]">
                                {src ? (
                                    <img
                                        src={src}
                                        alt=""
                                        className="block w-full pointer-events-none"
                                        draggable={false}
                                    />
                                ) : (
                                    <div
                                        className="w-full flex items-center justify-center"
                                        style={{ aspectRatio: '0.707' }}
                                    >
                                        <span className="material-symbols-outlined text-white/10 text-4xl animate-pulse">
                                            description
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
