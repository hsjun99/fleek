var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const dashboardController = require('../controllers/dashboardController');


router.get('/getdata', AuthUser.checkToken, dashboardController.getData);

module.exports = router;
