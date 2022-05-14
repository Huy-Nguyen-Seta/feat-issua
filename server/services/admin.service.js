const moment = require('moment-timezone');
const { countOffdays, camelCaseData } = require('../helper/calculation');
const {
  checkDuplicateHolidayQuery,
  insertHolidayQuery,
  updateHolidayIdInTimesheetQuery,
  getAllHolidaysQuery,
  insertWorkTimeQuery,
  getLatestWorkTimeQuery,
  updateLatestWorkTimeQuery,
  checkDuplicateWorkTimeQuery,
  getWorkTimeQuery,
  deleteHolidayQuery,
} = require('../query/admin.query');
const adminQuery = require('../query/admin.query');
const {
  getLate,
  getEarly,
  getLack,
  getOverTime,
  getWorkTime,
} = require('../utils/timesheet');

async function checkDuplicateHoliday(req) {
  const { startDate, endDate = startDate } = req.body;

  if (startDate && endDate) {
    const holidayResult = await req.postgres.query(
      checkDuplicateHolidayQuery({ startDate, endDate, ...req.params })
    );

    if (holidayResult.rowCount > 0) {
      throw new Error('This holiday is already existed.');
    }
  }
}

async function insertHolidayInDatabase(req) {
  try {
    const { startDate, endDate = startDate, description = '', name } = req.body;

    // Calculate duration from startDate and endDate
    const duration = countOffdays(startDate, endDate) || 1;

    await req.postgres.query('BEGIN');

    // Insert holiday in database
    const holiday = await req.postgres.query(
      insertHolidayQuery({
        name,
        startDate,
        duration,
        description,
      })
    );

    // Update holidayId in time_sheet table
    const { id } = holiday.rows[0];
    await req.postgres.query(
      updateHolidayIdInTimesheetQuery({
        startDate,
        endDate,
        id,
      })
    );

    await req.postgres.query('COMMIT');

    if (!holiday.rowCount) {
      return { code: 500 };
    }

    return { code: 200, data: { id } };
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    return { code: 500, error: err.toString() };
  }
}

async function createHolidayService(req) {
  // Query to check duplicate holiday
  await checkDuplicateHoliday(req);

  // Insert holiday data in db
  const insertResult = await insertHolidayInDatabase(req);

  return insertResult;
}

async function updateHoliday(req) {
  try {
    const { startDate, endDate = startDate } = req.body;
    const { id } = req.params;

    // Calculate duration from startDate and endDate
    const duration = countOffdays(startDate, endDate) || 1;

    await req.postgres.query('BEGIN');

    const holiday = await req.postgres.query(
      adminQuery.updateHoliday({ ...req.body, duration, id })
    );
    const holidayId = holiday.rows[0].id;
    await req.postgres.query(
      adminQuery.deleteHolidayIdInTimesheet({ holidayId })
    );
    await req.postgres.query(
      adminQuery.updateHolidayIdInTimesheetQuery({
        startDate,
        endDate,
        id,
      })
    );

    await req.postgres.query('COMMIT');
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    throw new Error('Update holiday Error', err.toString());
  }
}

async function getAllHolidaysSevice(req) {
  const holiday = await req.postgres.query(getAllHolidaysQuery());
  if (holiday.rowCount == null) return { code: 404 };

  const data = camelCaseData(holiday.rows);
  return { code: 200, data };
}

async function deleteHolidaysSevice(req) {
  try {
    const { query1, query2 } = deleteHolidayQuery({ ...req.params });

    await req.postgres.query('BEGIN');

    await req.postgres.query(query1);
    await req.postgres.query(query2);

    await req.postgres.query('COMMIT');

    return { code: 200, data: { success: true } };
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    return { code: 500, error: err.toString() };
  }
}

