let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let User = require("../models/fleekUser");

const code_follow = {
    success: 0,
    invalid_user: 1,
    already_follow: 2,
    self: 3
}

module.exports = {
    follow: async(req, res) => {
        const uid = req.uid;
        const follow_name = req.params.follow_name;
        const follow_result = await User.nameToUid(follow_name);
        if (follow_result == -1){
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        // Invalid User
        if (!follow_result){
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER, {code: code_follow.invalid_user}));
        }
        const follow_uid = follow_result.uid;
        // Self
        if (uid == follow_uid) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {code: code_follow.self}));
        }
        const flag = await User.checkFollow(uid, follow_uid);
        if (flag == -1){
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        // Already Following
        if (flag){
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {code: code_follow.already_follow}));
        }
        const result = await User.addFollow(uid, follow_uid);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS, {code: code_follow.success}));
    },
    getAllFollowing: async(req, res) => {
        const uid = req.uid;
        const following = await User.getFollows(uid);
        if (following == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS, following));
    }
}