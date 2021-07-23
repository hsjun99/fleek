var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const sessionController = require('../controllers/sessionController');


router.post('/save', AuthUser.checkToken, sessionController.saveSession);

router.delete('/delete/:session_id', AuthUser.checkToken, sessionController.deleteSession);

module.exports = router;
