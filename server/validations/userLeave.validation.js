const Joi = require('joi');

const updateUserLeave = {
  body: Joi.object().keys({
    year: Joi.number().integer().required(),
    userId: Joi.string()
      .base64({ paddingRequired: true, urlSafe: true }),
    totalLeave: Joi.number().required(),
    totalRemain: Joi.number().required(),
    carryOver: Joi.number().required(),
    carryOverRemain: Joi.number().required(),
    name: Joi.string().required(),
    badgeNumber: Joi.string().required()
  }),
};

module.exports = { updateUserLeave };
