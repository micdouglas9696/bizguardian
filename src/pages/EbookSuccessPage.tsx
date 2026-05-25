import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface OrderData {
    customer_email: string | null;
    amount_paid_cents: number;
    currency: string;
    status: string;
    paid_at: string | null;
}

const formatCents = (cents: number, currency = 'brl') => {
    const value = cents / 100;
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: currency.toUpperCase(),
    });
};

export default function EbookSuccessPage() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'Pagamento confirmado | O Dossiê do Futuro Franqueado';

        if (!sessionId) {
            setError('Sessão não encontrada na URL.');
            setLoading(false);
            return;
        }

        let cancelled = false;
        let attempts = 0;

        const fetchOrder = async () => {
            attempts += 1;
            try {
                const resp = await fetch(
                    `${API_URL}/api/ebook/order/${encodeURIComponent(sessionId)}`,
                );
                if (!resp.ok) {
                    if (attempts < 5) {
                        setTimeout(fetchOrder, 1500);
                        return;
                    }
                    if (!cancelled) {
                        setError('Não conseguimos confirmar o pedido agora. Confira seu email — a confirmação chegou lá.');
                        setLoading(false);
                    }
                    return;
                }
                const data: OrderData = await resp.json();
                if (cancelled) return;
                setOrder(data);
                setLoading(false);

                // Se ainda está pending (webhook lento), retenta uma vez
                if (data.status !== 'paid' && attempts < 5) {
                    setTimeout(fetchOrder, 2000);
                }
            } catch (err: any) {
                if (cancelled) return;
                if (attempts < 5) {
                    setTimeout(fetchOrder, 2000);
                    return;
                }
                setError(err.message || 'Erro ao buscar pedido');
                setLoading(false);
            }
        };

        fetchOrder();
        return () => {
            cancelled = true;
        };
    }, [sessionId]);

    return (
        <div className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-accent-gold selection:text-black font-sans">
            {/* HEADER mínimo */}
            <header className="fixed top-0 left-0 right-0 z-50 py-5 sm:py-7 bg-transparent">
                <div className="max-w-[1700px] mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex flex-col leading-none select-none cursor-pointer group"
                    >
                        <img
                            src="/marinho final.webp"
                            alt="Marinho Ponci"
                            className="h-10 sm:h-12 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                        />
                    </Link>
                </div>
            </header>

            <main className="min-h-screen flex items-center justify-center px-6 md:px-12 py-32 relative overflow-hidden">
                {/* BG ambient */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent-gold/10 blur-[160px] rounded-full"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.04]"></div>
                </div>

                <div className="relative max-w-[720px] w-full text-center">
                    {loading && (
                        <div className="flex flex-col items-center">
                            <span className="material-symbols-outlined text-accent-gold text-5xl animate-spin mb-6">
                                progress_activity
                            </span>
                            <p className="text-[12px] uppercase tracking-[0.3em] text-white/40 font-bold">
                                Confirmando seu pagamento…
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="bg-[#0a0a0a] border border-white/10 p-10">
                            <span className="material-symbols-outlined text-yellow-400 text-5xl mb-4 inline-block">
                                schedule
                            </span>
                            <h1 className="font-black text-white text-2xl md:text-3xl uppercase tracking-tight mb-4">
                                Quase lá
                            </h1>
                            <p className="text-[15px] text-white/60 leading-[1.7] mb-8">
                                {error}
                            </p>
                            <Link
                                to="/ebook"
                                className="inline-block px-8 py-4 bg-accent-gold text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-white transition-colors"
                            >
                                Voltar à página
                            </Link>
                        </div>
                    )}

                    {!loading && order && (
                        <>
                            {/* Vídeo de boas-vindas */}
                            {order.status === 'paid' && (
                                <div className="mb-10 w-full aspect-video bg-[#0a0a0a] border border-white/10 overflow-hidden">
                                    <video
                                        src={`${API_URL}/api/media/BEM-VINDO.mp4`}
                                        autoPlay
                                        controls
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Ícone de sucesso */}
                            <div className="inline-flex items-center justify-center w-24 h-24 mb-8 hud-border bg-[#0a0a0a]">
                                <span className="material-symbols-outlined text-accent-gold text-5xl">
                                    {order.status === 'paid' ? 'check' : 'schedule'}
                                </span>
                            </div>

                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-accent-gold mb-5 block">
                                {order.status === 'paid'
                                    ? 'Pagamento confirmado'
                                    : 'Pagamento em processamento'}
                            </span>

                            <h1 className="font-black text-white leading-[0.95] tracking-tighter uppercase text-[clamp(2rem,4.8vw,3.4rem)] mb-6">
                                Bem-vindo
                                <br />
                                <span className="italic text-accent-gold">ao Dossiê.</span>
                            </h1>

                            <p className="text-[15px] md:text-base text-white/65 leading-[1.8] mb-10 max-w-xl mx-auto">
                                {order.status === 'paid' ? (
                                    <>
                                        Sua compra de{' '}
                                        <strong className="text-white">
                                            O Dossiê do Futuro Franqueado
                                        </strong>{' '}
                                        foi confirmada. Em instantes, você vai receber um
                                        email com a confirmação e os próximos passos para
                                        acessar o material.
                                    </>
                                ) : (
                                    <>
                                        Estamos confirmando seu pagamento. Isso costuma
                                        levar alguns segundos. Você vai receber um email
                                        assim que estiver tudo certo.
                                    </>
                                )}
                            </p>

                            {/* Dados do pedido */}
                            <div className="bg-[#0a0a0a] border border-white/10 p-7 md:p-8 mb-8 text-left max-w-md mx-auto">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-5">
                                    Detalhes do pedido
                                </div>
                                <dl className="space-y-3">
                                    {order.customer_email && (
                                        <div className="flex items-center justify-between gap-4">
                                            <dt className="text-[12px] uppercase tracking-[0.18em] text-white/40 font-bold">
                                                Email
                                            </dt>
                                            <dd className="text-[14px] text-white/80 truncate">
                                                {order.customer_email}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-[12px] uppercase tracking-[0.18em] text-white/40 font-bold">
                                            Valor
                                        </dt>
                                        <dd className="text-[14px] text-accent-gold font-bold tabular-nums">
                                            {formatCents(
                                                order.amount_paid_cents,
                                                order.currency,
                                            )}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-[12px] uppercase tracking-[0.18em] text-white/40 font-bold">
                                            Status
                                        </dt>
                                        <dd
                                            className={`text-[12px] uppercase tracking-[0.18em] font-bold ${
                                                order.status === 'paid'
                                                    ? 'text-green-400'
                                                    : 'text-yellow-400'
                                            }`}
                                        >
                                            {order.status === 'paid'
                                                ? '✓ Aprovado'
                                                : '◷ Processando'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Próximos passos */}
                            <div className="bg-accent-gold/[0.06] border border-accent-gold/25 p-7 mb-8 text-left max-w-md mx-auto">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-gold mb-3">
                                    Próximos passos
                                </div>
                                <ol className="space-y-3 text-[14px] text-white/70 leading-[1.65]">
                                    <li className="flex gap-3">
                                        <span className="text-accent-gold font-black shrink-0">
                                            1.
                                        </span>
                                        Confira seu email (incluindo spam) para a
                                        confirmação
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-accent-gold font-black shrink-0">
                                            2.
                                        </span>
                                        Você receberá em breve o link da área de membros
                                        com os 6 módulos
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-accent-gold font-black shrink-0">
                                            3.
                                        </span>
                                        Sua nota fiscal será enviada em até 24h
                                    </li>
                                </ol>
                            </div>

                            <Link
                                to="/"
                                className="inline-block px-8 py-4 border border-accent-gold/50 text-accent-gold text-xs font-black uppercase tracking-[0.2em] hover:bg-accent-gold hover:text-black transition-colors"
                            >
                                Voltar ao site
                            </Link>

                            <p className="text-[11px] text-white/25 mt-8 uppercase tracking-[0.2em] font-bold">
                                Garantia de 7 dias incondicional
                            </p>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
