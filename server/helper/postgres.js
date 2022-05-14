const { Client } = require('pg');
const config = require('../../config.json');

let client;

(async function name() {
  client = new Client(config.sqlDB);
  console.log(config.sqlDB, 'config.sqlDB');
  try {
    await client.connect();
    return client;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}());

module.exports = {
  postgres: client,
};
