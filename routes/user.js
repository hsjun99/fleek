var express = require('express');
var router = express.Router();

const AuthUser = require('../middlewares/authUser');
const AuthUserWear = require('../middlewares/authUserWear');
const userController = require('../controllers/userController');
const socialController = require('../controllers/socialController');
const userHistoryController = require('../controllers/userHistoryController');
const { Auth } = require('../modules/auth/firebaseAuth');

router.get('/profile', AuthUser.checkToken, userController.getProfile);

router.get('/profile/wear', AuthUserWear.checkUid, userController.getProfileWear);

router.get('/setting', AuthUser.checkToken, userController.getSetting);

router.get('/setting/wear', AuthUserWear.checkUid, userController.getSetting);

router.put('/setting', AuthUser.checkToken, userController.updateSetting);

router.post('/follow/:follow_uid', AuthUser.checkToken, userController.follow);

router.delete('/unfollow/:unfollow_uid', AuthUser.checkToken, userController.unfollow);

router.put('/name/:new_name', AuthUser.checkToken, userController.updateName);

router.put('/height&weight/:height/:weight', AuthUser.checkToken, userController.updateHeightWeight);

router.post('/bodyinfo', AuthUser.checkToken, userController.updateBodyInfo);

router.put('/bodyinfo/:body_info_id', AuthUser.checkToken, userController.updateBodyInfoRecord);

router.delete('/bodyinfo/:body_info_id', AuthUser.checkToken, userController.deleteBodyInfo);

router.post('/suggestion', AuthUser.checkToken, userController.postSuggestion);

router.get('/fleekdata/self', AuthUser.checkToken, userController.getSelfFleekData);

router.get('/fleekdata/:other_uid', AuthUser.checkToken, userController.getOthersFleekData);

router.post('/privacysetting/:privacy_mode', AuthUser.checkToken, userController.updatePrivacySetting);

router.delete('/unregister', AuthUser.checkToken, userController.unregister);

router.get('/workoutmemo/:workout_id', AuthUser.checkToken, userController.getUserWorkoutMemo);

router.post('/workoutmemo/:workout_id', AuthUser.checkToken, userController.postUserWorkoutMemo);

router.put('/workoutmemo/:userWorkoutMemo_id', AuthUser.checkToken, userController.updateUserWorkoutMemo);

router.delete('/workoutmemo/:userWorkoutMemo_id', AuthUser.checkToken, userController.deleteUserWorkoutMemo);

router.get('/userhistory', AuthUser.checkToken, userHistoryController.getUserHistoryData);

router.put('/sns/instagram/:instagram_id', AuthUser.checkToken, userController.updateInstagramId);

router.delete('/sns/instagram', AuthUser.checkToken, userController.deleteInstagramId);

//router.post('/fcmtoken/:fcm_token', AuthUser.checkToken, userController.initializeFcmToken);



// var admin = require('firebase-admin');
// router.get('/temp/sendnoti', AuthUser.checkToken, async(req, res)=> {
//     await admin.messaging().sendToDevice(
//     ['ejwscaBfSaqaweUudf7Toy:APA91bGdL_p2C9oOyp4oBQe8_5FoX66efdaGb95AmJU9Wiq0zmtGcxWQDWtCJKBlpcV2qC9pDVbgdk1wHOoZXPpuw23nrDwmq2tY4W0YsGq4xc8S5VCWYxBJBpA47fb2scmoTQIfYw_B',
//     'dkDSd0zLREB-kAvzdbE-gn:APA91bE_oA2FCB48JP5TI1QSchIUayoSIThkEubxCuOKqQNMfGC-4nSTjjk4viAs3vG7NRhsXIGfIeTVHuuT8NWRfwpswM41_HIT9PE0Mnhc6XT5zFJGVx3DbKi0q5ACyCokS0lr7tVo'], // ['token_1', 'token_2', ...]
//     {
//         notification: {
//             title: '$FooCorp up 1.43% on the day',
//             body: '$FooCorp gained 11.80 points to close at 835.67, up 1.43% on the day.'
//         }
//     },
//     {
//         // Required for background/quit data-only messages on iOS
//         contentAvailable: true,
//         // Required for background/quit data-only messages on Android
//         priority: "high",
//     }
//     );
//     await admin.messaging().sendToDevice(
//     ['ejwscaBfSaqaweUudf7Toy:APA91bGdL_p2C9oOyp4oBQe8_5FoX66efdaGb95AmJU9Wiq0zmtGcxWQDWtCJKBlpcV2qC9pDVbgdk1wHOoZXPpuw23nrDwmq2tY4W0YsGq4xc8S5VCWYxBJBpA47fb2scmoTQIfYw_B',
//     'dkDSd0zLREB-kAvzdbE-gn:APA91bE_oA2FCB48JP5TI1QSchIUayoSIThkEubxCuOKqQNMfGC-4nSTjjk4viAs3vG7NRhsXIGfIeTVHuuT8NWRfwpswM41_HIT9PE0Mnhc6XT5zFJGVx3DbKi0q5ACyCokS0lr7tVo'], // ['token_1', 'token_2', ...]
//     {
//         data: {
//             title: '$FooCorp up 1.43% on the day',
//             body: '$FooCorp gained 11.80 points to close at 835.67, up 1.43% on the day.'
//         }
//     },
//     {
//         // Required for background/quit data-only messages on iOS
//         contentAvailable: true,
//         // Required for background/quit data-only messages on Android
//         priority: "high",
//     }
//     );
//     res.send("SUCCESS");
// })


module.exports = router;
