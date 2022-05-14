import React from 'react';
import { shape } from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import useStyles from './styles';

export default function CustomAvatar({ item }) {
  const classes = useStyles();
  let avatar;

  if (!item.imageUrl) {
    const newStr = item.name.replace(/[^A-Z0-9]+/ig, '_');
    const strArr = newStr.split('_');
    const newName = strArr.map((x) => x[0].toUpperCase()).join('');
    avatar = (
      <Avatar
        variant="square"
        classes={{
          root: classes.rootAvatar,
          square: classes.square,
        }}
      >
        {newName}
      </Avatar>
    );
  } else {
    avatar = (
      <Avatar
        variant="square"
        alt="image Org"
        src={item.imageUrl}
        classes={{
          root: classes.rootAvatar,
          square: classes.square
        }}
      />
    );
  }

  return (
    <>
      { avatar }
    </>
  );
}

CustomAvatar.propTypes = {
  item: shape.isRequired,
};
