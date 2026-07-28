/**
 * Registre des sources officielles de la veille HSE Côte d'Ivoire.
 *
 * Chaque source expose :
 *   id, nom, domaine, url        — identité et rubrique du registre
 *   type: 'liste' | 'indisponible'
 *   collecter(ctx)               — retourne des enregistrements bruts
 *   blocage                      — pour les sources indisponibles : la raison
 *
 * Les verdicts d'accessibilité ci-dessous ont été établis par sondage HTTP réel
 * (juillet 2026), et non repris du registre manuel : plusieurs sources y étaient
 * classées « rendues en JavaScript » alors qu'elles sont en réalité servies
 * côté serveur (SGG), gardées par mot de passe, ou hébergées sur un domaine
 * différent de celui testé (CIAPOL, Transports).
 */
import { recupererHtml, pause, DELAI_MS } from './fetcher.mjs';
import {
  texteBrut, extraireLiens, nettoyer, nettoyerTitre, extraitAutour, dedupliquer,
  resoudreUrl,
} from './parsers.mjs';
import { extraireDate } from './hse.mjs';

/* ------------------------------------------------------------------ *
 * Source structurée : CNDJ — la seule base juridique réellement
 * indexée, avec numéro, date de signature et référence Journal Officiel.
 * ------------------------------------------------------------------ */

const CNDJ_BASE = 'https://biblio.cndj.ci';

const CNDJ_NATURES = [
  { code: 8, label: 'Loi' },
  { code: 12, label: 'Ordonnance' },
  { code: 6, label: 'Décret' },
  { code: 9, label: 'Arrêté' },
  { code: 11, label: 'Arrêté interministériel' },
  { code: 18, label: 'Circulaire' },
];

/** Parse une page de résultats CNDJ en enregistrements bruts. */
export function parserCndj(html, natureLabel) {
  const out = [];
  const cartes = html.split(/<div class="card result-card"/i).slice(1);
  for (const carte of cartes) {
    const lien = /href="([^"]*\/search\/textes\/(\d+)\?type=1)"/i.exec(carte);
    if (!lien) continue;
    const titreM = /\/search\/textes\/\d+\?type=1"[^>]*>([\s\S]*?)<\/a>/i.exec(carte);
    const numM = /<span>\s*Num[ée]ro\s*<\/span>([\s\S]*?)<\/li>/i.exec(carte);
    const dateM = /<span>\s*Date signature\s*<\/span>([\s\S]*?)<\/li>/i.exec(carte);
    const joM = /<span>\s*Journal officiel\s*<\/span>([\s\S]*?)<\/li>/i.exec(carte);

    const titre = nettoyer(titreM && titreM[1]);
    const numero = nettoyer(numM && numM[1]);
    if (!titre && !numero) continue;

    out.push({
      sourceRef: `cndj:${lien[2]}`,
      url: resoudreUrl(lien[1], CNDJ_BASE),
      titre,
      numero: numero || null,
      nature: natureLabel,
      date: extraireDate(nettoyer(dateM && dateM[1])),
      joReference: nettoyer(joM && joM[1]) || null,
      extrait: titre,
    });
  }
  return out;
}

const sourceCndj = {
  id: 'cndj',
  nom: 'CNDJ — Bibliothèque juridique',
  domaine: 'Transversal',
  url: `${CNDJ_BASE}/search/textes?type=1`,
  type: 'liste',
  prioritaire: true,
  async collecter({ pages = 2, journal }) {
    const records = [];
    for (const nature of CNDJ_NATURES) {
      for (let page = 1; page <= pages; page++) {
        const url =
          `${CNDJ_BASE}/search/textes?type=1&nature=${nature.code}` +
          (page > 1 ? `&page=${page}` : '');
        const res = await recupererHtml(url);
        if (!res.ok) {
          journal(`CNDJ ${nature.label} p${page} : ${res.erreur}`);
          break;
        }
        const lignes = parserCndj(res.html, nature.label);
        if (!lignes.length) break; // plus de page pour cette nature
        records.push(...lignes);
        await pause(DELAI_MS);
      }
    }
    return records;
  },
};

