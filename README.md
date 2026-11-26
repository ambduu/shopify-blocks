<div align="center">

# ▲ shopify-blocks

**Copy-paste sections for Shopify themes. No app. No subscription. You own the code.**

[**Browse live previews →**](https://ambduu.github.io/shopify-blocks/)

</div>

---

Most "section" apps inject scripts into every page and charge monthly. **shopify-blocks** works like
[shadcn/ui](https://ui.shadcn.com) for Shopify: one command copies a polished `.liquid` file into your
theme, and then it's yours — edit it however you like.

```bash
cd my-theme
npx github:ambduu/shopify-blocks add faq-accordion
```

```
  ✓ sections/sb-faq-accordion.liquid

Added 1 block. Next steps:
  1. shopify theme dev  (or push the theme)
  2. Open the theme editor → Add section → pick your new section
```

## Blocks

| Block | What it does |
|---|---|
| [`announcement-marquee`](https://ambduu.github.io/shopify-blocks/#announcement-marquee) | Infinite scrolling announcement bar. Pauses on hover, respects reduced motion. |
| [`faq-accordion`](https://ambduu.github.io/shopify-blocks/#faq-accordion) | Accessible accordion **+ FAQPage structured data** for Google rich results. |
| [`countdown-banner`](https://ambduu.github.io/shopify-blocks/#countdown-banner) | Sale countdown that hides itself or shows a message when time runs out. |
| [`before-after-slider`](https://ambduu.github.io/shopify-blocks/#before-after-slider) | Drag to compare two images. Keyboard accessible, responsive images. |
| [`testimonial-wall`](https://ambduu.github.io/shopify-blocks/#testimonial-wall) | Masonry review cards with star ratings and an average score. |
| [`logo-cloud`](https://ambduu.github.io/shopify-blocks/#logo-cloud) | "As featured in" logos — static grid or infinite scroll. |

Every block:

- is **one self-contained file** — Liquid, scoped CSS and (if needed) a tiny custom element
- is fully editable in the **theme editor** (settings, blocks, presets)
- uses **responsive, lazy-loaded images** via `image_url` / `image_tag`
- is **accessible** — real buttons/inputs, focus states, reduced-motion support
- loads **no external scripts**
- works with Dawn, Horizon and any Online Store 2.0 theme

## CLI

```bash
npx github:ambduu/shopify-blocks list                  # see all blocks
npx github:ambduu/shopify-blocks add <block...>         # add one or more
npx github:ambduu/shopify-blocks add --all              # add everything
```

| Option | |
|---|---|
| `--dir <path>` | theme folder (default: current folder) |
| `--force` | overwrite existing files |
| `--prefix <p>` | file name prefix, default `sb-` |

No Node? Open a block on the [preview site](https://ambduu.github.io/shopify-blocks/), click **Copy .liquid**,
and paste it into a new section in **Online Store → Themes → Edit code**.

## 🤖 For AI coding agents

This repo includes an agent skill that teaches Claude Code (and a rule for Cursor) to reuse these blocks and
to write new sections the right way — scoped CSS, presets, `block.shopify_attributes`, escaping, responsive
images, accessibility.

**Claude Code** — copy the skill into your theme project:

```bash
git clone --depth 1 https://github.com/ambduu/shopify-blocks /tmp/shopify-blocks
mkdir -p .claude/skills && cp -r /tmp/shopify-blocks/skills/shopify-theme-sections .claude/skills/
```

**Cursor** — copy `.cursor/rules/shopify-theme-sections.mdc` into your project's `.cursor/rules/`.

Then just ask: *"add an FAQ section to the product page"*.

## Contributing

New blocks are very welcome. Add `blocks/<name>.liquid` (follow the checklist in
[`skills/shopify-theme-sections/SKILL.md`](skills/shopify-theme-sections/SKILL.md)), register it in
`registry.json`, and open a PR — the preview site picks it up automatically.

Wanted next: size-guide drawer, sticky add-to-cart, shoppable video, store locator, comparison table, newsletter popup.
[Request a block →](https://github.com/ambduu/shopify-blocks/issues/new)

If this saves you an app subscription, a ⭐ helps others find it.

## License

[MIT](LICENSE) © Amrit (ambduu)
