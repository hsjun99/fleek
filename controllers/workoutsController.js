let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let User = require("../models/fleekUser");
let Workout = require("../models/fleekWorkout")
let WorkoutEquation = require("../models/workoutEquation")

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');


//plan
const plan = {
  "sets": 5,
  "reps": 12,
  "weight": 100
}

//detailplan
const detail_plan = [
  {
      "reps": 12,
      "weight": 100
  },
  {
      "reps": 12,
      "weight": 110
  },
  {
      "reps": 12,
      "weight": 100
  }
]

module.exports = {
    geteach: async (req, res) => {
        const id = req.params.id;
        const uid = req.uid;
        const {sex, age, height, weight} = await User.getProfile(uid);
        const ageGroup = await ageGroupClassifier(age);
        const weightGroup = await weightGroupClassifier(weight, sex);
        // NULL Value Error Handling
        if (!id) {
          res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
          return;
        }
        // Wrong Index
        if (!(await Workout.checkWorkout(id))) {
          res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.READ_WORKOUT_FAIL));
          return;
        }
        const data = await Workout.getWorkoutById(id, sex, ageGroup, weightGroup);
        const recentRecords = await Workout.getWorkoutRecordById(id, uid);
        res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUT_SUCCESS, {basic_info: {workout_id: Number(id), english: data.english, korean: data.korean, category: data.category, muscle_primary: data.muscle_p, muscle_secondary: [data.muscle_s1, data.muscle_s2, data.muscle_s3, data.muscle_s4, data.muscle_s5, data.muscle_s6], equipment: data.equipment, record_type: data.record_type}, equation: {inclination: data.inclination, intercept: data.intercept}, recent_records: recentRecords, plan: plan, detail_plan: detail_plan}));
    },
    getall: async (req, res) => {
      await Workout.getUsersWorkoutRecordById(181);
      /*
      const ids = [1, 2, 3, 4];
      const uid = req.uid;
      const {sex, age, height, weight} = await User.getProfile(uid);
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
      console.log(checkWorkoutIndex);
      if (!checkWorkoutIndex.reduce((a, b)=>a*b)){
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.READ_WORKOUT_FAIL));
        return;
      }
      const result = await Promise.all(ids.map(async id => {
        const data = await Workout.getWorkoutById(id, sex, ageGroup, weightGroup);
        const recentRecords = await Workout.getWorkoutRecordById(id, uid);
        return {data, recentRecords};
      }));
      console.log(result);
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUT_SUCCESS, {basic_info: {workout_id: Number(id), english: data.english, korean: data.korean, category: data.category, muscle_primary: data.muscle_p, muscle_secondary: [data.muscle_s1, data.muscle_s2, data.muscle_s3, data.muscle_s4, data.muscle_s5, data.muscle_s6], equipment: data.equipment, record_type: data.record_type}, equation: {inclination: data.inclination, intercept: data.intercept}, recent_records: recentRecords, plan: plan, detail_plan: detail_plan}));
    */
    }
}