/* ------------------------------------------------------------------ *
 * Sources « flux » : sites institutionnels dont on lit la page
 * d'actualités / de publications et dont on extrait les liens.
 * ------------------------------------------------------------------ */

/**
 * Fabrique une source générique « liste de liens ».
 *
 * @param {object} cfg
 * @param {string[]} cfg.urls        pages à balayer
 * @param {RegExp} [cfg.filtreUrl]   ne garder que les liens correspondants
 */
function sourceListe(cfg) {
  return {
    id: cfg.id,
    nom: cfg.nom,
    domaine: cfg.domaine,
    url: cfg.urls[0],
    type: 'liste',
    async collecter({ journal }) {
      const records = [];
      for (const url of cfg.urls) {
        const res = await recupererHtml(url);
        if (!res.ok) {
          journal(`${cfg.nom} : ${res.erreur} sur ${url}`);
          continue;
        }
        const texte = texteBrut(res.html);
        let liens = extraireLiens(res.html, url);
        if (cfg.filtreUrl) liens = liens.filter((l) => cfg.filtreUrl.test(l.url));

        for (const lien of liens) {
          const titre = nettoyerTitre(lien.libelle);
          if (titre.length < 12) continue;
          records.push({
            sourceRef: `${cfg.id}:${lien.url}`,
            url: lien.url,
            titre,
            numero: null,
            nature: null,
            // La date est cherchée dans le libellé complet : les portails la
            // placent après le titre, là où `nettoyerTitre` vient de la retirer.
            date: extraireDate(lien.libelle),
            joReference: null,
            extrait: extraitAutour(texte, lien.libelle),
          });
        }
        await pause(DELAI_MS);
      }
      return dedupliquer(records, (r) => r.sourceRef);
    },
  };
}

/**
 * Source indisponible : jamais interrogée, toujours reportée dans le log du
 * run avec sa raison et l'action manuelle attendue.
 */
function sourceIndisponible(cfg) {
  return { ...cfg, type: 'indisponible' };
}

