import React from 'react';
import { func, string, bool } from 'prop-types';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import styles from './styles';
import images from '../../asset/images';

const useStyles = makeStyles(() => ({
  ...styles
}));

export default function Searchbox({
  onSearch,
  onClearSearch,
  placeholder = 'Search',
  background,
  haveMic,
}) {
  const classes = useStyles({ background });
  const inputRef = React.createRef();
  const [focusing, setFocusing] = React.useState(false);
  const [data, setData] = React.useState('');

  function handleSearch() {
    if (!focusing && !data) {
      setFocusing(true);
      inputRef.current.focus();
    } else {
      setFocusing(false);
      if (data) {
        onSearch(data);
      }
    }
  }
  function handleChangeInput(event) {
    setData(event.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      if (!data && onClearSearch) {
        onClearSearch();
        return;
      }
      onSearch && onSearch(data);
    }
  }
  function handleRemoveText() {
    setData('');
    if (onClearSearch) {
      onClearSearch();
    } else {
      onSearch && onSearch('');
    }
  }
  return (
    <div className={classes.searchBoxRoot}>
      <IconButton
        onClick={handleSearch}
        className={classes.iconButton}
        aria-label="search-button"
      >
        <img src={images.search} alt="search-icon" />
      </IconButton>
      <InputBase
        onChange={handleChangeInput}
        inputRef={inputRef}
        value={data}
        className={classes.input}
        placeholder={placeholder}
        inputProps={{ 'aria-label': 'Search-input' }}
        onKeyDown={handleKeyDown}
        classes={{
          input: classes.input
        }}
      />

      {haveMic && (
        <IconButton
          className={classes.iconButton}
          onClick={handleRemoveText}
          size="small"
        >
          <img className={classes.searchIcon} src={images.micro} alt="micro-icon" />
        </IconButton>
      )}

    </div>
  );
}
Searchbox.propTypes = {
  onSearch: func,
  placeholder: string,
  onClearSearch: func,
  background: string,
  haveMic: bool
};

Searchbox.defaultProps = {
  placeholder: 'Search',
  onClearSearch: () => { },
  onSearch: () => { },
  background: 'rgba(118, 118, 128, 0.12)',
  haveMic: true
};
