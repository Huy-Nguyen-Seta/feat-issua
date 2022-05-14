const named = require('yesql').pg;
const {
  forgetRequestTypeId,
  lateEarlyRequestTypeId,
  leaveRequestTypeId,
} = require('../helper/constants');

function getSharedTimeSheetQuery() {
  const sharedQuery = `
  from generate_series
      (:fromDate::date, :toDateUTC::date, '1 day'::interval) as t(day)
    left join time_sheet ts on 
      t.day::date = ts.date::date
      and ts.user_id = :userId
    left join request r on 
      r.user_id = :userId
      and r.status != 'rejected'
      and t.day::date = r.request_date::date
      and (r.request_type_id = '${forgetRequestTypeId}' 
        or r.request_type_id = '${lateEarlyRequestTypeId}')
    where t.day <= CURRENT_DATE`;

  return sharedQuery;
}

function countTimesheetQuery(dataObject) {
  const sharedQuery = getSharedTimeSheetQuery();

  const query = named(`select count(t.day)::int ${sharedQuery}`)(dataObject);

  return query;
}

function getMyTimesheetQuery(dataObject) {
  const sharedQuery = getSharedTimeSheetQuery();

  const query = named(`
  select ts.*, t.day as date,
  (select rt.name as request_type_name from request_type rt 
    where r.request_type_id = rt.id),
  r.status as request_status,
  r.manager_comment as admin_note,
  r.id as request_id
  ${sharedQuery}
  order by t.day desc
  limit :limit offset :offset
  `)(dataObject);
  return query;
}

function getSharedMemberTimeSheetQuery(dataObject) {
  let sharedQuery = `
  from generate_series 
    (:fromDate::date, :toDateUTC::date, '1 day'::interval) as t(day)
  left join "user" u on u.manager_id = :managerId
  left join time_sheet ts 
    on ts.date::date = t.day::date
    and ts.user_id = u.id
  left join request r on 
    r.request_date::date = ts.date::date
    and r.user_id = u.id
    and (r.request_type_id = '${forgetRequestTypeId}' 
      or r.request_type_id = '${lateEarlyRequestTypeId}')
  where t.day <= CURRENT_DATE and u.status = 'active'`;

  const badgeNumber = dataObject && dataObject.badgeNumber;
  if (badgeNumber) sharedQuery += ' and u.badge_number = :badgeNumber';

  return sharedQuery;
}

function countMemberTimesheetQuery(dataObject) {
  const sharedQuery = getSharedMemberTimeSheetQuery();

  const query = named(`select count(t.day)::int ${sharedQuery}`)(dataObject);

  return query;
}

function getMemberTimesheetQuery(dataObject) {
  const sharedQuery = getSharedMemberTimeSheetQuery(dataObject);

  const query = named(`
  select ts.*, t.day as date, u.name, u.badge_number,
  (select u1.name as manager_name from "user" u1 
    where u1.id = u.manager_id),
  (select rt.name as request_type from request_type rt 
    where r.request_type_id = rt.id),
  r.manager_comment as admin_note
  ${sharedQuery}
  order by t.day desc, u.name asc, u.badge_number asc
  limit :limit offset :offset
  `)(dataObject);

  return query;
}

function getATimesheetQuery(dataObject) {
  const query = named(`
  select * from time_sheet 
  where user_id = :userId and date = :date limit 1
  `)(dataObject);

  return query;
}

function countAllTimesheetQuery(dataObject) {
  const userCondition = dataObject.badgeNumber
    ? 'u.badge_number = :badgeNumber'
    : 'u.id is not null';
  const query = named(`
  select count(t.day)::int
  from generate_series
    (:fromDate::date, :toDateUTC::date, '1 day'::interval) as t(day)
  left join "user" u on ${userCondition}
  left join time_sheet ts 
    on ts.date::date = t.day::date
    and ts.user_id = u.id
  left join request r on 
    (
      r.request_date::date = ts.date::date
      or (
        r.request_type_id = '${leaveRequestTypeId}' 
        and ts.date::date between r.start_date_time::date and r.end_date_time::date
      )
    )
    and r.user_id = u.id
    and r.status != 'rejected'
  where t.day <= CURRENT_DATE and u.status = 'active'
  `)(dataObject);

  return query;
}

function getAllTimesheetQuery(dataObject) {
  const userCondition = dataObject.badgeNumber
    ? "u.badge_number = :badgeNumber and u.status = 'active'"
    : "u.status = 'active'";

  const query = named(`
  select ts.*, t.day as date, u.name, u.badge_number,
  (select u1.name as manager_name from "user" u1
    where u1.id = u.manager_id),
  (select rt.name as request_type from request_type rt
    where r.request_type_id = rt.id),
  r.manager_comment as admin_note,
  r.status as request_status
  from generate_series
    (:fromDate::date, :toDateUTC::date, '1 day'::interval) as t(day)
  left join "user" u on ${userCondition}
  left join time_sheet ts
    on ts.date::date = t.day::date
    and ts.user_id = u.id
  left join request r on 
    (
      r.request_date::date = t.day::date
      or (
        r.request_type_id = '${leaveRequestTypeId}' 
        and t.day::date::date between r.start_date_time::date and r.end_date_time::date
      )
    )
    and r.user_id = u.id
    and r.status = 'approved'
  where t.day <= CURRENT_DATE and u.status = 'active'
  order by t.day desc, u.name asc, u.badge_number asc
  limit :limit offset :offset
  `)(dataObject);

  return query;
}

function exportTimesheetQuery(dataObject) {
  const userCondition = dataObject.badgeNumber
    ? "u.badge_number = :badgeNumber and u.status = 'active'"
    : "u.status = 'active'";

  const query = named(`
  select ts.*, t.day as date, u.name, u.badge_number,
  wt.from_time, wt.to_time,
  (select u1.name as manager_name from "user" u1
    where u1.id = u.manager_id),
  (select rt.name as request_type from request_type rt
    where r.request_type_id = rt.id),
  r.manager_comment as admin_note,
  r.status as request_status,
  r.off_time_hour
  from generate_series
    (:fromDate::date, :toDateUTC::date, '1 day'::interval) as t(day)
  left join "user" u on ${userCondition}
  left join time_sheet ts
    on ts.date::date = t.day::date
    and ts.user_id = u.id
  left join request r on 
    (
      r.request_date::date = t.day::date
      or (
        r.request_type_id = '${leaveRequestTypeId}' 
        and t.day::date::date between r.start_date_time::date and r.end_date_time::date
      )
    )
    and r.user_id = u.id
    and r.status = 'approved'
  inner join work_time wt on wt.user_id = u.id
  where t.day <= CURRENT_DATE and wt.from_date <= t.date and (t.date <= wt.to_date or wt.to_date is NULL) and u.status = 'active'
  order by u.badge_number, u.name, t.day, ts.date;
  `)(dataObject);

  return query;
}

module.exports = {
  countTimesheetQuery,
  getMyTimesheetQuery,
  countMemberTimesheetQuery,
  getMemberTimesheetQuery,
  getATimesheetQuery,
  countAllTimesheetQuery,
  getAllTimesheetQuery,
  exportTimesheetQuery,
};
