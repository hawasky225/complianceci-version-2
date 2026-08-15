// Généré par scripts/collect-veille.mjs — ne pas éditer à la main.
// Journal d'accessibilité des sources, run du 2026-08-15.

export const dernierRun = {
  "date": "2026-08-15",
  "horodatage": "2026-08-15T06:39:47.942Z",
  "sourcesActives": 12,
  "sourcesBloquees": 3,
  "sourcesAccessibles": 11,
  "textesRetenus": 63,
  "nbNouveaux": 0,
  "nbMisAJour": 63,
  "totalRegistre": 65,
  "parStatut": {
    "a_analyser": 65,
    "validee": 0,
    "hors_scope": 0,
    "en_base": 0
  }
};

export const logSources = [
  {"source":"CNDJ — Bibliothèque juridique","sourceId":"cndj","domaine":"Transversal","url":"https://biblio.cndj.ci/search/textes?type=1","statutAcces":"Accessible","liensAnalyses":174,"alertesRetenues":4,"dureeMs":75998,"commentaire":"174 lien(s) analysé(s), 4 retenu(s) après filtre HSE."},
  {"source":"Ministère de l'Environnement et de la Transition Écologique","sourceId":"environnement","domaine":"Environnement","url":"https://www.environnement.gouv.ci/actualites","statutAcces":"Accessible","liensAnalyses":89,"alertesRetenues":17,"dureeMs":5644,"commentaire":"89 lien(s) analysé(s), 17 retenu(s) après filtre HSE."},
  {"source":"CIAPOL — Centre Ivoirien Antipollution","sourceId":"ciapol","domaine":"Environnement","url":"https://ciapol.ci/","statutAcces":"Accessible","liensAnalyses":7,"alertesRetenues":0,"dureeMs":3413,"commentaire":"7 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"ONPC — Office National de la Protection Civile","sourceId":"onpc","domaine":"Incendie / Sécurité","url":"https://www.onpc-ci.org/actualite","statutAcces":"Accessible","liensAnalyses":8,"alertesRetenues":6,"dureeMs":10035,"commentaire":"8 lien(s) analysé(s), 6 retenu(s) après filtre HSE."},
  {"source":"CNPS — Caisse Nationale de Prévoyance Sociale","sourceId":"cnps","domaine":"Social / CNPS","url":"https://www.cnps.ci/","statutAcces":"Accessible","liensAnalyses":19,"alertesRetenues":0,"dureeMs":2847,"commentaire":"19 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"Ministère de l'Emploi et de la Protection Sociale","sourceId":"emploi","domaine":"SST / Travail","url":"https://www.emploi.gouv.ci/accueil","statutAcces":"Échec","liensAnalyses":0,"alertesRetenues":0,"dureeMs":1104,"commentaire":"Ministère de l'Emploi et de la Protection Sociale : HTTP 403 sur https://www.emploi.gouv.ci/accueil"},
  {"source":"Ministère des Mines, du Pétrole et de l'Énergie","sourceId":"energie","domaine":"Énergie","url":"https://www.energie.gouv.ci/energie/textes-et-lois","statutAcces":"Accessible","liensAnalyses":22,"alertesRetenues":1,"dureeMs":4942,"commentaire":"22 lien(s) analysé(s), 1 retenu(s) après filtre HSE."},
  {"source":"ANARE-CI — Régulation du secteur électricité","sourceId":"anare","domaine":"Énergie","url":"https://anare.ci/documents/lois-et-reglementation/les-decrets/","statutAcces":"Accessible","liensAnalyses":148,"alertesRetenues":1,"dureeMs":8743,"commentaire":"148 lien(s) analysé(s), 1 retenu(s) après filtre HSE."},
  {"source":"Ministère des Transports","sourceId":"transports","domaine":"Transport / TMD","url":"https://transports.gouv.ci/","statutAcces":"Accessible","liensAnalyses":104,"alertesRetenues":0,"dureeMs":2680,"commentaire":"104 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"Portail officiel du Gouvernement","sourceId":"gouv","domaine":"Transversal","url":"https://www.gouv.ci/actualites","statutAcces":"Accessible","liensAnalyses":2140,"alertesRetenues":34,"dureeMs":5776,"commentaire":"2140 lien(s) analysé(s), 34 retenu(s) après filtre HSE."},
  {"source":"Loidici — veille juridique ivoirienne","sourceId":"loidici","domaine":"Transversal","url":"https://loidici.biz/","statutAcces":"Accessible","liensAnalyses":34,"alertesRetenues":0,"dureeMs":2261,"commentaire":"34 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"SGG — Documenthèque","sourceId":"sgg-documentheque","domaine":"Transversal","url":"https://www.sgg.gouv.ci/documentheque.php?id_cas=2","statutAcces":"Accessible","liensAnalyses":1,"alertesRetenues":0,"dureeMs":2460,"commentaire":"1 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"SGG — Journal Officiel","sourceId":"sgg-jo","domaine":"Transversal","url":"https://www.sgg.gouv.ci/jo.php","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Page servie normalement mais protégée par identifiant : la consultation du JO exige un code de téléchargement délivré par le service JO du SGG (+225 20 32 59 66). Ce n'est pas un blocage technique.","action":"Obtenir un compte JO auprès du SGG, puis ajouter l'authentification à cette source. C'est la source la plus complète du dispositif."},
  {"source":"ANDE — Agence Nationale De l'Environnement","sourceId":"ande","domaine":"Environnement","url":"https://ande-ci.com/","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Certificat TLS du site expiré le 12/12/2024 : toute connexion HTTPS vérifiée échoue. Le contenu est servi normalement une fois la vérification désactivée, ce que la veille ne fait pas volontairement.","action":"Signaler l'expiration à l'ANDE. À défaut, consultation manuelle."},
  {"source":"Présidence — communiqués du Conseil des ministres","sourceId":"presidence","domaine":"Transversal","url":"https://www.presidence.ci/communiques-ministres/","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Chaîne TLS incomplète (certificat intermédiaire absent) : les clients stricts refusent la connexion. Le site répond par ailleurs 403 aux User-Agents identifiés comme robots.","action":"Les décisions du Conseil des ministres restent captées via le portail gouv.ci/actualites, qui les relaie."}
];
