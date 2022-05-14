import moment from 'moment';

const requiredValidate = (value) => (value ? '' : 'The field must not be empty');

const requiredDateValidate = (value) => (value && moment(value).isValid() ? '' : 'The field must not be empty');

const rangeDateValidate = (startDateStr, endDateStr) => {
  const startDate = moment(startDateStr);
  const endDate = moment(endDateStr);
  if (!startDate.isValid() || !endDate.isValid()) return ['The field must not be empty', 'The field must not be empty'];
  if (startDate.valueOf() > endDate.valueOf()) return ['Start time must less than end time', 'End time must greater then start time'];
  return [];
};

const emailValidate = (value) => {
  if (!value || !value.length) {
    return 'The field must not be empty';
  }
  return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value.trim())
    ? 'Invalid email address'
    : '';
};
const lengthValidate = (length) => (value) => (value && value.length >= length
  ? ''
  : `The field must be from ${length} characters`);
const lengthValidate6 = lengthValidate(6);
const checkPassword = (password) => {
  let point = 0;
  // if (password.match(/[a-z]+/)) {
  //   point += 1;
  // }
  // if (password.match(/[A-Z]+/)) {
  //   point += 1;
  // }
  // if (password.match(/[0-9]+/)) {
  //   point += 1;
  // }
  // if (password.match(/[!@#$%&".^_~`]+/)) {
  //   point += 1;
  // }
  if (password.length >= 6) {
    point += 1;
  }
  return point;
};

const validateNumber = (value) => {
  const reg = /[+-]?([0-9]*[.])?[0-9]+/;
  return reg.test(value) ? '' : 'This field must be numberic';
};
const passwordValidate = (password) => (requiredValidate(password) ? requiredValidate(password)
  : lengthValidate6(password));
const rePasswordValidate = (rePassword, password) => (password !== rePassword ? 'Passwords do not match' : '');
export {
  requiredValidate,
  emailValidate,
  rePasswordValidate,
  lengthValidate6,
  passwordValidate,
  checkPassword,
  requiredDateValidate,
  rangeDateValidate,
  validateNumber
};
