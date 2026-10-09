
const crypto = require("crypto");

const { getDb } = require("../db/connect");
const usersCollection = () => getDb().collection("users");
const {
  buildAuthorizationUrl,
  buildLogoutUrl,
  exchangeCodeForTokens,
} = require("../auth/auth0");
const { createSessionToken } = require("../auth/session");

const login = (req, res) => {
  // O state protege contra CSRF: so aceitamos um callback que
  // corresponda a um login que este servidor iniciou.
  const state = crypto.randomBytes(16).toString("hex");

  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });

  return res.redirect(buildAuthorizationUrl(state));
};

const logout = (req, res) => {
  res.clearCookie("session");
  return res.redirect(buildLogoutUrl());
};

const callback = async (req, res) => {
  const { code, state } = req.query;

  // Confere se este callback nasceu de um login que nos iniciamos.
  if (!state || state !== req.cookies?.oauth_state) {
    return res.status(400).json({ error: "Invalid state parameter" });
  }

  res.clearCookie("oauth_state");

  if (!code) {
    return res.status(400).json({ error: "Missing authorization code" });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    // O id_token e um JWT. O payload (parte do meio) e Base64 legivel
    // e carrega os dados do usuario que o Auth0 confirmou.
    const profile = JSON.parse(
      Buffer.from(tokens.id_token.split(".")[1], "base64url").toString(),
    );

    // MUDANCA: no lugar do retorno temporario, o padrao "find or create".
    // Se o usuario ja entrou antes, reaproveitamos; se nao, criamos.
    let user = await usersCollection().findOne({ email: profile.email });

    if (!user) {
      const novoUsuario = {
        username: profile.name,
        email: profile.email,
        picture: profile.picture,
        provider: "auth0",
        auth0Id: profile.sub,
        role: "user",
        createdAt: new Date(),
      };
      const resultado = await usersCollection().insertOne(novoUsuario);
      user = { _id: resultado.insertedId, ...novoUsuario };
    }

    // MUDANCA: cria a sessao e grava no cookie httpOnly.
    const sessionToken = createSessionToken({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.cookie("session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ message: "Logged in successfully", user });
  } catch (error) {
    console.log("Error during authentication callback: ", error);
    return res.status(500).json({ error: "Authentication failed" });
  }
};

// MUDANCA: rota protegida. O middleware authenticate roda antes e
// preenche req.user; se nao houver sessao valida, o controller nem e chamado.
const me = (req, res) => {
  return res.json({ data: req.user });
};

module.exports = { login, logout, callback, me };