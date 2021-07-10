let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var kakao_auth = require('../modules/auth/kakao_auth.js');
var moment = require("moment");

let User = require("../models/fleekUser");

module.exports = {
    signup: async(req, res) => {
        const uid = req.uid;
        const {name, sex, age, height, weight, goal} = req.body;
        const now = moment();
        const created_at = await now.format("YYYY-MM-DD HH:mm:ss");
        // *****Error Handling Required*****
        console.log(req.uid, req.body);
        const newIdx = await User.postData(uid, name, sex, age, height, weight, created_at, goal);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.SIGNUP_SUCCESS, {uid: uid}));
    },
    kakaosignin: async (req, res) => {
        //Authentication Code 받아 돌려줄 api 
        const redirect = `webauthcallback://success?${new URLSearchParams(req.query).toString()}`;
        console.log(`Redirecting to ${redirect}`);
        res.redirect(307, redirect);
    },
    kakaotoken: async (req, res) => {
        //발급 받은 kakao AccessCode로 사용자 확인후 firebase 로 custom token 생성하기 위한 api
        kakao_auth.createFirebaseToken(req.body["accessToken"],(result)=>{
            res.send(result);
        });
    },
    checkunique: async (req, res) => {
        const name = req.params.name;
        if (!name) {
            res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
            return;
        }
        const unique = await User.checkName(name);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.CHECK_UNIQUE_SUCCESS, {unique: unique}));
    }
}