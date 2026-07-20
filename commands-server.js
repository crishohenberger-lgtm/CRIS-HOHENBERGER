/**
 * Servidor de comandos — As Melhores Músicas Gaúchas
 * Recebe saves do editor da equipe, aplica reordenação de slides e commita no GitHub.
 */
const http   = require('http');
const { execSync } = require('child_process');
const path   = require('path');
const fs     = require('fs');

const PORT       = 5000;
const WORKSPACE  = __dirname;
const HTML_FILE  = path.join(WORKSPACE, 'asmelhoresmusicasgauchas/index.html');
const PENDING    = path.join(WORKSPACE, 'team-commands.json');

// ── Extração de slides do HTML ───────────────────────────────
function extractSlides(html) {
  const marker = '<section class="slide';
  const firstIdx = html.indexOf(marker);
  if (firstIdx === -1) return { prefix: html, slides: [], suffix: '' };

  const prefix = html.substring(0, firstIdx);
  const slides = [];
  let pos = firstIdx;

  while (pos < html.length) {
    const sStart = html.indexOf(marker, pos);
    if (sStart === -1) break;

    let depth = 0, i = sStart;
    while (i < html.length) {
      if (html[i] === '<') {
        if (html.substring(i, i + 8) === '<section')  depth++;
        else if (html.substring(i, i + 10) === '</section>') {
          depth--;
          if (depth === 0) {
            const end = i + 10;
            slides.push(html.substring(sStart, end));
            pos = end;
            // pula espaço/newline entre slides
            while (pos < html.length && '\n\r '.includes(html[pos])) pos++;
            break;
          }
        }
      }
      i++;
    }
    if (depth !== 0) break;
  }

  return { prefix, slides, suffix: html.substring(pos) };
}

// ── Atualiza atributos data-menu e data-num numa section ─────
function updateAttrs(section, menu, num) {
  if (menu != null) section = section.replace(/data-menu="[^"]*"/, `data-menu="${menu.replace(/"/g, '&quot;')}"`);
  if (num  != null) section = section.replace(/data-num="[^"]*"/,  `data-num="${num}"`);
  return section;
}

// ── Cria section placeholder ─────────────────────────────────
function makePH(menu, num, brief) {
  const m = (menu  || 'Novo slide — a definir').replace(/"/g, '&quot;');
  const b = (brief || '').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return `<section class="slide ed-placeholder" data-act="interno" data-menu="${m}" data-num="${num||''}" data-brief="${b}">
  <div class="slide-in"><div class="ed-ph-inner"><div class="ed-ph-icon">+</div><p>${m}</p><div class="ed-ph-brief-wrap"><label class="ed-ph-brief-label">Briefing para o agente</label><textarea class="ed-ph-brief no-adv">${(brief||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</textarea></div></div></div>
</section>`;
}

// ── Aplica nova ordem ─────────────────────────────────────────
function applyOrder(html, order) {
  const { prefix, slides, suffix } = extractSlides(html);
  if (!slides.length) return { html, ok: false, reason: 'Nenhum slide encontrado no HTML' };

  const newSlides = [];
  for (const k of order) {
    if (typeof k === 'number') {
      if (slides[k]) newSlides.push(slides[k]);
      else console.warn(`Slide index ${k} não encontrado (total: ${slides.length})`);
    } else if (k && typeof k === 'object') {
      if (typeof k.orig === 'number') {
        if (slides[k.orig]) newSlides.push(updateAttrs(slides[k.orig], k.menu, k.num));
      } else if (k.ph) {
        newSlides.push(makePH(k.menu, k.num, k.brief));
      }
    }
  }

  if (!newSlides.length) return { html, ok: false, reason: 'Ordem resultou em zero slides' };
  return { html: prefix + newSlides.join('\n') + '\n' + suffix, ok: true };
}

// ── Servidor HTTP ─────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── POST /api/commands ── recebe save da equipe ──────────────
  if (req.method === 'POST' && req.url === '/api/commands') {
    let body = '';
    req.on('data', c => body += c.toString());
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const ts   = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        let applied = false, applyMsg = '';

        // aplica reordenação automática
        if (Array.isArray(data.order) && data.order.length) {
          try {
            const raw = fs.readFileSync(HTML_FILE, 'utf8');
            const result = applyOrder(raw, data.order);
            if (result.ok) {
              fs.writeFileSync(HTML_FILE, result.html);
              applied = true;
              applyMsg = `${data.order.length} slides reordenados`;
              console.log(`[${ts}] ${applyMsg}`);
            } else {
              applyMsg = result.reason;
              console.warn(`[${ts}] Não aplicou: ${applyMsg}`);
            }
          } catch (e) {
            applyMsg = e.message;
            console.error(`[${ts}] Erro ao aplicar:`, e.message);
          }
        }

        // salva notas e comando geral para revisão do agente
        const pending = {
          savedAt: ts,
          status: 'pending',
          orderApplied: applied,
          applyMsg,
          notes: data.notes     || {},
          globalCmd: data.globalCmd || ''
        };
        fs.writeFileSync(PENDING, JSON.stringify(pending, null, 2));

        // commit + push
        try {
          const files = applied
            ? 'asmelhoresmusicasgauchas/index.html team-commands.json'
            : 'team-commands.json';
          const msg = applied
            ? `Equipe: ${applyMsg} — ${ts}`
            : `Equipe: comandos salvos — ${ts}`;
          execSync(
            `git add ${files} && git commit -m "${msg}" && git push origin main`,
            { cwd: WORKSPACE, stdio: 'pipe' }
          );
          console.log(`[${ts}] Git push OK`);
        } catch (e) {
          console.error(`[${ts}] Git push falhou:`, e.stderr?.toString() || e.message);
        }

        const hasPending = Object.keys(pending.notes).length > 0 || pending.globalCmd;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, applied, applyMsg, hasPending, ts }));

      } catch (e) {
        console.error('Erro no POST:', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ── GET /api/commands ── retorna comandos pendentes ──────────
  if (req.method === 'GET' && req.url === '/api/commands') {
    const data = fs.existsSync(PENDING)
      ? fs.readFileSync(PENDING, 'utf8')
      : JSON.stringify({ status: 'empty' });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
    return;
  }

  // ── GET /* ── serve a apresentação ───────────────────────────
  if (req.method === 'GET') {
    const url   = req.url.split('?')[0];
    const STATIC = path.join(WORKSPACE, 'asmelhoresmusicasgauchas');
    let   target = url === '/' ? '/index.html' : url;
    // segurança: bloqueia path traversal
    const resolved = path.resolve(STATIC, '.' + target);
    if (!resolved.startsWith(STATIC)) { res.writeHead(403); res.end('Forbidden'); return; }
    if (fs.existsSync(resolved)) {
      const ext = path.extname(resolved).toLowerCase();
      const mime = {
        '.html': 'text/html; charset=utf-8',
        '.css':  'text/css',
        '.js':   'application/javascript',
        '.png':  'image/png',
        '.jpg':  'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg':  'image/svg+xml',
        '.ico':  'image/x-icon',
        '.woff2':'font/woff2',
        '.woff': 'font/woff'
      }[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(fs.readFileSync(resolved));
    } else {
      // fallback: index.html (SPA)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(STATIC, 'index.html')));
    }
    return;
  }
  res.writeHead(405); res.end('Method not allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de comandos rodando na porta ${PORT}`);
  console.log(`HTML: ${HTML_FILE}`);
});
