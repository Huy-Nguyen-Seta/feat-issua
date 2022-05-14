const {
  defaultLimit, defaultPage,
  forgetRequestTypeId,
  leaveRequestTypeId,
  lateEarlyRequestTypeId,
  defaultMaxForgetRequestPerMonth,
  leaveCarryOverType,
  reasonLeaveRequestId
} = require('../helper/constants');
const {
  camelCaseData, getOffset, findLessTime, getOffTimeHour
} = require('../helper/calculation');
const {
  getRequestValidation,
  postCompensationRequestValidation,
  postLeaveRequestValidation,
  postForgetRequestValidation,
  checkForgetRequestValidation
} = require('../validations/validation');
const { getServiceResultForEmptyData } = require('../helper/handle-response');

const { requestQuery } = require('../query');
const sendMail = require('../utils/mailServer');
const { getFirstDateOfMonth, getLastDateOfMonth } = require('../helper/date');
const {
  getUserLeaveByUserIdAndYear
} = require('../query/userLeave.query');

const {
  countRequestsQuery, getRequestsQuery,
  getMyRequestQuery, countMyRequestQuery,
  postCompensationRequestQuery,
  postLeaveRequestQuery,
  postForgetRequestQuery,
  selectTimesheetQuery,
  updatedRequestDateTimesheetQuery,
  selectWorkTimeQuery,
  countForgetRequestQuery,
  findDuplicateForgetRequestQuery,
  findDuplicateCompensationRequestQuery,
  selectCompensationTimeQuery,
  checkDuplicateLeaveRequestQuery,
  countNumberOfCompThisMonthQuery
} = requestQuery;

async function getMyRequestService(req) {
  // Get userId in httpOnly cookie
  const userId = req.user.id;
  if (!userId) return { code: 401 };

  // Validate input
  const { error } = getRequestValidation(req.query);
  if (error) return { code: 400, error: error.details[0] };

  // Prepare data before query
  const {
    requestTypeIds,
    fromDate, toDate, reasonId, status,
    limit = defaultLimit, page = defaultPage
  } = req.query;
  const offset = getOffset(page, limit);
  const toDateUTC = new Date(toDate);
  toDateUTC.setHours(23, 59, 59, 999);

  // Count number of matched items
  const countRequest = await req.postgres.query(countMyRequestQuery({
    requestTypeIds,
    fromDate,
    toDateUTC,
    reasonId,
    status,
    userId
  }));

  // Get my requests and filter by data in req
  const requests = await req.postgres.query(getMyRequestQuery({
    requestTypeIds,
    fromDate,
    toDateUTC,
    reasonId,
    status,
    userId,
    limit,
    offset
  }));

  if (!requests.rowCount || !countRequest.rowCount) {
    return getServiceResultForEmptyData(page);
  }

  // Return data when success
  const data = camelCaseData(requests.rows);
  const { count } = countRequest.rows[0];

  return {
    code: 200,
    data: {
      pagination: { count, page: Number(page) },
      data
    }
  };
}

async function getRequestForManagerService(req) {
  // Get userId in httpOnly cookie
  const userId = req.user.id;

  // Validate input
  const { error } = getRequestValidation(req.query);
  if (error) return { code: 400, error: error.details[0] };

  // Prepare data before query
  const {
    requestTypeIds, badgeNumber,
    fromDate, toDate, reasonId, status,
    limit = defaultLimit, page = defaultPage
  } = req.query;
  const offset = getOffset(page, limit);
  const toDateUTC = new Date(toDate);
  toDateUTC.setHours(23, 59, 59, 999);

  // Count number of matched items
  const countRequest = await req.postgres.query(countRequestsQuery({
    requestTypeIds,
    badgeNumber,
    fromDate,
    toDateUTC,
    reasonId,
    status,
    userId
  }));

  // Get all requests and filter by data in req
  const requests = await req.postgres.query(getRequestsQuery({
    requestTypeIds,
    badgeNumber,
    fromDate,
    toDateUTC,
    reasonId,
    status,
    userId,
    limit,
    offset
  }));

  if (!requests.rowCount || !countRequest.rowCount) {
    return getServiceResultForEmptyData(page);
  }

  // Return data when success
  const data = camelCaseData(requests.rows);
  const { count } = countRequest.rows[0];

  return {
    code: 200,
    data: {
      pagination: { count, page: Number(page) },
      data
    }
  };
}

