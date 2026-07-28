/**
 * Orchestrateur de la veille réglementaire HSE.
 *
 * Déroulé d'un run :
 *   1. interroger chaque source active, en isolant les pannes ;
 *   2. classer chaque texte trouvé via la taxonomie HSE, ne retenir que
 *      ceux qui atteignent le seuil ;
 *   3. fusionner avec le registre existant — les textes déjà connus gardent
 *      leur id, leur statut de revue et toute analyse saisie à la main ;
 *   4. écrire data/textes.js, data/veille-log.js et l'export CSV du registre.
 *
 * Idempotent : rejouer un run ne crée pas de doublon, la clé de dédup étant
 * `sourceRef` (identifiant stable par source).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SOURCES_ACTIVES, SOURCES_BLOQUEES } from './sources.mjs';
import { classifier, extraireNumero, LIBELLE_TYPE } from './hse.mjs';
import { expliquerErreur } from './fetcher.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const RACINE = join(__dirname, '..', '..');
const FICHIER_TEXTES = join(RACINE, 'data', 'textes.js');
const FICHIER_LOG = join(RACINE, 'data', 'veille-log.js');
const FICHIER_CSV = join(RACINE, 'data', 'registre-veille.csv');

/* --------------------------- registre existant --------------------------- */

/**
 * Relit le registre déjà publié pour préserver le travail humain.
 *
 * data/textes.js est un module ES ; on l'importe dynamiquement plutôt que de
 * le parser, ce qui reste correct tant que le fichier est généré par ce script.
 */
async function lireRegistreExistant() {
  if (!existsSync(FICHIER_TEXTES)) return [];
  try {
    const mod = await import(`file://${FICHIER_TEXTES}?t=${Date.now()}`);
    return Array.isArray(mod.textesEnrichis) ? mod.textesEnrichis : [];
  } catch (err) {
    console.warn(`[veille] registre existant illisible (${err.message}) — repart de zéro`);
    return [];
  }
}

/** Champs saisis par un analyste, à ne jamais écraser par une collecte. */
const CHAMPS_MANUELS = [
  'ceQuiChange', 'obligationsPrincipales', 'sanctions', 'statutRevue',
  'badge', 'ministere', 'secteurs', 'commentaire',
];

const PLACEHOLDERS = [
  'à déterminer', 'a determiner', 'analyse en cours',
  'voir le texte officiel', 'à analyser',
];

/** Un champ ne compte comme « saisi à la main » que s'il n'est pas un gabarit. */
function estRenseigne(valeur) {
  if (valeur == null) return false;
  const liste = Array.isArray(valeur) ? valeur : [valeur];
  if (!liste.length) return false;
  return liste.some((v) => {
    const s = String(v).toLowerCase();
    return s.trim() !== '' && !PLACEHOLDERS.some((p) => s.includes(p));
  });
}

/* ------------------------------ collecte ------------------------------ */

/** Interroge toutes les sources actives. Retourne records + lignes de log. */
async function collecterSources({ pages }) {
  const records = [];
  const log = [];

  for (const source of SOURCES_ACTIVES) {
    const incidents = [];
    const journal = (msg) => incidents.push(msg);
    const debut = Date.now();
    let lignes = [];
    let erreur = null;

    try {
      lignes = await source.collecter({ pages, journal });
    } catch (err) {
      erreur = err.message;
    }

    const retenus = [];
    for (const r of lignes) {
      const c = classifier(r.titre, r.extrait);
      if (!c.retenu) continue;
      retenus.push({ ...r, classification: c, sourceId: source.id, sourceNom: source.nom });
    }
    records.push(...retenus);

    const accessible = !erreur && (lignes.length > 0 || incidents.length === 0);
    log.push({
      source: source.nom,
      sourceId: source.id,
      domaine: source.domaine,
      url: source.url,
      statutAcces: accessible ? 'Accessible' : 'Échec',
      liensAnalyses: lignes.length,
      alertesRetenues: retenus.length,
      dureeMs: Date.now() - debut,
      commentaire: erreur
        ? expliquerErreur(erreur)
        : incidents.length
          ? incidents.join(' ; ')
          : `${lignes.length} lien(s) analysé(s), ${retenus.length} retenu(s) après filtre HSE.`,
    });

    console.log(
      `[veille] ${source.id.padEnd(18)} ${String(lignes.length).padStart(4)} lus → ` +
      `${String(retenus.length).padStart(3)} HSE${erreur ? `  ⚠ ${erreur}` : ''}`
    );
  }

  // Les sources bloquées figurent au log avec leur raison, jamais silencieuses.
  for (const s of SOURCES_BLOQUEES) {
    log.push({
      source: s.nom,
      sourceId: s.id,
      domaine: s.domaine,
      url: s.url,
      statutAcces: 'À vérifier manuellement',
      liensAnalyses: 0,
      alertesRetenues: 0,
      dureeMs: 0,
      commentaire: s.blocage,
      action: s.action,
    });
    console.log(`[veille] ${s.id.padEnd(18)}    — bloquée : ${s.blocage.slice(0, 60)}…`);
  }

  return { records, log };
}

