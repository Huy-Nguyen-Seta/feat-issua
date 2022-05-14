const expressJwt = require('express-jwt');
const config = require('../../config.json');

async function isRevoked(req, payload, done) {
  done();
}

function jwt() {
  const { secret } = config;
  return expressJwt({
    secret,
    getToken: function fromHeaderOrQuerystring(req) {
      const { token } = req.cookies || {};
      if (token) return token;
      return null;
    },
    algorithms: ['HS256'],
    isRevoked,
  }).unless({
    path: [
      // public routes that don't require authentication
      /^\/api\/user\/((?!(get-user-info|register-firebase|upload-image-register|role|manager|register|get-all-user|password|logout)).).*/,
      /^\/api\/engine\/.*/
    ]
  },);
}

module.exports = jwt;
