let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let User = require("../models/fleekUser");
let Template = require("../models/fleekTemplate");
let Workout = require("../models/fleekWorkout");
let Dashboard = require("../models/fleekDashboard");

const code_follow = {
    success: 0,
    invalid_user: 1,
    already_follow: 2,
    self: 3
}

module.exports = {
    follow: async(req, res) => {
        const uid = req.uid;
        const follow_uid = req.params.follow_uid;
        // Name -> Uid Conversion
        //const follow_result = await User.nameToUid(follow_name);
        // DB Error Handling
        /*
        if (follow_result == -1){
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }
*/
        //***********Exception Handling***********
        // (1) Invalid User
        if (!follow_uid){
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER, {code: code_follow.invalid_user}));
        }
        // (2) Self Follow
        if (uid == follow_uid) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {code: code_follow.self}));
        }
        // Check Current Following Status
        const flag = await User.checkFollow(uid, follow_uid);
        // DB Error Handling
        if (flag == -1){
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }
        // (3) Already Following
        if (flag){
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {code: code_follow.already_follow}));
        }
        //****************************************

        // Do Follow
        const result = await User.addFollow(uid, follow_uid);
        // DB Error Handling
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS, {code: code_follow.success}));
    },
    unfollow: async(req, res) => {
        const uid = req.uid;
        const unfollow_uid = req.params.unfollow_uid;
        const result = await User.deleteFollow(uid, unfollow_uid);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS));
    },
    getAllFollowing: async(req, res) => {
        const uid = req.uid;
        const following = await User.getFollows(uid);

        // DB Error Handling
        if (following == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, following));
    },
    getProfile: async(req, res) => {
        const uid = req.uid;
        
        const profileData = await User.getProfile(uid);

        // DB Error Handling
        if (profileData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, {name: profileData.name, age: profileData.age, height: profileData.height, weight: profileData.weight, privacy_setting: profileData.privacy_setting}));
    },
    updateName: async(req, res) => {
        const uid = req.uid;
        const newName = req.params.new_name;

        const unique = await User.checkName(newName);
        if (unique == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        } else if (unique == false) {
            return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, resMessage.READ_FOLLOWING_FAIL));
        }
        const result = await User.updateName(uid, newName);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
    },
    updateHeightWeight: async(req, res) => {
        const uid = req.uid;
        const height = req.params.height;
        const weight = req.params.weight;

        const result = await User.updateHeightWeight(uid, height, weight);
        if (result== -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));

    },
    postSuggestion: async(req, res) => {
        const uid = req.uid;
        const content = req.body.data;

        const result = await User.postSuggestion(uid, content);

        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
    },
    getSelfFleekData: async(req, res) => {
        const uid = req.uid;

        let data = {uid: uid, template: null, calendar_data: null, dashboard:{record:null, favorite_workouts:null}};
        [data.template, data.calendar_data, data.dashboard.record, data.dashboard.favorite_workouts] = await Promise.all([Template.getUserTemplate(uid), Workout.getCalendarData(uid), Dashboard.getDashboardRecords(uid), Dashboard.getFavoriteWorkouts(uid)]);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    },
    getOthersFleekData: async(req, res) => {
        const other_uid = req.params.other_uid;

        let data = {uid: other_uid, template: null, calendar_data: null, dashboard:{record:null, favorite_workouts:null}};
        [data.template, data.calendar_data, data.dashboard.record, data.dashboard.favorite_workouts] = await Promise.all([Template.getUserTemplate(other_uid), Workout.getCalendarData(other_uid), Dashboard.getDashboardRecords(other_uid), Dashboard.getFavoriteWorkouts(other_uid)]);
   
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    },
    updatePrivacySetting: async(req, res) => {
        const uid = req.uid;
        const privacyMode = req.params.privacy_mode;

        const result = await User.updatePrivacySetting(uid, privacyMode);
        
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
    }
}