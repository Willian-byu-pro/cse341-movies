const jwt = require("jsonwebtoken");

const sessionSecret = process.env.SESSION_SECRET;

const createSessionToken = (payload) => {

  return jwt.sign(payload, sessionSecret, { expiresIn: "1d" });
};

const verifySessionToken = (token) => {

  try {
    return jwt.verify(token, sessionSecret);
  } catch {
    return null;
  }
};

module.exports = { createSessionToken, verifySessionToken };