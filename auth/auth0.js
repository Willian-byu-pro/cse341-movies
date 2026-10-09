// MUDANCA 1: no lugar do "import { loadAuthConfig }", lemos process.env direto.
// Os nomes sao os mesmos que o loadAuthConfig() devolvia, entao o corpo das
// funcoes abaixo continua igual ao do book-inventory.
const domain = process.env.AUTH0_DOMAIN;
const clientId = process.env.AUTH0_CLIENT_ID;
const clientSecret = process.env.AUTH0_CLIENT_SECRET;
const callbackUrl = process.env.AUTH0_CALLBACK_URL;

// MUDANCA 2: era "export const", virou so "const" (CommonJS).
// MUDANCA 3: apaguei a linha "const { domain, ... } = loadAuthConfig();"
//            que existia como primeira linha de cada funcao.
const buildAuthorizationUrl = (state) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: "openid profile email",
    state: state,
  });

  return `https://${domain}/authorize?${params.toString()}`;
};

const exchangeCodeForTokens = async (code) => {
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: callbackUrl,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange authorization code");
  }

  return response.json();
};

const buildLogoutUrl = () => {
  // O returnTo precisa estar em "Allowed Logout URLs" no Auth0.
  // Derivamos da callback URL para os dois ficarem sempre em sincronia.
  const returnTo = new URL(callbackUrl).origin;

  const params = new URLSearchParams({
    client_id: clientId,
    returnTo: returnTo,
  });

  return `https://${domain}/v2/logout?${params.toString()}`;
};

// MUDANCA 4: no lugar dos tres "export", um module.exports no fim.
module.exports = {
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  buildLogoutUrl,
};
