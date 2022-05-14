function getErrorResponse(res, statusCode, error) {
  let errorMessage = '';
  switch (statusCode) {
    case 401:
      errorMessage = 'Unauthorized.';
      break;
    case 404:
      errorMessage = 'Not found.';
      break;
    default:
      errorMessage = 'Internal server error.';
  }
  return res.status(statusCode).send({ error: error || errorMessage });
}

function getSuccessResponse(res, statusCode, data) {
  return data
    ? res.status(statusCode).send(data)
    : res.status(statusCode).send({ success: true });
}

function getServiceResultForEmptyData(page) {
  return {
    code: 200,
    data: {
      pagination: { count: 0, page: Number(page) },
      data: []
    }
  };
}

module.exports = {
  getErrorResponse,
  getSuccessResponse,
  getServiceResultForEmptyData
};
