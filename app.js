// DSA Pattern Mastery Tracker Logic
(function () {
  const STORAGE_KEY = 'dsa_tracker_completed_ids_v1';
  const THEME_KEY = 'dsa_tracker_theme';
  let dsaData = [];
  let solvedSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
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
      const isExpanded = searchVal.length > 0 || expandedCategories.has(catObj.category);

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

  // --- USER AUTHENTICATION SYSTEM (User ID, Password & Google Auth) ---
  const AUTH_STORAGE_KEY = 'dsa_tracker_auth_user_v1';
  let currentUser = null;
  let isSignUpMode = false;

  const authModal = document.getElementById('auth-modal');
  const loginOpenBtn = document.getElementById('login-open-btn');
  const authCloseBtn = document.getElementById('auth-close-btn');
  const userProfileMenu = document.getElementById('user-profile-menu');
  const userAvatar = document.getElementById('user-avatar');
  const userDisplayName = document.getElementById('user-display-name');
  const logoutBtn = document.getElementById('logout-btn');

  const authForm = document.getElementById('auth-form');
  const authUserIdInput = document.getElementById('auth-userid');
  const authPasswordInput = document.getElementById('auth-password');
  const authTogglePwdBtn = document.getElementById('auth-toggle-pwd');
  const authEyeIcon = document.getElementById('auth-eye-icon');
  const authEyeOffIcon = document.getElementById('auth-eye-off-icon');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const authBtnText = document.getElementById('auth-btn-text');
  const authBtnSpinner = document.getElementById('auth-btn-spinner');
  const googleLoginBtn = document.getElementById('google-login-btn');
  const authAlert = document.getElementById('auth-alert');
  const authAlertMsg = document.getElementById('auth-alert-message');
  const authModalTitle = document.getElementById('auth-modal-title');
  const authModalSubtitle = document.getElementById('auth-modal-subtitle');
  const authToggleModeBtn = document.getElementById('auth-toggle-mode-btn');
  const authTogglePrompt = document.getElementById('auth-toggle-prompt');
  const authForgotBtn = document.getElementById('auth-forgot-btn');

  function showAuthAlert(message, isSuccess = false) {
    if (!authAlert || !authAlertMsg) return;
    authAlert.className = isSuccess
      ? 'mb-4 p-3 rounded-xl text-xs sm:text-sm border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2'
      : 'mb-4 p-3 rounded-xl text-xs sm:text-sm border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2';
    authAlertMsg.textContent = message;
    authAlert.classList.remove('hidden');
  }

  function clearAuthAlert() {
    if (authAlert) {
      authAlert.classList.add('hidden');
      if (authAlertMsg) authAlertMsg.textContent = '';
    }
  }

  function openAuthModal() {
    clearAuthAlert();
    if (authUserIdInput) authUserIdInput.value = '';
    if (authPasswordInput) {
      authPasswordInput.value = '';
      authPasswordInput.type = 'password';
      if (authEyeIcon) authEyeIcon.classList.remove('hidden');
      if (authEyeOffIcon) authEyeOffIcon.classList.add('hidden');
    }
    if (authModal) authModal.classList.remove('hidden');
    setTimeout(() => {
      if (authUserIdInput) authUserIdInput.focus();
    }, 100);
  }

  function closeAuthModal() {
    if (authModal) authModal.classList.add('hidden');
    clearAuthAlert();
  }

  function updateAuthUI() {
    if (currentUser) {
      if (loginOpenBtn) loginOpenBtn.classList.add('hidden');
      if (userProfileMenu) {
        userProfileMenu.classList.remove('hidden');
        userProfileMenu.classList.add('flex');
      }
      if (userDisplayName) {
        userDisplayName.textContent = currentUser.name || currentUser.id || 'User';
      }
      if (userAvatar) {
        const initial = (currentUser.name || currentUser.id || 'U').charAt(0).toUpperCase();
        if (currentUser.authProvider === 'google') {
          userAvatar.innerHTML = `
            <svg class="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          `;
          userAvatar.className = 'w-7 h-7 rounded-lg bg-white dark:bg-surface-800 border border-slate-200 dark:border-surface-700 flex items-center justify-center shadow-inner';
        } else {
          userAvatar.textContent = initial;
          userAvatar.className = 'w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-inner';
        }
      }
    } else {
      if (loginOpenBtn) loginOpenBtn.classList.remove('hidden');
      if (userProfileMenu) {
        userProfileMenu.classList.add('hidden');
        userProfileMenu.classList.remove('flex');
      }
    }
  }

  function initAuth() {
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedUser) {
        currentUser = JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
      currentUser = null;
    }
    updateAuthUI();
  }

  // Toggle Password Visibility
  if (authTogglePwdBtn) {
    authTogglePwdBtn.addEventListener('click', () => {
      const isPassword = authPasswordInput.type === 'password';
      authPasswordInput.type = isPassword ? 'text' : 'password';
      if (authEyeIcon) authEyeIcon.classList.toggle('hidden', isPassword);
      if (authEyeOffIcon) authEyeOffIcon.classList.toggle('hidden', !isPassword);
    });
  }

  // Toggle Mode (Sign In vs Sign Up)
  if (authToggleModeBtn) {
    authToggleModeBtn.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      clearAuthAlert();
      if (isSignUpMode) {
        authModalTitle.textContent = 'Create Account';
        authModalSubtitle.textContent = 'Join DSA Tracker to start tracking your DSA journey';
        authBtnText.textContent = 'Sign Up';
        authTogglePrompt.textContent = 'Already have an account?';
        authToggleModeBtn.textContent = 'Sign in';
      } else {
        authModalTitle.textContent = 'Welcome Back';
        authModalSubtitle.textContent = 'Sign in to DSA Tracker to sync your progress across devices';
        authBtnText.textContent = 'Sign In';
        authTogglePrompt.textContent = "Don't have an account?";
        authToggleModeBtn.textContent = 'Sign up';
      }
    });
  }

  // Form Submit (User ID + Password)
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearAuthAlert();

      const userId = authUserIdInput.value.trim();
      const password = authPasswordInput.value;

      if (!userId) {
        showAuthAlert('Please enter your User ID or Email.');
        authUserIdInput.focus();
        return;
      }
      if (!password) {
        showAuthAlert('Please enter your password.');
        authPasswordInput.focus();
        return;
      }
      if (password.length < 4) {
        showAuthAlert('Password must be at least 4 characters long.');
        authPasswordInput.focus();
        return;
      }

      // Simulate Authentication Processing
      authSubmitBtn.disabled = true;
      authBtnSpinner.classList.remove('hidden');
      authBtnText.textContent = isSignUpMode ? 'Creating Account...' : 'Signing in...';

      setTimeout(() => {
        authSubmitBtn.disabled = false;
        authBtnSpinner.classList.add('hidden');
        authBtnText.textContent = isSignUpMode ? 'Sign Up' : 'Sign In';

        const displayName = userId.includes('@') ? userId.split('@')[0] : userId;
        currentUser = {
          id: userId,
          name: displayName,
          authProvider: 'local',
          loggedInAt: Date.now()
        };

        const rememberMe = document.getElementById('auth-remember')?.checked;
        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
        }

        showAuthAlert(`Success! Welcome ${displayName}! 🎉`, true);
        launchFireworks(window.innerWidth / 2, window.innerHeight / 3);
        updateAuthUI();

        setTimeout(() => {
          closeAuthModal();
        }, 800);
      }, 500);
    });
  }

  // Continue with Google
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
      clearAuthAlert();
      const originalContent = googleLoginBtn.innerHTML;

      // Loading state
      googleLoginBtn.disabled = true;
      googleLoginBtn.innerHTML = `
        <svg class="w-4 h-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Connecting to Google...</span>
      `;

      setTimeout(() => {
        googleLoginBtn.disabled = false;
        googleLoginBtn.innerHTML = originalContent;

        currentUser = {
          id: 'google_user_' + Math.floor(1000 + Math.random() * 9000),
          name: 'Google User',
          email: 'user.google@gmail.com',
          authProvider: 'google',
          loggedInAt: Date.now()
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
        showAuthAlert('Successfully connected with Google! 🎉', true);
        launchFireworks(window.innerWidth / 2, window.innerHeight / 3);
        updateAuthUI();

        setTimeout(() => {
          closeAuthModal();
        }, 700);
      }, 650);
    });
  }

  // Forgot password helper
  if (authForgotBtn) {
    authForgotBtn.addEventListener('click', () => {
      const userId = authUserIdInput.value.trim();
      if (!userId) {
        showAuthAlert('Enter your User ID or Email above, then click Forgot.');
      } else {
        showAuthAlert(`Password reset instructions sent to "${userId}" (simulated).`, true);
      }
    });
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to sign out?')) {
        currentUser = null;
        localStorage.removeItem(AUTH_STORAGE_KEY);
        updateAuthUI();
      }
    });
  }

  // Modal Open/Close Listeners
  if (loginOpenBtn) loginOpenBtn.addEventListener('click', openAuthModal);
  if (authCloseBtn) authCloseBtn.addEventListener('click', closeAuthModal);
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // Global ESC key listener for modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (authModal && !authModal.classList.contains('hidden')) closeAuthModal();
      if (modal && !modal.classList.contains('hidden')) modal.classList.add('hidden');
    }
  });

  // --- INTERACTIVE SMOOTH CUSTOM CURSOR MOVEMENT ---
  function initCustomCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const glow = document.getElementById('cursor-glow');

    if (!dot || !ring) return;

    let mouseX = -200, mouseY = -200;
    let ringX = -200, ringY = -200;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        if (glow) glow.style.opacity = '1';
        ringX = mouseX;
        ringY = mouseY;
      }

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    function renderCursor() {
      // Smooth linear interpolation (physics delay)
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      if (glow) glow.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      if (glow) glow.style.opacity = '0';
      isVisible = false;
    });

    document.addEventListener('mouseenter', () => {
      if (isVisible) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        if (glow) glow.style.opacity = '1';
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-active');
    });

    document.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-active');
    });

    // Detect hover on interactive items
    document.addEventListener('mouseover', (e) => {
      const interactive = e.target.closest('button, a, input, select, label, .cursor-pointer, [role="button"]');
      if (interactive) {
        document.body.classList.add('cursor-hovering');
      } else {
        document.body.classList.remove('cursor-hovering');
      }
    });
  }

  initCustomCursor();
  initAuth();
  init();
})();