/* ------------------------------ fusion ------------------------------ */

/** Transforme un enregistrement collecté en entrée du registre. */
function versEntree(rec, id, aujourdhui) {
  const c = rec.classification;
  return {
    id,
    titre: rec.titre,
    source: rec.sourceNom,
    sourceId: rec.sourceId,
    sourceRef: rec.sourceRef,
    statut: 'En vigueur',
    statutRevue: 'À analyser',
    typeEntree: c.type,
    typeEntreeLibelle: LIBELLE_TYPE[c.type],
    datePublication: rec.date || '',
    dateEntreeVigueur: rec.date || '',
    dateDetection: aujourdhui,
    badge: 'Nouveau',
    ceQuiChange: ['À déterminer — consulter le texte officiel'],
    obligationsPrincipales: ['À déterminer — analyse en cours'],
    sanctions: ['Voir le texte officiel'],
    impactRH: c.impacts.impactRH,
    impactFiscal: c.impacts.impactFiscal,
    impactHSE: c.impacts.impactHSE,
    impactJuridique: c.impacts.impactJuridique,
    domaines: c.domaines.length ? c.domaines : [c.domaine],
    domaine: c.domaine,
    secteurs: ['Tous'],
    ministere: '—',
    numero: rec.numero || extraireNumero(rec.titre) || '',
    nature: rec.nature || c.nature || '',
    joReference: rec.joReference || '',
    lien: rec.url,
    extrait: (rec.extrait || '').slice(0, 300),
    motsCles: c.motsCles,
    scoreHSE: c.score,
  };
}

/**
 * Fusionne les enregistrements collectés avec le registre existant.
 *
 * Une entrée déjà connue est mise à jour sur les champs automatiques
 * (classification, extrait, date) mais conserve ses champs manuels.
 */
function fusionner(existants, records, aujourdhui, { conserverLegacy }) {
  const parRef = new Map();
  // Les entrées antérieures à la veille automatique n'ont pas de `sourceRef` :
  // impossible de les rattacher à une source, donc de les rafraîchir ou de
  // vérifier qu'elles existent encore. On ne les supprime jamais en silence.
  const legacy = [];
  for (const e of existants) {
    if (e.sourceRef) parRef.set(e.sourceRef, e);
    else legacy.push(e);
  }

  const nouveaux = [];
  const misAJour = [];

  for (const rec of records) {
    const ancien = parRef.get(rec.sourceRef);
    const candidat = versEntree(rec, ancien ? ancien.id : 0, aujourdhui);

    if (!ancien) {
      nouveaux.push(candidat);
      continue;
    }
    // Conserver tout champ renseigné par un analyste.
    const fusionne = { ...candidat, dateDetection: ancien.dateDetection || aujourdhui };
    for (const champ of CHAMPS_MANUELS) {
      if (estRenseigne(ancien[champ])) fusionne[champ] = ancien[champ];
    }
    parRef.set(rec.sourceRef, fusionne);
    misAJour.push(fusionne);
  }

  // Entrées connues non revues ce run : conservées telles quelles.
  const conserves = [...parRef.values()];
  const tout = [...conserves, ...nouveaux, ...(conserverLegacy ? legacy : [])];

  // Textes réglementaires d'abord, puis actes, puis signaux ; à l'intérieur de
  // chaque rang, le plus récent d'abord, les non datés en fin.
  const RANG = { texte: 0, acte: 1, signal: 2 };
  tout.sort((a, b) => {
    const ra = RANG[a.typeEntree] ?? 3;
    const rb = RANG[b.typeEntree] ?? 3;
    if (ra !== rb) return ra - rb;
    const da = a.datePublication || '';
    const db = b.datePublication || '';
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    return 0;
  });
  tout.forEach((e, i) => { e.id = i + 1; });

  return {
    entrees: tout,
    nbNouveaux: nouveaux.length,
    nbMisAJour: misAJour.length,
    nbLegacy: legacy.length,
  };
}

