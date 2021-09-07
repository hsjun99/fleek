let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let User = require("../models/fleekUser");
let Workout = require("../models/fleekWorkout")
let WorkoutEquation = require("../models/workoutEquation");
let WorkoutAbility = require('../models/fleekWorkoutAbility');

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');

const defaultIntensity = require('../modules/algorithm/defaultIntensity');
const fleekIntensity = require('../modules/algorithm/fleekIntensity');

const asyncForEach = require('../modules/function/asyncForEach');
const roundNumber = require('../modules/function/roundNumber');

const jsonFormatter = require('../modules/function/jsonFormatter');


const getWorkoutInfo = require('../modules/functionFleek/getWorkoutInfo');

module.exports = {
  /*
    getOthersWorkoutData: async(req, res) => {
      const other_uid = req.params.other_uid;

      const profileResult = await User.getProfile(other_uid);
      if (profileResult == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
      }
      const {sex, age, height, weight, percentage} = profileResult;
      const ageGroup = await ageGroupClassifier(age); // Conversion to group
      const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to group
      const result = await Workout.getWorkoutTable(other_uid, sex, ageGroup, weightGroup);
      if (result == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
      }
      const data = await Promise.all(result.map(async rowdata => {
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
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, data));
    },*/
    addCustomWorkout: async(req, res) => {
      const uid = req.uid;
      const {workout_name, muscle_primary, muscle_secondary, equipment, record_type, multiplier, video_url, video_url_substitute} = req.body;

      const result = await Workout.postCustomWorkout(uid, workout_name, muscle_primary, muscle_secondary, equipment, record_type, multiplier, video_url, video_url_substitute);
      
      if (result == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
      }

      const default_plan = await defaultIntensity(null, null, 0, 0);

      const custom_workout_info =  {
        workout_id: result,
        english: 'custom',
        korean: workout_name,
        category: null,
        muscle_primary: muscle_primary,
        muscle_secondary: [muscle_secondary, -1, -1, -1, -1, -1],
        equipment: equipment,
        record_type: record_type,
        multiplier: multiplier,
        min_step: 0,
        tier: null,
        is_custom: 1,
        video_url: video_url,
        video_url_substitute: video_url_substitute,
        reference_num: null,
        equation: {
            inclination: null,
            intercept: null
        },
        recent_records: [],
        rest_time: 0,
        workout_ability: [],
        plan: default_plan.plan,
        detail_plan: default_plan.detail_plan
      }
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, {custom_workout_info: custom_workout_info}));
    },
    getWorkoutTableData: async (req, res) => {
      const uid = req.uid;
      // Get Profile
      const profileResult = await User.getProfile(uid);
      if (profileResult == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
      }
      const {sex, age, height, weight, percentage} = profileResult;
      const ageGroup = await ageGroupClassifier(age); // Conversion to group
      const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to group

      const result = await Workout.getWorkoutTable(uid, sex, ageGroup, weightGroup);
      if (result == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
      }
      const data = await Promise.all(result.map(async rowdata => {
        const temp = await Promise.all([Workout.getWorkoutRecordById(rowdata.workout_id, uid), WorkoutAbility.getAllWorkoutAbilityHistory(uid, rowdata.workout_id), defaultIntensity(rowdata.inclination, rowdata.intercept, percentage, rowdata.min_step)]);
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
          equation: {
              inclination: rowdata.inclination,
              intercept: rowdata.intercept
          },
          recent_records: temp[0].recentRecords,
          rest_time: temp[0].rest_time,
          workout_ability: temp[1],
          plan: temp[2].plan,
          detail_plan: temp[2].detail_plan
        }
        return info;
      }))
      /*
      await Promise.all(data.map(async rowdata => {
        const index = rowdata.index;
        const workout_id = rowdata.workout_id;
        const result = await Promise.all([await Workout.getWorkoutRecordById(workout_id, uid), await WorkoutAbility.getAllWorkoutAbilityHistory(uid, workout_id), await defaultIntensity(rowdata.equation.inclination, rowdata.equation.intercept, percentage, rowdata.min_step)]);
        data[index].recent_records = result[0].recentRecords;
        data[index].rest_time = result[0].rest_time;
        data[index].workout_ability = result[1];
        data[index].plan = result[2].plan;
        data[index].detail_plan = result[2].detail_plan;
      }))*/
      // Success
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, data));
    },
    getEachUsersRecords: async (req, res) => {
      const id = req.params.id;
      const uid = req.uid;
      const usersRecords = await Workout.getUsersWorkoutRecordById(id, uid);
      const followsRecords = await Workout.getFollowsWorkoutRecordById(id, uid);

      // DB Error Handling
      if (usersRecords == -1 || followsRecords == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
      }

      // Success
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, jsonFormatter.getOthersRecords(usersRecords, followsRecords)));
    },
    getall: async (req, res) => {
      const uid = req.uid;
      let ids = req.query.ids;
      if (typeof req.query.ids == "string") ids = [ids]; // One element case handling -> Array

      // Get Profile
      const profileResult = await User.getProfile(uid);
      if (profileResult == -1){
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
      }
      const {sex, age, height, weight, percentage} = profileResult;
      const ageGroup = await ageGroupClassifier(age); // Conversion to group
      const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to group

      // NULL Value Error Handling
      if (ids.length == 0) {
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
        return;
      }

      // Wrong Index Handling
      const checkWorkoutIndex = await Promise.all(ids.map(async (id) => {
        const result = await Workout.checkWorkout(id);
        // DB Error Handling
        if (result == -1) {
          res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
        }
        return result;
      }));
      if (!checkWorkoutIndex.reduce((a, b)=>a*b)){
        res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
        return;
      }

      // Get Workout Info
      const result = await Promise.all(ids.map(async id => {
        const data = await Workout.getWorkoutById(id, sex, ageGroup, weightGroup);
        const {recentRecords, rest_time} = await Workout.getWorkoutRecordById(id, uid);
        const updateResultPopularity = await Workout.updateWorkoutPopularity(id);
        const updateResultAddNum = await Workout.updateUserWorkoutHistoryAdd(uid, id);
        const workout_ability = await WorkoutAbility.getAllWorkoutAbilityHistory(uid, id);
        const {plan, detail_plan} = await defaultIntensity(data.inclination, data.intercept, percentage, data.min_step);
        // DB Error Handling
        if (data == -1 || recentRecords == -1 || updateResultPopularity == -1 || workout_ability == -1 || updateResultAddNum == -1) {
          return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
        }
        return jsonFormatter.getWorkout(id, data.video_url, data.english, data.korean, data.category, data.muscle_p, [data.muscle_s1, data.muscle_s2, data.muscle_s3, data.muscle_s4, data.muscle_s5, data.muscle_s6], data.equipment, data.record_type, rest_time, data.inclination, data.intercept, recentRecords, workout_ability, plan, detail_plan);
      }));

      // Success
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUT_SUCCESS, result));
    },
    getAlgoWorkoutPlan: async (req, res) => {
      const uid = req.uid;
      const workout_id = req.params.workout_id;
      const algoName = req.params.name;
      const intensity = req.params.intensity;

      // Get Max 1RM
      const max_one_rm = await WorkoutAbility.getWorkoutMaxOneRm(uid, workout_id);
      
      // DB Error Handling
      if (max_one_rm == -1) {
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUTALGORITHM_FAIL));
      }
      
      const workoutData = await Workout.getWorkoutInfo(workout_id);

      if (workoutData == -1) {
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUTALGORITHM_FAIL));
      }
      const {min_step} = workoutData;

      // Workout Plan Restructure in JSON
      const restructure = async() => {
        let data = [];
        let index = 0;
        await asyncForEach(fleekIntensity[algoName][intensity].weights, async(weight_param) => {
          data.push({reps: fleekIntensity[algoName][intensity].reps[index++], weight: roundNumber.roundNum(weight_param * max_one_rm, min_step)});
        })
        return data;
      }
      const data = await restructure();

      // Success
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUTALGORITHM_SUCCESS, data));
    },
    getWorkoutsPreviewData: async (req, res) => {
      const uid = req.uid;
      const workout_id = req.params.workout_id;

      const data = await Workout.getWorkoutsPreviewData(uid, workout_id);

      // DB Error Handling
      if (data == -1) {
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUTALGORITHM_FAIL));
      }

      // Success
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUTALGORITHM_SUCCESS, data));
   
    },
    getSubstituteWorkout: async (req, res) => {
      const uid = req.uid;
      const workout_id = req.params.workout_id;

      const data = await Workout.getSubstituteWorkout(workout_id);

      //DB Error Handling
      if (data == -1) {
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUTALGORITHM_FAIL));
      }

      // Success
      res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUTALGORITHM_SUCCESS, data));
    }
    /*
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
    },*/
}