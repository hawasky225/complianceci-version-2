/**
 * Outils de parsing HTML partagés, sans dépendance.
 *
 * Les sites visés vont du WordPress moderne au PHP de 2008 encodé en
 * ISO-8859-1 : on reste volontairement sur des expressions régulières
 * tolérantes plutôt que sur un parseur DOM strict.
 */

const ENTITES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë', agrave: 'à', acirc: 'â',
  ccedil: 'ç', ocirc: 'ô', ouml: 'ö', ugrave: 'ù', ucirc: 'û', icirc: 'î',
  iuml: 'ï', laquo: '«', raquo: '»', deg: '°', euro: '€', rsquo: '’',
  ndash: '–', mdash: '—', hellip: '…', Eacute: 'É', Egrave: 'È', Agrave: 'À',
  Ccedil: 'Ç',
};

/** Décode les entités HTML nommées et numériques. */
export function decoderEntites(s) {
  return (s || '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, nom) => (nom in ENTITES ? ENTITES[nom] : m));
}

/** Retire scripts, styles et balises, et normalise les espaces. */
export function texteBrut(html) {
  return decoderEntites(
    (html || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/�/g, '') // caractères issus d'un mauvais encodage
    .replace(/\s+/g, ' ')
    .trim();
}

/** Nettoie un libellé court (titre de lien, etc.). */
export function nettoyer(s) {
  return texteBrut(s).replace(/\.{2,}$/, '').trim();
}

/** Résout une URL éventuellement relative contre une base. */
export function resoudreUrl(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

/**
 * Extrait tous les liens d'une page sous forme { url, libelle }.
 *
 * Les liens sans libellé exploitable (icônes, ancres vides) sont ignorés.
 */
export function extraireLiens(html, base) {
  const liens = [];
  const re = /<a\b[^>]*href\s*=\s*["']([^"'#][^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const url = resoudreUrl(m[1], base);
    const libelle = nettoyer(m[2]);
    if (!url || libelle.length < 12) continue;
    if (/^(javascript|mailto|tel):/i.test(m[1])) continue;
    if (/\.(css|js|png|jpe?g|gif|svg|ico|woff2?)($|\?)/i.test(url)) continue;
    liens.push({ url, libelle });
  }
  return liens;
}

/**
 * Construit un extrait de ~300 caractères autour du libellé dans la page,
 * pour reproduire la colonne « Extrait 300 car. » du registre de veille.
 */
export function extraitAutour(texte, ancre, longueur = 300) {
  const t = texte || '';
  if (!t) return '';
  // On démarre AU titre, pas avant : reculer faisait déborder l'extrait sur
  // l'article précédent du flux et le faisait commencer en milieu de mot.
  const i = ancre ? t.indexOf(ancre) : -1;
  const debut = i >= 0 ? i : 0;
  let extrait = t.slice(debut, debut + longueur).trim();
  // Couper sur la dernière frontière de mot plutôt qu'en plein milieu.
  if (t.length > debut + longueur) {
    const coupe = extrait.lastIndexOf(' ');
    if (coupe > longueur * 0.6) extrait = extrait.slice(0, coupe) + '…';
  }
  return extrait;
}

/**
 * Retire le libellé de rubrique que certains portails collent devant le titre
 * dans le texte du lien (« Société LUTTE CONTRE LA POLLUTION… »), ainsi que la
 * date en toutes lettres accrochée en fin de libellé.
 */
const RUBRIQUES =
  /^(D[ée]veloppement\s+Durable|Soci[ée]t[ée]|[ÉE]conomie|[ÉE]ducation|Sant[ée]|Diplomatie|Environnement|Politique|Sport|Culture|Agriculture|S[ée]curit[ée]|Transport|Infrastructures)\s+(?=[A-ZÉÈÀÂÇÔÎ]{2,})/;

const DATE_FINALE =
  /\s+(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\s+\d{1,2}\s+\p{L}+\s+\d{4}\s*$/iu;

export function nettoyerTitre(titre) {
  return (titre || '').replace(RUBRIQUES, '').replace(DATE_FINALE, '').trim();
}

/** Déduplique une liste d'objets sur une clé calculée. */
export function dedupliquer(items, cle) {
  const vus = new Set();
  const sortie = [];
  for (const item of items) {
    const k = cle(item);
    if (!k || vus.has(k)) continue;
    vus.add(k);
    sortie.push(item);
  }
  return sortie;
}
