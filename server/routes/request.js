/* eslint-disable array-callback-return */
const router = require('express').Router();
const named = require('yesql').pg;
const camelcaseKeys = require('camelcase-keys');
const apiRoute = require('../../apiRoute.json');
const {
  idValidation,
  putForgetRequestValidation,
  checkRequestValidation,
  checkLeaveRequestValidation,
  putCompensationRequestValidation,
  putLeaveRequestValidation,
  getReasonValidation,
  postReasonValidation,
  putReasonValidation
} = require('../validations/validation');
const {
  camelCaseData,
  findLessTime, getOffset
} = require('../helper/calculation');
const {
  getErrorResponse,
  getSuccessResponse
} = require('../helper/handle-response');
const {
  getRequestForManagerService,
  getMyRequestService,
  postCompensationRequestService,
  postForgetRequestService,
  postLeaveRequestService,
  checkForgetRequestService
} = require('../services/request.service');

const {
  updateUserLeaveWhenConfirmRequest
} = require('../services/userLeave.service');

const { pushNotificationToPM, pushNotificationToUser } = require('../services/firebase');
const { getOffTimeHourService } = require('../services/request.service');
const { requestQuery } = require('../query');
const requestController = require('../controllers/request.controller');
const {
  defaultMobieScreens, defaultLimit, defaultPage,
  defaultMaxCompRequestPerMonth,
  defaultMaxCompDayPerMonth,
  leaveCarryOverType,
  reasonLeaveRequestId
} = require('../helper/constants');
const { requestValidation } = require('../validations');
const validate = require('../middlewares/validate');

