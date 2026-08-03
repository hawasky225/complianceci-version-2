// Généré par scripts/collect-veille.mjs — ne pas éditer à la main.
// Journal d'accessibilité des sources, run du 2026-08-03.

export const dernierRun = {
  "date": "2026-08-03",
  "horodatage": "2026-08-03T09:51:59.204Z",
  "sourcesActives": 12,
  "sourcesBloquees": 3,
  "sourcesAccessibles": 9,
  "textesRetenus": 59,
  "nbNouveaux": 0,
  "nbMisAJour": 59,
  "totalRegistre": 63,
  "parStatut": {
    "a_analyser": 63,
    "validee": 0,
    "hors_scope": 0,
    "en_base": 0
  }
};

export const logSources = [
  {"source":"CNDJ — Bibliothèque juridique","sourceId":"cndj","domaine":"Transversal","url":"https://biblio.cndj.ci/search/textes?type=1","statutAcces":"Échec","liensAnalyses":0,"alertesRetenues":0,"dureeMs":215964,"commentaire":"CNDJ Loi p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Ordonnance p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Décret p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Arrêté p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Arrêté interministériel p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Circulaire p1 : UND_ERR_CONNECT_TIMEOUT"},
  {"source":"Ministère de l'Environnement et de la Transition Écologique","sourceId":"environnement","domaine":"Environnement","url":"https://www.environnement.gouv.ci/actualites","statutAcces":"Accessible","liensAnalyses":84,"alertesRetenues":15,"dureeMs":6047,"commentaire":"84 lien(s) analysé(s), 15 retenu(s) après filtre HSE."},
  {"source":"CIAPOL — Centre Ivoirien Antipollution","sourceId":"ciapol","domaine":"Environnement","url":"https://ciapol.ci/","statutAcces":"Accessible","liensAnalyses":7,"alertesRetenues":0,"dureeMs":4496,"commentaire":"7 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"ONPC — Office National de la Protection Civile","sourceId":"onpc","domaine":"Incendie / Sécurité","url":"https://www.onpc-ci.org/actualite","statutAcces":"Accessible","liensAnalyses":8,"alertesRetenues":7,"dureeMs":11098,"commentaire":"8 lien(s) analysé(s), 7 retenu(s) après filtre HSE."},
  {"source":"CNPS — Caisse Nationale de Prévoyance Sociale","sourceId":"cnps","domaine":"Social / CNPS","url":"https://www.cnps.ci/","statutAcces":"Accessible","liensAnalyses":19,"alertesRetenues":0,"dureeMs":2982,"commentaire":"19 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"Ministère de l'Emploi et de la Protection Sociale","sourceId":"emploi","domaine":"SST / Travail","url":"https://www.emploi.gouv.ci/accueil","statutAcces":"Échec","liensAnalyses":0,"alertesRetenues":0,"dureeMs":1167,"commentaire":"Ministère de l'Emploi et de la Protection Sociale : HTTP 403 sur https://www.emploi.gouv.ci/accueil"},
  {"source":"Ministère des Mines, du Pétrole et de l'Énergie","sourceId":"energie","domaine":"Énergie","url":"https://www.energie.gouv.ci/energie/textes-et-lois","statutAcces":"Accessible","liensAnalyses":22,"alertesRetenues":1,"dureeMs":5006,"commentaire":"22 lien(s) analysé(s), 1 retenu(s) après filtre HSE."},
  {"source":"ANARE-CI — Régulation du secteur électricité","sourceId":"anare","domaine":"Énergie","url":"https://anare.ci/documents/lois-et-reglementation/les-decrets/","statutAcces":"Échec","liensAnalyses":0,"alertesRetenues":0,"dureeMs":71967,"commentaire":"ANARE-CI — Régulation du secteur électricité : UND_ERR_CONNECT_TIMEOUT sur https://anare.ci/documents/lois-et-reglementation/les-decrets/ ; ANARE-CI — Régulation du secteur électricité : UND_ERR_CONNECT_TIMEOUT sur https://anare.ci/"},
  {"source":"Ministère des Transports","sourceId":"transports","domaine":"Transport / TMD","url":"https://transports.gouv.ci/","statutAcces":"Accessible","liensAnalyses":104,"alertesRetenues":0,"dureeMs":2730,"commentaire":"104 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"Portail officiel du Gouvernement","sourceId":"gouv","domaine":"Transversal","url":"https://www.gouv.ci/actualites","statutAcces":"Accessible","liensAnalyses":2097,"alertesRetenues":34,"dureeMs":5024,"commentaire":"2097 lien(s) analysé(s), 34 retenu(s) après filtre HSE."},
  {"source":"Loidici — veille juridique ivoirienne","sourceId":"loidici","domaine":"Transversal","url":"https://loidici.biz/","statutAcces":"Accessible","liensAnalyses":39,"alertesRetenues":2,"dureeMs":2324,"commentaire":"39 lien(s) analysé(s), 2 retenu(s) après filtre HSE."},
  {"source":"SGG — Documenthèque","sourceId":"sgg-documentheque","domaine":"Transversal","url":"https://www.sgg.gouv.ci/documentheque.php?id_cas=2","statutAcces":"Accessible","liensAnalyses":1,"alertesRetenues":0,"dureeMs":2436,"commentaire":"1 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"SGG — Journal Officiel","sourceId":"sgg-jo","domaine":"Transversal","url":"https://www.sgg.gouv.ci/jo.php","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Page servie normalement mais protégée par identifiant : la consultation du JO exige un code de téléchargement délivré par le service JO du SGG (+225 20 32 59 66). Ce n'est pas un blocage technique.","action":"Obtenir un compte JO auprès du SGG, puis ajouter l'authentification à cette source. C'est la source la plus complète du dispositif."},
  {"source":"ANDE — Agence Nationale De l'Environnement","sourceId":"ande","domaine":"Environnement","url":"https://ande-ci.com/","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Certificat TLS du site expiré le 12/12/2024 : toute connexion HTTPS vérifiée échoue. Le contenu est servi normalement une fois la vérification désactivée, ce que la veille ne fait pas volontairement.","action":"Signaler l'expiration à l'ANDE. À défaut, consultation manuelle."},
  {"source":"Présidence — communiqués du Conseil des ministres","sourceId":"presidence","domaine":"Transversal","url":"https://www.presidence.ci/communiques-ministres/","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Chaîne TLS incomplète (certificat intermédiaire absent) : les clients stricts refusent la connexion. Le site répond par ailleurs 403 aux User-Agents identifiés comme robots.","action":"Les décisions du Conseil des ministres restent captées via le portail gouv.ci/actualites, qui les relaie."}
];
