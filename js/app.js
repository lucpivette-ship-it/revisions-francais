// App shell: user switcher, tab navigation, home dashboard, service worker.
(function () {
  const views = {
    home: document.getElementById('view-home'),
    vocab: document.getElementById('view-vocab'),
    conjugation: document.getElementById('view-conjugation'),
    grammar: document.getElementById('view-grammar'),
  };
  const navButtons = document.querySelectorAll('.nav-btn');
  const userButtons = document.querySelectorAll('.user-btn');
  const loaded = { vocab: false, conjugation: false, grammar: false };

  function showView(name) {
    Object.keys(views).forEach((key) => {
      views[key].style.display = key === name ? 'block' : 'none';
    });
    navButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === name));

    if (name === 'home') renderHome();
    if (name === 'vocab' && !loaded.vocab) { loaded.vocab = true; VocabModule.init(views.vocab); }
    if (name === 'conjugation' && !loaded.conjugation) { loaded.conjugation = true; ConjugationModule.init(views.conjugation); }
    if (name === 'grammar' && !loaded.grammar) { loaded.grammar = true; GrammarModule.init(views.grammar); }
  }

  function renderHome() {
    const p = ProgressModule.getAllProgress();
    const vocabStats = p.vocab;
    const quizSummaryHTML = Object.keys(p.quizzes)
      .map((moduleName) => {
        const entries = p.quizzes[moduleName];
        const rows = Object.keys(entries)
          .map((topic) => {
            const e = entries[topic];
            return '<li>' + escapeHTML(topic) + ' : ' + e.score + ' / ' + e.total + '</li>';
          })
          .join('');
        return '<div class="home-quiz-block"><h3>' + escapeHTML(moduleLabel(moduleName)) + '</h3><ul>' + rows + '</ul></div>';
      })
      .join('') || '<p>Pas encore de quiz fait.</p>';

    views.home.innerHTML =
      '<h2>Bienvenue, ' + escapeHTML(p.user) + ' !</h2>' +
      '<div class="home-stats">' +
      '<div class="home-stat-card"><span class="home-stat-num">' + vocabStats.seenCount + '</span><span>mots vus</span></div>' +
      '<div class="home-stat-card"><span class="home-stat-num">' + vocabStats.knownCount + '</span><span>mots connus</span></div>' +
      '</div>' +
      '<h3>Résultats des quiz</h3>' + quizSummaryHTML;
  }

  function moduleLabel(key) {
    return { vocab_pronunciation: 'Prononciation (vocabulaire)', conjugation: 'Conjugaison', grammar: 'Grammaire' }[key] || key;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  navButtons.forEach((btn) => btn.addEventListener('click', () => showView(btn.dataset.view)));

  function refreshUserButtons() {
    const current = ProgressModule.getCurrentUser();
    userButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.user === current));
  }
  userButtons.forEach((btn) =>
    btn.addEventListener('click', () => {
      ProgressModule.setCurrentUser(btn.dataset.user);
      refreshUserButtons();
      showView('home');
    })
  );
  refreshUserButtons();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }

  showView('home');
})();
