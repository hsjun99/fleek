let util = require("../modules/util");
let statusCode = require("../modules/statusCode");
let resMessage = require("../modules/responseMessage");

const s3 = require("../modules/auth/awsS3");

let Image = require("../models/fleekImage");

module.exports = {
  getPresignedUrlProfile: async (req, res) => {
    const uid = req.uid;
    const filename = `profile_${new Date().getTime()}.png`;
    const params = {
      Bucket: "fleek-prod-bucket",
      Key: `profile/${uid}/origin/${filename}`,
      Expires: 60 * 60 * 3,
      ContentType: "application/octet-stream"
    };

    const signedUrlPut = await s3.getSignedUrlPromise("putObject", params);

    await Image.updateProfileUrl(uid, filename);
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS, signedUrlPut));
  },
  deleteProfile: async (req, res) => {
    const uid = req.uid;
    await Image.deleteProfileUrl(uid);
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS));
  },
  getPresignedUrlFeed: async (req, res) => {
    const uid = req.uid;
    // const uid = 'S27Sma9UBkSTgN6mSXXhPm31CG52';
    const { content, privacy_setting } = req.body;
    const filename = `feed_${new Date().getTime()}.png`;
    const params = {
      Bucket: "fleek-prod-bucket",
      Key: `feed/origin/${uid}/${filename}`,
      Expires: 60 * 60 * 3,
      ContentType: "application/octet-stream"
    };

    const signedUrlPut = await s3.getSignedUrlPromise("putObject", params);
    await Image.postFeedImage(uid, filename, content, privacy_setting);

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS, signedUrlPut));
  },
  deleteFeedImage: async (req, res) => {
    const uid = req.uid;
    const feedImage_id = req.params.feed_id;

    await Image.deleteFeedImage(uid, feedImage_id);

    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS));
  },
  getFeedImages: async (req, res) => {
    const uid = req.uid;
    const type = req.params.type;
    const { last_id } = req.query;

    let data;

    switch (type) {
      case "mine":
        data = await Image.getMyFeedImages(uid, last_id);
        break;
      case "all":
        data = await Image.getAllFeedImages(uid, last_id);
        break;
      default:
        data = await Image.getOthersFeedImages(uid, type, last_id);
        break;
    }
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS, data));
  },
  updateFeedImageDetail: async (req, res) => {
    const uid = req.uid;
    const feedImage_id = req.params.feed_id;
    const { content, privacy_setting } = req.body;

    await Image.updateFeedImageDetail(uid, feedImage_id, content, privacy_setting);

    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS));
  }
};
