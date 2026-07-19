import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const CONTEXTO = `
OPERAÇÃO CANÇÕES GAÚCHAS 2026 (USA Discos + Editora Terra Sul). A maior plataforma digital de música gaúcha do Brasil.

ESTRUTURA E DIREITOS
- USA Discos: gravadora, titular de fonogramas e masters (ISRCs, gravações). Arrecada direitos conexos (streaming, YouTube, licenciamento de master).
- Editora Terra Sul: publisher, titular das obras (composições, letras, contratos). Arrecada direitos autorais pela UBC.
- Controle verticalizado: master + publishing na mesma mão — arrecada pelos dois lados, sem depender de terceiros. Raro entre catálogos regionais.
- Alex Hohenberger: CEO, mais de 40 anos no mercado fonográfico do RS. Cris Hohenberger: Diretora de Operações.
- Equipe: Giovana (Operações e YouTube), Luana (Conteúdo e Redes), Pedro (Distribuição), Raul, Letícia, Cynthia, Keles. Jurídico: Loyslene Jacques e Bernardo Haas.

CATÁLOGO
- 40 anos de acervo. 11.803 fonogramas auditados com ISRC e 1.608 álbuns com UPC.
- Mais de 350 artistas sob gestão (nativismo, vaneira, tradicionalista). Parte relevante já é falecida — acervo insubstituível.
- Concentração 80/20: 587 fonogramas (4,9% do catálogo) e 171 álbuns (10,6%) concentram 80% dos royalties.
- Acervo higienizado: títulos em caixa alta, ISRC validado, créditos revisados manualmente. Metadado errado vaza royalties.
- Riscos mapeados: 265 músicas sem ISRC no ECAD, 50+ processos no YouTube, 2 artistas com documentação a localizar.

YOUTUBE (jan a jul 2026)
- 524 mil inscritos, 6,2 mil vídeos. 42,7 milhões de views, 2,48 milhões de horas de exibição no semestre.
- +30,4 mil inscritos líquidos. Receita estimada US$ 29.365 no semestre. 100% orgânico (tráfego pago zerado).
- 4º canal mais sugerido na busca por "música gaúcha". 79,7% das views vêm de não inscritos.
- Funil de impressões: 187,5 milhões de impressões, CTR de 5,1%.
- Retenção: 47,6% continuam assistindo após o início. Duração média por vídeo: 4:25.
- Vídeos longos = 96,2% do tempo de exibição. Consumo na Smart TV = 41,8% do tempo total (sessões longas, domésticas).
- Shorts: 13,1 milhões de views, 226,7 mil curtidas, 83,7% vindas do feed de Shorts. Motor de descoberta de novos ouvintes.
- Lives: duração média 13:41, 89,9% de espectadores recorrentes.

PÚBLICO
- 75,6% masculino. Quase 78% tem mais de 35 anos: 65+ (23%), 55-64 (20,3%), 45-54 (18,7%), 35-44 (15,8%), 25-34 (13%).
- Geografia: 95,9% no Brasil, raiz no Sul (Porto Alegre, Curitiba, Caxias do Sul, Florianópolis), presença em São Paulo.
- Alcance global: mais de 40 países, incluindo Argentina, Paraguai, Uruguai, Portugal e EUA.
- Público fiel e maduro — ligado à memória e à tradição. Gera receita previsível e recorrente.

COMUNIDADE E ENGAJAMENTO
- O usuário está no centro de tudo. Comentários e enquetes mantêm a audiência ativa e sinalizam ao algoritmo.
- ManyChat automatiza respostas em posts com mais de 1.000 comentários.
- Em 2025: +1.339 conteúdos publicados no Facebook e +1.144 no Instagram (sem contar stories e criativos). 5 posts/dia, mês inteiro agendado.

TOP ARTISTAS E MÚSICAS 2026
- Artistas mais tocados: Porca Véia, Garotos de Ouro, Luiz Marenco, Baitaca, José Cláudio Machado, Os Serranos, Joca Martins, João Luiz Corrêa, Xiru Missioneiro, Leopoldo Rassier.
- Top músicas: Milonga abaixo de Mau Tempo (José Cláudio Machado), Capricha Gaiteiro (Garotos de Ouro), Nego Bom não se Mistura (Baitaca).
- Baitaca: 630 mil ouvintes mensais, 2,4 mi streams, +78 mil novos seguidores nos últimos 28 dias.
- Porca Véia: 362 mil ouvintes mensais, 2,8 mi streams, 23 mil super ouvintes. Mais tocado do catálogo.
- Luiz Marenco: 354 mil ouvintes mensais, 2 mi streams, 13 mil super ouvintes.
- João Luiz Corrêa: 489 mil ouvintes mensais. Único contrato do catálogo com cláusula de exceção de 2%.

PLAYLISTS E DISTRIBUIÇÃO
- 362 playlists ativas por plataforma (Spotify, Deezer, YouTube, Amazon). Mais de 1.400 vitrines sincronizadas.
- 10 playlists e 10 coletâneas novas por mês. Playlist "As 100 Melhores": 14,3 milhões de views.
- Coletâneas nascem por dados (busca semântica), com curadoria faixa a faixa. Compilações longas atendem consumo na Smart TV.
- Redes sociais 2025: Facebook 94 mil seguidores, Instagram 207 mil, TikTok 98 mil, Threads 23 mil.

GOVERNANÇA E FERRAMENTAS
- 19 planilhas padronizadas, 7 dashboards de BI (Power BI e Looker). Metas por consenso, trimestres e gamificação com mais de R$ 3.000 em incentivos em 2026. Reuniões transcritas com IA.
- Grade editorial fixa: Segunda da Nostalgia, Terça do Artista, Quarta da Milonga, Quinta Campeira, Sexta das Coletâneas, Sábado da Vaneira, Domingo Temático.
- Arsenal: Asana, Google Workspace, FUGA, Tune My Music, MLabs, ManyChat, Found.ee, Chartmetric, SemRush, Google Trends.
- IA na operação: Freepik (imagens 4K), Sora e Grok (vídeos), Gemini (transcrição de reuniões), Claude (leitura de indicadores). Toda entrega passa por validação humana.
- Sistema próprio e independente com todos os dados do catálogo — soberania total se trocar de distribuidora.

JURÍDICO E SEGURANÇA
- Proteção ativa: Loyslene Jacques e Bernardo Haas, fluxo de 8 etapas, Content ID verificado semanalmente.
- Segurança: 2FA obrigatório, 2 administradores em máquinas bloqueadas, auditoria mensal de logs. Tentativa de invasão na Semana Farroupilha foi neutralizada.

REBRANDING E FUTURO
- Rebranding de "Canções Gaúchas" para "Músicas Gaúchas" (SEO). Site: asmelhorescancoesgauchas.com.br (Cloudflare + Hostinger).
- Oportunidades: música gaúcha com IA (custo marginal quase zero) e automação total de distribuição e curadoria.
- Semana Farroupilha é o pico de faturamento do ano (2º semestre). Comparações com semestre anterior refletem sazonalidade.
- Editora Terra Sul: turnaround completo — contratos validados, obras cadastradas na UBC, faturamento dos últimos 5 anos reconstituído, pagamentos regularizados (exceto 7 autores não localizados).
`.trim();

