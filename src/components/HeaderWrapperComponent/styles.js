export const styles = {
  featureTitle: {
    display: 'inline',
    color: '#fff',
    textTransform: 'uppercase',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: 600,
    marginLeft: 5,
    lineHeight: 2,
  },
  helperWrapper: {
    width: '100%',
    marginBottom: '20px',
  },
  linearBackground: {
    background: 'linear-gradient(90deg, #0b1f5a 0%, rgba(255,255,255,1) 23%)',
    borderRadius: 5
  },
  createButton: {
    float: 'right',
    width: '30%'
  },
  '@media screen and (max-width: 500px)': {
    createButton: {
      float: 'left'
    }
  }
};
