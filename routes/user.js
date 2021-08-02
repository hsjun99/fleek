var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const userController = require('../controllers/userController');

router.get('/profile', AuthUser.checkToken, userController.getProfile);

router.put('/name/:new_name', AuthUser.checkToken, userController.updateName);

router.put('/height&weight/:height/:weight', AuthUser.checkToken, userController.updateHeightWeight);

router.post('/suggestion', AuthUser.checkToken, userController.postSuggestion);

module.exports = router;
