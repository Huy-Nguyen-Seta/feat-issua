const smallScreen = '@media screen and (max-height: 826px)';
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& div:first-child': {
      backgroundColor: 'transparent',
      boxShadow: 'none'
    },
    '& div': {
      userSelect: 'unset',
      boxShadow: 'none'
    },
    boxShadow: 'none'
  },
  body: {
    width: '300px',
    height: '50px',
    backgroundColor: 'rgba(225,226,228, 0.8) !important',
    border: '1px solid rgba(225,226,228, 0.8)',
    borderRadius: '5px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    height: 55
  },
  message: {
    fontFamily: 'Nunito',
    // marginTop: '20px',
    fontSize: '17px',
    letterSpacing: '0.5px',
    // color: 'rgb(92, 97, 106)',
  },
  notification: {
    textAlign: 'center'
  },
  failIcon: {
    width: 20,
    height: 20,
    marginRight: 20
  },
  [smallScreen]: {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      '& div:first-child': {
        backgroundColor: 'transparent',
        boxShadow: 'none'
      },
      '& div': {
        userSelect: 'unset'
      },
      boxShadow: 'none'
    },
    body: {
      width: '300px',
      height: '50px',
      backgroundColor: 'rgba(225,226,228, 0.8) !important',
      border: '1px solid rgba(225,226,228, 0.8)',
      borderRadius: '5px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    img: {
      height: 55
    },
    message: {
      fontFamily: 'Nunito',
      // marginTop: '20px',
      fontSize: '17px',
      letterSpacing: '0.5px',
      // color: 'rgb(92, 97, 106)',
    },
    notification: {
      textAlign: 'center'
    },
    failIcon: {
      width: 20,
      height: 20,
      marginRight: 20
    }
  }
};
export default styles;
