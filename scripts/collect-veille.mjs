#!/usr/bin/env node
/**
 * Veille réglementaire HSE — Côte d'Ivoire.
 *
 * Interroge les sources officielles ivoiriennes, filtre les textes relevant de
 * l'hygiène, la sécurité et l'environnement, et régénère le registre publié
 * par le site (data/textes.js), son journal de run (data/veille-log.js) et
 * l'export CSV (data/registre-veille.csv).
 *
 * Usage :
 *   node scripts/collect-veille.mjs            # 2 pages par nature CNDJ
 *   node scripts/collect-veille.mjs --pages 5  # remonter plus loin
 */
import { lancerVeille } from './veille/collect.mjs';

const args = process.argv.slice(2);
const i = args.indexOf('--pages');
const pages = i >= 0 ? Number(args[i + 1]) : 2;

if (!Number.isFinite(pages) || pages < 1) {
  console.error('--pages doit être un entier positif');
  process.exit(2);
}

lancerVeille({ pages }).catch((err) => {
  console.error('[veille] échec du run :', err);
  process.exit(1);
});
