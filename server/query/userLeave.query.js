const totalTimeUserLeaveByYear = ({ year, reasonId }) => {
  const query = `
  select u.id, u.name, u.max_leave_day,u.hired_date , '${year}' as year, sum(r.off_time_hour) as time_leave from "user" u
  left join "request" r on u.id = r.user_id 
    and r.reason_id='${reasonId}' 
    and EXTRACT(YEAR FROM r.end_date_time) = ${year}
    and r.status in('confirmed','approved') 
  where u.status = 'active'
  group by u.id;
  `;
  return query;
};

const getUserLeaveByUserIdAndYear = ({ userId, year }) => {
  const sql = `select * from user_leave where user_id='${userId}' and year = ${year};`;
  return sql;
};

const formatStringInsertUserLeave = ({
  totalLeave, totalRemain, carryOver, carryOverRemain, userId, year
}) => ` 
select updateOrInsertUserLeave(${totalLeave}, ${totalRemain}, ${carryOver}, ${carryOverRemain}, ${year}, '${userId}');`;

const insertAllUserLeaveQuery = (lst) => {
  const sql = lst.map((e) => formatStringInsertUserLeave(e)).join('');
  return sql;
};
const insertOrUpdateUserLeave = ({
  totalLeave, totalRemain, carryOver, carryOverRemain, userId, year, isInsert = true
}) => {
  if (isInsert) {
    return `
    insert into user_leave(total_leave, total_remain, carry_over, carry_over_remain, year, user_id)
    values (${totalLeave}, ${totalRemain}, ${carryOver}, ${carryOverRemain}, ${year}, '${userId}') 
    `;
  }
  return `
  update "user_leave" 
  set total_leave = ${totalLeave}, total_remain = ${totalRemain},
      carry_over = ${carryOver}, carry_over_remain = ${carryOverRemain} 
  where user_id = ${userId} and year = ${year}
  `;
};

const insertUserLeave = ({
  totalLeave, totalRemain, carryOver, carryOverRemain, userId, year,
}) => {
  const sql = `
    insert into user_leave(total_leave, total_remain, carry_over, carry_over_remain, year, user_id)
    values (${totalLeave}, ${totalRemain}, ${carryOver}, ${carryOverRemain}, ${year}, '${userId}') 
    `;
  return sql;
};

const updateUserLeaveQuery = ({
  totalLeave,
  totalRemain,
  carryOver,
  carryOverRemain,
  userId,
  year
}) => {
  const query = `
  update "user_leave" 
  set total_leave = ${totalLeave}, total_remain = ${totalRemain},
      carry_over = ${carryOver},
      carry_over_remain = ${carryOverRemain}  
  where user_id = '${userId}' and year = ${year} 
  returning *;
  `;
  return query;
};

const checkUserLeaveExist = ({ userId, year }) => {
  const query = `
  select count(ul.id) from "user_leave" ul 
  where ul.year = ${year} and ul.user_id='${userId}'
  `;
  return query;
};

const getAllUserLeaveConditions = ({
  badgeNumber, name, year, title
}) => {
  const joinConditions = [];
  if (badgeNumber) joinConditions.push(`u.badge_number = '${badgeNumber}'`);
  if (name) joinConditions.push(`u.name like '%${name}%'`);
  if (year) joinConditions.push(`ul.year = ${year}`);
  if (title) joinConditions.push(`u.title = '${title}'`);
  let strCondition = '';
  if (joinConditions.length) {
    strCondition = ` and ${joinConditions.join(' and ')}`;
  }
  return strCondition;
};

const getAllUserLeaveQuery = (dataFilter) => {
  const { limit, offset } = dataFilter;
  const conditions = getAllUserLeaveConditions(dataFilter);

  const query = `
  select ul.*,u.name ,u.badge_number, u.title from "user" u, "user_leave" ul
  where  u.id = ul.user_id and u.status like 'active'
  ${conditions}
  limit ${limit} offset ${offset}
  `;
  return query;
};

const countAllUserLeaveQuery = (dataFilter) => {
  const conditions = getAllUserLeaveConditions(dataFilter);
  const query = `
  select count(ul.id) as count from "user" u, "user_leave" ul
  where  u.id = ul.user_id and u.status like 'active'
  ${conditions}
  `;
  return query;
};

module.exports = {
  totalTimeUserLeaveByYear,
  formatStringInsertUserLeave,
  insertAllUserLeaveQuery,
  getAllUserLeaveConditions,
  getAllUserLeaveQuery,
  countAllUserLeaveQuery,
  insertOrUpdateUserLeave,
  checkUserLeaveExist,
  updateUserLeaveQuery,
  getUserLeaveByUserIdAndYear,
  insertUserLeave
};
