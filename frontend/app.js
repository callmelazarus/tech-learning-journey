/* ============================================================
   app.js — tech-learning-journey frontend SPA
   ============================================================ */
(function () {
  'use strict';

  // ── Category metadata ────────────────────────────────────────
  const CAT_META = {
    swe:  { icon: '⟨/⟩', label: 'Software Engineering', tag: 'swe'  },
    ai:   { icon: '◈',   label: 'Artificial Intelligence', tag: 'ai' },
    ml:   { icon: '⊕',   label: 'Machine Learning',        tag: 'ml' },
    misc: { icon: '∷',   label: 'Miscellaneous',           tag: 'misc'},
  };

  // ── State ────────────────────────────────────────────────────
  const state = {
    sidebarOpen: true,
    articleMap: {},      // id → article object
    navItemMap: new Map(), // articleId → DOM element
    groupMap:   new Map(), // groupId   → { header, children }
    searchQuery: '',
    currentView: 'home',
    currentArticleId: null,
  };

  // ── DOM refs ─────────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  const dom = {
    sidebarToggle:  el('sidebarToggle'),
    sidebar:        el('sidebar'),
    sidebarInner:   el('sidebarInner'),
    homeLink:       el('homeLink'),
    searchBox:      el('searchBox'),
    searchInput:    el('searchInput'),
    topicCount:     el('topicCount'),
    homeView:       el('homeView'),
    articleView:    el('articleView'),
    searchView:     el('searchView'),
    terminalBody:   el('terminalBody'),
    homeCards:      el('homeCards'),
    breadcrumb:     el('breadcrumb'),
    articleContent: el('articleContent'),
    searchMeta:     el('searchMeta'),
    searchResults:  el('searchResults'),
  };

  // ── Configure marked.js ──────────────────────────────────────
  const renderer = new marked.Renderer();

  renderer.code = function (code, lang) {
    let highlighted;
    if (lang && hljs.getLanguage(lang)) {
      try {
        highlighted = hljs.highlight(code, { language: lang }).value;
      } catch (_) {
        highlighted = escHtml(code);
      }
    } else {
      highlighted = hljs.highlightAuto(code).value;
    }
    const cls = lang ? ` class="language-${escAttr(lang)} hljs"` : ' class="hljs"';
    return `<pre><code${cls}>${highlighted}</code></pre>`;
  };

  marked.use({ renderer, gfm: true, breaks: false });

  // ── Initialise ───────────────────────────────────────────────
  function init() {
    // Index articles
    for (const a of LEARNINGS.articles) {
      state.articleMap[a.id] = a;
    }

    dom.topicCount.textContent = `${LEARNINGS.articles.length} topics`;

    renderSidebar();
    renderTerminal();
    renderHomeCards();

    // Event listeners
    dom.sidebarToggle.addEventListener('click', toggleSidebar);
    dom.homeLink.addEventListener('click', (e) => { e.preventDefault(); goHome(); });
    dom.searchInput.addEventListener('input', onSearch);
    dom.searchInput.addEventListener('keydown', onSearchKey);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        dom.searchInput.focus();
        dom.searchInput.select();
      }
      if (e.key === 'Escape' && document.activeElement === dom.searchInput) {
        dom.searchInput.value = '';
        state.searchQuery = '';
        dom.searchInput.blur();
        if (state.currentView === 'search') goHome();
      }
    });

    // Hash routing
    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  // ── Routing ──────────────────────────────────────────────────
  function handleHash() {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash && state.articleMap[hash]) {
      showArticle(hash, false);
    } else {
      goHome();
    }
  }

  function goHome() {
    state.currentView = 'home';
    state.currentArticleId = null;
    history.replaceState(null, '', '#');
    showView('home');
    clearNavActive();
  }

  function showView(name) {
    dom.homeView.classList.toggle('hidden',    name !== 'home');
    dom.articleView.classList.toggle('hidden', name !== 'article');
    dom.searchView.classList.toggle('hidden',  name !== 'search');
    state.currentView = name;
  }

  // ── Sidebar ──────────────────────────────────────────────────
  function toggleSidebar() {
    state.sidebarOpen = !state.sidebarOpen;
    dom.sidebar.classList.toggle('collapsed', !state.sidebarOpen);
  }

  function renderSidebar() {
    const frag = document.createDocumentFragment();
    renderNavLevel(LEARNINGS.navTree, frag, 0);
    dom.sidebarInner.appendChild(frag);

    // Wire up clicks after the DOM is ready
    dom.sidebarInner.querySelectorAll('[data-article]').forEach((itemEl) => {
      const articleId = itemEl.dataset.article;
      state.navItemMap.set(articleId, itemEl);
      itemEl.addEventListener('click', () => showArticle(articleId));
    });

    dom.sidebarInner.querySelectorAll('[data-group]').forEach((headerEl) => {
      const groupId = headerEl.dataset.group;
      const childrenEl = headerEl.nextElementSibling;
      state.groupMap.set(groupId, { header: headerEl, children: childrenEl });
      headerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleGroup(groupId);
      });
    });
  }

  function renderNavLevel(nodes, container, depth) {
    for (const node of nodes) {
      const indent = 10 + depth * 14;

      if (node.is_leaf) {
        const d = document.createElement('div');
        d.className = 'nav-item';
        d.dataset.article = node.id;
        d.style.paddingLeft = `${indent}px`;
        d.innerHTML = `<span class="nav-arrow">·</span><span class="nav-label">${escHtml(node.title)}</span>`;
        container.appendChild(d);
      } else {
        const expanded = depth === 0; // top level starts open

        // Group header
        const header = document.createElement('div');
        header.className = 'nav-item';
        header.dataset.group = node.id;
        header.style.paddingLeft = `${indent}px`;
        const count = countLeaves(node);
        header.innerHTML = `
          <span class="nav-arrow" data-arrow="${node.id}">${expanded ? '▾' : '▸'}</span>
          <span class="nav-label">${escHtml(node.title)}</span>
          <span class="nav-badge">${count}</span>
        `;
        container.appendChild(header);

        // Children container
        const childrenDiv = document.createElement('div');
        childrenDiv.className = `nav-children${expanded ? '' : ' collapsed'}`;
        renderNavLevel(node.children || [], childrenDiv, depth + 1);
        container.appendChild(childrenDiv);
      }
    }
  }

  function toggleGroup(groupId) {
    const entry = state.groupMap.get(groupId);
    if (!entry) return;
    const { header, children } = entry;
    const isCollapsed = children.classList.toggle('collapsed');
    const arrow = header.querySelector('[data-arrow]');
    if (arrow) arrow.textContent = isCollapsed ? '▸' : '▾';
  }

  function expandGroupsFor(articleId) {
    const parts = articleId.split('/');
    for (let i = 1; i < parts.length; i++) {
      const ancestorId = parts.slice(0, i).join('/');
      const entry = state.groupMap.get(ancestorId);
      if (entry && entry.children.classList.contains('collapsed')) {
        toggleGroup(ancestorId);
      }
    }
  }

  function setNavActive(articleId) {
    clearNavActive();
    const itemEl = state.navItemMap.get(articleId);
    if (itemEl) {
      itemEl.classList.add('active');
      itemEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function clearNavActive() {
    dom.sidebarInner.querySelectorAll('.nav-item.active').forEach((e) =>
      e.classList.remove('active')
    );
  }

  function countLeaves(node) {
    if (node.is_leaf) return 1;
    return (node.children || []).reduce((s, c) => s + countLeaves(c), 0);
  }

  // ── Home ─────────────────────────────────────────────────────
  function renderTerminal() {
    const count = LEARNINGS.articles.length;
    const lines = [
      { prompt: true,  text: 'ls knowledge/' },
      { output: true,  html: `<span class="t-dir">ai/</span>  <span class="t-dir">ml/</span>  <span class="t-dir">swe/</span>  <span class="t-dir">misc/</span>` },
      { prompt: true,  text: 'find knowledge -name "*.md" | wc -l' },
      { output: true,  html: `<span class="t-num">${count}</span>` },
      { prompt: true,  text: 'echo "documenting every day"' },
      { output: true,  html: `<span class="t-str">documenting every day</span>` },
      { prompt: true,  cursor: true },
    ];

    dom.terminalBody.innerHTML = lines.map((l) => {
      if (l.prompt && l.cursor) {
        return `<div class="t-line"><span class="t-prompt">$</span> <span class="t-cursor"></span></div>`;
      }
      if (l.prompt) {
        return `<div class="t-line"><span class="t-prompt">$</span> <span class="t-cmd">${escHtml(l.text)}</span></div>`;
      }
      return `<div class="t-line out">${l.html || escHtml(l.text || '')}</div>`;
    }).join('');
  }

  function renderHomeCards() {
    const groups = {};
    for (const a of LEARNINGS.articles) {
      const cat = a.path[0] || 'misc';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(a);
    }

    const order = ['swe', 'ai', 'ml', 'misc'];
    dom.homeCards.innerHTML = order
      .filter((c) => groups[c])
      .map((cat) => {
        const meta = CAT_META[cat] || { icon: '◇', label: cat.toUpperCase(), tag: 'misc' };
        const arts = groups[cat];
        const sections = new Set(arts.map((a) => a.path[1]).filter(Boolean));
        return `
          <a class="home-card" href="#" data-cat="${escAttr(cat)}">
            <span class="card-icon">${meta.icon}</span>
            <span class="card-tag tag-${meta.tag}">${meta.tag}</span>
            <div class="card-title">${meta.label}</div>
            <div class="card-meta">${arts.length} topics &middot; ${sections.size} sections</div>
          </a>`;
      })
      .join('');

    dom.homeCards.querySelectorAll('[data-cat]').forEach((cardEl) => {
      cardEl.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = cardEl.dataset.cat;
        // Expand the top-level sidebar group and scroll to it
        const entry = state.groupMap.get(cat);
        if (entry) {
          if (entry.children.classList.contains('collapsed')) toggleGroup(cat);
          entry.header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Open sidebar if closed
        if (!state.sidebarOpen) toggleSidebar();
      });
    });
  }

  // ── Article ───────────────────────────────────────────────────
  function showArticle(id, pushHash = true) {
    const article = state.articleMap[id];
    if (!article) return;

    state.currentArticleId = id;

    if (pushHash) {
      history.pushState(null, '', `#${encodeURIComponent(id)}`);
    }

    // Breadcrumb
    dom.breadcrumb.innerHTML = article.path
      .map((part, i) => {
        if (i === article.path.length - 1) {
          return `<span class="bc-cur">${escHtml(slugTitle(part))}</span>`;
        }
        return `<a href="#">${escHtml(slugTitle(part))}</a><span class="bc-sep">›</span>`;
      })
      .join('');

    // Render markdown
    dom.articleContent.innerHTML = marked.parse(article.content);

    // Apply hljs to any blocks the renderer missed
    dom.articleContent.querySelectorAll('pre code:not(.hljs)').forEach((block) => {
      hljs.highlightElement(block);
    });

    showView('article');
    dom.articleView.scrollTop = 0;

    expandGroupsFor(id);
    setNavActive(id);
  }

  // ── Search ───────────────────────────────────────────────────
  function onSearch(e) {
    const q = e.target.value.trim();
    state.searchQuery = q;

    if (q.length < 2) {
      if (state.currentView === 'search') {
        if (state.currentArticleId) {
          showArticle(state.currentArticleId, false);
        } else {
          goHome();
        }
      }
      return;
    }

    runSearch(q);
  }

  function onSearchKey(e) {
    if (e.key === 'Enter') {
      const first = dom.searchResults.querySelector('[data-article]');
      if (first) first.click();
    }
  }

  function runSearch(query) {
    showView('search');

    const q = query.toLowerCase();
    const hits = [];

    for (const a of LEARNINGS.articles) {
      const inTitle   = a.title.toLowerCase().includes(q);
      const inPath    = a.id.toLowerCase().includes(q);
      const inContent = a.content.toLowerCase().includes(q);

      if (!inTitle && !inPath && !inContent) continue;

      let score = 0;
      if (inTitle)   score += 10;
      if (inPath)    score += 4;
      if (inContent) score += 1;

      // Build excerpt around first match in content
      let excerpt = '';
      const low = a.content.toLowerCase();
      const idx = low.indexOf(q);
      if (idx !== -1) {
        const s = Math.max(0, idx - 70);
        const e = Math.min(a.content.length, idx + q.length + 120);
        let raw = a.content.slice(s, e)
          .replace(/^#+\s+/gm, '')
          .replace(/`{1,3}/g, '')
          .replace(/\*{1,2}/g, '')
          .replace(/\n+/g, ' ');
        if (s > 0) raw = '\u2026' + raw;
        if (e < a.content.length) raw += '\u2026';
        excerpt = raw;
      }

      hits.push({ a, score, excerpt });
    }

    hits.sort((x, y) => y.score - x.score);

    dom.searchMeta.textContent =
      `${hits.length} result${hits.length !== 1 ? 's' : ''} for "${query}"`;

    if (hits.length === 0) {
      dom.searchResults.innerHTML = `<p class="no-results">no results found</p>`;
      return;
    }

    const re = new RegExp(escRegex(query), 'gi');

    dom.searchResults.innerHTML = hits
      .slice(0, 40)
      .map(({ a, excerpt }) => {
        const pathStr = a.path.join(' › ');
        const excerptHtml = excerpt
          ? escHtml(excerpt).replace(re, (m) => `<mark>${m}</mark>`)
          : '';
        return `
          <div class="search-result" data-article="${escAttr(a.id)}">
            <div class="sr-title">${escHtml(a.title)}</div>
            <div class="sr-path">${escHtml(pathStr)}</div>
            ${excerptHtml ? `<div class="sr-excerpt">${excerptHtml}</div>` : ''}
          </div>`;
      })
      .join('');

    dom.searchResults.querySelectorAll('[data-article]').forEach((r) => {
      r.addEventListener('click', () => {
        dom.searchInput.value = '';
        state.searchQuery = '';
        showArticle(r.dataset.article);
      });
    });
  }

  // ── Utility ──────────────────────────────────────────────────
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escAttr(s) {
    return String(s).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function escRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function slugTitle(s) {
    return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // ── Boot ─────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
