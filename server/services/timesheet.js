const { defaultLimit, defaultPage } = require('../helper/constants');

const { camelCaseData, getOffset } = require('../helper/calculation');
const {
  getTimesheetValidation,
  getMemberTimesheetValidation,
  getATimesheetValidation,
  getAllTimesheetValidation
} = require('../validations/validation');
const { getServiceResultForEmptyData } = require('../helper/handle-response');
const {
  countTimesheetQuery, getMyTimesheetQuery,
  countMemberTimesheetQuery, getMemberTimesheetQuery,
  getATimesheetQuery, countAllTimesheetQuery,
  getAllTimesheetQuery, exportTimesheetQuery
} = require('../query/timesheet');

async function getMyTimesheetService(req) {
  // Get userId in httpOnly cookie
  const userId = req.user.id;
  if (!userId) return { code: 401 };

  // Validate input
  const { error } = getTimesheetValidation(req.query);
  if (error) return { code: 400, error: error.details[0] };

  // Prepare data before query
  const {
    fromDate, toDate, limit = defaultLimit, page = defaultPage
  } = req.query;
  const offset = getOffset(page, limit);
  const toDateUTC = new Date(toDate);
  toDateUTC.setHours(23, 59, 59, 999);

  // Count number of matched items
  const countTimesheet = await req.postgres.query(countTimesheetQuery({
    userId,
    fromDate,
    toDateUTC
  }));

  // Get my timesheet and filter by data in req.query
  const myTimesheet = await req.postgres.query(getMyTimesheetQuery({
    userId,
    fromDate,
    toDateUTC,
    limit,
    offset
  }));

  if (!myTimesheet.rowCount || !countTimesheet.rowCount) {
    return getServiceResultForEmptyData(page);
  }

  // Return data when success
  const data = camelCaseData(myTimesheet.rows);
  const { count } = countTimesheet.rows[0];

  return {
    code: 200,
    data: {
      pagination: { count, page: Number(page) },
      data
    }
  };
}

async function getMemberTimesheetService(req) {
  // Get managerId in httpOnly cookie
  const managerId = req.user.id;
  if (!managerId) return { code: 401 };

  // Validate input
  const { error } = getMemberTimesheetValidation(req.query);
  if (error) return { code: 400, error: error.details[0] };

  // Prepare data before query
  const {
    fromDate, toDate, badgeNumber,
    limit = defaultLimit, page = defaultPage
  } = req.query;
  const offset = getOffset(page, limit);
  const toDateUTC = new Date(toDate);
  toDateUTC.setHours(23, 59, 59, 999);

  // Count number of matched items
  const countMemberTimesheet = await req.postgres.query(
    countMemberTimesheetQuery({
      managerId,
      fromDate,
      badgeNumber,
      toDateUTC
    })
  );

  // Get my timesheet and filter by data in req.query
  const memberTimesheet = await req.postgres.query(
    getMemberTimesheetQuery({
      managerId,
      fromDate,
      badgeNumber,
      toDateUTC,
      limit,
      offset
    })
  );

  if (!memberTimesheet.rowCount || !countMemberTimesheet.rowCount) {
    return getServiceResultForEmptyData(page);
  }

  // Return data when success
  const data = camelCaseData(memberTimesheet.rows);
  const { count } = countMemberTimesheet.rows[0];

  return {
    code: 200,
    data: {
      pagination: { count, page: Number(page) },
      data
    }
  };
}

async function getATimesheetService(req) {
  // Get userId in httpOnly cookie
  const userId = req.user.id;
  if (!userId) return { code: 401 };

  // Validate input
  const { error } = getATimesheetValidation({ ...req.query, userId });
  if (error) return { code: 400, error: error.details[0] };

  // Get a timesheet
  const timesheet = await req.postgres.query(
    getATimesheetQuery({ userId, ...req.query })
  );

  if (!timesheet.rowCount) return { code: 404 };

  const data = camelCaseData(timesheet.rows[0]);
  return {
    code: 200,
    data
  };
}

async function getAllTimesheetService(req) {
  // Validate input
  const { error } = getAllTimesheetValidation({ ...req.query });
  if (error) return { code: 400, error: error.details[0] };

  const {
    fromDate, toDate, badgeNumber,
    limit = defaultLimit, page = defaultPage
  } = req.query;
  const offset = getOffset(page, limit);
  const toDateUTC = new Date(toDate);
  toDateUTC.setHours(23, 59, 59, 999);

  // Get all timesheet
  const countAllTimesheet = await req.postgres.query(
    countAllTimesheetQuery({
      fromDate,
      toDateUTC,
      badgeNumber
    })
  );

  // Get my timesheet and filter by data in req.query
  const allTimesheet = await req.postgres.query(
    getAllTimesheetQuery({
      fromDate,
      toDateUTC,
      limit,
      offset,
      badgeNumber
    })
  );

  if (!countAllTimesheet.rowCount || !allTimesheet.rowCount) {
    return getServiceResultForEmptyData(page);
  }

  const data = camelCaseData(allTimesheet.rows);
  const { count } = countAllTimesheet.rows[0];

  return {
    code: 200,
    data: {
      pagination: { count, page: Number(page) },
      data
    }
  };
}

async function exportTimesheetService(req) {
  const { fromDate, toDate, badgeNumber } = req.query;
  const toDateUTC = new Date(toDate);
  toDateUTC.setHours(23, 59, 59, 999);

  const allTimesheet = await req.postgres.query(
    exportTimesheetQuery({
      fromDate,
      toDateUTC,
      badgeNumber
    })
  );

  if (allTimesheet.rowCount == null) return { code: 500 };

  const data = camelCaseData(allTimesheet.rows);

  return { code: 200, data };
}

module.exports = {
  getMyTimesheetService,
  getMemberTimesheetService,
  getATimesheetService,
  getAllTimesheetService,
  exportTimesheetService
};
