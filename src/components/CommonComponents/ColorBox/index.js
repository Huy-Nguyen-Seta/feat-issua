import React from 'react';
import { arrayOf, shape } from 'prop-types';
import useStyles from './styles';

function ColorBox({ data }) {
  const classes = useStyles();

  const getRandomColor = () => {
    const availableColors = ['#4BA9D1', '#96D14B', '#56D14B', '#4BD1A1', '#CE4BD1'];
    const index = Math.floor(Math.random() * 5);
    return availableColors[index];
  };

  const renderData = data.map((item) => (
    <div
      key={item.id}
      className={classes.listItem}
      style={{ background: getRandomColor() }}
    >
      { item.name }
    </div>
  ));

  return (
    <div className={classes.container}>
      { renderData }
    </div>
  );
}

ColorBox.propTypes = {
  data: arrayOf(shape).isRequired
};
export default ColorBox;
