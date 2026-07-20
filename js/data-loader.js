// Loads and caches the CSV data files, and computes vocab image paths.
const DataLoader = (function () {
  const CATEGORY_SLUGS = {
    'La famille': 'famille',
    'Le corps': 'corps',
    'Les vêtements': 'vetements',
    'La nourriture et les boissons': 'nourriture',
    'La maison': 'maison',
    "L'école": 'ecole',
    'Les nombres': 'nombres',
    'Le temps et le calendrier': 'temps',
    'Les couleurs et les formes': 'couleurs_formes',
    'La météo': 'meteo',
    'Les animaux': 'animaux',
    'La nature': 'nature',
    'La ville et les lieux': 'ville_lieux',
    'Les transports': 'transports',
    'La technologie': 'technologie',
    'Les sports et loisirs': 'sports_loisirs',
    'Les émotions et la personnalité': 'emotions_personnalite',
    'Les métiers': 'metiers',
    "Les achats et l'argent": 'achats_argent',
    'Adjectifs courants': 'adjectifs',
    'Adverbes et connecteurs': 'adverbes_connecteurs',
    'Ados et vie sociale': 'ados_vie_sociale',
    'Salutations et expressions courantes': 'salutations',
    'Vacances et bord de mer': 'vacances_mer',
    'Le marché et les commerçants': 'marche_commercants',
    'Les jeux': 'jeux',
    'États physiques et santé': 'sante_physique',
  };

  const CATEGORY_JP = {
    'La famille': '家族',
    'Le corps': '体',
    'Les vêtements': '服',
    'La nourriture et les boissons': '食べ物と飲み物',
    'La maison': '家',
    "L'école": '学校',
    'Les nombres': '数字',
    'Le temps et le calendrier': '時間とカレンダー',
    'Les couleurs et les formes': '色と形',
    'La météo': '天気',
    'Les animaux': '動物',
    'La nature': '自然',
    'La ville et les lieux': '街と場所',
    'Les transports': '交通機関',
    'La technologie': 'テクノロジー',
    'Les sports et loisirs': 'スポーツと趣味',
    'Les émotions et la personnalité': '感情と性格',
    'Les métiers': '職業',
    "Les achats et l'argent": '買い物とお金',
    'Adjectifs courants': 'よく使う形容詞',
    'Adverbes et connecteurs': '副詞と接続詞',
    'Ados et vie sociale': 'ティーンの社会生活',
    'Salutations et expressions courantes': 'あいさつとよく使う表現',
    'Vacances et bord de mer': '休暇と海辺',
    'Le marché et les commerçants': '市場と店の人',
    'Les jeux': 'ゲーム',
    'États physiques et santé': '体調と健康',
  };

  function categoryJP(categorie) {
    return CATEGORY_JP[categorie] || '';
  }

  function stripDiacritics(str) {
    // Decompose accented letters (e.g. "é" -> "e" + combining acute accent),
    // then drop any character whose code point falls in the Unicode
    // "Combining Diacritical Marks" block (0x0300-0x036F).
    const decomposed = str.normalize('NFD');
    let out = '';
    for (const ch of decomposed) {
      const code = ch.codePointAt(0);
      if (code >= 0x0300 && code <= 0x036f) continue;
      out += ch;
    }
    return out;
  }

  function slugify(str) {
    return stripDiacritics(
      str.toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    )
      .replace(/['\s]+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  function categorySlug(categorie) {
    return CATEGORY_SLUGS[categorie] || slugify(categorie);
  }

  function vocabImagePath(categorie, francais) {
    return 'images/vocab/' + categorySlug(categorie) + '_' + slugify(francais) + '.jpg';
  }

  const cache = {};

  async function fetchCSV(path) {
    if (cache[path]) return cache[path];
    const res = await fetch(path);
    if (!res.ok) throw new Error('Impossible de charger ' + path);
    const text = await res.text();
    const rows = parseCSV(text);
    cache[path] = rows;
    return rows;
  }

  let vocabCache = null;
  async function loadVocab() {
    if (vocabCache) return vocabCache;
    const rows = await fetchCSV('data/vocabulaire.csv');
    vocabCache = rows.map((r) => ({
      francais: r.Francais,
      japonais: r.Japonais,
      niveau: r.Niveau,
      categorie: r.Categorie,
      image: vocabImagePath(r.Categorie, r.Francais),
    }));
    return vocabCache;
  }

  async function loadVerbs() {
    return fetchCSV('data/verbes.csv');
  }

  async function loadGrammar() {
    return fetchCSV('data/grammaire.csv');
  }

  async function loadGrammarQCM() {
    return fetchCSV('data/grammaire_qcm.csv');
  }

  async function getCategories() {
    const vocab = await loadVocab();
    const order = [];
    const seen = new Set();
    for (const w of vocab) {
      if (!seen.has(w.categorie)) { seen.add(w.categorie); order.push(w.categorie); }
    }
    return order;
  }

  return {
    slugify,
    categorySlug,
    categoryJP,
    vocabImagePath,
    loadVocab,
    loadVerbs,
    loadGrammar,
    loadGrammarQCM,
    getCategories,
  };
})();
