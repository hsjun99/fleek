const OneSignal = require('onesignal-node');

const ssmPromise = require("../modules/auth/awsparamStore.js");

const onesignalClient = async () => {
    const configAWS = await ssmPromise;
    const client = new OneSignal.Client(configAWS.one_signal_app_id, configAWS.one_signal_api_key);
    return client;
}


module.exports = onesignalClient;