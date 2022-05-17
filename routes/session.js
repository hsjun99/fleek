var express = require("express");
var router = express.Router();

const AuthUser = require("../middlewares/authUser");
const AuthUserWear = require("../middlewares/authUserWear");
const sessionController = require("../controllers/sessionController");

router.post("/save", AuthUser.checkToken, sessionController.saveSession);

router.put("/modify", AuthUser.checkToken, sessionController.modifySession);

router.post("/save/wear", AuthUserWear.checkUid, sessionController.saveSession);

router.delete("/delete/:session_id", AuthUser.checkToken, sessionController.deleteSession);

router.post("/book", AuthUser.checkToken, sessionController.bookSession);

router.delete("/book", AuthUser.checkToken, sessionController.unbookSession);

router.post("/transfer/:session_id", AuthUser.checkToken, sessionController.transferSession);

router.get("/sessiondetail/:session_id", AuthUser.checkToken, sessionController.getSessionDetail);

router.put("/review/:session_id", AuthUser.checkToken, sessionController.postSessionReview);

module.exports = router;
