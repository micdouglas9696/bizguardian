# Redesign: Marinho Ponci + Up Intelligence

Estudo inicial para discussão. Conteúdo, nomenclatura e ofertas sujeitos à validação com Marinho e equipe. A análise se baseia nos arquivos do projeto e no material da reunião; não representa uma auditoria de métricas ou de produção.

## Leitura do site atual

- A página inicial se apresenta pela trajetória do Marinho e pela internacionalização. No topo, os visitantes encontram três caminhos: franqueado, marca e consultoria empresarial. A consultoria é um dos caminhos, mas organizar o dia a dia de pequenas e médias empresas ainda não é o eixo central da mensagem inicial.
- A página empresarial já possui uma sequência aproveitável: chamada inicial, público, apresentação do Marinho, áreas de ajuda, depoimentos, metodologia e formulário. A frase “Construir uma empresa é difícil. Não precisa fazer esse caminho sozinho” acolhe bem, mas a solução aparece de forma genérica e não apresenta a Up Intelligence nem seus produtos.
- O formulário pede nome, e-mail e WhatsApp, além de empresa, localidade e desafio opcionais. O código envia dados para a API e depois abre o WhatsApp; essas integrações devem ser preservadas e verificadas antes de qualquer troca.
- Os dossiês já possuem caminhos próprios: `/ebook` para franqueado e `/franqueador` para franqueador, além de versões em inglês e páginas de sucesso e membros. São ativos do funil, não apenas blocos da página inicial.
- A linguagem e o visual são bastante associados a consultoria premium, franquias e internacionalização. Expressões como “Histórias de Alto Padrão”, “reunião estratégica” e “pilares” podem ser traduzidas para uma conversa mais direta sobre dinheiro, rotina, equipe e decisões, sem abandonar a experiência existente.
- Há depoimentos em vídeo; eles podem reforçar a trajetória do Marinho. Antes de associá-los aos produtos novos, confirmar se os depoimentos descrevem essas ofertas. No código, um dos caminhos cadastrados como vídeo de Adriana termina em `.webp`; vale conferir o material antes de reutilizar.

## Hierarquia proposta

**Marinho Ponci** é a pessoa, apresenta sua trajetória e conecta o visitante à empresa. **Up Intelligence** é a empresa que reúne soluções. **ORG4NIZE.Up** é o caminho para organizar a operação de pequenas e médias empresas; **SC4LE.Up** atende empresas que já se organizaram e querem expandir. **Dossiês** permanecem como produtos da Up Intelligence, mantendo seus fluxos próprios. Os parceiros jurídicos e de outras áreas entram como rede de apoio, com escopo a confirmar.

## Experiência sugerida

1. **Início Marinho:** uma promessa direta para o empresário e uma apresentação breve da Up Intelligence. A ação principal leva a conhecer soluções; caminhos para dossiês continuam acessíveis.
2. **O momento do negócio:** situações reconhecíveis — entender entradas e saídas, colocar a rotina em ordem e preparar o próximo passo — antes de apresentar tecnologia.
3. **Produtos:** destaque para ORG4NIZE.Up; apresentação do SC4LE.Up e dos dossiês como alternativas para necessidades diferentes. Explicar o benefício antes do nome estilizado.
4. **Marinho e rede de parceiros:** experiência como sinal de confiança, sem sugerir que todos os atendimentos serão individuais ou prometer serviços jurídicos específicos.
5. **Como funciona:** apresentar a conversa como primeiro passo. Detalhes de contratação, entrega, acompanhamento e participação dos agentes precisam ser validados antes de promessas públicas.
6. **Próximo passo:** manter o formulário e seus eventos/encaminhamentos atuais quando houver implementação. Nesta versão visual, o formulário é apenas ilustrativo e não envia dados.

## Direção visual

Base preta e branca, com o verde vivo aproximado `#02e99b` amostrado do JPEG do símbolo. A cor é indicativa: validar com o arquivo original da marca. Usar verde para ações e elementos de orientação; texto preto sobre verde e branco sobre fundos escuros favorecem legibilidade. Reduzir excesso de caixa alta, espaçamento entre letras e efeitos dourados; manter fotografia do Marinho como elo pessoal.

## Pontos para validar antes de produzir

- A grafia pública oficial é Up.INTELLIG3NCE ou Up Intelligence? Como apresentar ORG4NIZE.Up e SC4LE.Up por extenso para facilitar leitura e busca?
- ORG4NIZE.Up já está disponível? O que o cliente contrata, quais entregas recebe e qual o papel dos nove agentes? Evitar prometer recursos, autonomia ou previsões ainda não confirmados.
- Qual o nível real de atendimento do Marinho, da equipe e dos parceiros? Como funciona o apoio jurídico e em quais localidades?
- Qual é o próximo passo comercial desejado: conversa, demonstração, diagnóstico ou outra opção? Há preço e público mínimo definidos?
- Quais depoimentos podem ser associados à nova oferta? Quais números e datas devem ser usados de forma consistente? O site menciona 38 anos e quase 40 anos.
- Antes da publicação, mapear URLs, parâmetros, eventos, formulários, pixels, páginas de pagamento, versões em inglês e área de membros. Fazer validação funcional e de mensuração antes da troca; comparar resultados por dados reais, sem assumir que o redesign converterá melhor.
