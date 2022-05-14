import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  rootAvatar: () => ({
    margin: '0 auto',
    width: '100%',
    height: '100%',
    fontWeight: '600',
    fontSize: '35px'
  }),
  square: {
    borderRadius: '5px'
  }

}));

export default useStyles;
