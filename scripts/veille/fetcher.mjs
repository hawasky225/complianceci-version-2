/**
 * Couche HTTP de la veille : récupération polie, tolérante aux pannes.
 *
 * Sans dépendance (fetch natif de Node >= 18). Chaque source est isolée : une
 * source en panne n'interrompt jamais la collecte des autres, elle est
 * seulement consignée dans le log du run.
 */

// Plusieurs sites officiels ivoiriens (presidence.ci notamment) renvoient 403
// à un User-Agent de robot. On s'annonce comme un navigateur, avec une adresse
// de contact dans l'en-tête pour rester identifiable par les webmestres.
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const EN_TETES = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'fr-FR,fr;q=0.9',
  From: 'contact@regalertci.com',
};

export const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/** Délai entre deux requêtes vers le même hôte. */
export const DELAI_MS = 1500;

/**
 * Récupère une page HTML.
 *
 * @param {string} url
 * @param {{essais?:number, timeoutMs?:number}} [opts]
 * @returns {Promise<{ok:boolean, status:number, html:string, erreur:string|null}>}
 */
export async function recupererHtml(url, opts = {}) {
  const { essais = 3, timeoutMs = 30000 } = opts;
  let derniereErreur = null;

  for (let essai = 1; essai <= essais; essai++) {
    const ac = new AbortController();
    const minuteur = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: EN_TETES,
        signal: ac.signal,
        redirect: 'follow',
      });
      clearTimeout(minuteur);

      // 429/5xx : on retente avec un recul exponentiel.
      if ((res.status === 429 || res.status >= 500) && essai < essais) {
        derniereErreur = `HTTP ${res.status}`;
        await pause(DELAI_MS * 2 ** essai);
        continue;
      }
      if (!res.ok) {
        return { ok: false, status: res.status, html: '', erreur: `HTTP ${res.status}` };
      }
      return { ok: true, status: res.status, html: await res.text(), erreur: null };
    } catch (err) {
      clearTimeout(minuteur);
      // `fetch` masque la cause TLS/DNS dans err.cause — on la remonte, c'est
      // elle qui distingue « certificat expiré » de « domaine mort ».
      derniereErreur = err.cause?.code || err.code || err.message;
      if (essai < essais) await pause(DELAI_MS * essai);
    }
  }
  return { ok: false, status: 0, html: '', erreur: derniereErreur || 'échec' };
}

/** Traduit un code d'erreur technique en diagnostic lisible pour le log. */
export function expliquerErreur(code) {
  const c = String(code || '');
  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(c))
    return "Domaine introuvable (DNS) — l'adresse n'existe plus";
  if (/CERT_HAS_EXPIRED/i.test(c))
    return 'Certificat TLS expiré côté site';
  if (/UNABLE_TO_VERIFY_LEAF_SIGNATURE|SELF_SIGNED/i.test(c))
    return 'Chaîne TLS incomplète côté site (certificat intermédiaire manquant)';
  if (/HTTP 40[13]/i.test(c))
    return 'Accès refusé au robot (403/401)';
  if (/HTTP 404/i.test(c))
    return 'Page introuvable (404) — URL à mettre à jour';
  if (/abort|timeout/i.test(c))
    return 'Délai dépassé';
  return c;
}
