/* =========================================================================
   Guess the Language — dictionnaire de l'interface
   -------------------------------------------------------------------------
   UI_STRINGS : tout le texte de l'interface, par langue.
     Les {variables} sont remplacées à l'affichage par t('clé', { … }).

   TAXONOMY  : familles, branches et alphabets. Ce sont des ensembles fermés
     (5 familles, 14 branches, 3 alphabets), donc chaque langue de
     languages.js n'en stocke que la clé — pas les deux traductions.
   ========================================================================= */

const LOCALES = ['fr', 'en'];

const UI_STRINGS = {
  fr: {
    'html.lang': 'fr',
    'doc.title': 'Guess the Language — devine la langue',
    'doc.description': "Un petit jeu pour apprendre à reconnaître les langues d'Europe à partir d'une simple phrase.",

    'brand.aria': 'Guess the Language — accueil',
    'locale.aria': 'Langue du site',
    'locale.switch': 'English',

    'home.eyebrow': "{count} langues d'Europe",
    'home.title': 'Devine la langue.',
    'home.lead': "Une phrase s'affiche, à toi de dire dans quelle langue elle est écrite. Après chaque réponse, le jeu montre ce qui permettait de la reconnaître.",

    'picker.label': 'Difficulté',
    'diff.facile.name': 'Normal',
    'diff.facile.desc': 'Six propositions',
    'diff.difficile.name': 'Difficile',
    'diff.difficile.desc': "Aucune proposition, à toi d'écrire",
    'diff.facile.label': 'normal',
    'diff.difficile.label': 'difficile',

    'mode.quotidien.name': 'Défi du jour',
    'mode.quotidien.desc': "Les mêmes dix phrases pour tout le monde aujourd'hui.",
    'mode.libre.tag': 'Sans limite',
    'mode.libre.name': 'Partie libre',
    'mode.libre.desc': "Dix phrases tirées au hasard, autant de fois que tu veux.",
    'mode.survie.tag': 'Trois vies',
    'mode.survie.name': 'Survie',
    'mode.survie.desc': "Aucune limite de questions. Plus tu avances, plus les langues sont rares.",
    'mode.play': 'Jouer',

    'best.none': 'Aucune partie jouée',
    'best.daily.none': "Pas encore joué aujourd'hui",
    'best.daily.done': 'Fait : {correct}/{total} · {points} pts',
    'best.survie': 'Record : {correct} langues · {points} pts',
    'best.standard': 'Record : {points} pts · {correct}/{total}',

    'hud.question': 'Question',
    'hud.found': 'Trouvées',
    'hud.lives': 'Vies',
    'hud.time': 'Temps',
    'hud.score': 'Score',

    'guess.label': 'Nom de la langue',
    'guess.placeholder': 'Écris le nom de la langue…',
    'guess.submit': 'Valider',
    'guess.skip': 'Passer',
    'guess.listAria': 'Langues proposées',
    'guess.choicesAria': 'Propositions de réponse',
    'guess.empty': "Écris le nom d'une langue, ou passe la question.",
    'guess.unknown': '« {input} » n’est pas une langue du jeu.',
    'guess.ambiguous': 'Plusieurs langues correspondent : choisis dans la liste.',

    'verdict.translation': 'Traduction',
    'verdict.family': 'Famille',
    'verdict.script': 'Alphabet',
    'verdict.speakers': 'Locuteurs',
    'verdict.area': 'Où',
    'verdict.right': 'Bonne réponse.',
    'verdict.wrong': 'Raté.',
    'verdict.itWas': "C'était le {language}.",

    'next': 'Suivant',
    'next.last': 'Voir mon score',
    'next.gameOver': 'Partie terminée',
    'next.key': 'Entrée',

    'end.points': 'points',
    'end.correct': 'bonnes réponses',
    'end.found.one': 'langue trouvée',
    'end.found.many': 'langues trouvées',
    'end.time': 'temps total',
    'end.daily': 'Défi du {date} · {diff}',
    'end.mode': '{mode} · {diff}',

    'end.title.perfect': 'Sans faute.',
    'end.title.great': 'Excellent.',
    'end.title.good': 'Bien joué.',
    'end.title.ok': 'Pas mal du tout.',
    'end.title.meh': 'Il y a du travail.',
    'end.title.bad': "L'Europe est vaste…",
    'end.title.survie.great': 'Impressionnant.',
    'end.title.survie.good': 'Belle résistance.',
    'end.title.survie.ok': 'Pas mal du tout.',
    'end.title.survie.bad': 'Ça se corse vite.',

    'record.dailySaved': '🏆 Résultat du jour enregistré. Reviens demain pour un nouveau défi.',
    'record.dailyTraining': 'Entraînement : ton résultat officiel du jour reste {correct}/{total} ({points} pts).',
    'record.first': '🏆 Premier score enregistré dans ce mode.',
    'record.newBest': '🏆 Nouveau record ! Ancien : {previous}.',
    'record.current': 'Ton record ici : {best}.',
    'record.survieValue': '{correct} langues',
    'record.survieDetail': '{correct} langues ({points} pts)',
    'record.standardValue': '{points} pts',
    'record.standardDetail': '{points} pts ({correct}/{total})',

    'recap.yourAnswer': 'ta réponse :',
    'recap.skipped': 'passée',
    'recap.timing': '{seconds} s · +{points} pts',

    'action.replay': 'Rejouer',
    'action.replayDaily': "Rejouer pour s'entraîner",
    'action.home': 'Changer de mode',
    'action.share': 'Copier mon score',
    'action.copied': 'Copié ✓',

    'share.daily': 'Guess the Language — défi du {date} ({diff})',
    'share.survie': 'Guess the Language — survie ({diff})',
    'share.libre': 'Guess the Language — partie libre ({diff})',
    'share.scoreline': '{correct}/{total} · {points} pts · {time}',
    'share.survieline': '{correct} langues trouvées · {points} pts · {time}',

    'foot.count': '{count} langues au catalogue'
  },

  en: {
    'html.lang': 'en',
    'doc.title': 'Guess the Language',
    'doc.description': 'A small game to learn to recognise the languages of Europe from a single sentence.',

    'brand.aria': 'Guess the Language — home',
    'locale.aria': 'Site language',
    'locale.switch': 'Français',

    'home.eyebrow': '{count} European languages',
    'home.title': 'Guess the language.',
    'home.lead': 'A sentence appears, and your job is to say which language it is written in. After each answer, the game shows what gave it away.',

    'picker.label': 'Difficulty',
    'diff.facile.name': 'Normal',
    'diff.facile.desc': 'Six options',
    'diff.difficile.name': 'Hard',
    'diff.difficile.desc': 'No options, you type the name',
    'diff.facile.label': 'normal',
    'diff.difficile.label': 'hard',

    'mode.quotidien.name': 'Daily challenge',
    'mode.quotidien.desc': 'The same ten sentences for everyone today.',
    'mode.libre.tag': 'No limit',
    'mode.libre.name': 'Free round',
    'mode.libre.desc': 'Ten random sentences, as often as you like.',
    'mode.survie.tag': 'Three lives',
    'mode.survie.name': 'Survival',
    'mode.survie.desc': 'No limit on questions. The further you go, the rarer the languages.',
    'mode.play': 'Play',

    'best.none': 'No round played yet',
    'best.daily.none': "Today's challenge not played yet",
    'best.daily.done': 'Done: {correct}/{total} · {points} pts',
    'best.survie': 'Best: {correct} languages · {points} pts',
    'best.standard': 'Best: {points} pts · {correct}/{total}',

    'hud.question': 'Question',
    'hud.found': 'Found',
    'hud.lives': 'Lives',
    'hud.time': 'Time',
    'hud.score': 'Score',

    'guess.label': 'Name of the language',
    'guess.placeholder': 'Type the name of the language…',
    'guess.submit': 'Submit',
    'guess.skip': 'Skip',
    'guess.listAria': 'Suggested languages',
    'guess.choicesAria': 'Answer choices',
    'guess.empty': 'Type the name of a language, or skip the question.',
    'guess.unknown': '“{input}” is not a language in this game.',
    'guess.ambiguous': 'Several languages match — pick one from the list.',

    'verdict.translation': 'Translation',
    'verdict.family': 'Family',
    'verdict.script': 'Script',
    'verdict.speakers': 'Speakers',
    'verdict.area': 'Where',
    'verdict.right': 'Correct.',
    'verdict.wrong': 'Wrong.',
    'verdict.itWas': 'It was {language}.',

    'next': 'Next',
    'next.last': 'See my score',
    'next.gameOver': 'Game over',
    'next.key': 'Enter',

    'end.points': 'points',
    'end.correct': 'correct answers',
    'end.found.one': 'language found',
    'end.found.many': 'languages found',
    'end.time': 'total time',
    'end.daily': 'Challenge of {date} · {diff}',
    'end.mode': '{mode} · {diff}',

    'end.title.perfect': 'Flawless.',
    'end.title.great': 'Excellent.',
    'end.title.good': 'Well played.',
    'end.title.ok': 'Not bad at all.',
    'end.title.meh': 'Room for improvement.',
    'end.title.bad': 'Europe is a big place…',
    'end.title.survie.great': 'Impressive.',
    'end.title.survie.good': 'You held out well.',
    'end.title.survie.ok': 'Not bad at all.',
    'end.title.survie.bad': 'It gets hard fast.',

    'record.dailySaved': "🏆 Today's result saved. Come back tomorrow for a new challenge.",
    'record.dailyTraining': 'Practice round: your official result for today is still {correct}/{total} ({points} pts).',
    'record.first': '🏆 First score saved in this mode.',
    'record.newBest': '🏆 New best! Previous: {previous}.',
    'record.current': 'Your best here: {best}.',
    'record.survieValue': '{correct} languages',
    'record.survieDetail': '{correct} languages ({points} pts)',
    'record.standardValue': '{points} pts',
    'record.standardDetail': '{points} pts ({correct}/{total})',

    'recap.yourAnswer': 'your answer:',
    'recap.skipped': 'skipped',
    'recap.timing': '{seconds} s · +{points} pts',

    'action.replay': 'Play again',
    'action.replayDaily': 'Play again for practice',
    'action.home': 'Change mode',
    'action.share': 'Copy my score',
    'action.copied': 'Copied ✓',

    'share.daily': 'Guess the Language — challenge of {date} ({diff})',
    'share.survie': 'Guess the Language — survival ({diff})',
    'share.libre': 'Guess the Language — free round ({diff})',
    'share.scoreline': '{correct}/{total} · {points} pts · {time}',
    'share.survieline': '{correct} languages found · {points} pts · {time}',

    'foot.count': '{count} languages in the catalogue'
  }
};