async function updateTimesheet(req) {
  const {
    userId,
    fromTime,
    toTime,
    startBreakTime,
    endBreakTime,
    fromDate,
    toDate = new Date().toISOString(),
  } = req.body;

  const matchedTimesheet = await req.postgres.query(
    adminQuery.selectTimesheet({ userId, fromDate, toDate })
  );

  if (!matchedTimesheet.rowCount) return;

  matchedTimesheet.rows.forEach(async (row) => {
    const { date, actual_in: actualIn, actual_out: actualOut } = row;

    if (
      !actualIn ||
      !actualOut ||
      !startBreakTime ||
      !endBreakTime ||
      !fromTime ||
      !toTime
    )
      return;

    const checkIn = moment.utc(actualIn);
    const checkOut = moment.utc(actualOut);

    const inOffice = moment.utc(checkOut.diff(checkIn)).format('HH:mm:ss');
    const late = getLate({
      startTime: fromTime,
      endTime: moment(checkIn).format('HH:mm:ss'),
      startBreakTime,
      endBreakTime,
      fromTime,
      toTime,
      isLateOrEarly: true,
    });
    const early = getEarly({
      startTime: moment(checkOut).format('HH:mm:ss'),
      endTime: toTime,
      startBreakTime,
      endBreakTime,
    });
    const lack = getLack(late, early);
    const workTime = getWorkTime({
      fromTime,
      toTime,
      startBreakTime,
      endBreakTime,
      lack,
    });
    const overTime = getOverTime({
      workTime,
      inOffice,
      startBreakTime,
      endBreakTime,
    });

    const updatedTimesheet = await req.postgres.query(
      adminQuery.updateTimesheetQuery({
        userId,
        workTime,
        late,
        early,
        lack,
        overTime,
        inOffice,
        date,
      })
    );
    if (updatedTimesheet.rows == null) {
      throw Error('Cannot update working time. Try again.');
    }
  });
}

async function createWorktimeService(req) {
  try {
    // Check for duplicate workTime
    const duplicateWorkTime = await req.postgres.query(
      checkDuplicateWorkTimeQuery({ ...req.body })
    );
    if (duplicateWorkTime.rows[0]) {
      return { code: 409, error: 'Found a duplicate working time.' };
    }

    await req.postgres.query('BEGIN');

    // Find the latest user's workTime
    const latestWorkTime = await req.postgres.query(
      getLatestWorkTimeQuery({ ...req.body })
    );
    if (latestWorkTime.rowCount) {
      // Update toDate of latest work time = fromDate - 1
      const toDate = new Date(req.body.fromDate);
      toDate.setDate(toDate.getDate() - 1);
      const updateLatestWorkTimeResult = await req.postgres.query(
        updateLatestWorkTimeQuery({
          id: latestWorkTime.rows[0].id,
          toDate: toDate.toISOString(),
        })
      );
      if (!updateLatestWorkTimeResult.rowCount) {
        return { code: 500, error: 'Cannot update the latest working time.' };
      }
    }
    const workTime = await req.postgres.query(
      insertWorkTimeQuery({ ...req.body })
    );

    await updateTimesheet(req);

    await req.postgres.query('COMMIT');

    if (!workTime.rowCount) return { code: 500 };

    return { code: 200, data: { id: workTime.rows[0].id } };
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    return { code: 500, error: err.toString() };
  }
}

async function getWorkTimeService(req) {
  const workTime = await req.postgres.query(getWorkTimeQuery({ ...req.query }));
  if (workTime.rowCount == null) return { code: 404 };

  const data = camelCaseData(workTime.rows);
  return { code: 200, data };
}

// Check duplicate when update working time
async function checkDuplicateWorkingTime(req) {
  const duplicateWorkTime = await req.postgres.query(
    checkDuplicateWorkTimeQuery({ ...req.body, ...req.params })
  );
  if (duplicateWorkTime.rows[0]) {
    throw new Error('Find a duplicate working time');
  }
}

async function updateWorkingTimeService(req) {
  try {
    await req.postgres.query('BEGIN');

    const workTime = await req.postgres.query(
      adminQuery.updateWorkingTime({ ...req.body, ...req.params })
    );
    if (!workTime.rowCount) {
      throw new Error('Cannot update working time. Try again.');
    }

    if (req.body.fromDate || req.body.toDate) {
      const {
        from_date: fromDate,
        to_date: toDate,
        user_id: userId,
        start_break_time: startBreakTime,
        end_break_time: endBreakTime,
        from_time: fromTime,
        to_time: toTime,
      } = workTime.rows[0];

      await updateTimesheet({
        ...req,
        body: {
          ...req.body,
          fromDate,
          toDate,
          userId,
          startBreakTime,
          endBreakTime,
          fromTime,
          toTime,
        },
      });
    }

    await req.postgres.query('COMMIT');
  } catch (error) {
    await req.postgres.query('ROLLBACK');
  }
}

async function deleteWorkingTimeService(req) {
  const workTime = await req.postgres.query(
    adminQuery.deleteWorkingTime({ ...req.params })
  );
  if (!workTime.rowCount) {
    throw new Error('Cannot delete working time. Try again.');
  }
}

module.exports = {
  updateWorkingTimeService,
  getAllHolidaysSevice,
  createHolidayService,
  createWorktimeService,
  getWorkTimeService,
  deleteHolidaysSevice,
  updateHoliday,
  checkDuplicateHoliday,
  checkDuplicateWorkingTime,
  deleteWorkingTimeService,
};
