const drawerWidth = 275;

export const styles = (theme) => (
  {
    root: {
      display: 'flex',
      backgroundColor: '#00000'
    },
    HoverButton: {
      backgroundColor: '#00CED1',
      color: 'white',
      position: 'fixed',
      zIndex: 3000,
      marginTop: 100,
      '&:hover': {
        backgroundColor: '#00CED1'
      },
    },
    headContainer: {
      backgroundColor: '#a52a2a',
      color: 'white'
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 10px',
      ...theme.mixins.toolbar,
      backgroundColor: '#ffffff',
      color: 'white',
      boxShadow: 'none',
      '&::after': {
        boxSizing: 'content-box'
      },
      minHeight: '100px !important'

    },
    title: {
      flexGrow: 1,
      textAlign: 'center'
    },
    overFlow: {
      overflow: 'hidden'
    },
    drawerPaper: {
      display: 'block',
      marginTop: 50,
      flexGrow: 0,
      order: 0,
      position: 'fixed',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen
      }),
      borderRight: 'none !important',
      zIndex: 0,
      boxShadow: '0px -3px 13px -1px rgba(179,170,179,1)'
    },
    drawerPaperClose: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen
      }),
      width: theme.spacing(5),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(7)
      }
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'hidden',
      flexDirection: 'column'
    },
    listSidebar: {
      height: '100%',
      backgroundColor: '#ffffff',
      paddingTop: 10
    },
    darkblue: {
      color: '#18191b',
      minWidth: 40
    },
    sidbarPrimary: {
      color: theme.palette.primary.main,
      // fontWeight: 600
    },
    nested: {
      paddingLeft: theme.spacing(4)
    },
    logoHeader: {
      display: 'table',
      // maxWidth: 80
    },
    safe: {
      display: 'table-cell',
      verticalAlign: 'middle',
      fontSize: 18,
      color: '#FF0000',
      fontWeight: 600
    },
    space: {
      display: 'table-cell',
      verticalAlign: 'middle',
      fontSize: 18,
      color: '#08477C',
      fontWeight: 600
    },
    logo: {
      width: '100%'
    },
    highlight: {
      backgroundColor: '#E7E8F0 !important',
      borderLeft: '4px solid #18191b !important'
    },
    badge: {
      fontSize: '10px',
      backgroundColor: '#8f0a0c',
      marginRight: 10
    },
    popoverCustom: {
      borderBottom: '1px solid rgb(212, 212, 212)',
      witdth: '100%',
      height: '100%',
      '&:hover': {
        backgroundColor: '#42bcf5'
      },
    },
    eachItemSideBar: {
      borderBottom: '1px solid rgb(212, 212, 212)',
    },
    ContainerPopoverCustom: {
      boxShadow: '0px -3px 13px -1px rgba(179,170,179,1)',
      boxSizing: 'border-box',
      borderRadius: '10px!important',
    }
  }
);
