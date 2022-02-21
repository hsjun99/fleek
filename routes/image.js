var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const imageController = require('../controllers/imageController');

router.get('/upload/profile', AuthUser.checkToken, imageController.getPresignedUrlProfile);

router.delete('/remove/profile', AuthUser.checkToken, imageController.deleteProfile);

router.get('/upload/customworkout/:workout_id', AuthUser.checkToken, imageController.getPresignedUrlProfile);

router.delete('/remove/customworkout/:workout_id', AuthUser.checkToken, imageController.getPresignedUrlProfile);

module.exports = router;
