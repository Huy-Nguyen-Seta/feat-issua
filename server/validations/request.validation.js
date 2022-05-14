const Joi = require('joi');

const getRequestForAdminValidation = {
  query: Joi.object().keys({
    fromDate: Joi.date().required(),
    toDate: Joi.date().required().min(Joi.ref('fromDate')),
    // Not required fields
    limit: Joi.number().integer().min(1),
    page: Joi.number().integer().min(1),
    badgeNumber: Joi.string(),
    managerId: Joi.string().base64({ paddingRequired: true, urlSafe: true }),
    requestTypeIds: Joi.array().min(1),
    status: Joi.string().allow('rejected', 'new', 'approved', 'confirmed'),
  })
};

module.exports = { getRequestForAdminValidation };
