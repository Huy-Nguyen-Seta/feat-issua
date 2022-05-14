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
  checkRequest: {
    color: theme.palette.primary.main,
    fontWeight: 600
  }
});
