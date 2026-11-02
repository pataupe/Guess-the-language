/* =========================================================================
   Génère les fiches de langue, une page HTML par langue et par langue
   d'interface, plus un sommaire pour chacune.

   À relancer après toute modification de languages.js ou de i18n.js :

       node outils/generer-fiches.js

   Pourquoi de vraies pages plutôt qu'une seule page dynamique : la page de
   jeu ne contient presque aucun texte lisible par un moteur de recherche,
   puisque tout est écrit par le code au moment de l'affichage. Ces fichiers
   contiennent leur texte en clair, et sont donc indexables.
   ========================================================================= */

'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');

const { UI_STRINGS, TAXONOMY, LOCALES } =
  new Function(lire('i18n.js') + '\nreturn { UI_STRINGS, TAXONOMY, LOCALES };')();
const LANGUAGES = new Function(lire('languages.js') + '\nreturn LANGUAGES;')();

/* Dossier de destination pour chaque langue d'interface. */
const DOSSIER = { fr: 'langues', en: 'languages' };

/* Adresse publique du site, pour le sitemap. */
const SITE = 'https://guess-the-language.pages.dev';

/* ------------------------------------------------------------- utilitaires */

function t(locale, cle, vars) {
  let s = UI_STRINGS[locale][cle] ?? UI_STRINGS.fr[cle] ?? cle;
  if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
  return s;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/** « Néerlandais » -> « neerlandais ». Sert de nom de fichier. */
function slug(nom) {
  return nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const fichier = (locale, lang) => slug(lang.name[locale]) + '.html';
const taxon = (kind, cle, locale) => (TAXONOMY[kind][cle] || {})[locale] || cle;

/* Les langues jouables : le jeu retire celle du joueur, les fiches aussi. */
const jouables = (locale) => LANGUAGES.filter((l) => l.id !== locale);

/* ------------------------------------------------------------- gabarit HTML */

function page({ locale, titre, description, corps, profondeur, autreLien }) {
  const base = '../'.repeat(profondeur);
  return `<!DOCTYPE html>
<html lang="${t(locale, 'html.lang')}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(titre)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="${base}images/logo2.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}style.css">
</head>
<body>
<div class="app">

  <header class="topbar">
    <a class="brand" href="${base}index.html" aria-label="${esc(t(locale, 'brand.aria'))}">
      <img src="${base}images/logo2.png" alt="Guess the Language">
    </a>
    <div class="topbar-tools">
      <a class="locale-link" href="${autreLien}">${esc(t(locale, 'pages.otherLocale'))}</a>
      <a class="btn btn-primary btn-play" href="${base}index.html">${esc(t(locale, 'pages.backToGame'))}</a>
    </div>
  </header>

  <main>
${corps}
  </main>

  <footer class="foot">
    <span>Guess the Language</span>
    <span class="foot-dot">·</span>
    <span>${esc(t(locale, 'foot.count', { count: jouables(locale).length }))}</span>
  </footer>

</div>
</body>
</html>
`;
}

/* -------------------------------------------------------- fiche d'une langue */

function fiche(locale, lang) {
  const autre = LOCALES.find((l) => l !== locale);
  const niveau = t(locale, 'pages.level' + lang.level);

  // cinq phrases réparties sur l'ensemble du corpus, toujours les mêmes
  const pas = Math.floor(lang.texts.length / 5);
  const exemples = [0, 1, 2, 3, 4].map((i) => lang.texts[i * pas]);

  const faits = [
    [t(locale, 'verdict.family'), taxon('branch', lang.branch, locale)],
    [t(locale, 'verdict.script'), taxon('script', lang.script, locale)],
    [t(locale, 'verdict.speakers'), lang.speakers[locale]],
    [t(locale, 'verdict.area'), lang.area[locale]],
    [t(locale, 'pages.rarity'), niveau]
  ];

  const corps = `    <nav class="fil"><a href="index.html">${esc(t(locale, 'pages.allLanguages'))}</a></nav>

    <article class="fiche">
      <header class="fiche-tete">
        <h1>${esc(lang.name[locale])}</h1>
        <p class="fiche-endonyme" lang="${lang.id}">${esc(lang.endonym)}</p>
      </header>

      <p class="fiche-resume">${esc(lang.about[locale])}</p>

      <dl class="facts fiche-facts">
${faits.map(([k, v]) => `        <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('\n')}
      </dl>

      <section class="fiche-bloc">
        <h2>${esc(t(locale, 'pages.howToSpot'))}</h2>
        <p class="verdict-hint">${esc(lang.hint[locale])}</p>
      </section>

      <section class="fiche-bloc">
        <h2>${esc(t(locale, 'pages.examples'))}</h2>
        <ul class="exemples">
${exemples.map((x) => `          <li>
            <p class="exemple-src" lang="${lang.id}">${esc(x[0])}</p>
${x[1][locale] ? `            <p class="exemple-trad">${esc(x[1][locale])}</p>` : ''}
          </li>`).join('\n')}
        </ul>
      </section>
    </article>
`;

  return page({
    locale,
    titre: lang.name[locale] + ' — Guess the Language',
    description: t(locale, 'pages.metaLang', { name: lang.name[locale], endonym: lang.endonym }),
    corps,
    profondeur: 1,
    // Si la langue de la fiche est celle de l'autre interface, elle n'y a pas
    // de page : le jeu retire au joueur sa propre langue. On renvoie au sommaire.
    autreLien: '../' + DOSSIER[autre] + '/' +
      (lang.id === autre ? 'index.html' : fichier(autre, lang))
  });
}

/* ------------------------------------------------------------- le sommaire */

function sommaire(locale) {
  const autre = LOCALES.find((l) => l !== locale);
  const liste = jouables(locale);

  // regroupées par famille, familles les plus fournies d'abord
  const parBranche = {};
  liste.forEach((l) => (parBranche[l.branch] = parBranche[l.branch] || []).push(l));
  const branches = Object.keys(parBranche)
    .sort((a, b) => parBranche[b].length - parBranche[a].length ||
                    taxon('branch', a, locale).localeCompare(taxon('branch', b, locale), locale));

  const corps = `    <h1 class="home-title">${esc(t(locale, 'pages.index.title'))}</h1>
    <p class="home-lead">${esc(t(locale, 'pages.index.lead', { count: liste.length }))}</p>

${branches.map((b) => `    <section class="famille">
      <h2>${esc(taxon('branch', b, locale))}</h2>
      <ul class="famille-liste">
${parBranche[b]
    .sort((x, y) => x.name[locale].localeCompare(y.name[locale], locale))
    .map((l) => `        <li><a href="${fichier(locale, l)}">
          <span class="famille-nom">${esc(l.name[locale])}</span>
          <span class="famille-endonyme" lang="${l.id}">${esc(l.endonym)}</span>
        </a></li>`).join('\n')}
      </ul>
    </section>`).join('\n')}
`;

  return page({
    locale,
    titre: t(locale, 'pages.index.title') + ' — Guess the Language',
    description: t(locale, 'pages.metaIndex', { count: liste.length }),
    corps,
    profondeur: 1,
    autreLien: '../' + DOSSIER[autre] + '/index.html'
  });
}

/* -------------------------------------------------------------- le sitemap */

/* Cloudflare sert les pages sans le « .html » : ce sont ces adresses-là qu'il
   faut déclarer, sinon chaque entrée du sitemap part sur une redirection. */
const urlFiche = (locale, lang) => SITE + '/' + DOSSIER[locale] + '/' + slug(lang.name[locale]);
const urlSommaire = (locale) => SITE + '/' + DOSSIER[locale] + '/';

const SAUT = `
`;

function sitemap() {
  const entrees = [{ loc: SITE + '/', alternatives: [] }];

  /* Les deux sommaires sont traductions l'un de l'autre. */
  const altSommaires = LOCALES.map((l) => [l, urlSommaire(l)]);
  LOCALES.forEach((l) => entrees.push({ loc: urlSommaire(l), alternatives: altSommaires }));

  /* Chaque langue a une fiche dans les deux langues d'interface, sauf celle du
     joueur : le français n'a pas de fiche côté français, l'anglais côté anglais. */
  LANGUAGES.forEach((lang) => {
    const alternatives = LOCALES.filter((l) => lang.id !== l).map((l) => [l, urlFiche(l, lang)]);
    alternatives.forEach(([, loc]) => entrees.push({ loc, alternatives }));
  });

  const lignes = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">'
  ];
  entrees.forEach((e) => {
    lignes.push('  <url>');
    lignes.push('    <loc>' + e.loc + '</loc>');
    e.alternatives.forEach(([l, loc]) => lignes.push(
      '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + loc + '"/>'));
    lignes.push('  </url>');
  });
  lignes.push('</urlset>');

  return lignes.join(SAUT) + SAUT;
}

/* ------------------------------------------------------------- génération */

let total = 0;
LOCALES.forEach((locale) => {
  const dossier = path.join(RACINE, DOSSIER[locale]);
  fs.rmSync(dossier, { recursive: true, force: true });
  fs.mkdirSync(dossier, { recursive: true });

  fs.writeFileSync(path.join(dossier, 'index.html'), sommaire(locale), 'utf8');
  total++;

  jouables(locale).forEach((lang) => {
    fs.writeFileSync(path.join(dossier, fichier(locale, lang)), fiche(locale, lang), 'utf8');
    total++;
  });
});

console.log(total + ' pages générées dans ' + LOCALES.map((l) => DOSSIER[l] + '/').join(' et '));

const plan = sitemap();
fs.writeFileSync(path.join(RACINE, 'sitemap.xml'), plan, 'utf8');
console.log((plan.match(/<loc>/g) || []).length + ' adresses dans sitemap.xml');
