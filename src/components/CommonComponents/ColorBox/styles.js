import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    margin: '15px 0',
  },
  listItem: {
    width: '38%',
    margin: '10px',
    boxSizing: 'border-box',
    padding: '25px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    lineHeight: '25px',
    letterSpacing: '-0.008px',
    color: '#FFFFFF',
  }
}));

export default useStyles;