router.post("/perguntar", async (req, res) => {
  const pergunta = req.body?.pergunta;
  const slideAtual: string = req.body?.slideAtual ?? "";

  if (!pergunta || typeof pergunta !== "string" || !pergunta.trim()) {
    res.status(400).json({ erro: "Pergunta vazia" });
    return;
  }

  const slideCtxLine = slideAtual
    ? `\nCONTEXTO DO SLIDE ATUAL DO APRESENTADOR: "${slideAtual}"\n`
    : "";

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      system:
        "Você é a Maya, assistente de inteligência da Operação Canções Gaúchas 2026 (USA Discos + Editora Terra Sul). " +
        "Você está embutida numa apresentação institucional confidencial para parceiros estratégicos. " +
        "Responda APENAS sobre o conteúdo desta operação, com base exclusivamente no contexto fornecido. " +
        "Formato obrigatório: respostas curtas (3 a 6 frases), diretas, em português profissional do Brasil. " +
        "Use **negrito** ao redor de números, nomes e termos-chave (ex: **42,7 milhões**, **Porca Véia**). " +
        "Se o campo CONTEXTO DO SLIDE ATUAL estiver preenchido, use-o para dar mais relevância à resposta. " +
        "Não invente dados — se a informação não estiver no contexto, diga exatamente: 'Não tenho esse dado disponível aqui.' " +
        "Se a pergunta não for sobre a Operação Canções Gaúchas, diga: 'Sou exclusiva desta operação.'",
      messages: [
        {
          role: "user",
          content: `CONTEXTO DA OPERAÇÃO:\n${CONTEXTO}${slideCtxLine}\nPERGUNTA:\n${pergunta.trim()}`,
        },
      ],
    });

    const texto = message.content
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.json({ resposta: texto || "Não consegui responder agora." });
  } catch (e) {
    req.log.error({ err: e }, "Erro ao consultar IA");
    res.status(500).json({ erro: "Falha ao consultar a IA" });
  }
});

export default router;
