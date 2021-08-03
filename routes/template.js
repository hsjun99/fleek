var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const templateController = require('../controllers/templateController');


router.post('/user', AuthUser.checkToken, templateController.savetemplate);

router.get('/user', AuthUser.checkToken, templateController.getUserTemplate);

router.get('/default', AuthUser.checkToken, templateController.getDefaultTemplate);

router.post('/default/:group_id/:index', AuthUser.checkToken, templateController.importDefaultTemplate);

router.put('/user/:template_id', AuthUser.checkToken, templateController.updateUserTemplate);

router.delete('/user/:template_id', AuthUser.checkToken, templateController.deleteUserTemplate);

module.exports = router;
