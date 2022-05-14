export default {
  searchBoxRoot: ({ background = 'rgba(118, 118, 128, 0.12)' }) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: background,
    margin: '10px 0',
    height: '36px',
    borderRadius: '10px',
  }),
  placeholder: {
    fontFamily: '-apple-system',
    fontSize: '17px',
    lineHeight: '22px',
    letterSpacing: '-0.408px',
    color: 'rgba(60, 60, 67, 0.6)',
  },
  input: {
    flex: '1',
    '&::placeholder': {
      fontFamily: '-apple-system',
      fontSize: '17px',
      lineHeight: '22px',
      letterSpacing: '-0.408px',
      color: 'rgba(60, 60, 67, 0.6)',
    }
  },
  iconButton: {
    padding: '5px'
  },
  closeIcon: {
    color: '#7e7e7e'
  },
  searchIcon: {
    fontSize: '17px',
    lineHeight: '20px',
    letterSpacing: '-0.272px',
    color: '#8E8E93 !important',
  }
};