/* ------------------------------------------------------------- taxonomie */

const TAXONOMY = {
  family: {
    'indo-europeenne': { fr: 'Indo-européenne', en: 'Indo-European' },
    'ouralienne':      { fr: 'Ouralienne', en: 'Uralic' },
    'afro-asiatique':  { fr: 'Afro-asiatique', en: 'Afro-Asiatic' },
    'turcique':        { fr: 'Turcique', en: 'Turkic' },
    'isolat':          { fr: 'Isolat', en: 'Language isolate' }
  },
  branch: {
    'germanique-occidental':   { fr: 'Germanique occidental', en: 'West Germanic' },
    'germanique-septentrional':{ fr: 'Germanique septentrional', en: 'North Germanic' },
    'romane':                  { fr: 'Romane', en: 'Romance' },
    'slave-oriental':          { fr: 'Slave oriental', en: 'East Slavic' },
    'slave-occidental':        { fr: 'Slave occidental', en: 'West Slavic' },
    'slave-meridional':        { fr: 'Slave méridional', en: 'South Slavic' },
    'balte':                   { fr: 'Balte', en: 'Baltic' },
    'finno-ougrienne':         { fr: 'Finno-ougrienne', en: 'Finno-Ugric' },
    'celtique':                { fr: 'Celtique', en: 'Celtic' },
    'hellenique':              { fr: 'Hellénique', en: 'Hellenic' },
    'albanaise':               { fr: 'Albanaise', en: 'Albanian' },
    'semitique':               { fr: 'Sémitique', en: 'Semitic' },
    'turcique':                { fr: 'Turcique', en: 'Turkic' },
    'isolat':                  { fr: 'Isolat', en: 'Language isolate' }
  },
  script: {
    'latin':      { fr: 'Latin', en: 'Latin' },
    'cyrillique': { fr: 'Cyrillique', en: 'Cyrillic' },
    'grec':       { fr: 'Grec', en: 'Greek' }
  }
};
