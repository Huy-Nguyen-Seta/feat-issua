import { makeStyles } from '@material-ui/styles';

const smallScreen = '@media screen and (max-height: 826px)';

const useStyles = makeStyles(() => ({
  footer: {},
  [smallScreen]: {
    alertContainer: {
      width: '100%',
      height: 'calc(100vh - 158px)',
      overflow: 'auto',
    },
    detailContainer: (enableBorderTop = false) => ({
      height: 'calc(100vh - 180px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderTop: enableBorderTop ? '0.5px solid rgba(60, 60, 67, 0.29)' : ''
    }),
    noAlert: {
      textAlign: 'center'
    },
    noAlertText: {
      fontFamily: 'Nunito',
      fontSize: '18px',
      lineHeight: '22px',
      fontWeight: 'bold',
    },
    noAlertSubText: {
      fontFamily: 'Nunito',
      fontSize: '13px',
      lineHeight: '22px',
      color: 'rgb(124,123,126)'
    },
  }
}));
export default useStyles;
