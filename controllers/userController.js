let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let User = require("../models/fleekUser");
let Template = require("../models/fleekTemplate");
let Workout = require("../models/fleekWorkout");
let Dashboard = require("../models/fleekDashboard");
let WorkoutAbility = require('../models/fleekWorkoutAbility');

const defaultIntensity = require('../modules/algorithm/defaultIntensity');

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');

const code_follow = {
    success: 0,
    invalid_user: 1,
    already_follow: 2,
    self: 3
}

module.exports = {
    unregister: async(req, res) => {
        const uid = req.uid;

        const result = await User.unregister(uid);

        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS));

    },
    follow: async(req, res) => {
        const uid = req.uid;
        const follow_uid = req.params.follow_uid;
        // Name -> Uid Conversion
        //const follow_result = await User.nameToUid(follow_name);
        // DB Error Handling
        /*
        if (follow_result == -1){
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }
*/
        //***********Exception Handling***********
        // (1) Invalid User
        if (!follow_uid){
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER, {code: code_follow.invalid_user}));
        }
        // (2) Self Follow
        if (uid == follow_uid) {
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {code: code_follow.self}));
        }
        // Check Current Following Status
        const flag = await User.checkFollow(uid, follow_uid);
        // DB Error Handling
        if (flag == -1){
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }
        // (3) Already Following
        if (flag){
            return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {code: code_follow.already_follow}));
        }
        //****************************************
        // Do Follow
        const result = await User.addFollow(uid, follow_uid);
        // DB Error Handling
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS, {code: code_follow.success}));

        await User.addFollowFirebase(uid, follow_uid);
    },
    unfollow: async(req, res) => {
        const uid = req.uid;
        const unfollow_uid = req.params.unfollow_uid;
        const result = await User.deleteFollow(uid, unfollow_uid);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS));
    },
    getAllFollowing: async(req, res) => {
        const uid = req.uid;
        const following = await User.getFollows(uid);

        // DB Error Handling
        if (following == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, following));
    },
    getProfile: async(req, res) => {
        const uid = req.uid;
        
        const profileData = await User.getProfile(uid);

        // DB Error Handling
        if (profileData == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, {name: profileData.name, age: profileData.age, height: profileData.height, weight: profileData.weight, skeletal_muscle_mass: profileData.skeletal_muscle_mass, body_fat_ratio: profileData.body_fat_ratio, privacy_setting: profileData.privacy_setting, body_info_history: profileData.body_info_history}));
    },
    updateName: async(req, res) => {
        const uid = req.uid;
        const newName = req.params.new_name;

        const unique = await User.checkName(newName);
        if (unique == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        } else if (unique == false) {
            return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, resMessage.READ_FOLLOWING_FAIL));
        }
        const result = await User.updateName(uid, newName);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
    },
    updateHeightWeight: async(req, res) => {
        const uid = req.uid;
        const height = req.params.height;
        const weight = req.params.weight;

        const result = await User.updateHeightWeight(uid, height, weight);
        if (result== -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));

    },
    updateBodyInfo: async(req, res) => {
        const uid = req.uid;
        const {height, weight, skeletal_muscle_mass, body_fat_ratio} = req.body;
        const result = await User.updateBodyInfo(uid, height, weight, skeletal_muscle_mass, body_fat_ratio);

        if (result== -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));

    },
    updateBodyInfoRecord: async(req, res) => {
        const uid = req.uid;
        const userBodyInfoTracking_id = req.params.body_info_id;
        const {height, weight, skeletal_muscle_mass, body_fat_ratio} = req.body;
        const result = await User.updateBodyInfoRecord(uid, userBodyInfoTracking_id, height, weight, skeletal_muscle_mass, body_fat_ratio);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
    },
    deleteBodyInfo: async(req, res) => {
        const uid = req.uid;
        const userBodyInfoTracking_id = req.params.body_info_id;
        const result = await User.deleteBodyInfo(uid, userBodyInfoTracking_id);
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
    },
    postSuggestion: async(req, res) => {
        const uid = req.uid;
        const content = req.body.data;

        const result = await User.postSuggestion(uid, content);

        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
    },
    getSelfFleekData: async(req, res) => {
        const uid = req.uid;

        let data = {uid: uid, template: null, calendar_data: null, dashboard:{record:null, favorite_workouts:null}};
        [data.template, data.calendar_data, data.dashboard.record, data.dashboard.favorite_workouts] = await Promise.all([Template.getUserTemplate(uid), Workout.getCalendarData(uid), Dashboard.getDashboardRecords(uid), Dashboard.getFavoriteWorkouts(uid)]);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    },
    getOthersFleekData: async(req, res) => {
        const uid = req.uid;
        const other_uid = req.params.other_uid;
        const profileResult = await User.getProfile(other_uid);
        if (profileResult == -1){
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
        }
        const {sex, age, height, weight, percentage} = profileResult;
        const ageGroup = await ageGroupClassifier(age); // Conversion to group
        const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to group

        const getOthersWorkoutData = async() => {
            const result = await Workout.getWorkoutTable(other_uid, sex, ageGroup, weightGroup);
            if (result == -1){
                return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
            }
            const workout_data = await Promise.all(result.map(async rowdata => {
                const temp = await Promise.all([Workout.getWorkoutRecordById(rowdata.workout_id, other_uid), WorkoutAbility.getAllWorkoutAbilityHistory(other_uid, rowdata.workout_id)]);
                const info =  {
                    workout_id: Number(rowdata.workout_id),
                    equation: {
                        inclination: rowdata.inclination,
                        intercept: rowdata.intercept
                    },
                    recent_records: temp[0].recentRecords,
                    workout_ability: temp[1]
                }
                return info;
            }));
            return workout_data;
        }
        const getOthersCustomWorkout = async() => {
            const result = await Workout.getOthersCustomWorkouts(other_uid, sex, ageGroup, weightGroup);
            if (result == -1){
                return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
            }
            const data = await Promise.all(result.map(async rowdata => {
                const workoutRecord = await Workout.getWorkoutRecordById(rowdata.workout_id, uid);
                const info =  {
                  workout_id: Number(rowdata.workout_id),
                  english: rowdata.english,
                  korean: rowdata.korean,
                  category: rowdata.category,
                  muscle_primary: rowdata.muscle_p,
                  muscle_secondary: [rowdata.muscle_s1, rowdata.muscle_s2, rowdata.muscle_s3, rowdata.muscle_s4, rowdata.muscle_s5, rowdata.muscle_s6],
                  equipment: rowdata.equipment,
                  record_type: rowdata.record_type,
                  multiplier: rowdata.multiplier,
                  min_step: rowdata.min_step,
                  tier: rowdata.tier,
                  is_custom: rowdata.is_custom,
                  video_url: rowdata.video_url,
                  video_url_substitute: rowdata.video_url_substitute,
                  reference_num: rowdata.reference_num,
                  rest_time: workoutRecord.rest_time,
                  //workout_ability: temp[1],
                  //plan: temp[2].plan,
                  //detail_plan: temp[2].detail_plan
                }
                return info;
            }))
            return data;
        }

        let data = {uid: other_uid, template: null, calendar_data: null, dashboard:{record:null, favorite_workouts:null}, workout_data:null, extra_custom_workout_table:null};
        [data.template, data.calendar_data, data.dashboard.record, data.dashboard.favorite_workouts, data.workout_data, data.extra_custom_workout_table] = await Promise.all([Template.getUserTemplate(other_uid), Workout.getCalendarData(other_uid), Dashboard.getDashboardRecords(other_uid), Dashboard.getFavoriteWorkouts(other_uid), getOthersWorkoutData(), getOthersCustomWorkout()]);
        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
    },
    updatePrivacySetting: async(req, res) => {
        const uid = req.uid;
        const privacyMode = req.params.privacy_mode;

        const result = await User.updatePrivacySetting(uid, privacyMode);
        
        if (result == -1) {
            return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
        }

        // Success
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
    }
}