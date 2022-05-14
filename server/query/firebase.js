function getFirebaseTokens({ userId }) {
  const query = `select * from firebase where user_id = '${userId}' limit 1`;
  return query;
}

function getManagerIdQuery({ userId }) {
  const query = `
  select manager_id, name, badge_number from "user"
  where id = '${userId}' limit 1`;
  return query;
}

module.exports = { getFirebaseTokens, getManagerIdQuery };
