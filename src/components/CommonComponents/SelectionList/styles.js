import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  '@media screen and (max-height: 826px)': {
    container: {},
    label: {
      padding: '12px 24px 6px 24px',
      background: '#FAFBFC',
      fontFamily: 'Nunito',
      fontStyle: 'normal',
      fontWeight: 'bold',
      fontSize: '12px',
      lineHeight: '22px',
      letterSpacing: '-0.008px',
      color: '#828283',
    },
    list: {
      padding: 0
    },
    listItem: {
      height: '48px',
      background: '#FFFFFF',
      borderTop: '1px solid #EBEBEB',
      borderBottom: '1px solid #EBEBEB',
      boxSizing: 'border-box',
      padding: '13px 26px',
    },
    listItemText: {
      fontFamily: 'Nunito',
      fontStyle: 'normal',
      fontWeight: 'bold',
      fontSize: '14px',
      lineHeight: '22px',
      letterSpacing: '-0.008px',
      color: '#424242',
    }
  }
});
export default useStyles;
