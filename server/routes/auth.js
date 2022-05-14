/* eslint-disable no-await-in-loop */
const router = require('express').Router();
const named = require('yesql').pg;
const fs = require('fs');
const { v4 } = require('uuid');

const { uploadToS3, imageUploader } = require('../middlewares/upload');
const { postBiometrics } = require('../api/engine');
const config = require('../../config.json');
const {
  loginValidation,
  decryptData,
  loginWithBiometricValidation,
  putSessionValidation,
  setCookie,
  idValidation
} = require('../validations/validation');
const apiRoute = require('../../apiRoute.json');
const { getErrorResponse, getSuccessResponse } = require('../helper/handle-response');
const { getUserRow, getUserInfo } = require('../helper/user');

// Router for client to register biometric for new user
router.post(apiRoute.uploadImageRegister, imageUploader.single('avatar'), async (req, res) => {
  try {
    // Get userId in httpOnly cookie
    const userId = req.user.id;
    if (!userId) return getErrorResponse(res, 401);

    // Read file from client
    const processedFile = req.file || {}; // MULTER hanlde and attach FILE in req
    let orgName = `${processedFile.originalname}-${userId}` || ''; // Original filename in user's computer
    orgName = orgName.trim().replace(/ /g, '-');
    const fullPathInServer = processedFile.path;
    if (!fullPathInServer) return getErrorResponse(res, 400, 'Missing image.');

    const imageUrl = await uploadToS3({
      input: {
        orgName,
        fullPathInServer
      }
    });
    if (!imageUrl) return getErrorResponse(res, 500, 'Missing image url.');

    fs.unlinkSync(fullPathInServer);

    // Create new sessionId in session table for tracking status of engine
    const sessionId = v4();
    const sessionResult = await req.postgres.query(named(`
      insert into session(id, user_email) VALUES (:sessionId, :userId)`)({
      sessionId,
      userId
    }));
    if (!sessionResult.rowCount) return getErrorResponse(res, 500);

    // Call engine api to send imageUrl
    const result = await postBiometrics({
      imageUrl,
      callback: `${config.serverURL}${apiRoute.uploadBiometric}`,
      sessionId,
      userId,
      engine: 'face',
      type: 'encode',
    });
    console.log('---- Engine result ----', result.status, result.data);
    if (result.error || result.status !== 200 || result.data !== 'ok') {
      console.log('-------- Engine returns error. ---------------');
      return getErrorResponse(res, 500, result.error);
    }

    // Check session table until complete = true
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const limit = 10;
    for (let i = 0; i < limit; i += 1) {
      await sleep(5000);

      const sessionRow = await req.postgres.query(named(`
        select valid, complete from session
        where id =:sessionId limit 1`)({ sessionId }));

      if (!sessionRow.rowCount) {
        console.log('------- Error when insert engine result in db. --------');
        break;
      }

      if (sessionRow.rows[0].complete) {
        console.log('------- Receive engine result in db. --------');
        return getSuccessResponse(res, 200, { success: sessionRow.rows[0] });
      }
    }

    getSuccessResponse(res, 200, { success: false });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Router for engine to send biometric file
router.post(apiRoute.uploadBiometric, imageUploader.single('avatar'), async (req, res) => {
  try {
    const { error } = putSessionValidation(req.body);
    if (error) return getErrorResponse(res, 400, error.details[0]);

    // Update status of engine in session table
    const { sessionId, result } = req.body;

    await req.postgres.query('BEGIN');

    const sessionRow = await req.postgres.query(named(`
      update session set valid = :valid, complete = true where id = :sessionId`)({
      sessionId,
      valid: result === 'True'
    }));
    if (!sessionRow.rowCount) return getErrorResponse(res, 500, 'Cannot add session.');

    // Update biometrics in user table by userId
    // if no fileUrl, it means engine cannot detect face
    const processedFile = req.file || {}; // MULTER hanlde and attach FILE in req
    let orgName = `${processedFile.originalname}-${req.body.sessionId}` || ''; // Original filename in user's computer
    orgName = orgName.trim().replace(/ /g, '-');
    const fullPathInServer = processedFile.path;

    let fileUrl = '';
    if (fullPathInServer && orgName) {
      fileUrl = await uploadToS3({
        input: {
          orgName,
          fullPathInServer
        }
      });
      fs.unlinkSync(fullPathInServer);
    }
    if (fileUrl) {
      const { userId } = req.body;
      const userResult = await req.postgres.query(named(`
        update "user" set biometric_url = :fileUrl where id = :userId`)({
        fileUrl,
        userId
      }));
      await req.postgres.query('COMMIT');
      if (!userResult.rowCount) return getErrorResponse(res, 500, 'Not found url.');
    }

    await req.postgres.query('COMMIT');

    getSuccessResponse(res, 200);
  } catch (err) {
    await req.postgres.query('ROLLBACK');
    getErrorResponse(res, 500, err.toString());
  }
});

router.post(apiRoute.login, async (req, res) => {
  // Validate input
  const { error } = loginValidation(req.body);
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    // Check email and password in database
    const { badgeNumber, password } = req.body;
    const user = await getUserRow(req, 'badge_number', badgeNumber);
    if (!user.rowCount || user.rows[0].status === 'inactive') {
      return getErrorResponse(res, 401, 'Invalid badgeNumber or password.');
    }

    const isValidPassword = await decryptData(password, user.rows[0].password);
    if (!isValidPassword) {
      return getErrorResponse(res, 401, 'Invalid badgeNumber or password.');
    }

    // Set httpOnly cookie, default expires = 24 hours
    setCookie(res, 'token', { id: user.rows[0].id });

    const data = getUserInfo(user.rows[0]);

    // Send user info when success
    getSuccessResponse(res, 200, { data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.post(apiRoute.loginWithImage, imageUploader.single('avatar'), async (req, res) => {
  try {
    const processedFile = req.file || {}; // MULTER hanlde and attach FILE in req
    let orgName = processedFile.originalname || ''; // Original filename in user's computer
    orgName = orgName.trim().replace(/ /g, '-');
    const fullPathInServer = processedFile.path;
    if (!fullPathInServer) return getErrorResponse(res, 400, 'Missing image.');

    const imageUrl = await uploadToS3({
      input: {
        orgName,
        fullPathInServer
      }
    });
    if (!imageUrl) getErrorResponse(res, 500);

    fs.unlinkSync(fullPathInServer);

    const { error } = loginWithBiometricValidation(req.body);
    if (error) return getErrorResponse(res, 400, error.details[0]);

    // Get biometricUrl in user table
    const { badgeNumber } = req.body;
    const user = await req.postgres.query(named(`
      select biometric_url FROM "user" where badge_number = :badgeNumber limit 1`)({
      badgeNumber
    }));
    if (!user.rowCount) return getErrorResponse(res, 404, 'User not found.');

    const { biometric_url: biometricUrl } = user.rows[0];
    if (!biometricUrl) {
      return getErrorResponse(res, 404, 'Biometric not found.');
    }

    // Add new sessionId in session table
    const sessionId = v4();
    await req.postgres.query(named(`
      insert into session(id, user_email) VALUES (:sessionId, :badgeNumber)`)({
      sessionId,
      badgeNumber
    }));

    // Call engine api to send imageUrl
    const result = await postBiometrics({
      imageUrl,
      callback: `${config.serverURL}${apiRoute.session}`,
      sessionId,
      userId: badgeNumber,
      biometricUrl,
      type: 'compare',
      engine: 'face',
    });
    console.log('--- Login with biometric engine result', result);
    if (result.error) return getErrorResponse(res, 500, result.error);

    getSuccessResponse(res, 200, { sessionId });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Router for engine to update status of checking biometric when login
router.post(apiRoute.session, async (req, res) => {
  try {
    // Validate input
    const { error } = putSessionValidation(req.body);
    if (error) return getErrorResponse(res, 400, error.details[0]);

    const { sessionId, result } = req.body;
    const sessionRow = await req.postgres.query(named(`
      update session set valid =:valid, complete = true where id = :sessionId`)({
      sessionId,
      valid: result === 'True'
    }));
    if (!sessionRow.rowCount) return getErrorResponse(res, 404, 'Not found.');

    getSuccessResponse(res, 200);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

router.post(apiRoute.logout, async (req, res) => {
  try {
    await req.postgres.query(`delete from firebase where user_id = '${req.user.id}'`);
    res.clearCookie('token');
    getSuccessResponse(res, 200);
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

// Router for client to get userInfo when login with image
router.get(`${apiRoute.session}/:sessionId`, async (req, res) => {
  const { error } = idValidation({ id: req.params.sessionId });
  if (error) return getErrorResponse(res, 400, error.details[0]);

  try {
    // Find session by id in database
    const { sessionId } = req.params;
    const result = await req.postgres.query(named(`
      select valid, complete, user_email as badge_number from session 
      where id =:sessionId`)({ sessionId }));
    if (!result.rowCount) return getErrorResponse(res, 404);

    const { valid, complete, badge_number: badgeNumber } = result.rows[0];
    if (!valid) return getSuccessResponse(res, 200, { valid, complete });

    // When valid and complete is true, get user info in user table
    const user = await getUserRow(req, 'badge_number', badgeNumber);
    if (!user.rowCount) getErrorResponse(res, 404, 'User not found');

    // Set httpOnly cookie, default expires = 24 hours
    setCookie(res, 'token', { id: user.rows[0].id });

    const data = getUserInfo(user.rows[0]);

    // Send user info when success
    getSuccessResponse(res, 200, { valid, complete, data });
  } catch (err) {
    getErrorResponse(res, 500, err.toString());
  }
});

module.exports = router;
