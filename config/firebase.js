//const { config } = require("aws-sdk");
const ssmPromise = require("../modules/auth/awsparamStore.js");

const FB = new Promise(async(resolve, reject) => {
    await ssmPromise.then(configAWS => {
        const configFB = {
            "type": configAWS.type,
            "project_id": configAWS.project_id,
            "private_key_id": configAWS.private_key_id,
            "private_key": configAWS.private_key,
            "client_email": configAWS.client_email,
            "client_id": configAWS.client_id,
            "auth_uri": configAWS.auth_uri,
            "token_uri": configAWS.token_uri,
            "auth_provider_x509_cert_url": configAWS.auth_provider_x509_cert_url,
            "client_x509_cert_url": configAWS.client_x509_cert_url
        };
        resolve(configFB);
    });
});

module.exports = FB;