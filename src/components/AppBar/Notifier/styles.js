export const styles = {
  notification: {
    display: 'flex',
    alignItems: 'center',
    '& $toolTipWrapper': {
      display: 'inline-block'
    },
    '& $badge': {
      // top: '-3px',
      // right: '-3px',
      width: '16px',
      height: '16px',
      fontSize: '10px',
      backgroundColor: '#8f0a0c'
    }
  },
  notificationWindow: {
    width: '516px',
    height: '100%',
    color: 'white',
    '& $header': {
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '48px',
      padding: '0 16px',
      backgroundColor: '#fff',
      color: '#03294a',
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row',
      border: '1px solid #e6e9ed',
      '& $headerLeft': {
        display: 'flex',
        '& $label': {
          minWidth: '0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '18px',
          fontWeight: 600,
        },
        '& $chip': {
          height: '16px',
          fontSize: '10px',
          lineHeight: '15px',
          padding: '1px 10px 0',
          borderRadius: '8px',
          marginTop: '16px',
          marginLeft: '20px',
          backgroundColor: '#8f0a0c',
          color: '#fff',
          fontWeight: 600,
        }
      },

      '& $read': {
        minWidth: '0',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        margin: '0 10px',
        cursor: 'pointer',
        fontWeight: 600,
      }
    },
    '& $body': {
      height: 'auto', maxHeight: '352px'
    }
  },
  header: {},
  headerLeft: {},
  label: {},
  chip: {},
  read: {},
  body: {},
  toolTipWrapper: {},
  badge: {},
  notificationList: {
    overflow: 'auto',
    maxHeight: 'inherit',
    backgroundColor: '#fff',
    '& $entry': {
      width: 'inherit',
      padding: '10px 30px 0 20px',
      display: 'flex',
      flexDirection: 'row',
      justifyItems: 'center',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: 'rgba(255, 145, 145, 0.25)'
      },
      '& $visualStatus': {
        width: '30px',
        padding: '0 25px',
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center'
      },
      '& $description': {
        flex: '1',
        minWidth: '0',
        color: '#03294a',
        '& $title': {
          fontStyle: 'normal',
          fontWeight: 'bold',
          fontSize: '14px',
          lineHeight: '20px',
          alignItems: 'center',
          textAlign: 'justify'
        },
        '& $subtitle': {
          fontStyle: 'normal',
          fontWeight: 'normal',
          fontSize: '12px',
          lineHeight: '14px',
          color: '#828282',
          padding: '10px 0'
        }
      }
    }
  },
  entry: {},
  visualStatus: {},
  description: {},
  title: {},
  subtitle: {},
  iconNoti: { color: '#90a0b7 !important' }
};
