const {
  getBiometricsQuery,
  getImageBiometricQuery,
  postCheckInOutQuery
} = require('../query/engine');
const { camelCaseData } = require('../helper/calculation');

async function getBiometricsService(req) {
  const biometrics = await req.postgres.query(
    getBiometricsQuery({ ...req.query })
  );
  if (biometrics.rowCount == null) return { code: 500 };

  return {
    code: 200,
    data: camelCaseData(biometrics.rows)
  };
}

async function getImageUrlsService(req) {
  const imageUrls = await req.postgres.query(
    getImageBiometricQuery()
  );
  if (imageUrls.rowCount == null) return { code: 500 };

  return {
    code: 200,
    data: camelCaseData(imageUrls.rows)
  };
}

async function postCheckInOutService(req) {
  const checkInOut = await req.postgres.query(
    postCheckInOutQuery({ ...req.body })
  );
  if (!checkInOut.rowCount) return { code: 500 };

  return {
    code: 200,
    data: { success: true }
  };
}

module.exports = {
  getBiometricsService,
  getImageUrlsService,
  postCheckInOutService
};
