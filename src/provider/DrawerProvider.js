import React from 'react';
import { node } from 'prop-types';

const drawerContext = React.createContext({});

const ViewportProvider = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <drawerContext.Provider value={{ open, setOpen }}>
      <div style={{ marginLeft: open ? 200 : 0 }}>
        {children}
      </div>
    </drawerContext.Provider>
  );
};

export const useDrawerState = () => {
  const { open, setOpen } = React.useContext(drawerContext);
  return { open, setOpen };
};

ViewportProvider.propTypes = {
  children: node.isRequired
};

export default ViewportProvider;
