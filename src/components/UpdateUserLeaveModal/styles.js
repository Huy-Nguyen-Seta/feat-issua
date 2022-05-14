export const styles = (theme) => ({
  modalStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyModalStyles: {
    backgroundColor: '#fff',
    border: '0 !important',
    width: '50%',
    padding: '50px 20px',
    borderRadius: 8,
    '&:focus': {
      outline: 'none'
    }
  },
  accountInput: {
    width: '100%'
  },
  groupTitle: {
    borderLeft: '4px solid #18191b',
    margin: '10px',
    paddingLeft: 10,
    textTransform: 'uppercase',
    fontWeight: 600
  },
  headerTable: {
    backgroundColor: '#000000c9',
    color: '#fff',
    fontWeight: 600,
    border: '1px solid #fff',
    padding: 5
  },
  bodyTable: {
    border: '1px solid #dadce0',
    padding: 5
  },
  typography: {
    padding: theme.spacing(2),
  },
});
