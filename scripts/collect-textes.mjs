#!/usr/bin/env node
/**
 * Legal-watch collector for ComplianceCI.
 *
 * Scrapes newly published Ivorian legal texts from the public CNDJ database
 * (biblio.cndj.ci) and regenerates data/textes.js in the schema the site
 * renders. Dependency-free (Node >= 18 native fetch); meant to run on a
 * schedule via GitHub Actions, committing the refreshed data so Vercel/Railway
 * redeploy automatically.
 *
 * Usage: node scripts/collect-textes.mjs [--pages N]
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'data', 'textes.js');
const BASE = 'https://biblio.cndj.ci';
const PAGES = Number(process.argv.includes('--pages')
  ? process.argv[process.argv.indexOf('--pages') + 1]
  : 3);

// CNDJ "nature" codes -> readable label. These are the categories we watch.
const NATURES = [
  { code: 8, label: 'Loi' },
  { code: 12, label: 'Ordonnance' },
  { code: 6, label: 'Décret' },
  { code: 9, label: 'Arrêté' },
  { code: 11, label: 'Arrêté interministériel' },
  { code: 18, label: 'Circulaire' },
];

const clean = (s) =>
  (s || '')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.{2,}$/, '')
    .trim();

const toISODate = (dmy) => {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(dmy || '');
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

/** Parse a CNDJ results page into raw text records. */
function parseResults(html, natureLabel) {
  const out = [];
  const cards = html.split(/<div class="card result-card"/i).slice(1);
  for (const card of cards) {
    const link = /href="([^"]*\/search\/textes\/(\d+)\?type=1)"/i.exec(card);
    if (!link) continue;
    const titleM = /\/search\/textes\/\d+\?type=1"[^>]*>([\s\S]*?)<\/a>/i.exec(card);
    const numM = /<span>\s*Num[ée]ro\s*<\/span>([\s\S]*?)<\/li>/i.exec(card);
    const dateM = /<span>\s*Date signature\s*<\/span>([\s\S]*?)<\/li>/i.exec(card);
    const joM = /<span>\s*Journal officiel\s*<\/span>([\s\S]*?)<\/li>/i.exec(card);
    const title = clean(titleM && titleM[1]);
    const number = clean(numM && numM[1]);
    if (!title && !number) continue;
    out.push({
      sourceRef: link[2],
      detailUrl: link[1],
      nature: natureLabel,
      number: number || null,
      title,
      signatureDate: toISODate(dateM && dateM[1]),
      joReference: clean(joM && joM[1]) || null,
    });
  }
  return out;
}

// --- Heuristic classification into the site's domain/impact taxonomy ---------
const norm = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const RULES = [
  { domaine: 'Fiscalité', impact: 'impactFiscal', kw: ['impot', 'fiscal', 'tva', 'taxe', 'douan', 'budget', 'finance', 'recouvrement', 'droit d\'enregistrement', 'accise'] },
  { domaine: 'Travail', impact: 'impactRH', kw: ['travail', 'emploi', 'salaire', 'salarial', 'cnps', 'conge', 'contrat de travail', 'syndic', 'retraite', 'apprentissage', 'main-d\'oeuvre', 'securite sociale', 'convention collective'] },
  { domaine: 'Environnement', impact: 'impactHSE', kw: ['environnement', 'pollution', 'dechet', 'eaux', 'foret', 'climat', 'hygiene', 'sanitaire', 'dangereu', 'hydrocarbure', 'mines', 'miniere', 'securite', 'phytosanitaire', 'assainissement'] },
  { domaine: 'Transport', impact: 'impactJuridique', kw: ['transport', 'routier', 'circulation', 'maritime', 'portuaire', 'aerien', 'marchandises dangereuses', 'vehicule', 'permis de conduire'] },
  { domaine: 'Données', impact: 'impactJuridique', kw: ['donnees', 'numerique', 'telecom', 'informatique', 'cyber', 'communication electronique'] },
  { domaine: 'Assurance', impact: 'impactJuridique', kw: ['assurance', 'mutuelle', 'prevoyance', 'reassurance'] },
];

