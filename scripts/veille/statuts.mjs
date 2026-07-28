/**
 * Statuts de revue des entrées de la veille.
 *
 * Les décisions d'un analyste vivent dans `data/statuts.json`, séparé du
 * registre `data/textes.js` qui, lui, est régénéré à chaque collecte. Cette
 * séparation est délibérée : une décision humaine ne doit jamais dépendre d'un
 * fichier réécrit par un robot, et le diff Git d'une revue reste lisible.
 *
 * La clé est le `sourceRef` de l'entrée (identifiant stable par source), pas
 * son `id` — les id sont renumérotés à chaque run selon l'ordre de tri.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Vocabulaire fermé des statuts de revue. */
export const STATUTS = [
  {
    code: 'a_analyser',
    libelle: 'À analyser',
    description: "Détecté automatiquement, pas encore examiné.",
    defaut: true,
  },
  {
    code: 'validee',
    libelle: 'Validée',
    description: 'Examinée et jugée pertinente pour la veille HSE.',
  },
  {
    code: 'hors_scope',
    libelle: 'Hors scope',
    description: "Examinée et écartée : sans portée HSE pour nos clients.",
  },
  {
    code: 'en_base',
    libelle: 'Ajoutée à la base',
    description: 'Intégrée au registre légal — le traitement est terminé.',
  },
];

export const CODES = STATUTS.map((s) => s.code);
export const STATUT_DEFAUT = 'a_analyser';

/** Libellé affichable d'un code de statut. */
export const libelleStatut = (code) =>
  (STATUTS.find((s) => s.code === code) || STATUTS[0]).libelle;

/** Le code correspond-il à un statut connu ? */
export const estStatutValide = (code) => CODES.includes(code);

/**
 * Tolère les saisies humaines : accents, espaces, tirets.
 * `Validée`, `validee`, `VALIDEE` et `validée` donnent tous `validee`.
 */
export function normaliserStatut(saisie) {
  const s = String(saisie || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/[\s-]+/g, '_');
  if (estStatutValide(s)) return s;
  // Quelques synonymes courants issus du registre manuel.
  const alias = {
    a_analyser: 'a_analyser',
    nouveau: 'a_analyser',
    non_applicable: 'hors_scope',
    hors_perimetre: 'hors_scope',
    valide: 'validee',
    base: 'en_base',
    ajoutee: 'en_base',
    ajoutee_a_la_base: 'en_base',
  };
  return alias[s] || null;
}

const fichierStatuts = (racine) => join(racine, 'data', 'statuts.json');

/**
 * Lit le registre des décisions.
 * @returns {Object<string, {statut:string, date:string, note?:string}>}
 */
export function lireStatuts(racine) {
  const f = fichierStatuts(racine);
  if (!existsSync(f)) return {};
  try {
    const brut = JSON.parse(readFileSync(f, 'utf8'));
    // On ignore silencieusement les codes devenus invalides plutôt que de
    // faire échouer une collecte à cause d'une saisie manuelle erronée.
    const propre = {};
    for (const [ref, v] of Object.entries(brut)) {
      if (v && estStatutValide(v.statut)) propre[ref] = v;
    }
    return propre;
  } catch (err) {
    console.warn(`[veille] data/statuts.json illisible (${err.message}) — ignoré`);
    return {};
  }
}

/** Écrit le registre des décisions, trié pour un diff Git stable. */
export function ecrireStatuts(racine, statuts) {
  const trie = {};
  for (const ref of Object.keys(statuts).sort()) trie[ref] = statuts[ref];
  writeFileSync(fichierStatuts(racine), JSON.stringify(trie, null, 2) + '\n');
}

/**
 * Pose un statut sur une entrée.
 * @returns {{ref:string, statut:string, precedent:string|null}}
 */
export function poserStatut(statuts, ref, code, note) {
  const precedent = statuts[ref] ? statuts[ref].statut : null;
  if (code === STATUT_DEFAUT && !note) {
    // Revenir au défaut = retirer la décision, pour ne pas gonfler le fichier.
    delete statuts[ref];
    return { ref, statut: code, precedent };
  }
  statuts[ref] = {
    statut: code,
    date: new Date().toISOString().slice(0, 10),
    ...(note ? { note } : {}),
  };
  return { ref, statut: code, precedent };
}
