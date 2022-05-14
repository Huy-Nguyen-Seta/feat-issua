export const getApi = ({ apiRoot, apiRoute }) => fetch(`${apiRoot}${apiRoute}`, {
  credentials: 'include',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
  .then((res) => res.json())
  .catch((err) => ({
    data: {
      success: false,
      error: true,
      ...err
    }
  }));

export const postApi = ({ apiRoot, apiRoute, payloadData }) => fetch(`${apiRoot}${apiRoute}`, {
  credentials: 'include',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...payloadData
  }),
})
  .then((res) => res.json())
  .catch((error) => ({
    errorUnableCall: error
  }));

export const putApi = ({ apiRoot, apiRoute, payloadData }) => fetch(`${apiRoot}${apiRoute}`, {
  credentials: 'include',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...payloadData
  }),
})
  .then((res) => res.json())
  .catch((err) => ({
    data: {
      success: false,
      error: true,
      ...err
    }
  }));

export const deleteApi = ({ apiRoot, apiRoute, payloadData }) => fetch(`${apiRoot}${apiRoute}`, {
  credentials: 'include',
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...payloadData
  }),
})
  .then((res) => res.json())
  .catch((err) => ({
    data: {
      success: false,
      error: true,
      ...err
    }
  }));

export const uploadFile = ({ apiRoot, apiRoute, payloadData }) => fetch(`${apiRoot}${apiRoute}`, {
  method: 'POST',
  body: payloadData
})
  .then((res) => res.json())
  .catch((err) => ({
    data: {
      success: false,
      error: true,
      ...err
    }
  }));
