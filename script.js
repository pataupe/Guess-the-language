/* =========================================================================
   Guess the Language — logique du jeu

   Trois modes :
     quotidien — les mêmes 10 phrases pour tout le monde, tirées à partir
                 de la date. Seule la première tentative compte.
     libre     — 10 phrases au hasard, autant de fois qu'on veut.
     survie    — sans fin, trois vies, les langues deviennent de plus en
                 plus rares à mesure qu'on avance.

   Deux façons de répondre, indépendantes du mode :
     facile    — six propositions.
     difficile — on écrit le nom de la langue.

   Deux langues d'interface, français et anglais. La langue du joueur est
   retirée du tirage : deviner sa propre langue ne demande aucun effort.
   Chaque version a donc son propre défi du jour, puisque les deux ne
   piochent pas dans le même ensemble.
   ========================================================================= */

(function () {
  'use strict';

  /* ------------------------------------------------------------ réglages */

  const QUESTIONS_PER_GAME = 10;
  const CHOICES_PER_QUESTION = 6;
  const SURVIVAL_LIVES = 3;

  // Une langue peut revenir dans la partie, mais pas coup sur coup : il faut
  // au moins cette distance entre deux occurrences. 4 = tombée à la question
  // 1, elle est écartée des questions 2, 3 et 4, et peut revenir à la 5e.
  const MIN_REPEAT_DISTANCE = 4;

  // Seule contrainte de composition : au moins deux langues de chaque niveau
  // de rareté. Les quatre questions restantes sont tirées librement.
  const LEVEL_MIN = { 1: 2, 2: 2, 3: 2 };

  const POINTS_CORRECT = 100;   // points d'une bonne réponse
  const BONUS_MAX = 60;         // bonus de rapidité maximum
  const BONUS_DECAY = 3;        // points de bonus perdus par seconde

  const KEY_BEST = 'gtl.best.v2';
  const KEY_DAILY = 'gtl.daily.v2';
  const KEY_PREF = 'gtl.pref.v2';

  /* ------------------------------------------------------------- langues */

  let locale = 'fr';

  /** Texte d'interface, avec remplacement des {variables}. */
  function t(key, vars) {
    const table = UI_STRINGS[locale] || UI_STRINGS.fr;
    let str = table[key];
    if (str === undefined) str = UI_STRINGS.fr[key];
    if (str === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.split('{' + k + '}').join(vars[k]);
      });
    }
    return str;
  }

  /** Champ de langue traduit : name, hint, area, speakers… */
  const L = (field) => (field && (field[locale] || field.fr || field.en)) || '';

  /** Libellé d'une famille, branche ou alphabet à partir de sa clé. */
  const taxon = (kind, key) => (TAXONOMY[kind][key] || {})[locale] || key;

  /** Les langues qu'on peut avoir à deviner : tout sauf celle du joueur. */
  const playable = () => LANGUAGES.filter((l) => l.id !== locale);

  /* -------------------------------------------------------------- outils */

  const $ = (id) => document.getElementById(id);

  /** Minuscules, sans accents ni ponctuation : « Lëtzebuergesch » -> « letzebuergesch ». */
  function normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9Ͱ-ϿЀ-ӿ]+/g, '');
  }

  /* -- Hasard -------------------------------------------------------------
     Tout le tirage passe par rng(). En partie libre et en survie c'est
     Math.random ; pour le défi du jour on le remplace par un générateur à
     graine, pour que la même date donne exactement la même partie à tous
     les joueurs d'une même langue d'interface. ------------------------- */

  let rng = Math.random;

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let x = Math.imul(a ^ (a >>> 15), 1 | a);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const pickOne = (array) => array[Math.floor(rng() * array.length)];

  /* -- Divers ---------------------------------------------------------- */

  function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
  }

  function formatSeconds(ms) {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 1, maximumFractionDigits: 1
    }).format(ms / 1000);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /** Date du jour au format 2026-10-14, en heure locale. */
  function todayKey(d) {
    const date = d || new Date();
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0');
  }

  function prettyDate(key) {
    const parts = key.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2])
      .toLocaleDateString(locale, { day: 'numeric', month: 'long' });
  }

  /* --------------------------------------------------- index de recherche */

  // Toutes les graphies acceptées : les deux noms, l'autonyme, les alias.
  const SEARCH_INDEX = LANGUAGES.map((lang) => ({
    lang: lang,
    keys: [lang.name.fr, lang.name.en, lang.endonym]
      .concat(lang.aliases || [])
      .map(normalize)
  }));

  function findLanguageByInput(raw) {
    const q = normalize(raw);
    if (!q) return null;
    const entry = SEARCH_INDEX.find(
      (e) => e.lang.id !== locale && e.keys.indexOf(q) !== -1
    );
    return entry ? entry.lang : null;
  }

  function searchLanguages(raw, limit) {
    const q = normalize(raw);
    if (!q) return [];
    const starts = [];
    const contains = [];
    SEARCH_INDEX.forEach((entry) => {
      if (entry.lang.id === locale) return;   // jamais sa propre langue
      if (entry.keys.some((k) => k.indexOf(q) === 0)) starts.push(entry.lang);
      else if (entry.keys.some((k) => k.indexOf(q) !== -1)) contains.push(entry.lang);
    });
    const byName = (a, b) => L(a.name).localeCompare(L(b.name), locale);
    return starts.sort(byName).concat(contains.sort(byName)).slice(0, limit || 8);
  }

  /* ----------------------------------------------- fabrication des tours */

  /** Cinq intrus : d'abord la même branche, puis le même alphabet, puis au hasard. */
  function buildChoices(answer) {
    const others = playable().filter((l) => l.id !== answer.id);
    const sameBranch = shuffle(others.filter((l) => l.branch === answer.branch));
    const sameScript = shuffle(others.filter(
      (l) => l.script === answer.script && l.branch !== answer.branch
    ));
    const rest = shuffle(others.filter(
      (l) => l.branch !== answer.branch && l.script !== answer.script
    ));

    const decoys = [];
    const take = (pool, n) => {
      for (let i = 0; i < pool.length && n > 0; i++) {
        if (decoys.indexOf(pool[i]) === -1) { decoys.push(pool[i]); n--; }
      }
    };
    take(sameBranch, 3);
    take(sameScript, 2);
    take(rest, CHOICES_PER_QUESTION - 1 - decoys.length);
    take(others, CHOICES_PER_QUESTION - 1 - decoys.length);

    return shuffle(decoys.slice(0, CHOICES_PER_QUESTION - 1).concat([answer]));
  }

  function makeQuestion(lang) {
    // Si la langue est déjà tombée dans cette partie, on lui prend une
    // autre de ses dix phrases : deux fois la même ferait bâclé.
    const seen = state.usedTexts[lang.id] || (state.usedTexts[lang.id] = []);
    let pool = lang.texts.filter((x) => seen.indexOf(x[0]) === -1);
    if (!pool.length) pool = lang.texts;

    const sample = pickOne(pool);
    seen.push(sample[0]);
    return {
      lang: lang,
      text: sample[0],
      translation: sample[1][locale] || '',
      choices: buildChoices(lang)
    };
  }

  /**
   * Tire une langue du niveau demandé, en écartant seulement celles tombées
   * dans les questions toutes proches. Si le niveau n'a plus personne de
   * disponible, on élargit plutôt que de bloquer.
   */
  function pickLanguage(level, recentIds) {
    const blocked = recentIds.slice(-(MIN_REPEAT_DISTANCE - 1));
    const free = (l) => blocked.indexOf(l.id) === -1;
    const all = playable();
    // level vaut null pour les questions tirées librement, tous niveaux confondus.
    let pool = all.filter((l) => (level === null || l.level === level) && free(l));
    if (!pool.length) pool = all.filter(free);
    if (!pool.length) pool = all;
    return pickOne(pool);
  }

  /**
   * Les 10 langues d'une partie classique. Six places sont réservées pour
   * garantir le minimum (deux par niveau), les quatre autres sont libres ;
   * le tout est mélangé pour que les rares ne finissent pas groupées.
   */
  function drawLanguages() {
    const slots = [];
    [1, 2, 3].forEach((level) => {
      for (let i = 0; i < LEVEL_MIN[level]; i++) slots.push(level);
    });
    while (slots.length < QUESTIONS_PER_GAME) slots.push(null);

    const drawn = [];
    shuffle(slots).forEach((level) => {
      drawn.push(pickLanguage(level, drawn.map((l) => l.id)));
    });
    return drawn;
  }

  /**
   * La survie tire au hasard parmi les 38, sans aucun dosage de niveau.
   *
   * Une version precedente faisait monter la rarete au fil de la partie. Deux
   * defauts : elle retrecissait le tirage aux dix langues rares, ce qui
   * renseignait le joueur, et les langues rares sont souvent les plus faciles
   * a identifier (le c'h breton, les h et z pointes du maltais). Les vraiment
   * difficiles sont les paires proches — tcheque / slovaque, danois /
   * norvegien — qui sont des langues courantes.
   */
  function nextSurvivalQuestion() {
    return makeQuestion(pickLanguage(null, state.results.map((r) => r.lang.id)));
  }

  /* ------------------------------------------------------- scores gardés */

  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }

  function writeStore(key, value) {
    // Navigation privée ou stockage bloqué : on continue sans rien garder.
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* tant pis */ }
  }

  const bestKey = (mode, diff) => mode + '|' + diff;
  // Le défi du jour n'est pas le même d'une langue à l'autre : la clé le dit.
  const dailyKey = (day, diff) => day + '|' + diff + '|' + locale;

  function refreshHomeLabels() {
    const bests = readStore(KEY_BEST);
    const daily = readStore(KEY_DAILY);
    const day = todayKey();

    $('dailyDate').textContent = prettyDate(day);
    $('homeEyebrow').textContent = t('home.eyebrow', { count: playable().length });
    $('footCount').textContent = t('foot.count', { count: playable().length });

    document.querySelectorAll('[data-best]').forEach((el) => {
      const mode = el.dataset.best;

      if (mode === 'quotidien') {
        const done = daily[dailyKey(day, state.diff)];
        el.textContent = done
          ? t('best.daily.done', { correct: done.correct, total: QUESTIONS_PER_GAME, points: done.points })
          : t('best.daily.none');
        return;
      }

      const best = bests[bestKey(mode, state.diff)];
      if (!best) { el.textContent = t('best.none'); return; }
      el.textContent = mode === 'survie'
        ? t('best.survie', { correct: best.correct, points: best.points })
        : t('best.standard', { points: best.points, correct: best.correct, total: QUESTIONS_PER_GAME });
    });
  }

  /* --------------------------------------------------------------- écrans */

  const screens = { home: $('screenHome'), game: $('screenGame'), end: $('screenEnd') };

  function showScreen(name) {
    Object.keys(screens).forEach((key) => { screens[key].hidden = key !== name; });
    $('hud').hidden = name !== 'game';
    // Caché pendant une partie : changer de langue change le catalogue de
    // langues à deviner, donc annulerait la partie en cours.
    $('localeGroup').hidden = name === 'game';
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* --------------------------------------------------------- état de jeu */

  const state = {
    mode: 'libre',
    diff: 'facile',
    day: null,          // défi du jour : la date jouée
    questions: [],      // modes à 10 questions
    current: null,      // la question en cours
    usedTexts: {},      // phrases déjà montrées, par langue, dans cette partie
    lives: SURVIVAL_LIVES,
    index: 0,
    results: [],
    points: 0,
    elapsedMs: 0,       // temps de réflexion cumulé (hors lecture des fiches)
    questionStart: 0,
    answered: false,
    ticker: null
  };

  const isSurvival = () => state.mode === 'survie';

  /** Les trois pastilles de vie, celles qui restent puis celles perdues. */
  function livesMarkup() {
    const left = Math.max(0, state.lives);
    let out = '';
    for (let i = 0; i < SURVIVAL_LIVES; i++) {
      out += '<span class="life' + (i < left ? '' : ' is-lost') + '">●</span>';
    }
    return out;
  }

  function startGame(mode) {
    state.mode = mode;
    state.day = todayKey();
    state.index = 0;
    state.results = [];
    state.points = 0;
    state.elapsedMs = 0;
    state.answered = false;
    state.usedTexts = {};
    state.lives = SURVIVAL_LIVES;

    // Le défi du jour rejoue la même partie pour tous — mais la graine
    // inclut la langue, puisque les deux versions n'ont pas le même pool.
    rng = mode === 'quotidien'
      ? mulberry32(hashString('gtl-' + state.day + '-' + locale))
      : Math.random;

    if (isSurvival()) {
      state.questions = [];
      state.current = nextSurvivalQuestion();
    } else {
      state.questions = drawLanguages().map(makeQuestion);
      state.current = state.questions[0];
    }

    $('hudScore').textContent = '0';
    $('hudLivesItem').hidden = !isSurvival();
    $('hudCountLabel').textContent = isSurvival() ? t('hud.found') : t('hud.question');
    $('progressBar').parentNode.hidden = isSurvival();

    showScreen('game');
    renderQuestion();

    clearInterval(state.ticker);
    state.ticker = setInterval(updateTimer, 200);
  }

  function updateTimer() {
    const running = state.answered ? 0 : Date.now() - state.questionStart;
    $('hudTimer').textContent = formatTime(state.elapsedMs + running);
  }

  const correctCount = () => state.results.filter((r) => r.correct).length;

  function renderQuestion() {
    const q = state.current;
    state.answered = false;
    state.questionStart = Date.now();

    if (isSurvival()) {
      $('hudCount').textContent = correctCount();
      $('hudLives').innerHTML = livesMarkup();
    } else {
      $('hudCount').innerHTML =
        (state.index + 1) + '<span class="hud-sep">/</span>' + QUESTIONS_PER_GAME;
      $('progressBar').style.width = (state.index / QUESTIONS_PER_GAME * 100) + '%';
    }

    const specimen = $('specimenText');
    specimen.textContent = q.text;
    specimen.lang = q.lang.id;

    $('verdict').hidden = true;

    if (state.diff === 'facile') {
      renderChoices(q);
      $('choices').hidden = false;
      $('guessForm').hidden = true;
    } else {
      $('choices').hidden = true;
      $('guessForm').hidden = false;
      resetGuessBox();
    }

    updateTimer();
  }

  function renderChoices(q) {
    const box = $('choices');
    box.innerHTML = '';
    q.choices.forEach((lang, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice';
      btn.innerHTML = '<span class="choice-key">' + (i + 1) + '</span>' +
                      '<span>' + escapeHtml(L(lang.name)) + '</span>';
      btn.addEventListener('click', () => answer(lang));
      box.appendChild(btn);
    });
  }

  /* --------------------------------------------------- validation d'un tour */

  function answer(given) {
    if (state.answered) return;
    state.answered = true;

    const q = state.current;
    const spent = Date.now() - state.questionStart;
    state.elapsedMs += spent;

    const correct = !!given && given.id === q.lang.id;
    let gained = 0;
    if (correct) {
      const bonus = Math.max(0, Math.round(BONUS_MAX - (spent / 1000) * BONUS_DECAY));
      gained = POINTS_CORRECT + bonus;
      state.points += gained;
    } else if (isSurvival()) {
      state.lives--;
    }

    state.results.push({
      lang: q.lang, text: q.text, given: given,
      correct: correct, points: gained, ms: spent
    });

    const scoreEl = $('hudScore');
    scoreEl.textContent = state.points;
    if (gained > 0) {
      const wrap = scoreEl.closest('.hud-item');
      wrap.classList.remove('bump');
      void wrap.offsetWidth;
      wrap.classList.add('bump');
    }

    if (isSurvival()) {
      $('hudCount').textContent = correctCount();
      $('hudLives').innerHTML = livesMarkup();
    } else {
      $('progressBar').style.width = ((state.index + 1) / QUESTIONS_PER_GAME * 100) + '%';
    }

    if (state.diff === 'facile') lockChoices(q, given);
    else lockGuessBox();

    showVerdict(q, correct, gained);
  }

  function lockChoices(q, given) {
    Array.from($('choices').children).forEach((btn, i) => {
      const lang = q.choices[i];
      btn.disabled = true;
      if (lang.id === q.lang.id) btn.classList.add('is-right');
      else if (given && lang.id === given.id) btn.classList.add('is-wrong');
      else btn.classList.add('is-dim');
    });
  }

  function isLastQuestion() {
    if (isSurvival()) return state.lives <= 0;
    return state.index === QUESTIONS_PER_GAME - 1;
  }

  function showVerdict(q, correct, gained) {
    const lang = q.lang;

    const badge = $('verdictBadge');
    badge.className = 'verdict-badge ' + (correct ? 'ok' : 'bad');
    badge.textContent = correct ? '✓' : '✕';

    $('verdictName').textContent = L(lang.name);
    $('verdictEndonym').textContent = lang.endonym;

    const pts = $('verdictPoints');
    pts.textContent = gained > 0 ? '+' + gained : '+0';
    pts.classList.toggle('zero', gained === 0);

    // La traduction n'apparaît qu'ici : avant, les noms propres aideraient.
    const trad = $('verdictTranslation');
    if (q.translation) {
      $('verdictTranslationText').textContent = q.translation;
      trad.hidden = false;
    } else {
      trad.hidden = true;
    }

    $('verdictFacts').innerHTML = [
      [t('verdict.family'), taxon('branch', lang.branch)],
      [t('verdict.script'), taxon('script', lang.script)],
      [t('verdict.speakers'), L(lang.speakers)],
      [t('verdict.area'), L(lang.area)]
    ].map(function (pair) {
      return '<div><dt>' + escapeHtml(pair[0]) + '</dt><dd>' + escapeHtml(pair[1]) + '</dd></div>';
    }).join('');

    $('verdictHint').textContent = L(lang.hint);

    let label = t('next');
    if (isSurvival() && state.lives <= 0) label = t('next.gameOver');
    else if (isLastQuestion()) label = t('next.last');
    $('nextBtn').innerHTML = escapeHtml(label) + ' <kbd>' + escapeHtml(t('next.key')) + '</kbd>';

    $('verdict').hidden = false;
    $('liveRegion').textContent =
      (correct ? t('verdict.right') : t('verdict.wrong')) + ' ' +
      t('verdict.itWas', { language: L(lang.name) });
    $('nextBtn').focus();
  }

  function nextStep() {
    if (!state.answered) return;
    if (isLastQuestion()) { endGame(); return; }
    state.index++;
    state.current = isSurvival() ? nextSurvivalQuestion() : state.questions[state.index];
    renderQuestion();
  }

  /* ------------------------------------------------ saisie libre + listbox */

  const input = $('guessInput');
  const listbox = $('suggestions');
  let matches = [];
  let activeIndex = -1;

  function resetGuessBox() {
    input.value = '';
    input.disabled = false;
    closeSuggestions();
    clearGuessMessage();
    $('guessSubmit').disabled = false;
    $('guessSkip').disabled = false;
    input.focus();
  }

  function lockGuessBox() {
    input.disabled = true;
    $('guessSubmit').disabled = true;
    $('guessSkip').disabled = true;
    closeSuggestions();
  }

  function openSuggestions(list) {
    matches = list;
    activeIndex = -1;
    const q = normalize(input.value);

    listbox.innerHTML = list.map((lang, i) => {
      const plain = L(lang.name);
      let label = escapeHtml(plain);
      if (q.length && normalize(plain).indexOf(q) === 0) {
        // On surligne le début du nom, en comptant les lettres réellement tapées.
        let shown = 0, cut = 0;
        while (cut < plain.length && shown < q.length) {
          if (normalize(plain[cut])) shown++;
          cut++;
        }
        label = '<mark>' + escapeHtml(plain.slice(0, cut)) + '</mark>' +
                escapeHtml(plain.slice(cut));
      }
      return '<li class="suggestion" role="option" id="sug-' + i + '" ' +
             'aria-selected="false" data-index="' + i + '">' +
             '<span>' + label + '</span>' +
             '<span class="suggestion-endonym">' + escapeHtml(lang.endonym) + '</span>' +
             '</li>';
    }).join('');

    listbox.hidden = list.length === 0;
    input.setAttribute('aria-expanded', String(list.length > 0));
  }

  function closeSuggestions() {
    listbox.hidden = true;
    listbox.innerHTML = '';
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    matches = [];
    activeIndex = -1;
  }

  function highlight(i) {
    Array.from(listbox.children).forEach((li, n) => {
      const on = n === i;
      li.classList.toggle('is-active', on);
      li.setAttribute('aria-selected', String(on));
      if (on) li.scrollIntoView({ block: 'nearest' });
    });
    activeIndex = i;
    if (i >= 0) input.setAttribute('aria-activedescendant', 'sug-' + i);
    else input.removeAttribute('aria-activedescendant');
  }

  function chooseSuggestion(i) {
    const lang = matches[i];
    if (!lang) return;
    input.value = L(lang.name);
    closeSuggestions();
    answer(lang);
  }

  function guessMessage(text) {
    let el = document.querySelector('.guess-msg');
    if (!el) {
      el = document.createElement('p');
      el.className = 'guess-msg';
      el.setAttribute('role', 'alert');
      $('guessForm').insertBefore(el, $('guessForm').querySelector('.guessbox-actions'));
    }
    el.textContent = text;
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
  }

  function clearGuessMessage() {
    const el = document.querySelector('.guess-msg');
    if (el) el.remove();
    input.classList.remove('shake');
  }

  input.addEventListener('input', () => {
    clearGuessMessage();
    const value = input.value.trim();
    openSuggestions(value.length ? searchLanguages(value, 8) : []);
  });

  input.addEventListener('keydown', (e) => {
    if (listbox.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      openSuggestions(searchLanguages(input.value.trim(), 8));
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlight((activeIndex + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlight((activeIndex - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      // On valide ici, avant que la soumission implicite du formulaire
      // n'envoie un clic sur « Valider » (qui refermerait la liste).
      e.preventDefault();
      // …et on arrête l'événement : sans ça, il remonterait jusqu'au
      // raccourci « Entrée = Suivant » et sauterait la correction.
      e.stopPropagation();
      chooseSuggestion(activeIndex);
    } else if (e.key === 'Escape') {
      closeSuggestions();
    } else if (e.key === 'Tab' && activeIndex >= 0) {
      e.preventDefault();
      input.value = L(matches[activeIndex].name);
      closeSuggestions();
    }
  });

  listbox.addEventListener('mousedown', (e) => {
    const li = e.target.closest('.suggestion');
    if (!li) return;
    e.preventDefault();
    chooseSuggestion(Number(li.dataset.index));
  });

  // mousedown plutôt que click : la soumission du formulaire émet un clic
  // synthétique sur « Valider », qui ne doit pas effacer la sélection en cours.
  document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.guessbox')) closeSuggestions();
  });

  $('guessForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.answered) return;

    if (activeIndex >= 0) { chooseSuggestion(activeIndex); return; }

    const typed = input.value.trim();
    if (!typed) { guessMessage(t('guess.empty')); return; }

    const exact = findLanguageByInput(typed);
    if (exact) { answer(exact); return; }

    const found = searchLanguages(typed, 8);
    if (found.length === 1) { answer(found[0]); return; }
    if (found.length > 1) {
      openSuggestions(found);
      guessMessage(t('guess.ambiguous'));
      return;
    }
    guessMessage(t('guess.unknown', { input: typed }));
  });

  $('guessSkip').addEventListener('click', () => {
    if (!state.answered) answer(null);
  });

  /* ---------------------------------------------------------- résultats */

  function endTitleKey(correct) {
    if (isSurvival()) {
      if (correct >= 20) return 'end.title.survie.great';
      if (correct >= 12) return 'end.title.survie.good';
      if (correct >= 6) return 'end.title.survie.ok';
      return 'end.title.survie.bad';
    }
    if (correct === QUESTIONS_PER_GAME) return 'end.title.perfect';
    if (correct >= 8) return 'end.title.great';
    if (correct >= 6) return 'end.title.good';
    if (correct >= 4) return 'end.title.ok';
    if (correct >= 2) return 'end.title.meh';
    return 'end.title.bad';
  }

  function endGame() {
    clearInterval(state.ticker);

    const correct = correctCount();
    const result = {
      points: state.points,
      correct: correct,
      total: state.results.length,
      ms: state.elapsedMs,
      date: new Date().toISOString()
    };

    const diffLabel = t('diff.' + state.diff + '.label');
    $('endMode').textContent = state.mode === 'quotidien'
      ? t('end.daily', { date: prettyDate(state.day), diff: diffLabel })
      : t('end.mode', { mode: t('mode.' + state.mode + '.name'), diff: diffLabel });

    $('endTitle').textContent = t(endTitleKey(correct));
    $('endPoints').textContent = state.points;
    $('endTime').textContent = formatTime(state.elapsedMs);

    if (isSurvival()) {
      $('endCorrect').textContent = correct;
      $('endCorrectLabel').textContent = t(correct > 1 ? 'end.found.many' : 'end.found.one');
    } else {
      $('endCorrect').textContent = correct + '/' + QUESTIONS_PER_GAME;
      $('endCorrectLabel').textContent = t('end.correct');
    }

    recordResult(result);
    renderRecap();
    refreshHomeLabels();
    showScreen('end');
  }

  function recordResult(result) {
    const record = $('endRecord');
    record.hidden = false;

    if (state.mode === 'quotidien') {
      const daily = readStore(KEY_DAILY);
      const key = dailyKey(state.day, state.diff);
      if (daily[key]) {
        record.textContent = t('record.dailyTraining', {
          correct: daily[key].correct, total: QUESTIONS_PER_GAME, points: daily[key].points
        });
      } else {
        daily[key] = result;
        writeStore(KEY_DAILY, daily);
        record.textContent = t('record.dailySaved');
      }
      $('replayBtn').textContent = t('action.replayDaily');
      return;
    }

    $('replayBtn').textContent = t('action.replay');

    const bests = readStore(KEY_BEST);
    const key = bestKey(state.mode, state.diff);
    const previous = bests[key];
    const better = isSurvival()
      ? (!previous || result.correct > previous.correct ||
         (result.correct === previous.correct && result.points > previous.points))
      : (!previous || result.points > previous.points);

    const describe = (r, detailed) => isSurvival()
      ? t(detailed ? 'record.survieDetail' : 'record.survieValue', { correct: r.correct, points: r.points })
      : t(detailed ? 'record.standardDetail' : 'record.standardValue',
          { points: r.points, correct: r.correct, total: QUESTIONS_PER_GAME });

    if (better) {
      bests[key] = result;
      writeStore(KEY_BEST, bests);
      record.textContent = previous
        ? t('record.newBest', { previous: describe(previous, false) })
        : t('record.first');
    } else {
      record.textContent = t('record.current', { best: describe(previous, true) });
    }
  }

  function renderRecap() {
    $('recap').innerHTML = state.results.map((r) => {
      const detail = r.correct
        ? escapeHtml(t('recap.timing', { seconds: formatSeconds(r.ms), points: r.points }))
        : (r.given
            ? escapeHtml(t('recap.yourAnswer')) + ' <del>' + escapeHtml(L(r.given.name)) + '</del>'
            : escapeHtml(t('recap.skipped')));
      return '<li>' +
        '<span class="recap-mark ' + (r.correct ? 'ok' : 'bad') + '">' +
        (r.correct ? '✓' : '✕') + '</span>' +
        '<span class="recap-body">' +
          '<span class="recap-answer">' + escapeHtml(L(r.lang.name)) + '</span> ' +
          '<span class="recap-given">' + detail + '</span>' +
        '</span>' +
        '<span class="recap-sentence">' + escapeHtml(r.text) + '</span>' +
      '</li>';
    }).join('');
  }

  /* -------------------------------------------------------------- partage */

  function shareText() {
    const correct = correctCount();
    const squares = state.results.map((r) => (r.correct ? '🟦' : '⬜')).join('');
    const diff = t('diff.' + state.diff + '.label');
    const time = formatTime(state.elapsedMs);

    let head, line;
    if (state.mode === 'quotidien') {
      head = t('share.daily', { date: prettyDate(state.day), diff: diff });
      line = t('share.scoreline', { correct: correct, total: QUESTIONS_PER_GAME, points: state.points, time: time });
    } else if (isSurvival()) {
      head = t('share.survie', { diff: diff });
      line = t('share.survieline', { correct: correct, points: state.points, time: time });
    } else {
      head = t('share.libre', { diff: diff });
      line = t('share.scoreline', { correct: correct, total: QUESTIONS_PER_GAME, points: state.points, time: time });
    }
    return head + '\n' + line + '\n' + squares;
  }

  function copyToClipboard(text, button) {
    const done = () => {
      button.textContent = t('action.copied');
      setTimeout(() => { button.textContent = t('action.share'); }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* rien à faire */ }
    document.body.removeChild(ta);
  }

  /* ------------------------------------------------ application des textes */

  function applyTranslations() {
    document.documentElement.lang = t('html.lang');
    document.title = t('doc.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('doc.description'));

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    document.querySelectorAll('.locale-btn').forEach((btn) => {
      const on = btn.dataset.locale === locale;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-checked', String(on));
    });

    $('replayBtn').textContent = t(state.mode === 'quotidien' ? 'action.replayDaily' : 'action.replay');
    refreshHomeLabels();
  }

  function setLocale(next, atStartup) {
    locale = LOCALES.indexOf(next) === -1 ? 'fr' : next;
    writeStore(KEY_PREF, { diff: state.diff, locale: locale });
    applyTranslations();
    // Changer de langue change le pool : une partie en cours n'aurait plus
    // de sens, on repart de l'accueil.
    if (!atStartup) {
      clearInterval(state.ticker);
      showScreen('home');
    }
  }

  /* --------------------------------------------------------- branchements */

  function setDifficulty(diff) {
    state.diff = diff;
    document.querySelectorAll('.diff').forEach((btn) => {
      const on = btn.dataset.diff === diff;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-checked', String(on));
    });
    writeStore(KEY_PREF, { diff: diff, locale: locale });
    refreshHomeLabels();
  }

  document.querySelectorAll('.diff').forEach((btn) => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
  });

  document.querySelectorAll('.mode').forEach((btn) => {
    btn.addEventListener('click', () => startGame(btn.dataset.mode));
  });

  document.querySelectorAll('.locale-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.locale !== locale) setLocale(btn.dataset.locale);
    });
  });

  $('nextBtn').addEventListener('click', nextStep);
  $('replayBtn').addEventListener('click', () => startGame(state.mode));

  function goHome() {
    clearInterval(state.ticker);
    refreshHomeLabels();
    showScreen('home');
  }

  $('homeBtn').addEventListener('click', goHome);
  $('brand').addEventListener('click', (e) => { e.preventDefault(); goHome(); });
  $('shareBtn').addEventListener('click', (e) => copyToClipboard(shareText(), e.currentTarget));

  // Raccourcis clavier : 1-6 pour répondre, Entrée pour enchaîner.
  document.addEventListener('keydown', (e) => {
    if (screens.game.hidden) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Enter' && state.answered) {
      e.preventDefault();
      nextStep();
      return;
    }
    if (state.diff === 'facile' && !state.answered && /^[1-6]$/.test(e.key)) {
      const btn = $('choices').children[Number(e.key) - 1];
      if (btn) { e.preventDefault(); btn.click(); }
    }
  });

  /**
   * Les parties jouées avant l'arrivée des modes vivaient sous une autre clé,
   * sans notion de mode. On les récupère comme records de « partie libre »
   * plutôt que de les faire disparaître.
   */
  function migrateOldBests() {
    const old = readStore('gtl.best.v1');
    if (!old.facile && !old.difficile) return;
    const bests = readStore(KEY_BEST);
    ['facile', 'difficile'].forEach((d) => {
      if (old[d] && !bests[bestKey('libre', d)]) bests[bestKey('libre', d)] = old[d];
    });
    writeStore(KEY_BEST, bests);
    try { localStorage.removeItem('gtl.best.v1'); } catch (e) { /* tant pis */ }
  }

  /** Première visite : on suit la langue du navigateur, sinon le français. */
  function detectLocale() {
    const saved = readStore(KEY_PREF).locale;
    if (LOCALES.indexOf(saved) !== -1) return saved;
    const nav = (navigator.languages || [navigator.language || 'fr'])[0] || 'fr';
    return nav.toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
  }

  /* ------------------------------------------------------------ démarrage */

  migrateOldBests();
  setDifficulty(readStore(KEY_PREF).diff === 'difficile' ? 'difficile' : 'facile');
  setLocale(detectLocale(), true);
})();
