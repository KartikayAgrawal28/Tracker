// DSA Pattern Mastery Tracker Logic
(function () {
  const STORAGE_KEY = 'dsa_tracker_completed_ids_v1';
  const THEME_KEY = 'dsa_tracker_theme';
  let dsaData = [];
  let solvedSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  let isAllExpanded = false;
  const expandedCategories = new Set();
  const collapsedPatterns = new Set();

  // --- THEME SYSTEM (Light & Dark Mode) ---
  const themeBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (sunIcon) sunIcon.classList.remove('hidden');
      if (moonIcon) moonIcon.classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      if (sunIcon) sunIcon.classList.add('hidden');
      if (moonIcon) moonIcon.classList.remove('hidden');
    }
    localStorage.setItem(THEME_KEY, theme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      applyTheme(isDark ? 'light' : 'dark');
    });
  }
  initTheme();

  // --- FIREWORKS SYSTEM (60fps Canvas Particle Physics) ---
  const canvas = document.getElementById('fireworks-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2.5;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.alpha = 1;
      this.friction = 0.94;
      this.gravity = 0.18;
      this.size = Math.random() * 3 + 2;
    }
    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.018;
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(this.alpha, 0);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function launchFireworks(x, y) {
    const palette = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#38bdf8', '#a855f7', '#fb7185'];
    // burst 1
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle(x, y, palette[Math.floor(Math.random() * palette.length)]));
    }
    // secondary delayed burst for realistic celebration effect
    setTimeout(() => {
      for (let i = 0; i < 35; i++) {
        particles.push(new Particle(x + (Math.random() * 60 - 30), y - 30, palette[Math.floor(Math.random() * palette.length)]));
      }
    }, 120);
  }

  function animateFireworks() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(animateFireworks);
  }
  animateFireworks();

  // --- SAVE & STATS LOGIC ---
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(solvedSet)));
  }

  function updateStats() {
    let total = 0;
    let easyTotal = 0, medTotal = 0, hardTotal = 0;
    let easySolved = 0, medSolved = 0, hardSolved = 0;

    dsaData.forEach(cat => {
      cat.patterns.forEach(pat => {
        pat.questions.forEach(q => {
          total++;
          const isDone = solvedSet.has(q.id);
          if (q.diff === 'Easy') {
            easyTotal++;
            if (isDone) easySolved++;
          } else if (q.diff === 'Medium') {
            medTotal++;
            if (isDone) medSolved++;
          } else if (q.diff === 'Hard') {
            hardTotal++;
            if (isDone) hardSolved++;
          }
        });
      });
    });

    const solvedCount = solvedSet.size;
    const pct = total === 0 ? 0 : Math.round((solvedCount / total) * 100);

    const totalEl = document.getElementById('stat-total');
    if (totalEl) totalEl.innerHTML = `${solvedCount} <span class="text-sm font-normal text-slate-400 dark:text-slate-500">/ ${total}</span>`;
    
    const pctEl = document.getElementById('stat-percent');
    if (pctEl) pctEl.innerText = `${pct}%`;
    
    const barEl = document.getElementById('stat-progress-bar');
    if (barEl) barEl.style.width = `${pct}%`;

    const easyEl = document.getElementById('stat-easy');
    if (easyEl) easyEl.innerText = easySolved;
    const easySub = document.getElementById('stat-easy-sub');
    if (easySub) easySub.innerText = `${easySolved} / ${easyTotal} Solved`;

    const medEl = document.getElementById('stat-med');
    if (medEl) medEl.innerText = medSolved;
    const medSub = document.getElementById('stat-med-sub');
    if (medSub) medSub.innerText = `${medSolved} / ${medTotal} Solved`;

    const hardEl = document.getElementById('stat-hard');
    if (hardEl) hardEl.innerText = hardSolved;
    const hardSub = document.getElementById('stat-hard-sub');
    if (hardSub) hardSub.innerText = `${hardSolved} / ${hardTotal} Solved`;
  }

  function getRowClass(isDone) {
    return `group flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200 ${
      isDone 
        ? 'bg-slate-50/70 dark:bg-surface-900/40 border-slate-200/60 dark:border-surface-800/40 opacity-70' 
        : 'bg-white dark:bg-surface-900/90 border-slate-200 dark:border-surface-800 hover:border-indigo-300 dark:hover:border-surface-700 hover:bg-slate-50/80 dark:hover:bg-surface-850/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
    }`;
  }

  function updateCategoryDOM(catCard, catObj) {
    let catSolved = 0;
    let catTotal = 0;
    catObj.patterns.forEach(pat => {
      pat.questions.forEach(q => {
        catTotal++;
        if (solvedSet.has(q.id)) catSolved++;
      });
    });

    const catPercent = catTotal === 0 ? 0 : Math.round((catSolved / catTotal) * 100);
    const countEl = catCard.querySelector('.cat-count');
    if (countEl) countEl.innerText = `(${catSolved}/${catTotal})`;

    const barEl = catCard.querySelector('.cat-progress-fill');
    if (barEl) barEl.style.width = `${catPercent}%`;

    const badgeEl = catCard.querySelector('.cat-badge');
    if (badgeEl) {
      badgeEl.innerText = `${catPercent}% Done`;
      badgeEl.className = `cat-badge text-xs px-2.5 py-1 rounded-full font-mono font-medium transition ${
        catPercent === 100 
          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50' 
          : 'bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-surface-700/60'
      }`;
    }
  }

  function updatePatternDOM(patCard, pat) {
    const patSolved = pat.questions.filter(q => solvedSet.has(q.id)).length;
    const countEl = patCard.querySelector('.pat-count');
    if (countEl) countEl.innerText = `(${patSolved}/${pat.questions.length})`;
  }

  // --- RENDER ACCORDIONS ---
  const container = document.getElementById('tracker-container');

  function renderTree() {
    const searchVal = document.getElementById('search-input').value.trim().toLowerCase();
    const diffFilter = document.getElementById('diff-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    container.innerHTML = '';
    let totalVisible = 0;

    dsaData.forEach((catObj) => {
      let catSolved = 0;
      let catTotal = 0;
      let catMatchingPatterns = [];

      catObj.patterns.forEach((patObj) => {
        let matchingQuestions = [];

        patObj.questions.forEach(q => {
          catTotal++;
          const isSolved = solvedSet.has(q.id);
          if (isSolved) catSolved++;

          // Search criteria
          const matchText = searchVal === '' || 
            q.title.toLowerCase().includes(searchVal) || 
            q.id.toLowerCase().includes(searchVal) ||
            `#${q.id}`.includes(searchVal) ||
            patObj.name.toLowerCase().includes(searchVal) ||
            catObj.category.toLowerCase().includes(searchVal);

          // Difficulty criteria
          const matchDiff = diffFilter === 'ALL' || q.diff === diffFilter;

          // Status criteria
          const matchStatus = statusFilter === 'ALL' || 
            (statusFilter === 'SOLVED' && isSolved) || 
            (statusFilter === 'UNSOLVED' && !isSolved);

          if (matchText && matchDiff && matchStatus) {
            matchingQuestions.push(q);
          }
        });

        if (matchingQuestions.length > 0) {
          catMatchingPatterns.push({
            name: patObj.name,
            questions: matchingQuestions,
            totalUnderPattern: patObj.questions.length,
            originalPatternObj: patObj
          });
        }
      });

      if (catMatchingPatterns.length === 0) return; // Skip empty category
      totalVisible++;

      // Create Category Accordion Card
      const catCard = document.createElement('div');
      catCard.className = 'border border-slate-200 dark:border-surface-800/80 rounded-2xl bg-white/90 dark:bg-surface-900/80 overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-surface-700/80 transition-colors';

      const catPercent = catTotal === 0 ? 0 : Math.round((catSolved / catTotal) * 100);
      const isExpanded = isAllExpanded || searchVal.length > 0 || expandedCategories.has(catObj.category);

      // Category Header
      const catHeader = document.createElement('div');
      catHeader.className = 'cursor-pointer px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 dark:bg-surface-850/50 hover:bg-slate-100/80 dark:hover:bg-surface-850 transition select-none';
      catHeader.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
            📁
          </span>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              ${catObj.category}
              <span class="cat-count text-xs font-normal text-slate-500 dark:text-slate-400 font-mono">(${catSolved}/${catTotal})</span>
            </h2>
            <div class="w-32 bg-slate-200 dark:bg-surface-800 rounded-full h-1 mt-1.5 overflow-hidden">
              <div class="cat-progress-fill bg-indigo-600 dark:bg-indigo-500 h-1 rounded-full transition-all duration-300" style="width: ${catPercent}%"></div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 self-end sm:self-center">
          <span class="cat-badge text-xs px-2.5 py-1 rounded-full font-mono font-medium transition ${
            catPercent === 100 
              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50' 
              : 'bg-slate-100 dark:bg-surface-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-surface-700/60'
          }">
            ${catPercent}% Done
          </span>
          <span class="text-slate-400 dark:text-slate-500 text-sm font-mono transition-transform duration-200 cat-arrow">${isExpanded ? '▼' : '▶'}</span>
        </div>
      `;

      // Category Body
      const catBody = document.createElement('div');
      catBody.className = `p-4 sm:p-5 space-y-4 border-t border-slate-200 dark:border-surface-800/60 ${isExpanded ? '' : 'hidden'}`;

      // Render Nested Patterns (Sub-dropdowns)
      catMatchingPatterns.forEach((pat) => {
        const patCard = document.createElement('div');
        patCard.className = 'border border-slate-200/90 dark:border-surface-800/60 rounded-xl bg-slate-50/50 dark:bg-surface-950/40 p-4 transition-colors';

        const patSolved = pat.questions.filter(q => solvedSet.has(q.id)).length;
        const patKey = `${catObj.category}::${pat.name}`;
        const isPatCollapsed = collapsedPatterns.has(patKey);

        // Pattern Header
        const patHeader = document.createElement('div');
        patHeader.className = 'flex items-center justify-between cursor-pointer mb-3 select-none group';
        patHeader.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">↳</span>
            <span class="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              ${pat.name}
            </span>
            <span class="pat-count text-xs text-slate-500 font-mono">(${patSolved}/${pat.questions.length})</span>
          </div>
          <span class="pat-toggle-text text-xs text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
            ${isPatCollapsed ? 'Show' : 'Hide'}
          </span>
        `;

        const qContainer = document.createElement('div');
        qContainer.className = `space-y-2 mt-2 ${isPatCollapsed ? 'hidden' : ''}`;

        pat.questions.forEach(q => {
          const isDone = solvedSet.has(q.id);
          const qRow = document.createElement('div');
          qRow.className = getRowClass(isDone);

          let diffBadge = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40';
          if (q.diff === 'Medium') diffBadge = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40';
          if (q.diff === 'Hard') diffBadge = 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40';

          qRow.innerHTML = `
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <label class="relative flex items-center justify-center cursor-pointer p-0.5" onclick="event.stopPropagation()">
                <input 
                  type="checkbox" 
                  data-qid="${q.id}"
                  class="checkbox-animate w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-surface-700 bg-white dark:bg-surface-950 text-indigo-600 focus:ring-0 cursor-pointer checked:bg-indigo-600 checked:border-indigo-600 transition"
                  ${isDone ? 'checked' : ''}
                />
              </label>

              <span class="text-xs font-mono text-slate-400 dark:text-slate-500 font-medium flex-shrink-0">#${q.id}</span>

              <a 
                href="${q.link}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 hover:underline truncate flex items-center gap-1.5 transition"
                title="${q.title}"
                onclick="event.stopPropagation()"
              >
                <span class="q-title ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''}">${q.title}</span>
                <svg class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-xs px-2.5 py-1 rounded-lg border font-semibold ${diffBadge}">
                ${q.diff}
              </span>
            </div>
          `;

          // Checkbox handler + In-place State Updates (PREVENTS DROPDOWN CLOSING)
          const checkbox = qRow.querySelector('input[type="checkbox"]');
          checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            const checked = e.target.checked;
            const rect = checkbox.getBoundingClientRect();
            
            if (checked) {
              solvedSet.add(q.id);
              launchFireworks(rect.left + rect.width / 2, rect.top + rect.height / 2);
            } else {
              solvedSet.delete(q.id);
            }
            saveState();

            // Check if active status filter requires re-filtering
            const currentStatusFilter = document.getElementById('status-filter').value;
            if (currentStatusFilter !== 'ALL') {
              // Ensure this category is marked expanded before re-rendering
              expandedCategories.add(catObj.category);
              renderTree();
              return;
            }

            // In-place UI update without collapsing dropdown
            qRow.className = getRowClass(checked);
            const titleSpan = qRow.querySelector('.q-title');
            if (titleSpan) {
              if (checked) {
                titleSpan.classList.add('line-through', 'text-slate-400', 'dark:text-slate-500');
              } else {
                titleSpan.classList.remove('line-through', 'text-slate-400', 'dark:text-slate-500');
              }
            }

            // In-place update pattern & category counts
            updatePatternDOM(patCard, pat);
            updateCategoryDOM(catCard, catObj);
            updateStats();
          });

          qContainer.appendChild(qRow);
        });

        patHeader.addEventListener('click', (e) => {
          e.stopPropagation();
          const isNowHidden = qContainer.classList.toggle('hidden');
          const toggleText = patHeader.querySelector('.pat-toggle-text');
          if (isNowHidden) {
            collapsedPatterns.add(patKey);
            if (toggleText) toggleText.innerText = 'Show';
          } else {
            collapsedPatterns.delete(patKey);
            if (toggleText) toggleText.innerText = 'Hide';
          }
        });

        patCard.appendChild(patHeader);
        patCard.appendChild(qContainer);
        catBody.appendChild(patCard);
      });

      catHeader.addEventListener('click', () => {
        const isHidden = catBody.classList.toggle('hidden');
        const arrow = catHeader.querySelector('.cat-arrow');
        if (isHidden) {
          arrow.textContent = '▶';
          expandedCategories.delete(catObj.category);
        } else {
          arrow.textContent = '▼';
          expandedCategories.add(catObj.category);
        }
      });

      catCard.appendChild(catHeader);
      catCard.appendChild(catBody);
      container.appendChild(catCard);
    });

    if (totalVisible === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-white dark:bg-surface-900/40 border border-slate-200 dark:border-surface-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <p class="text-slate-500 dark:text-slate-400 text-sm">No problems found matching your current search or filters.</p>
        </div>
      `;
    }

    updateStats();
  }

  // --- INITIALIZE & FETCH DATA ---
  async function init() {
    try {
      const res = await fetch('data.json');
      dsaData = await res.json();
    } catch (err) {
      console.error('Failed to load data.json:', err);
    }
    renderTree();
  }

  // --- EVENT LISTENERS ---
  document.getElementById('search-input').addEventListener('input', renderTree);
  document.getElementById('diff-filter').addEventListener('change', renderTree);
  document.getElementById('status-filter').addEventListener('change', renderTree);

  document.getElementById('toggle-all-btn').addEventListener('click', () => {
    isAllExpanded = !isAllExpanded;
    if (isAllExpanded) {
      dsaData.forEach(c => expandedCategories.add(c.category));
      collapsedPatterns.clear();
      document.getElementById('toggle-all-btn').innerText = 'Collapse All';
    } else {
      expandedCategories.clear();
      collapsedPatterns.clear();
      document.getElementById('toggle-all-btn').innerText = 'Expand All';
    }
    renderTree();
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all your solved questions progress?')) {
      solvedSet.clear();
      saveState();
      renderTree();
    }
  });

  // Pick Random Modal
  const modal = document.getElementById('random-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.getElementById('modal-meta');
  const modalLink = document.getElementById('modal-link');

  function pickRandomUnsolved() {
    const pool = [];
    dsaData.forEach(cat => {
      cat.patterns.forEach(pat => {
        pat.questions.forEach(q => {
          if (!solvedSet.has(q.id)) {
            pool.push({ ...q, cat: cat.category, pat: pat.name });
          }
        });
      });
    });

    if (pool.length === 0) {
      alert('🎉 Incredible! You have solved all 500 questions!');
      return;
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];
    modalTitle.innerText = `#${picked.id} - ${picked.title} (${picked.diff})`;
    modalMeta.innerText = `${picked.cat} • Pattern: ${picked.pat}`;
    modalLink.href = picked.link;
    modal.classList.remove('hidden');
  }

  document.getElementById('random-btn').addEventListener('click', pickRandomUnsolved);
  document.getElementById('modal-reroll').addEventListener('click', pickRandomUnsolved);
  document.getElementById('close-modal').addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  init();
})();
