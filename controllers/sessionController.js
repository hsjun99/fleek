let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var moment = require("moment");

let Session = require("../models/fleekSession");

module.exports = {
    saveSession: async (req, res) => {
        const uid = req.uid;
        const data = req.body;
        const now = moment();
        const created_at = await now.format("YYYY-MM-DD HH:mm:ss");
        // Post Session
        const sessionIdx = await Session.postSessionData(uid, data.session, created_at, data.template_id, data.total_time);
        // DB Error Handling
        if (sessionIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, {sessionIdx: sessionIdx}));
    },
    deleteSession: async (req, res) => {
        const uid = req.uid;
        const session_id = req.params.session_id;

        // Delete Session
        const result = await Session.deleteSession(uid, session_id);
        // DB Error Handling
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DELETE_SESSION_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.DELETE_SESSION_SUCCESS, {session_id: session_id}));
    }
}