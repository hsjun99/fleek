let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let PTRequest = require("../models/fleekPTRequest");

const OneSignal = require("../modules/onesignal/notificationManager");

module.exports = {
    postPTRequest: async (req, res) => {
        const uid = req.uid;
        const data = req.body;

        if ((await PTRequest.countPersonalTrainingRequest(uid)) >= 3) {
            return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, resMessage.WRITE_SESSION_FAIL));
        }

        await PTRequest.postPersonalTrainingRequest(uid, data);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_TEMPLATE_SUCCESS));

        await OneSignal.adminNotification();
    },
    cancelPTRequest: async (req, res) => {
        const uid = req.uid;
        const request_id = req.params.request_id;

        await PTRequest.cancelPersonalTrainingRequest(uid, request_id)
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_TEMPLATE_SUCCESS));
    },
}