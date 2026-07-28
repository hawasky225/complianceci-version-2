/**
 * Taxonomie HSE et classification des textes réglementaires ivoiriens.
 *
 * Un texte est retenu par la veille s'il atteint un score HSE minimal. Le score
 * est la somme des poids des familles de mots-clés trouvées dans le titre et
 * l'extrait : une famille très spécifique (« équipement de protection
 * individuelle ») pèse plus qu'une famille générique (« sécurité »), qui seule
 * ne suffit pas à déclencher une alerte.
 *
 * Contrairement à un classement par première règle gagnante, TOUTES les
 * familles sont évaluées : un décret « relatif aux mesures générales d'hygiène
 * en milieu de travail » relève à la fois de la SST et de l'hygiène, et doit
 * ressortir avec impactHSE = true — pas seulement « Travail ».
 */

/** Minuscules sans accents ni apostrophes typographiques. */
export const norm = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`´]/g, "'");

/**
 * Compile un mot-clé en expression tolérante aux variantes d'écriture.
 *
 * Les textes officiels alternent singulier et pluriel (« accident du travail »
 * / « accidents du travail »), l'espace et le trait d'union (« marchandises
 * dangereuses » / « marchandises-dangereuses »). Plutôt que d'énumérer chaque
 * variante dans les listes ci-dessous, on l'absorbe ici. Les bornes évitent que
 * « eau » ne matche « eaux usées » par accident de sous-chaîne — ou « bale »
 * dans « emballage ».
 */
const cacheRegex = new Map();

function regexMotCle(mot) {
  let re = cacheRegex.get(mot);
  if (re) return re;
  const motif = norm(mot)
    .split(/\s+/)
    .map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[sx]?')
    .join('[\\s\\-]+');
  re = new RegExp(`(?<![a-z0-9])${motif}(?![a-z0-9])`);
  cacheRegex.set(mot, re);
  return re;
}

/** Le mot-clé figure-t-il dans le texte (déjà normalisé) ? */
const contient = (texteNorme, mot) => regexMotCle(mot).test(texteNorme);

/**
 * Familles de mots-clés HSE.
 *
 * - `poids` : contribution au score HSE. 3 = quasi certain, 2 = fort,
 *   1 = indice à confirmer par une autre famille.
 * - `domaine` : rubrique du registre de veille (colonne « Domaine »).
 * - `impacts` : drapeaux du schéma d'affichage du site.
 */
export const FAMILLES = [
  {
    id: 'sst',
    domaine: 'SST / Travail',
    poids: 3,
    impacts: ['impactHSE', 'impactRH'],
    motsCles: [
      'sante et securite au travail', 'securite et sante au travail',
      'sante au travail', 'securite au travail', 'medecine du travail',
      'medecin du travail', 'hygiene en milieu de travail',
      'hygiene et securite', 'accident du travail', 'maladie professionnelle',
      'equipement de protection individuelle', 'protection individuelle',
      'comite de securite', 'chsct', 'risque professionnel',
      'penibilite', 'inspection du travail', 'travail en hauteur',
      'espace confine', 'exposition professionnelle', 'bruit au travail',
      'amiante', 'silice', 'ergonomie',
    ],
  },
  {
    id: 'environnement',
    domaine: 'Environnement',
    poids: 3,
    impacts: ['impactHSE'],
    motsCles: [
      'code de l\'environnement', 'protection de l\'environnement',
      'etude d\'impact environnemental', 'impact environnemental',
      'etude d\'impact', 'audit environnemental', 'installation classee',
      'icpe', 'pollution', 'polluant', 'depollution', 'antipollution',
      'rejet', 'effluent', 'emission atmospherique', 'qualite de l\'air',
      'nuisance', 'biodiversite', 'aire protegee', 'zone humide',
      'changement climatique', 'gaz a effet de serre', 'reboisement',
      'deforestation', 'littoral', 'mangrove',
    ],
  },
  {
    id: 'dechets',
    domaine: 'Déchets',
    poids: 3,
    impacts: ['impactHSE'],
    motsCles: [
      'dechet', 'dechets dangereux', 'dechets industriels',
      'dechets biomedicaux', 'dechets electroniques', 'deee',
      'gestion des dechets', 'elimination des dechets', 'decharge',
      'enfouissement', 'recyclage', 'valorisation des dechets',
      'mouvement transfrontiere', 'bale',
    ],
  },
  {
    id: 'eau',
    domaine: 'Eau / Assainissement',
    poids: 3,
    impacts: ['impactHSE'],
    motsCles: [
      'code de l\'eau', 'assainissement', 'drainage', 'eaux usees',
      'eaux pluviales', 'ressource en eau', 'eau potable',
      'perimetre de protection', 'station d\'epuration', 'boues',
      'pollution des eaux', 'nappe phreatique',
    ],
  },
  {
    id: 'incendie',
    domaine: 'Incendie / Sécurité',
    poids: 3,
    impacts: ['impactHSE'],
    motsCles: [
      'securite incendie', 'prevention incendie', 'incendie',
      'certificat de securite', 'etablissement recevant du public',
      'protection civile', 'onpc', 'evacuation', 'extincteur',
      'plan d\'urgence', 'plan orsec', 'secourisme', 'premiers secours',
      'issue de secours', 'desenfumage',
    ],
  },
  {
    id: 'chimique',
    domaine: 'Produits dangereux',
    poids: 3,
    impacts: ['impactHSE'],
    motsCles: [
      'produit chimique', 'substance dangereuse', 'produit dangereux',
      'matiere dangereuse', 'phytosanitaire', 'pesticide',
      'fiche de donnees de securite', 'etiquetage', 'sgh',
      'stockage de produits', 'gaz industriel', 'explosif',
      'radioprotection', 'source radioactive', 'ionisant',
      'mercure', 'plomb', 'cyanure', 'polluant organique persistant',
    ],
  },
  {
    id: 'tmd',
    domaine: 'Transport / TMD',
    poids: 3,
    impacts: ['impactHSE'],
    motsCles: [
      'marchandises dangereuses', 'transport de matieres dangereuses',
      'transport routier de marchandises', 'adr',
      'citerne', 'hydrocarbure en vrac',
    ],
  },
  {
    id: 'mines',
    domaine: 'Mines / Carrières',
    poids: 2,
    impacts: ['impactHSE'],
    motsCles: [
      'code minier', 'exploitation miniere', 'carriere', 'orpaillage',
      'rehabilitation des sites', 'sante et securite miniere',
      'tailings', 'residus miniers',
    ],
  },
  {
    id: 'energie',
    domaine: 'Énergie',
    poids: 2,
    impacts: ['impactHSE'],
    motsCles: [
      'audit energetique', 'efficacite energetique', 'maitrise de l\'energie',
      'energie renouvelable', 'installation electrique',
      'securite electrique', 'haute tension', 'raffinage',
      'stockage d\'hydrocarbures', 'station-service',
    ],
  },
  {
    id: 'social',
    domaine: 'Social / CNPS',
    poids: 2,
    impacts: ['impactHSE', 'impactRH'],
    motsCles: [
      'cnps', 'prevention des risques professionnels',
      'reparation des accidents', 'at-mp', 'visite medicale',
      'aptitude au poste', 'declaration d\'accident',
    ],
  },
  {
    id: 'generique',
    domaine: 'Transversal',
    poids: 1,
    impacts: ['impactHSE'],
    motsCles: [
      'securite', 'hygiene', 'salubrite', 'sanitaire', 'risque',
      'prevention', 'environnement', 'protection', 'urgence',
      'danger', 'contamination', 'toxique',
    ],
  },
];

/** Nature juridique du texte, déduite du titre. */
const NATURES = [
  [/\bordonnance\b/i, 'Ordonnance'],
  [/\barrete\s+interministeriel\b/i, 'Arrêté interministériel'],
  [/\barrete\b/i, 'Arrêté'],
  [/\bdecret\b/i, 'Décret'],
  [/\bcirculaire\b/i, 'Circulaire'],
  [/\bloi\b/i, 'Loi'],
  [/\bcode\b/i, 'Code'],
];

/** Score minimal pour qu'un texte réglementaire entre au registre. */
export const SEUIL_HSE = 3;

/**
 * Score minimal pour qu'une simple actualité entre au registre.
 *
 * Fixé au-dessus de ce que rapporte une seule famille spécifique trouvée dans
 * un titre (3 × 2 = 6) : une actualité doit donc réunir deux indications
 * convergentes. Les portails institutionnels publient surtout des communiqués,
 * et un registre noyé sous les inaugurations et les séminaires cesse d'être lu.
 * « Accès à l'eau potable à Bouna » ne franchit pas la barre ; « prévention
 * d'incendie : les exigences de sécurité » la franchit.
 */
export const SEUIL_SIGNAL = 7;

/**
 * Marqueurs d'un instrument juridique : le texte crée ou modifie du droit.
 *
 * Cherchés uniquement en TÊTE de titre, là où les textes officiels annoncent
 * leur nature (« DECRET N° 2026-207 du… », « LOI N°2023-900 PORTANT… »).
 * Sans cette ancre, « transition vers une économie circulaire » faisait passer
 * un communiqué de presse pour une circulaire.
 */
const MARQUEURS_TEXTE = [
  /\b(loi|decret|arrete|ordonnance|circulaire|reglement)\b/,
  /\bcode\s+(de|du|des)\b/,
  /\bn[°ºo]\s*\d/,
];

/** Longueur de l'en-tête de titre où l'instrument est cherché. */
const TETE = 60;

/**
 * Marqueurs d'acte administratif contraignant. Une actualité qui les porte a
 * une valeur de veille réelle (une mise en demeure engage l'exploitant), même
 * sans être un texte publié.
 */
const MARQUEURS_ACTE = [
  /\bmise?\s+en\s+demeure\b/,
  /\bentree?\s+en\s+vigueur\b/,
  /\bobligation\b/, /\bobligatoire\b/,
  /\binterdiction\b/, /\binterdit\b/,
  /\bsanction/, /\bamende\b/,
  /\bagrement\b/, /\bautorisation\b/, /\bcertificat\b/,
  /\bhomologation\b/, /\bnorme\b/,
  /\bdelai\s+de\s+mise\s+en\s+conformite\b/,
];

/**
 * Objets de texte qui ne créent jamais d'obligation HSE, quels que soient les
 * mots-clés rencontrés.
 *
 * Nécessaire parce qu'un mot-clé peut apparaître dans un *nom d'institution*
 * plutôt que dans l'objet du texte : « portant nomination de M. X au conseil
 * d'administration de l'Office national de l'Eau potable » déclenchait la
 * famille « eau » alors qu'il s'agit d'une nomination.
 */
const EXCLUSIONS = [
  /\bportant\s+nomination\b/,
  /\bnomination\s+(de|du|des|d')/,
  /\bportant\s+fixation\s+des\s+salaires\b/,
  /\bsalaires?\s*,?\s*indemnites\b/,
  /\bdecoration\s+des\b/,
  /\bportant\s+dissolution\b/,
  /\bbudget\s+de\s+l'?etat\b/,
  /\bportant\s+ratification\b/,
];

/** Le texte porte-t-il sur un objet exclu d'office ? */
export const estExclu = (titre) => EXCLUSIONS.some((re) => re.test(norm(titre)));

/**
 * Qualifie la nature de l'entrée.
 * @returns {'texte'|'acte'|'signal'}
 */
export function qualifier(titre, extrait = '') {
  const t = norm(titre);
  if (MARQUEURS_TEXTE.some((re) => re.test(t.slice(0, TETE)))) return 'texte';
  if (MARQUEURS_ACTE.some((re) => re.test(t))) return 'acte';
  // Un marqueur d'acte dans l'extrait seul reste un signal faible.
  if (MARQUEURS_ACTE.some((re) => re.test(norm(extrait)))) return 'acte';
  return 'signal';
}

/**
 * Classe un texte à partir de son titre et de son extrait.
 *
 * Le titre pèse double : « déchets » dans un titre est bien plus significatif
 * que le même mot croisé au détour d'un article de presse.
 *
 * @returns {{score:number, retenu:boolean, domaine:string, domaines:string[],
 *            motsCles:string[], nature:string|null, impacts:Object}}
 */
export function classifier(titre, extrait = '') {
  const t = norm(titre);
  const e = norm(extrait);
  const touches = [];
  const motsCles = new Set();
  let score = 0;

  for (const famille of FAMILLES) {
    let poidsFamille = 0;
    let dansTitreFamille = false;
    for (const mot of famille.motsCles) {
      const dansTitre = contient(t, mot);
      const dansExtrait = contient(e, mot);
      if (!dansTitre && !dansExtrait) continue;
      motsCles.add(mot);
      if (dansTitre) dansTitreFamille = true;
      // Une famille ne compte qu'une fois, au meilleur emplacement trouvé.
      poidsFamille = Math.max(poidsFamille, dansTitre ? famille.poids * 2 : famille.poids);
    }
    if (poidsFamille > 0) {
      score += poidsFamille;
      touches.push({ famille, poidsFamille, dansTitre: dansTitreFamille });
    }
  }

  // La famille « générique » seule ne suffit jamais : « sécurité » apparaît
  // dans « sécurité sociale » comme dans « sécurité intérieure ».
  const specifiques = touches.filter((x) => x.famille.id !== 'generique');

  const type = qualifier(titre, extrait);

  // Le sujet HSE doit figurer dans le TITRE. Un mot-clé croisé uniquement dans
  // l'extrait vient souvent du contexte de la page (menu, article voisin) et
  // non du texte lui-même.
  const sujetDansTitre = specifiques.some((x) => x.dansTitre);

  // Un texte réglementaire ou un acte contraignant passe au seuil normal ; une
  // simple actualité doit franchir une barre plus haute, faute de quoi les
  // portails institutionnels inondent le registre de communiqués sans portée
  // normative.
  const retenu =
    specifiques.length > 0 &&
    sujetDansTitre &&
    !estExclu(titre) &&
    score >= (type === 'signal' ? SEUIL_SIGNAL : SEUIL_HSE);

  // Domaine principal = famille spécifique la plus lourde ; à défaut, Transversal.
  specifiques.sort((a, b) => b.poidsFamille - a.poidsFamille);
  const domaine = specifiques.length ? specifiques[0].famille.domaine : 'Transversal';

  const impacts = {
    impactRH: false,
    impactFiscal: false,
    impactHSE: false,
    impactJuridique: true,
  };
  for (const { famille } of touches) {
    for (const flag of famille.impacts) impacts[flag] = true;
  }
  // Le drapeau HSE ne se lève que si le texte est effectivement retenu.
  impacts.impactHSE = retenu;

  // Comme pour l'instrument, la nature se lit en tête de titre.
  let nature = null;
  const tete = t.slice(0, TETE);
  for (const [re, label] of NATURES) {
    if (re.test(tete)) { nature = label; break; }
  }

  return {
    score,
    retenu,
    type,
    domaine,
    domaines: [...new Set(specifiques.map((x) => x.famille.domaine))],
    motsCles: [...motsCles],
    nature,
    impacts,
  };
}

/** Libellé affichable du type d'entrée. */
export const LIBELLE_TYPE = {
  texte: 'Texte réglementaire',
  acte: 'Acte administratif',
  signal: 'Signal de veille',
};

/** Extrait le numéro du texte (« n° 2026-207 ») s'il figure dans le titre. */
export function extraireNumero(titre) {
  const m = /n[°ºo]\s*([0-9]{2,4}[-/][0-9]{1,4})/i.exec(titre || '');
  return m ? m[1].replace('/', '-') : null;
}

/** Extrait une date jj/mm/aaaa ou « 15 avril 2026 » en ISO. */
const MOIS = {
  janvier: '01', fevrier: '02', mars: '03', avril: '04', mai: '05', juin: '06',
  juillet: '07', aout: '08', septembre: '09', octobre: '10', novembre: '11',
  decembre: '12',
};

export function extraireDate(texte) {
  const t = texte || '';
  const num = /(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(t);
  if (num) {
    const [, j, m, a] = num;
    return `${a}-${m.padStart(2, '0')}-${j.padStart(2, '0')}`;
  }
  const lit = /(\d{1,2})\s+([a-zéûôA-Z]+)\s+(\d{4})/.exec(t);
  if (lit) {
    const mois = MOIS[norm(lit[2])];
    if (mois) return `${lit[3]}-${mois}-${lit[1].padStart(2, '0')}`;
  }
  const iso = /(\d{4})-(\d{2})-(\d{2})/.exec(t);
  return iso ? iso[0] : null;
}
