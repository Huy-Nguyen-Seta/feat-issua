const axios = require('axios');
const config = require('../../config.json');

function postBiometrics(payload) {
  console.log('===== Call engine payload and url', payload, `${config.engineURL}/engine`);
  return axios
    .post(`${config.engineURL}/engine`, payload)
    .catch((err) => ({ error: err.toString() }));
}

module.exports = { postBiometrics };
