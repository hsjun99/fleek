var express = require("express");
var router = express.Router();

const UserTimeZone = require("../middlewares/userTimeZone");

const AuthUser = require("../middlewares/authUser");

const workoutsController = require("../controllers/workoutsController");

router.get("/geteachrecords/:id", AuthUser.checkToken, workoutsController.getEachUsersRecords);

router.get("/getall", AuthUser.checkToken, workoutsController.getall);

router.get("/algorithm/data/:workout_id", AuthUser.checkToken, workoutsController.getAlgorithmData);

router.get("/substitute/:workout_id", AuthUser.checkToken, workoutsController.getSubstituteWorkout);

router.get("/table", AuthUser.checkToken, UserTimeZone.extractTimezone, workoutsController.getWorkoutTableDataOptimize);

router.post("/customworkout", AuthUser.checkToken, workoutsController.addCustomWorkout);

router.put("/customworkout", AuthUser.checkToken, workoutsController.updateCustomWorkout);

router.delete("/customworkout/:workout_id", AuthUser.checkToken, workoutsController.deleteCustomWorkout);

router.post("/rankinginfo/fraud/:session_id", AuthUser.checkToken, workoutsController.postFraudRankingReport);

router.get("/rankinginfo/:workout_id", AuthUser.checkToken, workoutsController.getWorkoutRankingInfo);

router.get("/memo/all", AuthUser.checkToken, workoutsController.getAllWorkoutMemo);

router.post("/exponerm", AuthUser.checkToken, workoutsController.getExpectedUserOneRmMax);

module.exports = router;
