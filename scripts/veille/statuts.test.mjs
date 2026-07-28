/**
 * Tests des statuts de revue — `node --test scripts/veille/statuts.test.mjs`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  STATUTS, CODES, STATUT_DEFAUT, libelleStatut, estStatutValide,
  normaliserStatut, lireStatuts, ecrireStatuts, poserStatut,
} from './statuts.mjs';

/** Racine jetable contenant un dossier data/. */
function racineTemporaire(contenu) {
  const racine = mkdtempSync(join(tmpdir(), 'veille-statuts-'));
  mkdirSync(join(racine, 'data'));
  if (contenu !== undefined) {
    writeFileSync(join(racine, 'data', 'statuts.json'), contenu);
  }
  return racine;
}

test('le vocabulaire est fermé et cohérent', () => {
  assert.ok(CODES.includes(STATUT_DEFAUT));
  assert.equal(STATUTS.filter(s => s.defaut).length, 1, 'un seul statut par défaut');
  assert.equal(new Set(CODES).size, CODES.length, 'pas de code dupliqué');
  assert.equal(libelleStatut('validee'), 'Validée');
  assert.equal(libelleStatut('inconnu'), 'À analyser', 'un code inconnu retombe sur le défaut');
  assert.ok(estStatutValide('hors_scope'));
  assert.equal(estStatutValide('peut-etre'), false);
});

test('la saisie humaine est tolérée', () => {
  // Un analyste tape « Validée », pas « validee ».
  for (const saisie of ['Validée', 'validee', 'VALIDEE', ' Validée ', 'valide']) {
    assert.equal(normaliserStatut(saisie), 'validee', `échec sur ${JSON.stringify(saisie)}`);
  }
  assert.equal(normaliserStatut('Hors scope'), 'hors_scope');
  assert.equal(normaliserStatut('hors-scope'), 'hors_scope');
  // Synonyme issu du registre manuel de juillet 2026.
  assert.equal(normaliserStatut('Non applicable'), 'hors_scope');
  assert.equal(normaliserStatut('Ajoutée à la base'), 'en_base');
  assert.equal(normaliserStatut('n’importe quoi'), null);
  assert.equal(normaliserStatut(''), null);
});

test('lecture et écriture aller-retour', () => {
  const racine = racineTemporaire();
  const statuts = {};
  poserStatut(statuts, 'cndj:123', 'validee');
  poserStatut(statuts, 'cndj:456', 'hors_scope', 'Concerne les collectivités');
  ecrireStatuts(racine, statuts);

  const relu = lireStatuts(racine);
  assert.equal(relu['cndj:123'].statut, 'validee');
  assert.equal(relu['cndj:456'].note, 'Concerne les collectivités');
  assert.match(relu['cndj:123'].date, /^\d{4}-\d{2}-\d{2}$/);
});

test('le fichier est trié pour un diff Git stable', () => {
  const racine = racineTemporaire();
  const statuts = {};
  for (const ref of ['cndj:999', 'cndj:111', 'onpc:abc']) poserStatut(statuts, ref, 'validee');
  ecrireStatuts(racine, statuts);
  const clefs = Object.keys(JSON.parse(readFileSync(join(racine, 'data', 'statuts.json'), 'utf8')));
  assert.deepEqual(clefs, [...clefs].sort());
});

test('revenir au statut par défaut retire la décision', () => {
  const statuts = {};
  poserStatut(statuts, 'cndj:123', 'validee');
  assert.ok(statuts['cndj:123']);
  const r = poserStatut(statuts, 'cndj:123', STATUT_DEFAUT);
  assert.equal(r.precedent, 'validee');
  assert.equal(statuts['cndj:123'], undefined, 'le fichier ne doit pas garder les non-décisions');
});

test('un fichier absent ou corrompu ne fait pas échouer la collecte', () => {
  assert.deepEqual(lireStatuts(racineTemporaire()), {}, 'fichier absent');
  assert.deepEqual(lireStatuts(racineTemporaire('{ ceci n’est pas du JSON')), {}, 'JSON invalide');
});

test('les statuts devenus invalides sont ignorés, les autres conservés', () => {
  // Protège d'une saisie manuelle erronée dans data/statuts.json.
  const racine = racineTemporaire(JSON.stringify({
    'cndj:1': { statut: 'validee' },
    'cndj:2': { statut: 'statut_supprime_en_v2' },
    'cndj:3': null,
  }));
  const relu = lireStatuts(racine);
  assert.deepEqual(Object.keys(relu), ['cndj:1']);
});
