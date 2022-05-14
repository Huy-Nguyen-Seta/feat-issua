const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { getSuccessResponse } = require('../helper/handle-response');

const updatePassword = catchAsync(async (req, res) => {
  await userService.checkOldPassword(req);
  await userService.insertNewPassword(req);
  res.clearCookie('token');
  getSuccessResponse(res, 200);
});

const multipleUpload = catchAsync(async (req, res) => {
  const imageUrlObj = await userService.multipleUpload(req);
  const result = await userService.callEngineToGetBiometricFile(
    { req, imageUrlObj }
  );
  getSuccessResponse(res, 200, result);
});

module.exports = { updatePassword, multipleUpload };
