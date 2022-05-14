import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  textField: {
    width: '100%',
  },
  outlinedInput: {
    boxShadow: 'none !important',
    borderRadius: '15px',
    border: '1px solid #F1F1F5',
    boxSizing: 'border-box'
  },
  textStyle: {
    fontSize: '14px',
    transform: 'translate(14px, 12px) scale(1)',
    fontFamily: 'Nunito',
    fontStyle: 'normal',
    fontWeight: 'normal',
    backgroundColor: '#FAFAFB',
    paddingRight: '5px'
  },
  rootbg: {
    background: '#FAFAFB !important',
    borderRadius: '15px',
    boxSizing: 'border-box',
    textAlign: 'center',
    height: '38px',
    position: 'relative'
  },
  outline: {
    transform: 'translate(14px, 12px) scale(1)',
    fontFamily: 'Nunito',
    fontStyle: 'normal',
    fontWeight: 'normal'
  },
  notchedOutline: {
    display: 'none'
  },
  viewContainer: {},
  eyeIcon: {
    width: '16.3px',
    height: '13.6px',
    top: '13px',
    right: '13px',
    position: 'absolute',
    color: '#92929D',
    cursor: 'pointer'
  },
  input: ({ type }) => ({
    padding: '10px 14px !important',
    paddingRight: type === 'password' ? '36px !important' : '10px !important',
    fontFamily: 'Nunito',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '14px',
    lineHeight: '19px',
    letterSpacing: '0.1px',
    color: '#000000',
    '&::placeholder': { /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: '#92929D',
      opacity: 1 /* Firefox */
    },
  }),

  placeholder: {
    fontFamily: 'Nunito',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: '14px',
    lineHeight: '19px',
    letterSpacing: '0.1px',
    color: 'red'
  },
}));

export default useStyles;
