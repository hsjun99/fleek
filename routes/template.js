var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const AuthUserWear = require('../middlewares/authUserWear');
const templateController = require('../controllers/templateController');


router.post('/user', AuthUser.checkToken, templateController.savetemplate);

router.get('/user', AuthUser.checkToken, templateController.getUserTemplate);

router.get('/user/wear', AuthUserWear.checkUid, templateController.getUserTemplateWear);

router.get('/default', AuthUser.checkToken, templateController.getDefaultTemplate);

router.post('/default/:group_id/:index', AuthUser.checkToken, templateController.importDefaultTemplate);

router.post('/otherusers/:template_id', AuthUser.checkToken, templateController.importOtherUsersTemplate);

router.put('/user/:template_id', AuthUser.checkToken, templateController.updateUserTemplate);

router.put('/user/wear/:template_id', AuthUserWear.checkUid, templateController.updateUserTemplate);

router.delete('/user/:template_id', AuthUser.checkToken, templateController.deleteUserTemplate);

module.exports = router;
