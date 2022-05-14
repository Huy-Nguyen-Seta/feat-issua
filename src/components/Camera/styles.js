export const styles = {
  wrapper: {
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center',
    width: '100%',
  },
  container: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%'
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  video: {
    position: 'absolute',
    width: '100%',
    '&::-webkit-media-controls-play-button': {
      display: 'none !important',
      '-webkit-appearance': 'none',
    }
  },
  overlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
    boxShadow: '0px 0px 20px 56px rgba(0, 0, 0, 0.6)',
    border: '1px solid #ffffff',
    borderRadius: 10,
  },
  button: {
    width: '75%',
    minWidth: 100,
    maxWidth: 250,
    marginTop: 24,
    padding: '12px 24px',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
};
