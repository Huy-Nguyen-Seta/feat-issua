const camelcaseKeys = require('camelcase-keys');
const { defaultLimit, defaultPage } = require('./constants');

function countOffdays(startDateTimeStr, endDateTimeStr) {
  if (!startDateTimeStr || !endDateTimeStr) return 0;

  const startDateTime = new Date(startDateTimeStr);
  const endDateTime = new Date(endDateTimeStr);

  startDateTime.setHours(0, 0, 0, 0);
  endDateTime.setHours(23, 59, 59, 999);

  const offDays = Math.round((endDateTime - startDateTime) / 3600 / 1000 / 24);

  return Math.max(offDays, 0);
}

// ------- Begin calculate offTimeHour functions ----------------------------
function getBusinessDateCount(startDateTimeStr, endDateTimeStr) {
  if (!startDateTimeStr || !endDateTimeStr) return 0;

  const startDateTime = new Date(startDateTimeStr);
  const endDateTime = new Date(endDateTimeStr);

  startDateTime.setHours(0, 0, 0, 0);
  endDateTime.setHours(0, 0, 0, 0);

  const ifThen = (a, b, c) => (a === b ? c : a);

  let elapsed = (endDateTime - startDateTime) / 86400000;

  const daysBeforeFirstSunday = (7 - startDateTime.getDay()) % 7;
  const daysAfterLastSunday = endDateTime.getDay();

  elapsed -= (daysBeforeFirstSunday + daysAfterLastSunday);
  elapsed = (elapsed / 7) * 5;
  elapsed += ifThen(daysBeforeFirstSunday - 1, -1, 0) + ifThen(daysAfterLastSunday, 6, 5);

  return Math.ceil(elapsed);
}

function timeToHour(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  return dateTime.getUTCHours() + dateTime.getUTCMinutes() / 60;
}

function getStartEndHour({
  startDateTimeStr, endDateTimeStr,
  workTimeList = []
}) {
  if (!startDateTimeStr || !endDateTimeStr || !workTimeList.length) {
    return { startHour: 0, endHour: 0 };
  }
  let startHour = timeToHour(startDateTimeStr);
  let endHour = timeToHour(endDateTimeStr);

  const {
    from_time: fromTime1,
    to_time: toTime1,
    start_break_time: startBreakTime1,
    end_break_time: endBreakTime1
  } = workTimeList[0];
  const {
    from_time: fromTime2,
    to_time: toTime2,
    start_break_time: startBreakTime2,
    end_break_time: endBreakTime2
  } = workTimeList[workTimeList.length - 1];

  // Set fromTime <= startHour, endHour <= toTime
  startHour = Math.min(toTime1, Math.max(startHour, fromTime1));
  endHour = Math.max(fromTime2, Math.min(endHour, toTime2));

  /*
  * Set default startHour and endHour
  * when client inputs time between startBreakTime and endBreakTime
  */
  if (startHour >= startBreakTime1 && startHour <= endBreakTime1) {
    startHour = endBreakTime1;
  }
  if (endHour >= startBreakTime2 && endHour <= endBreakTime2) {
    endHour = startBreakTime2;
  }

  return { startHour, endHour };
}

function getExtraBreakHour({
  offDays, workTimeList = [], startHour, endHour
}) {
  if (!offDays || !startHour || !endHour || !workTimeList.length) return 0;

  const {
    start_break_time: startBreakTime1,
    end_break_time: endBreakTime1
  } = workTimeList[0];
  const {
    start_break_time: startBreakTime2,
    end_break_time: endBreakTime2
  } = workTimeList[workTimeList.length - 1];

  let extraHours = 0;

  switch (offDays) {
    case 1:
      if (startHour <= startBreakTime1 && endHour >= endBreakTime2) {
        extraHours = endBreakTime1 - startBreakTime1;
      }
      break;
    default:
      if (startHour <= startBreakTime1) {
        extraHours += (endBreakTime2 - startBreakTime2);
      }
      if (endHour >= endBreakTime2) {
        extraHours += (endBreakTime1 - startBreakTime1);
      }
  }

  return Math.max(extraHours, 0);
}

function getBreakHour({ startBreakTime, endBreakTime }) {
  if (!startBreakTime || !endBreakTime) return 0;
  return Math.max(endBreakTime - startBreakTime, 0);
}

function getWorkingHour({ fromTime, toTime, breakHour }) {
  if (!fromTime || !toTime || !breakHour) return 0;
  return Math.max((toTime - fromTime) - breakHour, 0);
}

