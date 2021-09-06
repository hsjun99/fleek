var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const workoutsController = require('../controllers/workoutsController');


//router.get('/geteach/:id', AuthUser.checkToken, workoutsController.getEach);


router.get('/geteachrecords/:id', AuthUser.checkToken, workoutsController.getEachUsersRecords);

router.get('/getall', AuthUser.checkToken, workoutsController.getall);

router.get('/algorithm/:name/:intensity/:workout_id', AuthUser.checkToken, workoutsController.getAlgoWorkoutPlan);

//router.get('/previewdata/:workout_id', AuthUser.checkToken, workoutsController.getWorkoutsPreviewData);

router.get('/substitute/:workout_id', AuthUser.checkToken, workoutsController.getSubstituteWorkout);

router.get('/table', AuthUser.checkToken, workoutsController.getWorkoutTableData);

//router.post('/customworkout', AuthUser.checkToken, workoutsController.addCustomWorkout);

//router.get('/table/:other_uid', AuthUser.checkToken, workoutsController.getOthersWorkoutData);

module.exports = router;
