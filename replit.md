# Operação Canções Gaúchas 2026

Apresentação institucional interativa da Operação Canções Gaúchas (USA Discos + Editora Terra Sul), com 125 slides e a assistente de IA Maya integrada via Claude.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API server (porta 8080, via proxy `/api`)
- `pnpm --filter @workspace/apresentacao run dev` — Apresentação (porta dinâmica, raiz `/`)
- `pnpm run typecheck` — typecheck completo
- `pnpm run build` — typecheck + build
- Não requer DATABASE_URL para funcionar (a apresentação e a Maya não usam banco)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Apresentação: HTML/CSS/JS vanilla (auto-contido), servido via Vite
- API: Express 5
- IA (Maya): Anthropic Claude via Replit AI Integrations (sem chave própria)
- DB: PostgreSQL + Drizzle ORM (disponível mas não usado ainda)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/apresentacao/index.html` — a apresentação completa (125 slides, CSS e JS inline)
- `artifacts/api-server/src/routes/perguntar.ts` — rota `/api/perguntar` (Maya com Claude)
- `lib/integrations-anthropic-ai/` — cliente Anthropic via Replit AI Integrations
- `attached_assets/` — arquivos originais enviados pela usuária

## Acesso

- Senha da apresentação: `@12345` (definida no próprio HTML, linha ~2070)
- Endpoint da Maya: `POST /api/perguntar` com body `{ "pergunta": "..." }`
- Retorna: `{ "resposta": "..." }`

## Publicação no domínio cristinaditgen.com.br

Para publicar no domínio personalizado:
1. Clique em "Publish" aqui no Replit para obter a URL de produção
2. No registrador do domínio, aponte um CNAME para a URL do Replit
3. Ou use GitHub + Vercel/Netlify com o arquivo `api/perguntar.js` que está nos arquivos enviados

## User preferences

- Não cortar nenhum slide — apenas adicionar conteúdo
- Publicar em cristinaditgen.com.br
- Maya é a IA assistente da apresentação (já nomeada no contexto)

## Gotchas

- A apresentação é HTML vanilla puro — não usa React nem componentes Vite
- O Vite serve o `index.html` diretamente, sem processar JSX/TSX
- A senha está hardcoded no HTML (`@12345`) — para trocar, edite a linha com `var SENHA`
- O contexto da Maya está em `perguntar.ts` — para adicionar dados, edite o `CONTEXTO`
