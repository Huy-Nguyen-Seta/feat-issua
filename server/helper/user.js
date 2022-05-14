const named = require('yesql').pg;
const camelcaseKeys = require('camelcase-keys');

/**
 * This function get user from database
 * by id or by jwt token
 * @param id id of user
 * @param token JWT token contains userId. used when id == null
 * token will be validated. Throw error if not valid.
 * @param postgres postgres instance to query the database
 * @returns {err, code, user}
 * err: error obj, null if success
 * code: convenient for responding the status code.
 * 200 - success
 * 400 - Unauthorized
 * 500 - internal server error
 * user: User object
 */
async function getUser(postgres, id) {
  if (!id) {
    return {
      err: Error('id must not be null'),
      code: 404,
      user: null,
    };
  }
  const user = await postgres.query(named('select * FROM public."user" where id = :id limit 1')({
    id
  }));
  if (!user.rowCount) {
    return {
      err: Error('User not found'),
      code: 404,
      user: null,
    };
  }
  delete user.rows[0].password;
  return {
    err: null,
    code: 200,
    user: user.rows[0],
  };
}

async function getUserRow(req, columnName, columnValue) {
  if (!req || !columnName || !columnValue) return;
  const year = new Date().getFullYear();
  const user = await req.postgres.query(`
  select u.*, ul.total_remain,ul.carry_over_remain,
  w.from_time, w.to_time, w.start_break_time, w.end_break_time
  from "user" u
  left join work_time w on w.user_id = u.id
  left join "user_leave" ul on u.id = ul.user_id and ul.year = ${year}
  where u.${columnName} = '${columnValue}'
  order by w.from_date desc
  limit 1`);
  return user;
}

function getUserInfo(userRow) {
  if (!userRow || typeof userRow !== 'object') return;
  const userObject = { ...userRow };
  userObject.hasBiometric = !!userObject.biometric_url;
  delete userObject.biometric_url;
  delete userObject.password;
  const data = camelcaseKeys(userObject);
  return data;
}

module.exports = { getUser, getUserRow, getUserInfo };
