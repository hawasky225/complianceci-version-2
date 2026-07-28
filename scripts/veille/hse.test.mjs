/**
 * Tests du classifieur HSE — `node --test scripts/veille/`.
 *
 * Le jeu d'essai mélange volontairement des textes HSE réels (issus du registre
 * de veille manuel de juillet 2026) et des textes voisins qui ne doivent PAS
 * déclencher d'alerte : c'est la précision, pas seulement le rappel, qui rend
 * une veille exploitable — un registre noyé sous les nominations et les lois de
 * finances ne se lit plus.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifier, extraireNumero, extraireDate, qualifier, SEUIL_HSE } from './hse.mjs';
import { parserCndj } from './sources.mjs';
import { texteBrut, decoderEntites, extraireLiens, nettoyerTitre } from './parsers.mjs';

/** Textes qui doivent entrer au registre. */
const RETENIR = [
  "DECRET N° 2026-207 du 15/04/2026, relatif aux mesures générales d'hygiène en milieu de travail",
  "LOI N°2023-900 DU 23 NOVEMBRE 2023 PORTANT CODE DE L'ENVIRONNEMENT",
  "LE CODE DE L'ASSAINISSEMENT ET DU DRAINAGE",
  "PREVENTION D'INCENDIE : LA BRIGADE RAPPELLE LES EXIGENCES DE SECURITE",
  "Arrêté interministériel n° 156 relatif à l'audit énergétique obligatoire",
  "Arrêté portant réglementation du transport de marchandises dangereuses par route",
  "Décret relatif à la déclaration des accidents du travail",
  "Arrêté fixant la liste des déchets dangereux et leurs modalités d'élimination",
  "Décret portant obligation d'étude d'impact environnemental pour les installations classées",
  "Arrêté relatif au port des équipements de protection individuelle sur les chantiers",
];

/** Textes voisins qui ne doivent PAS entrer au registre. */
const ECARTER = [
  "ORDONNANCE N° 2026-265 portant dissolution de la Commission Électorale Indépendante",
  "Décret portant nomination des membres du Gouvernement",
  "Loi portant Budget de l'Etat pour l'Année 2014",
  "Arrêté fixant le taux de la TVA sur les produits importés",
  "Loi portant organisation du Système Statistique National",
  "Décret portant création d'un Fonds souverain stratégique",
];

test('retient les textes HSE', () => {
  for (const titre of RETENIR) {
    const c = classifier(titre, '');
    assert.equal(c.retenu, true, `aurait dû être retenu (score ${c.score}) : ${titre}`);
    assert.equal(c.impacts.impactHSE, true, `impactHSE manquant : ${titre}`);
    assert.ok(c.motsCles.length > 0, `aucun mot-clé remonté : ${titre}`);
  }
});

test('écarte les textes non-HSE', () => {
  for (const titre of ECARTER) {
    const c = classifier(titre, '');
    assert.equal(c.retenu, false, `n'aurait pas dû être retenu (score ${c.score}, ` +
      `mots-clés ${c.motsCles.join('/')}) : ${titre}`);
    assert.equal(c.impacts.impactHSE, false);
  }
});

test("l'hygiène en milieu de travail relève bien du HSE, pas seulement du Travail", () => {
  // Régression : l'ancien classifieur s'arrêtait à la première règle (« travail »)
  // et sortait impactHSE = false sur ce décret, pourtant central en SST.
  const c = classifier(
    "DECRET N° 2026-207 relatif aux mesures générales d'hygiène en milieu de travail", ''
  );
  assert.equal(c.impactHSE ?? c.impacts.impactHSE, true);
  assert.equal(c.domaine, 'SST / Travail');
  assert.ok(c.impacts.impactRH, 'doit aussi porter un impact RH');
});

test('un mot générique seul ne suffit pas à déclencher une alerte', () => {
  // « sécurité » sans contexte HSE : sécurité sociale, sécurité intérieure…
  const c = classifier('Loi relative à la sécurité des institutions', '');
  assert.equal(c.retenu, false, `score ${c.score} — la famille générique seule doit rester sous le seuil`);
});

test('le titre pèse plus que l\'extrait', () => {
  const dansTitre = classifier('Arrêté relatif aux déchets dangereux', '');
  const dansExtrait = classifier('Arrêté n° 12 portant diverses mesures', 'gestion des déchets dangereux');
  assert.ok(
    dansTitre.score > dansExtrait.score,
    `titre ${dansTitre.score} devrait dépasser extrait ${dansExtrait.score}`
  );
});

