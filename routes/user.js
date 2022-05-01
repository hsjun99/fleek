var express = require("express");
var router = express.Router();

const AuthUser = require("../middlewares/authUser");
const AuthUserWear = require("../middlewares/authUserWear");
const userController = require("../controllers/userController");
const userHistoryController = require("../controllers/userHistoryController");
const { Auth } = require("../modules/auth/firebaseAuth");

router.get("/profile", AuthUser.checkToken, userController.getProfile);

router.get("/profile/wear", AuthUserWear.checkUid, userController.getProfileWear);

router.get("/setting", AuthUser.checkToken, userController.getSetting);

router.get("/setting/wear", AuthUserWear.checkUid, userController.getSetting);

router.put("/setting", AuthUser.checkToken, userController.updateSetting);

router.post("/follow/:follow_uid", AuthUser.checkToken, userController.follow);

router.delete("/unfollow/:unfollow_uid", AuthUser.checkToken, userController.unfollow);

router.delete("/follower/:remove_uid", AuthUser.checkToken, userController.deleteFollower);

router.put("/name/:new_name", AuthUser.checkToken, userController.updateName);

router.put("/userbodyinfo", AuthUser.checkToken, userController.updateWeight);

router.post("/bodyinfo", AuthUser.checkToken, userController.updateBodyInfo);

router.put("/bodyinfo/:body_info_id", AuthUser.checkToken, userController.updateBodyInfoRecord);

router.delete("/bodyinfo/:body_info_id", AuthUser.checkToken, userController.deleteBodyInfo);

router.post("/suggestion", AuthUser.checkToken, userController.postSuggestion);

router.get("/fleekdata/self", AuthUser.checkToken, userController.getSelfFleekData);

router.get("/fleekdata/:other_uid", AuthUser.checkToken, userController.getOthersFleekData);

router.post("/privacysetting/:privacy_mode", AuthUser.checkToken, userController.updatePrivacySetting);

router.delete("/unregister", AuthUser.checkToken, userController.unregister);

router.get("/workoutmemo/:workout_id", AuthUser.checkToken, userController.getUserWorkoutMemo);

router.post("/workoutmemo/:workout_id", AuthUser.checkToken, userController.postUserWorkoutMemo);

router.put("/workoutmemo/:userWorkoutMemo_id", AuthUser.checkToken, userController.updateUserWorkoutMemo);

router.delete("/workoutmemo/:userWorkoutMemo_id", AuthUser.checkToken, userController.deleteUserWorkoutMemo);

router.get("/userhistory", AuthUser.checkToken, userHistoryController.getUserHistoryData);

router.put("/sns/instagram/:instagram_id", AuthUser.checkToken, userController.updateInstagramId);

router.delete("/sns/instagram", AuthUser.checkToken, userController.deleteInstagramId);

module.exports = router;
