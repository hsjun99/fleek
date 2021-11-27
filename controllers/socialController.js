let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let Session = require("../models/fleekSession");
let User = require('../models/fleekUser');
let Template = require('../models/fleekTemplate');

module.exports = {
    sessionStart: async(req, res) => {
        const uid = req.uid;
        
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS));

        const followers = await User.getFollowersWithoutPrivacySetting(uid);
        const followers_list = await Promise.all(followers.map(async follower => {
            return follower.uid;
        }));

        const {name} = await User.getProfile(uid);
        await Session.sessionStart(uid, name, followers_list);

    },
    sessionStop: async(req, res) => {
        const uid = req.uid;
        
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS));

        const followers = await User.getFollowersWithoutPrivacySetting(uid);
        const followers_list = await Promise.all(followers.map(async follower => {
            return follower.uid;
        }));

        const {name} = await User.getProfile(uid);
        await Session.sessionStop(uid, name, followers_list);
    },
    sessionFinish: async(req, res) => {
        const uid = req.uid;

        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS));
    
        const followers = await User.getFollowersWithoutPrivacySetting(uid);
        const followers_list = await Promise.all(followers.map(async follower => {
            return follower.uid;
        }));

        const {name} = await User.getProfile(uid);
        await Session.sessionFinish(uid, name, followers_list);
    },
    getAllSession: async (req, res) => {
        const uid = req.uid;
        // Post Session
        const data = await Session.getAllSessionData(uid);
        // DB Error Handling
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    },
    getSessionBatch: async(req, res) => {
        const uid = req.uid;
        const last_session_id = req.params.last_session_id;
        let data;
        if (last_session_id == "init") {
            data = await Session.getFirstSessionBatchData(uid);
        } else {
            data = await Session.getNextSessionBatchData(uid, last_session_id);
        }
        // DB Error Handling
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    },
    getAllUser: async(req, res) => {
        const uid = req.uid;
        const data = await User.getAllUser(uid);
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    },
    sessionLikeResponse: async(req, res) => {
        const uid = req.uid;
        const session_id = req.params.session_id;
        const emoji_type = req.params.emoji_type;

        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS));
        
        const {name, privacy_setting} = await User.getProfile(uid)

        let template_name;
        const template_id = await Template.getUserTemplateIdFromSessionId(session_id);

        if (template_id == null) {
            template_name = '자유 운동';
        } else {
            template_name = await Template.getUserTemplateName(template_id);
        }

        await Session.sessionLike(uid, session_id, emoji_type, name, privacy_setting, template_name);
    },
    getFollowersAndFollowings: async (req, res) => {
        const uid = req.uid;
        const [data_followers, data_followings] = await Promise.all([await User.getFollowers(uid), await User.getFollowings(uid)]);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, {followers: data_followers, followings: data_followings}));
    },
    getFollowers: async(req, res) => {
        //await new Promise(resolve => setTimeout(resolve, 20000));
        const uid = req.uid;
        const data = await User.getFollowers(uid);
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    },
    getFollowings: async(req, res) => {
        const uid = req.uid;
        const data = await User.getFollowings(uid);
        if (data == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    }
}