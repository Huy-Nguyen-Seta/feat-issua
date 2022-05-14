import moment from 'moment';

export const getBackToWorkDate = (date, user = { toTime: '17:30' }) => {
  if (moment(date).isBefore(moment(date).set({ h: user.toTime.split(':')[0], m: user.toTime.split(':')[1], s: 0 }))) {
    return moment(date);
  }
  if (moment(date).isoWeekday() !== 5) {
    return moment(date).add(1, 'days');
  }
  return moment(date).add(3, 'days');
};

export const getDaysFromHours = (hour) => {
  if (!hour) {
    return {
      day: 0,
      hour: 0
    };
  }
  const outDay = Math.floor(Number(hour) / 8);
  const outHour = Number(hour) - Math.floor(Number(hour) / 8) * 8;
  return {
    day: outDay,
    hour: outHour
  };
};

const defaultUser = {
  fromTime: '08:30:00',
  toTime: '17:30:00'
};

const defaltBreakingTimeStart = '12:00';
const defaltBreakingTimeEnd = '13:00';

export const setHourTime = (date, hour) => {
  if (!hour) return date;
  return date.clone().set({ h: hour.split(':')[0], m: hour.split(':')[1], s: 0 });
};

export const getLeaveHour = (date, type = 0, user = defaultUser) => {
  if (!date.isValid()) {
    return 'Date must be valid';
  }
  let output = date;
  const { fromTime, toTime } = user;
  if (!fromTime) return "User'start working time must be valid ";
  if (!toTime) return "User'end working time must be valid ";
  // set start time
  if (type === 0) {
    if (date.isBefore(setHourTime(date, fromTime))) {
      output = setHourTime(date, fromTime);
    } else if (date.isSameOrAfter(setHourTime(date, defaltBreakingTimeStart))
      && date.isSameOrBefore(setHourTime(date, defaltBreakingTimeEnd))) {
      output = setHourTime(date, defaltBreakingTimeEnd);
    } else if (date.isAfter(setHourTime(date, toTime))) {
      output = setHourTime(date.add(1, 'days'), fromTime);
    }
  }
  // set end time
  if (type === 1) {
    if (date.isBefore(setHourTime(date, fromTime))) {
      output = setHourTime(date.subtract(1, 'days'), toTime);
    } else if (date.isAfter(setHourTime(date, defaltBreakingTimeStart))
      && date.isBefore(setHourTime(date, defaltBreakingTimeEnd))) {
      output = setHourTime(date, defaltBreakingTimeStart);
    } else if (date.isAfter(setHourTime(date, toTime))) {
      output = setHourTime(date, toTime);
    }
  }

  return output;
};

export const getOffTimeHour = (startDate, endDate, fromTime = '08:30:00', toTime = '17:30:00') => {
  if (startDate.valueOf() >= endDate.valueOf()) return 0;
  const defaultStartWorkingTime = moment(fromTime, 'HH:mm:ss');
  const defaultEndWorkingTime = moment(toTime, 'HH:mm:ss');
  const defaultBreakTime = startDate.clone().set({ hour: 12, minute: 0, second: 0 });
  const startTime = moment(startDate.format('HH:mm:ss'), 'HH:mm:ss');
  const endTime = moment(endDate.format('HH:mm:ss'), 'HH:mm:ss');
  if (startDate.diff(endDate, 'days') === 0) {
    const inOfficeTime = moment.duration(endTime
      .diff(startTime))
      .asHours();
    return (startDate.isSameOrBefore(defaultBreakTime)
      && endDate.isSameOrAfter(defaultBreakTime.add(1, 'hours')))
      ? inOfficeTime - 1
      : inOfficeTime;
  }
  let duringDates = [];
  if (endDate.diff(startDate, 'days') > 1) {
    const endRange = endDate.subtract(1, 'days');
    for (let index = startDate.add(1, 'days'); index.isSameOrBefore(endRange); index.add(1, 'days')) {
      duringDates = [...duringDates, index.format('DD/MM/YYYY HH:mm')];
    }

    duringDates = duringDates.filter((day) => ![6, 7].includes(moment(day, 'DD/MM/YYYY').isoWeekday()));
  }
  const startDateOffTime = moment.duration(defaultEndWorkingTime
    .diff(startTime))
    .asHours();
  const endDateOffTime = moment.duration(endTime
    .diff(defaultStartWorkingTime))
    .asHours();
  const offStartHour = moment(startDate).isSameOrBefore(startDate.set({ h: 12, m: 0, s: 0 }))
    ? startDateOffTime - 1
    : startDateOffTime;
  const offEndHour = moment(endDate,).isSameOrAfter(endDate.set({ h: 12, m: 0, s: 0 }))
    ? endDateOffTime - 1
    : endDateOffTime;
  return offStartHour + offEndHour + duringDates.length * 8;
};

const momentHourTime = (time) => {
  if (!time) return moment();
  return moment(time).isValid() ? moment(time) : moment(time, 'HH:mm:ss');
};

export function convertHourTime(time) {
  if (!time) return '00:00';
  let hour = Number(momentHourTime(time).format('HH'));
  let minute = Number(momentHourTime(time).format('mm'));
  minute = minute < 10 ? `0${minute}` : minute;
  hour = hour < 10 ? `0${hour}` : hour;
  return `${hour}:${minute}`;
}

export function checkErrorCount(stateData, propsData) {
  if (!stateData || !propsData) return 0;
  let tempErrorCount = 0;
  const actualCheckInDate = setHourTime(moment(stateData.date),
    stateData.actualCheckIn);
  const actualCheckOutDate = setHourTime(moment(stateData.date),
    stateData.actualCheckOut);
  const checkStartDateTime = setHourTime(moment(propsData.date),
    propsData && propsData.checkIn && moment(propsData.checkIn).format('HH:mm'));
  const checkEndDateTime = setHourTime(moment(propsData.date),
    propsData && propsData.checkOut && moment(propsData.checkOut).format('HH:mm'));
  if (actualCheckInDate.valueOf() !== checkStartDateTime.valueOf()) {
    tempErrorCount += 1;
  }

  if (actualCheckOutDate.valueOf() !== checkEndDateTime.valueOf()) {
    tempErrorCount += 1;
  }
  return tempErrorCount;
}

export function getRealTimeWorking(workTime) {
  if (!workTime) return 0;
  const hours = Number(moment(workTime, 'HH:mm:ss').format('HH'));
  const minutes = Number(moment(workTime, 'HH:mm:ss').format('mm'));

  const realTimeHour = hours + minutes / 60;
  return parseFloat((realTimeHour / 8).toFixed(2));
}

export function getRoundUpRequestTime(startTime, endTime, user, offHour) {
  if (!startTime || !endTime || !user) return null;
  if (startTime.valueOf() > endTime.valueOf()) return null;

  const { fromTime, toTime } = user;

  if (!fromTime || !toTime) return null;
  if (offHour === Math.ceil(offHour)) {
    return {
      startTime, endTime
    };
  }

  const minOffTimeHour = 1;

  if (offHour < minOffTimeHour) {
    return {
      startTime,
      endTime: startTime.clone().add(minOffTimeHour * 60, 'm')
    };
  }

  const missingHours = Math.ceil(offHour) - offHour;

  if (missingHours < 0.5) {
    return {
      startTime,
      endTime: endTime.clone().add(missingHours * 60, 'm'),
    };
  }

  if (missingHours > 0.5) {
    return {
      startTime,
      endTime: endTime.clone().subtract((1 - missingHours) * 60, 'm'),
    };
  }

  if (missingHours === 0.5) {
    return {
      startTime, endTime
    };
  }
}
