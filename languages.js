/* =========================================================================
   Guess the Language — base de données des langues
   -------------------------------------------------------------------------
   Chaque langue :
     id       : code ISO 639-1 (ou 639-3 pour le breton)
     name     : nom français affiché
     endonym  : nom de la langue dans la langue elle-même
     family   : famille linguistique (affichée)
     branch   : sous-groupe, sert à piocher des distracteurs crédibles
     script   : alphabet utilisé
     speakers : ordre de grandeur des locuteurs
     area     : où on la parle
     level    : 1 = courante, 2 = intermédiaire, 3 = rare
     aliases  : autres saisies acceptées par l'autocomplétion
     hint     : indices visuels pour la reconnaître (affiché après la réponse)
     texts    : phrases du quiz
   ========================================================================= */

const LANGUAGES = [
  /* ---------------------------------------------------------- GERMANIQUE */
  {
    id: 'de',
    name: 'Allemand',
    endonym: 'Deutsch',
    family: 'Indo-européenne',
    branch: 'Germanique occidental',
    script: 'Latin',
    speakers: '≈ 95 millions',
    area: 'Allemagne, Autriche, Suisse, Belgique',
    level: 1,
    aliases: ['deutsch', 'german'],
    hint: 'Tous les noms communs prennent une majuscule. Le ß, les umlauts ä ö ü et les mots composés à rallonge sont ses marques de fabrique.',
    texts: [
      'Ich gehe jeden Morgen mit meinem Hund im Park spazieren.',
      'Meine Schwester arbeitet seit drei Jahren in Berlin.',
      'Wir müssen noch Brot und Milch für morgen kaufen.',
      'Der Film gestern Abend war wirklich ausgezeichnet.'
    ]
  },
  {
    id: 'en',
    name: 'Anglais',
    endonym: 'English',
    family: 'Indo-européenne',
    branch: 'Germanique occidental',
    script: 'Latin',
    speakers: '≈ 370 millions (langue maternelle)',
    area: 'Royaume-Uni, Irlande, Malte',
    level: 1,
    aliases: ['english'],
    hint: 'Aucun signe diacritique, articles « the / a », et un vocabulaire pour moitié d’origine romane.',
    texts: [
      'I usually drink a cup of tea before going to bed.',
      'The weather has been absolutely terrible all week.',
      'She bought a new bicycle and rides it every morning.',
      'We should probably leave before it gets dark outside.'
    ]
  },
  {
    id: 'nl',
    name: 'Néerlandais',
    endonym: 'Nederlands',
    family: 'Indo-européenne',
    branch: 'Germanique occidental',
    script: 'Latin',
    speakers: '≈ 24 millions',
    area: 'Pays-Bas, Belgique (Flandre)',
    level: 1,
    aliases: ['nederlands', 'hollandais', 'flamand', 'dutch'],
    hint: 'Les suites ij, oe, ui et sch sautent aux yeux. Ressemble à de l’allemand sans majuscules ni ß.',
    texts: [
      'Ik fiets elke dag naar mijn werk in de stad.',
      'Het regent nu al de hele week, wat vervelend.',
      'Mijn broer woont in een klein dorp vlak bij de zee.',
      'Op zaterdag gaan we altijd samen naar de markt.'
    ]
  },
  {
    id: 'lb',
    name: 'Luxembourgeois',
    endonym: 'Lëtzebuergesch',
    family: 'Indo-européenne',
    branch: 'Germanique occidental',
    script: 'Latin',
    speakers: '≈ 400 000',
    area: 'Luxembourg',
    level: 3,
    aliases: ['letzebuergesch', 'luxembourgois'],
    hint: 'De l’allemand passé au filtre français : beaucoup de ë et é, le pronom « ech », et des emprunts français bruts.',
    texts: [
      'Ech schwätzen e bësse Lëtzebuergesch, mee net vill.',
      'D’Wieder ass haut wierklech schéin.',
      'Mir ginn haut den Owend an d’Stad.',
      'Mäi Brudder wunnt zënter dräi Joer zu Esch.'
    ]
  },
  {
    id: 'sv',
    name: 'Suédois',
    endonym: 'Svenska',
    family: 'Indo-européenne',
    branch: 'Germanique septentrional',
    script: 'Latin',
    speakers: '≈ 10 millions',
    area: 'Suède, Finlande',
    level: 1,
    aliases: ['svenska', 'suedois'],
    hint: 'Trois lettres propres : å, ä, ö. L’article défini est collé à la fin du mot (huset = la maison).',
    texts: [
      'Jag dricker alltid en kopp kaffe på morgonen.',
      'På sommaren åker vi till stugan vid sjön.',
      'Vi måste köpa bröd innan affären stänger.',
      'Hon spelar gitarr och sjunger väldigt bra.'
    ]
  },
  {
    id: 'no',
    name: 'Norvégien',
    endonym: 'Norsk',
    family: 'Indo-européenne',
    branch: 'Germanique septentrional',
    script: 'Latin',
    speakers: '≈ 5 millions',
    area: 'Norvège',
    level: 2,
    aliases: ['norsk', 'norvegien', 'bokmal', 'bokmål'],
    hint: 'Comme le danois à l’écrit, mais avec æ, ø, å et des formes en -kk-, -tt-. « ikke » = ne pas.',
    texts: [
      'Hun har bodd i Bergen i mange år nå.',
      'Kan du hjelpe meg med å bære denne kofferten?',
      'Været er ganske kaldt om vinteren her oppe.',
      'Jeg liker å gå tur i skogen på søndager.'
    ]
  },
  {
    id: 'da',
    name: 'Danois',
    endonym: 'Dansk',
    family: 'Indo-européenne',
    branch: 'Germanique septentrional',
    script: 'Latin',
    speakers: '≈ 6 millions',
    area: 'Danemark',
    level: 2,
    aliases: ['dansk', 'danois'],
    hint: 'Très proche du norvégien : æ, ø, å. Indices danois : « af », « og », et les d intervocaliques (gade, bedre).',
    texts: [
      'Jeg kan godt lide at læse en bog om aftenen.',
      'Hvor meget koster en billet til København?',
      'Min nabo har købt en ny cykel til sin søn.',
      'Det er altid dejligt at se dig igen.'
    ]
  },
  {
    id: 'is',
    name: 'Islandais',
    endonym: 'Íslenska',
    family: 'Indo-européenne',
    branch: 'Germanique septentrional',
    script: 'Latin',
    speakers: '≈ 350 000',
    area: 'Islande',
    level: 2,
    aliases: ['islenska', 'islandais'],
    hint: 'Impossible à confondre : les lettres þ (thorn) et ð (eth), plus les terminaisons -ur, -ið, -nn.',
    texts: [
      'Ég ætla að fara í sund eftir vinnu í dag.',
      'Veðrið hérna breytist mjög hratt á veturna.',
      'Hvar er næsta strætóstöð, takk fyrir?',
      'Systir mín býr í litlu húsi nálægt sjónum.'
    ]
  },

  /* -------------------------------------------------------------- ROMANE */
  {
    id: 'fr',
    name: 'Français',
    endonym: 'Français',
    family: 'Indo-européenne',
    branch: 'Romane',
    script: 'Latin',
    speakers: '≈ 75 millions (langue maternelle)',
    area: 'France, Belgique, Suisse, Luxembourg',
    level: 1,
    aliases: ['francais', 'french'],
    hint: 'Accents aigus et circonflexes, cédille ç, terminaisons muettes -ent, -aient, -eux.',
    texts: [
      'Je vais au marché tous les samedis matin.',
      'Il fait vraiment froid aujourd’hui, prends ton manteau.',
      'Nous avons mangé une excellente soupe hier soir.',
      'J’aimerais apprendre à jouer de la guitare un jour.'
    ]
  },
  {
    id: 'es',
    name: 'Espagnol',
    endonym: 'Español',
    family: 'Indo-européenne',
    branch: 'Romane',
    script: 'Latin',
    speakers: '≈ 480 millions',
    area: 'Espagne (et Amérique latine)',
    level: 1,
    aliases: ['espanol', 'español', 'castillan', 'spanish'],
    hint: 'Le ñ, le ¿ et le ¡ inversés, les doubles ll et rr, et énormément de mots en -ción.',
    texts: [
      'Todos los domingos comemos en casa de mi abuela.',
      'El tren llega otra vez con media hora de retraso.',
      'No encuentro las llaves del coche por ninguna parte.',
      'En verano siempre vamos a la playa con los niños.'
    ]
  },
  {
    id: 'pt',
    name: 'Portugais',
    endonym: 'Português',
    family: 'Indo-européenne',
    branch: 'Romane',
    script: 'Latin',
    speakers: '≈ 235 millions',
    area: 'Portugal (et Brésil)',
    level: 1,
    aliases: ['portugues', 'português', 'portuguese'],
    hint: 'Les voyelles nasales ão, õe, ã sont uniques en Europe. Beaucoup de ç et de mots en -ção.',
    texts: [
      'Vamos tomar um café antes de voltar para casa.',
      'Não consigo encontrar o meu telemóvel em lado nenhum.',
      'Ela trabalha numa pequena livraria perto do rio.',
      'Amanhã vou apanhar o comboio das oito da manhã.'
    ]
  },
  {
    id: 'ca',
    name: 'Catalan',
    endonym: 'Català',
    family: 'Indo-européenne',
    branch: 'Romane',
    script: 'Latin',
    speakers: '≈ 9 millions',
    area: 'Catalogne, Valence, Baléares, Andorre',
    level: 2,
    aliases: ['catala', 'català'],
    hint: 'Le point volant du l·l, les apostrophes partout (l’home, d’aquí) et le mot « amb ». Entre l’espagnol et le français.',
    texts: [
      'Demà anirem a la platja si fa bon temps.',
      'M’agrada molt llegir abans d’anar a dormir.',
      'El meu germà treballa en una llibreria del centre.',
      'Quant costa un bitllet d’anada i tornada a Girona?'
    ]
  },
  {
    id: 'gl',
    name: 'Galicien',
    endonym: 'Galego',
    family: 'Indo-européenne',
    branch: 'Romane',
    script: 'Latin',
    speakers: '≈ 2,4 millions',
    area: 'Galice (nord-ouest de l’Espagne)',
    level: 3,
    aliases: ['galego', 'galicien'],
    hint: 'Du portugais écrit à l’espagnole : le son nasal a disparu (non au lieu de não) et on trouve des x là où l’espagnol met j.',
    texts: [
      'Esta mañá fomos ao mercado mercar peixe e pan.',
      'Chove moito aquí durante todo o inverno.',
      'A miña nai fai o mellor caldo do mundo.',
      'Onde está a estación de autobuses, por favor?'
    ]
  },
  {
    id: 'it',
    name: 'Italien',
    endonym: 'Italiano',
    family: 'Indo-européenne',
    branch: 'Romane',
    script: 'Latin',
    speakers: '≈ 65 millions',
    area: 'Italie, Suisse, Saint-Marin',
    level: 1,
    aliases: ['italiano', 'italian'],
    hint: 'Presque tous les mots finissent par une voyelle. Doubles consonnes fréquentes (bello, mamma) et gli, gn, sc.',
    texts: [
      'Domani mattina devo alzarmi presto per andare al lavoro.',
      'Questo libro è davvero interessante, te lo consiglio.',
      'Mia nonna prepara la pasta fatta in casa ogni domenica.',
      'Fa molto caldo oggi, andiamo a fare una passeggiata.'
    ]
  },
  {
    id: 'ro',
    name: 'Roumain',
    endonym: 'Română',
    family: 'Indo-européenne',
    branch: 'Romane',
    script: 'Latin',
    speakers: '≈ 24 millions',
    area: 'Roumanie, Moldavie',
    level: 2,
    aliases: ['romana', 'română', 'roumain', 'moldave'],
    hint: 'Une langue romane avec des lettres à virgule : ș, ț, plus ă et î. L’article se colle à la fin (trenul = le train).',
    texts: [
      'Vremea este foarte frumoasă astăzi, hai să ieșim.',
      'Sora mea locuiește într-un oraș mic de lângă munte.',
      'Mi-ar plăcea să învăț să cânt la pian într-o zi.',
      'Trenul ajunge în gară peste douăzeci de minute.'
    ]
  },

  /* -------------------------------------------------------------- SLAVE */
  {
    id: 'ru',
    name: 'Russe',
    endonym: 'Русский',
    family: 'Indo-européenne',
    branch: 'Slave oriental',
    script: 'Cyrillique',
    speakers: '≈ 150 millions',
    area: 'Russie, Biélorussie, Baltes',
    level: 1,
    aliases: ['russkiy', 'russian', 'русский'],
    hint: 'Cyrillique avec ы, э, ъ et ё. Les mots en -ый, -ого et la particule « не » sont typiquement russes.',
    texts: [
      'Я нигде не могу найти ключи от машины.',
      'Моя бабушка печёт очень вкусные пироги.',
      'Завтра утром я поеду на работу на метро.',
      'Сегодня очень холодно, надень шапку и шарф.'
    ]
  },
  {
    id: 'uk',
    name: 'Ukrainien',
    endonym: 'Українська',
    family: 'Indo-européenne',
    branch: 'Slave oriental',
    script: 'Cyrillique',
    speakers: '≈ 33 millions',
    area: 'Ukraine',
    level: 2,
    aliases: ['ukrainska', 'ukrainien', 'українська'],
    hint: 'Quatre lettres absentes du russe : і, ї, є, ґ. Et un apostrophe fréquent (п’ю).',
    texts: [
      'Я дуже люблю гуляти парком восени.',
      'Потяг прибуває на вокзал через двадцять хвилин.',
      'Моя сестра працює вчителькою в школі.',
      'Чи можеш ти мені допомогти з цією валізою?'
    ]
  },
  {
    id: 'be',
    name: 'Biélorusse',
    endonym: 'Беларуская',
    family: 'Indo-européenne',
    branch: 'Slave oriental',
    script: 'Cyrillique',
    speakers: '≈ 5 millions',
    area: 'Biélorussie',
    level: 3,
    aliases: ['belarusian', 'bielorusse', 'belarus', 'беларуская'],
    hint: 'Seule langue cyrillique avec la lettre ў (ou court). Beaucoup de а là où le russe écrit о.',
    texts: [
      'Кожную раніцу я п’ю кубак гарбаты перад працай.',
      'Надвор’е сёння вельмі добрае, пойдзем гуляць.',
      'Мой брат жыве ў невялікай вёсцы пад Мінскам.',
      'Дзе тут бліжэйшая аптэка, калі ласка?'
    ]
  },
  {
    id: 'pl',
    name: 'Polonais',
    endonym: 'Polski',
    family: 'Indo-européenne',
    branch: 'Slave occidental',
    script: 'Latin',
    speakers: '≈ 40 millions',
    area: 'Pologne',
    level: 1,
    aliases: ['polski', 'polonais', 'polish'],
    hint: 'Le ł barré, les nasales ą et ę, et les groupes sz, cz, rz, szcz. Très reconnaissable.',
    texts: [
      'Wczoraj wieczorem oglądaliśmy razem bardzo dobry film.',
      'Czy możesz mi powiedzieć, która jest godzina?',
      'Moja siostra mieszka w małym mieście nad morzem.',
      'Jutro rano muszę wstać naprawdę bardzo wcześnie.'
    ]
  },
  {
    id: 'cs',
    name: 'Tchèque',
    endonym: 'Čeština',
    family: 'Indo-européenne',
    branch: 'Slave occidental',
    script: 'Latin',
    speakers: '≈ 10 millions',
    area: 'Tchéquie',
    level: 2,
    aliases: ['cestina', 'čeština', 'tcheque', 'czech'],
    hint: 'Le ř n’existe qu’en tchèque. Accents longs á é í ý et le ů rond. Des mots sans voyelle : krk, prst.',
    texts: [
      'Každé ráno si dávám šálek kávy před prací.',
      'Venku prší už celý týden, je to hrozné.',
      'Můj bratr pracuje v nemocnici v Brně.',
      'Nevím, kde jsem nechal svůj deštník.'
    ]
  },
  {
    id: 'sk',
    name: 'Slovaque',
    endonym: 'Slovenčina',
    family: 'Indo-européenne',
    branch: 'Slave occidental',
    script: 'Latin',
    speakers: '≈ 5 millions',
    area: 'Slovaquie',
    level: 2,
    aliases: ['slovencina', 'slovenčina', 'slovaque', 'slovak'],
    hint: 'Comme le tchèque mais sans ř : à la place, ľ, ĺ, ŕ et ô. Le mot « a » relie les phrases.',
    texts: [
      'Zajtra pôjdeme na výlet do hôr, ak bude pekne.',
      'Neviem, koľko stojí lístok do Košíc.',
      'Moja mama varí najlepšiu polievku na svete.',
      'Rád chodím na prechádzky pri rieke.'
    ]
  },
  {
    id: 'sl',
    name: 'Slovène',
    endonym: 'Slovenščina',
    family: 'Indo-européenne',
    branch: 'Slave méridional',
    script: 'Latin',
    speakers: '≈ 2,5 millions',
    area: 'Slovénie',
    level: 3,
    aliases: ['slovenscina', 'slovenščina', 'slovene', 'slovenien'],
    hint: 'Seulement trois accents : č, š, ž. Garde le duel (deux personnes = forme spéciale) et le mot « je » pour « est ».',
    texts: [
      'Vsako jutro grem v službo s kolesom.',
      'Danes je zunaj zelo lepo vreme.',
      'Moja sestra študira medicino v Ljubljani.',
      'Najraje berem knjige pred spanjem.'
    ]
  },
  {
    id: 'hr',
    name: 'Croate',
    endonym: 'Hrvatski',
    family: 'Indo-européenne',
    branch: 'Slave méridional',
    script: 'Latin',
    speakers: '≈ 5 millions',
    area: 'Croatie, Bosnie-Herzégovine',
    level: 2,
    aliases: ['hrvatski', 'croate', 'croatian'],
    hint: 'č, ć, š, ž, đ en alphabet latin. Mots-clés : « je », « ne », « gdje ». Très proche du serbe et du bosnien.',
    texts: [
      'Ljeti najviše volim plivati u moru.',
      'Moj brat radi u maloj knjižari u centru grada.',
      'Večeras ćemo skuhati nešto jednostavno za večeru.',
      'Ne sjećam se gdje sam parkirao auto.'
    ]
  },
  {
    id: 'sr',
    name: 'Serbe',
    endonym: 'Српски',
    family: 'Indo-européenne',
    branch: 'Slave méridional',
    script: 'Cyrillique',
    speakers: '≈ 9 millions',
    area: 'Serbie, Bosnie-Herzégovine, Monténégro',
    level: 2,
    aliases: ['srpski', 'serbe', 'serbian', 'српски'],
    hint: 'Cyrillique sud-slave avec ј, љ, њ, ћ, ђ. Pas de ы ni de ё comme en russe. (Il s’écrit aussi en alphabet latin.)',
    texts: [
      'Сваког јутра пијем шољу кафе пре посла.',
      'Моја ћерка иде у школу у центру града.',
      'Данас је веома топло, хајде да идемо на базен.',
      'Не знам где сам оставио свој телефон.'
    ]
  },
  {
    id: 'bg',
    name: 'Bulgare',
    endonym: 'Български',
    family: 'Indo-européenne',
    branch: 'Slave méridional',
    script: 'Cyrillique',
    speakers: '≈ 8 millions',
    area: 'Bulgarie',
    level: 2,
    aliases: ['bulgarski', 'bulgare', 'bulgarian', 'български'],
    hint: 'Cyrillique avec un ъ très fréquent au milieu des mots. Pas de déclinaisons, mais l’article collé à la fin (градът).',
    texts: [
      'Утре ще ходим на море с цялото семейство.',
      'Този филм беше много интересен, препоръчвам ти го.',
      'Брат ми живее в малък град близо до планината.',
      'Днес времето е много хубаво и топло.'
    ]
  },
  {
    id: 'mk',
    name: 'Macédonien',
    endonym: 'Македонски',
    family: 'Indo-européenne',
    branch: 'Slave méridional',
    script: 'Cyrillique',
    speakers: '≈ 2 millions',
    area: 'Macédoine du Nord',
    level: 3,
    aliases: ['makedonski', 'macedonien', 'македонски'],
    hint: 'Deux lettres uniques : ѓ et ќ. Comme le bulgare, pas de déclinaisons, mais sans le ъ.',
    texts: [
      'Мојата мајка готви многу вкусна храна.',
      'Автобусот доаѓа за десет минути.',
      'Денес е многу студено надвор.',
      'Многу сакам да читам книги пред спиење.'
    ]
  },

  /* -------------------------------------------------------------- BALTE */
  {
    id: 'lt',
    name: 'Lituanien',
    endonym: 'Lietuvių',
    family: 'Indo-européenne',
    branch: 'Balte',
    script: 'Latin',
    speakers: '≈ 3 millions',
    area: 'Lituanie',
    level: 2,
    aliases: ['lietuviu', 'lietuvių', 'lituanien', 'lithuanien'],
    hint: 'Voyelles à crochet ą ę į ų, plus ū et ė. Les mots finissent très souvent par -as, -is, -us.',
    texts: [
      'Kiekvieną rytą geriu puodelį kavos prieš darbą.',
      'Vakar vakare skaičiau labai įdomią knygą.',
      'Ar galite man padėti nunešti šį lagaminą?',
      'Šiandien lauke labai šalta, apsirenk šilčiau.'
    ]
  },
  {
    id: 'lv',
    name: 'Letton',
    endonym: 'Latviešu',
    family: 'Indo-européenne',
    branch: 'Balte',
    script: 'Latin',
    speakers: '≈ 1,7 million',
    area: 'Lettonie',
    level: 2,
    aliases: ['latviesu', 'latviešu', 'letton', 'lettonien'],
    hint: 'Voyelles longues ā ē ī ū et consonnes à cédille ģ ķ ļ ņ. Les noms masculins finissent par -s.',
    texts: [
      'Es katru vakaru eju pastaigāties gar jūru.',
      'Mana māsa strādā par skolotāju Rīgā.',
      'Šodien ir ļoti skaists laiks, iesim ārā.',
      'Cik maksā biļete uz Liepāju?'
    ]
  },

  /* -------------------------------------------------------- FINNO-OUGRIEN */
  {
    id: 'fi',
    name: 'Finnois',
    endonym: 'Suomi',
    family: 'Ouralienne',
    branch: 'Finno-ougrienne',
    script: 'Latin',
    speakers: '≈ 5 millions',
    area: 'Finlande',
    level: 1,
    aliases: ['suomi', 'finnois', 'finlandais', 'finnish'],
    hint: 'Doubles voyelles et doubles consonnes partout (kaupunki, tyttöö), ä et ö, aucune préposition : tout passe par des suffixes.',
    texts: [
      'Kesällä käymme usein mökillä järven rannalla.',
      'En löydä auton avaimia mistään.',
      'Huomenna aion mennä uimaan ystäväni kanssa.',
      'Puhutko sinä suomea? Minä puhun vähän.'
    ]
  },
  {
    id: 'et',
    name: 'Estonien',
    endonym: 'Eesti',
    family: 'Ouralienne',
    branch: 'Finno-ougrienne',
    script: 'Latin',
    speakers: '≈ 1,1 million',
    area: 'Estonie',
    level: 2,
    aliases: ['eesti', 'estonien', 'estonian'],
    hint: 'Cousin du finnois, mais avec la lettre õ et des mots plus courts (les voyelles finales ont disparu).',
    texts: [
      'Ma käin igal hommikul tööle jalgsi.',
      'Mu vend elab väikeses linnas mere ääres.',
      'Kas sa saaksid mind natuke aidata, palun?',
      'Täna on väljas väga külm ilm.'
    ]
  },
  {
    id: 'hu',
    name: 'Hongrois',
    endonym: 'Magyar',
    family: 'Ouralienne',
    branch: 'Finno-ougrienne',
    script: 'Latin',
    speakers: '≈ 13 millions',
    area: 'Hongrie, Roumanie, Slovaquie',
    level: 1,
    aliases: ['magyar', 'hongrois', 'hungarian'],
    hint: 'Les doubles accents ő et ű n’existent qu’en hongrois. Articles « a / az », digrammes sz, cs, zs, gy.',
    texts: [
      'Minden reggel megiszom egy csésze kávét munka előtt.',
      'Sehol sem találom az autó kulcsait.',
      'A nővérem egy kis faluban él a Balaton mellett.',
      'Holnap moziba megyünk a barátaimmal.'
    ]
  },

  /* ------------------------------------------------------------ CELTIQUE */
  {
    id: 'ga',
    name: 'Irlandais',
    endonym: 'Gaeilge',
    family: 'Indo-européenne',
    branch: 'Celtique',
    script: 'Latin',
    speakers: '≈ 170 000 au quotidien',
    area: 'Irlande',
    level: 3,
    aliases: ['gaeilge', 'irlandais', 'gaelique', 'gaélique', 'gaelique irlandais', 'irish'],
    hint: 'Accents aigus uniquement (á é í ó ú) et des groupes bh, mh, dh, gh partout. Le verbe est en tête de phrase.',
    texts: [
      'Ólaim cupán caife gach maidin roimh an obair.',
      'Tá mo dheirfiúr ina cónaí i mbaile beag cois farraige.',
      'Tá an aimsir go hálainn inniu.',
      'An bhfuil Gaeilge agat? Tá beagán agam.'
    ]
  },
  {
    id: 'cy',
    name: 'Gallois',
    endonym: 'Cymraeg',
    family: 'Indo-européenne',
    branch: 'Celtique',
    script: 'Latin',
    speakers: '≈ 900 000',
    area: 'Pays de Galles',
    level: 3,
    aliases: ['cymraeg', 'gallois', 'welsh'],
    hint: 'Le double ll, le w et le y utilisés comme voyelles (cwm, bryn), et le circonflexe ŵ, ŷ.',
    texts: [
      'Dw i’n yfed paned o de bob bore.',
      'Mae fy mrawd yn gweithio mewn ysgol yng Nghaerdydd.',
      'Mae’n bwrw glaw eto heddiw, fel arfer.',
      'Hoffwn i fynd i’r mynyddoedd y penwythnos yma.'
    ]
  },
  {
    id: 'br',
    name: 'Breton',
    endonym: 'Brezhoneg',
    family: 'Indo-européenne',
    branch: 'Celtique',
    script: 'Latin',
    speakers: '≈ 200 000',
    area: 'Bretagne',
    level: 3,
    aliases: ['brezhoneg', 'breton'],
    hint: 'Signature unique : le trigramme c’h (alc’hwez, c’hoari) et le zh de « Breizh ».',
    texts: [
      'Demat deoc’h, penaos emañ kont ganeoc’h?',
      'Brav eo an amzer hiziv, mont a ran da vale.',
      'Ar vugale a c’hoari er porzh.',
      'Me a zo o chom e Breizh abaoe pemp bloaz.'
    ]
  },

  /* --------------------------------------------------------------- AUTRES */
  {
    id: 'el',
    name: 'Grec',
    endonym: 'Ελληνικά',
    family: 'Indo-européenne',
    branch: 'Hellénique',
    script: 'Grec',
    speakers: '≈ 13 millions',
    area: 'Grèce, Chypre',
    level: 1,
    aliases: ['ellinika', 'grec moderne', 'greek', 'ελληνικά'],
    hint: 'Son propre alphabet, impossible à confondre. Un seul accent aigu sur la voyelle tonique.',
    texts: [
      'Κάθε πρωί πίνω έναν καφέ πριν πάω στη δουλειά.',
      'Δεν μπορώ να βρω πουθενά τα κλειδιά μου.',
      'Το καλοκαίρι πηγαίνουμε πάντα στο νησί.',
      'Σήμερα κάνει πολλή ζέστη, πάμε για μπάνιο.'
    ]
  },
  {
    id: 'sq',
    name: 'Albanais',
    endonym: 'Shqip',
    family: 'Indo-européenne',
    branch: 'Albanaise',
    script: 'Latin',
    speakers: '≈ 7,5 millions',
    area: 'Albanie, Kosovo, Macédoine du Nord',
    level: 2,
    aliases: ['shqip', 'albanais', 'albanian'],
    hint: 'Seule branche de sa famille. Repères : ë très fréquent en fin de mot, ç, et les digrammes xh, zh, dh, gj.',
    texts: [
      'Çdo mëngjes pi një filxhan kafe para punës.',
      'Motra ime jeton në një qytet të vogël pranë detit.',
      'Nesër do të shkojmë në mal me shokët.',
      'Sot bën shumë ftohtë, vish një xhaketë.'
    ]
  },
  {
    id: 'eu',
    name: 'Basque',
    endonym: 'Euskara',
    family: 'Isolat',
    branch: 'Isolat',
    script: 'Latin',
    speakers: '≈ 750 000',
    area: 'Pays basque (Espagne et France)',
    level: 3,
    aliases: ['euskara', 'euskera', 'basque'],
    hint: 'Langue isolée, sans parenté connue. Beaucoup de k, tx, tz, et des mots finissant en -ak, -tik, -rekin.',
    texts: [
      'Goizero kafe bat hartzen dut lanera joan aurretik.',
      'Nire ahizpa Bilbon bizi da aspalditik.',
      'Bihar mendira joango gara lagunekin.',
      'Gaur egun ederra egiten du, goazen kanpora.'
    ]
  },
  {
    id: 'mt',
    name: 'Maltais',
    endonym: 'Malti',
    family: 'Afro-asiatique',
    branch: 'Sémitique',
    script: 'Latin',
    speakers: '≈ 500 000',
    area: 'Malte',
    level: 3,
    aliases: ['malti', 'maltais', 'maltese'],
    hint: 'Seule langue sémitique écrite en alphabet latin : ħ, ġ, ż, ċ et l’article « il- / iċ- » collé devant les noms.',
    texts: [
      'Kuljum nixrob tazza kafè qabel ix-xogħol.',
      'Oħti toqgħod f’raħal żgħir ħdejn il-baħar.',
      'It-temp illum huwa sabiħ ħafna.',
      'Ma nistax insib iċ-ċwievet tal-karozza.'
    ]
  },
  {
    id: 'tr',
    name: 'Turc',
    endonym: 'Türkçe',
    family: 'Turcique',
    branch: 'Turcique',
    script: 'Latin',
    speakers: '≈ 85 millions',
    area: 'Turquie, Chypre, Balkans',
    level: 1,
    aliases: ['turkce', 'türkçe', 'turc', 'turkish'],
    hint: 'Le ı sans point et le ğ muet, plus ş et ç. Langue agglutinante : les suffixes s’empilent en fin de mot.',
    texts: [
      'Her sabah işe gitmeden önce bir fincan kahve içerim.',
      'Arabanın anahtarlarını hiçbir yerde bulamıyorum.',
      'Kız kardeşim deniz kenarında küçük bir kasabada yaşıyor.',
      'Yarın arkadaşlarımla sinemaya gideceğiz.'
    ]
  }
];