async function updateTimesheetService(req) {
  const { requestDate, compensationDate } = req.body;
  const userId = req.user.id;
  const errorMsg = 'Cannot find timesheet with that request day.';

  const timesheet = await req.postgres.query(
    selectTimesheetQuery({ compensationDate, requestDate, userId })
  );

  if (!timesheet.rowCount) return { code: 500, error: errorMsg };

  const {
    over_time: compensationDateOverTime,
    lack: requestDateLack
  } = timesheet.rows[0];
  if (!compensationDateOverTime || !requestDateLack) {
    return { code: 500, error: errorMsg };
  }

  const comp = findLessTime(compensationDateOverTime, requestDateLack);
  if (!comp) return { code: 500, error: errorMsg };

  const updatedRequestDateTimesheet = await req.postgres.query(
    updatedRequestDateTimesheetQuery({ requestDate, userId, comp })
  );

  if (!updatedRequestDateTimesheet.rowCount) {
    return { code: 500, error: errorMsg };
  }

  return { code: 200, error: null };
}

function getSeconds(timeObj) {
  if (!timeObj) return 0;
  const { hours = 0, seconds = 0, minutes = 0 } = timeObj;
  return Number(hours) * 60 * 60 + Number(minutes) * 60 + Number(seconds);
}

function checkAvailableCompDay({ overtime, requesttime, currentcomp = 0 }) {
  if (!overtime || !requesttime) return false;

  const overTimeSeconds = getSeconds(overtime);
  const requestTimeSeconds = getSeconds(requesttime);
  const currentCompSeconds = getSeconds(currentcomp);

  const diff = overTimeSeconds - currentCompSeconds - requestTimeSeconds;

  return diff >= 0;
}

async function postCompensationRequestService(req) {
  // Validate input
  const { error } = postCompensationRequestValidation(req.body);
  if (error) return { code: 400, error: error.details[0] };
  const userId = req.user.id;

  // Find duplicate request
  const duplicateRequest = await req.postgres.query(
    findDuplicateCompensationRequestQuery({ ...req.body, userId })
  );
  if (duplicateRequest.rowCount) return { code: 409, error: 'Found a duplicate request.' };

  // Check for maximum compensation date per month
  const countNumberOfCompThisMonthResult = await req.postgres.query(
    countNumberOfCompThisMonthQuery({
      userId,
      ...req.body,
      from: getFirstDateOfMonth(req.body.compensationDate),
      to: getLastDateOfMonth(req.body.compensationDate)
    })
  );

  if (
    countNumberOfCompThisMonthResult
    && countNumberOfCompThisMonthResult.rows
    && countNumberOfCompThisMonthResult.rows[0]
    && countNumberOfCompThisMonthResult.rows[0].length >= 3
  ) {
    return {
      code: 400,
      error: 'You have maximum 3 compensation days to create a request. Please select another day.'
    };
  }

  // Check available over_time of compenstation_date timesheet
  const checkAvailableResult = await req.postgres.query(
    selectCompensationTimeQuery({ ...req.body, userId })
  );
  if (!checkAvailableResult.rowCount) return { code: 500 };

  const { overtime, requesttime, currentcomp } = checkAvailableResult.rows[0];
  const isAvailable = checkAvailableCompDay(checkAvailableResult.rows[0]);

  if (!overtime || !requesttime) {
    return {
      code: 400,
      error: 'This day does not have enough overtime or missing request time.'
    };
  }
  if (!isAvailable) {
    return {
      code: 400,
      error: `Request time (${getSeconds(requesttime)} seconds) must be less or equal than available time (${getSeconds(overtime) - getSeconds(currentcomp)} seconds). Please choose another day.`
    };
  }

  // Update request in db
  const requredData = { ...req.body, status: 'new', userId };
  await req.postgres.query('BEGIN');
  const postResult = await req.postgres.query(
    postCompensationRequestQuery(requredData)
  );
  if (!postResult.rowCount) return { code: 500 };

  // Update timesheet table
  const updateResult = await updateTimesheetService(req);

  await req.postgres.query('COMMIT');

  if (updateResult.error) return { code: 500 };

  return {
    code: 200,
    data: { id: postResult.rows[0].id }
  };
}

