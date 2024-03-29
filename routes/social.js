var express = require("express");
var router = express.Router();

const AuthUser = require("../middlewares/authUser");
const AuthUserWear = require("../middlewares/authUserWear");
const socialController = require("../controllers/socialController");

router.get("/sessionbatch/:last_session_id", AuthUser.checkToken, socialController.getSessionBatch);

// router.get(
//   "/sessionbatch/profile/:last_session_id",
//   AuthUser.checkToken,
//   socialController.getSessionBatchProfile
// );

// router.get(
//   "/sessionbatch/global/:last_session_id",
//   AuthUser.checkToken,
//   socialController.getSessionBatchGlobal
// );

router.post("/startsession", AuthUser.checkToken, socialController.sessionStart);

router.post("/stopsession", AuthUser.checkToken, socialController.sessionStop);

router.post("/startsession/wear", AuthUserWear.checkUid, socialController.sessionStart);

router.post("/stopsession/wear", AuthUserWear.checkUid, socialController.sessionStop);

// router.post("/sessionlike/:session_id/:emoji_type", AuthUser.checkToken, socialController.sessionLikeResponse);

router.get("/followers", AuthUser.checkToken, socialController.getFollowers);

router.get("/followings", AuthUser.checkToken, socialController.getFollowings);

module.exports = router;
