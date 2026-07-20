// Grammar module: 20 topics (lesson + 5-question QCM each).
const GrammarModule = (function () {
  let container = null;
  let topics = [];
  let qcmRows = [];

  async function init(rootEl) {
    container = rootEl;
    container.innerHTML = '<p class="loading">Chargement de la grammaire...</p>';
    [topics, qcmRows] = await Promise.all([DataLoader.loadGrammar(), DataLoader.loadGrammarQCM()]);
    topics.sort((a, b) => parseInt(a.Ordre, 10) - parseInt(b.Ordre, 10));
    renderTopicList();
  }

  function renderTopicList() {
    const rows = topics
      .map(
        (t, i) =>
          '<li class="word-row" data-index="' + i + '">' +
          '<span class="word-fr">' + escapeHTML(t.Ordre) + '. ' + escapeHTML(t.Theme) + '</span>' +
          '<span class="word-jp">' + escapeHTML(t.Niveau) + '</span>' +
          '</li>'
      )
      .join('');
    container.innerHTML = '<h2>Grammaire — 20 thèmes</h2><ul class="word-list">' + rows + '</ul>';
    container.querySelectorAll('.word-row').forEach((row) =>
      row.addEventListener('click', () => renderTopic(parseInt(row.dataset.index, 10)))
    );
  }

  function renderTopic(index) {
    const t = topics[index];
    container.innerHTML =
      '<button class="back-btn">&larr; Thèmes</button>' +
      '<h2>' + escapeHTML(t.Ordre) + '. ' + escapeHTML(t.Theme) + ' <span class="verb-jp">(' + escapeHTML(t.Niveau) + ')</span></h2>' +
      '<p class="grammar-points"><strong>À retenir : </strong>' + escapeHTML(t.Points_cles) + '</p>' +
      '<p class="grammar-example"><strong>Exemple : </strong>' + escapeHTML(t.Exemple) + '</p>' +
      '<button class="btn-primary" id="quizBtn">📝 Faire le quiz (5 questions)</button>';

    container.querySelector('.back-btn').addEventListener('click', renderTopicList);
    container.querySelector('#quizBtn').addEventListener('click', () => startQuiz(t));
  }

  function startQuiz(topic, i, score) {
    const questions = qcmRows
      .filter((q) => q.Theme === topic.Theme)
      .sort((a, b) => parseInt(a.Question_num, 10) - parseInt(b.Question_num, 10));
    i = i || 0;
    score = score || 0;

    if (i >= questions.length) {
      ProgressModule.recordQuizScore('grammar', topic.Theme, score, questions.length);
      container.innerHTML =
        '<button class="back-btn">&larr; ' + escapeHTML(topic.Theme) + '</button>' +
        '<h2>Quiz terminé !</h2>' +
        '<p class="quiz-result">Score : ' + score + ' / ' + questions.length + '</p>' +
        '<button class="btn-primary" id="retryBtn">Recommencer</button>';
      container.querySelector('.back-btn').addEventListener('click', () => renderTopic(topics.indexOf(topic)));
      container.querySelector('#retryBtn').addEventListener('click', () => startQuiz(topic));
      return;
    }

    const q = questions[i];
    const options = [q.Option_A, q.Option_B, q.Option_C, q.Option_D];
    container.innerHTML =
      '<button class="back-btn">&larr; ' + escapeHTML(topic.Theme) + '</button>' +
      '<div class="quiz-progress">Question ' + (i + 1) + ' / ' + questions.length + '</div>' +
      '<div class="quiz-question">' + escapeHTML(q.Question) + '</div>' +
      '<div class="quiz-options">' +
      options.map((opt, oi) => '<button class="quiz-option" data-opt="' + oi + '">' + escapeHTML(opt) + '</button>').join('') +
      '</div>' +
      '<div id="quizFeedback" class="pron-feedback"></div>';

    container.querySelector('.back-btn').addEventListener('click', () => renderTopic(topics.indexOf(topic)));
    container.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.quiz-option').forEach((b) => (b.disabled = true));
        const chosen = options[parseInt(btn.dataset.opt, 10)];
        const correct = chosen === q.Reponse_correcte;
        btn.classList.add(correct ? 'correct' : 'incorrect');
        container.querySelector('#quizFeedback').textContent = correct
          ? '✅ Bravo !'
          : '❌ La bonne réponse était : ' + q.Reponse_correcte;
        setTimeout(() => startQuiz(topic, i + 1, score + (correct ? 1 : 0)), 1400);
      });
    });
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  return { init };
})();
