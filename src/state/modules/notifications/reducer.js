// import * as actions from './actions';

const initialState = {
  notifications: [{
    id: '1234',
    type: 'normal',
    notificationTitle: 'Top Description Goes Here',
    notificationBody: 'Bottom Description Goes Here',
    statusDescription: 'testing testing',
  },
  {
    id: '2234',
    type: 'normal',
    notificationTitle: 'Top Processing Description Goes Here',
    notificationBody: 'Bottom Processing Description Goes Here',
    statusDescription: 'processing',
  }]
};

export function notificationsReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
