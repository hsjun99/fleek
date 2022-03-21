var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const imageController = require('../controllers/imageController');

router.get('/upload/profile', AuthUser.checkToken, imageController.getPresignedUrlProfile);

router.delete('/remove/profile', AuthUser.checkToken, imageController.deleteProfile);

router.get('/presignedurl/feed', AuthUser.checkToken, imageController.getPresignedUrlFeed);

router.post('/upload/feed/:feed_url', AuthUser.checkToken, imageController.postFeedImage)

router.delete('/remove/feed', AuthUser.checkToken, imageController.deleteFeed);

// router.get('/upload/customworkout/:workout_id', AuthUser.checkToken, imageController.getPresignedUrlProfile);

// router.delete('/remove/customworkout/:workout_id', AuthUser.checkToken, imageController.getPresignedUrlProfile);

module.exports = router;
