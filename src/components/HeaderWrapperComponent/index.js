import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { string, element } from 'prop-types';
import { styles } from './styles';

const useStyles = makeStyles({ ...styles });

export function HeaderWrapperComponent({ title, action }) {
  const classes = useStyles();
  return (
    <>
      <div className={`${classes.helperWrapper} ${classes.linearBackground}`}>
        <div className={classes.featureTitle}>{title}</div>
        <div className={classes.createButton}>
          {action}
        </div>
      </div>
    </>
  );
}

HeaderWrapperComponent.propTypes = {
  title: string,
  action: element,
};
HeaderWrapperComponent.defaultProps = {
  title: '',
  action: <div />
};
