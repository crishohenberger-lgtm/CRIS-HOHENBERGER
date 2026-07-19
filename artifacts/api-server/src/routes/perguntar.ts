import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const CONTEXTO = `
OPERAÇÃO CANÇÕES GAÚCHAS 2026 (USA Discos + Editora Terra Sul). A maior plataforma digital de música gaúcha do Brasil.

ESTRUTURA E DIREITOS
- USA Discos: gravadora, titular de fonogramas e masters (ISRCs, gravações). Receita de direitos conexos (streaming, YouTube, licenciamento).
- Editora Terra Sul: editora (publisher), titular das obras (composições, letras, contratos). Arrecada direitos autorais pela UBC.
- Controle verticalizado: master + publishing na mesma mão, sem depender de terceiros.
- Alex Hohenberger: mais de 40 anos no mercado fonográfico do RS. Cris Hohenberger: Diretora de Operações.

CATÁLOGO
- 40 anos de acervo. 11.893 fonogramas com ISRC e 1.608 álbuns com UPC.
- Mais de 350 artistas sob gestão (nativismo, vaneira, tradicionalista). Parte relevante já é falecida, tornando o acervo insubstituível.
- Concentração 80/20: 587 fonogramas (4,9%) e 171 álbuns (10,6%) concentram 80% dos royalties.

YOUTUBE (jan a jul 2026)
- 524 mil inscritos, 6,2 mil vídeos. 42,7 milhões de views no semestre, 2,48 milhões de horas de exibição.
- +30,4 mil inscritos líquidos. Receita estimada US$ 29.365 no semestre.
- 100% orgânico (tráfego pago zerado). 4º canal mais sugerido na busca por "música gaúcha".
- Vídeos longos = 96,2% do tempo de exibição. Shorts = 13,1 mi views, 226,7 mil curtidas, 83,7% vindas do feed.
- 79,7% das views vêm de não inscritos. Funil: 187,5 mi impressões, CTR 5,1%. Smart TV = 41,8% do tempo de exibição.
- Retenção: 47,6% continuam assistindo após o início, duração média 4:25. Lives: média 13:41, 89,9% de espectadores recorrentes.

PÚBLICO
- 75,6% masculino. Idade: 65+ 23%, 55-64 20,3%, 45-54 18,7%, 35-44 15,8%, 25-34 13% (quase 78% acima de 35 anos).
- Geografia: Brasil 95,9%, raiz no Sul (Porto Alegre, Curitiba, Caxias, Florianópolis), presença em São Paulo.
- Alcance: mais de 40 países (Argentina, Paraguai, Uruguai, Portugal, EUA).

TOP 2026
- Artistas: Porca Véia, Garotos de Ouro, Luiz Marenco, Baitaca, José Cláudio Machado, Os Serranos, Joca Martins, João Luiz Corrêa, Xiru Missioneiro, Leopoldo Rassier.
- Músicas: Milonga abaixo de Mau Tempo (José Cláudio Machado), Capricha Gaiteiro (Garotos de Ouro), Nego Bom não se Mistura (Baitaca).
- Baitaca: 630 mil ouvintes mensais, 2,4 mi streams, 78 mil novos seguidores.
- Porca Véia: 362 mil ouvintes mensais, 2,8 mi streams, 23 mil super ouvintes. Mais tocado do catálogo.
- Luiz Marenco: 354 mil ouvintes mensais, 2 mi streams, 13 mil super ouvintes.
- João Luiz Corrêa: 489 mil ouvintes mensais. Único contrato com cláusula de exceção de 2%.

PLAYLISTS E REDES
- 362 playlists ativas por plataforma (Spotify, Deezer, YouTube, Amazon), 1.400+ vitrines, 10 playlists e 10 coletâneas novas por mês.
- Playlist "As 100 Melhores": 14,3 milhões de views.
- 2025: Facebook 94 mil, Instagram 207 mil, TikTok 98 mil, Threads 23 mil. 5 posts/dia, mês inteiro agendado.

MÁQUINA E GOVERNANÇA
- 19 planilhas padronizadas, 7 dashboards de BI (Power BI, Looker). Reuniões transcritas com IA.
- Metas em consenso, desdobradas em trimestres, gamificação com mais de R$ 3.000 em incentivos em 2026.
- Ferramentas: Asana, Google Workspace, FUGA, Tune My Music, MLabs, ManyChat, Found.ee, Chartmetric, SemRush.
- IA: Freepik (imagens 4K), Sora e Grok (vídeos), Gemini (transcrição), Claude (indicadores). Toda entrega passa por validação humana.
- Grade editorial fixa: Segunda da Nostalgia, Terça do Artista, Quarta da Milonga, Quinta Campeira, Sexta das Coletâneas, Sábado da Vaneira, Domingo Temático.

JURÍDICO E SEGURANÇA
- Proteção ativa por Loyslene Jacques e Bernardo Haas, fluxo de 8 etapas, Content ID semanal.
- Riscos em tratamento: 265 músicas sem ISRC no ECAD, 50+ processos no YouTube, 2 artistas com documentação a localizar.
- Segurança: 2FA obrigatório, 2 administradores em máquinas bloqueadas, auditoria mensal de logs. Incidente na Semana Farroupilha neutralizado.
- Sistema próprio e independente com todos os dados do catálogo — soberania total se trocar de distribuidora.

REBRANDING E FUTURO
- Rebranding de "As Melhores Canções Gaúchas" para "As Melhores Músicas Gaúchas" (SEO). Site: asmelhorescancoesgauchas.com.br.
- Oportunidades: música gaúcha com IA (custo marginal quase zero) e automação total de distribuição e curadoria.
- Semana Farroupilha é o pico de faturamento do ano (2º semestre).
- Editora Terra Sul passou por turnaround completo: contratos validados, obras cadastradas, faturamento dos últimos 5 anos reconstituído.
`.trim();

router.post("/perguntar", async (req, res) => {
  const pergunta = req.body?.pergunta;

  if (!pergunta || typeof pergunta !== "string" || !pergunta.trim()) {
    res.status(400).json({ erro: "Pergunta vazia" });
    return;
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system:
        "Você é a Maya, assistente exclusiva da operação As Melhores Canções Gaúchas (USA Discos + Editora Terra Sul). " +
        "Responda APENAS com base no contexto fornecido. Seja direta, objetiva e use linguagem profissional em português. " +
        "Não invente números ou informações que não estejam no contexto. Se não souber, diga que não tem essa informação.",
      messages: [
        {
          role: "user",
          content: `CONTEXTO DA OPERAÇÃO:\n${CONTEXTO}\n\nPERGUNTA:\n${pergunta.trim()}`,
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