test('le seuil est cohérent avec les poids déclarés', () => {
  // Une seule famille spécifique trouvée dans un titre (poids 3 × 2 = 6)
  // doit suffire ; trouvée seulement dans l'extrait (3) doit suffire aussi.
  assert.ok(SEUIL_HSE <= 3, 'le seuil doit rester atteignable par une famille spécifique');
});

test('distingue texte réglementaire, acte administratif et signal', () => {
  assert.equal(qualifier('DECRET N° 2026-207 relatif à l\'hygiène'), 'texte');
  assert.equal(qualifier("LOI PORTANT CODE DE L'ENVIRONNEMENT"), 'texte');
  assert.equal(qualifier('SUCAF-CI : LE MINISTRE ANNONCE UNE MISE EN DEMEURE'), 'acte');
  assert.equal(qualifier('CERTIFICAT DE SECURITE INCENDIE : L\'ONPC SENSIBILISE'), 'acte');
  assert.equal(qualifier("ACCES A L'EAU POTABLE : DE BOUNA A AGBOVILLE"), 'signal');
});

test('les communiqués de presse sans portée normative sont écartés', () => {
  // Constat sur un run réel : gouv.ci/actualites remontait ~178 « alertes »,
  // en grande majorité des inaugurations et séminaires.
  const bruit = [
    "ACCES A L'EAU POTABLE : DE BOUNA A AGBOVILLE, UNE MÊME AMBITION",
    "INSERTION PROFESSIONNELLE DES JEUNES : LES MIGRANTS DE RETOUR PRIS EN COMPTE",
    "DIASPORA : MILAN MOBILISE PLUS DE 600 PARTICIPANTS AUTOUR DU ROADSHOW",
    "AFFECTATION ET ORIENTATION : LE GOUVERNEMENT RÉAFFIRME SA VOLONTÉ",
    "FORUM AFRICAIN DE L’EAU : AMÉDÉ KOUAKOU RÉAFFIRME LES EFFORTS CONSENTIS",
  ];
  for (const titre of bruit) {
    assert.equal(classifier(titre, '').retenu, false, `bruit retenu à tort : ${titre}`);
  }
});

test('un acte administratif contraignant reste retenu', () => {
  // Présent dans le registre manuel de juillet 2026 : à conserver.
  const c = classifier(
    'FERKESSEDOUGOU / SUCAF-CI : LE MINISTRE ABOU BAMBA ANNONCE UNE MISE EN DEMEURE POUR POLLUTION', ''
  );
  assert.equal(c.retenu, true);
  assert.equal(c.type, 'acte');
});

test("un instrument juridique n'est reconnu qu'en tête de titre", () => {
  // « transition vers une économie circulaire » faisait qualifier un
  // communiqué de presse en « Circulaire ».
  const c = classifier(
    'LUTTE CONTRE LA POLLUTION PLASTIQUE : LE GOUVERNEMENT VEUT ACCÉLÉRER ' +
    "LA TRANSITION VERS UNE ÉCONOMIE CIRCULAIRE", ''
  );
  assert.notEqual(c.type, 'texte', 'ne doit pas être pris pour un texte réglementaire');
  assert.notEqual(c.nature, 'Circulaire');
  // Les vrais textes restent correctement qualifiés.
  assert.equal(classifier('DECRET N° 2026-207 relatif à l\'hygiène en milieu de travail', '').nature, 'Décret');
  assert.equal(classifier("LE CODE DE L'ASSAINISSEMENT ET DU DRAINAGE", '').type, 'texte');
});

test('un mot-clé figurant dans un nom d\'institution ne déclenche pas d\'alerte', () => {
  // Cas réels remontés par un run : le mot-clé est dans la raison sociale ou
  // dans un détail incident, pas dans l'objet du texte.
  const faux = [
    "DECRET N° 2026-181 du 02/04/2026, portant nomination de M. DIAKITE Coty Souleymane, " +
      "représentant du Président de la République au sein du Conseil d'administration de " +
      "la société d'État dénommée Office national de l'Eau potable",
    "ARRETE INTERMINISTERIEL N° 0021 MT MFB du 14/08/2025, portant fixation des salaires, " +
      "indemnités et autres avantages du personnel impliqué dans la mise en œuvre du projet " +
      "« Intégration de la mobilité électrique avec les énergies renouvelables »",
    "Decoration des Travailleurs de l'IPS-CNPS",
  ];
  for (const titre of faux) {
    assert.equal(classifier(titre, '').retenu, false, `faux positif : ${titre.slice(0, 60)}…`);
  }
});

