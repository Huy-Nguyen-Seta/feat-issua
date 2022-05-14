const router = require('express').Router();

const apiRoute = require('../../apiRoute.json');
const { getErrorResponse, getSuccessResponse } = require('../helper/handle-response');
const {
  getBiometricsValidation,
  postCheckInOutValidation
} = require('../validations/validation');
const {
  getBiometricsService,
  getImageUrlsService,
  postCheckInOutService
} = require('../services/engine');

// Get all biometrics for old engine
router.get(apiRoute.biometrics, async (req, res) => {
  const { error } = getBiometricsValidation(req.query);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { code, data, error: errorData } = await getBiometricsService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Get all biometric images for new engine
router.get(apiRoute.getImageUrls, async (req, res) => {
  const { error } = getBiometricsValidation(req.query);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { code, data, error: errorData } = await getImageUrlsService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Engine post check in out time
router.post(apiRoute.checkInOut, async (req, res) => {
  req.body.checkTime = new Date().toISOString();
  const { error } = postCheckInOutValidation(req.body);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    const { code, data, error: errorData } = await postCheckInOutService(req);

    if (data) return getSuccessResponse(res, code, data);

    getErrorResponse(res, code, errorData);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

module.exports = router;
