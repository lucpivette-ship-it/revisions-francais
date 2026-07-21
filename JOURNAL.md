# Journal de projet — Révisions Français (app filles)

## Objectif
Application web (PWA) pour iPad et Android permettant à mes filles (ados) de réviser
le français : vocabulaire (avec images + quiz de prononciation + écoute audio),
conjugaison (QCM), et grammaire (avec QCM). Amical et interactif.

## Décisions prises

**2026-07-20 — Cadrage initial**
- Tech stack : **PWA simple** (HTML/JS/CSS, installable sur écran d'accueil). Choisi
  plutôt que Base44 (no-code) ou React Native/Expo : pas de store, léger à faire
  évoluer fichier par fichier, marche sur iPad et Android via navigateur.
- Contenu généré par Claude puis validé par Luc avant intégration dans l'app.
- Reconnaissance vocale (quiz de prononciation) : pas encore tranchée — conçue pour
  brancher Web Speech API ou une API tierce plus tard sans tout restructurer.
- Tous les fichiers du projet restent dans ce dossier (sous-dossiers autorisés).

**2026-07-20 — Retours après première liasse de contenu**
- Traductions en **japonais** (colonne "Japonais") à la place de l'anglais, dans
  `vocabulaire.csv` ET `verbes.csv`. La colonne `Image_a_chercher` (anglais) est
  conservée uniquement comme mot-clé technique pour la recherche d'images — elle
  n'est pas affichée aux filles.
- Correction d'un bug d'encodage : les fichiers CSV précédents n'avaient pas de BOM
  UTF-8, ce qui cassait l'affichage des accents français (é, è, ê) et du œ dans
  Excel/Numbers sur Windows. Corrigé sur les 3 fichiers (vocabulaire, verbes,
  grammaire).
- Nouvelles catégories de vocabulaire ajoutées : Salutations et expressions
  courantes, Vacances et bord de mer, Le marché et les commerçants, Les jeux,
  États physiques et santé (malade, fatigué, en forme...).
- **QCM de grammaire** : chaque thème de grammaire doit avoir 5 questions à choix
  multiples (nouveau fichier `data/grammaire_qcm.csv`).
- **Bouton "écouter"** : chaque mot de vocabulaire doit avoir un bouton play pour
  entendre sa prononciation à l'écran (lecture audio, probablement via la synthèse
  vocale du navigateur — Web Speech API `speechSynthesis` — en complément de la
  reconnaissance vocale déjà prévue pour le quiz de prononciation). À intégrer lors
  du développement de l'app (pas encore construite).

## Où on en est

Contenu généré pour validation, dans `data/` (avec accents corrects et BOM UTF-8) :

