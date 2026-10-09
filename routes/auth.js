const router = require("express").Router();
const { callback, login, logout, me } = require("../controllers/auth");
// MUDANCA: o middleware que protege a rota /me
const { authenticate } = require("../middleware/authenticate");

// PT: Cada rota ganhou um corpo para as anotacoes #swagger, igual ao que
//     ja era feito em routes/movies.js. Sem o corpo nao ha onde anotar.
// EN: Each route now has a body to hold the #swagger annotations, just like
//     routes/movies.js already did. Without a body there is nowhere to annotate.

router.get("/login", (req, res) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Start the login flow'
    #swagger.description = 'Generates a random state value, stores it in a short lived httpOnly cookie, and redirects the browser to Auth0. The user authenticates on Auth0, so this API never sees their password.'
    #swagger.responses[302] = { description: 'Redirect to the Auth0 login page.' }
  */
  login(req, res);
});

router.get("/callback", (req, res) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'OAuth callback'
    #swagger.description = 'Auth0 redirects here with a one time authorization code. The server checks the state parameter against the cookie to prevent CSRF, exchanges the code for tokens server to server, creates the user on first login, and sets the httpOnly session cookie.'
    #swagger.parameters['code'] = { in: 'query', description: 'One time authorization code issued by Auth0.', required: true, type: 'string' }
    #swagger.parameters['state'] = { in: 'query', description: 'Random value that must match the oauth_state cookie.', required: true, type: 'string' }
    #swagger.responses[200] = { description: 'Logged in. The session cookie is set and the user is returned.' }
    #swagger.responses[400] = { description: 'Invalid state parameter or missing authorization code.' }
    #swagger.responses[500] = { description: 'Authentication failed.' }
  */
  callback(req, res);
});

router.get("/logout", (req, res) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Log out'
    #swagger.description = 'Clears the session cookie and redirects to Auth0 so the Auth0 session ends as well. Clearing only the local cookie would let the next login skip the password prompt.'
    #swagger.responses[302] = { description: 'Redirect to the Auth0 logout endpoint.' }
  */
  logout(req, res);
});

// MUDANCA: dois handlers. O authenticate roda primeiro e barra quem nao
// tem sessao, devolvendo 401 sem nunca chamar o "me".
router.get("/me", authenticate, (req, res) => {
  /*
    #swagger.tags = ['Auth']
    #swagger.summary = 'Get the logged in user'
    #swagger.description = 'Returns the user carried by the session cookie. This route is only available to authenticated users and is the simplest way to check whether a session is active.'
    #swagger.security = [{ "cookieAuth": [] }]
    #swagger.responses[200] = { description: 'The authenticated user.' }
    #swagger.responses[401] = { description: 'Authentication required, or the session is invalid or expired.' }
  */
  me(req, res);
});

module.exports = router;
