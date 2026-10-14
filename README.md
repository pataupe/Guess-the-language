# Guess the Language

Un petit jeu en français : une phrase s'affiche, tu devines dans quelle langue
elle est écrite. 39 langues d'Europe, 390 phrases, chacune avec sa traduction.

**En ligne :** <https://pataupe.github.io/Guess-the-language/>

## Jouer

Ouvre `index.html` dans un navigateur. Aucune installation, aucun build.

Pour travailler avec un vrai serveur local (recommandé, ça évite les blocages
`file://`) :

```bash
python -m http.server 8777
```

puis <http://localhost:8777>.

## Comment on répond

Le choix est indépendant du mode de jeu.

| | |
| --- | --- |
| **Facile** | Six propositions, dont au moins une de la même famille que la bonne réponse. Raccourcis clavier `1` à `6`. |
| **Difficile** | Aucune proposition : tu écris le nom de la langue. L'autocomplétion ignore la casse et les accents, et accepte aussi le nom dans la langue elle-même (`magyar`, `čeština`, `русский`) ou un synonyme (`hollandais`, `castillan`). Flèches pour naviguer, `Entrée` pour valider. |

## Les trois modes

| Mode | Principe |
| --- | --- |
| **Défi du jour** | Les mêmes dix phrases pour tout le monde, tirées à partir de la date. Seule la première tentative compte ; on peut rejouer à l'entraînement sans écraser son résultat. |
| **Partie libre** | Dix phrases au hasard, autant de fois qu'on veut. |
| **Survie** | Sans fin, trois vies. Les langues deviennent de plus en plus rares à mesure qu'on avance. |

## Score

- 100 points par bonne réponse, plus un bonus de rapidité qui part de 60 et
  descend de 3 points par seconde de réflexion.
- Le chronomètre ne tourne **que** pendant la réflexion : il se met en pause
  dès que la correction s'affiche, pour qu'on puisse lire la fiche de la langue
  et sa traduction sans se faire pénaliser.
- Les records sont gardés par mode **et** par difficulté, dans `localStorage`.

## Comment une partie est composée

Le défi du jour et la partie libre tirent 10 langues : 3 courantes,
4 intermédiaires et 3 rares (champ `level` dans `languages.js`). Les cinq
intrus du mode facile sont choisis d'abord dans la même branche linguistique,
puis dans le même alphabet, puis au hasard — pour que deviner « au pif » ne
marche pas.

Dans tous les modes, une même langue peut retomber plusieurs fois, mais
jamais coup sur coup : `MIN_REPEAT_DISTANCE` impose au moins quatre questions
d'écart. Tombée à la question 1, une langue est écartée des questions 2, 3 et
4, et peut revenir à la 5e. Si elle revient, le jeu lui prend une autre de ses
dix phrases.

Le défi du jour remplace `Math.random` par un générateur à graine
(`mulberry32`) alimenté par la date : une même journée produit exactement la
même partie, phrases et propositions comprises, pour tous les joueurs.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Les trois écrans : accueil, partie, résultats. |
| `style.css` | Le design (thème clair et sombre automatiques). |
| `languages.js` | Les 39 langues et leurs 390 phrases traduites. |
| `script.js` | La logique du jeu. |

## Ajouter une langue

Ajoute une entrée dans `languages.js`. Tout le reste s'adapte seul (compteurs,
autocomplétion, tirage des questions, intrus) :

```js
{
  id: 'fo',
  name: 'Féroïen',
  endonym: 'Føroyskt',
  family: 'Indo-européenne',
  branch: 'Germanique septentrional',
  script: 'Latin',
  speakers: '≈ 70 000',
  area: 'Îles Féroé',
  level: 3,                       // 1 courante · 2 intermédiaire · 3 rare
  aliases: ['foroyskt', 'feroien'],
  hint: 'Ce qu\'il faut regarder pour la reconnaître.',
  texts: [
    ['Une phrase dans la langue.', 'Sa traduction française.'],
    // …dix en tout
  ]
}
```

Deux contraintes :

- garder assez de langues dans chaque `level` pour le dosage 3 / 4 / 3 ;
- ne **jamais** donner à deux langues proches (suédois / norvégien / danois,
  tchèque / slovaque, serbe / croate, russe / ukrainien / biélorusse…) la
  traduction d'une même phrase : mises côte à côte, elles donneraient la
  réponse.

## Fiabilité des phrases

Les 390 phrases ont été écrites à la main, pas extraites d'un corpus. Elles
sont solides sur les grandes langues, et plus fragiles sur le **breton**, le
**luxembourgeois**, l'**irlandais** et le **gallois** — une relecture par
quelqu'un qui les pratique serait la bienvenue.

## À faire plus tard

- Une page « Les langues » : un abécédaire consultable, classé par famille.
- Un lien « signaler une erreur » vers une issue GitHub pré-remplie.
- Les langues asiatiques, dans un pool séparé ou une option « monde ».
