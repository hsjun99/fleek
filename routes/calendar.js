var express = require("express");
var router = express.Router();

const AuthUser = require("../middlewares/authUser");
const calendarController = require("../controllers/calendarController");

router.get("/getall", AuthUser.checkToken, calendarController.getData);

module.exports = router;
