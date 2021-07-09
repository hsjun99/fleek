var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const signupController = require('../controllers/signupController');

// SignUp
router.post('/', AuthUser.checkToken, signupController.signup);
// 
router.get('/checkunique/:name', signupController.checkunique);
// Kakao
router.get('/callbacks/kakao/sign_in', signupController.kakaosignin);
router.post('/callbacks/kakao/token', signupController.kakaotoken);

module.exports = router;