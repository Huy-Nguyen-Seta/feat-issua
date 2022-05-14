const router = require('express').Router();
// const camelcaseKeys = require('camelcase-keys');
const apiRoute = require('../../apiRoute.json');
const {
  getErrorResponse,
  getSuccessResponse
} = require('../helper/handle-response');
const {
  calTotalTimeUserLeaveByYear,
  getAllUserLeave,
  updateUserLeave,
} = require('../services/userLeave.service');
const validate = require('../middlewares/validate');
const { userLeaveValidation } = require('../validations');

router.post(apiRoute.createLeave, async (req, res) => {
  try {
    const monthNow = new Date().getMonth() + 1;
    let data;
    if (monthNow >= 3) {
      // return getErrorResponse(res, '500', 'Can\'t Update');
      data = await calTotalTimeUserLeaveByYear(req, true);
    } else {
      data = await calTotalTimeUserLeaveByYear(req);
    }
    getSuccessResponse(res, 200, { count: data.length, data });
  } catch (err) {
    return getErrorResponse(res, '500', err);
  }
});

router.get(apiRoute.getUserLeave, async (req, res) => {
  try {
    const { code, data, error: errorData } = await getAllUserLeave(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    return getErrorResponse(res, '500', err.toString());
  }
});

router.put(
  apiRoute.updateUserLeave,
  validate(userLeaveValidation.updateUserLeave),
  async (req, res) => {
    try {
      const { code, data } = await updateUserLeave(req);
      if (code === 200 && data > 0) {
        return getSuccessResponse(res, 200, { data: 'success' });
      }
      return getErrorResponse(res, '500', 'ERROR SERVER');
    } catch (err) {
      return getErrorResponse(res, '500', err.toString());
    }
  }
);
module.exports = router;
