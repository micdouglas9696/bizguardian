import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SecurePdfViewer from '../components/SecurePdfViewer';
import {
    API_URL,
    clearMemberToken,
    getMemberToken,
    isMemberAuthenticated,
    memberFetch,
} from '../lib/memberAuth';

interface LibraryItem {
    slug: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    cover_url: string | null;
    access_type: 'pdf' | 'url' | 'route';
    granted_at: string;
    last_accessed_at: string | null;
    access_count: number;
}

interface MeData {
    name: string | null;
    email: string;
}

export default function MemberDashboardPage() {
    const navigate = useNavigate();
    const [me, setMe] = useState<MeData | null>(null);
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [opening, setOpening] = useState<string | null>(null);
    const [viewerData, setViewerData] = useState<{ pagesUrl: string; pageCount: number } | null>(null);
    const [piracyAlert, setPiracyAlert] = useState(false);

    useEffect(() => {
        const onBeforePrint = (e: Event) => {
            e.preventDefault();
            setPiracyAlert(true);
            setTimeout(() => setPiracyAlert(false), 4500);
        };
        window.addEventListener('beforeprint', onBeforePrint);
        return () => window.removeEventListener('beforeprint', onBeforePrint);
    }, []);

    useEffect(() => {
        document.title = 'Minha Biblioteca | Marinho Ponci';
        if (!isMemberAuthenticated()) {
            navigate('/membro/login', { replace: true });
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const [meData, library] = await Promise.all([
                    memberFetch<MeData>('/api/ebook/me'),
                    memberFetch<LibraryItem[]>('/api/ebook/library'),
                ]);
                if (cancelled) return;
                setMe(meData);
                setItems(library);
            } catch (err: any) {
                if (cancelled) return;
                if (!isMemberAuthenticated()) {
                    navigate('/membro/login', { replace: true });
                    return;
                }
                setError(err.message || 'Erro ao carregar biblioteca');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    function logout() {
        clearMemberToken();
        navigate('/membro/login', { replace: true });
    }

    async function openProduct(slug: string, accessType: string) {
        if (opening) return;
        setOpening(slug);
        try {
            if (accessType === 'pdf') {
                const link = await memberFetch<{
                    url: string;
                    pages_url: string | null;
                    page_count: number;
                }>(
                    `/api/ebook/products/${slug}/access-link`,
                    { method: 'POST', body: JSON.stringify({}) },
                );
                if (link.pages_url && link.page_count > 0) {
                    setViewerData({
                        pagesUrl: `${API_URL}${link.pages_url}`,
                        pageCount: link.page_count,
                    });
                } else {
                    setError('Conteúdo indisponível no momento.');
                }
            } else {
                setError('Este tipo de produto ainda não está implementado.');
            }
        } catch (err: any) {
            // memberFetch já limpa token em 401/403 — apenas redireciona se não autenticado
            if (!getMemberToken()) {
                navigate('/membro/login', { replace: true });
                return;
            }
            setError(err.message || 'Erro ao abrir produto');
        } finally {
            setOpening(null);
        }
    }

    const firstName = me?.name?.split(' ')[0] || 'amigo(a)';

    return (
        <div className="min-h-screen bg-black text-white">
            <header className="border-b border-white/5 bg-black/60 backdrop-blur sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="/marinho final.png"
                            alt="Marinho Ponci"
                            className="h-9 md:h-11 w-auto opacity-90"
                        />
                    </Link>
                    <button
                        onClick={logout}
                        className="text-[11px] uppercase tracking-[0.25em] font-bold text-white/50 hover:text-accent-gold transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-base">logout</span>
                        Sair
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 md:py-16">
                {loading && (
                    <div className="text-center py-16">
                        <span className="material-symbols-outlined text-accent-gold text-4xl animate-spin">
                            progress_activity
                        </span>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-6 max-w-xl mx-auto mb-8">
                        {error}
                    </div>
                )}

                {!loading && (
                    <>
                        {/* HERO */}
                        <section className="mb-12 md:mb-16">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-4 block">
                                Sua biblioteca
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.95] mb-6">
                                Olá,{' '}
                                <span className="italic text-accent-gold">
                                    {firstName}.
                                </span>
                            </h1>
                            <p className="text-base md:text-lg text-white/60 leading-[1.7] max-w-2xl">
                                {items.length === 0
                                    ? 'Sua biblioteca ainda está vazia. Quando você adquirir um produto, ele aparecerá aqui.'
                                    : `Você possui ${items.length} ${items.length === 1 ? 'produto' : 'produtos'} disponíveis em qualquer dispositivo.`}
                            </p>
                        </section>

                        {/* GRID DE PRODUTOS */}
                        {items.length > 0 ? (
                            <section>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                                    {items.map((p) => (
                                        <ProductCard
                                            key={p.slug}
                                            product={p}
                                            opening={opening === p.slug}
                                            onOpen={() => openProduct(p.slug, p.access_type)}
                                        />
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <section className="bg-[#0a0a0a] border border-white/10 p-10 text-center">
                                <span className="material-symbols-outlined text-accent-gold text-5xl mb-4 inline-block">
                                    auto_stories
                                </span>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">
                                    Biblioteca vazia
                                </h2>
                                <p className="text-[15px] text-white/60 leading-[1.7] max-w-md mx-auto mb-6">
                                    Quando você comprar algum dos produtos do Marinho, ele
                                    aparecerá aqui automaticamente.
                                </p>
                                <Link
                                    to="/ebook"
                                    className="inline-block px-8 py-4 bg-accent-gold text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-colors"
                                >
                                    Ver O Dossiê do Futuro Franqueado
                                </Link>
                            </section>
                        )}
                    </>
                )}
            </main>

            <footer className="border-t border-white/5 mt-20 py-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/25">
                    © 2026 Marinho Ponci
                </p>
            </footer>

            {/* Ebook Viewer — imagens pre-renderizadas, sem PDF.js, funciona em qualquer mobile */}
            {viewerData && (
                <>
                    <SecurePdfViewer
                        pagesUrl={viewerData.pagesUrl}
                        pageCount={viewerData.pageCount}
                        onClose={() => setViewerData(null)}
                        onPiracyAlert={() => {
                            setPiracyAlert(true);
                            setTimeout(() => setPiracyAlert(false), 4500);
                        }}
                    />
                    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[210] transition-all duration-500 ${piracyAlert ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                        <div className="bg-[#111] border border-accent-gold/25 px-5 py-3 flex items-center gap-3 shadow-xl max-w-sm">
                            <span className="material-symbols-outlined text-accent-gold text-lg flex-shrink-0">shield</span>
                            <p className="text-[11px] font-bold text-white/65 leading-snug">
                                Este conteúdo é protegido e não pode ser reproduzido ou comercializado.
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function ProductCard({
    product,
    opening,
    onOpen,
}: {
    product: LibraryItem;
    opening: boolean;
    onOpen: () => void;
}) {
    const accessLabel =
        product.access_type === 'pdf'
            ? 'Abrir PDF'
            : product.access_type === 'url'
              ? 'Acessar conteúdo'
              : 'Acessar';

    return (
        <article className="group relative bg-[#0a0a0a] border border-white/[0.08] hover:border-accent-gold/50 transition-all overflow-hidden flex flex-col">
            {/* Capa */}
            <div className="relative aspect-[16/10] bg-gradient-to-br from-[#1a1410] via-[#0c0c0c] to-black overflow-hidden border-b border-white/[0.05]">
                {product.cover_url ? (
                    <img
                        src={product.cover_url}
                        alt={product.title}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-accent-gold/40 text-6xl group-hover:text-accent-gold/70 transition-colors">
                            menu_book
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>

                <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-accent-gold bg-black/60 backdrop-blur px-2.5 py-1.5 border border-accent-gold/30">
                    <span className="material-symbols-outlined text-xs">
                        {product.access_type === 'pdf' ? 'picture_as_pdf' : 'link'}
                    </span>
                    {product.access_type.toUpperCase()}
                </span>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-white text-lg md:text-xl tracking-tight leading-[1.2] uppercase mb-3">
                    {product.title}
                </h3>
                {product.subtitle && (
                    <p className="text-[13px] text-accent-gold/85 italic leading-[1.5] mb-3">
                        {product.subtitle}
                    </p>
                )}
                {product.description && (
                    <p className="text-[14px] text-white/55 leading-[1.7] mb-5 line-clamp-3">
                        {product.description}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-bold">
                        {product.access_count > 0
                            ? `Acessado ${product.access_count}x`
                            : 'Pronto para acessar'}
                    </span>
                </div>

                <button
                    onClick={onOpen}
                    disabled={opening}
                    className="mt-4 w-full py-3.5 bg-accent-gold text-black text-[11px] font-black uppercase tracking-[0.25em] hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {opening ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-base">
                                progress_activity
                            </span>
                            Abrindo…
                        </>
                    ) : (
                        <>
                            {accessLabel}
                            <span className="material-symbols-outlined text-base">
                                arrow_forward
                            </span>
                        </>
                    )}
                </button>
            </div>
        </article>
    );
}
