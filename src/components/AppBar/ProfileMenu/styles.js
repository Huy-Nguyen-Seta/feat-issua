export const styles = {
  avatarHeader: {
    border: '1px solid #8f0a0c'
  },
  'MuiPopover-paper': {},
  header: {
    padding: 10,
    display: 'flex',
    '& $user-avatar': {
      paddingRight: 15,
    },
    '& $user-profile': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'left',
      '& $full-name': {
        color: 'rgba(0, 0, 0, 0.87)',
        lineHeight: 1.5,
        fontWeight: 'bold'
      },
      '& $username': {
        lineHeight: 1.5,
        fontSize: 13
      },
      '& $editButton': {
        padding: '5px 0 10px',
        color: '#8F0A0C',
        minWidth: 'max-content',
        '& div': {
          lineHeight: '36px'
        }
      }
    }
  },

  'user-avatar': {},
  'full-name': {},
  'user-profile': {},
  username: {},
  editButton: {}
};