/* ------------------------------ écriture ------------------------------ */

const echapCsv = (v) => {
  const s = Array.isArray(v) ? v.join('; ') : String(v ?? '');
  return `"${s.replace(/"/g, '""')}"`;
};

function ecrireFichiers({ entrees, log, stats, aujourdhui }) {
  mkdirSync(join(RACINE, 'data'), { recursive: true });

  const enTete =
    `// Généré par scripts/collect-veille.mjs — ne pas éditer à la main.\n` +
    `// Veille réglementaire HSE Côte d'Ivoire. Dernier run : ${new Date().toISOString()}\n` +
    `// ${entrees.length} texte(s) au registre, dont ${stats.nbNouveaux} nouveau(x) ce run.\n\n`;

  writeFileSync(
    FICHIER_TEXTES,
    enTete +
      'export const textesEnrichis = [\n' +
      entrees.map((e) => '  ' + JSON.stringify(e)).join(',\n') +
      '\n];\n'
  );

  writeFileSync(
    FICHIER_LOG,
    `// Généré par scripts/collect-veille.mjs — ne pas éditer à la main.\n` +
      `// Journal d'accessibilité des sources, run du ${aujourdhui}.\n\n` +
      `export const dernierRun = ${JSON.stringify(
        { date: aujourdhui, horodatage: new Date().toISOString(), ...stats },
        null, 2
      )};\n\n` +
      'export const logSources = [\n' +
      log.map((l) => '  ' + JSON.stringify(l)).join(',\n') +
      '\n];\n'
  );

  // Export CSV au format du registre de veille (ouvrable dans Excel).
  const colonnes = ['Date', 'Domaine', 'Source', 'URL', 'Extrait 300 car.', 'Mots-clés trouvés', 'Statut'];
  const lignes = entrees.map((e) =>
    [
      e.dateDetection || e.datePublication, e.domaine, e.source, e.lien,
      e.extrait, e.motsCles, e.statutRevue,
    ].map(echapCsv).join(',')
  );
  writeFileSync(FICHIER_CSV, '﻿' + [colonnes.map(echapCsv).join(','), ...lignes].join('\r\n') + '\r\n');
}

/* ------------------------------ point d'entrée ------------------------------ */

export async function lancerVeille({ pages = 2, conserverLegacy = false } = {}) {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  console.log(`[veille] run du ${aujourdhui} — ${SOURCES_ACTIVES.length} source(s) active(s), ` +
    `${SOURCES_BLOQUEES.length} bloquée(s)`);

  const { records, log } = await collecterSources({ pages });
  const existants = await lireRegistreExistant();
  const { entrees, nbNouveaux, nbMisAJour, nbLegacy } =
    fusionner(existants, records, aujourdhui, { conserverLegacy });

  if (nbLegacy) {
    console.log(
      `[veille] ${nbLegacy} entrée(s) sans sourceRef (antérieures à la veille auto) ` +
      `${conserverLegacy ? 'conservées' : 'écartées — relancer avec --conserver-legacy pour les garder'}`
    );
  }

  const stats = {
    sourcesActives: SOURCES_ACTIVES.length,
    sourcesBloquees: SOURCES_BLOQUEES.length,
    sourcesAccessibles: log.filter((l) => l.statutAcces === 'Accessible').length,
    textesRetenus: records.length,
    nbNouveaux,
    nbMisAJour,
    nbLegacy,
    legacyConservees: conserverLegacy,
    totalRegistre: entrees.length,
  };

  ecrireFichiers({ entrees, log, stats, aujourdhui });

  console.log(
    `[veille] terminé — ${stats.totalRegistre} texte(s) au registre ` +
    `(${nbNouveaux} nouveau(x), ${nbMisAJour} mis à jour)`
  );
  return stats;
}
