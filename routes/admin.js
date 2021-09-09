var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const adminController = require('../controllers/adminController');


router.get('/faq', AuthUser.checkToken, adminController.getFaqBoard);

module.exports = router;
