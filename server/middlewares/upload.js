const multer = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const config = require('../../config.json');

function uploadToS3(args) {
  const { orgName, fullPathInServer } = args.input;
  const s3 = new AWS.S3({
    accessKeyId: config.s3.accessKey,
    secretAccessKey: config.s3.secretKey,
  });
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: config.s3.bucket,
      Key: orgName,
      Body: fs.readFileSync(fullPathInServer)
    };
    s3.upload(params, (err, data) => {
      if (err) {
        throw reject(err);
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      resolve(data.Location);
    });
  });
}

const imageUploader = multer({ dest: 'uploads/' });

module.exports = { uploadToS3, imageUploader };