function classify(title) {
  const t = norm(title);
  const flags = { impactRH: false, impactFiscal: false, impactHSE: false, impactJuridique: true };
  let domaine = 'Gouvernance';
  for (const rule of RULES) {
    if (rule.kw.some((k) => t.includes(norm(k)))) {
      domaine = rule.domaine;
      if (rule.impact === 'impactFiscal') flags.impactFiscal = true;
      if (rule.impact === 'impactRH') flags.impactRH = true;
      if (rule.impact === 'impactHSE') flags.impactHSE = true;
      break;
    }
  }
  return { domaine, ...flags };
}

/** Map a raw CNDJ record into the site's textesEnrichis schema. */
function toEntry(rec, id) {
  const c = classify(rec.title);
  return {
    id,
    titre: rec.title,
    source: 'CNDJ — Journal Officiel de Côte d’Ivoire',
    statut: 'En vigueur',
    datePublication: rec.signatureDate || '',
    dateEntreeVigueur: rec.signatureDate || '',
    badge: 'Nouveau',
    ceQuiChange: ['À déterminer — consulter le texte officiel'],
    obligationsPrincipales: ['À déterminer — analyse en cours'],
    sanctions: ['Voir le texte officiel'],
    impactRH: c.impactRH,
    impactFiscal: c.impactFiscal,
    impactHSE: c.impactHSE,
    impactJuridique: c.impactJuridique,
    domaines: [c.domaine],
    secteurs: ['Tous'],
    ministere: '—',
    numero: rec.number || '',
    nature: rec.nature,
    joReference: rec.joReference || '',
    lien: rec.detailUrl,
    sourceRef: rec.sourceRef,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Polite throttle: CNDJ returns 429 when hit too fast.
const DELAY_MS = 1500;

async function fetchPage(natureCode, page) {
  const url = `${BASE}/search/textes?type=1&nature=${natureCode}${page > 1 ? `&page=${page}` : ''}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ComplianceCI legal-watch bot', Accept: 'text/html' },
    });
    if (res.ok) return res.text();
    if (res.status === 429 && attempt < 4) {
      await sleep(DELAY_MS * attempt * 2); // exponential backoff
      continue;
    }
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
}

async function main() {
  const seen = new Set();
  const records = [];

  for (const nature of NATURES) {
    for (let page = 1; page <= PAGES; page++) {
      let html;
      try {
        html = await fetchPage(nature.code, page);
      } catch (err) {
        console.error(`[collect] ${nature.label} p${page} failed: ${err.message}`);
        continue;
      }
      const rows = parseResults(html, nature.label);
      if (!rows.length) break; // no more pages for this nature
      for (const r of rows) {
        if (seen.has(r.sourceRef)) continue;
        seen.add(r.sourceRef);
        records.push(r);
      }
      await sleep(DELAY_MS); // be polite between requests
    }
  }

  // Newest first by signature date; undated last.
  records.sort((a, b) => (b.signatureDate || '').localeCompare(a.signatureDate || ''));

  const entries = records.map((r, i) => toEntry(r, i + 1));

  const header =
    `// AUTO-GENERATED by scripts/collect-textes.mjs — do not edit by hand.\n` +
    `// Source: CNDJ (biblio.cndj.ci). Last run: ${new Date().toISOString()}.\n` +
    `// ${entries.length} textes réglementaires collectés.\n\n`;
  const body =
    `export const textesEnrichis = [\n` +
    entries.map((e) => '  ' + JSON.stringify(e)).join(',\n') +
    `\n];\n`;

  writeFileSync(OUT, header + body);
  console.log(`[collect] wrote ${entries.length} texts to data/textes.js`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
