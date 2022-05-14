const named = require('yesql').pg;

function getAllUserInfoConditions({
  email, badgeNumber,
  status, title, managerId
}) {
  const joinConditions = [];

  if (email) joinConditions.push(`email like '%${email}%'`); // search tương đối cả trước cả sau
  if (badgeNumber) joinConditions.push(`badge_number = '${badgeNumber}'`);
  if (status) joinConditions.push(`status = '${status}'`);
  if (title) joinConditions.push(`title = '${title}'`);
  if (managerId) joinConditions.push(`manager_id = '${managerId}'`);

  let conditions = '';
  if (joinConditions.length) conditions = `where ${joinConditions.join(' and ')}`;

  return conditions;
}

function countAllUsersQuery(dataObject) {
  const conditions = getAllUserInfoConditions(dataObject);

  const query = `select count(*)::int from "user" ${conditions}`;

  return query;
}

function getAllUserInfoQuery(dataObject) {
  const { limit, offset } = dataObject;
  const conditions = getAllUserInfoConditions(dataObject);

  const query = `
  select u.id, u.badge_number, u.name, u.status, u.gender, 
    u.title, u.birth_day, u.phone, u.email, u.address,
    u.hired_date, u.created_date_time, u.modified_date_time,
  (select u1.name from "user" u1 where u1.id = u.manager_id) as manager_name,
  (select u2.badge_number from "user" u2 where u2.id = u.manager_id) as manager_badge_number,
  (select u3.id from "user" u3 where u3.id = u.manager_id) as manager_id
  from "user" u
  ${conditions}
  order by created_date_time desc
  limit ${limit} offset ${offset}`;

  return query;
}

function checkOldPassword({ userId }) {
  const query = `
  select password from "user" where id = '${userId}' limit 1;`;
  return query;
}

function insertNewPassword({ userId, hashedPassword }) {
  const query = `
  update "user" set password = '${hashedPassword}' 
  where id = '${userId}' returning id;`;
  return query;
}

function insertUserQuery(dataObject) {
  const insertFields = ['name', 'email', 'password', 'hired_date',
    'title', 'manager_id', 'badge_number', 'status'];
  const insertValue = [':name', ':email', ':password', ':hiredDate',
    ':title', ':managerId', ':badgeNumber', ':status'];

  const {
    gender, birthDay, phone, address
  } = dataObject;

  if (gender) {
    insertFields.push('gender');
    insertValue.push(':gender');
  }
  if (birthDay) {
    insertFields.push('birth_day');
    insertValue.push(':birthDay');
  }
  if (phone) {
    insertFields.push('phone');
    insertValue.push(':phone');
  }
  if (address) {
    insertFields.push('address');
    insertValue.push(':address');
  }

  const query = named(`
  insert into "user" (${insertFields.join(' , ')}) 
  values (${insertValue.join(' , ')}) 
  returning *
  `)({ ...dataObject });

  return query;
}

function saveImageUrls(dataObject) {
  const query = named(`
  insert into biometric (user_id, biometric_url)
  values (:userId, :biometricUrl) returning id;
  `)(dataObject);
  return query;
}

function deleteImageUrls(dataObject) {
  const query = named(`
  delete from biometric where user_id = :userId;
  `)(dataObject);
  return query;
}

function addNewSession(dataObject) {
  const query = named(`
  insert into session (user_email) values (:userId) returning id;
  `)(dataObject);
  return query;
}

function getEngineResult(dataObject) {
  const query = named(`
  select valid, complete from session where id = :sessionId limit 1
  `)(dataObject);
  return query;
}

module.exports = {
  getAllUserInfoQuery,
  countAllUsersQuery,
  checkOldPassword,
  insertNewPassword,
  insertUserQuery,
  saveImageUrls,
  addNewSession,
  getEngineResult,
  deleteImageUrls
};
