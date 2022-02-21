let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

const s3 = require('../modules/auth/awsS3');

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
    }
}