// netlify/functions/claude.js
// Fonction serverless sécurisée — relaie les appels vers l'API Anthropic
// La clé API reste côté serveur, jamais exposée au navigateur

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'; // Mettez votre domaine en prod

exports.handler = async (event) => {
  // ── CORS ──────────────────────────────────────────────────
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Méthode autorisée : POST uniquement
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Méthode non autorisée' }) };
  }

  // ── RATE LIMITING simple (par IP) ─────────────────────────
  // Pour un vrai rate limiting, utilisez Upstash Redis ou similaire
  const clientIP = event.headers['x-forwarded-for'] || 'unknown';
  console.log(`[MedScan] Requête de ${clientIP}`);

  // ── VALIDATION ────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Corps de requête invalide' }) };
  }

  const { messages, system, max_tokens } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages manquants ou invalides' }) };
  }

  // Limite de sécurité : max 10 messages par requête
  if (messages.length > 10) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Trop de messages' }) };
  }

  // Limite de tokens : max 2000
  const safeMaxTokens = Math.min(max_tokens || 1000, 2000);

  // ── APPEL API ANTHROPIC ───────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[MedScan] ANTHROPIC_API_KEY manquante !');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Configuration serveur incorrecte' }) };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: safeMaxTokens,
        system: system || '',
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[MedScan] Erreur API Anthropic:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error?.message || 'Erreur API' }),
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (err) {
    console.error('[MedScan] Erreur réseau:', err.message);
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'Impossible de contacter l\'API. Réessayez.' }),
    };
  }
};
