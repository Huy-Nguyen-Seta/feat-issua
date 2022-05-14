const router = require('express').Router();
const apiRoute = require('../../apiRoute.json');
const {
  postHolidayValidation, postWorkTimeValidation, getWorkTimeValidation
} = require('../validations/validation');
const {
  getErrorResponse,
  getSuccessResponse
} = require('../helper/handle-response');
const {
  getAllHolidaysSevice, createHolidayService,
  createWorktimeService,
  getWorkTimeService,
  deleteHolidaysSevice
} = require('../services/admin.service');
const { adminController } = require('../controllers');
const { adminValidation } = require('../validations');
const validate = require('../middlewares/validate');

// Admin creates new holiday
router.post(apiRoute.holiday, async (req, res) => {
  // Validate input
  const { error } = postHolidayValidation(req.body);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { code, data, error: insertError } = await createHolidayService(req);

    // Send id of holiday when sucess
    if (data) return getSuccessResponse(res, code, { data });

    getErrorResponse(res, code, insertError);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get all holidays
router.get(apiRoute.holiday, async (req, res) => {
  try {
    const { code, data, error } = await getAllHolidaysSevice(req);

    if (data) return getSuccessResponse(res, code, { data });

    getErrorResponse(res, code, error);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.put(
  `${apiRoute.holiday}/:id`,
  validate(adminValidation.updateHoliday),
  adminController.updateHoliday
);

router.delete(`${apiRoute.holiday}/:id`, async (req, res) => {
  try {
    const { code, data, error } = await deleteHolidaysSevice(req);

    if (data) return getSuccessResponse(res, code, { data });

    getErrorResponse(res, code, error);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Admin creates user working time
router.post(apiRoute.workTime, async (req, res) => {
  const { error } = postWorkTimeValidation(req.body);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { code, data, error: insertError } = await createWorktimeService(req);

    // Send id of work time when sucess
    if (data) return getSuccessResponse(res, code, { data });

    getErrorResponse(res, code, insertError);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get all working time of a user
router.get(apiRoute.workTime, async (req, res) => {
  const { error } = getWorkTimeValidation(req.query);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { code, data, error: errorMsg } = await getWorkTimeService(req);

    if (data) return getSuccessResponse(res, code, { data });

    getErrorResponse(res, code, errorMsg);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.put(
  `${apiRoute.workTime}/:id`,
  validate(adminValidation.updateWorkingTime),
  adminController.updateWorkingTime
);

router.delete(
  `${apiRoute.workTime}/:id`,
  validate(adminValidation.deleteWorkingTime),
  adminController.deleteWorkingTime
);

module.exports = router;
