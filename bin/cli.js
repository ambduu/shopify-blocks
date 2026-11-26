#!/usr/bin/env node
// shopify-blocks CLI — copy ready-made sections into your Shopify theme.
// Zero dependencies. Usage:
//   npx github:ambduu/shopify-blocks list
//   npx github:ambduu/shopify-blocks add faq-accordion countdown-banner
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry.json'), 'utf8'));

const tty = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (tty ? `\x1b[${code}m${s}\x1b[0m` : String(s));
const c = { bold: paint(1), dim: paint(2), green: paint(32), yellow: paint(33), red: paint(31), orange: paint('38;5;209') };

function help() {
  console.log(`
${c.orange('▲ shopify-blocks')} — copy-paste sections for Shopify themes

${c.bold('Usage')}
  npx github:ambduu/shopify-blocks ${c.bold('list')}
  npx github:ambduu/shopify-blocks ${c.bold('add')} <block...> [--dir <theme>] [--force] [--prefix <p>]
  npx github:ambduu/shopify-blocks ${c.bold('add --all')}

${c.bold('Options')}
  --dir <path>     Theme folder (default: current folder)
  --force          Overwrite files that already exist
  --prefix <p>     File name prefix (default: "sb-") — sections/sb-faq-accordion.liquid
  --all            Add every block

${c.bold('Browse with live previews')}  ${registry.homepage}
`);
}

function list() {
  console.log(`\n${c.orange('▲ shopify-blocks')} ${c.dim(`— ${registry.blocks.length} blocks`)}\n`);
  const w = Math.max(...registry.blocks.map((b) => b.name.length));
  for (const b of registry.blocks) {
    console.log(`  ${c.bold(b.name.padEnd(w))}  ${b.description}`);
  }
  console.log(`\n  Add one:  ${c.dim('npx github:ambduu/shopify-blocks add faq-accordion')}`);
  console.log(`  Previews: ${c.dim(registry.homepage)}\n`);
}

function parseArgs(argv) {
  const opts = { dir: process.cwd(), force: false, prefix: 'sb-', all: false, names: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir') opts.dir = path.resolve(argv[++i] || '.');
    else if (a === '--force' || a === '-f') opts.force = true;
    else if (a === '--prefix') opts.prefix = argv[++i] ?? '';
    else if (a === '--all') opts.all = true;
    else if (a.startsWith('-')) { console.error(c.red(`Unknown option ${a}`)); process.exit(1); }
    else opts.names.push(a);
  }
  return opts;
}

function looksLikeTheme(dir) {
  return ['sections', 'layout', 'templates', 'config'].filter((d) => fs.existsSync(path.join(dir, d))).length >= 2;
}

function add(argv) {
  const opts = parseArgs(argv);
  const names = opts.all ? registry.blocks.map((b) => b.name) : opts.names;
  if (!names.length) {
    console.error(c.red('Tell me which block to add, e.g.  add faq-accordion   (or run "list")'));
    process.exit(1);
  }
  if (!looksLikeTheme(opts.dir)) {
    console.error(c.red(`\n${opts.dir} doesn't look like a Shopify theme folder.`));
    console.error(`Run this inside your theme (the folder with sections/, layout/, templates/), or pass --dir <path>.\n`);
    process.exit(1);
  }
  const sectionsDir = path.join(opts.dir, 'sections');
  fs.mkdirSync(sectionsDir, { recursive: true });

  let added = 0;
  console.log('');
  for (const name of names) {
    const entry = registry.blocks.find((b) => b.name === name);
    if (!entry) {
      const close = registry.blocks.filter((b) => b.name.includes(name.split('-')[0])).map((b) => b.name);
      console.log(`  ${c.red('✗')} ${name} ${c.dim('— no such block' + (close.length ? `. Did you mean: ${close.join(', ')}?` : ''))}`);
      continue;
    }
    const src = path.join(ROOT, 'blocks', `${name}.liquid`);
    const dest = path.join(sectionsDir, `${opts.prefix}${name}.liquid`);
    const rel = path.relative(process.cwd(), dest) || dest;
    if (fs.existsSync(dest) && !opts.force) {
      console.log(`  ${c.yellow('•')} ${rel} ${c.dim('already exists — use --force to overwrite')}`);
      continue;
    }
    fs.copyFileSync(src, dest);
    console.log(`  ${c.green('✓')} ${rel}`);
    added++;
  }
  if (added) {
    console.log(`\n${c.green(`Added ${added} block${added === 1 ? '' : 's'}.`)} Next steps:`);
    console.log(`  1. ${c.dim('shopify theme dev')}  (or push the theme)`);
    console.log(`  2. Open the theme editor → ${c.bold('Add section')} → pick your new section\n`);
  } else {
    console.log('');
  }
}

const [cmd, ...rest] = process.argv.slice(2);
if (cmd === 'list' || cmd === 'ls') list();
else if (cmd === 'add' || cmd === 'a') add(rest);
else help();
