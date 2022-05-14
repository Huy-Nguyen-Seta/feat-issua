/* eslint-disable no-await-in-loop */
const fs = require('fs');
const { getAllUserInfoQuery, countAllUsersQuery } = require('../query/user.query');
const { defaultLimit, defaultPage } = require('../helper/constants');
const { camelCaseData, getOffset } = require('../helper/calculation');
const { decryptData, encryptData } = require('../validations/validation');
const userQuery = require('../query/user.query');
const { uploadToS3 } = require('../middlewares/upload');
const { postBiometrics } = require('../api/engine');
const config = require('../../config.json');
const apiRoute = require('../../apiRoute.json');

async function getAllUserInfoService(req) {
  const {
    email, badgeNumber, status, title, managerId,
    limit = defaultLimit, page = defaultPage
  } = req.query;
  const offset = getOffset(page, limit);

  // Count number of matched items
  const countUser = await req.postgres.query(countAllUsersQuery({
    email, badgeNumber, status, title, managerId
  }));

  // Get all user info and filter by data in req
  const users = await req.postgres.query(getAllUserInfoQuery({
    email,
    badgeNumber,
    status,
    title,
    managerId,
    limit,
    offset
  }));

  if (!users.rowCount || !countUser.rowCount) {
    return {
      code: 200,
      data: {
        pagination: { count: 0, page: Number(page) },
        data: []
      }
    };
  }

  // Return data when success
  let data = camelCaseData(users.rows);
  const { count } = countUser.rows[0];

  // filter any user has 'inactive' status
  data = data.filter((member) => member.status === 'active');

  return {
    code: 200,
    data: {
      pagination: { count, page: Number(page) },
      data
    }
  };
}

async function checkOldPassword(req) {
  const userResult = await req.postgres.query(
    userQuery.checkOldPassword({ userId: req.user.id })
  );
  if (!userResult.rowCount) throw new Error('User not found');

  const isValidPassword = await decryptData(
    req.body.oldPassword,
    userResult.rows[0].password
  );
  if (!isValidPassword) throw new Error('Invalid password');
}

async function insertNewPassword(req) {
  const hashedPassword = await encryptData(req.body.newPassword);
  if (!hashedPassword) throw new Error('Update password error');

  const updateResult = await req.postgres.query(
    userQuery.insertNewPassword({
      userId: req.user.id,
      hashedPassword
    })
  );
  if (!updateResult.rowCount) throw new Error('Update password error');
}

async function multipleUpload(req) {
  try {
    // MULTER hanlde and attach FILE in req
    const files = req.files || [];

    if (files.length < 5) {
      throw new Error('You must select 5 images.');
    }

    await req.postgres.query('BEGIN');

    const deleteImgageResult = await req.postgres.query(
      userQuery.deleteImageUrls({ userId: req.user.id })
    );

    if (deleteImgageResult.rowCount == null) {
      throw new Error('Error when processing images.');
    }

    const imageUrlObj = {};

    for (let i = 0; i < files.length; i += 1) {
      let orgName = `${Date.now()}-${files[i].originalname}` || '';
      orgName = orgName.trim().replace(/ /g, '-');
      const fullPathInServer = files[i].path;
      if (!fullPathInServer) throw new Error('Error when processing images');

      const imageUrl = await uploadToS3({
        input: {
          orgName,
          fullPathInServer
        }
      });
      if (!imageUrl) throw new Error('Error when uploading images');

      fs.unlinkSync(fullPathInServer);

      const result = await req.postgres.query(userQuery.saveImageUrls(
        { userId: req.user.id, biometricUrl: imageUrl }
      ));
      if (!result.rowCount) throw new Error('Error when saving images.');

      imageUrlObj[`imageUrl${i}`] = imageUrl;
    }

    await req.postgres.query('COMMIT');

    return imageUrlObj;
  } catch (error) {
    await req.postgres.query('ROLLBACK');
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      throw new Error('Too many files to upload');
    }
    throw new Error(error);
  }
}

async function callEngineToGetBiometricFile({ req, imageUrlObj }) {
  if (Object.keys(imageUrlObj).length < 5) {
    throw new Error('Error when processing 5 images');
  }

  const userId = req.user.id;

  // Create new sessionId in session table for tracking status of engine
  const sessionResult = await req.postgres.query(
    userQuery.addNewSession({ userId })
  );
  const sessionId = sessionResult.rows[0].id;

  if (!sessionResult.rowCount || !sessionId) {
    throw new Error('Error when tracking status of engine');
  }

  // Call engine api to send 5 imageUrls
  const result = await postBiometrics({
    ...imageUrlObj,
    callback: `${config.serverURL}${apiRoute.uploadBiometric}`,
    sessionId,
    userId,
    engine: 'face',
    type: 'encode',
  });
  console.error('---- Register biometric result ----', result.status, result.data);
  if (result.error || result.status !== 200 || result.data !== 'ok') {
    throw new Error(result.error);
  }

  // Check session table until complete = true
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const limit = 10;

  for (let i = 0; i < limit; i += 1) {
    await sleep(5000);

    const sessionRow = await req.postgres.query(
      userQuery.getEngineResult({ sessionId })
    );

    if (!sessionRow.rowCount) {
      throw new Error('------- Error when insert engine result in db. --------');
    }

    if (sessionRow.rowCount && sessionRow.rows[0].complete) {
      return { success: true, ...sessionRow.rows[0] };
    }
  }

  return { success: false };
}

module.exports = {
  getAllUserInfoService,
  checkOldPassword,
  insertNewPassword,
  multipleUpload,
  callEngineToGetBiometricFile
};
