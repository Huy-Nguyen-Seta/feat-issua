import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: 'Nunito'
  },
  list: {
    padding: 0
  },
  divider: {
    marginRight: 16,
    marginLeft: 16
  },
  listItemText: {
    fontSize: 14
  },
  leftDiv: {
    width: 48
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
  },
  formControl: {
    marginTop: theme.spacing(4),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
  inputLabel: {
    color: '#92929D',
    fontFamily: 'Nunito',
    fontSize: '16px',
    lineHeight: '21px',
    fontWeight: 'normal',
    fontStyle: 'normal',
  },
  selectTitle: {
    fontFamily: 'Nunito',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: '14px',
    lineHeight: '19px',
    letterSpacing: '-0.008px',
    color: '#44444F'
  },
  inputField: {
    marginTop: 30
  },
}));
export default useStyles;
