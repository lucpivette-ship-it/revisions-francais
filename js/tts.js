// Speech helpers: text-to-speech playback (Web Speech API) and a lenient
// pronunciation-quiz recognizer (SpeechRecognition), both in French.
const SpeechHelper = (function () {
  let frenchVoice = null;

  function pickFrenchVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('fr')) || null;
  }

  if ('speechSynthesis' in window) {
    frenchVoice = pickFrenchVoice();
    window.speechSynthesis.onvoiceschanged = function () {
      frenchVoice = pickFrenchVoice();
    };
  }

  function isTTSSupported() {
    return 'speechSynthesis' in window;
  }

  function speak(text, rate) {
    if (!isTTSSupported()) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = rate || 0.9;
    if (frenchVoice) utter.voice = frenchVoice;
    window.speechSynthesis.speak(utter);
  }

  // Speaks `text` and calls onBoundary(charIndex) as each word is reached,
  // so the caller can highlight the matching span (karaoke-style).
  function speakWithBoundary(text, onBoundary, onEnd, rate) {
    if (!isTTSSupported()) { if (onEnd) onEnd(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'fr-FR';
    utter.rate = rate || 0.8;
    if (frenchVoice) utter.voice = frenchVoice;
    utter.onboundary = function (event) {
      if (event.name === 'word' && onBoundary) onBoundary(event.charIndex);
    };
    utter.onend = function () { if (onEnd) onEnd(); };
    utter.onerror = function () { if (onEnd) onEnd(); };
    window.speechSynthesis.speak(utter);
  }

  function isRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function normalizeForCompare(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .split('')
      .filter((ch) => {
        const code = ch.codePointAt(0);
        return !(code >= 0x0300 && code <= 0x036f);
      })
      .join('')
      .replace(/^(le |la |les |l'|un |une |des )/, '')
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
  }

  // Listens for one utterance and reports whether it matches expectedText
  // (lenient: articles stripped, accents stripped, case-insensitive).
  function startPronunciationCheck(expectedText, onResult, onError) {
    if (!isRecognitionSupported()) {
      if (onError) onError('not-supported');
      return null;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new Recognition();
    recognizer.lang = 'fr-FR';
    recognizer.maxAlternatives = 3;
    recognizer.interimResults = false;

    recognizer.onresult = function (event) {
      const alternatives = [];
      for (let i = 0; i < event.results[0].length; i++) {
        alternatives.push(event.results[0][i].transcript);
      }
      const target = normalizeForCompare(expectedText);
      const success = alternatives.some((alt) => normalizeForCompare(alt) === target);
      if (onResult) onResult(success, alternatives[0] || '');
    };
    recognizer.onerror = function (event) {
      if (onError) onError(event.error);
    };
    recognizer.start();
    return recognizer;
  }

  return {
    isTTSSupported,
    speak,
    speakWithBoundary,
    isRecognitionSupported,
    startPronunciationCheck,
    normalizeForCompare,
  };
})();