async function getOffTimeHourService(req) {
  // Get user working time
  const userId = req.user.id;
  const { startDateTime, endDateTime } = req.body;
  const workTime = await req.postgres.query(
    selectWorkTimeQuery({ userId, startDateTime, endDateTime })
  );
  if (!workTime.rowCount) {
    return { code: 500, error: 'Missing working time.' };
  }

  // Count offTimeHour
  const offTimeHour = getOffTimeHour({
    startDateTime,
    endDateTime,
    workTimeList: workTime.rows
  });
  if (offTimeHour <= 0) {
    return { code: 500, error: 'Invalid offTimeHour.' };
  }

  return { offTimeHour };
}

async function postLeaveRequestService(req) {
  // Validate input
  const { error } = postLeaveRequestValidation(req.body);
  if (error) return { code: 400, error: error.details[0] };

  const duplicateRequest = await req.postgres.query(
    checkDuplicateLeaveRequestQuery({ ...req.body, userId: req.user.id })
  );

  if (duplicateRequest.rowCount) {
    return { code: 409, error: 'Found a duplicate request.' };
  }

  if (req.body.reasonId === leaveCarryOverType) {
    const startDate = new Date(req.body.startDateTime).getMonth() + 1;
    const endDate = new Date(req.body.endDateTime).getMonth() + 1;
    if (startDate > 3 || endDate > 3) {
      return {
        code: 404,
        error:
        'Request type: carry-over leave, create just range January to March'
      };
    }
  }

  const getOffTimeHourResult = await getOffTimeHourService(req);
  if (getOffTimeHourResult.error) return getOffTimeHourResult;

  // Update request in db
  const { offTimeHour } = getOffTimeHourResult;
  const requredData = {
    ...req.body, status: 'new', userId: req.user.id, offTimeHour
  };
  // check leave day
  const userLeave = await req.postgres.query(
    getUserLeaveByUserIdAndYear(
      {
        userId: req.user.id,
        year: new Date().getFullYear()
      }
    )
  );
  const { carryOverRemain, totalRemain } = camelCaseData(userLeave.rows[0]);
  if (req.body.reasonId === leaveCarryOverType
  && carryOverRemain < offTimeHour) {
    return {
      code: 500,
      error: 'During time is greater than remaining days'
    };
  } if (req.body.reasonId === reasonLeaveRequestId
    && totalRemain < offTimeHour) {
    return {
      code: 500,
      error: 'During time is greater than remaining days'
    };
  }
  const postResult = await req.postgres.query(
    postLeaveRequestQuery(requredData)
  );
  if (!postResult.rowCount) return { code: 500, error: 'Cannot create request.' };

  return {
    code: 200,
    data: { id: postResult.rows[0].id }
  };
}

async function postForgetRequestService(req) {
  // Validate input
  const { error } = postForgetRequestValidation(req.body);
  if (error) return { code: 400, error: error.details[0] };

  const userId = req.user.id;

  // Find duplicate request
  const duplicateRequest = await req.postgres.query(
    findDuplicateForgetRequestQuery({ ...req.body, userId })
  );
  if (duplicateRequest.rowCount) return { code: 409, error: 'Found a duplicate request.' };

  // Update request in db
  const requredData = { ...req.body, status: 'new', userId };
  const postResult = await req.postgres.query(
    postForgetRequestQuery(requredData)
  );
  if (!postResult.rowCount) return { code: 500 };

  // Return data when success
  return {
    code: 200,
    data: { id: postResult.rows[0].id }
  };
}

async function checkForgetRequestService(req) {
  // Validate input
  const { error } = checkForgetRequestValidation(req.query);
  if (error) return { code: 400, error: error.details[0] };

  // Set date to the end of the current date
  const { requestTypeId, fromDate, toDate } = req.query;
  const toDateUTC = new Date(toDate);
  toDateUTC.setHours(23, 59, 59, 999);

  // TODO: change errorCount from varchar to int4
  const countResult1 = await req.postgres.query(
    countForgetRequestQuery({
      requestTypeId,
      userId: req.user.id,
      fromDate,
      toDateUTC
    }).query1
  );
  const countResult2 = await req.postgres.query(
    countForgetRequestQuery({
      requestTypeId,
      userId: req.user.id,
      fromDate,
      toDateUTC
    }).query2
  );
  if (!countResult1.rowCount || !countResult2.rowCount) {
    return { code: 404 };
  }

  const countForgetError = countResult1.rows[0].count + countResult2.rows[0].count;
  const numberOfLeftRequest = Math.max(
    defaultMaxForgetRequestPerMonth - countForgetError, 0
  );

  return {
    code: 200,
    data: {
      numberOfLeftRequest,
      maxRequestDayPerMonth: defaultMaxForgetRequestPerMonth
    }
  };
}

