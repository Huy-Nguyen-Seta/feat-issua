import React from 'react';
import {
  arrayOf,
  string,
  func,
  bool
} from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import useStyles from './styles';
import images from '../../../asset/images';

function SelectionList({
  label,
  data = [],
  field,
  onClickItem,
  enableShowNumber = false,
  fieldCount
}) {
  const classes = useStyles();
  const handleToggle = (id) => () => {
    onClickItem && onClickItem(id);
  };
  function getLabel(item) {
    const subLabel = enableShowNumber ? `(${item[fieldCount].length})` : '';
    return `${item[field]} ${subLabel}`;
  }
  return (
    <div className={classes.container}>
      <div className={classes.label}>
        {label}
        {' '}
        (
        {data.length}
        )
      </div>
      <List className={classes.list}>
        {data.map((item) => (
          <ListItem
            className={classes.listItem}
            key={item.id}
            button
            onClick={handleToggle(item.id)}
          >
            <div className={classes.listItemText} id={item.id}>
              {getLabel(item)}
            </div>
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="comments">
                <img src={images.arrowRight} alt="arrow-right" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

SelectionList.propTypes = {
  data: arrayOf(Object).isRequired,
  label: string.isRequired,
  field: string.isRequired,
  onClickItem: func.isRequired,
  enableShowNumber: bool.isRequired,
  fieldCount: string.isRequired
};
export default SelectionList;
