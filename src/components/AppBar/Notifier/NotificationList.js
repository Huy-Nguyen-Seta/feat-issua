import React from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import {
  string, arrayOf, oneOf, shape, func, node
} from 'prop-types';
import { notificationsSelector } from '../../../state/modules/notifications/selector';

import { styles } from './styles';

const useStyles = makeStyles({
  ...styles
});

const TYPE_READ = 'read';
const TYPE_UNREAD = 'unread';
const INTRO_NONE = 'none';
const INTRO_FADE_IN = 'fade_in';
const OUTRO_NONE = 'none';
const OUTRO_FADE_OUT = 'fade_out';
const OUTRO_SLIDE_OUT = 'slide_out';
export const notificationListPropTypes = arrayOf(
  shape({
    id: string.isRequired,
    type: oneOf([
      TYPE_READ,
      TYPE_UNREAD,

    ]).isRequired,
    customNode: node,
    notificationTitle: string,
    notificationBody: string,
    statusDescription: string,
    onActionClick: func,
    onRemoveClick: func,
    introAnimation: oneOf([INTRO_NONE, INTRO_FADE_IN]),
    outroAnimation: oneOf([OUTRO_NONE, OUTRO_FADE_OUT, OUTRO_SLIDE_OUT])
  })
);

export default function NotificationList() {
  const classes = useStyles();

  const { notifications } = useSelector(notificationsSelector);

  const handleDrawItemNotifications = (entry) => (
    <div
      className={classes.entry}
      key={entry.id}
    >
      <div className={classes.visualStatus}>
        {entry.statusIcon}
      </div>
      <div className={classes.description}>
        <div className={classes.title}>
          {entry.notificationBody}
        </div>
        <div className={classes.subtitle}>
          {entry.statusDescription}
        </div>
      </div>
    </div>
  );

  return (
    <div className={classes.notificationList}>
      {notifications.map((entry) => handleDrawItemNotifications(entry))}
    </div>
  );
}