- `data/vocabulaire.csv` — 896 mots uniques, répartis en **29 thèmes** (les 24
  d'origine + salutations, vacances/bord de mer, marché/commerçants, jeux, états
  physiques et santé). Colonnes : Français, Japonais, Niveau (A1/A2), Catégorie,
  Image_a_chercher (mot-clé anglais pour la recherche d'image uniquement).
- `data/verbes.csv` — 100 verbes (1er/2e/3e groupe + irréguliers + 8 pronominaux du
  quotidien) conjugués au présent, futur simple et passé composé, avec traduction
  japonaise et auxiliaire correct. Conjugaisons vérifiées (doublement de consonnes,
  accents, élisions des pronominaux : t'es, s'est...).
- `data/grammaire.csv` — 20 thèmes de grammaire (A1 puis A2), points clés, exemple.
- `data/grammaire_qcm.csv` — **100 questions QCM** (5 par thème de grammaire), avec
  4 choix (Option_A à D) et la réponse correcte, prêtes à être utilisées comme quiz
  dans l'app.

**2026-07-20 — Exigences UI supplémentaires**
- Vocabulaire : navigation possible **par thème** (les 29 catégories), pas juste une
  liste linéaire de 896 mots.
- Conjugaison : les leçons doivent être organisées **temps par temps, en commençant
  par le présent**. Pour chaque temps, un bouton d'écoute doit lire la conjugaison à
  voix haute pendant que le texte est **surligné mot par mot** (karaoke-style
  highlighting synchronisé avec l'audio).

**2026-07-20 — Images du vocabulaire**
- Testé et validé : **OpenMoji** (jeu d'icônes open-source, CC BY-SA 4.0, ~4500
  icônes) comme source d'illustrations. Avantage clé : peut être entièrement
  intégré hors-ligne dans l'app (pas de téléchargement à l'usage), style
  cohérent sur tout le vocabulaire, contenu toujours adapté aux enfants.
- Vraies photos (en plus des icônes) : demandées par Luc, mais le bac à sable
  Claude n'a pas d'accès réseau général (seulement aux registres npm/pip) et
  aucun navigateur Chrome n'est connecté pour les récupérer automatiquement.
  **Décision : reporté** — l'app démarre avec les icônes OpenMoji uniquement ;
  les vraies photos pourront être ajoutées plus tard (ex. script local que Luc
  exécute sur son ordinateur avec un vrai accès internet, ou en connectant
  l'extension Claude in Chrome).
- Correspondance mot -> icône **terminée et validée** : `data/icon_mapping.csv`
  (896 mots, 899 lignes avec doublons). Résultat final après plusieurs passes de
  relecture qualité : **796 "bon"** (icône fidèle au mot), **75 "approximatif"**
  (meilleur substitut possible faute d'emoji exact — ex. réfrigérateur/four/
  micro-ondes tous représentés par un couteau de cuisine, penderie par un carton,
  examen par un bloc-notes), **28 "sans image"** volontaire (mots-outils
  purement abstraits : mais, parce que, très, trop, donc, alors...). 0 mot sans
  correspondance du tout.
  - Plusieurs erreurs de correspondance automatique repérées et corrigées à la
    main lors de la relecture (l'algo de correspondance par tag OpenMoji
    produisait parfois un résultat absurde ou peu adapté à des enfants) :
    "la fête" (face qui tire la langue -> pétards de fête), "à droite"/"à gauche"
    (bulles de dialogue -> flèches directionnelles), "donc"/"alors" (drapeau de
    la Somalie au hasard -> retirés, sans image), "nouveau" (Statue de la
    Liberté -> bouton "nouveau"), "gratuit" (loup -> bouton "gratuit"),
    "le français" (croissant, bug de casse dans le code -> drapeau français),
    "petit/gros/long/lourd/léger/dur/joli/laid" (correspondances aléatoires et
    déroutantes -> fourmi/éléphant/serpent/ancre/plume/pierre précieuse/tulipe/
    ogre), "la sortie" (zombie -> personne qui marche), "l'indépendance"
    (drapeau de golf -> drapeau triangulaire), "l'objectif" (crosse de lacrosse
    -> cible).

**2026-07-21 — Emojis abandonnés pour l'instant**
- Après relecture, Luc juge que les icônes/emojis OpenMoji ne rendent pas bien
  pour ce projet. **Décision : pas d'icônes emoji dans la version 1 de l'app.**
  `data/icon_mapping.csv` reste utile comme référence (mot-clé anglais par mot,
  déjà mappé) pour retrouver plus tard une vraie photo par mot.
- Luc ira chercher lui-même de vraies images plus tard. En attendant, chaque
  fiche de vocabulaire dans l'app doit réserver un **emplacement visuel vide**
  (zone image bien délimitée, prête à recevoir une photo — pas de flashcard
  sans cet espace) pour que l'ajout des photos plus tard soit juste un
  remplacement d'image, sans revoir la mise en page.
- **Convention établie pour le dépôt des photos** (voir `data/images_a_fournir.csv`
  et `images/vocab/LISEZMOI.txt`) : un seul dossier plat `images/vocab/`, un
  fichier par mot nommé `{categorie}_{mot}.jpg` (accents/espaces retirés,
  préfixe de catégorie pour éviter les collisions entre mots identiques de
  catégories différentes, ex. "la pêche" = fruit vs loisir). Le nom de fichier
  exact attendu pour chacun des 871 mots concernés est déjà calculé dans
  `data/images_a_fournir.csv` (colonne Nom_fichier_attendu) — Luc n'a qu'à
  déposer les photos avec ce nom exact, dans n'importe quel ordre, au fur et à
  mesure. Tant qu'une photo manque, l'app affichera l'emplacement vide.

**2026-07-21 — Utilisatrices et habillage visuel**
- Les filles : **E (12 ans)** et **A (10 ans)**. Utile pour calibrer le ton
  (déjà A1/A2 générique + axe "vie d'ado", cohérent avec ces âges).
- Image de fond de l'appli : `SaintGeorges.jfif` (à la racine du dossier projet)
  à utiliser en arrière-plan, **semi-transparent à 50%**, avec une teinte
  **bleu clair**. À appliquer lors du scaffolding CSS de l'app (étape encore
  à faire).

**2026-07-21 — PWA construite (première version fonctionnelle)**
- Tous les fichiers de l'app sont dans le dossier projet, prêts à être hébergés :
  `index.html`, `manifest.json`, `service-worker.js`, `css/style.css`,
  `js/csv-parser.js`, `js/data-loader.js`, `js/progress.js`, `js/tts.js`,
  `js/vocab.js`, `js/conjugation.js`, `js/grammar.js`, `js/app.js`,
  `icons/icon.svg`.
- **Décision technique clé** : l'app lit directement les CSV existants
  (`data/*.csv`) au chargement via un petit parseur CSV maison — pas de
  conversion en JSON. Ça évite la duplication des données et tout ajout futur
  de mots/verbes/grammaire se fait juste en éditant les CSV.
- **Vocabulaire** : navigation par thème (29 catégories), fiche mot avec zone
  image (vide pour l'instant, prête pour les photos de Luc — voir convention
  du 2026-07-21 plus haut), bouton écouter (Web Speech API), et quiz de
  prononciation (SpeechRecognition, comparaison souple sans article/accents).
- **Conjugaison** : onglets par temps (Présent d'abord, puis Futur simple,
  puis Passé composé), leçon par verbe avec lecture audio et
  surlignage karaoké mot par mot (utter.onboundary), quiz QCM (10 questions
  aléatoires par temps, distracteurs pris parmi les autres verbes).
- **Grammaire** : 20 thèmes, chacun avec ses points clés + exemple, et son
  quiz de 5 questions.
- **Suivi de progression** : deux profils (E et A), sélecteur en haut de
  l'app, stocké en localStorage (mots vus/connus, scores de quiz par thème).
  Tableau de bord sur l'écran d'accueil.
- **Fond d'écran** : `SaintGeorges.jfif` en arrière-plan (teinte bleu clair
  ~50%, cf. demande du 2026-07-21).
