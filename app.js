// DSA Pattern Mastery Tracker Logic
(function () {
  const STORAGE_KEY = 'dsa_tracker_completed_ids_v1';
  let dsaData = [];
  let solvedSet = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
  let isAllExpanded = false;

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
    updateStats();
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

    document.getElementById('stat-total').innerHTML = `${solvedCount} <span class="text-sm font-normal text-slate-500">/ ${total}</span>`;
    document.getElementById('stat-percent').innerText = `${pct}%`;
    document.getElementById('stat-progress-bar').style.width = `${pct}%`;

    document.getElementById('stat-easy').innerText = easySolved;
    document.getElementById('stat-easy-sub').innerText = `${easySolved} / ${easyTotal} Solved`;

    document.getElementById('stat-med').innerText = medSolved;
    document.getElementById('stat-med-sub').innerText = `${medSolved} / ${medTotal} Solved`;

    document.getElementById('stat-hard').innerText = hardSolved;
    document.getElementById('stat-hard-sub').innerText = `${hardSolved} / ${hardTotal} Solved`;
  }

  // --- RENDER ACCORDIONS ---
  const container = document.getElementById('tracker-container');

  function renderTree() {
    const searchVal = document.getElementById('search-input').value.trim().toLowerCase();
    const diffFilter = document.getElementById('diff-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    container.innerHTML = '';
    let totalVisible = 0;

    dsaData.forEach((catObj, catIdx) => {
      let catSolved = 0;
      let catTotal = 0;
      let catMatchingPatterns = [];

      catObj.patterns.forEach((patObj, patIdx) => {
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
            totalUnderPattern: patObj.questions.length
          });
        }
      });

      if (catMatchingPatterns.length === 0) return; // Skip empty category
      totalVisible++;

      // Create Category Accordion Card
      const catCard = document.createElement('div');
      catCard.className = 'border border-surface-800/80 rounded-2xl bg-surface-900/80 overflow-hidden shadow-sm hover:border-surface-700/80 transition-colors';

      const catPercent = catTotal === 0 ? 0 : Math.round((catSolved / catTotal) * 100);
      const isExpanded = isAllExpanded || searchVal.length > 0;

      // Category Header
      const catHeader = document.createElement('div');
      catHeader.className = 'cursor-pointer px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-850/50 hover:bg-surface-850 transition select-none';
      catHeader.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold">
            📁
          </span>
          <div>
            <h2 class="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              ${catObj.category}
              <span class="text-xs font-normal text-slate-400 font-mono">(${catSolved}/${catTotal})</span>
            </h2>
            <div class="w-32 bg-surface-800 rounded-full h-1 mt-1 overflow-hidden">
              <div class="bg-indigo-500 h-1 rounded-full transition-all" style="width: ${catPercent}%"></div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 self-end sm:self-center">
          <span class="text-xs px-2.5 py-1 rounded-full font-mono font-medium ${catPercent === 100 ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50' : 'bg-surface-800 text-slate-400'}">
            ${catPercent}% Done
          </span>
          <span class="text-slate-400 text-sm font-mono transition-transform duration-200 cat-arrow">${isExpanded ? '▼' : '▶'}</span>
        </div>
      `;

      // Category Body
      const catBody = document.createElement('div');
      catBody.className = `p-4 sm:p-5 space-y-4 border-t border-surface-800/60 ${isExpanded ? '' : 'hidden'}`;

      // Render Nested Patterns (Sub-dropdowns)
      catMatchingPatterns.forEach((pat, patIdx) => {
        const patCard = document.createElement('div');
        patCard.className = 'border border-surface-800/60 rounded-xl bg-surface-950/40 p-4';

        const patSolved = pat.questions.filter(q => solvedSet.has(q.id)).length;

        // Pattern Header
        const patHeader = document.createElement('div');
        patHeader.className = 'flex items-center justify-between cursor-pointer mb-3 select-none group';
        patHeader.innerHTML = `
          <div class="flex items-center gap-2">
            <span class="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform">↳</span>
            <span class="text-sm sm:text-base font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
              ${pat.name}
            </span>
            <span class="text-xs text-slate-500 font-mono">(${patSolved}/${pat.questions.length})</span>
          </div>
          <span class="text-xs text-slate-500 group-hover:text-slate-300">Toggle</span>
        `;

        const qContainer = document.createElement('div');
        qContainer.className = 'space-y-2 mt-2';

        pat.questions.forEach(q => {
          const isDone = solvedSet.has(q.id);
          const qRow = document.createElement('div');
          qRow.className = `group flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-200 ${
            isDone 
              ? 'bg-surface-900/40 border-surface-800/40 opacity-70' 
              : 'bg-surface-900/90 border-surface-800 hover:border-surface-700 hover:bg-surface-850/60'
          }`;

          let diffBadge = 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40';
          if (q.diff === 'Medium') diffBadge = 'text-amber-400 bg-amber-950/30 border-amber-800/40';
          if (q.diff === 'Hard') diffBadge = 'text-rose-400 bg-rose-950/30 border-rose-800/40';

          qRow.innerHTML = `
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <label class="relative flex items-center justify-center cursor-pointer">
                <input 
                  type="checkbox" 
                  data-qid="${q.id}"
                  class="checkbox-animate w-5 h-5 rounded-lg border-2 border-surface-700 bg-surface-950 text-indigo-600 focus:ring-0 cursor-pointer checked:bg-indigo-600 checked:border-indigo-600 transition"
                  ${isDone ? 'checked' : ''}
                />
              </label>

              <span class="text-xs font-mono text-slate-500 font-medium">#${q.id}</span>

              <a 
                href="${q.link}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-sm font-medium text-slate-200 group-hover:text-indigo-300 hover:underline truncate flex items-center gap-1.5 transition"
                title="${q.title}"
              >
                <span class="${isDone ? 'line-through text-slate-500' : ''}">${q.title}</span>
                <svg class="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-xs px-2.5 py-1 rounded-lg border font-semibold ${diffBadge}">
                ${q.diff}
              </span>
            </div>
          `;

          // Checkbox handler + Fireworks Trigger
          const checkbox = qRow.querySelector('input[type="checkbox"]');
          checkbox.addEventListener('change', (e) => {
            const rect = checkbox.getBoundingClientRect();
            if (e.target.checked) {
              solvedSet.add(q.id);
              launchFireworks(rect.left + rect.width / 2, rect.top + rect.height / 2);
            } else {
              solvedSet.delete(q.id);
            }
            saveState();
            renderTree();
          });

          qContainer.appendChild(qRow);
        });

        patHeader.addEventListener('click', () => {
          qContainer.classList.toggle('hidden');
        });

        patCard.appendChild(patHeader);
        patCard.appendChild(qContainer);
        catBody.appendChild(patCard);
      });

      catHeader.addEventListener('click', () => {
        catBody.classList.toggle('hidden');
        const arrow = catHeader.querySelector('.cat-arrow');
        arrow.textContent = catBody.classList.contains('hidden') ? '▶' : '▼';
      });

      catCard.appendChild(catHeader);
      catCard.appendChild(catBody);
      container.appendChild(catCard);
    });

    if (totalVisible === 0) {
      container.innerHTML = `
        <div class="text-center py-16 bg-surface-900/40 border border-surface-800 rounded-2xl p-6">
          <p class="text-slate-400 text-sm">No problems found matching your current search or filters.</p>
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
    document.getElementById('toggle-all-btn').innerText = isAllExpanded ? 'Collapse All' : 'Expand All';
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
