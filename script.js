/* =========================================================================
   Guess the Language — logique du jeu
   ========================================================================= */

(function () {
  'use strict';

  /* ------------------------------------------------------------ réglages */

  const QUESTIONS_PER_GAME = 10;
  const CHOICES_PER_QUESTION = 6;

  // Composition d'une partie : 3 langues courantes, 4 intermédiaires, 3 rares.
  const LEVEL_MIX = { 1: 3, 2: 4, 3: 3 };

  const POINTS_CORRECT = 100;   // points d'une bonne réponse
  const BONUS_MAX = 60;         // bonus de rapidité maximum
  const BONUS_DECAY = 3;        // points de bonus perdus par seconde

  const STORE_KEY = 'gtl.best.v1';

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

  function shuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pick(array, n) {
    return shuffle(array).slice(0, n);
  }

  function formatTime(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  /* --------------------------------------------------- index de recherche */

  // Toutes les graphies acceptées à la saisie, pour chaque langue.
  const SEARCH_INDEX = LANGUAGES.map((lang) => {
    const forms = [lang.name, lang.endonym].concat(lang.aliases || []);
    return { lang: lang, keys: forms.map(normalize) };
  });

  function findLanguageByInput(raw) {
    const q = normalize(raw);
    if (!q) return null;
    const entry = SEARCH_INDEX.find((e) => e.keys.indexOf(q) !== -1);
    return entry ? entry.lang : null;
  }

  function searchLanguages(raw, limit) {
    const q = normalize(raw);
    if (!q) return [];
    const starts = [];
    const contains = [];
    SEARCH_INDEX.forEach((entry) => {
      if (entry.keys.some((k) => k.indexOf(q) === 0)) starts.push(entry.lang);
      else if (entry.keys.some((k) => k.indexOf(q) !== -1)) contains.push(entry.lang);
    });
    const byName = (a, b) => a.name.localeCompare(b.name, 'fr');
    return starts.sort(byName).concat(contains.sort(byName)).slice(0, limit || 8);
  }

  /* ----------------------------------------------- fabrication des tours */

  /** Tire les langues de la partie en respectant le dosage de difficulté. */
  function drawLanguages() {
    let drawn = [];
    Object.keys(LEVEL_MIX).forEach((level) => {
      const pool = LANGUAGES.filter((l) => l.level === Number(level));
      drawn = drawn.concat(pick(pool, LEVEL_MIX[level]));
    });

    // Filet de sécurité si une catégorie venait à manquer de langues.
    if (drawn.length < QUESTIONS_PER_GAME) {
      const rest = LANGUAGES.filter((l) => drawn.indexOf(l) === -1);
      drawn = drawn.concat(pick(rest, QUESTIONS_PER_GAME - drawn.length));
    }
    return shuffle(drawn).slice(0, QUESTIONS_PER_GAME);
  }

  /** Cinq intrus : d'abord la même branche, puis le même alphabet, puis au hasard. */
  function buildChoices(answer) {
    const others = LANGUAGES.filter((l) => l.id !== answer.id);
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

  function buildQuestions() {
    return drawLanguages().map((lang) => ({
      lang: lang,
      text: lang.texts[Math.floor(Math.random() * lang.texts.length)],
      choices: buildChoices(lang)
    }));
  }

  /* ------------------------------------------------------- meilleurs scores */

  function readBests() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function writeBest(mode, result) {
    try {
      const bests = readBests();
      bests[mode] = result;
      localStorage.setItem(STORE_KEY, JSON.stringify(bests));
    } catch (e) {
      /* navigation privée, stockage bloqué : tant pis, on continue. */
    }
  }

  function refreshBestLabels() {
    const bests = readBests();
    document.querySelectorAll('[data-best]').forEach((el) => {
      const best = bests[el.dataset.best];
      el.textContent = best
        ? 'Record : ' + best.points + ' pts · ' + best.correct + '/' + QUESTIONS_PER_GAME
        : 'Aucune partie jouée';
    });
  }

  /* --------------------------------------------------------------- écrans */

  const screens = {
    home: $('screenHome'),
    game: $('screenGame'),
    end: $('screenEnd')
  };

  function showScreen(name) {
    Object.keys(screens).forEach((key) => {
      screens[key].hidden = key !== name;
    });
    $('hud').hidden = name !== 'game';
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  /* ------------------------------------------------------------- partie */

  const state = {
    mode: 'facile',
    questions: [],
    index: 0,
    results: [],
    points: 0,
    elapsedMs: 0,      // temps de réflexion cumulé (hors lecture des fiches)
    questionStart: 0,
    answered: false,
    ticker: null
  };

  function startGame(mode) {
    state.mode = mode;
    state.questions = buildQuestions();
    state.index = 0;
    state.results = [];
    state.points = 0;
    state.elapsedMs = 0;
    state.answered = false;

    $('hudScore').textContent = '0';
    showScreen('game');
    renderQuestion();

    clearInterval(state.ticker);
    state.ticker = setInterval(updateTimer, 200);
  }

  function updateTimer() {
    const running = state.answered ? 0 : Date.now() - state.questionStart;
    $('hudTimer').textContent = formatTime(state.elapsedMs + running);
  }

  function renderQuestion() {
    const q = state.questions[state.index];
    state.answered = false;
    state.questionStart = Date.now();

    $('hudProgress').innerHTML =
      (state.index + 1) + '<span class="hud-sep">/</span>' + QUESTIONS_PER_GAME;
    $('progressBar').style.width = (state.index / QUESTIONS_PER_GAME * 100) + '%';

    const specimen = $('specimenText');
    specimen.textContent = q.text;
    specimen.lang = q.lang.id;

    $('verdict').hidden = true;

    if (state.mode === 'facile') {
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
                      '<span>' + escapeHtml(lang.name) + '</span>';
      btn.addEventListener('click', () => answer(lang));
      box.appendChild(btn);
    });
  }

  /* --------------------------------------------------- validation d'un tour */

  function answer(given) {
    if (state.answered) return;
    state.answered = true;

    const q = state.questions[state.index];
    const spent = Date.now() - state.questionStart;
    state.elapsedMs += spent;

    const correct = !!given && given.id === q.lang.id;
    let gained = 0;
    if (correct) {
      const bonus = Math.max(0, Math.round(BONUS_MAX - (spent / 1000) * BONUS_DECAY));
      gained = POINTS_CORRECT + bonus;
      state.points += gained;
    }

    state.results.push({
      lang: q.lang,
      text: q.text,
      given: given,
      correct: correct,
      points: gained,
      ms: spent
    });

    // HUD
    const scoreEl = $('hudScore');
    scoreEl.textContent = state.points;
    if (gained > 0) {
      const wrap = scoreEl.closest('.hud-item');
      wrap.classList.remove('bump');
      void wrap.offsetWidth;
      wrap.classList.add('bump');
    }
    $('progressBar').style.width = ((state.index + 1) / QUESTIONS_PER_GAME * 100) + '%';

    if (state.mode === 'facile') lockChoices(q, given);
    else lockGuessBox();

    showVerdict(q.lang, correct, gained);
  }

  function lockChoices(q, given) {
    const buttons = Array.from($('choices').children);
    buttons.forEach((btn, i) => {
      const lang = q.choices[i];
      btn.disabled = true;
      if (lang.id === q.lang.id) btn.classList.add('is-right');
      else if (given && lang.id === given.id) btn.classList.add('is-wrong');
      else btn.classList.add('is-dim');
    });
  }

  function showVerdict(lang, correct, gained) {
    const badge = $('verdictBadge');
    badge.className = 'verdict-badge ' + (correct ? 'ok' : 'bad');
    badge.textContent = correct ? '✓' : '✕';

    $('verdictName').textContent = lang.name;
    $('verdictEndonym').textContent = lang.endonym;

    const pts = $('verdictPoints');
    pts.textContent = gained > 0 ? '+' + gained : '+0';
    pts.classList.toggle('zero', gained === 0);

    $('verdictFacts').innerHTML = [
      ['Famille', lang.branch],
      ['Alphabet', lang.script],
      ['Locuteurs', lang.speakers],
      ['Où', lang.area]
    ].map(([k, v]) =>
      '<div><dt>' + k + '</dt><dd>' + escapeHtml(v) + '</dd></div>'
    ).join('');

    $('verdictHint').textContent = lang.hint;

    const last = state.index === QUESTIONS_PER_GAME - 1;
    $('nextBtn').innerHTML = (last ? 'Voir mon score' : 'Suivant') +
                             ' <kbd>Entrée</kbd>';

    $('verdict').hidden = false;
    $('liveRegion').textContent =
      (correct ? 'Bonne réponse. ' : 'Raté. ') + 'C’était le ' + lang.name + '.';
    $('nextBtn').focus();
  }

  function nextStep() {
    if (!state.answered) return;
    if (state.index === QUESTIONS_PER_GAME - 1) endGame();
    else { state.index++; renderQuestion(); }
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
      const plain = lang.name;
      const pos = normalize(plain).indexOf(q);
      // On surligne le début du nom quand la saisie y correspond.
      let label = escapeHtml(plain);
      if (pos === 0 && q.length) {
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
    input.value = lang.name;
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
      // …et on arrete l'evenement : sans ca, il remonterait jusqu'au
      // raccourci « Entree = Suivant » et sauterait la correction.
      e.stopPropagation();
      chooseSuggestion(activeIndex);
    } else if (e.key === 'Escape') {
      closeSuggestions();
    } else if (e.key === 'Tab' && activeIndex >= 0) {
      e.preventDefault();
      input.value = matches[activeIndex].name;
      closeSuggestions();
    }
  });

  listbox.addEventListener('mousedown', (e) => {
    const li = e.target.closest('.suggestion');
    if (!li) return;
    e.preventDefault();
    chooseSuggestion(Number(li.dataset.index));
  });

  // mousedown plutot que click : la soumission du formulaire emet un clic
  // synthetique sur « Valider », qui ne doit pas effacer la selection en cours.
  document.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.guessbox')) closeSuggestions();
  });

  $('guessForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.answered) return;

    if (activeIndex >= 0) { chooseSuggestion(activeIndex); return; }

    const typed = input.value.trim();
    if (!typed) { guessMessage('Écris le nom d’une langue, ou passe la question.'); return; }

    const exact = findLanguageByInput(typed);
    if (exact) { answer(exact); return; }

    const found = searchLanguages(typed, 8);
    if (found.length === 1) { answer(found[0]); return; }
    if (found.length > 1) {
      openSuggestions(found);
      guessMessage('Plusieurs langues correspondent : choisis dans la liste.');
      return;
    }
    guessMessage('« ' + typed + ' » n’est pas une langue du jeu.');
  });

  $('guessSkip').addEventListener('click', () => {
    if (!state.answered) answer(null);
  });

  /* ---------------------------------------------------------- résultats */

  function verdictTitle(correct) {
    if (correct === QUESTIONS_PER_GAME) return 'Sans faute.';
    if (correct >= 8) return 'Excellent.';
    if (correct >= 6) return 'Bien joué.';
    if (correct >= 4) return 'Pas mal du tout.';
    if (correct >= 2) return 'Il y a du travail.';
    return 'L’Europe est vaste…';
  }

  function endGame() {
    clearInterval(state.ticker);

    const correct = state.results.filter((r) => r.correct).length;
    const result = {
      points: state.points,
      correct: correct,
      ms: state.elapsedMs,
      date: new Date().toISOString()
    };

    $('endMode').textContent = 'Niveau ' + state.mode + ' · partie terminée';
    $('endTitle').textContent = verdictTitle(correct);
    $('endPoints').textContent = state.points;
    $('endCorrect').textContent = correct + '/' + QUESTIONS_PER_GAME;
    $('endTime').textContent = formatTime(state.elapsedMs);

    const previous = readBests()[state.mode];
    const isRecord = !previous || state.points > previous.points;
    const record = $('endRecord');
    if (isRecord) {
      record.textContent = previous
        ? '🏆 Nouveau record ! Ancien : ' + previous.points + ' pts.'
        : '🏆 Premier score enregistré sur ce niveau.';
      record.hidden = false;
      writeBest(state.mode, result);
    } else {
      record.textContent = 'Ton record sur ce niveau : ' + previous.points +
                           ' pts (' + previous.correct + '/' + QUESTIONS_PER_GAME + ').';
      record.hidden = false;
    }

    $('recap').innerHTML = state.results.map((r) => {
      const given = r.correct
        ? formatTime(r.ms).replace(/^0:/, '') + ' s · +' + r.points + ' pts'
        : (r.given
            ? 'ta réponse : <del>' + escapeHtml(r.given.name) + '</del>'
            : 'passée');
      return '<li>' +
        '<span class="recap-mark ' + (r.correct ? 'ok' : 'bad') + '">' +
        (r.correct ? '✓' : '✕') + '</span>' +
        '<span class="recap-body">' +
          '<span class="recap-answer">' + escapeHtml(r.lang.name) + '</span> ' +
          '<span class="recap-given">' + given + '</span>' +
        '</span>' +
        '<span class="recap-sentence">' + escapeHtml(r.text) + '</span>' +
      '</li>';
    }).join('');

    refreshBestLabels();
    showScreen('end');
  }

  /* -------------------------------------------------------------- partage */

  function shareText() {
    const correct = state.results.filter((r) => r.correct).length;
    const squares = state.results.map((r) => (r.correct ? '🟦' : '⬜')).join('');
    return 'Guess the Language — niveau ' + state.mode + '\n' +
           correct + '/' + QUESTIONS_PER_GAME + ' · ' + state.points + ' pts · ' +
           formatTime(state.elapsedMs) + '\n' + squares;
  }

  function copyToClipboard(text, button) {
    const done = () => {
      const original = button.textContent;
      button.textContent = 'Copié ✓';
      setTimeout(() => { button.textContent = original; }, 1800);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
    } else {
      fallback(text, done);
    }
  }

  function fallback(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* rien à faire */ }
    document.body.removeChild(ta);
  }

  /* --------------------------------------------------------- branchements */

  document.querySelectorAll('.mode').forEach((btn) => {
    btn.addEventListener('click', () => startGame(btn.dataset.mode));
  });

  $('nextBtn').addEventListener('click', nextStep);
  $('replayBtn').addEventListener('click', () => startGame(state.mode));

  $('homeBtn').addEventListener('click', () => {
    clearInterval(state.ticker);
    refreshBestLabels();
    showScreen('home');
  });

  $('shareBtn').addEventListener('click', (e) => copyToClipboard(shareText(), e.currentTarget));

  $('brand').addEventListener('click', (e) => {
    e.preventDefault();
    clearInterval(state.ticker);
    refreshBestLabels();
    showScreen('home');
  });

  // Raccourcis clavier : 1-6 pour répondre, Entrée pour enchaîner.
  document.addEventListener('keydown', (e) => {
    if (screens.game.hidden) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'Enter' && state.answered) {
      e.preventDefault();
      nextStep();
      return;
    }
    if (state.mode === 'facile' && !state.answered && /^[1-6]$/.test(e.key)) {
      const btn = $('choices').children[Number(e.key) - 1];
      if (btn) { e.preventDefault(); btn.click(); }
    }
  });

  /* ------------------------------------------------------------ démarrage */

  $('footCount').textContent = LANGUAGES.length + ' langues au catalogue';
  refreshBestLabels();
})();
