/* eslint-disable no-console */
const moment = require('moment-timezone');

const lateEarlyLimitMs = 6 * 60 * 1000 - 1;

function formatTimeMsToHHmmss(timeMs) {
  if (!timeMs) return null;

  return moment.utc(timeMs).format('HH:mm:ss');
}

function getDiffMs(startTime, endTime, type) {
  if (!startTime || !endTime) return null;

  if (type === 'add') {
    return moment.duration(startTime)
      .add(moment.duration(endTime)).as('milliseconds');
  }
  return moment.duration(endTime)
    .subtract(moment.duration(startTime)).as('milliseconds');
}

function getOverTime({
  workTime,
  inOffice,
  startBreakTime,
  endBreakTime,
}) {
  if (!workTime || !inOffice || !startBreakTime || !endBreakTime) return null;

  const diffInMs = getDiffMs(workTime, inOffice);
  const breakTimeMs = getDiffMs(startBreakTime, endBreakTime);

  const overTime = Math.max(diffInMs - breakTimeMs, 0);
  const diffStr = formatTimeMsToHHmmss(overTime);

  return diffStr;
}

function getLate({
  startTime,
  endTime,
  startBreakTime,
  endBreakTime,
}) {
  if (!startTime || !endTime || !startBreakTime || !endBreakTime) return null;

  let diffInMs = getDiffMs(startTime, endTime);

  if (diffInMs <= lateEarlyLimitMs) {
    diffInMs = 0;
  } else {
    const diffStartBreakTimeAndEndTime = getDiffMs(startBreakTime, endTime);
    const diffEndBreakTimeAndEndTime = getDiffMs(endTime, endBreakTime);

    const isDurationOverlapBreakTime = diffStartBreakTimeAndEndTime > 0
    && diffEndBreakTimeAndEndTime > 0;
    if (isDurationOverlapBreakTime) {
      diffInMs = getDiffMs(startTime, startBreakTime);
    } else if (diffEndBreakTimeAndEndTime <= 0) {
      const breakTimeMs = getDiffMs(startBreakTime, endBreakTime);
      diffInMs -= breakTimeMs;
    }
  }

  diffInMs = Math.max(diffInMs, 0);

  const diffStr = formatTimeMsToHHmmss(diffInMs);

  return diffStr;
}

function getEarly({
  startTime,
  endTime,
  startBreakTime,
  endBreakTime,
}) {
  if (!startTime || !endTime || !startBreakTime || !endBreakTime) return null;

  let diffInMs = getDiffMs(startTime, endTime);

  if (diffInMs <= lateEarlyLimitMs) {
    diffInMs = 0;
  } else {
    const diffStartBreakTimeAndEndTime = getDiffMs(startBreakTime, startTime);
    const diffEndBreakTimeAndEndTime = getDiffMs(startTime, endBreakTime);

    const isDurationOverlapBreakTime = diffStartBreakTimeAndEndTime > 0
    && diffEndBreakTimeAndEndTime > 0;
    if (isDurationOverlapBreakTime) {
      diffInMs = getDiffMs(endBreakTime, endTime);
    } else if (diffStartBreakTimeAndEndTime <= 0) {
      const breakTimeMs = getDiffMs(startBreakTime, endBreakTime);
      diffInMs -= breakTimeMs;
    }
  }

  diffInMs = Math.max(diffInMs, 0);

  const diffStr = formatTimeMsToHHmmss(diffInMs);

  return diffStr;
}

function getWorkTime({
  fromTime, toTime,
  startBreakTime, endBreakTime,
  lack,
}) {
  const breakTimeMs = getDiffMs(startBreakTime, endBreakTime);
  const inOfficeMs = getDiffMs(fromTime, toTime);
  const lackMs = moment.duration(lack).as('milliseconds');

  const workTimeMs = inOfficeMs - breakTimeMs - lackMs;
  const workTimeStr = formatTimeMsToHHmmss(Math.max(workTimeMs, 0));

  return workTimeStr;
}

function getLack(late, early) {
  if (late && early) {
    const lackInMs = getDiffMs(late, early, 'add');
    const lackStr = formatTimeMsToHHmmss(lackInMs);
    return lackStr;
  }
  if (late) return late;
  if (early) return early;
  return null;
}

module.exports = {
  getOverTime, getWorkTime, getLack, getEarly, getLate
};
