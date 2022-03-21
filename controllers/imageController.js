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
    },
    getPresignedUrlFeed: async (req, res) => {
        // const uid = req.uid;
        const uid = 'S27Sma9UBkSTgN6mSXXhPm31CG52';
        const filename = `feed_${new Date().getTime()}.png`;
        const params = {
            Bucket: "fleek-prod-bucket",
            Key: `feed/origin/${uid}/${filename}`,
            Expires: 60,
            ContentType: "application/octet-stream"
        };

        const signedUrlPut = await s3.getSignedUrlPromise("putObject", params);

        // await Image.updateProfileUrl(uid, filename);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS, signedUrlPut));
    },
    postFeedImage: async (req, res) => {
        // const uid = req.uid;
        const uid = 'S27Sma9UBkSTgN6mSXXhPm31CG52';
        const feed_url = req.params.feed_url;

        await Image.postFeedImage(uid, feed_url);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS));
    },
    deleteFeed: async (req, res) => {
        const uid = req.uid;
        await Image.deleteProfileUrl(uid);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS));
    },
    // getPresignedUrlCustomWorkout: async (req, res) => {
    //     const uid = req.uid;
    //     const workout_id = req.params.workout_id;
    //     const filename = `customworkout_${new Date().getTime()}.png`;
    //     const params = {
    //         Bucket: "fleek-prod-bucket",
    //         Key: `customworkout/${workout_id}/origin/${filename}`,
    //         Expires: 60 * 60 * 3,
    //         ContentType: "application/octet-stream"
    //     };

    //     const signedUrlPut = await s3.getSignedUrlPromise("putObject", params);

    //     await Image.updateCustomImageUrl(uid, workout_id, filename);
    //     // Success
    //     res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS, signedUrlPut));
    // },
    // deleteCustomWorkout: async (req, res) => {
    //     const uid = req.uid;
    //     const workout_id = req.params.workout_id;
    //     await Image.deleteCustomImageUrl(uid, workout_id);
    //     res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_DASHBOARD_SUCCESS));
    // }
}