export const SOURCES = [
  sourceCndj,

  sourceListe({
    id: 'environnement',
    nom: "Ministère de l'Environnement et de la Transition Écologique",
    domaine: 'Environnement',
    urls: [
      'https://www.environnement.gouv.ci/actualites',
      'https://www.environnement.gouv.ci/',
    ],
    filtreUrl: /environnement\.gouv\.ci\/(actualite|publication|uploads)/i,
  }),

  sourceListe({
    id: 'ciapol',
    nom: 'CIAPOL — Centre Ivoirien Antipollution',
    domaine: 'Environnement',
    // ciapol.gouv.ci ne résout plus ; le site vit sur ciapol.ci.
    urls: ['https://ciapol.ci/'],
    filtreUrl: /ciapol\.ci\/(?!wp-|category|tag|author)/i,
  }),

  sourceListe({
    id: 'onpc',
    nom: 'ONPC — Office National de la Protection Civile',
    domaine: 'Incendie / Sécurité',
    urls: ['https://www.onpc-ci.org/actualite', 'https://www.onpc-ci.org/'],
    filtreUrl: /onpc-ci\.org\/(actualite|communique|storage)/i,
  }),

  sourceListe({
    id: 'cnps',
    nom: 'CNPS — Caisse Nationale de Prévoyance Sociale',
    domaine: 'Social / CNPS',
    urls: ['https://www.cnps.ci/'],
    filtreUrl: /cnps\.ci\//i,
  }),

  sourceListe({
    id: 'emploi',
    nom: "Ministère de l'Emploi et de la Protection Sociale",
    domaine: 'SST / Travail',
    // La racine sert une page d'intro ; le contenu est sous /accueil.
    urls: ['https://www.emploi.gouv.ci/accueil'],
    filtreUrl: /emploi\.gouv\.ci\//i,
  }),

  sourceListe({
    id: 'energie',
    nom: 'Ministère des Mines, du Pétrole et de l\'Énergie',
    domaine: 'Énergie',
    urls: [
      'https://www.energie.gouv.ci/energie/textes-et-lois',
      'https://www.energie.gouv.ci/actualites',
    ],
    filtreUrl: /energie\.gouv\.ci\/(document|actualite|energie)/i,
  }),

  sourceListe({
    id: 'anare',
    nom: 'ANARE-CI — Régulation du secteur électricité',
    domaine: 'Énergie',
    urls: [
      'https://anare.ci/documents/lois-et-reglementation/les-decrets/',
      'https://anare.ci/',
    ],
    filtreUrl: /anare\.ci\//i,
  }),

  sourceListe({
    id: 'transports',
    nom: 'Ministère des Transports',
    domaine: 'Transport / TMD',
    // transport.gouv.ci (singulier) ne résout plus ; le site est au pluriel.
    urls: ['https://transports.gouv.ci/'],
    filtreUrl: /transports\.gouv\.ci\//i,
  }),

  sourceListe({
    id: 'gouv',
    nom: 'Portail officiel du Gouvernement',
    domaine: 'Transversal',
    // La racine sert une page d'intro ; le flux est sous /actualites.
    urls: ['https://www.gouv.ci/actualites'],
    filtreUrl: /gouv\.ci\/(actualite|publication|document)/i,
  }),

  sourceListe({
    id: 'loidici',
    nom: 'Loidici — veille juridique ivoirienne',
    domaine: 'Transversal',
    urls: ['https://loidici.biz/'],
    filtreUrl: /loidici\.biz\/\d{4}\//i,
  }),

  sourceListe({
    id: 'sgg-documentheque',
    nom: 'SGG — Documenthèque',
    domaine: 'Transversal',
    urls: ['https://www.sgg.gouv.ci/documentheque.php?id_cas=2'],
    filtreUrl: /sgg\.gouv\.ci\/(documentheque|doc)/i,
  }),

  sourceIndisponible({
    id: 'sgg-jo',
    nom: 'SGG — Journal Officiel',
    domaine: 'Transversal',
    url: 'https://www.sgg.gouv.ci/jo.php',
    blocage:
      "Page servie normalement mais protégée par identifiant : la consultation " +
      "du JO exige un code de téléchargement délivré par le service JO du SGG " +
      "(+225 20 32 59 66). Ce n'est pas un blocage technique.",
    action:
      "Obtenir un compte JO auprès du SGG, puis ajouter l'authentification à " +
      "cette source. C'est la source la plus complète du dispositif.",
  }),

  sourceIndisponible({
    id: 'ande',
    nom: 'ANDE — Agence Nationale De l\'Environnement',
    domaine: 'Environnement',
    url: 'https://ande-ci.com/',
    blocage:
      'Certificat TLS du site expiré le 12/12/2024 : toute connexion HTTPS ' +
      'vérifiée échoue. Le contenu est servi normalement une fois la ' +
      'vérification désactivée, ce que la veille ne fait pas volontairement.',
    action:
      "Signaler l'expiration à l'ANDE. À défaut, consultation manuelle.",
  }),

  sourceIndisponible({
    id: 'presidence',
    nom: 'Présidence — communiqués du Conseil des ministres',
    domaine: 'Transversal',
    url: 'https://www.presidence.ci/communiques-ministres/',
    blocage:
      'Chaîne TLS incomplète (certificat intermédiaire absent) : les clients ' +
      'stricts refusent la connexion. Le site répond par ailleurs 403 aux ' +
      'User-Agents identifiés comme robots.',
    action:
      'Les décisions du Conseil des ministres restent captées via le portail ' +
      'gouv.ci/actualites, qui les relaie.',
  }),
];

export const SOURCES_ACTIVES = SOURCES.filter((s) => s.type === 'liste');
export const SOURCES_BLOQUEES = SOURCES.filter((s) => s.type === 'indisponible');
