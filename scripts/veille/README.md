# Veille réglementaire HSE — Côte d'Ivoire

Collecte automatique quotidienne des textes ivoiriens relevant de l'hygiène, de
la sécurité et de l'environnement, à partir des sources officielles.

```bash
npm run veille            # collecte (2 pages CNDJ par nature)
npm run veille -- --pages 5
npm test                  # vérifie le classifieur et les statuts
```

Un run réécrit trois fichiers :

| Fichier | Rôle |
|---|---|
| `data/textes.js` | le registre publié par le site |
| `data/veille-log.js` | journal d'accessibilité par source (équivalent de l'onglet « Log du run ») |
| `data/registre-veille.csv` | export au format du registre, ouvrable dans Excel |

Un quatrième fichier, `data/statuts.json`, n'est **jamais** écrit par la
collecte : il porte les décisions humaines (voir « Revue » ci-dessous).

## Revue : le statut de chaque entrée

Quatre statuts, définis dans `statuts.mjs` :

| Code | Libellé | Sens |
|---|---|---|
| `a_analyser` | À analyser | détecté, pas encore examiné (défaut) |
| `validee` | Validée | examiné, pertinent pour la veille HSE |
| `hors_scope` | Hors scope | examiné et écarté |
| `en_base` | Ajoutée à la base | intégré au registre légal, traitement terminé |

Les décisions vivent dans `data/statuts.json`, **séparé du registre**. La
séparation est délibérée : une décision humaine ne doit pas dépendre d'un
fichier que le robot réécrit chaque nuit, et le diff Git d'une revue reste
lisible. La clé est le `sourceRef`, pas l'`id` — les id sont renumérotés à
chaque run selon l'ordre de tri.

### Dans le navigateur

Chaque entrée porte ses quatre boutons de statut, et la page se filtre par
statut. Le site étant statique, les clics sont gardés en `localStorage` : une
bannière indique le nombre de décisions non publiées et propose « Exporter
statuts.json ». Placer le fichier téléchargé dans `data/`, committer, et la
prochaine collecte les répercute.

### En ligne de commande

```bash
npm run veille:statut -- --liste                 # tout le registre
npm run veille:statut -- --liste a_analyser      # ce qui reste à traiter
npm run veille:statut -- cndj:67669 validee
npm run veille:statut -- 3 hors_scope "Concerne les collectivités"
npm run veille:statut -- --importer ~/Téléchargements/statuts.json
```

La cible accepte un `sourceRef` ou le numéro affiché par `--liste`. La saisie
du statut tolère accents, majuscules et tirets — `Validée`, `validee` et
`VALIDEE` sont équivalents, et `Non applicable` (vocabulaire du registre
manuel) est reconnu comme `hors_scope`. `--importer` **fusionne** au lieu de
remplacer, pour ne pas perdre les décisions prises entre-temps au terminal.

Poser un statut ne relance pas de collecte : lancer `npm run veille` ensuite
pour le répercuter dans `data/textes.js` et le CSV.

Le workflow `.github/workflows/veille-hse.yml` exécute la collecte tous les
jours à 06:00 UTC, lance les tests avant de publier, et committe si le registre
a changé — ce qui déclenche le redéploiement Vercel.

## Comment un texte est retenu

Le classifieur (`hse.mjs`) note chaque texte par familles de mots-clés
pondérées : une famille très spécifique (« équipement de protection
individuelle », poids 3) pèse plus qu'une famille générique (« sécurité »,
poids 1). Un mot trouvé dans le **titre** compte double.

Trois conditions cumulatives pour entrer au registre :

1. au moins une famille **spécifique** touchée — « sécurité » seul ne suffit
   jamais, le mot vit aussi dans « sécurité sociale » et « sécurité intérieure » ;
2. le sujet HSE figure dans le **titre** — un mot croisé uniquement dans
   l'extrait vient le plus souvent du contexte de la page ;
3. le score dépasse le seuil applicable au **type d'entrée**.

### Types d'entrée

Le type conditionne le seuil, parce qu'un portail institutionnel publie
surtout des communiqués sans portée normative :

