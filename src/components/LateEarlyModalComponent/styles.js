export const styles = (theme) => ({
  featureTitle: {
    display: 'inline',
    color: '#fff',
    textTransform: 'uppercase',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 600,
    marginLeft: 5,
    lineHeight: 2,
  },
  helperWrapper: {
    width: '100%',
    marginBottom: '20px',
  },
  linearBackground: {
    background: 'linear-gradient(90deg, rgba(143,10,11,1) 0%, rgba(255,255,255,1) 23%)',
    borderRadius: 5
  },
  createButton: {
    float: 'right'
  },
  modalStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '0 !important',
  },
  bodyModalStyles: {
    backgroundColor: '#fff',
    border: '0 !important',
    width: '45%',
    padding: 40,
    borderRadius: 8,
    '&:focus': {
      outline: 'none'
    }
  },
  groupTitle: {
    borderLeft: '4px solid #18191b',
    margin: '20px 10px',
    paddingLeft: 10,
    textTransform: 'uppercase',
    fontWeight: 600
  },
  inputRoot: {
    '&$disabled': {
      color: 'rgba(0, 0, 0, 0.87)'
    },
  },
  disabled: {},
  checkRequest: {
    color: theme.palette.primary.main,
    fontWeight: 600
  }
});
