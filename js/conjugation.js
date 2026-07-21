// Conjugation module: lessons organized tense-by-tense (présent first),
// karaoke-style highlighted audio playback, and a multiple-choice quiz.
const ConjugationModule = (function () {
  let container = null;
  let allVerbs = [];

  const TENSES = [
    { key: 'Present', label: 'Présent' },
    { key: 'Futur', label: 'Futur simple' },
    { key: 'PasseCompose', label: 'Passé composé' },
  ];
  const PRONOUNS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];
  const PRONOUN_LABELS = {
    je: 'je',
    tu: 'tu',
    // Commas after "il" and "ils" keep the pair visually/audibly separate,
    // so they don't read as a liaison between "il" and "elle" (or "ils" and "elles").
    'il/elle': 'il, elle',
    nous: 'nous',
    vous: 'vous',
    'ils/elles': 'ils, elles',
  };

  // "je" elides to "j'" before a verb form starting with a vowel sound
  // (a, e, i, o, u, y, or a mute h — e.g. "habiter" -> "j'habite").
  const VOWEL_SOUND = /^[aeiouyàâäéèêëîïôöùûüœ]/i;

  function formatPronounForm(pronoun, form) {
    if (pronoun === 'je' && VOWEL_SOUND.test(form)) {
      return "j'" + form;
    }
    return PRONOUN_LABELS[pronoun] + ' ' + form;
  }

  async function init(rootEl) {
    container = rootEl;
    container.innerHTML = '<p class="loading">Chargement des verbes...</p>';
    allVerbs = await DataLoader.loadVerbs();
    renderTenseView(TENSES[0].key);
  }

  function getForm(verbRow, tenseKey, pronoun) {
    return verbRow[tenseKey + '_' + pronoun];
  }

  function renderTenseTabs(activeKey) {
    return (
      '<div class="tense-tabs">' +
      TENSES.map(
        (t) =>
          '<button class="tense-tab' + (t.key === activeKey ? ' active' : '') + '" data-tense="' + t.key + '">' +
          t.label +
          '</button>'
      ).join('') +
      '</div>'
    );
  }

  function renderTenseView(tenseKey) {
    const label = TENSES.find((t) => t.key === tenseKey).label;
    const rows = allVerbs
      .map(
        (v, i) =>
          '<li class="verb-row" data-index="' + i + '">' +
          '<span class="verb-inf">' + escapeHTML(v.Infinitif) + '</span>' +
          '<span class="verb-groupe">' + ' ( ' + escapeHTML(v.Japonais) + ' ) ' + escapeHTML(v.Groupe) + '</span>' +
          '</li>'
      )
      .join('');
    container.innerHTML =
      '<h2>Conjugaison</h2>' +
      renderTenseTabs(tenseKey) +
      '<p class="tense-hint">Leçons au <strong>' + label + '</strong> — clique sur un verbe.</p>' +
      '<div class="category-actions"><button class="btn-primary" id="qcmBtn">📝 Quiz QCM — ' + label + '</button></div>' +
      '<ul class="word-list">' + rows + '</ul>';

    container.querySelectorAll('.tense-tab').forEach((btn) =>
      btn.addEventListener('click', () => renderTenseView(btn.dataset.tense))
    );
    container.querySelectorAll('.verb-row').forEach((row) =>
      row.addEventListener('click', () => renderLesson(parseInt(row.dataset.index, 10), tenseKey))
    );
    container.querySelector('#qcmBtn').addEventListener('click', () => startQCM(tenseKey));
  }

  function renderLesson(index, tenseKey) {
    const v = allVerbs[index];
    const label = TENSES.find((t) => t.key === tenseKey).label;
    const segments = PRONOUNS.map((p) => formatPronounForm(p, getForm(v, tenseKey, p)));

    const spansHTML = segments
      .map(
        (seg, i) =>
          '<div class="conj-row"><span class="conj-segment" id="seg' + i + '">' + escapeHTML(seg) + '</span></div>'
      )
      .join('');

    container.innerHTML =
      '<button class="back-btn">&larr; Retour</button>' +
      '<h2>' + escapeHTML(v.Infinitif) + ' <span class="verb-jp">(' + escapeHTML(v.Japonais) + ')</span></h2>' +
      '<p class="tense-hint">' + label + ' — ' + escapeHTML(v.Groupe) + ', auxiliaire : ' + escapeHTML(v.Auxiliaire) + '</p>' +
      '<div class="conj-text">' + spansHTML + '</div>' +
      '<button class="btn-icon" id="playBtn">🔊 Écouter la conjugaison</button>';

    container.querySelector('.back-btn').addEventListener('click', () => renderTenseView(tenseKey));

    // build char offsets of each segment within the full narrated text
    const fullText = segments.join(', ') + '.';
    const offsets = [];
    let pos = 0;
    segments.forEach((seg) => {
      offsets.push(pos);
      pos += seg.length + 2; // + ", "
    });

    container.querySelector('#playBtn').addEventListener('click', () => {
      container.querySelectorAll('.conj-segment').forEach((s) => s.classList.remove('highlight'));
      SpeechHelper.speakWithBoundary(
        fullText,
        (charIndex) => {
          let current = 0;
          for (let i = 0; i < offsets.length; i++) {
            if (charIndex >= offsets[i]) current = i;
          }
          container.querySelectorAll('.conj-segment').forEach((s) => s.classList.remove('highlight'));
          const el = container.querySelector('#seg' + current);
          if (el) el.classList.add('highlight');
        },
        () => {
          container.querySelectorAll('.conj-segment').forEach((s) => s.classList.remove('highlight'));
        }
      );
    });
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildQuestions(tenseKey, count) {
    const label = TENSES.find((t) => t.key === tenseKey).label;
    const verbs = shuffle(allVerbs).slice(0, count);
    return verbs.map((v) => {
      const pronoun = PRONOUNS[Math.floor(Math.random() * PRONOUNS.length)];
      const correct = getForm(v, tenseKey, pronoun);
      const distractorPool = allVerbs
        .filter((other) => other.Infinitif !== v.Infinitif)
        .map((other) => getForm(other, tenseKey, pronoun))
        .filter((f) => f && f !== correct);
      const distractors = shuffle([...new Set(distractorPool)]).slice(0, 3);
      const options = shuffle([correct, ...distractors]);
      return {
        question: 'Comment conjugue-t-on "' + v.Infinitif + '" à "' + PRONOUN_LABELS[pronoun] + '" (' + label + ') ?',
        options,
        correct,
      };
    });
  }

  function startQCM(tenseKey, questions, i, score) {
    if (!questions) questions = buildQuestions(tenseKey, 10);
    i = i || 0;
    score = score || 0;
    const label = TENSES.find((t) => t.key === tenseKey).label;

    if (i >= questions.length) {
      ProgressModule.recordQuizScore('conjugation', tenseKey, score, questions.length);
      container.innerHTML =
        '<button class="back-btn">&larr; Retour</button>' +
        '<h2>Quiz terminé — ' + label + '</h2>' +
        '<p class="quiz-result">Score : ' + score + ' / ' + questions.length + '</p>' +
        '<button class="btn-primary" id="retryBtn">Recommencer</button>';
      container.querySelector('.back-btn').addEventListener('click', () => renderTenseView(tenseKey));
      container.querySelector('#retryBtn').addEventListener('click', () => startQCM(tenseKey));
      return;
    }

    const q = questions[i];
    container.innerHTML =
      '<button class="back-btn">&larr; Retour</button>' +
      '<div class="quiz-progress">Question ' + (i + 1) + ' / ' + questions.length + '</div>' +
      '<div class="quiz-question">' + escapeHTML(q.question) + '</div>' +
      '<div class="quiz-options">' +
      q.options
        .map((opt, oi) => '<button class="quiz-option" data-opt="' + oi + '">' + escapeHTML(opt) + '</button>')
        .join('') +
      '</div>' +
      '<div id="quizFeedback" class="pron-feedback"></div>';

    container.querySelector('.back-btn').addEventListener('click', () => renderTenseView(tenseKey));
    container.querySelectorAll('.quiz-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.quiz-option').forEach((b) => (b.disabled = true));
        const chosen = q.options[parseInt(btn.dataset.opt, 10)];
        const correct = chosen === q.correct;
        btn.classList.add(correct ? 'correct' : 'incorrect');
        container.querySelector('#quizFeedback').textContent = correct
          ? '✅ Bravo !'
          : '❌ La bonne réponse était : ' + q.correct;
        setTimeout(() => startQCM(tenseKey, questions, i + 1, score + (correct ? 1 : 0)), 1400);
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