test('un mot-clé présent seulement dans l\'extrait ne suffit pas', () => {
  // « Buldget de loi 2025 » était retenu via des mots croisés dans le contexte
  // de la page, pas dans le texte lui-même.
  const c = classifier('Buldget de loi 2025', 'protection sociale cnps cotisations');
  assert.equal(c.retenu, false);
});

test('les préfixes de rubrique et dates des portails sont retirés du titre', () => {
  assert.equal(
    nettoyerTitre('Société LUTTE CONTRE LA POLLUTION PLASTIQUE : LE GOUVERNEMENT ACCÉLÈRE'),
    'LUTTE CONTRE LA POLLUTION PLASTIQUE : LE GOUVERNEMENT ACCÉLÈRE'
  );
  assert.equal(
    nettoyerTitre('PROTECTION CIVILE : LES DISPOSITIFS lundi 19 juillet 2026'),
    'PROTECTION CIVILE : LES DISPOSITIFS'
  );
  // Un titre qui commence par un mot de rubrique sans titre derrière est laissé tel quel.
  assert.equal(nettoyerTitre('Environnement et développement durable'),
    'Environnement et développement durable');
});

test('extraction du numéro et de la date', () => {
  assert.equal(extraireNumero('DECRET N° 2026-207 du 15/04/2026'), '2026-207');
  assert.equal(extraireNumero('LOI N°2023-900 DU 23 NOVEMBRE 2023'), '2023-900');
  // Un numéro suivi d'un sigle et non de chiffres n'est pas reconnu : mieux
  // vaut un champ vide qu'un numéro tronqué dans le registre.
  assert.equal(extraireNumero('Arrêté n°156/MMPE'), null);
  assert.equal(extraireNumero('Communiqué sans numéro'), null);
  assert.equal(extraireDate('DECRET du 15/04/2026'), '2026-04-15');
  assert.equal(extraireDate('publié le 23 novembre 2023'), '2023-11-23');
  assert.equal(extraireDate('aucune date ici'), null);
});

test('décodage HTML et extraction de texte', () => {
  assert.equal(decoderEntites("l&#039;environnement"), "l'environnement");
  assert.equal(decoderEntites('S&eacute;curit&eacute;'), 'Sécurité');
  assert.equal(texteBrut('<script>alert(1)</script><p>Hygi&egrave;ne</p>'), 'Hygiène');
});

test('les liens trop courts ou non-documentaires sont ignorés', () => {
  const html = `
    <a href="/actualite/616">Mise en demeure pour pollution industrielle</a>
    <a href="/x">ok</a>
    <a href="style.css">feuille de style ignorée</a>
    <a href="javascript:void(0)">Un libellé assez long pour passer</a>`;
  const liens = extraireLiens(html, 'https://exemple.ci/');
  assert.equal(liens.length, 1);
  assert.match(liens[0].url, /\/actualite\/616$/);
});

test('parsing d\'une fiche CNDJ', () => {
  const html = `
  <div class="card result-card" >
    <a href="https://biblio.cndj.ci/search/textes/72444?type=1">DECRET N° 2026-207 du 15/04/2026, relatif aux mesures g&eacute;n&eacute;rales d'hygi&egrave;ne en milieu de travail..</a>
    <ul>
      <li><span>Numéro</span>2026-207</li>
      <li><span>Date signature</span>15/04/2026</li>
      <li><span>Journal officiel</span>N° 10 Spécial du 20/05/2026 ; P.239</li>
    </ul>
  </div>`;
  const [rec] = parserCndj(html, 'Décret');
  assert.equal(rec.sourceRef, 'cndj:72444');
  assert.equal(rec.numero, '2026-207');
  assert.equal(rec.date, '2026-04-15');
  assert.match(rec.titre, /hygiène en milieu de travail$/); // le « .. » de troncature est retiré
  assert.equal(rec.nature, 'Décret');
  assert.ok(classifier(rec.titre, rec.extrait).retenu);
});
