/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import Badge from '@material-ui/core/Badge';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Tooltip from '@material-ui/core/Tooltip';
import { useHistory, } from 'react-router-dom';

import { string, } from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { getManagerRequestCount } from '../../../state/modules/user/actions';
import { userSelector } from '../../../state/modules/user';
import { routePath } from '../../../helper/constants';

import { styles } from './styles';

const useStyles = makeStyles({
  ...styles
});

export default function Notifier({
  tooltipTitle,
  // numNotifications,
}) {
  const { unapprovedRequest, permissions } = useSelector(userSelector);
  const history = useHistory();

  const dispatch = useDispatch();
  const classes = useStyles();
  const findPermission = permissions.find((permission) => permission === 'admin' || permission === 'manager');

  useEffect(() => {
    dispatch(getManagerRequestCount());
  }, []);

  const handleClickNotification = () => {
    if (findPermission) {
      history.push(routePath.REQUEST_MANAGEMENT_PATH);
    }
  };

  return (
    <div className={classes.notification}>
      <Tooltip title={tooltipTitle || ''}>
        <span className={classes.toolTipWrapper}>
          <IconButton
            data-vncss-element="notification-button"
            edge="end"
            onClick={handleClickNotification}
          >
            {
              findPermission && (
                <>
                  {' '}
                  {unapprovedRequest > 0 ? (
                    <Badge
                      color="primary"
                      badgeContent={unapprovedRequest}
                      classes={{ badge: classes.badge }}
                    >
                      <NotificationsIcon
                        color="primary"
                        className={classes.iconNoti}
                      />
                    </Badge>
                  )
                    : (
                      <NotificationsIcon
                        color="primary"
                        className={classes.iconNoti}
                      />
                    )}
                </>
              )
            }

          </IconButton>
        </span>
      </Tooltip>

    </div>
  );
}

Notifier.propTypes = {
  tooltipTitle: string,
};

Notifier.defaultProps = {
  tooltipTitle: 'Pending request',
};
