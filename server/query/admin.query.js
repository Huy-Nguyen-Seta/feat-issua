const named = require('yesql').pg;

function getAllHolidaysQuery() {
  const query = `select *, 
  to_char(start_date::date, 'yyyy-mm-dd') as start_date,
  to_char((start_date::date + duration::int - 1)::date, 'yyyy-mm-dd') as end_date
  from holiday`;
  return query;
}

function deleteHolidayQuery({ id }) {
  const query2 = `
  delete from holiday h where h.id = '${id}';`;
  const query1 = `
  update time_sheet set holiday_id = null where holiday_id = '${id}';`;
  return { query1, query2 };
}

function insertHolidayQuery(dataObject) {
  const query = named(`
  insert into holiday (name, start_date, duration, description)
  values (:name, :startDate, :duration, :description) 
  returning *`)(dataObject);
  return query;
}

function updateHolidayIdInTimesheetQuery(dataObject) {
  const query = named(`
  update time_sheet set holiday_id = :id
  where date::date between :startDate::date and :endDate::date
  returning *`)(dataObject);
  return query;
}

function checkDuplicateHolidayQuery({ startDate, endDate, id }) {
  const condition = id ? 'and h2.id != :id' : '';

  const query = named(`
  select *
  from holiday h2 
  where
    daterange(:startDate::date, :endDate::date, '[]') 
    && daterange(
      h2.start_date::date,
      (h2.start_date::date + h2.duration::int - 1)::date,
      '[]'
    )
    ${condition};`)({ startDate, endDate, id });

  return query;
}

function insertWorkTimeQuery(dataObject) {
  let insertFields = `user_id, from_date, from_time, to_time, 
  start_break_time, end_break_time`;
  let insertValue = `:userId, :fromDate, :fromTime, :toTime,
  :startBreakTime, :endBreakTime`;
  if (dataObject.toDate) {
    insertFields += ', to_date';
    insertValue += ', :toDate';
  }
  if (dataObject.description) {
    insertFields += ', description';
    insertValue += ', :description';
  }
  const query = named(`
  insert into work_time (${insertFields}) values (${insertValue}) 
  returning id`)(dataObject);
  return query;
}

function getLatestWorkTimeQuery({ userId }) {
  const query = `select id from work_time
  where user_id = '${userId}'
  order by from_date desc
  limit 1`;
  return query;
}

function updateLatestWorkTimeQuery({ id, toDate }) {
  const query = `update work_time 
  set to_date = '${toDate}'
  where id = '${id}'`;
  return query;
}

function checkDuplicateWorkTimeQuery({ fromDate, toDate, userId, id }) {
  let fromDateStr = fromDate;
  let toDateStr = toDate;
  if (typeof fromDate === 'object') fromDateStr = fromDate.toISOString();
  if (typeof toDate === 'object') {
    toDateStr = toDate.toISOString();
  } else {
    const toDateObj = new Date(toDateStr || fromDate);
    toDateObj.setDate(toDateObj.getDate() + 1);
    toDateStr = toDateObj.toISOString();
  }

  const query = `
  select br.duration
  from  (
    values ('[${fromDateStr}, ${toDateStr}]'::tstzrange)
    ) br(duration)
    where exists (
      select from work_time wt
      where
        (case when wt.to_date is not null 
          then (tstzrange(wt.from_date::date, wt.to_date::date) && br.duration)
          else (tstzrange(wt.from_date::date, (wt.from_date + interval '1 day')::date) && br.duration)
          end
        )
        and wt.user_id = '${userId}'
        ${id ? `and id != '${id}'` : ''}
    );`;

  return query;
}

function getWorkTimeQuery({ userId }) {
  const query = `select * from work_time 
  where user_id = '${userId}'
  order by from_date desc`;
  return query;
}

function updateHoliday({ id, startDate, duration, description, name }) {
  const insertValue = [];
  if (startDate) insertValue.push('start_date = :startDate');
  if (duration) insertValue.push('duration = :duration');
  if (description) insertValue.push('description = :description');
  if (name) insertValue.push('name = :name');

  const query = named(`
  update holiday set ${insertValue.join(' , ')} 
  where id = :id returning id`)({
    id,
    startDate,
    duration,
    description,
    name,
  });

  return query;
}

function deleteHolidayIdInTimesheet({ holidayId }) {
  const query = `update time_sheet set holiday_id = null
  where holiday_id = '${holidayId}'`;
  return query;
}

function selectTimesheet(dataObject) {
  const query = named(`
  select * from time_sheet
  where user_id = :userId 
  and date::date between :fromDate::date and :toDate::date
  `)(dataObject);
  return query;
}

function updateTimesheetQuery(dataObject) {
  const query = named(`
  update time_sheet
  set work_time = :workTime, late = :late,
  early = :early, lack = :lack,
  in_office = :inOffice, over_time = :overTime
  where user_id = :userId and date::date = :date::date
  `)(dataObject);
  return query;
}

function updateWorkingTime({
  fromDate,
  toDate,
  fromTime,
  toTime,
  startBreakTime,
  endBreakTime,
  description,
  id,
}) {
  const fields = [];

  if (fromDate) fields.push('from_date = :fromDate');
  if (toDate) fields.push('to_date = :toDate');
  if (fromTime) fields.push('from_time = :fromTime');
  if (toTime) fields.push('to_time = :toTime');
  if (startBreakTime) fields.push('start_break_time = :startBreakTime');
  if (endBreakTime) fields.push('end_break_time = :endBreakTime');
  if (description) fields.push('description = :description');

  if (!fields.length) return;

  return named(`update work_time set ${fields.join(' , ')}
    where id = :id returning *`)({
    fromDate,
    toDate,
    fromTime,
    toTime,
    startBreakTime,
    endBreakTime,
    description,
    id,
  });
}

function deleteWorkingTime({ id }) {
  return `delete from work_time where id = '${id}';`;
}

module.exports = {
  updateWorkingTime,
  checkDuplicateHolidayQuery,
  insertHolidayQuery,
  updateHolidayIdInTimesheetQuery,
  getAllHolidaysQuery,
  deleteHolidayQuery,
  insertWorkTimeQuery,
  getLatestWorkTimeQuery,
  updateLatestWorkTimeQuery,
  checkDuplicateWorkTimeQuery,
  getWorkTimeQuery,
  updateHoliday,
  deleteHolidayIdInTimesheet,
  selectTimesheet,
  updateTimesheetQuery,
  deleteWorkingTime,
};
