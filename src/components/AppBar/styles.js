const drawerWidth = 240;

export const styles = (theme) => ({
  root: {
    display: 'flex'
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
    paddingLeft: 18,
    [theme.breakpoints.down('lg')]: {
      minHeight: 56
    },
    boxShadow:
      '2px 0 10px 0 rgba(0, 0, 0, 0.16), 0 2px 5px 0 rgba(0, 0, 0, 0.12) !important'
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    color: 'white',
    backgroundColor: '#ffffff',
    boxShadow: 'none',
    paddingRight: '0 !important'
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 20,
    color: '#8F0A0C'
  },
  title: {
    flexGrow: 1,
    textTransform: 'uppercase',
    color: theme.palette.primary.main,
    fontSize: 18,
    fontWeight: 600
  },
  logoHeader: {
    marginRight: 5
  },
  safe: {
    display: 'table-cell',
    verticalAlign: 'middle',
    fontSize: 18,
    color: '#FF0000'
  },
  space: {
    display: 'table-cell',
    verticalAlign: 'middle',
    fontSize: 18,
    color: '#08477C'
  },
  avatarHeader: {
    // border: '1px solid #fff'
  },
  langIcon: {}

});
