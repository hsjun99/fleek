var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const userController = require('../controllers/userController');


router.post('/:follow_name', AuthUser.checkToken,userController.follow);

module.exports = router;
