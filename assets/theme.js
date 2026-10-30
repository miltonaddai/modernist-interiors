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

  /* Product gallery dots */
  $$('[data-gallery]').forEach((g) => {
    const dots = $$('.product__dot', g.parentElement);
    if (!dots.length) return;
    g.addEventListener('scroll', () => {
      const i = Math.round(g.scrollLeft / g.clientWidth);
      dots.forEach((d, n) => d.classList.toggle('is-active', n === i));
    }, { passive: true });
  });

  /* Sticky add-to-cart (mobile) */
  const sticky = $('[data-sticky-atc]');
  const mainAdd = $('[data-product-form] [data-add]');
  if (sticky && mainAdd && 'IntersectionObserver' in window) {
    sticky.hidden = false;
    new IntersectionObserver(([en]) => sticky.classList.toggle('is-visible', !en.isIntersecting && en.boundingClientRect.top < 0)).observe(mainAdd);
    $('[data-sticky-add]', sticky).addEventListener('click', () => mainAdd.click());
  }

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
    const wrap = form.parentElement;
    const variantsEl = $('[data-variants]', wrap);
    const variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];
    const idInput = $('[data-variant-id]', form);
    const addBtn = $('[data-add]', form);
    const errorEl = $('[data-error]', form);
    const addLabel = addBtn ? addBtn.textContent.trim() : '';
    form.addEventListener('change', (e) => {
      if (!e.target.matches('[data-option]')) return;
      const selected = $$('fieldset.option', form).map((fs) => ($('input:checked', fs) || {}).value);
      const v = variants.find((x) => x.options.every((o, i) => o === selected[i]));
      if (!v) { addBtn.disabled = true; return; }
      idInput.value = v.id;
      addBtn.disabled = !v.available;
      addBtn.textContent = v.available ? addLabel : 'Sold out';
      const url = new URL(window.location.href);
      url.searchParams.set('variant', v.id);
      window.history.replaceState({}, '', url);
      // Refresh price via Section Rendering API
      const section = form.closest('[id^="shopify-section-"]');
      if (section) {
        fetch(`${url.pathname}?variant=${v.id}&section_id=${section.id.replace('shopify-section-', '')}`)
          .then((r) => r.text())
          .then((html) => {
            const fresh = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-price]');
            const cur = $('[data-price]', section);
            if (fresh && cur) cur.innerHTML = fresh.innerHTML;
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
