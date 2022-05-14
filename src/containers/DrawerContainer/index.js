import React from 'react';
import useReactRouter from 'use-react-router';

function DrawerContainer() {
  const { history, location, match } = useReactRouter();
  console.log(history, location, match);
  return (
    <div>
      1233
    </div>
  );
}

DrawerContainer.propTypes = {
};

export default DrawerContainer;
