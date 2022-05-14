const Joi = require('joi');

const updateHoliday = {
  params: Joi.object().keys({
    id: Joi.string()
      .base64({ paddingRequired: true, urlSafe: true })
      .required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    description: Joi.string(),
    endDate: Joi.date(),
    startDate: Joi.date()
  })
};

const updateWorkingTime = {
  params: Joi.object().keys({
    id: Joi.string()
      .base64({ paddingRequired: true, urlSafe: true })
      .required(),
  }),
  body: Joi.object().keys({
    fromDate: Joi.date(),
    toDate: Joi.date(),
    fromTime: Joi.string(),
    toTime: Joi.string(),
    startBreakTime: Joi.string(),
    endBreakTime: Joi.string(),
    description: Joi.string(),
    userId: Joi.string()
      .base64({ paddingRequired: true, urlSafe: true })
  })
};

const deleteWorkingTime = {
  params: Joi.object().keys({
    id: Joi.string()
      .base64({ paddingRequired: true, urlSafe: true })
      .required(),
  })
};

module.exports = { updateHoliday, updateWorkingTime, deleteWorkingTime };
