const Joi = require('joi');

const updatePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(6)
      .invalid(Joi.ref('oldPassword'))
      .required()
  }),
};

module.exports = { updatePassword };
