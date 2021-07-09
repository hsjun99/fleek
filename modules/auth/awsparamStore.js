const AWS = require('aws-sdk');
AWS.config.update({region:'ap-northeast-1'});

const ssm = new AWS.SSM();
const params = {
  Name: 'config',
  WithDecryption: false
};

module.exports = new Promise((resolve, reject) => {
  ssm.getParameter(params, function(err, data) {
      if (err) {
          reject(err);
      } else {
          config_AWS = JSON.parse(data.Parameter.Value);
          resolve(config_AWS);
      }
  });
});