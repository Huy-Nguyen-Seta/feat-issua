const named = require('yesql').pg;
const {
  lateEarlyRequestTypeId,
  leaveRequestTypeId,
  forgetRequestTypeId
} = require('../helper/constants');

function sendMailToPMQuery({ userId, requestId }) {
  const query = `select u.name, u.badge_number,
  u1.name as manager_name, u1.email as manager_email,
  (select name as request_type_name from request_type rt
    inner join request r on r.id = '${requestId}' and r.request_type_id = rt.id)
  from "user" u
  inner join "user" u1 on u1.id = u.manager_id
  where u.id = '${userId}' and u1.status = 'active';`;
  return query;
}

function sendMailToStaffQuery({ requestId, userId }) {
  const query = `select
  u.name as staff_name, u.email as staff_email,
  (select name as manager_name from "user" u1 where u1.id = '${userId}'),
  rt.name as request_type_name  
  from request r
  inner join "user" u on r.user_id = u.id
  inner join request_type rt on rt.id = r.request_type_id
  where r.id = '${requestId}' and u.status = 'active';`;
  return query;
}

function getRequestConditions({
  fromDate, toDateUTC, badgeNumber,
  requestTypeIds, reasonId,
  status, isForManager = false
}) {
  const joinConditions = [];
  joinConditions.push(
    isForManager
      ? 'u.manager_id = :userId and u.status = \'active\''
      : 'r.user_id = :userId'
  );

  if (badgeNumber) joinConditions.push('u.badge_number = :badgeNumber');
  if (reasonId) joinConditions.push('r.reason_id = :reasonId');
  if (status) joinConditions.push('r.status = :status');

  if (fromDate && toDateUTC) {
    joinConditions.push(`
    ((r.request_date::date between :fromDate::date and :toDateUTC::date)
      or (r.start_date_time::date >= :fromDate::date
        and r.end_date_time::date <= :toDateUTC::date))`);
  }

  const requestTypeIdConditions = [];
  if (requestTypeIds && requestTypeIds.length) {
    requestTypeIds.forEach((id) => {
      requestTypeIdConditions.push(`r.request_type_id = '${id}'`);
    });
    joinConditions.push(`(${requestTypeIdConditions.join(' or ')})`);
  }

  let conditions = '';
  if (joinConditions.length) conditions = `where ${joinConditions.join(' and ')}`;

  return conditions;
}

function countMyRequestQuery(dataObject) {
  const conditions = getRequestConditions(dataObject);

  const query = named(`select count(*)::int from request r
    ${conditions}`)(dataObject);

  return query;
}

function getMyRequestQuery(dataObject) {
  const conditions = getRequestConditions(dataObject);

  const query = named(`
  select r.*, 
  (case when r.off_time_hour is not null
    then r.off_time_hour::float else null end) as off_time_hour,
  rt.name as request_type_name,
  u.badge_number, u.name, re.name as reason, 
  (select u2.name from "user" u2 where u2.id = r.approve_by) as approve_name,
  (select u3.name from "user" u3 where u3.id = r.confirm_by) as confirm_by_name
  from request r
  left join "user" u on u.id = r.user_id
  left join reason re on re.id = r.reason_id
  left join request_type rt on rt.id = r.request_type_id
  ${conditions}
  order by r.created_date_time desc
  limit :limit offset :offset
   `)(dataObject);

  return query;
}

function countRequestsQuery(dataObject) {
  const conditions = getRequestConditions({ ...dataObject, isForManager: true });

  const query = named(`select count(*)::int from request r
  left join "user" u on u.id = r.user_id
  left join reason re on re.id = r.reason_id
  ${conditions}`)(dataObject);

  return query;
}

function getRequestsQuery(dataObject) {
  const conditions = getRequestConditions({ ...dataObject, isForManager: true });

  const query = named(`
  select r.*, 
  (case when r.off_time_hour is not null
    then r.off_time_hour::float else null end) as off_time_hour,
  rt.name as request_type_name,
  u.badge_number, u.name, re.name as reason,
  (select u2.name from "user" u2 where u2.id = r.approve_by) as approve_name,
  (select u3.name from "user" u3 where u3.id = r.confirm_by) as confirm_by_name
  from request r
  left join "user" u on u.id = r.user_id
  left join reason re on re.id = r.reason_id
  left join request_type rt on rt.id = r.request_type_id
  ${conditions}
  order by r.created_date_time desc
  limit :limit offset :offset
  `)(dataObject);

  return query;
}

function postCompensationRequestQuery(dataObject) {
  const query = named(`
  insert into request (user_id, request_type_id, status, comment, 
    error_count, request_date, compensation_date) 
  values (:userId, :requestTypeId, :status, :comment, 
    :errorCount, :requestDate, :compensationDate) 
  returning *
  `)({ ...dataObject });

  return query;
}

function postLeaveRequestQuery(dataObject) {
  const query = named(`
  insert into request (user_id, request_type_id, status, comment, 
    reason_id, error_count, start_date_time, end_date_time, off_time_hour) 
  values (:userId, :requestTypeId, :status, :comment, 
    :reasonId, :errorCount, :startDateTime, :endDateTime, :offTimeHour) 
  returning *
  `)({ ...dataObject });

  return query;
}

