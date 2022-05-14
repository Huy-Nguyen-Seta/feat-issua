import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  circleContainer: {
    margin: '20px 0',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 310
  },
  emojiController: {
    display: 'flex',
    margin: 'auto',
    position: 'absolute',
    justifyContent: 'center'
  },
  progressBar: {
    position: 'absolute',
    zIndex: 2
  },
  loadingProgressBar: {
    position: 'absolute',
    color: '#6D7278'
  },
  finishedProgressBar: {
    position: 'absolute',
    color: '#6D7278'
  },
  failedProgressBar: {
    position: 'absolute',
    color: '#D32F2F'
  },

  veritoneLogoV: {
    position: 'relative',
    right: 12
  },
  logoLoading: {
    width: 270,
    height: 270,
    borderRadius: '50%',
    backgroundColor: '#6D7278',
    padding: 75,
    marginTop: 15
  },
  verifiedBox: {
    width: 270,
    height: 270,
    borderRadius: '50%',
    backgroundColor: '#5AAF00',
    textAlign: 'center',
    padding: 75,
    marginTop: 15,
    color: '#FFFFFF',
    fontSize: 50
  },
  verifiedText: {
    position: 'relative',
    top: 30,
    right: 25
  },
  checkIcon: {
    position: 'absolute',
    color: 'green',
    top: 95,
    width: 120,
    height: 120
  },
  lockIcon: {
    position: 'absolute',
    color: 'red',
    top: 95,
    width: 120,
    height: 120
  },
  focusRingStatic: {
    position: 'absolute',
    width: 204,
    top: 61,
    zIndex: 3

  },
  '@media screen and (max-height: 800px)': {
    circleContainer: {
      margin: '10px 0',
    }
  },
  verifyingImg: {
    maxWidth: '20%',
    maxHeight: '20%',
    display: 'block',
  }
}));

export default useStyles;
