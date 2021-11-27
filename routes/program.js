var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const programController = require('../controllers/programController');


//router.post('/user', AuthUser.checkToken, templateController.savetemplate);

// router.get('/getall', AuthUser.checkToken, programController.getAllPrograms);

// router.get('/geteach/:program_id', AuthUser.checkToken, programController.getProgramData);

//router.get('/default', AuthUser.checkToken, templateController.getDefaultTemplate);

//router.put('/user/:template_id', AuthUser.checkToken, templateController.updateUserTemplate);

//router.delete('/user/:template_id', AuthUser.checkToken, templateController.deleteUserTemplate);

module.exports = router;
