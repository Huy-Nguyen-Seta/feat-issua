const Joi = require('joi');
const bycrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config.json');

function registerValidation(dataObject) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    hiredDate: Joi.date().required(),
    badgeNumber: Joi.string().required(),
    status: Joi.string().allow('active', 'inactive').required(),
    roleId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    managerId: Joi.string().required(),
    // Not required fields
    gender: Joi.string().allow('male', 'female'),
    birthDay: Joi.date(),
    phone: Joi.string(),
    address: Joi.string()
  });
  return schema.validate(dataObject);
}

function putUserInfoValidation(dataObject) {
  const schema = Joi.object({
    // id of user
    id: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    // Not required fields
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    hiredDate: Joi.date(),
    badgeNumber: Joi.string(),
    status: Joi.string().allow('active', 'inactive'),
    roleId: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    gender: Joi.string().allow('male', 'female'),
    birthDay: Joi.date(),
    phone: Joi.string(),
    address: Joi.string(),
    managerId: Joi.string(),
  });
  return schema.validate(dataObject);
}

function loginValidation(dataObject) {
  const schema = Joi.object({
    badgeNumber: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(dataObject);
}

function getRequestValidation(dataObject) {
  const schema = Joi.object({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    // Not required fields
    requestTypeIds: Joi.array().min(1),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
    reasonId: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    status: Joi.string().allow('rejected', 'new', 'approved', 'confirmed'),
    badgeNumber: Joi.string()
  });
  return schema.validate(dataObject);
}

function postRequestValidation(dataObject) {
  const schema = Joi.object({
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    // Default = true
    errorCount: Joi.boolean().required(),
    // User write comments for his/her request
    comment: Joi.string().required(),
    // Input for leave request
    reasonId: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    startDateTime: Joi.date(),
    endDateTime: Joi.date().greater(Joi.ref('startDateTime')),
    // Input for forget and late/early request
    requestDate: Joi.date(),
    compensationDate: Joi.date()
  });
  return schema.validate(dataObject);
}

function postForgetRequestValidation(dataObject) {
  const { startDateTime, endDateTime } = dataObject;
  if (!startDateTime && !endDateTime) {
    return { error: { details: ['Missing checkIn or checkOut.'] } };
  }

  const schema = Joi.object({
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    errorCount: Joi.boolean().required(), // Default = true
    comment: Joi.string().required(), // user's comment
    requestDate: Joi.date().required(),
    startDateTime: Joi.date().min(Joi.ref('requestDate')), // user checkIn
    endDateTime: Joi.date().min(Joi.ref('requestDate')) // user checkOut
  });
  return schema.validate(dataObject);
}

function postCompensationRequestValidation(dataObject) {
  const schema = Joi.object({
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    errorCount: Joi.boolean().required(), // Default = true
    comment: Joi.string().required(), // user's comment
    requestDate: Joi.date().required(),
    compensationDate: Joi.date().required().min(Joi.ref('requestDate'))
  });
  return schema.validate(dataObject);
}

function postLeaveRequestValidation(dataObject) {
  const schema = Joi.object({
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    errorCount: Joi.boolean().required(), // Default = true
    comment: Joi.string().required(), // user's comment
    reasonId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    startDateTime: Joi.date().required(),
    endDateTime: Joi.date().greater(Joi.ref('startDateTime')).required(),
  });
  return schema.validate(dataObject);
}

function putForgetRequestValidation(dataObject) {
  const schema = Joi.object({
    id: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    // User write comments for his/her request
    comment: Joi.string(),
    // Input when manager approve/reject a request
    status: Joi.string().allow('rejected', 'approved', 'confirmed'),
    approveBy: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    confirmBy: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    managerComment: Joi.string(),
    adminComment: Joi.string(),
    startDateTime: Joi.date(),
    endDateTime: Joi.date(),
    requestDate: Joi.date(),
    errorCount: Joi.boolean(),
  });
  return schema.validate(dataObject);
}

function putCompensationRequestValidation(dataObject) {
  const schema = Joi.object({
    id: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    // User write comments for his/her request
    comment: Joi.string(),
    // Input when manager approve/reject a request
    status: Joi.string().allow('rejected', 'approved', 'confirmed'),
    approveBy: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    confirmBy: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    managerComment: Joi.string(),
    requestDate: Joi.date(),
    compensationDate: Joi.date(),
    adminComment: Joi.string(),
  });
  return schema.validate(dataObject);
}

function putLeaveRequestValidation(dataObject) {
  const schema = Joi.object({
    id: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    // User write comments for his/her request
    comment: Joi.string(),
    // Input when manager approve/reject a request
    status: Joi.string().allow('rejected', 'approved'),
    approveBy: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    confirmBy: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    managerComment: Joi.string(),
    reasonId: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    startDateTime: Joi.date(),
    endDateTime: Joi.date(),
    adminComment: Joi.string(),
  });
  return schema.validate(dataObject);
}

function loginWithBiometricValidation(dataObject) {
  const schema = Joi.object({
    badgeNumber: Joi.string().required()
  });
  return schema.validate(dataObject);
}

function putSessionValidation(dataObject) {
  const schema = Joi.object({
    sessionId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    result: Joi.required().allow('False', 'True'),
    userId: Joi.string()
  });
  return schema.validate(dataObject);
}

function idValidation(dataObject, isRequired = true) {
  const idSchema = isRequired
    ? Joi.string().base64({ paddingRequired: true, urlSafe: true }).required()
    : Joi.string().base64({ paddingRequired: true, urlSafe: true });
  const schema = Joi.object({
    id: idSchema
  });
  return schema.validate(dataObject);
}

function getTimesheetValidation(dataObject) {
  const schema = Joi.object({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  });
  return schema.validate(dataObject);
}

function getMemberTimesheetValidation(dataObject) {
  const schema = Joi.object({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
    badgeNumber: Joi.string()
  });
  return schema.validate(dataObject);
}

function getATimesheetValidation(dataObject) {
  const schema = Joi.object({
    userId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    date: Joi.date().required()
  });
  return schema.validate(dataObject);
}

function getAllTimesheetValidation(dataObject) {
  const schema = Joi.object({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
    badgeNumber: Joi.string()
  });
  return schema.validate(dataObject);
}

function exportTimeheetValidation(dataObject) {
  const schema = Joi.object({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    badgeNumber: Joi.string()
  });
  return schema.validate(dataObject);
}

function checkRequestValidation(dataObject) {
  const schema = Joi.object({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    reasonId: Joi.string().base64({ paddingRequired: true, urlSafe: true })
  });
  return schema.validate(dataObject);
}

function checkForgetRequestValidation(dataObject) {
  const schema = Joi.object({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
  });
  return schema.validate(dataObject);
}

function checkLeaveRequestValidation(dataObject) {
  const schema = Joi.object({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    reasonId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required()
  });
  return schema.validate(dataObject);
}

function getUserValidation(dataObject) {
  const schema = Joi.object({
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
    badgeNumber: Joi.string(),
    email: Joi.string(),
    title: Joi.string(),
    status: Joi.string().allow('active', 'inactive'),
    managerId: Joi.string().base64({ paddingRequired: true, urlSafe: true })
  });
  return schema.validate(dataObject);
}

function getBiometricsValidation(dataObject) {
  const schema = Joi.object({
    key: Joi.string().allow(process.env.ENGINE_KEY).required()
  });
  return schema.validate(dataObject);
}

function postCheckInOutValidation(dataObject) {
  const schema = Joi.object({
    badgeNumber: Joi.string().required(),
    checkTime: Joi.date().required(),
    key: Joi.string().allow(process.env.ENGINE_KEY).required(),
    sensorId: Joi.string().required()
  });
  return schema.validate(dataObject);
}

function postHolidayValidation(dataObject) {
  const schema = Joi.object({
    name: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    description: Joi.string()
  });
  return schema.validate(dataObject);
}

function postWorkTimeValidation(dataObject) {
  const regex = /^([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
  const schema = Joi.object({
    userId: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    fromDate: Joi.date().required(),
    toDate: Joi.date().greater(Joi.ref('fromDate')),
    fromTime: Joi.string().regex(regex).required(),
    toTime: Joi.string().regex(regex).required(),
    startBreakTime: Joi.string().regex(regex).required(),
    endBreakTime: Joi.string().regex(regex).required(),
    description: Joi.string().default('')
  });
  return schema.validate(dataObject);
}

function getWorkTimeValidation(dataObject) {
  const schema = Joi.object({
    userId: Joi.string().base64({ paddingRequired: true, urlSafe: true })
  });
  return schema.validate(dataObject);
}

async function encryptData(string) {
  const salt = await bycrypt.genSalt(10);
  const hashedString = await bycrypt.hash(string, salt);
  return hashedString;
}

async function decryptData(string, hashedString) {
  const isValid = await bycrypt.compare(string, hashedString);
  return isValid;
}

function setCookie(
  res,
  cookieName,
  data,
  expireHours = 24
) {
  const expires = expireHours * 3600 * 1000;
  const token = jwt.sign(data, config.secret, { expiresIn: expires });
  res.cookie(
    cookieName,
    token,
    { httpOnly: true, expires: new Date(Date.now() + expires) }
  );
}

function getReasonValidation(dataObject) {
  const schema = Joi.object({
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    name: Joi.string(),
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
  });
  return schema.validate(dataObject);
}

function postReasonValidation(dataObject) {
  const schema = Joi.object({
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    name: Joi.string().required(),
    maxRequestDay: Joi.number().integer().min(1).required(),
    description: Joi.string()

  });
  return schema.validate(dataObject);
}

function putReasonValidation(dataObject) {
  const schema = Joi.object({
    id: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    requestTypeId: Joi.string().base64({ paddingRequired: true, urlSafe: true }).required(),
    name: Joi.string(),
    maxRequestDay: Joi.number().integer().min(1),
    description: Joi.string()

  });
  return schema.validate(dataObject);
}

module.exports = {
  putReasonValidation,
  getRequestValidation,
  putUserInfoValidation,
  postRequestValidation,
  postCompensationRequestValidation,
  postLeaveRequestValidation,
  postForgetRequestValidation,
  putForgetRequestValidation,
  putCompensationRequestValidation,
  putLeaveRequestValidation,
  loginValidation,
  registerValidation,
  encryptData,
  decryptData,
  loginWithBiometricValidation,
  putSessionValidation,
  getTimesheetValidation,
  getATimesheetValidation,
  getAllTimesheetValidation,
  exportTimeheetValidation,
  getMemberTimesheetValidation,
  checkRequestValidation,
  checkForgetRequestValidation,
  checkLeaveRequestValidation,
  postHolidayValidation,
  postWorkTimeValidation,
  getWorkTimeValidation,
  getUserValidation,
  getBiometricsValidation,
  postCheckInOutValidation,
  idValidation,
  setCookie,
  getReasonValidation,
  postReasonValidation
};
