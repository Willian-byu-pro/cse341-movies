const { verifySessionToken } = require("../auth/session");

const authenticate = (req, res, next) => {
  const token = req.cookies?.session;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const payload = verifySessionToken(token);

  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = payload;
  return next();
};

module.exports = { authenticate };
