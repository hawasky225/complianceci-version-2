// Généré par scripts/collect-veille.mjs — ne pas éditer à la main.
// Journal d'accessibilité des sources, run du 2026-10-27.

export const dernierRun = {
  "date": "2026-10-27",
  "horodatage": "2026-10-27T11:47:00.197Z",
  "sourcesActives": 12,
  "sourcesBloquees": 3,
  "sourcesAccessibles": 8,
  "textesRetenus": 60,
  "nbNouveaux": 1,
  "nbMisAJour": 59,
  "totalRegistre": 79,
  "parStatut": {
    "a_analyser": 79,
    "validee": 0,
    "hors_scope": 0,
    "en_base": 0
  }
};

export const logSources = [
  {"source":"CNDJ — Bibliothèque juridique","sourceId":"cndj","domaine":"Transversal","url":"https://biblio.cndj.ci/search/textes?type=1","statutAcces":"Échec","liensAnalyses":0,"alertesRetenues":0,"dureeMs":215962,"commentaire":"CNDJ Loi p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Ordonnance p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Décret p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Arrêté p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Arrêté interministériel p1 : UND_ERR_CONNECT_TIMEOUT ; CNDJ Circulaire p1 : UND_ERR_CONNECT_TIMEOUT"},
  {"source":"Ministère de l'Environnement et de la Transition Écologique","sourceId":"environnement","domaine":"Environnement","url":"https://www.environnement.gouv.ci/actualites","statutAcces":"Accessible","liensAnalyses":114,"alertesRetenues":21,"dureeMs":6163,"commentaire":"114 lien(s) analysé(s), 21 retenu(s) après filtre HSE."},
  {"source":"CIAPOL — Centre Ivoirien Antipollution","sourceId":"ciapol","domaine":"Environnement","url":"https://ciapol.ci/","statutAcces":"Accessible","liensAnalyses":7,"alertesRetenues":0,"dureeMs":3623,"commentaire":"7 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"ONPC — Office National de la Protection Civile","sourceId":"onpc","domaine":"Incendie / Sécurité","url":"https://www.onpc-ci.org/actualite","statutAcces":"Échec","liensAnalyses":0,"alertesRetenues":0,"dureeMs":1616,"commentaire":"ONPC — Office National de la Protection Civile : HTTP 403 sur https://www.onpc-ci.org/actualite ; ONPC — Office National de la Protection Civile : HTTP 403 sur https://www.onpc-ci.org/"},
  {"source":"CNPS — Caisse Nationale de Prévoyance Sociale","sourceId":"cnps","domaine":"Social / CNPS","url":"https://www.cnps.ci/","statutAcces":"Accessible","liensAnalyses":20,"alertesRetenues":0,"dureeMs":3050,"commentaire":"20 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"Ministère de l'Emploi et de la Protection Sociale","sourceId":"emploi","domaine":"SST / Travail","url":"https://www.emploi.gouv.ci/accueil","statutAcces":"Échec","liensAnalyses":0,"alertesRetenues":0,"dureeMs":1299,"commentaire":"Ministère de l'Emploi et de la Protection Sociale : HTTP 403 sur https://www.emploi.gouv.ci/accueil"},
  {"source":"Ministère des Mines, du Pétrole et de l'Énergie","sourceId":"energie","domaine":"Énergie","url":"https://www.energie.gouv.ci/energie/textes-et-lois","statutAcces":"Accessible","liensAnalyses":22,"alertesRetenues":1,"dureeMs":4958,"commentaire":"22 lien(s) analysé(s), 1 retenu(s) après filtre HSE."},
  {"source":"ANARE-CI — Régulation du secteur électricité","sourceId":"anare","domaine":"Énergie","url":"https://anare.ci/documents/lois-et-reglementation/les-decrets/","statutAcces":"Accessible","liensAnalyses":148,"alertesRetenues":1,"dureeMs":7227,"commentaire":"148 lien(s) analysé(s), 1 retenu(s) après filtre HSE."},
  {"source":"Ministère des Transports","sourceId":"transports","domaine":"Transport / TMD","url":"https://transports.gouv.ci/","statutAcces":"Accessible","liensAnalyses":104,"alertesRetenues":0,"dureeMs":3280,"commentaire":"104 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"Portail officiel du Gouvernement","sourceId":"gouv","domaine":"Transversal","url":"https://www.gouv.ci/actualites","statutAcces":"Accessible","liensAnalyses":2399,"alertesRetenues":37,"dureeMs":5528,"commentaire":"2399 lien(s) analysé(s), 37 retenu(s) après filtre HSE."},
  {"source":"Loidici — veille juridique ivoirienne","sourceId":"loidici","domaine":"Transversal","url":"https://loidici.biz/","statutAcces":"Accessible","liensAnalyses":32,"alertesRetenues":0,"dureeMs":2488,"commentaire":"32 lien(s) analysé(s), 0 retenu(s) après filtre HSE."},
  {"source":"SGG — Documenthèque","sourceId":"sgg-documentheque","domaine":"Transversal","url":"https://www.sgg.gouv.ci/documentheque.php?id_cas=2","statutAcces":"Échec","liensAnalyses":0,"alertesRetenues":0,"dureeMs":6676,"commentaire":"SGG — Documenthèque : CERT_HAS_EXPIRED sur https://www.sgg.gouv.ci/documentheque.php?id_cas=2"},
  {"source":"SGG — Journal Officiel","sourceId":"sgg-jo","domaine":"Transversal","url":"https://www.sgg.gouv.ci/jo.php","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Page servie normalement mais protégée par identifiant : la consultation du JO exige un code de téléchargement délivré par le service JO du SGG (+225 20 32 59 66). Ce n'est pas un blocage technique.","action":"Obtenir un compte JO auprès du SGG, puis ajouter l'authentification à cette source. C'est la source la plus complète du dispositif."},
  {"source":"ANDE — Agence Nationale De l'Environnement","sourceId":"ande","domaine":"Environnement","url":"https://ande-ci.com/","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Certificat TLS du site expiré le 12/12/2024 : toute connexion HTTPS vérifiée échoue. Le contenu est servi normalement une fois la vérification désactivée, ce que la veille ne fait pas volontairement.","action":"Signaler l'expiration à l'ANDE. À défaut, consultation manuelle."},
  {"source":"Présidence — communiqués du Conseil des ministres","sourceId":"presidence","domaine":"Transversal","url":"https://www.presidence.ci/communiques-ministres/","statutAcces":"À vérifier manuellement","liensAnalyses":0,"alertesRetenues":0,"dureeMs":0,"commentaire":"Chaîne TLS incomplète (certificat intermédiaire absent) : les clients stricts refusent la connexion. Le site répond par ailleurs 403 aux User-Agents identifiés comme robots.","action":"Les décisions du Conseil des ministres restent captées via le portail gouv.ci/actualites, qui les relaie."}
];
