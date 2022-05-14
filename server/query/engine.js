const named = require('yesql').pg;

function getBiometricsQuery() {
  const query = `select biometric_url, badge_number from "user"
  where biometric_url is not null and badge_number is not null;`;
  return query;
}

function getImageBiometricQuery() {
  const query = `select 
  (select u.badge_number as badge_number from "user" u where u.id = b.user_id),
  biometric_url 
  from "biometric" b
  where b.biometric_url is not null`;
  return query;
}
function postCheckInOutQuery(dataObject) {
  const query = named(`
  insert into bio_check_in_out (check_time, badge_number, sensor_id)
  values (:checkTime, :badgeNumber, :sensorId) 
  returning *`)(dataObject);
  return query;
}

module.exports = {
  getBiometricsQuery,
  postCheckInOutQuery,
  getImageBiometricQuery
};
