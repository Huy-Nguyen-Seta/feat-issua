import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  buttonGroupContainer: ({ height = 32, color = '#EFEFF0' }) => ({
    flexGrow: 1,
    height: `${height}px`,
    backgroundColor: color,
    borderRadius: 8,
    padding: 2
  }),
  gridItem: {
    display: 'flex',
    alignItems: 'center',
  },
  item: ({ height = 32, textColor = 'white' }) => ({
    height: `${height - 4}px`,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: textColor,
    fontFamily: 'Nunito',
    textTransform: 'none',
    padding: '0',
    margin: '0',
  }),
  activeButton: {
    color: '#000 !important',
    backgroundColor: 'white !important',
    background: '#FFFFFF',
    border: '0.5px solid rgba(0, 0, 0, 0.04)',
    boxShadow: '0px 3px 1px rgba(0, 0, 0, 0.04), 0px 3px 8px rgba(0, 0, 0, 0.12)',
    borderRadius: '7px',
    fontWeight: 'bold'
  },
  divider: ({ height = 32 }) => ({
    backgroundColor: '#D2D2D4',
    width: 1,
    height: height / 2
  })
}));

export default useStyles;
