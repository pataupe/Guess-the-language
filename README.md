# Guess the Language

Un petit jeu bilingue : une phrase s'affiche, tu devines dans quelle langue
elle est écrite. 39 langues d'Europe, 975 phrases, chacune traduite en
français et en anglais.

**En ligne :** <https://pataupe.github.io/Guess-the-language/>

## Jouer

Ouvre `index.html` dans un navigateur. Aucune installation, aucun build.

Pour travailler avec un vrai serveur local (recommandé, ça évite les blocages
`file://`) :

```bash
python -m http.server 8777
```

puis <http://localhost:8777>.

## Deux langues d'interface

Le site existe en français et en anglais, avec un sélecteur à drapeaux en
haut à droite. Il disparaît pendant une partie : changer de langue change le
catalogue de langues à deviner, donc annulerait la partie en cours.
À la première visite, la langue du navigateur décide ; le choix est ensuite
gardé dans `localStorage`.

**La langue du joueur est retirée du tirage.** Demander à un francophone de
reconnaître du français ne demande aucun effort — c'est un point offert. La
version française propose donc 38 langues (tout sauf le français), l'anglaise
38 aussi (tout sauf l'anglais). La langue du joueur ne sort ni comme réponse,
ni comme intrus, ni dans l'autocomplétion.

Conséquence assumée : **le défi du jour n'est pas le même dans les deux
versions**, puisque les deux ne piochent pas dans le même ensemble. Les scores
restent comparables entre joueurs d'une même version.

## Comment on répond

Le choix est indépendant du mode de jeu.

| | |
| --- | --- |
| **Normal** | Six propositions, dont au moins une de la même famille que la bonne réponse. Raccourcis clavier `1` à `6`. |
| **Difficile** | Aucune proposition : tu écris le nom de la langue. L'autocomplétion ignore la casse et les accents, et accepte le nom dans **les deux** langues d'interface (`allemand` comme `german`), le nom dans la langue elle-même (`magyar`, `čeština`, `русский`) ou un synonyme (`hollandais`, `castillan`). Flèches pour naviguer, `Entrée` pour valider. |

## Les trois modes

| Mode | Principe |
| --- | --- |
| **Défi du jour** | Les mêmes dix phrases pour tout le monde, tirées à partir de la date. Seule la première tentative compte ; on peut rejouer à l'entraînement sans écraser son résultat. |
| **Partie libre** | Dix phrases au hasard, autant de fois qu'on veut. |
| **Survie** | Sans fin, trois vies. Tirage au hasard comme partout ailleurs : aucune montée en difficulté. |

## Score

- 100 points par bonne réponse, plus un bonus de rapidité qui part de 60 et
  descend de 3 points par seconde de réflexion.
- Le chronomètre ne tourne **que** pendant la réflexion : il se met en pause
  dès que la correction s'affiche, pour qu'on puisse lire la fiche de la langue
  et sa traduction sans se faire pénaliser.
- Les records sont gardés par mode **et** par difficulté, dans `localStorage`.

## Comment une partie est composée

Chaque langue porte une note de rareté de 1 à 3 (champ `level` dans
`languages.js`) : 14 courantes, 15 intermédiaires, 10 rares.

Le défi du jour et la partie libre tirent 10 langues avec une seule
contrainte : **au moins deux de chaque niveau** (`LEVEL_MIN`). Les quatre
questions restantes sont libres, donc la composition change vraiment d'une
partie à l'autre — on observe une douzaine de répartitions différentes, de
6/2/2 à 2/3/5.

Dans tous les modes, une même langue peut retomber plusieurs fois, mais
jamais coup sur coup : `MIN_REPEAT_DISTANCE` impose au moins quatre questions
d'écart. Tombée à la question 1, une langue est écartée des questions 2, 3 et
4, et peut revenir à la 5e. Si elle revient, le jeu lui prend une autre de ses
vingt-cinq phrases.

Les cinq intrus du mode facile sont choisis d'abord dans la même branche
linguistique, puis dans le même alphabet, puis au hasard — pour que deviner
« au pif » ne marche pas.

Le défi du jour remplace `Math.random` par un générateur à graine
(`mulberry32`) alimenté par la date **et la langue d'interface**.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Les trois écrans. Le texte visible vit dans des attributs `data-i18n`. |
| `style.css` | Le design (thème clair et sombre automatiques). |
| `i18n.js` | Le dictionnaire de l'interface et la taxonomie (familles, branches, alphabets). |
| `languages.js` | Les 39 langues et leurs 975 phrases traduites. |
| `script.js` | La logique du jeu. |

## Ajouter une langue

Ajoute une entrée dans `languages.js`. Tout le reste s'adapte seul (compteurs,
autocomplétion, tirage, intrus) :

```js
{
  id: "fo",
  name: { fr: "Féroïen", en: "Faroese" },
  endonym: "Føroyskt",
  family: "indo-europeenne", branch: "germanique-septentrional", script: "latin",
  speakers: { fr: "≈ 70 000", en: "≈ 70,000" },
  area: { fr: "Îles Féroé", en: "Faroe Islands" },
  level: 3,                       // 1 courante · 2 intermédiaire · 3 rare
  aliases: ["foroyskt"],          // les deux noms et l'autonyme sont déjà acceptés
  hint: { fr: "Ce qu'il faut regarder.", en: "What to look for." },
  texts: [
    ["Une phrase dans la langue.",
     { fr: "Sa traduction française.", en: "Its English translation." }]
    // …vingt-cinq en tout
  ]
}
```

Les clés `family`, `branch` et `script` doivent exister dans `TAXONOMY`
(`i18n.js`) — c'est là que vivent leurs traductions, une seule fois pour
toutes les langues.

Trois contraintes de contenu :

- garder assez de langues dans chaque `level` pour le minimum de deux ;
- ne **jamais** donner à deux langues proches (suédois / norvégien / danois,
  tchèque / slovaque, serbe / croate, russe / ukrainien / biélorusse…) la
  traduction d'une même phrase, dans aucune des deux langues : mises côte à
  côte, elles donneraient la réponse ;
- ne **jamais** laisser une phrase nommer sa propre langue, son pays ou une
  de ses villes. « Türkçe öğrenmek istiyorum » ou « Hva koster en billett til
  Oslo? » donnent la réponse sans que le joueur ait à lire la phrase. Citer un
  pays **étranger** reste permis : un Danois qui part en Espagne ne trahit
  rien.

## Ajouter une langue d'interface

Ajoute son code à `LOCALES`, une entrée dans `UI_STRINGS` (96 clés) et sa
traduction dans chaque entrée de `TAXONOMY`. Côté `languages.js`, il faut
alors compléter `name`, `speakers`, `area`, `hint` et les 975 traductions.

## Fiabilité des phrases

Les 975 phrases ont été écrites à la main, pas extraites d'un corpus. Elles
sont solides sur les grandes langues, et plus fragiles sur le **breton**, le
**luxembourgeois**, l'**irlandais** et le **gallois** — une relecture par
quelqu'un qui les pratique serait la bienvenue.

## À faire plus tard

- Une page « Les langues » : un abécédaire consultable, classé par famille.
- Un lien « signaler une erreur » vers une issue GitHub pré-remplie.
- Les langues asiatiques, dans un pool séparé ou une option « monde ».
- Un vrai favicon : aujourd'hui c'est le logo, illisible à 16 pixels.
