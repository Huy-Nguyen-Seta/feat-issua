/* eslint-disable object-curly-spacing */
/* eslint-disable no-unused-vars */
import React, { useRef } from 'react';
import TUICalendar from '@toast-ui/react-calendar';
import Button from '@material-ui/core/Button';
import 'tui-calendar/dist/tui-calendar.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import {HeaderWrapperComponent} from '../../components/HeaderWrapperComponent';

const start = new Date();
const end = new Date(new Date().setMinutes(start.getMinutes() + 30));
const schedules = [
  {
    calendarId: '1',
    category: 'time',
    isVisible: true,
    title: 'Study',
    id: '1',
    body: 'Test',
    start,
    end,
  },
  {
    calendarId: '2',
    category: 'time',
    isVisible: true,
    title: 'Meeting',
    id: '2',
    body: 'Description',
    start: new Date(new Date().setHours(start.getHours() + 1)),
    end: new Date(new Date().setHours(start.getHours() + 2)),
  },
];

const calendars = [
  {
    id: '1',
    name: 'My Calendar',
    color: '#ffffff',
    bgColor: '#9e5fff',
    dragBgColor: '#9e5fff',
    borderColor: '#9e5fff',
  },
  {
    id: '2',
    name: 'Company',
    color: '#ffffff',
    bgColor: '#00a9ff',
    dragBgColor: '#00a9ff',
    borderColor: '#00a9ff',
  },
];
const TaskView = false;
const ScheduleView = ['time'];

function MeetingRoom() {
  const calendarRef = useRef(null);
  const handleNextWeek = () => {
    const calendarInstance = calendarRef?.current?.getInstance();
    calendarInstance.next();
    // console.log('click next');
  };
  const handlePrevWeek = () => {
    const calendarInstance = calendarRef?.current?.getInstance();
    calendarInstance.prev();
  };
  const handleCurrentWeek = () => {
    const calendarInstance = calendarRef?.current?.getInstance();
    calendarInstance.today();
  };

  return (
    <AuthenticatedContainer>
      <HeaderWrapperComponent title="Meeting room" />
      <div>
        <Button variant="contained" onClick={handleCurrentWeek}>Today</Button>
        <Button variant="contained" onClick={handleNextWeek}>Previous</Button>
        <Button variant="contained" onClick={handlePrevWeek}>Next</Button>
      </div>
      <TUICalendar
        ref={calendarRef}
        height="1000px"
        view="week"
        calendars={calendars}
        schedules={schedules}
        taskView={TaskView}
        scheduleView={ScheduleView}
      />
    </AuthenticatedContainer>
  );
}

export default MeetingRoom;
