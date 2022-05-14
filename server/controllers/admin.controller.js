const catchAsync = require('../utils/catchAsync');
const { adminService } = require('../services');
const { getSuccessResponse } = require('../helper/handle-response');

const updateHoliday = catchAsync(async (req, res) => {
  await adminService.checkDuplicateHoliday(req);
  await adminService.updateHoliday(req);
  getSuccessResponse(res, 200, { data: { ...req.body, ...req.params } });
});

const updateWorkingTime = catchAsync(async (req, res) => {
  await adminService.checkDuplicateWorkingTime(req);
  await adminService.updateWorkingTimeService(req);
  getSuccessResponse(res, 200, { data: { ...req.body, ...req.params } });
});

const deleteWorkingTime = catchAsync(async (req, res) => {
  await adminService.deleteWorkingTimeService(req);
  getSuccessResponse(res, 200, { data: { ...req.body, ...req.params } });
});

module.exports = {
  updateHoliday,
  updateWorkingTime,
  deleteWorkingTime
};
