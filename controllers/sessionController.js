let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var moment = require("moment");

let Session = require("../models/fleekSession");
let User = require("../models/fleekUser");
let Template = require('../models/fleekTemplate');

module.exports = {
    saveSession: async (req, res) => {
        const uid = req.uid;
        const data = req.body;
        const now = moment();
        const created_at = await now.format("YYYY-MM-DD HH:mm:ss");
        // Post Session
        const sessionIdx = await Session.postSessionData(uid, data.session, created_at, data.template_id, data.total_time, data.alphaProgramUsers_id, data.alphaProgram_progress);
        // DB Error Handling
        if (sessionIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, {sessionIdx: sessionIdx}));

        const followers = await User.getFollowersWithoutPrivacySetting(uid);
        const followers_list = await Promise.all(followers.map(async follower => {
            return follower.uid;
        }));
        let template_name;
        if (data.template_id == null) {
            template_name = '익명의 루틴';
        } else {
            template_name = await Template.getUserTemplateName(data.template_id);
        }
        const {name, privacy_setting} = await User.getProfile(uid);
        await Session.sessionFinish(uid, name, privacy_setting, followers_list, sessionIdx, template_name);
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