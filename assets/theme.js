/* Modernist — original theme script (no dependencies) */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const theme = window.theme || { routes: {} };

  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  const observeReveal = (root = document) => $$('.reveal', root).forEach((el) => (io ? io.observe(el) : el.classList.add('is-visible')));
  observeReveal();

  document.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('[data-menu-toggle]');
    if (menuBtn) { const d = document.getElementById(menuBtn.getAttribute('aria-controls')); if (d && d.open) d.open(menuBtn); }
    const searchBtn = e.target.closest('[data-search-toggle]');
    if (searchBtn) {
      const bar = $('[data-search-bar]');
      if (bar) { e.preventDefault(); bar.hidden = !bar.hidden; if (!bar.hidden) $('input[type=search]', bar).focus(); }
    }
    if (e.target.closest('[data-toggle-recover]')) {
      $('#RecoverForm').hidden = !$('#RecoverForm').hidden;
      $('#LoginForm').hidden = !$('#LoginForm').hidden;
    }
  });
  document.addEventListener('submit', (e) => {
    const msg = e.target.dataset && e.target.dataset.confirm;
    if (msg && !window.confirm(msg)) e.preventDefault();
  });
  $$('[data-autosubmit]').forEach((el) => el.addEventListener('change', () => el.form.submit()));

  /* Menu drawer */
  class MenuDrawer extends HTMLElement {
    connectedCallback() {
      this.panel = this.querySelector('.menu-drawer__panel');
      this.addEventListener('click', (e) => { if (e.target.closest('[data-menu-close]')) this.close(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.classList.contains('is-open')) this.close(); });
    }
    open(trigger) {
      this.trigger = trigger;
      this.classList.add('is-open'); this.setAttribute('aria-hidden', 'false');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      setTimeout(() => this.panel.focus(), 50);
    }
    close() {
      this.classList.remove('is-open'); this.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (this.trigger) { this.trigger.setAttribute('aria-expanded', 'false'); this.trigger.focus(); }
    }
  }
  if (!customElements.get('menu-drawer')) customElements.define('menu-drawer', MenuDrawer);

  /* Compact sticky header on scroll */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('header__compact', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  /* Footer accordions: open on desktop, collapsed on mobile */
  const mq = window.matchMedia('(min-width: 750px)');
  const syncFooter = () => $$('[data-footer-details]').forEach((d) => { d.open = mq.matches; });
  syncFooter(); mq.addEventListener('change', syncFooter);

  /* Product gallery: swipe + dots on mobile, thumbnails on desktop */
  $$('[data-gallery]').forEach((g) => {
    const wrap = g.parentElement;
    const dots = $$('.product__dot', wrap);
    const thumbs = $$('[data-thumb]', wrap);
    const mark = (i) => {
      dots.forEach((d, n) => d.classList.toggle('is-active', n === i));
      thumbs.forEach((t, n) => t.classList.toggle('is-active', n === i));
    };
    g.addEventListener('scroll', () => mark(Math.round(g.scrollLeft / g.clientWidth)), { passive: true });
    thumbs.forEach((t) => t.addEventListener('click', () => {
      const i = +t.dataset.thumb;
      g.scrollTo({ left: i * g.clientWidth, behavior: 'smooth' });
      mark(i);
    }));
  });

  /* Sticky add-to-cart (mobile) */
  const sticky = $('[data-sticky-atc]');
  const mainAdd = $('[data-product-form] [data-add]');
  if (sticky && mainAdd && 'IntersectionObserver' in window) {
    sticky.hidden = false;
    new IntersectionObserver(([en]) => sticky.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0)).observe(mainAdd);
    $('[data-sticky-add]', sticky).addEventListener('click', () => mainAdd.click());
  }

  /* Quantity steppers */
  $$('[data-qty]').forEach((q) => {
    const input = $('input', q);
    $$('[data-step]', q).forEach((b) => b.addEventListener('click', () => {
      input.value = Math.max(1, (parseInt(input.value, 10) || 1) + +b.dataset.step);
    }));
  });

  /* Order cutoff countdown (real daily cutoff, store time zone) */
  $$('[data-cutoff]').forEach((el) => {
    const hour = +el.dataset.hour, biz = el.dataset.biz === 'true';
    const z = el.dataset.offset || '+0000';
    const off = (z[0] === '-' ? -1 : 1) * (parseInt(z.slice(1, 3), 10) * 60 + parseInt(z.slice(3, 5), 10));
    const out = $('[data-cutoff-text]', el);
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const isBiz = (d) => !biz || (d.getUTCDay() !== 0 && d.getUTCDay() !== 6);
    const tick = () => {
      const store = new Date(Date.now() + off * 60000);
      const cut = new Date(store); cut.setUTCHours(hour, 0, 0, 0);
      while (!isBiz(cut) || cut <= store) { cut.setUTCDate(cut.getUTCDate() + 1); cut.setUTCHours(hour, 0, 0, 0); }
      const ms = cut - store, h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000);
      const day = cut.getUTCDate() === store.getUTCDate() ? 'today' : DAYS[cut.getUTCDay()];
      const t = h ? `${h}h ${m}m` : `${m}m`;
      out.innerHTML = el.dataset.before.replace('[time]', `<strong>${t}</strong>`) + ' ' + el.dataset.after.replace('[day]', `<strong>${day}</strong>`);
    };
    tick(); setInterval(tick, 30000);
  });

  /* Estimated delivery range */
  $$('[data-delivery]').forEach((el) => {
    const biz = el.dataset.biz === 'true';
    const cut = +(el.dataset.cut || 24);
    const add = (n) => { const d = new Date(); if (d.getHours() >= cut) n++; while (n > 0) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (!biz || (w !== 0 && w !== 6)) n--; } return d; };
    const f = { month: 'short', day: 'numeric' };
    $('[data-delivery-text]', el).innerHTML = el.dataset.label.replace('[range]', `<strong>${add(+el.dataset.min).toLocaleDateString(undefined, f)} – ${add(+el.dataset.max).toLocaleDateString(undefined, f)}</strong>`);
  });

  /* Predictive search (Section Rendering API) */
  const pInput = $('[data-predictive]');
  const pResults = $('[data-predictive-results]');
  if (pInput && pResults && theme.routes.predictive_search_url) {
    let t;
    pInput.addEventListener('input', () => {
      clearTimeout(t);
      const q = pInput.value.trim();
      if (!q) { pResults.innerHTML = ''; return; }
      t = setTimeout(async () => {
        try {
          const r = await fetch(`${theme.routes.predictive_search_url}?q=${encodeURIComponent(q)}&resources[type]=product&section_id=predictive-search`);
          const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
          pResults.innerHTML = (doc.querySelector('.shopify-section') || doc.body).innerHTML;
        } catch (_) { /* ignore */ }
      }, 250);
    });
  }

  /* Cart drawer */
  class CartDrawer extends HTMLElement {
    connectedCallback() {
      this.panel = $('.drawer__panel', this);
      this.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) this.close();
        const q = e.target.closest('[data-qty]');
        if (q) this.change(q.closest('[data-line]').dataset.line, Number(q.dataset.qty));
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.classList.contains('is-open')) this.close(); });
      document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-cart-toggle]');
        if (t && theme.cartType === 'drawer') { e.preventDefault(); this.open(t); }
      });
    }
    open(trigger) {
      this.lastFocus = trigger || document.activeElement;
      this.classList.add('is-open');
      this.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => this.panel.focus(), 50);
    }
    close() {
      this.classList.remove('is-open');
      this.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (this.lastFocus) this.lastFocus.focus();
    }
    async refresh() {
      const cart = await (await fetch(`${theme.routes.cart_url}.js`)).json();
      $$('[data-cart-count]').forEach((el) => { el.textContent = cart.item_count; el.hidden = cart.item_count === 0; });
      const html = await (await fetch(`${theme.routes.cart_url}?view=drawer`)).text();
      const body = new DOMParser().parseFromString(html, 'text/html').querySelector('#CartDrawerBody');
      if (body) $('#CartDrawerBody', this).innerHTML = body.innerHTML;
    }
    async change(line, quantity) {
      this.classList.add('is-loading');
      try {
        await fetch(`${theme.routes.cart_change_url}.js`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ line: Number(line), quantity }) });
        await this.refresh();
      } finally { this.classList.remove('is-loading'); }
    }
  }
  if (!customElements.get('cart-drawer')) customElements.define('cart-drawer', CartDrawer);

  /* Product form: variant selection + AJAX add to cart */
  $$('[data-product-form]').forEach((form) => {
    const section = form.closest('[id^="shopify-section-"]') || document;
    const variantsEl = $('[data-variants]', section);
    const variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];
    const idInput = $('[data-variant-id]', form);
    const addBtn = $('[data-add]', form);
    const errorEl = $('[data-error]', form);
    const addLabel = addBtn.dataset.label || addBtn.textContent.trim();
    const stickyBtn = $('[data-sticky-add]');
    const stickyPrice = $('[data-sticky-price]');
    section.addEventListener('change', (e) => {
      if (!e.target.matches('[data-option]')) return;
      const fs = e.target.closest('fieldset');
      const lbl = fs && $('.option__selected', fs);
      if (lbl) lbl.textContent = e.target.value;
      const selected = $$('fieldset.option', section).map((f) => ($('input:checked', f) || {}).value);
      const v = variants.find((x) => x.options.every((o, i) => o === selected[i]));
      const available = !!(v && v.available);
      addBtn.disabled = !available;
      addBtn.textContent = v ? (available ? addLabel : 'Sold out') : 'Unavailable';
      if (stickyBtn) { stickyBtn.disabled = !available; stickyBtn.textContent = addBtn.textContent; }
      if (!v) return;
      idInput.value = v.id;
      const url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      window.history.replaceState({}, '', url);
      if (v.featured_media) {
        const g = $('[data-gallery]', section);
        const i = $$('[data-media-index]', section).findIndex((m) => +m.dataset.mediaIndex === v.featured_media.position - 1);
        if (g && i > -1) g.scrollTo({ left: i * g.clientWidth, behavior: 'smooth' });
      }
      // Refresh price, sticky price and real stock via Section Rendering API
      if (section.id) {
        fetch(`${url.pathname}?variant=${v.id}&section_id=${section.id.replace('shopify-section-', '')}`)
          .then((r) => r.text())
          .then((html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            ['[data-price]', '[data-low-stock]', '[data-sticky-price]'].forEach((sel) => {
              const fresh = $(sel, doc);
              const cur = sel === '[data-sticky-price]' ? stickyPrice : $(sel, section);
              if (fresh && cur) cur.innerHTML = fresh.innerHTML;
            });
          }).catch(() => {});
      }
    });
    form.addEventListener('submit', async (e) => {
      const drawer = $('cart-drawer');
      if (theme.cartType !== 'drawer' || !drawer) return;
      e.preventDefault();
      errorEl.hidden = true;
      addBtn.disabled = true;
      try {
        const r = await fetch(`${theme.routes.cart_add_url}.js`, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
        const data = await r.json();
        if (data.status) { errorEl.textContent = data.description || data.message; errorEl.hidden = false; return; }
        await drawer.refresh();
        drawer.open(addBtn);
      } catch (_) { form.submit(); } finally { addBtn.disabled = false; }
    });
  });

  /* Product recommendations */
  $$('[data-recommendations]').forEach(async (el) => {
    try {
      const html = await (await fetch(el.dataset.url)).text();
      const inner = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-recommendations]');
      if (inner && inner.innerHTML.trim()) { el.innerHTML = inner.innerHTML; observeReveal(el); }
    } catch (_) { /* ignore */ }
  });
})();
