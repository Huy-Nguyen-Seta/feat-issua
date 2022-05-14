export const styles = (theme) => ({
  userAvatar: {
    width: 'inherit',
    display: 'flex',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'column',
  },
  userAvatarItem: {
    width: 200,
    height: 200,
    backgroundColor: '#10398496'
  },
  userFullname: {
    fontWeight: 600,
    marginTop: 20,
    fontSize: 22
  },
  userInfoTitle: {
    marginTop: 20,
    fontSize: 22,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  infoItem: {
    // backgroundColor: '#000'
    padding: '10px 0px'
  },
  infoContent: {
    fontWeight: 600
  },
  infoItemIcon: {
    cursor: 'pointer'
  },
  changePassWordTitle: {
    fontSize: 22,
    fontWeight: 600,
    borderLeft: `3px solid ${theme.palette.primary.main}`,
    paddingLeft: 15
  },
  infoWrapper: {
    // border: '1px solid black',
    padding: '0px 20px'
  }
});
