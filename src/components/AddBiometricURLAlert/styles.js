export const styles = (theme) => ({
  root: {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: '60px',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  }
});
