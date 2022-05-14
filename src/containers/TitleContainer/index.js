/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React, { useEffect } from 'react';
import { any, string } from 'prop-types';
import routes from '../../routeMap';

export default function TitleContainer({ path, children }) {
  useEffect(() => {
    let pageTitle = routes.find((route) => route.path === path);
    pageTitle = pageTitle && pageTitle.title;
    document.title = `Timesheet ${pageTitle ? `- ${pageTitle}` : '- Timesheet'}`;
  }, []);
  return <>{children}</>;
}

TitleContainer.propTypes = {
  children: any,
  path: string
};
