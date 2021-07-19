var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const templateController = require('../controllers/templateController');


router.post('/save', AuthUser.checkToken, templateController.savetemplate);

router.get('/getall', AuthUser.checkToken, templateController.getTemplate);

module.exports = router;
