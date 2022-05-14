/* eslint-disable react/prop-types */
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import useStyles from './styles';

export default function ButtonGroup({
  labelList,
  onChangeSelected,
  selectedId,
  ...remains
}) {
  const classes = useStyles({ ...remains });
  const [size, setSize] = React.useState('auto');
  React.useEffect(() => {
    if (labelList && labelList.length) {
      const newSize = Math.floor(12 / labelList.length);
      setSize(newSize);
    }
  }, [labelList]);
  const handleItemClick = (item) => () => {
    const { id } = item;
    if (selectedId === id) {
      return;
    }
    onChangeSelected && onChangeSelected(id);
  };
  return (
    <Grid className={classes.buttonGroupContainer} container justify="center">
      {labelList.map((itemGroup, index) => (
        <Grid className={classes.gridItem} key={itemGroup.id} item xs={size}>
          <Button
            onClick={handleItemClick(itemGroup)}
            className={`${classes.item} ${itemGroup.id === selectedId ? classes.activeButton : ''}`}
          >
            {itemGroup.label}
          </Button>
          {labelList[index + 1]
            && labelList[index + 1].id !== selectedId
            && itemGroup.id !== selectedId
            && index !== labelList.length - 1
            && (
              <div id={index} className={classes.divider} />
            )}
        </Grid>
      ))}
    </Grid>
  );
}

ButtonGroup.propTypes = {
};
