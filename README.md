# Modernist — Shopify theme for Modernist Interiors

An original Online Store 2.0 theme inspired by the clean, editorial look of Shopify's *Hyper* theme
(Inter typography, black/white palette with a soft sage accent `#EEF1EA`, pill buttons, 14px image radius,
generous whitespace, hover image swap and scroll-reveal animations). All Liquid, CSS and JS are written from scratch.

## Homepage (lean by design)
1. **Hero banner** – full-bleed image, eyebrow / heading / text / buttons blocks
2. **Featured collection** – product grid (2–4 columns, hover second image)
3. **Image with text** – brand story on sage background
4. **Newsletter** – Shopify customer form
Header (announcement bar + header) and footer are **section groups** (`sections/header-group.json`, `sections/footer-group.json`).

## Structure
```
layout/      theme.liquid, password.liquid
sections/    hero, featured-collection, image-with-text, newsletter, header, announcement-bar, footer,
             main-* (product, collection, list-collections, cart, search, page, blog, article, 404, password,
             login, register, account, order, addresses, activate-account, reset-password),
             related-products, predictive-search, header-group.json, footer-group.json
snippets/    product-card, price, cart-drawer, cart-drawer-items, icon, pagination, meta-tags, css-variables, address-fields
templates/   JSON templates for every page type, customers/*, gift_card.liquid, cart.drawer.liquid (AJAX drawer fragment)
config/      settings_schema.json, settings_data.json
locales/     en.default.json, en.default.schema.json
assets/      base.css, theme.js (no dependencies)
```

## Features
- AJAX cart drawer (focus management, Esc to close, quantity +/−) — switch to cart page in *Theme settings → Cart*
- Predictive search in header (Section Rendering API), variant pills on PDP, sticky product info, collapsible rows
- Product recommendations, collection sorting, pagination, structured data
- Theme settings: colors, fonts (font picker), letter spacing, page width, button/image radius, animations toggle
- Accessible: skip link, labelled forms, aria states, visible focus, `prefers-reduced-motion` respected

## Deploy with the Shopify GitHub integration
1. Push this folder's contents to the **root** of `main` in `miltonaddai/modernist-interiors`.
2. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**.
3. Select the account, repo `modernist-interiors`, branch `main`. Shopify syncs both ways — edits in the theme
   editor are committed back to `main`, so `git pull` before editing locally.
4. Customize, then **Publish**.

## Shopify CLI
```bash
npm install -g @shopify/cli
shopify theme dev   --store your-store.myshopify.com   # local preview with hot reload
shopify theme check                                     # lint
shopify theme push  --store your-store.myshopify.com --unpublished
```

## After install
Set the header menu (`main-menu`) and footer menu (`footer`), pick the homepage collection, and upload the hero / brand story images.
