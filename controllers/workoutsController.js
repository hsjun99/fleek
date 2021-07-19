let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let User = require("../models/fleekUser");
let Workout = require("../models/fleekWorkout")
let WorkoutEquation = require("../models/workoutEquation")

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');

const defaultIntensity = require('../modules/algorithm/defaultIntensity');

const asyncForEach = require('../modules/function/asyncForEach');

module.exports = {
    getEach: async (req, res) => {
        const id = req.params.id;
        const uid = req.uid;
        const profileResult = await User.getProfile(uid);
        if (profileResult == -1){
          return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        const {sex, age, height, weight} = profileResult;
        const ageGroup = await ageGroupClassifier(age);
        const weightGroup = await weightGroupClassifier(weight, sex);
        // NULL Value Error Handling
        if (!id) {
          return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
        }
        // Wrong Index
        const flag = await Workout.checkWorkout(id);
        if (flag == -1) {
          return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        if (!(flag)) {
          return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.READ_WORKOUT_FAIL));
        }
        const data = await Workout.getWorkoutById(id, sex, ageGroup, weightGroup);
        const recentRecords = await Workout.getWorkoutRecordById(id, uid);
        if (data == -1 || recentRecords == -1) {
          return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        //console.log(data);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUT_SUCCESS, {basic_info: {workout_id: Number(id), english: data.english, korean: data.korean, category: data.category, muscle_primary: data.muscle_p, muscle_secondary: [data.muscle_s1, data.muscle_s2, data.muscle_s3, data.muscle_s4, data.muscle_s5, data.muscle_s6], equipment: data.equipment, record_type: data.record_type}, equation: {inclination: data.inclination, intercept: data.intercept}, recent_records: recentRecords, plan: plan, detail_plan: detail_plan}));
    },
    getEachUsersRecords: async (req, res) => {
      const id = req.params.id;
      const uid = req.uid;
      const usersRecords = await Workout.getUsersWorkoutRecordById(id, uid);
      const followsRecords = await Workout.getFollowsWorkoutRecordById(id, uid);
      if (usersRecords == -1 || followsRecords == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
      }
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUT_SUCCESS, {users_records: usersRecords, friends_records: followsRecords}));
    },
    getall: async (req, res) => {
      let ids = req.query.ids;
      if (typeof req.query.ids == "string") ids = [ids];
      const uid = req.uid;
      const profileResult = await User.getProfile(uid);
      if (profileResult == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
      }
      const {sex, age, height, weight} = profileResult;
      const ageGroup = await ageGroupClassifier(age);
      const weightGroup = await weightGroupClassifier(weight, sex);
      // NULL Value Error Handling
      if (ids.length == 0) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
        return;
      }
      // Wrong Index
      const checkWorkoutIndex = await Promise.all(ids.map(async (id) => {
        const result = await Workout.checkWorkout(id);
        if (result == -1) {
          res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        return result;
      }));
      if (!checkWorkoutIndex.reduce((a, b)=>a*b)){
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.READ_WORKOUT_FAIL));
        return;
      }
      const result = await Promise.all(ids.map(async id => {
        const data = await Workout.getWorkoutById(id, sex, ageGroup, weightGroup);
        const recentRecords = await Workout.getWorkoutRecordById(id, uid);
        const updateResult = await Workout.updateWorkoutPopularity(id);
        if (data == -1 || recentRecords == -1 || updateResult == -1) {
          return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.DB_ERROR));
        }
        
        const {plan, detail_plan} = await defaultIntensity(data.inclination, data.intercept);
        return {basic_info: {workout_id: Number(id), english: data.english, korean: data.korean, category: data.category, muscle_primary: data.muscle_p, muscle_secondary: [data.muscle_s1, data.muscle_s2, data.muscle_s3, data.muscle_s4, data.muscle_s5, data.muscle_s6], equipment: data.equipment, record_type: data.record_type}, equation: {inclination: data.inclination, intercept: data.intercept}, recent_records: recentRecords, plan: plan, detail_plan: detail_plan};
      }));
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUT_SUCCESS, result));
    }
}