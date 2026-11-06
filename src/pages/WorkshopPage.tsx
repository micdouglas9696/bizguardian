import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://api.marinhoponci.com');

export default function WorkshopPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Workshop Brasil ➔ Europa | 28 de Novembro | Marinho Ponci & Úp.INTELLIG3NCE';

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (params.get('success') === '1' && sessionId) {
      setPaymentStatus('Verificando pagamento...');
      fetch(`${API_URL}/api/workshop/session/${encodeURIComponent(sessionId)}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          setPaymentStatus(data.paid ? 'Pagamento confirmado com sucesso! Verifique seu e-mail.' : 'Pagamento em processamento.');
        })
        .catch(() => {
          setPaymentStatus('Pagamento recebido! Você receberá os detalhes no seu e-mail.');
        });
    }
  }, []);

  const scrollToOffer = () => {
    const el = document.getElementById('oferta');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckoutSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Por favor, preencha nome, e-mail e WhatsApp.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await fetch(`${API_URL}/api/leads/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          whatsapp: phone.trim(),
          service: 'Workshop Online Brasil ➔ Europa (28/11)',
          message: 'Inscrição iniciada - Checkout Stripe R$ 300',
        }),
      }).catch(() => {});

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
      const errMsg = err instanceof Error ? err.message : '';
      if (errMsg.includes('Stripe') || errMsg.includes('Failed to fetch') || errMsg.includes('conexão')) {
        const waText = encodeURIComponent(
          `*Inscrição no Workshop Brasil ➔ Europa (28/11)*\n\n` +
          `*Nome:* ${name}\n` +
          `*E-mail:* ${email}\n` +
          `*WhatsApp:* ${phone}\n\n` +
          `Gostaria de garantir minha vaga e receber o link de pagamento.`
        );
        window.open(`https://wa.me/351967284661?text=${waText}`, '_blank');
        setModalOpen(false);
      } else {
        setError(errMsg || 'Falha ao processar inscrição. Tente novamente.');
      }
      setLoading(false);
    }
  }, [name, email, phone, marketingConsent]);

  return (
    <div className="min-h-screen bg-[#050705] text-white font-sans selection:bg-[#02E99B] selection:text-black antialiased relative overflow-x-hidden">
      
      {/* Banner de status pós-checkout */}
      {paymentStatus && (
        <div className="bg-[#02E99B] text-black font-extrabold text-center py-3 px-4 text-sm tracking-wide">
          {paymentStatus}
        </div>
      )}

      {/* Top Navbar Sutil: Apenas Logo Úp.INTELLIG3NCE (Sem Realização, Sem Lote) */}
      <header className="relative z-30 pt-5 pb-2 px-4 flex items-center justify-center">
        <img 
          src="/up-intelligence-logo.webp" 
          alt="Úp.INTELLIG3NCE" 
          className="h-7 sm:h-8 w-auto object-contain brightness-110 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]"
        />
      </header>

      {/* =========================================================================
          HERO INTEGRADO: PERSPECTIVA ORIGINAL COM FUSÃO PERFEITA (SEM CORTES)
         ========================================================================= */}
      <section className="relative overflow-hidden border-b border-[#1E261C] pt-2 pb-14 sm:pb-20">
        
        {/* FUNDO VISUAL CINEMÁTICO: PERSPECTIVA ORIGINAL COM FUSÃO NATURAL */}
        <div className="absolute top-0 inset-x-0 z-0 pointer-events-none flex justify-center items-start overflow-hidden">
          <div className="relative w-full max-w-5xl lg:max-w-6xl h-[340px] sm:h-[480px] lg:h-[580px] flex items-start justify-center">
            
            {/* Imagem Estática Definitiva: Perspectiva original com bordas transparentes nativas */}
            <img
              src="/hero-marinho-definitive.webp"
              alt="Marinho Ponci - Workshop Brasil para Europa"
              className="w-full h-full object-contain sm:object-cover object-[center_top] filter brightness-[0.99] contrast-[1.02]"
              fetchPriority="high"
              loading="eager"
            />

            {/* Gradiente inferior suave conectando a base da imagem ao fundo da seção */}
            <div className="absolute bottom-0 inset-x-0 h-28 sm:h-44 bg-gradient-to-t from-[#050705] to-transparent pointer-events-none" />
            
            {/* Vinhetas laterais suaves para telas ultrawide */}
            <div className="hidden lg:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#050705] to-transparent pointer-events-none" />
            <div className="hidden lg:block absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#050705] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Aura atmosférica de iluminação esmeralda no topo */}
        <div 
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-[130px] z-0"
          style={{ background: 'radial-gradient(circle, rgba(2, 233, 155, 0.45) 0%, transparent 70%)' }}
        />

        {/* CONTEÚDO HERO FLUTUANDO DIRETAMENTE NO CENÁRIO */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          
          <style>{`
            @keyframes heroBadgeFloat1 {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            @keyframes heroBadgeFloat2 {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-11px); }
            }
            @keyframes heroBadgeFloat3 {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-9px); }
            }
            @keyframes heroBadgeGlow {
              0%, 100% { box-shadow: 0 0 15px rgba(2, 233, 155, 0.15), 0 8px 25px rgba(0, 0, 0, 0.7); }
              50% { box-shadow: 0 0 30px rgba(2, 233, 155, 0.4), 0 8px 30px rgba(0, 0, 0, 0.85); }
            }
            @keyframes ctaGlowPulse {
              0%, 100% {
                box-shadow: 0 0 25px rgba(2, 233, 155, 0.45);
                transform: scale(1);
              }
              50% {
                box-shadow: 0 0 50px rgba(2, 233, 155, 0.8);
                transform: scale(1.02);
              }
            }
            @keyframes ribbonTextureRoll {
              0% { background-position: 0 0; }
              100% { background-position: 432px 0; }
            }
            @keyframes tickerMarquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
          `}</style>

          {/* 1. ÁREA DOS CARDS FLUTUANTES ANIMADOS (Apenas Desktop - Ocultos no Mobile para não cobrir o Marinho) */}
          <div className="hidden md:flex min-h-[300px] lg:min-h-[360px] items-center justify-between">
            
            {/* Lado Esquerdo: 2 Cards Flutuantes Animados */}
            <div className="flex flex-col gap-3 max-w-[270px]">
              
              {/* Card 1: Encontro Ao Vivo · 28 de Novembro */}
              <div 
                className="bg-[#0A0E0B]/85 backdrop-blur-md border border-[#1E261C] p-2.5 sm:p-3 rounded-xl flex items-center gap-3 transition-transform duration-300 hover:scale-105 hover:border-[#02E99B]/60 cursor-default"
                style={{
                  animation: 'heroBadgeFloat1 4.8s ease-in-out infinite, heroBadgeGlow 3.6s ease-in-out infinite'
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-[#02E99B]/15 border border-[#02E99B]/30 flex items-center justify-center shrink-0 text-[#02E99B]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#02E99B] animate-ping" />
                    <p className="text-xs font-bold text-white leading-tight">Encontro Ao Vivo</p>
                  </div>
                  <p className="text-[11px] text-[#02E99B] font-semibold mt-0.5">28 de Novembro</p>
                </div>
              </div>

              {/* Card 2: Transição Segura */}
              <div 
                className="bg-[#0A0E0B]/85 backdrop-blur-md border border-[#1E261C] p-2.5 sm:p-3 rounded-xl flex items-center gap-3 transition-transform duration-300 hover:scale-105 hover:border-[#02E99B]/60 cursor-default"
                style={{
                  animation: 'heroBadgeFloat2 5.4s ease-in-out infinite 0.8s, heroBadgeGlow 4.2s ease-in-out infinite 1s'
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-[#02E99B]/15 border border-[#02E99B]/30 flex items-center justify-center shrink-0 text-[#02E99B]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">Transição Segura</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Brasil ➔ Europa</p>
                </div>
              </div>

            </div>

            {/* Lado Direito: Card 3 - Banca Estratégica · Marinho Ponci + 3 Especialistas */}
            <div className="flex flex-col gap-3 max-w-[280px] items-end">
              <div 
                className="bg-[#0A0E0B]/85 backdrop-blur-md border border-[#1E261C] p-2.5 sm:p-3 rounded-xl flex items-center gap-3 transition-transform duration-300 hover:scale-105 hover:border-[#02E99B]/60 cursor-default w-full"
                style={{
                  animation: 'heroBadgeFloat3 5s ease-in-out infinite 0.4s, heroBadgeGlow 3.8s ease-in-out infinite 0.5s'
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-[#02E99B]/15 border border-[#02E99B]/30 flex items-center justify-center shrink-0 text-[#02E99B]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">Banca Estratégica</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Marinho Ponci + 3 Especialistas</p>
                </div>
              </div>
            </div>

          </div>

          {/* Espaço no Mobile para enquadrar a foto do Marinho sem textos sobrepostos */}
          <div className="md:hidden h-[240px] sm:h-[300px]" />

          {/* 2. TÍTULO CENTRAL: RENTE AO CENÁRIO */}
          <div className="text-center mt-2 mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs font-mono font-black tracking-[0.3em] uppercase text-zinc-400 block mb-1">
              WORKSHOP ONLINE
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
              BRASIL <span className="text-[#02E99B] inline-block animate-pulse drop-shadow-[0_0_35px_rgba(2,233,155,0.85)]">›</span> EUROPA
            </h1>
          </div>

          {/* 3. SPLIT EM 2 COLUNAS: CENTRALIZADO NO MOBILE / SPLIT NO DESKTOP */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center text-center lg:text-left">
            
            {/* Coluna Esquerda: DO BÁSICO AO AVANÇADO + Headline com frase pulsando na linha */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest uppercase text-[#02E99B] block mb-2 mx-auto lg:mx-0">
                DO BÁSICO AO AVANÇADO
              </span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight max-w-xl mx-auto lg:mx-0">
                Não dependa mais da sorte ao expandir para a Europa.
                <span className="block mt-2 text-[#02E99B] font-black text-xl sm:text-3xl lg:text-4xl tracking-tight drop-shadow-[0_0_30px_rgba(2,233,155,0.75)] animate-pulse">
                  Com segurança e previsibilidade.
                </span>
              </h2>
            </div>

            {/* Coluna Direita: Copy alinhada + Botão Translúcido Grande + Subtexto */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-stretch text-center lg:text-left lg:pl-2">
              <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed mb-4 max-w-xl mx-auto lg:mx-0">
                <strong className="text-white font-bold">Como morar, empreender e levar sua empresa para a Europa.</strong> Te mostro o mapa completo e estruturado para você dar passos seguros, expandir seu patrimônio e internacionalizar seus negócios sem correr riscos desnecessários, com quem vive e atua no mercado europeu.
              </p>

              {/* Botão Translúcido / Glassmorphism Neon */}
              <button
                onClick={scrollToOffer}
                className="w-full max-w-md mx-auto lg:max-w-none py-4 sm:py-4.5 px-6 rounded-xl bg-[#02E99B] hover:bg-[#20f5aa] text-black font-black text-sm sm:text-base tracking-wide shadow-[0_0_30px_rgba(2,233,155,0.45)] hover:shadow-[0_0_55px_rgba(2,233,155,0.8)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Quero garantir minha vaga no Workshop agora!
                </span>
              </button>

              <span className="text-[10px] sm:text-[11px] text-zinc-400 text-center block mt-2">
                Clique no botão acima e garanta sua vaga para o encontro ao vivo em 28/11
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================
          BANNER DIVISOR CINÉTICO (TEXTURA REPETIDA UP + ANIMAÇÃO ZÍPER / ROLLING)
         ========================================================================= */}
      <div className="relative w-full bg-[#02E99B] text-black py-3.5 sm:py-4 overflow-hidden shadow-[0_0_35px_rgba(2,233,155,0.45)] border-y border-[#20f5aa]/60 select-none">
        
        {/* Textura de fundo repetida com o Up rolando */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "url('/up-pattern-tile.png')",
            backgroundSize: '36px 36px',
            backgroundRepeat: 'repeat',
            animation: 'ribbonTextureRoll 22s linear infinite',
          }}
        />

        {/* Ticker Cinético Deslizante / Efeito Zíper Contínuo */}
        <div 
          className="flex w-max items-center whitespace-nowrap"
          style={{ animation: 'tickerMarquee 28s linear infinite' }}
        >
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="flex items-center gap-6 sm:gap-8 px-4 font-black text-xs sm:text-sm tracking-wider uppercase text-black">
              <img src="/up-logo-transparent.png" alt="Up" className="h-5 sm:h-6 w-auto object-contain inline-block shrink-0 brightness-0" />
              <span>O MAPA PRÁTICO E SEGURO PARA VOCÊ E SUA EMPRESA NA EUROPA!</span>
              <span className="inline-block w-2 h-2 rounded-full bg-black/60" />
              <span>ENCONTRO AO VIVO · 28 DE NOVEMBRO</span>
              <span className="inline-block w-2 h-2 rounded-full bg-black/60" />
              <span>WORKSHOP BRASIL ➔ EUROPA</span>
              <span className="inline-block w-2 h-2 rounded-full bg-black/60" />
            </div>
          ))}
        </div>

        {/* Marcador triangular central apontando para baixo */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#02E99B] z-10" />
      </div>

      {/* =========================================================================
          SEÇÃO 1: PROGRAMAÇÃO APLICADA (O QUE VOCÊ VAI APRENDER NO ENCONTRO AO VIVO)
          Posicionada logo após a fita/ribbon, estilo referência com cards e setas
         ========================================================================= */}
      <section className="py-20 md:py-28 relative bg-[#060906] border-b border-[#1E261C] overflow-hidden">
        
        {/* Auras atmosféricas laterais */}
        <div 
          className="pointer-events-none absolute -left-24 top-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full opacity-20 blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(2, 233, 155, 0.5) 0%, transparent 70%)' }}
        />
        <div 
          className="pointer-events-none absolute -right-24 top-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full opacity-20 blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(2, 233, 155, 0.5) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Título Estilo Referência */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-mono font-bold text-[#02E99B] tracking-widest uppercase mb-3 block">
              PROGRAMAÇÃO APLICADA
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              O Que Você Vai Aprender <br />
              <span className="text-[#02E99B] drop-shadow-[0_0_25px_rgba(2,233,155,0.45)]">
                no encontro ao vivo:
              </span>
            </h2>
          </div>

          {/* Grid de 6 Itens no Estilo da Referência (Cards escuros com setas verdes e hover) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10 sm:mb-12">
            {[
              {
                title: 'Transição Segura e Planejamento Internacional',
                desc: 'Como organizar a saída do Brasil e a chegada na Europa com previsibilidade e método.'
              },
              {
                title: 'Estruturação da Sua Empresa na União Europeia',
                desc: 'Modelos societários em Portugal e outros países da UE para operar e faturar com solidez.'
              },
              {
                title: 'Vistos de Negócios e Residência',
                desc: 'O caminho prático para cada perfil de empresário ou profissional residir legalmente.'
              },
              {
                title: 'Erros Críticos que Custam Dinheiro',
                desc: 'As maiores armadilhas no início da operação e como blindar o seu capital.'
              },
              {
                title: 'Sessão de Perguntas ao Vivo com a Banca',
                desc: 'Espaço aberto para tirar suas dúvidas diretamente com Marinho e os convidados.'
              },
              {
                title: 'Gravação Integral Disponível',
                desc: 'Reveja todo o conteúdo e direcionamentos práticos após a transmissão ao vivo.'
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className="group relative bg-[#0D120E]/90 hover:bg-[#121913] border border-[#1E261C] hover:border-[#02E99B]/60 rounded-2xl p-6 sm:p-7 flex items-start gap-4 transition-all duration-300 shadow-[0_8px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_35px_rgba(2,233,155,0.18)] hover:-translate-y-1 cursor-default"
              >
                {/* Seta verde horizontal com animação sutil no hover */}
                <div className="shrink-0 mt-1 text-[#02E99B] group-hover:translate-x-1.5 transition-transform duration-300">
                  <svg className="w-5 h-5 text-[#02E99B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>

                {/* Conteúdo do item */}
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 leading-snug group-hover:text-[#02E99B] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de CTA Centralizado com Animação Pulsante & Hover */}
          <div className="flex flex-col items-center justify-center">
            <button
              onClick={scrollToOffer}
              className="relative group px-9 sm:px-12 py-4.5 sm:py-5 rounded-2xl bg-[#02E99B] hover:bg-[#20f5aa] text-black font-black text-base sm:text-lg tracking-wide shadow-[0_0_35px_rgba(2,233,155,0.5)] hover:shadow-[0_0_65px_rgba(2,233,155,0.85)] hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
              style={{
                animation: 'ctaGlowPulse 3.5s ease-in-out infinite'
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Quero garantir minha vaga no Workshop agora!
              </span>
            </button>
            <span className="text-[11px] sm:text-xs text-zinc-400 text-center block mt-3 font-medium">
              Clique no botão acima e garanta sua vaga para o encontro ao vivo em 28/11
            </span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 2: A BANCA DE ESPECIALISTAS (APRESENTAÇÃO COM MARINHO + 3 CONVIDADOS)
          Centralizado no mobile / Grid no desktop, com total conformidade
         ========================================================================= */}
      <section className="py-16 md:py-28 bg-[#080B07] border-b border-[#1E261C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-[#02E99B] tracking-widest uppercase mb-2 block">
              Banca de Especialistas
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Apresentação com <span className="text-[#02E99B]">Marinho Ponci</span> <br className="hidden sm:inline" />
              + 3 convidados estratégicos.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Especialista em Imigração */}
            <div className="bg-[#0E120D] border border-[#1E261C] hover:border-[#02E99B]/50 rounded-2xl p-6 sm:p-8 transition-all flex flex-col justify-between items-center text-center md:items-start md:text-left">
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#02E99B]/10 border border-[#02E99B]/30 flex items-center justify-center text-[#02E99B] mb-4 sm:mb-6 mx-auto md:mx-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#02E99B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Imigração & Vistos</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-[#02E99B] block mb-2 sm:mb-3">
                  Consultoria Estratégica
                </span>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
                  Vistos de empreendedor (D2), vistos de renda (D7), nômade digital, autorizações de residência na União Europeia e cidadania.
                </p>
              </div>
              <button onClick={scrollToOffer} className="text-[#02E99B] text-xs font-bold uppercase tracking-wider text-center md:text-left cursor-pointer">
                Tirar dúvidas no encontro →
              </button>
            </div>

            {/* Especialista em Estruturação Societária */}
            <div className="bg-[#0E120D] border border-[#1E261C] hover:border-[#02E99B]/50 rounded-2xl p-6 sm:p-8 transition-all flex flex-col justify-between items-center text-center md:items-start md:text-left">
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#02E99B]/10 border border-[#02E99B]/30 flex items-center justify-center text-[#02E99B] mb-4 sm:mb-6 mx-auto md:mx-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#02E99B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Estrutura Societária</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-[#02E99B] block mb-2 sm:mb-3">
                  Empresas & Transição
                </span>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
                  Abertura de empresa em Portugal e na UE, conformidade internacional, proteção patrimonial e planejamento de transição de negócios.
                </p>
              </div>
              <button onClick={scrollToOffer} className="text-[#02E99B] text-xs font-bold uppercase tracking-wider text-center md:text-left cursor-pointer">
                Tirar dúvidas no encontro →
              </button>
            </div>

            {/* Empresário Convidado */}
            <div className="bg-[#0E120D] border border-[#1E261C] hover:border-[#02E99B]/50 rounded-2xl p-6 sm:p-8 transition-all flex flex-col justify-between items-center text-center md:items-start md:text-left">
              <div>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#02E99B]/10 border border-[#02E99B]/30 flex items-center justify-center text-[#02E99B] mb-4 sm:mb-6 mx-auto md:mx-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#02E99B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">Operação Real na UE</h3>
                <span className="text-xs font-bold uppercase tracking-wider text-[#02E99B] block mb-2 sm:mb-3">
                  Vivência de Mercado
                </span>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
                  Custos reais em euros, formação de equipe local, negociação com parceiros e adaptação da oferta ao mercado europeu.
                </p>
              </div>
              <button onClick={scrollToOffer} className="text-[#02E99B] text-xs font-bold uppercase tracking-wider text-center md:text-left cursor-pointer">
                Tirar dúvidas no encontro →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 3: CHECKOUT CARD (INGRESSO R$ 300)
         ========================================================================= */}
      <section id="oferta" className="py-16 md:py-28 relative bg-[#080B07] border-t border-[#1E261C]">
        
        <div 
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[550px] opacity-35 blur-[120px] -z-10"
          style={{ background: 'radial-gradient(circle, rgba(2, 233, 155, 0.4) 0%, transparent 70%)' }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2 sm:mb-3">
              Garanta sua participação no dia <span className="text-[#02E99B]">28/11</span>
            </h2>
            <p className="text-zinc-400 text-xs sm:text-base max-w-lg mx-auto">
              Acesso completo ao Workshop online ao vivo + gravação integral + banca de especialistas.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-[#0A0D08] border-2 border-[#02E99B] rounded-3xl p-6 sm:p-12 shadow-[0_0_60px_rgba(2,233,155,0.28)] relative text-center">
            
            <div className="mb-6 sm:mb-8">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-white block">
                BRASIL ➔ EUROPA
              </span>
              <span className="text-xs tracking-widest text-[#02E99B] uppercase font-bold">
                ENCONTRO AO VIVO · 28 DE NOVEMBRO (28/11)
              </span>
            </div>

            <ul className="space-y-3 text-left mb-8 max-w-sm mx-auto text-xs sm:text-sm text-zinc-200">
              <li className="flex items-center gap-3">
                <span className="text-[#02E99B] font-bold">✓</span> Transmissão online ao vivo no dia 28/11.
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#02E99B] font-bold">✓</span> Apresentação completa com Marinho Ponci.
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#02E99B] font-bold">✓</span> Banca com especialistas convidados.
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#02E99B] font-bold">✓</span> Sessão aberta para dúvidas e perguntas diretas.
              </li>
              <li className="flex items-center gap-3 text-[#02E99B] font-bold">
                <span>✓</span> Acesso liberado à gravação completa do evento.
              </li>
            </ul>

            <div className="pt-6 border-t border-[#1E261C] mb-8">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold block mb-1">
                Lote de Lançamento
              </span>
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-[#02E99B]">R$</span>
                <span className="text-5xl sm:text-7xl font-black text-[#02E99B] tracking-tighter">
                  300
                </span>
                <span className="text-zinc-400 text-lg sm:text-xl font-bold">,00</span>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-4.5 sm:py-5 bg-[#02E99B] hover:bg-[#21F5A9] text-black font-black text-base sm:text-lg rounded-xl shadow-[0_0_30px_rgba(2,233,155,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-wide cursor-pointer mb-6"
            >
              Comprar Ingresso Agora • R$ 300
            </button>

            <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#1E261C] text-xs text-zinc-400">
              <span>Pagamento Seguro via Stripe</span>
              <span>•</span>
              <span>Sala Exclusiva</span>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SEÇÃO 4: SOBRE MARINHO PONCI (CENTRALIZADO NO MOBILE / SPLIT NO DESKTOP)
         ========================================================================= */}
      <section className="py-16 md:py-28 bg-[#050705] border-t border-[#1E261C]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[260px] sm:max-w-sm rounded-3xl overflow-hidden border border-[#1E261C] shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
                <img
                  src="/_DSC4243PB.jpg"
                  alt="Marinho Ponci"
                  className="w-full h-auto object-cover grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050705] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 text-left">
                  <span className="text-[10px] tracking-widest text-[#02E99B] font-black uppercase">
                    EXPANSÃO & FRANCHISING
                  </span>
                  <p className="text-sm font-bold text-white">Marinho Ponci</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#02E99B] uppercase tracking-wider mb-3 mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-[#02E99B]" />
                TRAJETÓRIA INTERNACIONAL
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4 sm:mb-6 text-center lg:text-left">
                Quem vai liderar o <br className="hidden sm:inline" />
                <span className="text-[#02E99B]">encontro com você?</span>
              </h2>

              <div className="space-y-4 text-zinc-300 text-xs sm:text-base leading-relaxed mb-8 text-center lg:text-left max-w-xl">
                <p>
                  Com quase <strong>40 anos de liderança empresarial</strong>, Marinho Ponci atua diretamente na 
                  internacionalização de marcas, formatação de redes e expansão de negócios entre o Brasil, Portugal, Espanha, Áustria e EUA.
                </p>
                <p>
                  No workshop <strong>Brasil ➔ Europa no dia 28/11</strong>, ele reúne essa vivência de trincheira ao lado de especialistas 
                  em transição internacional para entregar um roteiro objetivo e sem riscos desnecessários.
                </p>
              </div>

              <button
                onClick={scrollToOffer}
                className="w-full max-w-md mx-auto lg:mx-0 px-8 py-4 bg-[#02E99B] hover:bg-[#21F5A9] text-black font-extrabold text-sm sm:text-base rounded-full shadow-[0_0_25px_rgba(2,233,155,0.4)] hover:scale-105 active:scale-95 transition-all uppercase tracking-wide cursor-pointer text-center"
              >
                Garantir Ingresso para o Dia 28/11!
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER
         ========================================================================= */}
      <footer className="py-10 bg-[#050705] border-t border-[#1E261C] text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img src="/up-intelligence-logo.webp" alt="Úp.INTELLIG3NCE" className="h-5 w-auto object-contain" />
            <span>© 2026 Marinho Ponci & Úp.INTELLIG3NCE. Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-[#02E99B] transition-colors">Início</Link>
            <Link to="/empresarial" className="hover:text-[#02E99B] transition-colors">Consultoria</Link>
            <Link to="/franquia" className="hover:text-[#02E99B] transition-colors">Franquias</Link>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL DE INSCRIÇÃO & STRIPE CHECKOUT
         ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-[#0A0D08] border-2 border-[#02E99B] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(2,233,155,0.35)] text-left">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-6 text-center">
              <span className="text-[10px] tracking-widest text-[#02E99B] uppercase font-bold block mb-1">
                ENCONTRO AO VIVO · 28/11
              </span>
              <h3 className="text-2xl font-black text-white">Garantir Ingresso</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Preencha seus dados para emitir seu ingresso e prosseguir para o checkout seguro de R$ 300,00 via Stripe.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121611] border border-[#1E261C] focus:border-[#02E99B] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  E-mail Principal
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121611] border border-[#1E261C] focus:border-[#02E99B] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  WhatsApp com DDD/DDI
                </label>
                <input
                  type="tel"
                  required
                  placeholder="(DDD) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#121611] border border-[#1E261C] focus:border-[#02E99B] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors"
                />
              </div>

              <label className="flex items-start gap-3 text-xs text-zinc-300 leading-relaxed cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={marketingConsent} 
                  onChange={e => setMarketingConsent(e.target.checked)} 
                  className="mt-0.5 accent-[#02E99B]" 
                />
                <span>Aceito receber lembretes e link de acesso no WhatsApp.</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#02E99B] hover:bg-[#21F5A9] text-black font-extrabold text-base rounded-xl shadow-[0_0_25px_rgba(2,233,155,0.45)] transition-all uppercase tracking-wide cursor-pointer mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Conectando com Stripe...</span>
                ) : (
                  <span>Ir para Pagamento Seguro (R$ 300) →</span>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
