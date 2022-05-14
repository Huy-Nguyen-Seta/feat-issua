const initialState = {
    isOpen: true,
   
  };
  export const rootReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'CHECK_OPEN':
        return {
          ...state,
          isOpen: !state.isOpen,
        };
      default:
        return state;
    }
  };