- **Installable hors-ligne** : manifest.json + service-worker.js (cache
  l'app et les CSV au premier chargement ; les photos de vocabulaire sont
  mises en cache au fur et à mesure qu'elles sont vues, donc elles
  fonctionnent aussi hors-ligne une fois ajoutées).
- **Vérifications faites** : les 7 fichiers JS passent `node --check`
  (syntaxe correcte), le calcul du nom de fichier image en JavaScript a été
  testé contre les 871 noms attendus de `images_a_fournir.csv` (100% de
  correspondance), le parseur CSV a été testé sur les 3 fichiers réels
  (gère bien les champs entre guillemets avec virgules dans
  `grammaire_qcm.csv`), et l'icône SVG a été rendue en PNG pour vérification
  visuelle.
- **Important — hébergement** : pour que l'installation "écran d'accueil" et
  le mode hors-ligne fonctionnent pleinement sur iPad/Android, l'app doit
  être servie en HTTPS (un simple fichier ouvert localement ne suffit pas
  pour le service worker). Options simples : GitHub Pages (gratuit),
  Netlify, ou un autre hébergement statique. **Pas encore fait** — à
  décider avec Luc.

**2026-07-21 — Application en ligne !**
- Dépôt GitHub : `lucpivette-ship-it/revisions-francais` (public), déjà rempli
  avec tous les fichiers du projet.
- GitHub Pages activé (Settings > Pages > Deploy from branch `main` / root).
- **URL en ligne : https://lucpivette-ship-it.github.io/revisions-francais/**
- Testé en direct : Accueil (bienvenue + stats), Vocabulaire (26 thèmes,
  fiche mot avec espace photo vide fonctionnel, japonais bien affiché),
  Conjugaison (onglets Présent/Futur/Passé composé, leçon "parler" avec texte
  correct), Grammaire (20 thèmes) — tout s'affiche correctement en ligne.
- **Prochaine étape pour Luc** : ouvrir ce lien dans Safari sur l'iPad,
  puis Partager > "Sur l'écran d'accueil" pour l'installer.
- **Pour les mises à jour futures** (nouvelles photos, mots) : copier les
  fichiers modifiés dans le dépôt GitHub (via GitHub Desktop ou upload web)
  et pousser/committer. Pour que les appareils déjà installés voient les
  changements, penser à changer `'revfr-v1'` en `'revfr-v2'` (etc.) dans
  `service-worker.js` à chaque mise à jour de contenu.

**2026-07-21 — Labels bilingues (français + japonais).** Suite à la demande de
Luc, quatre ajustements appliqués et poussés en ligne :
1. Menu de navigation bilingue : "Accueil ( ホーム )", "Vocabulaire ( 語彙 )",
   "Conjugaison ( 活用 )", "Grammaire ( 文法 )".
2. Thèmes de vocabulaire bilingues (ex. "La famille ( 家族 )") — ajout d'un
   dictionnaire `CATEGORY_JP` dans `data-loader.js`.
