import PersonIcon from '@material-ui/icons/Person';
import React from 'react';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import WorkOffIcon from '@material-ui/icons/WorkOff';
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import GroupIcon from '@material-ui/icons/Group';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import WbSunnyIcon from '@material-ui/icons/WbSunny';
import CalendarTodayOutlinedIcon from '@material-ui/icons/CalendarTodayOutlined';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import EventNoteRoundedIcon from '@material-ui/icons/EventNoteRounded';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SettingsIcon from '@material-ui/icons/Settings';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import EventIcon from '@material-ui/icons/Event';

export const routePath = {
  // ess path
  SIGN_IN_PATH: '/signin',
  SIGN_IN_EMAIL_PATH: '/signin/email',
  HOME_PATH: '/',
  INFO_PATH: '/info',
  SIGN_UP_PATH: '/signup',
  REGISTER_BIOMETRIC: '/register_bimetric',
  // user path
  TIMESHEET_PATH: '/timesheet',
  REQUEST_PATH: '/request',
  DAY_LEAVES_PATH: '/leaves',
  MEETING_ROOM: '/meeting-room',
  // manager path
  REQUEST_MANAGEMENT_PATH: '/request-management',
  MEMBER_MANAGEMENT_PATH: '/member-management',
  ALL_MEMBER_TIMESHEET_PATH: '/member-timesheet',

  // admin path
  USER_LIST_PATH: '/all-user',
  USER_LEAVE_LIST_PATH: '/user-leave',
  ALL_USER_TIMESHEET_PATH: '/user-timesheet',
  ALL_USER_REQUEST_PATH: '/user-request',

  // setting path
  REQUEST_REASON_SETTING: '/request-reason-setting',
  HOLIDAY_SETTING: '/holiday-setting',
};

export const rolesList = {
  MEMBER_ROLE: 'member',
  MANAGER_ROLE: 'manager',
  ADMIN_ROLE: 'admin',
};

export const roleOrder = [
  rolesList.MEMBER_ROLE,
  rolesList.MANAGER_ROLE,
  rolesList.ADMIN_ROLE,
];
export const drawerFeature = [
  {
    id: 'timesheet',
    label: 'Timesheet',
    isClickable: false,
    isCollapable: false,
    permisstion: rolesList.MEMBER_ROLE,
    icon: <PersonOutlineIcon />,
    childs: [
      {
        id: 'my-timesheet',
        label: 'My Timesheet',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.TIMESHEET_PATH,
        icon: <CalendarTodayOutlinedIcon />,
        highlightRoute: [routePath.TIMESHEET_PATH],
      },
      {
        id: 'my-request',
        label: 'Justification',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.REQUEST_PATH,
        icon: <CompareArrowsIcon />,
        highlightRoute: [routePath.REQUEST_PATH],
      },
      {
        id: 'my-leave',
        label: 'My Leave',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.DAY_LEAVES_PATH,
        icon: <WorkOffIcon />,
        highlightRoute: [routePath.DAY_LEAVES_PATH],
      },
    ],
  },
  {
    id: 'manager',
    label: 'Manager',
    isClickable: false,
    isCollapable: false,
    permisstion: rolesList.MANAGER_ROLE,
    icon: <PersonIcon />,
    childs: [
      {
        id: 'member-timesheet',
        label: 'Member Timesheet',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.ALL_MEMBER_TIMESHEET_PATH,
        icon: <CalendarTodayIcon />,
        highlightRoute: [routePath.ALL_MEMBER_TIMESHEET_PATH],
      },
      {
        id: 'request-manager',
        label: 'Approve Request',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.REQUEST_MANAGEMENT_PATH,
        icon: <DoneAllIcon />,
        highlightRoute: [routePath.REQUEST_MANAGEMENT_PATH],
      },
      {
        id: 'my-request',
        label: 'Member List',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.MEMBER_MANAGEMENT_PATH,
        icon: <GroupIcon />,
        highlightRoute: [routePath.MEMBER_MANAGEMENT_PATH],
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    isClickable: false,
    isCollapable: false,
    permisstion: rolesList.ADMIN_ROLE,
    icon: <PersonPinIcon />,
    childs: [
      {
        id: 'admin-manager-timesheet',
        label: 'User Timesheet',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.ALL_USER_TIMESHEET_PATH,
        icon: <EventNoteRoundedIcon />,
        highlightRoute: [routePath.ALL_USER_TIMESHEET_PATH],
      },
      {
        id: 'admin-manager-request',
        label: 'Review Request',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.ALL_USER_REQUEST_PATH,
        icon: <CheckCircleIcon />,
        highlightRoute: [routePath.ALL_USER_REQUEST_PATH],
      },
      {
        id: 'admin-manager-user',
        label: 'User Management',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.USER_LIST_PATH,
        icon: <SupervisedUserCircleIcon />,
        highlightRoute: [routePath.USER_LIST_PATH],
      },
      {
        id: 'admin-manager-leave',
        label: 'User Leave Management',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.USER_LEAVE_LIST_PATH,
        icon: <SupervisedUserCircleIcon />,
        highlightRoute: [routePath.USER_LEAVE_LIST_PATH],
      },
    ],
  },
  {
    id: 'setting',
    label: 'Admin Setting',
    isClickable: false,
    isCollapable: false,
    permisstion: rolesList.ADMIN_ROLE,
    icon: <SettingsIcon />,
    childs: [
      {
        id: 'admin-holiday-setting',
        label: 'Holiday Setting',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.HOLIDAY_SETTING,
        icon: <WbSunnyIcon />,
        highlightRoute: [routePath.HOLIDAY_SETTING],
      },
      {
        id: 'admin-leave-type-setting',
        label: 'Request Reason Setting',
        isClickable: true,
        isCollapable: true,
        routePath: routePath.REQUEST_REASON_SETTING,
        icon: <AssignmentIcon />,
        highlightRoute: [routePath.REQUEST_REASON_SETTING],
      },
    ],
  },
  {
    id: 'schedule-meeting',
    label: 'Schedule Meeting',
    isClickable: false,
    isCollapable: false,
    permisstion: rolesList.MEMBER_ROLE,
    icon: <MeetingRoomIcon />,
    childs: [
      {
        id: 'meeting-room',
        label: 'Meeting Room',
        isClickable: true,
        isCollapable: true,
        icon: <EventIcon />,
        routePath: routePath.MEETING_ROOM,
        highlightRoute: [routePath.MEETING_ROOM],
      },
    ],
  },
];