| Type | Reconnu par | Seuil |
|---|---|---|
| `texte` — texte réglementaire | instrument juridique en tête de titre (`LOI N°…`, `DÉCRET…`, `CODE DE…`) | 3 |
| `acte` — acte administratif | mise en demeure, obligation, certificat, agrément, interdiction… | 3 |
| `signal` — actualité | ni l'un ni l'autre | 7 |

Le seuil de 7 pour les signaux est fixé volontairement au-dessus de ce que
rapporte une seule famille spécifique dans un titre (3 × 2 = 6) : une actualité
doit réunir deux indications convergentes. « Accès à l'eau potable à Bouna » ne
passe pas ; « prévention d'incendie : les exigences de sécurité » passe.

L'instrument juridique n'est cherché que dans les 60 premiers caractères, là où
les textes officiels annoncent leur nature. Sans cette ancre, « transition vers
une économie **circulaire** » faisait passer un communiqué pour une circulaire.

### Exclusions

Certains objets ne créent jamais d'obligation HSE et sont écartés quels que
soient les mots-clés : nominations, fixation des salaires, décorations,
ratifications, budget de l'État. Nécessaire parce qu'un mot-clé peut vivre dans
un *nom d'institution* — « portant nomination de M. X au conseil
d'administration de l'Office national de l'**Eau potable** » n'est pas un texte
sur l'eau.

## Sources

12 sources sont collectées, 3 sont inaccessibles et signalées comme telles dans
`data/veille-log.js` plutôt que passées sous silence.

**Collectées :** CNDJ (base juridique structurée : numéro, date de signature,
référence JO), Ministère de l'Environnement, CIAPOL, ONPC, CNPS, Ministère de
l'Emploi, Ministère de l'Énergie, ANARE-CI, Ministère des Transports, portail
gouv.ci, Loidici, SGG Documenthèque.

**À vérifier manuellement :**

| Source | Cause réelle |
|---|---|
| SGG — Journal Officiel | protégé par identifiant ; un code de téléchargement s'obtient auprès du service JO du SGG. **C'est la source la plus complète du dispositif** — l'obtenir est le principal gain possible. |
| ANDE | certificat TLS expiré le 12/12/2024 côté site |
| Présidence | chaîne TLS incomplète + 403 sur les User-Agents de robots |

Ces diagnostics viennent de sondages HTTP réels. Le registre manuel de
juillet 2026 classait la plupart de ces sites en « rendus en JavaScript » :
aucun ne l'était. Trois adresses avaient simplement changé — `ciapol.gouv.ci`
→ `ciapol.ci`, `transport.gouv.ci` → `transport**s**.gouv.ci`, et les portails
`gouv.ci` / `emploi.gouv.ci` servent une page d'intro à la racine, le contenu
vivant sous `/actualites` et `/accueil`.

## Ajouter une source

Dans `sources.mjs`, ajouter une entrée `sourceListe({ … })` au tableau
`SOURCES` :

```js
sourceListe({
  id: 'mon-ministere',
  nom: 'Ministère de …',
  domaine: 'Environnement',
  urls: ['https://…/actualites'],
  filtreUrl: /mondomaine\.ci\/(actualite|document)/i,
}),
```

`filtreUrl` évite de collecter les liens de navigation du site. Une source qui
n'est pas interrogeable se déclare avec `sourceIndisponible({ …, blocage, action })`
pour rester visible dans le journal.

## Ce que le système ne fait pas

Il détecte et classe ; il **n'analyse pas**. Les rubriques « Ce qui change »,
« Obligations » et « Sanctions » restent des gabarits jusqu'à saisie par un
juriste, et le site affiche un avertissement explicite tant que le statut vaut
`a_analyser`. Les champs saisis à la main sont préservés d'un run à l'autre :
la collecte ne réécrit que les champs automatiques.

Le registre ne contient que des entrées **traçables** : toute entrée sans
`sourceRef` est ignorée, ce qui a définitivement écarté les 175 entrées de
démonstration fabriquées que portait `main`.