function checkDuplicateLeaveRequestQuery({
  startDateTime, endDateTime,
  reasonId, userId
}) {
  const query = `
  select br.duration
  from  (
    values 
        ('[${startDateTime}, ${endDateTime}]'::tstzrange)
    ) br(duration)
  where exists (
    select from request r
    where
      (tstzrange(r.start_date_time, r.end_date_time) && br.duration)
      and r.user_id = '${userId}'
      and r.reason_id = '${reasonId}'
      and r.request_type_id = '${leaveRequestTypeId}'
      and r.status != 'rejected'
  )`;
  return query;
}

function findDuplicateLeaveRequestQuery({
  startDateTime,
  endDateTime,
  requestId,
  userId
}) {
  const query = `
  select br.duration
  from  (
    values 
        ('[${startDateTime}, ${endDateTime}]'::tstzrange)
    ) br(duration)
  where exists (
    select from request r
    where
      (tstzrange(r.start_date_time, r.end_date_time) && br.duration)
      and r.id != '${requestId}'
      and r.user_id = '${userId}'
      and r.request_type_id = '${leaveRequestTypeId}'
      and r.status != 'rejected'
  )`;
  return query;
}

function postForgetRequestQuery(dataObject) {
  const insertFields = ['user_id', 'request_type_id', 'status',
    'comment', 'request_date', 'error_count'];
  const insertValue = [':userId', ':requestTypeId', ':status',
    ':comment', ':requestDate', ':errorCount'];
  const { startDateTime, endDateTime } = dataObject;
  if (startDateTime) {
    insertFields.push('start_date_time');
    insertValue.push(':startDateTime');
  }
  if (endDateTime) {
    insertFields.push('end_date_time');
    insertValue.push(':endDateTime');
  }
  const query = named(`
  insert into request (${insertFields.join(' , ')}) 
  values (${insertValue.join(' , ')}) 
  returning *
  `)({ ...dataObject });

  return query;
}

function findDuplicateForgetRequestQuery(dataObject) {
  const query = named(`
  select * from request
  where 
    user_id = :userId
    and request_date::date = :requestDate::date
    and request_type_id = '${forgetRequestTypeId}'
    and status != 'rejected'
  `)({ ...dataObject });
  return query;
}

function findDuplicateCompensationRequestQuery(dataObject) {
  const query = named(`
  select * from request
  where 
    user_id = :userId 
    and request_date::date = :requestDate::date
    and request_type_id = '${lateEarlyRequestTypeId}'
    and status != 'rejected'
  `)({ ...dataObject });
  return query;
}

function countNumberOfCompThisMonthQuery(dataObject) {
  const query = named(`
  select distinct compensation_date from request 
    where request_type_id = '${forgetRequestTypeId}'
    and error_count = 'true'
    and user_id = :userId
    and compensation_date::date between :from and :to
    and status != 'rejected'
  `)({ ...dataObject });
  return query;
}

function selectWorkTimeQuery({ userId, startDateTime, endDateTime }) {
  const query = `
  select
  from_date, to_date,
  (extract(hour from from_time) + extract(minute from from_time) / 60) as from_time, 
  (extract(hour from to_time) + extract(minute from to_time) / 60) as to_time,
  (extract(hour from start_break_time) + extract(minute from start_break_time) / 60) as start_break_time,
  (extract(hour from end_break_time) + extract(minute from end_break_time) / 60) as end_break_time
  from work_time 
  where user_id = '${userId}' 
    and (case when to_date is not null 
      then to_date::date >= '${startDateTime}'::date
      else true end)
    and from_date::date <= '${endDateTime}'::date
  order by from_date`;
  return query;
}

function selectTimesheetQuery(dataObject) {
  const query = named(`
  select ts2.over_time,
  (select lack from time_sheet ts1 
    where ts1.date::date = :requestDate::date and user_id = :userId limit 1) as lack
  from time_sheet ts2
  where ts2.date::date = :compensationDate::date 
    and user_id = :userId
  limit 1
  `)({ ...dataObject });

  return query;
}

function selectCompensationTimeQuery(dataObject) {
  const query = named(`
  select
  (select ts1.over_time::interval from time_sheet ts1
    where ts1.user_id = :userId
      and ts1."date"::date = :compensationDate::date) as overtime,
  (select ts2.lack::interval from time_sheet ts2
    where ts2.user_id = :userId 
      and ts2."date"::date = :requestDate::date) as requesttime,
  sum(ts.comp::interval)::interval as currentcomp
  from time_sheet ts
  inner join request r on
    r.request_date::date = ts."date"::date
    and r.user_id = ts.user_id
    and r.request_type_id = '${lateEarlyRequestTypeId}'
  where
    r.compensation_date::date = :compensationDate::date
    and ts.user_id = :userId;
  `)({ ...dataObject });
  return query;
}

