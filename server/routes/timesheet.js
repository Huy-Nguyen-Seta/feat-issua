const router = require('express').Router();
const apiRoute = require('../../apiRoute.json');
const {
  getErrorResponse,
  getSuccessResponse,
} = require('../helper/handle-response');
const {
  getMyTimesheetService,
  getMemberTimesheetService,
  getATimesheetService,
  getAllTimesheetService,
  exportTimesheetService,
} = require('../services/timesheet');
const { exportTimeheetValidation } = require('../validations/validation');

// Get my timesheet
router.get(apiRoute.timesheet, async (req, res) => {
  try {
    const { code, data, error: errorData } = await getMyTimesheetService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get member timesheet
router.get(apiRoute.memberTimesheet, async (req, res) => {
  try {
    const { code, data, error: errorData } = await getMemberTimesheetService(
      req
    );

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get a timesheet of current active user
router.get(`${apiRoute.timesheetRequest}`, async (req, res) => {
  try {
    const { code, data, error: errorData } = await getATimesheetService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get timesheet of all users
router.get(`${apiRoute.allTimesheet}`, async (req, res) => {
  try {
    const { code, data, error: errorData } = await getAllTimesheetService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.get(`${apiRoute.exportTimesheet}`, async (req, res) => {
  const { error } = exportTimeheetValidation({ ...req.query });
  if (error) return { code: 400, error: error.details[0] };

  try {
    const { code, data, error: errorData } = await exportTimesheetService(req);

    if (data) return getSuccessResponse(res, code, { data });

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

module.exports = router;