function getOffTimeHourWhenHasMoreThanOneWorkTime({
  startDateTimeStr,
  endDateTimeStr,
  workTimeList = [],
  extraBreakHour,
  startHour,
  endHour
}) {
  if (workTimeList.length <= 1) return 0;
  let offTimeHour = -extraBreakHour;

  workTimeList.forEach((workTime, index) => {
    const {
      from_date: fromDate, to_date: toDate,
      from_time: fromTime, to_time: toTime,
      start_break_time: startBreakTime,
      end_break_time: endBreakTime
    } = workTime;

    const breakHour = getBreakHour({ startBreakTime, endBreakTime });
    const workingHour = getWorkingHour({ toTime, fromTime, breakHour });

    switch (index) {
      case 0: {
        const offDays = getBusinessDateCount(startDateTimeStr, toDate);
        offTimeHour += (offDays - 1) * workingHour + (toTime - startHour);
        break;
      }
      case workTimeList.length - 1: {
        const offDays = getBusinessDateCount(fromDate, endDateTimeStr);
        offTimeHour += (offDays - 1) * workingHour + (endHour - fromTime);
        break;
      }
      default: {
        const offDays = getBusinessDateCount(fromDate, toDate);
        offTimeHour += offDays * workingHour;
      }
    }
  });

  return offTimeHour;
}

function calculateOffTimeHour({
  offDays, endHour, startHour,
  extraBreakHour, workTimeList,
  startDateTimeStr, endDateTimeStr
}) {
  let offTimeHour = 0;

  switch (offDays) {
    case 1: {
      offTimeHour = (endHour - startHour) - extraBreakHour;
      break;
    }
    case 2: {
      const { to_time: toTime1 } = workTimeList[0];
      const { from_time: fromTime2 } = workTimeList[workTimeList.length - 1];
      offTimeHour = (toTime1 - startHour)
        + (endHour - fromTime2)
        - extraBreakHour;
      break;
    }
    default: {
      if (workTimeList.length > 1) {
        offTimeHour = getOffTimeHourWhenHasMoreThanOneWorkTime({
          startDateTimeStr,
          endDateTimeStr,
          workTimeList,
          extraBreakHour,
          startHour,
          endHour
        });
      } else if (workTimeList.length === 1) {
        const {
          to_time: toTime, from_time: fromTime,
          start_break_time: startBreakTime, end_break_time: endBreakTime
        } = workTimeList[0];
        const breakHour = getBreakHour({ startBreakTime, endBreakTime });
        const workingHour = getWorkingHour({ toTime, fromTime, breakHour });

        offTimeHour = (offDays - 2) * workingHour
          + (toTime - startHour)
          + (endHour - fromTime)
          - extraBreakHour;
      }
    }
  }

  return Math.max(offTimeHour, 0);
}

function getOffTimeHour({
  startDateTime: startDateTimeStr,
  endDateTime: endDateTimeStr,
  workTimeList = []
}) {
  if (!startDateTimeStr || !endDateTimeStr || !workTimeList.length) return 0;

  const offDays = getBusinessDateCount(startDateTimeStr, endDateTimeStr);
  if (!offDays) return 0;

  const { startHour, endHour } = getStartEndHour({
    startDateTimeStr,
    endDateTimeStr,
    workTimeList
  });
  if (!startHour || !endHour) return 0;

  const extraBreakHour = getExtraBreakHour({
    offDays, workTimeList, startHour, endHour
  });

  const offTimeHour = calculateOffTimeHour({
    offDays,
    endHour,
    startHour,
    extraBreakHour,
    workTimeList,
    startDateTimeStr,
    endDateTimeStr
  });

  return offTimeHour;
}
// -------------- End calculate offTimeHour functions ------------------

function getOffset(page = defaultPage, limit = defaultLimit) {
  return (page - 1) * limit;
}

function camelCaseData(data) {
  if (!data || typeof data !== 'object') return;
  return camelcaseKeys(data, { deep: true });
}

function findLessTime(startTime, endTime) {
  if (!startTime && !endTime) return null;

  const defaultDate = '2020/01/01';
  const startDateTime = new Date(`${defaultDate} ${startTime}Z`);
  const endDateTime = new Date(`${defaultDate} ${endTime}Z`);

  const diffInMs = endDateTime - startDateTime;

  return diffInMs >= 0 ? startTime : endTime;
}

module.exports = {
  getOffTimeHour,
  getOffset,
  countOffdays,
  camelCaseData,
  findLessTime
};
