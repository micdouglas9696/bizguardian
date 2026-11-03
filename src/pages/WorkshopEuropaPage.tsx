import { useState, useCallback, useEffect } from 'react';
import './workshop-europa.css';
import { 
  Calendar, 
  Globe2, 
  Scale, 
  Calculator, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Users, 
  Video
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://api.marinhoponci.com');

export default function WorkshopEuropaPage() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('success') !== '1' || !sessionId) return;
    setPaymentStatus('Verificando pagamento...');
    fetch(`${API_URL}/api/workshop/session/${encodeURIComponent(sessionId)}`)
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => setPaymentStatus(data.paid ? 'Pagamento confirmado!' : 'Pagamento ainda não confirmado.'))
      .catch(() => setPaymentStatus('Não foi possível verificar o pagamento agora.'));
  }, []);

  const handleOpenModal = useCallback(() => {
    setError('');
    setShowModal(true);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Por favor, preencha nome, e-mail e WhatsApp.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const resp = await fetch(`${API_URL}/api/checkout/create-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim(),
          productKey: 'workshop_brasil_europa',
          marketingConsent,
          cancelUrl: window.location.href,
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({ error: 'Erro ao gerar checkout' }));
        throw new Error(data.error || 'Erro na conexão com Stripe');
      }

      const session = await resp.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Link de pagamento não retornado');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao processar inscrição. Tente novamente.');
      setLoading(false);
    }
  }, [name, email, phone, marketingConsent]);

  return (
    <div className="min-h-screen bg-[#04150d] text-slate-100 font-sans selection:bg-[#00F2FE]/30 selection:text-white">
      {paymentStatus && <div role="status" className="bg-emerald-950 text-white text-center p-4">{paymentStatus}</div>}
      {/* Top Bar Realização */}
      <div className="w-full bg-[#061b10] border-b border-cyan-900/30 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Realização:</span>
            <span className="text-sm font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Úp.INTELLIG3NCE
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            1ª Edição Exclusiva
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden">
        {/* Glow de Fundo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-600/15 via-emerald-600/10 to-transparent blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge Tema */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/80 to-emerald-950/80 border border-cyan-500/40 text-cyan-300 text-xs md:text-sm font-bold uppercase tracking-widest mb-6 shadow-lg shadow-cyan-950/50">
            <Globe2 className="w-4 h-4 text-emerald-400" />
            WORKSHOP ONLINE INTERNACIONAL
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            <span className="workshop-title__brasil">BRASIL</span> <span className="workshop-title__arrow text-emerald-400 inline-block px-1">➔</span> <span className="workshop-title__europa">EUROPA</span>
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-slate-200 font-medium max-w-3xl mx-auto leading-snug mb-8">
            Como morar, empreender e levar sua empresa para a Europa com segurança jurídica e fiscal.
          </p>

          {/* Card dos Detalhes da Data */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 bg-[#0b2115]/80 backdrop-blur-md border border-cyan-500/25 px-6 py-4 rounded-2xl mb-10 shadow-2xl">
            <div className="flex items-center gap-2.5 text-left">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="block text-[11px] text-slate-400 uppercase font-bold tracking-wider">Data do Encontro</span>
                <span className="text-sm sm:text-base font-bold text-white">05 de Dezembro</span>
              </div>
            </div>
            <div className="hidden sm:block w-[1px] h-8 bg-slate-700/60"></div>
            <div className="flex items-center gap-2.5 text-left">
              <Video className="w-5 h-5 text-purple-400" />
              <div>
                <span className="block text-[11px] text-slate-400 uppercase font-bold tracking-wider">Formato</span>
                <span className="text-sm sm:text-base font-bold text-white">Online + Gravação</span>
              </div>
            </div>
          </div>

          {/* CTA Principal */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleOpenModal}
              className="w-full sm:w-auto px-10 py-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-lg md:text-xl shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>GARANTIR MEU INGRESSO • R$ 300</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Pagamento seguro via Stripe
          </p>
        </div>
      </section>

      {/* FLYER / ANFITRIÃO & CONVIDADOS */}
      <section className="py-16 px-4 bg-[#061b10] border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual do Flyer */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
                  <img 
                    src="/workshop-brasil-europa.png" 
                    alt="Workshop Brasil Europa com Marinho Ponci"
                    className="w-full aspect-[1155/1050] object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* Explicação da Mesa Redonda */}
            <div className="lg:col-span-7 flex flex-col gap-6 text-left">
              <div>
                <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Apresentação & Mentoria</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                  Com Marinho Ponci + Convidados Estratégicos
                </h2>
                <p className="text-slate-300 mt-3 text-base leading-relaxed">
                  Quase 40 anos de liderança empresarial, internacionalização de marcas e expansão no franchising. Marinho reúne uma mesa de especialistas para entregar o mapa prático e sem atalhos perigosos para você e seu negócio na Europa.
                </p>
              </div>

              {/* 3 Especialistas Convidados */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-[#0b2115] border border-cyan-500/20 rounded-xl p-4 flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                    <Scale className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Advogado</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Estrutura jurídica, imigração legal, vistos de empreendedor (D2/D7), contratos e cidadania.
                  </p>
                </div>

                <div className="bg-[#0b2115] border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Contador</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    Tributação internacional, abertura de empresa em Portugal/UE e proteção patrimonial.
                  </p>
                </div>

                <div className="bg-[#0b2115] border border-purple-500/20 rounded-xl p-4 flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-950 flex items-center justify-center text-purple-400 border border-purple-500/30">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Empresário</h3>
                  <p className="text-xs text-slate-300 leading-normal">
                    A prática real de quem já levou a operação para a Europa: custos, equipe e adaptação de mercado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* O QUE VOCÊ VAI DOMINAR */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-left">
          <div className="text-center mb-14">
            <span className="text-cyan-400 text-xs sm:text-sm font-bold uppercase tracking-widest">Conteúdo Aplicado</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">
              O Que Será Discutido no Workshop
            </h2>
            <p className="text-slate-400 text-base max-w-2xl mx-auto mt-3">
              Um encontro direto ao ponto com quem entende os trâmites reais da mudança e da expansão internacional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: 'Planejamento e Transição Segura',
                desc: 'Como sair do Brasil sem deixar pendências fiscais (Saída Definitiva) e organizar a chegada na Europa.'
              },
              {
                title: 'Estruturação da Sua Empresa na UE',
                desc: 'Modelos de abertura societária em Portugal e países da União Europeia com benefícios fiscais.'
              },
              {
                title: 'Vistos de Negócios e Residência',
                desc: 'Vistos de empreendedor, nômade digital e investidor explicados de forma clara pela equipe jurídica.'
              },
              {
                title: 'Erros Críticos que Custam Milhares de Euros',
                desc: 'O que a maioria dos empresários faz de errado nos primeiros 6 meses e como blindar seu capital.'
              },
              {
                title: 'Sessão de Dúvidas ao Vivo com a Banca',
                desc: 'Espaço aberto para fazer perguntas diretas para Marinho, o advogado e o contador convidados.'
              },
              {
                title: 'Acesso à Gravação Integral',
                desc: 'Reveja os conteúdos do encontro depois da transmissão.'
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl bg-[#0B101C] border border-slate-800 hover:border-cyan-500/40 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-base mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHECKOUT CARD FINAL */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#071e12] to-[#03140b] border-t border-cyan-900/40">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0b2115] border-2 border-cyan-500/40 shadow-2xl relative">
            <div className="inline-block px-4 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider mb-4">
              LOTE ÚNICO DE LANÇAMENTO
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Ingresso Completo para o Workshop Online
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Transmissão ao vivo em 05/12 + Gravação
            </p>

            <div className="my-6">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider block">Valor do Acesso</span>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-300">R$</span>
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  300
                </span>
                <span className="text-slate-400 text-sm font-semibold">,00</span>
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Pagamento por cartão via Stripe</span>
            </div>

            <button
              onClick={handleOpenModal}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-lg shadow-xl shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              <span>COMPRAR INGRESSO AGORA</span>
            </button>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Garantia Stripe de Compra Segura</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Vagas Limitadas na Sala</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-slate-900 text-center text-xs text-slate-400">
        <p>© 2026 Marinho Ponci & Úp.INTELLIG3NCE. Todos os direitos reservados.</p>
        <p className="mt-1">Página oficial de inscrição e checkout seguro para o Workshop Brasil ➔ Europa.</p>
      </footer>

      {/* MODAL DE INSCRIÇÃO & CHECKOUT STRIPE */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0b2115] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-xl font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Inscrição Rápida</span>
              <h3 className="text-xl font-extrabold text-white mt-1">Garantir Ingresso Workshop</h3>
              <p className="text-xs text-slate-400 mt-1">
                Preencha seus dados para emitir seu ingresso e prosseguir para o pagamento seguro de R$ 300,00 via Stripe.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#04150d] border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Seu Melhor E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#04150d] border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp com DDD</label>
                <input
                  type="tel"
                  required
                  placeholder="(DDD) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#04150d] border border-slate-700 focus:border-cyan-400 text-white text-sm outline-none transition-colors"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Informe seu número para contato sobre o workshop.
                </span>
              </div>

              <label className="flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                <input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)} className="mt-0.5 accent-emerald-400" />
                Aceito receber lembretes sobre minha inscrição no workshop pelo WhatsApp. Opcional.
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Conectando com a Stripe...</span>
                ) : (
                  <>
                    <span>Ir para Pagamento Seguro (R$ 300)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
