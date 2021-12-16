var express = require('express');
var router = express.Router();

const UserTimeZone = require('../middlewares/userTimeZone');

const AuthUser = require('../middlewares/authUser');
const workoutsController = require('../controllers/workoutsController');
const { Auth } = require('../modules/auth/firebaseAuth');


//router.get('/geteach/:id', AuthUser.checkToken, workoutsController.getEach);

// router.get('/abilityandrecords', AuthUser.checkToken, workoutsController.getWorkoutAbilityAndRecentRecords);

router.get('/geteachrecords/:id', AuthUser.checkToken, workoutsController.getEachUsersRecords);

router.get('/getall', AuthUser.checkToken, workoutsController.getall);

router.get('/algorithm/data/:workout_id', AuthUser.checkToken, workoutsController.getAlgorithmData);

//router.get('/algorithm/:algorithm_id/:workout_id', AuthUser.checkToken, workoutsController.getAlgoWorkoutPlan);

//router.get('/algorithm/:name/:intensity/:workout_id', AuthUser.checkToken, workoutsController.getAlgoWorkoutPlan);

//router.get('/previewdata/:workout_id', AuthUser.checkToken, workoutsController.getWorkoutsPreviewData);

router.get('/substitute/:workout_id', AuthUser.checkToken, workoutsController.getSubstituteWorkout);

router.get('/table', AuthUser.checkToken, UserTimeZone.extractTimezone, workoutsController.getWorkoutTableDataOptimize);

router.post('/customworkout', AuthUser.checkToken, workoutsController.addCustomWorkout);

router.put('/customworkout', AuthUser.checkToken, workoutsController.updateCustomWorkout);

router.delete('/customworkout/:workout_id', AuthUser.checkToken, workoutsController.deleteCustomWorkout);

//router.get('/table/:other_uid', AuthUser.checkToken, workoutsController.getOthersWorkoutData);

module.exports = router;
