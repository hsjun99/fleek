var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const imageController = require('../controllers/imageController');

router.get('/upload/profile', AuthUser.checkToken, imageController.getPresignedUrlProfile);

router.delete('/remove/profile', AuthUser.checkToken, imageController.deleteProfile);

module.exports = router;