async function countNewRequestsForPM(req) {
  const countleaveRequests = await req.postgres.query(
    requestQuery.countNewRequestsForPM({ managerId: req.user.id })
  );
  if (countleaveRequests.rowCount == null) throw new Error();

  const { count } = countleaveRequests.rows[0] || { count: 0 };
  return { count };
}

function getTableDataArrayForPM(req) {
  const {
    requestTypeId, startDateTime, endDateTime,
    comment, requestDate, compensationDate,
  } = req.body;
  const tableDataArray = [];

  switch (requestTypeId) {
    case leaveRequestTypeId: {
      tableDataArray.push({
        'start date time': new Date(startDateTime).toLocaleString(),
        'end date time': new Date(endDateTime).toLocaleString(),
        category: 'Leave',
        reason: comment
      });
      break;
    }
    case forgetRequestTypeId: {
      const data = {};
      if (startDateTime) {
        data['check-in time'] = new Date(startDateTime).toLocaleTimeString();
      }
      if (endDateTime) {
        data['check-out time'] = new Date(endDateTime).toLocaleTimeString();
      }
      tableDataArray.push({
        'request date': new Date(requestDate).toLocaleDateString(),
        ...data,
        category: 'forget',
        reason: comment
      });
      break;
    }
    case lateEarlyRequestTypeId: {
      tableDataArray.push({
        'request date': new Date(requestDate).toLocaleDateString(),
        'compensation date': new Date(compensationDate).toLocaleDateString(),
        category: 'compensation',
        reason: comment
      });
      break;
    }
    default:
  }

  return tableDataArray;
}

async function sendMailToPMService({ req, requestId }) {
  const result = await req.postgres.query(
    requestQuery.sendMailToPMQuery({ userId: req.user.id, requestId })
  );
  if (!result.rowCount) {
    console.error('PM not found.');
    return;
  }

  const {
    manager_email: toMail, manager_name: managerName, name,
    request_type_name: requestTypeName
  } = result.rows[0];

  const subject = `New ${requestTypeName} request from ${name}`;
  const intro = `${name} has registered for ${requestTypeName} request. Detail in the following table:`;
  const tableDataArray = getTableDataArrayForPM(req);

  if (!tableDataArray.length) {
    console.error('Send email notify PM error.');
    return;
  }

  const mailResponse = {
    recipientName: managerName,
    intro,
    tableDataArray
  };

  sendMail({ mailResponse, toMail, subject });
}

async function sendMailToStaffService({ req, requestId, status }) {
  const result = await req.postgres.query(
    requestQuery.sendMailToStaffQuery({ userId: req.user.id, requestId })
  );
  if (!result.rowCount) {
    console.error('Staff not found.');
    return;
  }

  const {
    staff_email: toMail, manager_name: managerName, staff_name: staffName,
    request_type_name: requestTypeName
  } = result.rows[0];
  const subject = `${managerName} has ${status} your ${requestTypeName} request`;
  const intro = `${managerName} has ${status} your ${requestTypeName} request.`;

  const mailResponse = {
    recipientName: staffName,
    intro
  };

  sendMail({ mailResponse, toMail, subject });
}

async function getRequestsForAdmin(req) {
  const { toDate, limit = defaultLimit, page = defaultPage } = req.query;
  const toDateUTC = new Date(toDate);
  toDateUTC.setHours(23, 59, 59, 999);
  const offset = getOffset(page, limit);

  const countRequests = await req.postgres.query(
    requestQuery.countRequestForAdminQuery({
      ...req.query, toDateUTC
    })
  );
  const requests = await req.postgres.query(
    requestQuery.getRequestForAdminQuery({
      ...req.query,
      toDateUTC,
      offset,
      limit
    })
  );
  if (requests.rowCount == null || countRequests.rowCount == null) throw new Error();

  return {
    pagination: {
      count: countRequests.rows[0] ? countRequests.rows[0].count : 0,
      page: Number(req.query.page || 1)
    },
    data: camelCaseData(requests.rows) || []
  };
}

module.exports = {
  sendMailToPMService,
  sendMailToStaffService,
  getMyRequestService,
  getRequestForManagerService,
  postCompensationRequestService,
  postLeaveRequestService,
  postForgetRequestService,
  checkForgetRequestService,
  getOffTimeHourService,
  countNewRequestsForPM,
  getRequestsForAdmin
};
