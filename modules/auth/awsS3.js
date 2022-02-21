const AWS = require('aws-sdk');

AWS.config.update({
    signatureVersion: 'v4'
});

module.exports = new AWS.S3();