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
        console.log(1);
        if (!follow_result){
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER, {code: code_follow.invalid_user}));
            return;
        }
        const follow_uid = follow_result.uid;
        console.log(2);
        if (uid == follow_uid) {
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {code: code_follow.self}));
            return;
        }
        console.log(3);
        if (await User.checkFollow(uid, follow_uid)){
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {code: code_follow.already_follow}));
            return;
        }
        console.log(4);
        const result = await User.addFollow(uid, follow_uid);
        if (result == -1) {
            // *****Error Handling Required*****
            res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
            return;
        }
        console.log(5);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS, {code: code_follow.success}));
    }
}