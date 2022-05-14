const defaultLimit = 20;
const defaultPage = 1;
const defaultMaxForgetRequestPerMonth = 3;
const defaultMaxCompRequestPerMonth = 6;
const defaultMaxCompDayPerMonth = 3;
const forgetRequestTypeId = '9c796106-d223-4ced-bb0c-7b0467bbc1f8';
const lateEarlyRequestTypeId = '187f0f75-3394-4962-92af-6efc131f8e74';
const leaveRequestTypeId = '6c2cc1c7-9555-49b6-89a7-debd4c10d46f';
const leaveCarryOverType = '75e5b87b-a7d0-4dcb-8ad6-09910d2d8b83';
// Annual leave
const reasonLeaveRequestId = '8a0e91a5-d449-408e-a31f-d964ed605f00';
const defaultMobieScreens = {
  leave: '/approve/leave',
  forget: '/approve/forget',
  compensation: '/approve/compensation'
};

module.exports = {
  defaultLimit,
  defaultPage,
  defaultMaxForgetRequestPerMonth,
  defaultMaxCompRequestPerMonth,
  defaultMaxCompDayPerMonth,
  forgetRequestTypeId,
  lateEarlyRequestTypeId,
  leaveRequestTypeId,
  defaultMobieScreens,
  reasonLeaveRequestId,
  leaveCarryOverType,
};
