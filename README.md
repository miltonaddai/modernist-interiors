# Modernist — Shopify theme for Modernist Interiors

Modernist Interiors sells Bauhaus-inspired and modern lighting, furniture and objects — pieces where form follows function.
This is an original Online Store 2.0 theme: the clean, editorial layout takes its cues from Shopify's *Hyper*
(Inter typography, black/white with a soft sage `#EEF1EA`, pill buttons, large product imagery) with Bauhaus primary-colour
accents in the value props. All Liquid, CSS and JS are written from scratch.

## Homepage
1. **Hero banner** – “Objects with purpose. Lines with intent.”
2. **Value props** – free shipping / design classics / 30-day returns, with Bauhaus circle-square-triangle icons
3. **Collection list** – shop-by-category tiles (pick collections in the editor)
4. **Featured collection** – bestsellers, large cards (3 columns desktop, 2 tablet, 1–2 mobile)
5. **Image with text** – brand ethos on sage
6. **Editorial** – Bauhaus heritage with numbered principles
7. **Featured collection** – new arrivals
8. **Testimonials**
9. **Newsletter** – “Join the studio”
Header (announcement bar + header) and footer are **section groups** (`sections/header-group.json`, `sections/footer-group.json`).

## Structure
```
layout/      theme.liquid, password.liquid
sections/    hero, value-props, collection-list, featured-collection, image-with-text, editorial, testimonials, newsletter, header, announcement-bar, footer,
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
Set the header menu (`main-menu`) and footer menu (`footer`), assign collections to the four category tiles and both featured-collection sections (they default to *All*), and upload the hero / ethos images. Replace the sample testimonials with real reviews.
