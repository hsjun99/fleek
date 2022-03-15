let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

var kakao_auth = require('../modules/auth/kakao_auth.js');
var moment = require("moment");
const asyncForEach = require('../modules/function/asyncForEach');

let User = require("../models/fleekUser");
let Template = require("../models/fleekTemplate");

const initialUserRoutine = require('../modules/algorithm/initialUserRoutine');

const getUserInfo = require('../modules/functionFleek/getUserInfo');

module.exports = {
    checkuser: async (req, res) => {
        const uid = req.uid;
        const exist = await User.checkUser(uid);

        if (exist == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.SIGNUP_FAIL));
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.SIGNUP_SUCCESS, { user: exist }));

        const fcm_token = req.body.fcm_token;
        await User.addFcmToken(uid, fcm_token);
    },
    signup: async (req, res) => {
        const uid = req.uid;
        const langCode = req.lang_code;
        const { name, sex, age, height, weight, squat1RM, experience, is_beta } = req.body;
        if (!String(name) || !String(sex) || !String(age) || !String(weight) || !String(height)) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
        }
        const now = moment();
        const created_at = await now.format("YYYY-MM-DD HH:mm:ss");

        const acceptedUid = await User.postData(uid, name, sex, age, height, weight, created_at, squat1RM, experience, langCode, is_beta);

        const userInfo = await getUserInfo(uid);
        await asyncForEach((await initialUserRoutine.initRoutines(langCode, userInfo.sex, userInfo.ageGroup, userInfo.weightGroup, userInfo.percentage)), async (routine) => {
            await Template.postTemplateDataDetail(uid, routine.name, routine.detail);
        });

        const result = await User.updateBodyInfo(uid, height, weight, null, null);

        if (acceptedUid == -1 || result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.SIGNUP_FAIL));
        }
        if (langCode == 1) {
            await User.addFollow(uid, 'kakao:1810981552'); // 플릭이 친구추가
        } else {
            await User.addFollow(uid, '08pSskg6dSca5f2bzwdWAhO6tBs1'); // Fleek Add Following
        }

        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.SIGNUP_SUCCESS, { uid: acceptedUid }));
    },
    kakaosignin: async (req, res) => {
        //Authentication Code 받아 돌려줄 api 
        const redirect = `webauthcallback://success?${new URLSearchParams(req.query).toString()}`;
        //console.log(`Redirecting to ${redirect}`);
        res.redirect(307, redirect);
    },
    kakaotoken: async (req, res) => {
        //발급 받은 kakao AccessCode로 사용자 확인후 firebase 로 custom token 생성하기 위한 api
        kakao_auth.createFirebaseToken(req.body["accessToken"], (result) => {
            res.send(result);
        });
    },
    checkunique: async (req, res) => {
        const name = req.params.name;
        if (!name) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
        }
        const unique = await User.checkName(name);
        if (unique == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.CHECK_UNIQUE_FAIL));
        }
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.CHECK_UNIQUE_SUCCESS, { unique: unique }));
    }
}