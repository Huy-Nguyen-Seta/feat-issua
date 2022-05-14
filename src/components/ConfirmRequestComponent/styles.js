export const styles = {
  headerTable: {
    backgroundColor: '#000000c9',
    color: '#fff',
    fontWeight: 600,
    border: '1px solid #fff'
  },
  bodyTable: {
    border: '1px solid #dadce0',
    padding: 8
  },
  filterItem: {
    margin: '0px 5px'
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
    width: '40%',
    padding: 40,
    borderRadius: 8,
    '&:focus': {
      outline: 'none'
    }
  },
  inputRoot: {
    '&$disabled': {
      color: 'rgba(0, 0, 0, 0.87)'
    },
  },
  disabled: {},
  groupTitle: {
    borderLeft: '4px solid #18191b',
    margin: '20px 10px',
    paddingLeft: 10,
    textTransform: 'uppercase',
    fontWeight: 600
  },
};