router.post(apiRoute.compensationRequest, async (req, res) => {
  try {
    const { code, data, error: errorData } = await postCompensationRequestService(req);

    if (!data) return getErrorResponse(res, code, errorData);

    getSuccessResponse(res, code, { data });

    try {
      const requestId = data.id;
      if (requestId) {
        await pushNotificationToPM({
          req,
          requestId,
          screen: defaultMobieScreens.compensation
        });

        await requestController.sendMailToPM({ req, requestId });
      }
    } catch (e) {
      console.log('--- Notify new compensation post request error ---\n', e);
    }
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.post(apiRoute.leaveRequest, async (req, res) => {
  try {
    const { code, data, error: errorData } = await postLeaveRequestService(req);

    if (!data) return getErrorResponse(res, code, errorData);

    getSuccessResponse(res, code, { data });

    try {
      const requestId = data.id;
      if (requestId) {
        await pushNotificationToPM({
          req,
          requestId,
          screen: defaultMobieScreens.leave
        });

        await requestController.sendMailToPM({ req, requestId });
      }
    } catch (e) {
      console.log('--- Notify new leave post request error ---\n', e);
    }
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.post(apiRoute.forgetRequest, async (req, res) => {
  try {
    const { code, data, error: errorData } = await postForgetRequestService(req);

    if (!data) return getErrorResponse(res, code, errorData);

    getSuccessResponse(res, code, { data });

    try {
      const requestId = data.id;
      if (requestId) {
        await pushNotificationToPM({
          req,
          requestId,
          screen: defaultMobieScreens.forget
        });

        await requestController.sendMailToPM({ req, requestId });
      }
    } catch (e) {
      console.log('--- Notify new leave post request error ---\n', e);
    }
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get my requests
router.get(apiRoute.request, async (req, res) => {
  try {
    const { code, data, error: errorData } = await getMyRequestService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get all request of staff under manager
router.get(apiRoute.requestForManager, async (req, res) => {
  try {
    const { code, data, error: errorData } = await getRequestForManagerService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.get(`${apiRoute.request}/:id`, async (req, res) => {
  const { error } = idValidation(req.params);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    // Get request in database
    const { id } = req.params;
    const request = await req.postgres.query(named(`
    select r.*, 
    (case when r.off_time_hour is not null
      then r.off_time_hour::float else null end) as off_time_hour,
    re.name as reason, u.name, u.badge_number 
    from request r
    left join reason re on r.reason_id = re.id
    left join "user" u on u.id = r.user_id
    where r.id = :id limit 1`)({ id }));
    if (!request.rowCount) return getErrorResponse(res, 404);

    const data = camelcaseKeys(request.rows[0], { deep: true });

    getSuccessResponse(res, 200, { data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.put(`${apiRoute.forgetRequest}/:id`, async (req, res) => {
  const { id } = req.params;
  const { error } = putForgetRequestValidation({ id, ...req.body });
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const {
      status, approveBy, confirmBy, managerComment, comment,
      errorCount, reasonId, startDateTime, endDateTime, requestDate,
      adminComment
    } = req.body;

    // Set updated fields
    const set = [];
    if (status) set.push('status = :status');
    if (approveBy) set.push('approve_by = :approveBy');
    if (confirmBy) set.push('confirm_by = :confirmBy');
    if (managerComment) set.push('manager_comment = :managerComment');
    if (reasonId) set.push('reason_id = :reasonId');
    if (comment) set.push('comment =:comment');
    if (startDateTime) set.push('start_date_time = :startDateTime');
    if (endDateTime) set.push('end_date_time = :endDateTime');
    if (errorCount != null) set.push('error_count = :errorCount');
    if (requestDate) set.push('request_date = :requestDate');
    if (adminComment) set.push('admin_comment = :adminComment');

    if (!set.length) return getErrorResponse(res, 400, 'Client sent empty input.');

    set.push('modified_date_time = :modifiedDateTime');

    const result = await req.postgres.query(named(`
    update request set ${set.join(' , ')} where id = :id returning *`)({
      id,
      ...req.body,
      modifiedDateTime: new Date()
    }));
    if (!result.rowCount) return getErrorResponse(res, 404);

    getSuccessResponse(res, 200, { data: { ...req.body } });

    try {
      const requestId = result.rows[0].id;
      if (requestId) {
        pushNotificationToUser({
          req,
          requestId,
          ...result.rows[0]
        });
      }

      if (status === 'approved' || status === 'rejected') {
        await requestController.sendMailToStaff({ req, requestId, status });
      } else if (approveBy) {
        await requestController.sendMailToStaff({
          req,
          requestId,
          status: 'confirmed'
        });
      }
    } catch (e) {
      console.log('--- Notify put forget request error ---\n', e);
    }
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.put(`${apiRoute.leaveRequest}/:id`, async (req, res) => {
  const { id } = req.params;
  const { error } = putLeaveRequestValidation({ id, ...req.body });
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const {
      status, approveBy, confirmBy, managerComment,
      comment, reasonId, startDateTime, endDateTime, adminComment
    } = req.body;

    if (['approved'].includes(status)) {
      const getRequestById = (await req.postgres.query(`
      select * from request r where id = '${id}'`));
      const rs = await updateUserLeaveWhenConfirmRequest(
        req,
        camelCaseData(getRequestById.rows[0])
      );
      if (rs && rs.error) {
        return getErrorResponse(res, 400, rs.error);
      }
    }
    // Set updated fields
    const set = [];
    if (status) set.push('status =:status');
    if (approveBy) set.push('approve_by =:approveBy');
    if (confirmBy) set.push('confirm_by = :confirmBy');
    if (managerComment) set.push('manager_comment =:managerComment');
    if (comment) set.push('comment =:comment');
    if (reasonId) set.push('reason_id = :reasonId');
    if (startDateTime) set.push('start_date_time = :startDateTime');
    if (endDateTime) set.push('end_date_time = :endDateTime');
    if (adminComment) set.push('admin_comment = :adminComment');

    await req.postgres.query('BEGIN');

    let offTimeHour;
    if (startDateTime || endDateTime) {
      if (!startDateTime || !endDateTime) {
        const currentRequest = await req.postgres.query(`
        select start_date_time, end_date_time from request where id = '${id}'`);
        if (!currentRequest.rowCount) return getErrorResponse(res, 404);

        if (!startDateTime) {
          const start = new Date(currentRequest.rows[0].start_date_time).toISOString();
          req.body.startDateTime = start;
        }
        if (!endDateTime) {
          const end = new Date(currentRequest.rows[0].end_date_time).toISOString();
          req.body.endDateTime = end;
        }
      }

      // Check for duplicate request
      const duplicateRequest = await req.postgres.query(
        requestQuery.findDuplicateLeaveRequestQuery({
          ...req.body,
          requestId: id,
          userId: req.user.id
        })
      );
      if (duplicateRequest.rowCount) {
        return getErrorResponse(res, 409, 'Found a duplicate request.');
      }

      // Count offTimeHour
      const getOffTimeHourResult = await getOffTimeHourService(req);
      if (getOffTimeHourResult.error) {
        const { code, error: errorMsg } = getOffTimeHourResult;
        return getErrorResponse(res, code, errorMsg);
      }

      offTimeHour = getOffTimeHourResult.offTimeHour;

      set.push('off_time_hour = :offTimeHour');
    }

    if (!set.length) return getErrorResponse(res, 400, 'Client sent empty input.');

    set.push('modified_date_time = :modifiedDateTime');

    const result = await req.postgres.query(named(`
    update request set ${set.join(' , ')} where id = :id returning *`)({
      id,
      ...req.body,
      offTimeHour,
      modifiedDateTime: new Date()
    }));

    await req.postgres.query('COMMIT');

    if (!result.rowCount) return getErrorResponse(res, 404);

    getSuccessResponse(res, 200, { data: { ...req.body } });

    // update date leave if status is 'confirmed' or approved

    try {
      const requestId = result.rows[0].id;
      if (requestId) {
        pushNotificationToUser({
          req,
          requestId,
          ...result.rows[0],
          screen: defaultMobieScreens.leave
        });
      }

      if (status === 'approved' || status === 'rejected') {
        await requestController.sendMailToStaff({ req, requestId, status });
      } else if (approveBy) {
        await requestController.sendMailToStaff({
          req,
          requestId,
          status: 'confirmed'
        });
      }
    } catch (e) {
      console.log('--- Notify put leave request error ---\n', e);
    }
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    getErrorResponse(res, 500, err.toString());
  }
});

router.put(`${apiRoute.compensationRequest}/:id`, async (req, res) => {
  const { id } = req.params;
  const { error } = putCompensationRequestValidation({ id, ...req.body });
  if (error) return getErrorResponse(res, 400, error.details[0]);

  // Get userId in token
  const userId = req.user.id;

  try {
    const {
      status, approveBy, managerComment, comment,
      requestDate, compensationDate, confirmBy,
      adminComment
    } = req.body;

    if (!status && !approveBy && !managerComment
      && !comment && !requestDate && !compensationDate && !confirmBy) {
      return getErrorResponse(res, 400, 'Client sent empty input.');
    }

    await req.postgres.query('BEGIN');

    if (requestDate || compensationDate) {
      const oldCompensationRequest = await req.postgres.query(named(`
      select request_date, compensation_date from request where id = :id
      `)({ id }));
      if (!oldCompensationRequest.rowCount) {
        return getErrorResponse(res, 500);
      }
      const {
        request_date: oldRequestDate,
        compensation_date: oldCompensationDate
      } = oldCompensationRequest.rows[0];

      // Remove comp in time_sheet table
      const currentRequestTimesheet = await req.postgres.query(named(`
      update time_sheet set comp = null
      where date = :oldRequestDate and user_id = :userId
      `)({ oldRequestDate, userId }));
      if (!currentRequestTimesheet.rowCount) {
        return getErrorResponse(res, 500, 'Cannot replace old data in time_sheet.');
      }
      // Find timesheet with date = requestDate
      const newRequestTimesheet = await req.postgres.query(named(`
        select ts2.over_time,
        (select lack from time_sheet ts1 
          where ts1.date::date = :requestDate::date and user_id = :userId limit 1) as lack
        from time_sheet ts2
        where ts2.date::date = :compensationDate::date 
          and user_id = :userId
        limit 1
        `)({
        compensationDate: compensationDate || oldCompensationDate,
        requestDate: requestDate || oldRequestDate,
        userId
      }));

      if (!newRequestTimesheet.rowCount) {
        return getErrorResponse(res, 500, 'Cannot find timesheet with that day.');
      }
      const {
        over_time: compensationDateOverTime,
        lack: requestDateLack
      } = newRequestTimesheet.rows[0];
      const comp = findLessTime(compensationDateOverTime, requestDateLack);
      const updatedRequestDateTimesheet = await req.postgres.query(named(`
        update time_sheet set comp = :comp
        where date = :requestDate::date
          and user_id = :userId
        returning *
      `)({ comp, requestDate: requestDate || oldRequestDate, userId }));

      if (!updatedRequestDateTimesheet.rowCount) {
        return getErrorResponse(res, 500, 'Cannot update timesheet with that request day.');
      }
    }

    // Set updated fields
    const set = [];
    if (status) set.push('status = :status');
    if (approveBy) set.push('approve_by = :approveBy');
    if (managerComment) set.push('manager_comment = :managerComment');
    if (comment) set.push('comment =:comment');
    if (requestDate) set.push('request_date = :requestDate');
    if (compensationDate) set.push('compensation_date = :compensationDate');
    if (confirmBy) set.push('confirm_by = :confirmBy');

    if (adminComment) set.push('admin_comment = :adminComment');
    set.push('modified_date_time = :modifiedDateTime');

    const result = await req.postgres.query(named(`
    update request set ${set.join(' , ')} where id = :id returning *`)({
      ...req.body,
      id,
      modifiedDateTime: new Date()
    }));
    await req.postgres.query('COMMIT');
    if (!result.rowCount) return getErrorResponse(res, 404);

    getSuccessResponse(res, 200, { data: { ...req.body } });

    try {
      const { id: requestId } = result.rows[0];
      if (requestId) {
        pushNotificationToUser({
          req,
          requestId,
          ...result.rows[0],
          screen: defaultMobieScreens.forget
        });
      }

      if (status === 'approved' || status === 'rejected') {
        await requestController.sendMailToStaff({ req, requestId, status });
      } else if (approveBy) {
        await requestController.sendMailToStaff({
          req,
          requestId,
          status: 'confirmed'
        });
      }
    } catch (e) {
      console.log('--- Notify put compensation request error ---\n', e);
    }
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    getErrorResponse(res, 500, err.toString());
  }
});

router.delete(`${apiRoute.request}/:id`, async (req, res) => {
  // Validate input
  const { error } = idValidation(req.params);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const userId = req.user.id;
    const { id } = req.params;

    await req.postgres.query('BEGIN');

    const result1 = await req.postgres.query(`
      delete from request 
      where user_id = '${userId}' and id = '${id}' and status = 'new'
      returning *`);
    const { request_date: requestDate } = result1.rows[0] || {};
    if (requestDate) {
      const updateResult = await req.postgres.query(named(`
      update time_sheet set comp = null
      where user_id = :userId and date::date = :requestDate::date
      `)({ userId, requestDate }));
      if (!updateResult.rowCount) getErrorResponse(res, 500);
    }
    await req.postgres.query('COMMIT');

    if (!result1.rowCount) return getErrorResponse(res, 404);

    getSuccessResponse(res, 200);
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    getErrorResponse(res, 500, err.toString());
  }
});

// Get all reasons
router.get(`${apiRoute.reason}/all`, async (req, res) => {
  // Validate input
  const { requestTypeId } = req.query;
  const { error } = idValidation({ id: requestTypeId }, false);
  if (error) return getErrorResponse(res, 400, error.details[0]);
  try {
    // Get all reasons by requestTypeId
    let joinConditions = '';
    if (requestTypeId) joinConditions += 'where request_type_id = :requestTypeId';
    const reasonRows = await req.postgres.query(named(`
    select *, max_request_day::int FROM reason ${joinConditions}`)({ requestTypeId }));
    if (!reasonRows.rowCount) return getErrorResponse(res, 404);

    const data = camelCaseData(reasonRows.rows);

    getSuccessResponse(res, 200, { data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get reasons pagination
router.get(apiRoute.reason, async (req, res) => {
  // Validate input

  const { error } = getReasonValidation(req.query);
  if (error) return getErrorResponse(res, 400, error.details[0]);
  const {
    name, requestTypeId, limit = defaultLimit, page = defaultPage
  } = req.query;
  try {
    const offset = getOffset(page, limit);

    // Get all reasons by requestTypeId
    const joinConditions = [];
    if (name) joinConditions.push(`name ilike '%${name}%'`);
    if (requestTypeId) joinConditions.push(`request_type_id = '${requestTypeId}'`);
    let conditions = '';
    if (joinConditions.length) conditions = `where ${joinConditions.join(' and ')}`;
    // count number of items on list
    const reasonCounts = await req.postgres.query(`
    select count(*)::int FROM reason ${conditions}
    `);
    // Get list item
    const reasonRows = await req.postgres.query(`
    select *,
    reason.name,
    max_request_day::int,
    (select r1.name from "request_type" r1 where reason.request_type_id = r1.id) as request_type_name
    FROM reason ${conditions}
    order by name asc
    limit ${limit} offset ${offset}`);
    if (!reasonRows.rowCount || !reasonCounts.rowCount) {
      return getSuccessResponse(res, 200, {
        pagination: { count: 0, page: Number(page) },
        data: []
      });
    }

    const data = camelCaseData(reasonRows.rows);
    const { count } = reasonCounts.rows[0];

    getSuccessResponse(res, 200, { data, pagination: { count, page: Number(page) }, });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.post(apiRoute.reason, async (req, res) => {
  const { error } = postReasonValidation(req.body);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  const { name, requestTypeId, description } = req.body;
  // find duplicate name of item with the same requestTypeId
  const findDuplicate = await req.postgres.query(`select * from reason where reason.name='${name}' and request_type_id='${requestTypeId}'`);
  if (findDuplicate.rowCount) return getErrorResponse(res, 400, 'Found a duplicate reason with the same request type.');

  // setting query
  const postQuery = ['name', 'max_request_day', 'request_type_id'];
  const postValues = [':name', ':maxRequestDay', ':requestTypeId'];
  if (description) {
    postQuery.push('description');
    postValues.push(':description');
  }

  // execute query to create a reason
  const postResult = await req.postgres.query(named(`INSERT INTO reason (${postQuery.join(', ')}) 
    VALUES(${postValues.join(', ')}) returning *`)({
    ...req.body
  }));

  // return result
  if (!postResult.rowCount) return getErrorResponse(res, 500);
  return getSuccessResponse(res, 200, { data: { id: postResult.rows[0].id } });
});

router.put(`${apiRoute.reason}/:id`, async (req, res) => {
  const { id } = req.params;
  const { error } = putReasonValidation({ ...req.body, id });
  if (error) return getErrorResponse(res, 400, error.details[0]);

  const {
    name, requestTypeId, maxRequestDay, description
  } = req.body;
  // check existed item
  const findDuplicate = name && await req.postgres.query(
    `select * from reason where name='${name}' and request_type_id='${requestTypeId}'  and id<>'${id}'`
  );
  if (findDuplicate && findDuplicate.rowCount) {
    return getErrorResponse(res, 400, 'Found a duplicate reason with the same request type.');
  }
  const putQuery = ['request_type_id=:requestTypeId'];
  // update  item
  if (name) putQuery.push('name=:name');

  if (maxRequestDay) putQuery.push('max_request_day=:maxRequestDay');

  if (description) putQuery.push('description=:description');

  // execute query to create a reason
  const putResult = await req.postgres.query(named(
    `UPDATE reason set ${putQuery.join(', ')} where id=:id returning *`
  )({
    id,
    ...req.body
  }));
  // return result
  if (!putResult.rowCount) return getErrorResponse(res, 500);
  return getSuccessResponse(res, 200, { data: { id: putResult.rows[0].id } });
});

// delete reason
router.delete(`${apiRoute.reason}/:id`, async (req, res) => {
  const { error } = idValidation(req.params);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { id } = req.params;
    await req.postgres.query('BEGIN');
    // update request
    await req.postgres.query(
      ` 
      update request set reason_id = null where reason_id = '${id}'
      `
    );
    const deleteResult = await req.postgres.query(
      `
      DELETE FROM reason
      where id='${id}'
      `
    );

    await req.postgres.query('COMMIT');
    if (!deleteResult.rowCount) return getErrorResponse(res, 404);

    return getSuccessResponse(res, 200);
  } catch (err) {
    return getErrorResponse(res, 500, err.toString());
  }
});

// Get all request types
router.get(apiRoute.requestType, async (req, res) => {
  try {
    const requestType = await req.postgres.query('select * from request_type');
    if (!requestType.rowCount) return getErrorResponse(res, 404);

    const data = camelCaseData(requestType.rows);

    getSuccessResponse(res, 200, { data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.get(apiRoute.checkCompRequest, async (req, res) => {
  // Validate input
  const { error } = checkRequestValidation(req.query);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { requestTypeId, fromDate, toDate } = req.query;

    // Convert date to date time
    const toDateUTC = new Date(toDate);
    toDateUTC.setHours(23, 59, 59, 999);

    // Count requests by requestTypeId
    const compDayCount = await req.postgres.query(named(`
    select distinct compensation_date from request 
    where request_type_id = :requestTypeId
    and error_count = 'true'
    and user_id = :userId
    and compensation_date::date between :fromDate and :toDateUTC
    and status != 'rejected'
    `)({
      requestTypeId,
      userId: req.user.id,
      fromDate,
      toDateUTC
    }));
    const requestDayCount = await req.postgres.query(named(`
    select distinct request_date from request 
    where request_type_id = :requestTypeId
    and error_count = 'true'
    and user_id = :userId
    and compensation_date::date between :fromDate and :toDateUTC
    and status != 'rejected'
    `)({
      requestTypeId,
      userId: req.user.id,
      fromDate,
      toDateUTC
    }));

    if (compDayCount.rowCount == null || requestDayCount.rowCount == null) {
      return getErrorResponse(res, 404);
    }

    let numberOfLeftRequest = defaultMaxCompRequestPerMonth
      - requestDayCount.rows.length;
    if (
      compDayCount.rows.length === defaultMaxCompDayPerMonth
      && requestDayCount.rows.length === defaultMaxCompRequestPerMonth) {
      numberOfLeftRequest = 0;
    }

    getSuccessResponse(res, 200, {
      data: {
        numberOfLeftRequest,
        maxRequestDay: defaultMaxCompRequestPerMonth,
        compensationDateList: camelCaseData(compDayCount.rows)
      }
    });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.get(apiRoute.checkForgetRequest, async (req, res) => {
  try {
    const { code, error, data } = await checkForgetRequestService(req);

    if (!data) return getErrorResponse(res, code, error);

    getSuccessResponse(res, 200, { data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Check leave request
router.get(apiRoute.checkLeaveRequest, async (req, res) => {
  // Get userId in httpOnly cookie
  const userId = req.user.id;

  // Validate input
  const { error } = checkLeaveRequestValidation(req.query);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const {
      requestTypeId, reasonId, fromDate, toDate
    } = req.query;

    // Convert date to date time
    const toDateUTC = new Date(toDate);
    toDateUTC.setHours(23, 59, 59, 999);

    // Get maxRequestDay
    const reason = await req.postgres.query(named(`
      select max_request_day::int FROM reason 
      where id = :reasonId limit 1`)({ reasonId }));
    if (!reason.rowCount) return getErrorResponse(res, 404);

    // Get maxRequestHour
    const defaultWorkingHour = 8;
    const maxRequestDay = reason.rows[0].max_request_day;
    const maxRequestHour = defaultWorkingHour * maxRequestDay;

    if ([leaveCarryOverType, reasonLeaveRequestId].includes(reasonId)) {
      const userLeaveQuery = await req.postgres.query((`
        select * from "user_leave" 
        where user_id ='${userId}' and year = ${toDateUTC.getFullYear()}
      `));

      const userLeave = camelCaseData(userLeaveQuery.rows[0]);
      if (reasonId === reasonLeaveRequestId) {
        return getSuccessResponse(res, 200, {
          data: {
            numberOfLeftHour: userLeave.totalRemain,
            maxRequestHour: userLeave.totalLeave
          }
        });
      } if (reasonId === leaveCarryOverType) {
        return getSuccessResponse(res, 200, {
          data: {
            numberOfLeftHour: userLeave.carryOverRemain,
            maxRequestHour: userLeave.carryOver
          }
        });
      }
    }

    // Get leave requests by reasonId
    const leaveRequest = await req.postgres.query(named(`
    select off_time_hour from request
    where reason_id = :reasonId
    and request_type_id = :requestTypeId
    and user_id = :userId
    and status != 'rejected'
    and ((start_date_time::date between :fromDate and :toDateUTC) 
    or (end_date_time::date between :fromDate and :toDateUTC))`)({
      requestTypeId,
      userId,
      reasonId,
      fromDate,
      toDateUTC
    }));
    if (!leaveRequest.rowCount) leaveRequest.rows = [];

    const countOffTimeHour = leaveRequest.rows.reduce(
      (totalOffHour, request) => totalOffHour + Number(request.off_time_hour), 0
    );

    const numberOfLeftHour = maxRequestHour - countOffTimeHour;

    getSuccessResponse(res, 200, { data: { numberOfLeftHour, maxRequestHour } });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.get(
  apiRoute.countRequestForManager,
  requestController.countLeaveRequestsForManager
);

router.get(
  apiRoute.requestForAdmin,
  validate(requestValidation.getRequestForAdminValidation),
  requestController.getRequestForAdmin
);

module.exports = router;
