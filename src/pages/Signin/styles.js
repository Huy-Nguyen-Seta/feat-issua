const styles = {
  container: {
    height: '100%',
    fontSize: '14px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    borderRadius: '8px',
    border: '1px solid #dadce0',
    padding: '48px 40px 36px',
    width: 380,
  },
  title: {
    fontSize: '24px',
    lineHeight: 1.3333,
    textAlign: 'center',
    paddingTop: 16,
    // color: '#8F0A0C',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  subTitle: {
    fontSize: '16px',
    fontWeight: 400,
    letterSpacing: '.1px',
    lineHeight: 1.5,
    textAlign: 'center',
    paddingTop: 8,
  },
  formContainer: {
    width: '100%',
    padding: '10px 0px 40px',
  },
  accountInput: {
    width: '100%',
  },
  forgotEmail: {
    fontWeight: 'bold',
    letterSpacing: '.25px',
    padding: '9px 0px 3px',
    display: 'block',
    cursor: 'pointer',
    color: '#1a73e8',

  },

  submitWrapper: {
    display: 'flex',
    padding: '0px 0px 20px',
    marginTop: 30,
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButton: {
    textTransform: 'none',
    // marginLeft: 20,
    // width: '100%'
  },
  continuedTitle: {
    fontWeight: 600,
    textTransform: 'uppercase'
  },
  visible: {
    overflow: 'hidden',
    visibility: 'visible',
    opacity: 1,
    transition: 'opacity 0.5s linear',
  },
  hidden: {
    overflow: 'hidden',
    visibility: 'hidden',
    opacity: 0,
    transition: 'visibility 1s 2s, opacity 2s ease',
    height: 0,
  },
  errorFromApi: {
    color: 'red',
    fontSize: '13px',
    paddingTop: 10,
    width: '100%',
  },
  emailTitle: {
    fontWeight: 'bold',
    padding: '5px 10px',
    borderRadius: 8,
    border: '1px solid #dadce0',
    cursor: 'pointer',
  }
};

export default styles;
