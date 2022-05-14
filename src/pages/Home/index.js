import React from 'react';
import { Redirect } from 'react-router-dom';
import { routePath } from '../../helper/constants';

function Home() {
  return (
    <>
      <Redirect
        to={{
          pathname: routePath.TIMESHEET_PATH,
        }}
      />
    </>
  );
}

export default Home;
