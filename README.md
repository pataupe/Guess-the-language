# Guess the Language

Un petit jeu en français : une phrase s'affiche, tu devines dans quelle langue
elle est écrite. 39 langues d'Europe, 10 phrases par partie.

## Jouer

Ouvre `index.html` dans un navigateur. Aucune installation, aucun build.

Pour travailler avec un vrai serveur local (recommandé, ça évite les blocages
`file://`) :

```bash
python -m http.server 8777
```

puis <http://localhost:8777>.

## Les deux niveaux

| Niveau | Principe |
| --- | --- |
| **Facile** | Six propositions, dont au moins une de la même famille que la bonne réponse. Raccourcis clavier `1` à `6`. |
| **Difficile** | Aucune proposition : tu écris le nom de la langue. L'autocomplétion ignore la casse et les accents, et accepte aussi le nom dans la langue elle-même (`magyar`, `čeština`, `русский`) ou un synonyme (`hollandais`, `castillan`). |

## Score

- 100 points par bonne réponse, plus un bonus de rapidité qui part de 60 et
  descend de 3 points par seconde de réflexion.
- Le chronomètre ne tourne **que** pendant la réflexion : il se met en pause
  dès que la correction s'affiche, pour qu'on puisse lire la fiche de la langue
  sans se faire pénaliser.
- Le meilleur score de chaque niveau est gardé dans `localStorage`. Rien n'est
  envoyé sur un serveur.

## Comment une partie est composée

Chaque partie tire 10 langues distinctes : 3 courantes, 4 intermédiaires et
3 rares (champ `level` dans `languages.js`). Les cinq intrus du mode facile
sont choisis d'abord dans la même branche linguistique, puis dans le même
alphabet, puis au hasard — pour que deviner « au pif » ne marche pas.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Les trois écrans : accueil, partie, résultats. |
| `style.css` | Le design (thème clair et sombre automatiques). |
| `languages.js` | Les 39 langues et leurs 156 phrases. |
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
  texts: ['Une phrase.', 'Une autre.', 'Une troisième.', 'Une quatrième.']
}
```

Seule contrainte : garder assez de langues dans chaque `level` pour le dosage
3 / 4 / 3.

## À faire plus tard

- Les langues asiatiques, dans un pool séparé ou une option « monde ».
- Un mode « audio » ou des textes plus longs.
