var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const socialController = require('../controllers/socialController');

router.get('/allsession', AuthUser.checkToken, socialController.getAllSession);

router.get('/alluser', AuthUser.checkToken, socialController.getAllUser);

router.post('/startsession', AuthUser.checkToken, socialController.sessionStart);

router.post('/sessionlike/:session_id/:emoji_type', AuthUser.checkToken, socialController.sessionLikeResponse);

router.get('/followers', AuthUser.checkToken, socialController.getFollowers);

router.get('/followings', AuthUser.checkToken, socialController.getFollowings);

module.exports = router;