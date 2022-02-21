var express = require('express');
var router = express.Router();

let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');
const AWS = require('aws-sdk');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.post('/test', async (req, res, next) => {
//   let url = '';
//   AWS.config.update({
//     signatureVersion: 'v4'
//   });
//   const s3 = new AWS.S3();

//   const params = {
//     Bucket: "practice-bucket-fleek",
//     Key: "origin/test.png",
//     Expires: 60 * 60 * 3
//   };

//   const signedUrlPut = await s3.getSignedUrlPromise("putObject", params);
//   console.log(signedUrlPut);
//   url = signedUrlPut;
//   res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_CALENDAR_SUCCESS, url));
// });

module.exports = router;
