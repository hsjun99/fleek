let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var moment = require("moment");

const asyncForEach = require("../modules/function/asyncForEach");

let Session = require("../models/fleekSession");
let User = require('../models/fleekUser');
let Template = require('../models/fleekTemplate');
let Workout = require("../models/fleekWorkout");
let Dashboard = require("../models/fleekDashboard");
const { asyncify } = require('async');
const dashboardController = require('./dashboardController');
const { getUid } = require('../modules/auth/firebaseAuth');

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
    
        const flag = await Session.sessionLike(uid, session_id, emoji_type);
    },
    getFollowers: async(req, res) => {
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