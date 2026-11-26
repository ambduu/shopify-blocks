/* global liquidjs */
// Renders every block's live preview in the browser with LiquidJS,
// using the defaults from each section's {% schema %} and first preset.
(async function () {
  const registry = await fetch('registry.json').then((r) => r.json());
  const engine = new liquidjs.Liquid({ strictFilters: false, strictVariables: false });

  // {% schema %} … {% endschema %} → render nothing
  engine.registerTag('schema', {
    parse(_tok, remain) {
      while (remain.length) {
        const t = remain.shift();
        if (t.name === 'endschema') return;
      }
    },
    render() { return ''; },
  });

  // Shopify-only filters, stubbed for previews
  engine.registerFilter('image_url', (img) => (img && img.src) || '');
  engine.registerFilter('image_tag', (src, ...args) => (src ? `<img src="${src}" alt="">` : ''));
  engine.registerFilter('placeholder_svg_tag', (name) => {
    const hue = /2$/.test(String(name)) ? 200 : 20;
    return `<svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g${hue}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${hue} 70% 82%)"/><stop offset="1" stop-color="hsl(${hue + 30} 60% 58%)"/></linearGradient></defs>
      <rect width="400" height="250" fill="url(#g${hue})"/>
      <circle cx="300" cy="70" r="34" fill="rgba(255,255,255,.6)"/>
      <path d="M0 250 L120 120 L210 200 L280 150 L400 250Z" fill="rgba(0,0,0,.18)"/></svg>`;
  });
  // Shopify divides integers with integer division
  engine.registerFilter('divided_by', (a, b) => {
    const r = Number(a) / Number(b);
    return Number.isInteger(Number(a)) && Number.isInteger(Number(b)) ? Math.floor(r) : r;
  });

  function buildSection(schema) {
    const settings = {};
    for (const s of schema.settings || []) settings[s.id] = s.default ?? (s.type === 'checkbox' ? false : '');
    const preset = (schema.presets && schema.presets[0]) || {};
    const blocks = (preset.blocks || []).map((pb, i) => {
      const def = (schema.blocks || []).find((b) => b.type === pb.type) || { settings: [] };
      const bs = {};
      for (const s of def.settings || []) bs[s.id] = s.default ?? '';
      return { id: `b${i}`, type: pb.type, settings: { ...bs, ...(pb.settings || {}) }, shopify_attributes: '' };
    });
    blocks.size = blocks.length;
    return { id: 'preview', settings, blocks };
  }

  const frameCSS = `<style>
    html,body{margin:0;font:16px/1.5 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#1d1b24}
    *{box-sizing:border-box}</style>`;

  function fitFrame(iframe) {
    const doc = iframe.contentDocument;
    if (!doc) return;
    const h = doc.body ? Math.ceil(doc.body.getBoundingClientRect().height) : 0;
    iframe.style.height = Math.min(Math.max(h, 60), 900) + 'px';
  }

  function flash(btn, text = 'Copied!') {
    const old = btn.textContent;
    btn.textContent = text;
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = old; btn.classList.remove('copied'); }, 1400);
  }
  async function copy(text, btn) {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); ta.remove();
    }
    flash(btn);
  }

  document.querySelectorAll('.hero .cmd .copy').forEach((btn) => {
    btn.addEventListener('click', () => copy(btn.closest('.cmd').dataset.copy, btn));
  });

  const main = document.getElementById('blocks');
  const tpl = document.getElementById('card-tpl');

  for (const entry of registry.blocks) {
    const source = await fetch(`blocks/${entry.name}.liquid`).then((r) => r.text());
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.card');
    card.id = entry.name;
    node.querySelector('.title').textContent = entry.title;
    node.querySelector('.desc').textContent = entry.description;
    node.querySelector('.pane-code code').textContent = source;
    const cmd = `npx github:ambduu/shopify-blocks add ${entry.name}`;
    node.querySelector('.add-cmd').textContent = cmd;
    const iframe = node.querySelector('iframe');
    iframe.title = `${entry.title} preview`;

    node.querySelector('.small-cmd .copy').addEventListener('click', (e) => copy(cmd, e.currentTarget));
    node.querySelector('.copy-code').addEventListener('click', (e) => copy(source, e.currentTarget));
    node.querySelectorAll('.tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        card.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
        card.querySelector('.pane-preview').hidden = tab.dataset.tab !== 'preview';
        card.querySelector('.pane-code').hidden = tab.dataset.tab !== 'code';
      });
    });
    main.appendChild(node);

    try {
      const m = source.match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
      const schema = JSON.parse(m[1]);
      const html = await engine.parseAndRender(source, { section: buildSection(schema) });
      iframe.srcdoc = `<!DOCTYPE html><html><head>${frameCSS}</head><body>${html}</body></html>`;
      iframe.addEventListener('load', () => {
        fitFrame(iframe);
        setTimeout(() => fitFrame(iframe), 400);
      });
    } catch (err) {
      iframe.srcdoc = `<p style="padding:20px;font-family:sans-serif;color:#b00">Preview failed: ${String(err.message || err)}</p>`;
      console.error(entry.name, err);
    }
  }
  if (location.hash) document.querySelector(location.hash)?.scrollIntoView();
})();