function updatedRequestDateTimesheetQuery(dataObject) {
  const query = named(`
  update time_sheet set comp = :comp 
  where date::date = :requestDate::date and user_id = :userId
  returning *;
  `)({ ...dataObject });

  return query;
}

function countForgetRequestQuery(dataObject) {
  const query1 = named(`
  select count(*)::int from request 
  where request_type_id = :requestTypeId
  and error_count = 'true'
  and user_id = :userId
  and request_date between :fromDate and :toDateUTC
  and status != 'rejected'
  `)({ ...dataObject });
  const query2 = named(`
  select count(*)::int from request 
  where request_type_id = :requestTypeId
  and error_count = 'true'
  and user_id = :userId
  and request_date between :fromDate and :toDateUTC
  and start_date_time is not null and end_date_time is not null
  and status != 'rejected'
  `)({ ...dataObject });
  return { query1, query2 };
}

function countNewRequestsForPM({ managerId }) {
  const query = `
  select count(r.*)::int from request r
  inner join "user" u on u.id = r.user_id
  where r.status = 'new' and u.manager_id = '${managerId}';
  `;
  return query;
}

function getRequestForAdminQuery({
  badgeNumber, limit, offset,
  fromDate, toDateUTC,
  managerId, status, requestTypeIds
}) {
  const conditions = ['u.status = \'active\''];

  if (badgeNumber) conditions.push('u.badge_number = :badgeNumber');
  if (fromDate && toDateUTC) {
    conditions.push(`
    ((r.request_date::date between :fromDate::date and :toDateUTC::date)
    or (r.start_date_time::date >= :fromDate::date
      and r.end_date_time::date <= :toDateUTC::date))`);
  }
  if (managerId) conditions.push('u.manager_id = :managerId');
  if (status) conditions.push('r.status = :status');

  const requestTypeIdConditions = [];
  if (requestTypeIds && requestTypeIds.length) {
    requestTypeIds.forEach((id) => {
      requestTypeIdConditions.push(`r.request_type_id = '${id}'`);
    });
    conditions.push(`(${requestTypeIdConditions.join(' or ')})`);
  }

  const query = named(` 
  select r.*, 
  (case when r.off_time_hour is not null
    then r.off_time_hour::float else null end) as off_time_hour,
  rt.name as request_type_name,
  u.badge_number, u.name,
  (select u1.name from "user" u1 where u1.id = r.approve_by) as approve_by_name,
  (select u2.name from "user" u2 where u2.id = r.confirm_by) as confirm_by_name,
  (select u3.name from "user" u3 where u3.id = u.manager_id) as manager_name,
  re.name as reason
  from request r
  inner join request_type rt on rt.id = r.request_type_id
  inner join "user" u on u.id = r.user_id
  left join reason re on re.id = r.reason_id
  where ${conditions.join(' and ')}
  order by r.created_date_time desc, u.badge_number
  limit :limit offset :offset
   `)({
    badgeNumber,
    limit,
    offset,
    fromDate,
    toDateUTC,
    managerId,
    status,
    requestTypeIds
  });

  return query;
}

function countRequestForAdminQuery({
  badgeNumber, limit, offset,
  fromDate, toDateUTC,
  managerId, status, requestTypeIds
}) {
  const conditions = ['u.status = \'active\''];
  if (badgeNumber) conditions.push('u.badge_number = :badgeNumber');
  if (fromDate && toDateUTC) {
    conditions.push(`
    ((r.request_date::date between :fromDate::date and :toDateUTC::date)
    or (r.start_date_time::date >= :fromDate::date
      and r.end_date_time::date <= :toDateUTC::date))`);
  }
  if (managerId) conditions.push('u.manager_id = :managerId');
  if (status) conditions.push('r.status = :status');

  const requestTypeIdConditions = [];
  if (requestTypeIds && requestTypeIds.length) {
    requestTypeIds.forEach((id) => {
      requestTypeIdConditions.push(`r.request_type_id = '${id}'`);
    });
    conditions.push(`(${requestTypeIdConditions.join(' or ')})`);
  }

  const query = named(` 
  select count(r.*)::int
  from request r
  inner join "user" u on u.id = r.user_id
  where ${conditions.join(' and ')}
   `)({
    badgeNumber,
    limit,
    offset,
    fromDate,
    toDateUTC,
    managerId,
    status,
    requestTypeIds
  });

  return query;
}

module.exports = {
  sendMailToPMQuery,
  sendMailToStaffQuery,
  countMyRequestQuery,
  getMyRequestQuery,
  getRequestsQuery,
  countRequestsQuery,
  postCompensationRequestQuery,
  postLeaveRequestQuery,
  checkDuplicateLeaveRequestQuery,
  postForgetRequestQuery,
  findDuplicateForgetRequestQuery,
  findDuplicateCompensationRequestQuery,
  findDuplicateLeaveRequestQuery,
  selectWorkTimeQuery,
  selectTimesheetQuery,
  selectCompensationTimeQuery,
  updatedRequestDateTimesheetQuery,
  countForgetRequestQuery,
  countNewRequestsForPM,
  getRequestForAdminQuery,
  countRequestForAdminQuery,
  countNumberOfCompThisMonthQuery
};
