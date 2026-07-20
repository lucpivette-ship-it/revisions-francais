// Vocabulary module: browse by theme, flashcards with image placeholder +
// listen button, and a pronunciation quiz using speech recognition.
const VocabModule = (function () {
  let container = null;
  let allWords = [];
  let categories = [];

  async function init(rootEl) {
    container = rootEl;
    container.innerHTML = '<p class="loading">Chargement du vocabulaire...</p>';
    allWords = await DataLoader.loadVocab();
    categories = await DataLoader.getCategories();
    renderCategoryList();
  }

  function wordsInCategory(cat) {
    return allWords.filter((w) => w.categorie === cat);
  }

  function renderCategoryList() {
    const rows = categories
      .map((cat) => {
        const count = wordsInCategory(cat).length;
        const jp = DataLoader.categoryJP(cat);
        return (
          '<button class="category-card" data-cat="' +
          escapeAttr(cat) +
          '">' +
          '<span class="category-name">' + escapeHTML(cat) + (jp ? ' ( ' + escapeHTML(jp) + ' )' : '') + '</span>' +
          '<span class="category-count">' + count + ' mots</span>' +
          '</button>'
        );
      })
      .join('');
    container.innerHTML =
      '<h2>Vocabulaire — choisis un thème</h2><div class="category-grid">' + rows + '</div>';
    container.querySelectorAll('.category-card').forEach((btn) => {
      btn.addEventListener('click', () => renderCategory(btn.dataset.cat));
    });
  }

  function renderCategory(cat) {
    const words = wordsInCategory(cat);
    const jp = DataLoader.categoryJP(cat);
    const list = words
      .map(
        (w, i) =>
          '<li class="word-row" data-index="' + i + '">' +
          '<span class="word-fr">' + escapeHTML(w.francais) + '</span>' +
          '<span class="word-jp">' + escapeHTML(w.japonais) + '</span>' +
          '</li>'
      )
      .join('');
    container.innerHTML =
      '<button class="back-btn">&larr; Thèmes</button>' +
      '<h2>' + escapeHTML(cat) + (jp ? ' ( ' + escapeHTML(jp) + ' )' : '') + '</h2>' +
      '<div class="category-actions">' +
      '<button class="btn-primary" id="startQuizBtn">🎤 Quiz de prononciation</button>' +
      '</div>' +
      '<ul class="word-list">' + list + '</ul>';

    container.querySelector('.back-btn').addEventListener('click', renderCategoryList);
    container.querySelectorAll('.word-row').forEach((row) => {
      row.addEventListener('click', () =>
        renderFlashcard(words, parseInt(row.dataset.index, 10), cat)
      );
    });
    container.querySelector('#startQuizBtn').addEventListener('click', () => startQuiz(words, cat));
  }

  function renderFlashcard(words, index, cat) {
    const w = words[index];
    ProgressModule.markWordSeen(w.francais);

    container.innerHTML =
      '<button class="back-btn">&larr; ' + escapeHTML(cat) + '</button>' +
      '<div class="flashcard">' +
      '<div class="image-box" id="imgBox">' +
      '<img src="' + escapeAttr(w.image) + '" alt="" id="wordImg">' +
      '<div class="image-placeholder" id="imgPlaceholder" style="display:none">' +
      placeholderIconSVG() +
      '<span>Photo à venir</span>' +
      '</div>' +
      '</div>' +
      '<div class="word-fr-big">' + escapeHTML(w.francais) + '</div>' +
      '<div class="word-jp-big">' + escapeHTML(w.japonais) + '</div>' +
      '<div class="flashcard-actions">' +
      '<button class="btn-icon" id="playBtn" title="Écouter">🔊 Écouter</button>' +
      '<button class="btn-icon" id="micBtn" title="S\'entraîner">🎤 Répéter</button>' +
      '</div>' +
      '<div id="pronFeedback" class="pron-feedback"></div>' +
      '<div class="flashcard-nav">' +
      '<button id="prevBtn" ' + (index === 0 ? 'disabled' : '') + '>&larr; Précédent</button>' +
      '<span class="flashcard-count">' + (index + 1) + ' / ' + words.length + '</span>' +
      '<button id="nextBtn" ' + (index === words.length - 1 ? 'disabled' : '') + '>Suivant &rarr;</button>' +
      '</div>' +
      '</div>';

    const img = container.querySelector('#wordImg');
    img.addEventListener('error', () => {
      img.style.display = 'none';
      container.querySelector('#imgPlaceholder').style.display = 'flex';
    });

    container.querySelector('.back-btn').addEventListener('click', () => renderCategory(cat));
    container.querySelector('#playBtn').addEventListener('click', () => SpeechHelper.speak(w.francais));
    container.querySelector('#micBtn').addEventListener('click', () => {
      const feedback = container.querySelector('#pronFeedback');
      if (!SpeechHelper.isRecognitionSupported()) {
        feedback.textContent = "La reconnaissance vocale n'est pas disponible sur cet appareil/navigateur.";
        return;
      }
      feedback.textContent = '🎙️ Je t\'écoute...';
      SpeechHelper.startPronunciationCheck(
        w.francais,
        (success, transcript) => {
          feedback.textContent = success
            ? '✅ Bien prononcé !'
            : '❌ Essaie encore (j\'ai entendu : "' + transcript + '")';
        },
        () => { feedback.textContent = "Je n'ai pas compris, réessaie."; }
      );
    });
    if (index > 0) {
      container.querySelector('#prevBtn').addEventListener('click', () => renderFlashcard(words, index - 1, cat));
    }
    if (index < words.length - 1) {
      container.querySelector('#nextBtn').addEventListener('click', () => renderFlashcard(words, index + 1, cat));
    }
  }

  function startQuiz(words, cat, i, score) {
    i = i || 0;
    score = score || 0;
    if (i >= words.length) {
      ProgressModule.recordQuizScore('vocab_pronunciation', cat, score, words.length);
      container.innerHTML =
        '<button class="back-btn">&larr; ' + escapeHTML(cat) + '</button>' +
        '<h2>Quiz terminé !</h2>' +
        '<p class="quiz-result">Score : ' + score + ' / ' + words.length + '</p>' +
        '<button class="btn-primary" id="retryBtn">Recommencer</button>';
      container.querySelector('.back-btn').addEventListener('click', () => renderCategory(cat));
      container.querySelector('#retryBtn').addEventListener('click', () => startQuiz(words, cat));
      return;
    }
    const w = words[i];
    container.innerHTML =
      '<button class="back-btn">&larr; ' + escapeHTML(cat) + '</button>' +
      '<div class="quiz-progress">Mot ' + (i + 1) + ' / ' + words.length + '</div>' +
      '<div class="flashcard">' +
      '<div class="word-fr-big">' + escapeHTML(w.francais) + '</div>' +
      '<div class="word-jp-big">' + escapeHTML(w.japonais) + '</div>' +
      '<button class="btn-icon" id="playBtn">🔊 Écouter</button>' +
      '<button class="btn-primary" id="micBtn">🎤 Prononcer</button>' +
      '<div id="pronFeedback" class="pron-feedback"></div>' +
      '<button class="btn-icon" id="nextQBtn" style="display:none">Suivant &rarr;</button>' +
      '</div>';

    container.querySelector('.back-btn').addEventListener('click', () => renderCategory(cat));
    container.querySelector('#playBtn').addEventListener('click', () => SpeechHelper.speak(w.francais));
    container.querySelector('#micBtn').addEventListener('click', () => {
      const feedback = container.querySelector('#pronFeedback');
      const nextBtn = container.querySelector('#nextQBtn');
      if (!SpeechHelper.isRecognitionSupported()) {
        feedback.textContent = "La reconnaissance vocale n'est pas disponible sur cet appareil/navigateur.";
        nextBtn.style.display = 'inline-block';
        return;
      }
      feedback.textContent = '🎙️ Je t\'écoute...';
      SpeechHelper.startPronunciationCheck(
        w.francais,
        (success, transcript) => {
          feedback.textContent = success ? '✅ Bien prononcé !' : '❌ Raté (entendu : "' + transcript + '")';
          nextBtn.style.display = 'inline-block';
          nextBtn.dataset.success = success ? '1' : '0';
        },
        () => {
          feedback.textContent = "Je n'ai pas compris.";
          nextBtn.style.display = 'inline-block';
          nextBtn.dataset.success = '0';
        }
      );
    });
    container.querySelector('#nextQBtn').addEventListener('click', (e) => {
      const gained = e.target.dataset.success === '1' ? 1 : 0;
      startQuiz(words, cat, i + 1, score + gained);
    });
  }

  function placeholderIconSVG() {
    return '<svg viewBox="0 0 64 64" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2.5">' +
      '<rect x="6" y="16" width="52" height="38" rx="4"/>' +
      '<circle cx="32" cy="35" r="10"/>' +
      '<path d="M20 16l4-6h16l4 6"/>' +
      '</svg>';
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function escapeAttr(s) { return escapeHTML(s); }

  return { init };
})();
