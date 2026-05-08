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
    const [renderedPages, setRenderedPages] = useState(0);
    const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const cleanUrl = url.split('#')[0];

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoadingPdf(true);
                setNumPages(0);
                setRenderedPages(0);

                const pdf = await pdfjsLib.getDocument(cleanUrl).promise;
                if (cancelled) return;

                pdfRef.current = pdf;
                setNumPages(pdf.numPages);
                setLoadingPdf(false);
            } catch {
                if (!cancelled) {
                    setLoadError('Não foi possível carregar o conteúdo.');
                    setLoadingPdf(false);
                }
            }
        })();

        return () => {
            cancelled = true;
            pdfRef.current?.destroy();
            pdfRef.current = null;
        };
    }, [cleanUrl]);

    // Renderiza todas as páginas sequencialmente após o PDF estar carregado
    useEffect(() => {
        if (!numPages || !pdfRef.current) return;

        let cancelled = false;

        const renderPages = async () => {
            const pdf = pdfRef.current;
            if (!pdf) return;

            // Aguarda o DOM ter as divs das páginas
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            if (cancelled) return;

            const containerW = containerRef.current?.clientWidth ?? window.innerWidth;
            const availableW = Math.max(containerW - 32, 100);
            const dpr = window.devicePixelRatio || 1;

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                if (cancelled) return;

                const canvas = containerRef.current?.querySelector<HTMLCanvasElement>(
                    `canvas[data-page="${pageNum}"]`,
                );
                if (!canvas) continue;

                try {
                    const page = await pdf.getPage(pageNum);
                    if (cancelled) return;

                    const naturalW = page.getViewport({ scale: 1 }).width;
                    const scale = (availableW / naturalW) * dpr;
                    const viewport = page.getViewport({ scale });

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    canvas.style.width = `${availableW}px`;
                    canvas.style.height = `${availableW * (viewport.height / viewport.width)}px`;

                    const ctx = canvas.getContext('2d')!;
                    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
                    if (cancelled) return;

                    setRenderedPages((n) => n + 1);
                } catch {
                    // ignora erro em página individual
                }
            }
        };

        renderPages();

        return () => {
            cancelled = true;
        };
    }, [numPages]);

    const blockContext = (e: React.MouseEvent) => {
        e.preventDefault();
        onPiracyAlert();
    };

    const progress = numPages > 0 ? Math.round((renderedPages / numPages) * 100) : 0;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black flex flex-col"
            onContextMenu={blockContext}
        >
            <style dangerouslySetInnerHTML={{
                __html: `@media print { body { display: none !important; } }`
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
            {!loadingPdf && !loadError && numPages > 0 && renderedPages < numPages && (
                <div className="flex-shrink-0 h-0.5 bg-white/5">
                    <div
                        className="h-full bg-accent-gold transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Área de conteúdo */}
            <div
                className="flex-1 overflow-y-auto overflow-x-hidden bg-[#111]"
                ref={containerRef}
            >
                {loadingPdf && (
                    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] py-20">
                        <span className="material-symbols-outlined text-accent-gold text-5xl animate-spin mb-4">progress_activity</span>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/35 font-bold">Carregando…</p>
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
                        {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                            <div key={pageNum} className="bg-white shadow-xl overflow-hidden">
                                <canvas
                                    data-page={pageNum}
                                    className="block pointer-events-none"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
