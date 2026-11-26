---
name: shopify-theme-sections
description: Add ready-made shopify-blocks sections to a Shopify theme, or write new Online Store 2.0 sections that follow Shopify best practices. Use when the user asks for a Shopify section, block, announcement bar, FAQ, countdown, testimonials, logo bar, before/after slider, or any change to a theme's sections/ folder.
---

# Shopify theme sections

You are working in a Shopify theme (folders like `sections/`, `snippets/`, `layout/`, `templates/`, `config/`).

## 1. Reuse before you write

[shopify-blocks](https://github.com/ambduu/shopify-blocks) has tested, accessible sections. Check if one fits first:

```bash
npx github:ambduu/shopify-blocks list
npx github:ambduu/shopify-blocks add <name> [--force] [--prefix sb-]
```

| Block | Use for |
|---|---|
| `announcement-marquee` | scrolling promo / shipping bar |
| `faq-accordion` | FAQs (adds FAQPage JSON-LD for SEO) |
| `countdown-banner` | sale or launch countdown |
| `before-after-slider` | compare two images |
| `testimonial-wall` | reviews with stars + average |
| `logo-cloud` | "as featured in" / partner logos |

After adding, tell the user: run `shopify theme dev` (or push), then **Theme editor → Add section**.
Customise the copied file freely — it belongs to the theme now.

## 2. Writing a new section — checklist

Every section you write must:

- **Scope CSS** to the instance: wrap markup in `class="xx-name-{{ section.id }}"` and prefix every selector with it, so two copies of the section don't clash.
- **Expose settings, not hardcoded values**: text, colours, spacing, images and links go in `{% schema %}` settings with sensible `default`s. Ranges need `min`, `max`, `step` and a default that lands on a step.
- **Include `presets`** so the section appears in *Add section*. Pre-fill blocks in the preset so it looks good immediately.
- **Put `{{ block.shopify_attributes }}`** on each block's root element so the theme editor can select it.
- **Escape output**: `{{ setting | escape }}` for text settings. Only `richtext`/`html` settings are output raw.
- **Responsive images**: `{{ image | image_url: width: 1600 | image_tag: widths: '400, 800, 1200, 1600', sizes: '…', loading: 'lazy', alt: … }}`. Never hotlink full-size images. Don't lazy-load an image that is likely above the fold.
- **Handle blank images** with `placeholder_svg_tag` so the editor preview isn't broken.
- **Be accessible**: real `<button>`/`<details>`/`<input>` elements, visible focus, `aria-hidden="true"` on duplicated decorative content, `prefers-reduced-motion` for any animation.
- **JavaScript**: define a custom element guarded by `if (!customElements.get('name'))`, and clean up timers in `disconnectedCallback` — sections are re-rendered in the editor (`shopify:section:load`).
- **No external script tags or CDN libraries** unless the user asks — they slow the store.
- **Custom elements are inline by default** — give them `display: block` if they wrap layout.

## 3. Verify

- Run `shopify theme check` if the Shopify CLI is installed and fix errors in files you touched.
- Validate that the `{% schema %}` JSON parses.
- Tell the user exactly which files you added or changed.
