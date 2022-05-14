const catchAsync = require('../utils/catchAsync');
const { requestService } = require('../services');
const { getSuccessResponse } = require('../helper/handle-response');

const countLeaveRequestsForManager = catchAsync(async (req, res) => {
  const countResult = await requestService.countNewRequestsForPM(req);
  getSuccessResponse(res, 200, { data: { count: countResult.count } });
});

async function sendMailToPM({ req, requestId }) {
  await requestService.sendMailToPMService({ req, requestId });
}

async function sendMailToStaff({ req, requestId, status }) {
  await requestService.sendMailToStaffService({ req, requestId, status });
}

const getRequestForAdmin = catchAsync(async (req, res) => {
  const data = await requestService.getRequestsForAdmin(req);
  getSuccessResponse(res, 200, data);
});

module.exports = {
  countLeaveRequestsForManager,
  getRequestForAdmin,
  sendMailToPM,
  sendMailToStaff,
};
