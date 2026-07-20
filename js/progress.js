// Tracks per-user progress in localStorage. Two users supported: E and A.
const ProgressModule = (function () {
  const USER_KEY = 'revfr_current_user';

  function getCurrentUser() {
    return localStorage.getItem(USER_KEY) || 'E';
  }

  function setCurrentUser(user) {
    localStorage.setItem(USER_KEY, user);
  }

  function storageKey(suffix) {
    return 'revfr_' + getCurrentUser() + '_' + suffix;
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ---- vocabulary ----
  function markWordSeen(word) {
    const seen = readJSON(storageKey('vocab_seen'), {});
    seen[word] = (seen[word] || 0) + 1;
    writeJSON(storageKey('vocab_seen'), seen);
  }

  function markWordKnown(word, known) {
    const known_ = readJSON(storageKey('vocab_known'), {});
    known_[word] = !!known;
    writeJSON(storageKey('vocab_known'), known_);
  }

  function getVocabStats() {
    const seen = readJSON(storageKey('vocab_seen'), {});
    const known = readJSON(storageKey('vocab_known'), {});
    const seenCount = Object.keys(seen).length;
    const knownCount = Object.values(known).filter(Boolean).length;
    return { seenCount, knownCount };
  }

  // ---- quiz scores (conjugation QCM, grammar QCM, pronunciation quiz) ----
  function recordQuizScore(moduleName, topic, score, total) {
    const scores = readJSON(storageKey('quiz_scores'), {});
    if (!scores[moduleName]) scores[moduleName] = {};
    scores[moduleName][topic] = { score, total, date: new Date().toISOString() };
    writeJSON(storageKey('quiz_scores'), scores);
  }

  function getQuizScores(moduleName) {
    const scores = readJSON(storageKey('quiz_scores'), {});
    return scores[moduleName] || {};
  }

  function getAllProgress() {
    return {
      user: getCurrentUser(),
      vocab: getVocabStats(),
      quizzes: readJSON(storageKey('quiz_scores'), {}),
    };
  }

  return {
    getCurrentUser,
    setCurrentUser,
    markWordSeen,
    markWordKnown,
    getVocabStats,
    recordQuizScore,
    getQuizScores,
    getAllProgress,
  };
})();
