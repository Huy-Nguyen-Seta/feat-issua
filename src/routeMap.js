import React from 'react';
import HomeIcon from '@material-ui/icons/Home';
import PregnantWomanIcon from '@material-ui/icons/PregnantWoman';
import TableChartIcon from '@material-ui/icons/TableChart';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import GroupIcon from '@material-ui/icons/Group';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import RegisterBiometric from './pages/RegisterBiometric';
import Timesheet from './pages/Timesheet';
import DayLeaves from './pages/DayLeaves';
import MyRequest from './pages/MyRequest';
import ConfirmRequest from './pages/ConfirmRequest';
import TimesheetAllMember from './pages/TimesheetAllMember';
import TimesheetAllUser from './pages/TimesheetAllUser';
import RequestReasonSetting from './pages/RequestReasonSetting';
import UserManagement from './pages/UserManagement';
import MemberManagement from './pages/MemberManagement';
import HolidaySetting from './pages/HolidaySetting';
import ReviewRequest from './pages/ReviewRequest';

import Info from './pages/Info';
import { routePath, rolesList } from './helper/constants';
import UserLeaveManager from './pages/UserLeaveManager';
import MeetingRoom from './pages/MeetingRoom';

const routes = [
  {
    id: 'home-page',
    path: routePath.HOME_PATH,
    component: Home,
    authenRequired: true,
    title: 'Home',
    icon: <HomeIcon />,
    role: rolesList.MEMBER_ROLE,
  },
  {
    id: 'time-sheet',
    path: routePath.TIMESHEET_PATH,
    component: Timesheet,
    authenRequired: true,
    title: 'Timesheet',
    icon: <TableChartIcon />,
    role: rolesList.MEMBER_ROLE,
  },
  {
    id: 'day-leaves',
    path: routePath.DAY_LEAVES_PATH,
    component: DayLeaves,
    authenRequired: true,
    title: 'My Leave',
    icon: <PregnantWomanIcon />,
    role: rolesList.MEMBER_ROLE,
  },
  {
    id: 'member-management',
    path: routePath.MEMBER_MANAGEMENT_PATH,
    component: MemberManagement,
    authenRequired: true,
    title: 'Member Management',
    icon: <GroupIcon />,
    role: rolesList.MANAGER_ROLE,
  },
  {
    id: 'info-page',
    path: routePath.INFO_PATH,
    component: Info,
    authenRequired: true,
    title: 'Info',
    icon: <AccountBoxIcon />,
    role: rolesList.MEMBER_ROLE,
  },

  {
    id: 'login-page',
    path: routePath.SIGN_IN_PATH,
    component: Signin,
    authenRequired: false,
    role: rolesList.MEMBER_ROLE,
    title: 'Signin',
  },
  {
    id: 'signup-page',
    path: routePath.SIGN_UP_PATH,
    component: Signup,
    authenRequired: false,
    role: rolesList.MEMBER_ROLE,
    title: 'Signup',
  },
  {
    id: 'request-page',
    path: routePath.REQUEST_PATH,
    component: MyRequest,
    authenRequired: false,
    role: rolesList.MEMBER_ROLE,
    title: 'Justification',
  },
  {
    id: 'all-member-timesheet-page',
    path: routePath.ALL_MEMBER_TIMESHEET_PATH,
    component: TimesheetAllMember,
    authenRequired: false,
    role: rolesList.MANAGER_ROLE,
    title: 'Member Timesheet',
  },
  {
    id: 'all-user-timesheet-page',
    path: routePath.ALL_USER_TIMESHEET_PATH,
    component: TimesheetAllUser,
    authenRequired: false,
    role: rolesList.ADMIN_ROLE,
    title: 'User Timesheet',
  },
  {
    id: 'request-manager-page',
    path: routePath.REQUEST_MANAGEMENT_PATH,
    component: ConfirmRequest,
    authenRequired: false,
    role: rolesList.MANAGER_ROLE,
    title: 'Confirm Request',
  },
  {
    id: 'user-list-page',
    path: routePath.USER_LIST_PATH,
    component: UserManagement,
    authenRequired: false,
    role: rolesList.ADMIN_ROLE,
    title: 'User Management',
  },
  {
    id: 'user-leave-page',
    path: routePath.USER_LEAVE_LIST_PATH,
    component: UserLeaveManager,
    authenRequired: false,
    role: rolesList.ADMIN_ROLE,
    title: 'User Management',
  },
  {
    id: 'register-biometric',
    path: routePath.REGISTER_BIOMETRIC,
    component: RegisterBiometric,
    authenRequired: false,
    role: rolesList.MEMBER_ROLE,
    title: 'Register Biometric',
  },
  {
    id: 'setting-holiday',
    path: routePath.HOLIDAY_SETTING,
    component: HolidaySetting,
    authenRequired: false,
    role: rolesList.ADMIN_ROLE,
    title: 'Holiday Setting',
  },
  {
    id: 'setting-leave-type',
    path: routePath.REQUEST_REASON_SETTING,
    component: RequestReasonSetting,
    authenRequired: false,
    role: rolesList.ADMIN_ROLE,
    title: 'Request Reason Setting',
  },
  {
    id: 'setting-leave-typr',
    path: routePath.ALL_USER_REQUEST_PATH,
    component: ReviewRequest,
    authenRequired: false,
    role: rolesList.ADMIN_ROLE,
    title: 'Review Request',
  },
  {
    id: 'meeting-room',
    path: routePath.MEETING_ROOM,
    component: MeetingRoom,
    authenRequired: true,
    role: rolesList.MEMBER_ROLE,
    title: 'Meeting Room',
  },
];

export default routes;
