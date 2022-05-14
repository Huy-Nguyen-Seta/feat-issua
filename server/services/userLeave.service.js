const { userLeaveQuery } = require('../query');
const { defaultLimit, defaultPage } = require('../helper/constants');
const { camelCaseData, getOffset } = require('../helper/calculation');
const { reasonLeaveRequestId, leaveCarryOverType } = require('../helper/constants');
const config = require('../../config.json');
const {
  totalTimeUserLeaveByYear,
  insertAllUserLeaveQuery,
  getAllUserLeaveQuery,
  countAllUserLeaveQuery,
  updateUserLeaveQuery,
  getUserLeaveByUserIdAndYear
} = userLeaveQuery;

/**
 * Calculate carry over hour that a user has, that is followed by new policy
 * @param {number} num
 * @param {boolean} overThreeMonth
 * @returns {number} hours
 */
const carryOverPolicyHour = (num, overThreeMonth = false) => (overThreeMonth ? 0 : Math.min(num, +config.policies.maxLeaveCarryOver * 8));

const calTotalTimeUserLeaveByYear = async (req, overThreeMonth = false) => {
  // array of userId
  const { data } = req.body;
  const year = new Date().getFullYear();

  const userLeaveLastYear = await req.postgres.query(totalTimeUserLeaveByYear({
    year: year - 1,
    reasonId: reasonLeaveRequestId,
  }));

  const userLeaveYearCurrent = await req.postgres.query(totalTimeUserLeaveByYear({
    year,
    reasonId: reasonLeaveRequestId,
  }));

  const userLeaveCarryOverNow = await req.postgres.query(totalTimeUserLeaveByYear({
    year,
    reasonId: leaveCarryOverType,
  }));

  userLeaveLastYear.rows.map((el) => {
    userLeaveYearCurrent.rows.map((e) => {
      if (e.id === el.id) {
        // eslint-disable-next-line no-param-reassign
        el.time_leave_now = e.time_leave ? e.time_leave : 0;
      }
    });
  });

  userLeaveLastYear.rows.map((el) => {
    userLeaveCarryOverNow.rows.map((e) => {
      if (e.id === el.id) {
        // eslint-disable-next-line no-param-reassign
        el.carry_over = e.time_leave ? e.time_leave : 0;
      }
    });
  });

  let dataReturn = userLeaveLastYear.rows.map((e) => {
    if (data && !data.includes(e.id)) return null;

    const hireDate = new Date(e.hired_date);
    const totalHourRequestOfYear = e.max_leave_day * 8;
    const carryOverH = totalHourRequestOfYear - (e.time_leave ? e.time_leave : 0);
    const totalRemain = totalHourRequestOfYear - e.time_leave_now;

    if (year - hireDate.getFullYear() === 1) {
      const month = hireDate.getUTCMonth() + 1; // months from 1-12
      const day = hireDate.getUTCDate();
      let totalLeave = 12 - month;
      if (day <= 10) {
        totalLeave += 1;
      } else if (day <= 20) {
        totalLeave += 0.5;
      }
      totalLeave *= 8;
      const totalCarryOverUl = totalLeave - (e.time_leave ? e.time_leave : 0);
      return {
        totalLeave: totalHourRequestOfYear,
        totalRemain,
        carryOver: totalCarryOverUl > 0 ? carryOverPolicyHour(totalCarryOverUl, overThreeMonth) : 0,
        carryOverRemain: totalCarryOverUl > 0
          ? (totalCarryOverUl - e.carry_over > 0
            ? carryOverPolicyHour(totalCarryOverUl, overThreeMonth) - e.carry_over : 0) : 0,
        year,
        userId: e.id,
        fullName: e.name
      };
    }
    if (year - hireDate.getFullYear() === 0) {
      return null;
    }

    return {
      totalLeave: totalHourRequestOfYear,
      totalRemain,
      carryOver: carryOverH > 0 ? carryOverPolicyHour(carryOverH, overThreeMonth) : 0,
      carryOverRemain: carryOverH > 0
        ? (carryOverH - e.carry_over > 0
          ? carryOverPolicyHour(carryOverH, overThreeMonth) - e.carry_over : 0) : 0,
      year,
      userId: e.id,
      fullName: e.name
    };
  });

  dataReturn = dataReturn.filter((x) => x !== null);

  await req.postgres.query(insertAllUserLeaveQuery(dataReturn));
  return camelCaseData(dataReturn);
};

const getAllUserLeave = async (req) => {
  const {
    name, badgeNumber, year, title,
    limit = defaultLimit, page = defaultPage
  } = req.query;

  const offset = getOffset(page, limit);

  const countUserLeave = await req.postgres.query(countAllUserLeaveQuery({
    name, badgeNumber, year, title
  }));

  const data = await req.postgres.query(getAllUserLeaveQuery({
    name, badgeNumber, year, offset, limit, title
  }));

  const { count } = countUserLeave.rows[0];

  return {
    code: 200,
    data: {
      pagination: { count, page: Number(page) },
      data: camelCaseData(data.rows)
    }
  };
};
const updateUserLeave = async (req) => {
  const data = await req.postgres.query(
    updateUserLeaveQuery(req.body)
  );
  return {
    code: 200,
    data: data.rowCount
  };
};

const updateUserLeaveWhenConfirmRequest = async (req, result) => {
  if ([reasonLeaveRequestId, leaveCarryOverType].includes(result.reasonId)) {
    const { offTimeHour, userId, reasonId } = result;
    const year = new Date(result.startDateTime).getFullYear();
    const userLeaveByUserId = await req.postgres.query(
      getUserLeaveByUserIdAndYear({ userId, year })
    );
    if (!userLeaveByUserId.rowCount) {
      return {
        code: 500,
        error: 'User leave not found'
      };
    }
    let set = '';
    const { totalRemain, carryOverRemain } = camelCaseData(userLeaveByUserId.rows[0]);
    if (reasonId === reasonLeaveRequestId && totalRemain >= offTimeHour) {
      set = ` total_remain = ${totalRemain - offTimeHour}`;
    } else if (reasonId === leaveCarryOverType
      && carryOverRemain >= offTimeHour) {
      set = ` carry_over_remain = ${carryOverRemain - offTimeHour}`;
    } else {
      return {
        code: 200,
        error: 'User don\'t have leave days'
      };
    }
    const sqlUpdate = `
    update "user_leave" 
    set ${set} 
    where user_id = '${userId}' and year = ${year} 
    returning *; 
    `;
    await req.postgres.query(sqlUpdate);
    return {
      code: 200,
      data: 'Done'
    };
  }
};
module.exports = {
  calTotalTimeUserLeaveByYear,
  getAllUserLeave,
  updateUserLeave,
  updateUserLeaveWhenConfirmRequest
};
