import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%'
  },
  '@media screen and (max-height: 826px)': {
    root: {
      margin: '30px 0'
    }
  }
}));
export default useStyles;
