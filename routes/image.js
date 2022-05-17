var express = require("express");
var router = express.Router();

const AuthUser = require("../middlewares/authUser");

const imageController = require("../controllers/imageController");

router.get("/upload/profile", AuthUser.checkToken, imageController.getPresignedUrlProfile);

router.delete("/remove/profile", AuthUser.checkToken, imageController.deleteProfile);

router.post("/upload/feed", AuthUser.checkToken, imageController.getPresignedUrlFeed);

router.delete("/feed/:feed_id", AuthUser.checkToken, imageController.deleteFeedImage);

router.put("/feed/:feed_id", AuthUser.checkToken, imageController.updateFeedImageDetail);

router.get("/feed/:type", AuthUser.checkToken, imageController.getFeedImages);

module.exports = router;
