let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var moment = require("moment");

let Session = require("../models/fleekSession");
let User = require("../models/fleekUser");
let Template = require('../models/fleekTemplate');
let Workout = require('../models/fleekWorkout');

module.exports = {
    saveSession: async (req, res) => {
        const uid = req.uid;
        const data = req.body;
        const device = req.headers.device; // For Watch And Wear
        const now = moment();
        const { sex, weight, ageGroup, weightGroup } = await User.getProfile(uid);

        if (data.template_id == null) data.template_id = null;

        const created_at = await now.format("YYYY-MM-DD HH:mm:ss");

        // Post Session
        const sessionIdx = await Session.postSessionData(uid, weight, data.session, created_at, data.start_time, data.name, data.template_id, data.total_time, data.alphaProgramUsers_id, data.alphaProgram_progress, device);
        // DB Error Handling
        if (sessionIdx == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }
        let sessionUserHistoryData;

        if (device != null && device != undefined) {
            sessionUserHistoryData = await Workout.getUserHistoryDataBySessionWear(uid, sex, ageGroup, weightGroup, sessionIdx);
        } else {
            sessionUserHistoryData = await Workout.getUserHistoryDataBySession(uid, sex, ageGroup, weightGroup, sessionIdx);
        }

        let update_time = Math.floor(Date.now() / 1000);

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, sessionUserHistoryData, update_time));

        await Session.postUserHistorySyncFirebase(uid, update_time);
        await Template.postTemplateSyncFirebase(uid, update_time);

        // const followers = await User.getFollowersWithoutPrivacySetting(uid);
        // const followers_list = await Promise.all(followers.map(async follower => {
        //     return follower.uid;
        // }));
        // let template_name;
        // if (data.template_id == null) {
        //     template_name = '자유 운동';
        // } else {
        //     template_name = await Template.getUserTemplateName(data.template_id);
        // }
        // const {name, privacy_setting} = await User.getProfile(uid);
        // await Session.sessionFinish(uid, name, privacy_setting, followers_list, sessionIdx, template_name);
        if (req.headers.send_notification == "true") {
            const followers = await User.getFollowersWithoutPrivacySetting(uid);
            const followers_list = await Promise.all(followers.map(async follower => {
                return follower.uid;
            }));
            let template_name;
            if (data.template_id == null) {
                template_name = '자유 운동';
            } else {
                template_name = await Template.getUserTemplateName(data.template_id);
            }
            const { name, privacy_setting } = await User.getProfile(uid);
            await Session.sessionFinish(uid, name, privacy_setting, followers_list, sessionIdx, template_name);
        }
        // else {
        //     const sessionIdx = await Session.postSessionData(uid, weight, data.session, data.created_at, data.template_id, data.total_time, data.alphaProgramUsers_id, data.alphaProgram_progress);
        //     // DB Error Handling
        //     if (sessionIdx == -1) {
        //         return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        //     }
        //     const sessionCalendarData = await Workout.getCalendarDataBySession(uid, sex, ageGroup, weightGroup, sessionIdx);

        //     let update_time = Math.floor(Date.now() / 1000);
        //     // Success
        //     res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, sessionCalendarData, update_time));

        //     await Session.postUserHistorySyncFirebase(uid, update_time);


        // }
    },
    modifySession: async (req, res) => {
        const uid = req.uid;
        const data = req.body;
        const device = req.headers.device; // For Watch And Wear

        const { sex, weight, ageGroup, weightGroup } = await User.getProfile(uid);

        const result = await Session.modifySessionData(uid, data.session_id, data.name, weight, data.session, data.start_time, data.total_time, device);
        // DB Error Handling
        if (result != true) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.WRITE_SESSION_FAIL));
        }
        const sessionUserHistoryData = await Workout.getUserHistoryDataBySession(uid, sex, ageGroup, weightGroup, data.session_id);

        let update_time = Math.floor(Date.now() / 1000);

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, sessionUserHistoryData, update_time));

        await Session.postUserHistorySyncFirebase(uid, update_time);
    },
    deleteSession: async (req, res) => {
        //  await new Promise(resolve => setTimeout(resolve, 20000));
        const uid = req.uid;
        const session_id = req.params.session_id;

        // Delete Session
        const result = await Session.deleteSession(uid, session_id);
        // DB Error Handling
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DELETE_SESSION_FAIL));
        }

        let update_time = Math.floor(Date.now() / 1000);

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.DELETE_SESSION_SUCCESS, [{ session_id: Number(session_id) }], update_time));

        await Session.postUserHistorySyncFirebase(uid, update_time);
    }
}