3. Liste des verbes en conjugaison : traduction japonaise entre parenthèses
   avant le groupe, avec espaces (ex. "parler ( 話す（はなす） ) 1er groupe (-er)").
4. Dans les leçons/QCM de conjugaison, "il/elle" et "ils/elles" affichés avec
   un espace au lieu du slash ("il elle", "ils elles").
- Fichiers modifiés : `js/data-loader.js`, `js/vocab.js`, `js/conjugation.js`,
  `index.html`.
- Déployés via l'upload web GitHub (pas le CodeMirror inline — un essai de
  frappe directe dans l'éditeur en ligne a cassé l'indentation ; on est passé
  par la page `/upload/main/...` pour uploader les fichiers locaux tels quels).
- Cache bumped `'revfr-v1'` → `'revfr-v2'` dans `service-worker.js`.
- Vérifié en ligne (après avoir vidé le cache du service worker du navigateur
  de test) : les 4 changements s'affichent correctement sur
  https://lucpivette-ship-it.github.io/revisions-francais/

**2026-07-21 — Mise en page conjugaison, fond d'écran, voix.**
1. Conjugaison : les 6 pronoms (je/tu/il elle/nous/vous/ils elles) s'affichent
   maintenant chacun sur sa propre ligne (au lieu de tous alignés
   horizontalement séparés par des virgules) — `js/conjugation.js`
   (`renderLesson`) + nouvelle classe `.conj-row` dans `css/style.css`.
2. Fond d'écran (photo de Saint-Georges) rendu plus présent : le voile bleu
   clair par-dessus est passé d'une opacité de 0.55 à 0.3, donc la photo
   ressort davantage (~70% photo / 30% teinte au lieu de ~50/50) —
   `css/style.css` (`body::before`).
3. Voix française (Web Speech API) : le code choisissait la première voix
   française trouvée, souvent la voix robotique par défaut. `js/tts.js`
   (`pickFrenchVoice`) note maintenant chaque voix disponible et choisit la
   meilleure (favorise les voix "Enhanced"/"Premium"/"Amélioré"/Google/réseau,
   défavorise "compact"/"default"). **Amélioration gratuite mais limitée par
   les voix installées sur l'appareil** — pour un vrai gain de qualité côté
   Luc/les filles : sur iPad, Réglages > Accessibilité > Contenu énoncé >
   Voix > Français > télécharger une voix "Améliorée"/"Premium" (~200 Mo,
   une fois). Sur Android/Chrome, vérifier que le moteur de synthèse vocale
   par défaut est "Google" (Réglages > Accessibilité > Synthèse vocale).
   Option non retenue pour l'instant (discutée avec Luc) : générer à l'avance
   de vrais fichiers audio via un service cloud (Google/Amazon/ElevenLabs)
   pour une voix beaucoup plus naturelle — plus de travail (script de
   génération, compte API) mais meilleure qualité et fonctionne hors ligne.
   À reconsidérer si la voix reste insatisfaisante après le réglage iPad.
- Cache bumped `'revfr-v2'` → `'revfr-v3'` dans `service-worker.js`.

## Ce qu'il reste à faire

**2026-07-20 — Contenu validé.** Luc confirme que la taille actuelle (896 mots,
100 verbes, 20 thèmes de grammaire) convient pour démarrer. Le vocabulaire/les
verbes pourront être étoffés plus tard au fur et à mesure que les filles
progressent (structure par catégorie + niveau A1/A2 déjà en place, donc ajouter
des mots ou un niveau B1 plus tard = ajouter des lignes, pas de refonte).

1. Décider de la source des images (génération simple vs banque de photos).
2. Construire l'app PWA (structure de fichiers définie le 2026-07-20) : index.html,
   manifest.json, service-worker.js, js/ (vocab, conjugation, grammar, progress),
   data/ (déjà là), images/vocab/, icons/.
3. Construire les 3 modules :
   - Vocabulaire : flashcards avec image + **bouton écouter (audio)** + quiz vocal
     de prononciation.
   - Conjugaison : QCM.
   - Grammaire : leçons + **QCM (5 questions/thème, déjà rédigées)**.
4. Ajouter un suivi de progression stocké localement sur l'appareil.
5. Tester sur un vrai iPad et un vrai téléphone Android.

## Notes diverses

- Prénoms/âges des filles : pas encore communiqués.
- Pas de manuel scolaire précis à suivre — contenu basé sur fréquence d'usage +
  niveau A1/A2 générique, avec un axe supplémentaire "vie d'ado" (réseaux sociaux,
  argent de poche, amis, santé...).
