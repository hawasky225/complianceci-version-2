#!/usr/bin/env node
/**
 * Pose ou consulte le statut de revue des entrées de la veille.
 *
 * Les décisions sont écrites dans data/statuts.json, relu à chaque collecte.
 * Modifier ce fichier ne relance pas de collecte : lancer `npm run veille`
 * ensuite pour répercuter les statuts dans data/textes.js et le CSV.
 *
 * Usage :
 *   npm run veille:statut -- --liste
 *   npm run veille:statut -- --liste a_analyser
 *   npm run veille:statut -- cndj:67669 validee
 *   npm run veille:statut -- cndj:67669 hors_scope "Concerne les collectivités"
 *   npm run veille:statut -- --importer statuts-export.json
 *
 * Le premier argument accepte aussi le numéro d'ordre affiché par --liste.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STATUTS, CODES, lireStatuts, ecrireStatuts, poserStatut,
  normaliserStatut, libelleStatut, STATUT_DEFAUT,
} from './veille/statuts.mjs';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

const aide = () => {
  console.log(`
Statuts de revue de la veille HSE.

  npm run veille:statut -- --liste [statut]      lister les entrées
  npm run veille:statut -- <ref|n°> <statut> [note]
  npm run veille:statut -- --importer <fichier>  appliquer un export du site

Statuts disponibles :
${STATUTS.map((s) => `  ${s.code.padEnd(12)} ${s.libelle.padEnd(20)} ${s.description}`).join('\n')}
`);
};

/** Charge le registre publié pour résoudre les références et afficher. */
async function lireRegistre() {
  const f = join(RACINE, 'data', 'textes.js');
  if (!existsSync(f)) return [];
  const mod = await import(`file://${f}?t=${Date.now()}`);
  return mod.textesEnrichis || [];
}

async function lister(filtre) {
  const registre = await lireRegistre();
  const statuts = lireStatuts(RACINE);
  const code = filtre ? normaliserStatut(filtre) : null;
  if (filtre && !code) {
    console.error(`Statut inconnu : ${filtre}. Attendu : ${CODES.join(', ')}`);
    process.exit(2);
  }

  let n = 0;
  const compte = {};
  for (const e of registre) {
    const actuel = statuts[e.sourceRef] ? statuts[e.sourceRef].statut : STATUT_DEFAUT;
    compte[actuel] = (compte[actuel] || 0) + 1;
    n += 1;
    if (code && actuel !== code) continue;
    console.log(
      `${String(n).padStart(3)}. [${libelleStatut(actuel).padEnd(18)}] ` +
      `${(e.typeEntreeLibelle || '').padEnd(20)} ${e.titre.slice(0, 70)}`
    );
    console.log(`     ${e.sourceRef}`);
  }
  console.log(
    '\n' + CODES.map((c) => `${libelleStatut(c)} : ${compte[c] || 0}`).join('   ·   ')
  );
}

async function poser(cible, saisieStatut, note) {
  const code = normaliserStatut(saisieStatut);
  if (!code) {
    console.error(`Statut inconnu : ${saisieStatut}. Attendu : ${CODES.join(', ')}`);
    process.exit(2);
  }

  const registre = await lireRegistre();
  // La cible peut être un sourceRef ou le numéro d'ordre affiché par --liste.
  let entree = registre.find((e) => e.sourceRef === cible);
  if (!entree && /^\d+$/.test(cible)) entree = registre[Number(cible) - 1];
  if (!entree) {
    console.error(`Entrée introuvable : ${cible}. Utiliser --liste pour voir les références.`);
    process.exit(1);
  }

  const statuts = lireStatuts(RACINE);
  const { precedent } = poserStatut(statuts, entree.sourceRef, code, note);
  ecrireStatuts(RACINE, statuts);

  console.log(`${entree.titre.slice(0, 70)}`);
  console.log(`  ${libelleStatut(precedent || STATUT_DEFAUT)} → ${libelleStatut(code)}`);
  if (note) console.log(`  note : ${note}`);
  console.log('\nLancer `npm run veille` pour répercuter dans le registre publié.');
}

/**
 * Applique un fichier exporté depuis le site.
 *
 * Le site produit le même format que data/statuts.json ; l'import fusionne au
 * lieu de remplacer, pour ne pas perdre les décisions prises en ligne de
 * commande entre-temps.
 */
function importer(fichier) {
  if (!existsSync(fichier)) {
    console.error(`Fichier introuvable : ${fichier}`);
    process.exit(1);
  }
  let entrant;
  try {
    entrant = JSON.parse(readFileSync(fichier, 'utf8'));
  } catch (err) {
    console.error(`JSON invalide : ${err.message}`);
    process.exit(1);
  }

  const statuts = lireStatuts(RACINE);
  let applique = 0;
  let ignore = 0;
  for (const [ref, v] of Object.entries(entrant)) {
    const code = normaliserStatut(v && v.statut);
    if (!code) { ignore += 1; continue; }
    poserStatut(statuts, ref, code, v.note);
    applique += 1;
  }
  ecrireStatuts(RACINE, statuts);
  console.log(`${applique} statut(s) appliqué(s)${ignore ? `, ${ignore} ignoré(s) (statut inconnu)` : ''}.`);
  console.log('Lancer `npm run veille` pour répercuter dans le registre publié.');
}

if (!args.length || args[0] === '--aide' || args[0] === '-h') {
  aide();
} else if (args[0] === '--liste') {
  await lister(args[1]);
} else if (args[0] === '--importer') {
  importer(args[1]);
} else if (args.length < 2) {
  console.error('Il faut une référence et un statut. Voir --aide.');
  process.exit(2);
} else {
  await poser(args[0], args[1], args[2]);
}
