var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const workoutsController = require('../controllers/workoutsController');


router.get('/geteach/:id', AuthUser.checkToken, workoutsController.getEach);

router.get('/geteachrecords/:id', AuthUser.checkToken, workoutsController.getEachUsersRecords);

router.get('/getall', AuthUser.checkToken, workoutsController.getall);

module.exports = router;
