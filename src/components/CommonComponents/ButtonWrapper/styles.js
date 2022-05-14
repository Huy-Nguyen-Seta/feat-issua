import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  buttonWrapper: ({ height = 38, width = '100%' }) => ({
    width,
    height,
    borderRadius: '10px',
    fontSize: '16px',
    boxShadow: 'none !important',
    textTransform: 'none',
  }),
  buttonDisable: {
    boxShadow: 'none !important',
    backgroundColor: '#8C8C8C !important',
    color: '#BFBFBF !important',
    textTransform: 'none',
    fontSize: '16px',
  },
  textButton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '12px !important',
    lineHeight: '16px',
    height: '38px !important',
    fontFamily: 'Nunito'
  },
  '@media screen and (max-height: 826px)': {
    buttonWrapper: ({ height = 38, width = '100%' }) => ({
      width,
      height,
      borderRadius: '10px',
      fontSize: '16px',
      boxShadow: 'none !important',
      textTransform: 'none',
    }),
    buttonDisable: {
      boxShadow: 'none !important',
      backgroundColor: '#8C8C8C !important',
      color: '#BFBFBF !important',
      textTransform: 'none',
      fontSize: '16px',
    },
    textButton: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: '12px !important',
      lineHeight: '16px',
      height: '38px !important',
      fontFamily: 'Nunito'
    }
  }
}));
export default useStyles;
