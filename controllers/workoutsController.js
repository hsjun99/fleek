let util = require('../modules/util');
let statusCode = require('../modules/statusCode');
let resMessage = require('../modules/responseMessage');

let User = require("../models/fleekUser");
let Workout = require("../models/fleekWorkout")
let WorkoutEquation = require("../models/workoutEquation");
let WorkoutAbility = require('../models/fleekWorkoutAbility');
let Template = require('../models/fleekTemplate');

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');

const defaultIntensity = require('../modules/algorithm/defaultIntensity');
const fleekIntensity = require('../modules/algorithm/fleekIntensity');
const fleekIntensityRecentRecord = require('../modules/algorithm/fleekIntensityRecentRecord');

const asyncForEach = require('../modules/function/asyncForEach');
const roundNumber = require('../modules/function/roundNumber');

const jsonFormatter = require('../modules/function/jsonFormatter');

const getUserInfo = require('../modules/functionFleek/getUserInfo');
const getRpeByRepsWeight = require('../modules/functionFleek/getRpeByRepsWeight');

const aboutLanguage = require('../modules/function/aboutLanguage');


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
  addCustomWorkout: async (req, res) => {
    const uid = req.uid;
    const { workout_name, muscle_primary, muscle_secondary, equipment, record_type, multiplier, video_url, video_url_substitute, reference_num } = req.body;

    if (muscle_primary == null) muscle_primary = -1;
    if (muscle_secondary[0] == null) muscle_secondary[0] = -1;

    const result = await Workout.postCustomWorkout(uid, workout_name, muscle_primary, muscle_secondary, equipment, record_type, multiplier, video_url, video_url_substitute, reference_num);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
    }

    const default_plan = await defaultIntensity(null, null, 0, 0);

    const custom_workout_info = {
      workout_id: result,
      name: workout_name,
      english: 'custom',
      korean: workout_name,
      category: null,
      muscle_primary: muscle_primary,
      muscle_secondary: [muscle_secondary[0], -1, -1, -1, -1, -1],
      equipment: equipment,
      record_type: record_type,
      multiplier: multiplier,
      min_step: 0,
      tier: null,
      is_custom: 1,
      video_url: video_url,
      video_url_substitute: video_url_substitute,
      reference_num: reference_num,
      equation: {
        inclination: null,
        intercept: null
      },
      rest_time: 0,
      plan: default_plan.plan,
      detail_plan: default_plan.detail_plan
    }
    let update_time = Math.floor(Date.now() / 1000);

    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, [custom_workout_info], update_time));
    await Workout.postWorkoutInfoSyncFirebase(uid, update_time);
  },
  updateCustomWorkout: async (req, res) => {
    const uid = req.uid;
    const { workout_id, workout_name, muscle_primary, muscle_secondary, equipment, record_type, multiplier, video_url, video_url_substitute, reference_num } = req.body;

    if (muscle_primary == null) muscle_primary = -1;
    if (muscle_secondary[0] == null) muscle_secondary[0] = -1;

    const result = await Workout.updateCustomWorkout(uid, workout_id, workout_name, muscle_primary, muscle_secondary, equipment, record_type, multiplier, video_url, video_url_substitute, reference_num);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
    }

    const default_plan = await defaultIntensity(null, null, 0, 0);

    const custom_workout_info = {
      workout_id: workout_id,
      name: workout_name,
      english: 'custom',
      korean: workout_name,
      category: null,
      muscle_primary: muscle_primary,
      muscle_secondary: [muscle_secondary[0], -1, -1, -1, -1, -1],
      equipment: equipment,
      record_type: record_type,
      multiplier: multiplier,
      min_step: 0,
      tier: null,
      is_custom: 1,
      video_url: video_url,
      video_url_substitute: video_url_substitute,
      reference_num: reference_num,
      equation: {
        inclination: null,
        intercept: null
      },
      rest_time: 0,
      plan: default_plan.plan,
      detail_plan: default_plan.detail_plan
    }
    let update_time = Math.floor(Date.now() / 1000);
    console.log(JSON.stringify(custom_workout_info))
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, [custom_workout_info], update_time));
    await Workout.postWorkoutInfoSyncFirebase(uid, update_time);
  },
  deleteCustomWorkout: async (req, res) => {
    const uid = req.uid;
    const workout_id = req.params.workout_id;
    const template_data = await Template.getUserTemplate(uid);
    const result = await Workout.deleteCustomWorkout(uid, workout_id, template_data);
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
    }
    let update_time = Math.floor(Date.now() / 1000);

    await Template.postTemplateSyncFirebase(uid, update_time); // the deleted custom workout can be included in the existing template -> therefore, need update

    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, [{ workout_id: Number(workout_id) }], update_time));

    await Workout.postWorkoutInfoSyncFirebase(uid, update_time);

  },
  // getWorkoutAbilityAndRecentRecords: async(req, res) => {
  //   const uid = req.uid;
  //   let workout_ids = req.query.wids;
  //   if (typeof req.query.wids == "string") workout_ids = [workout_ids];
  //   const data = await Promise.all(workout_ids.map(async(workout_id) => {
  //     const result = await Promise.all([await Workout.getWorkoutRecordById(workout_id, uid), await WorkoutAbility.getAllWorkoutAbilityHistory(uid, workout_id)]);
  //     return {
  //       workout_id: Number(workout_id),
  //       recent_records: result[0].recentRecords,
  //       workout_ability: result[1]
  //     };
  //   }));
  //   res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, data));
  // },
  getWorkoutTableDataOptimize: async (req, res) => {
    const uid = req.uid;
    const langCode = req.lang_code;
    // Get Profile
    const profileResult = await User.getProfile(uid);
    if (profileResult == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
    }
    const { sex, age, weight, percentage } = profileResult;
    const [ageGroup, weightGroup] = await Promise.all([await ageGroupClassifier(age), await weightGroupClassifier(weight, sex)])
    //const ageGroup = await ageGroupClassifier(age); // Conversion to group
    //const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to group

    //let start = new Date();
    //const result = await Workout.getWorkoutTable(uid, sex, ageGroup, weightGroup); // original version
    // const result = await Workout.getWorkoutTablePure(uid); //optimized version
    //let end = new Date();
    //console.log(end-start)
    let [result, workout_equation_result, youtube_info_result] = await Promise.all([await Workout.getWorkoutTablePure(uid), await WorkoutEquation.getEquationTotal(sex, ageGroup, weightGroup), await Workout.getWorkoutYoutubeVideoTotal(langCode)]);
    let data = await Promise.all(result.map(async (rowdata) => {
      const default_intensity_result = await defaultIntensity(workout_equation_result[rowdata.workout_id] != undefined ? workout_equation_result[rowdata.workout_id].inclination : null, workout_equation_result[rowdata.workout_id] != undefined ? workout_equation_result[rowdata.workout_id].intercept : null, percentage, rowdata.min_step);
      if (rowdata.muscle_p == null) rowdata.muscle_p = -1;
      if (rowdata.muscle_s1 == null) rowdata.muscle_s1 = -1;
      rowdata = await aboutLanguage.rowdataWorkoutTable(langCode, rowdata);
      if (rowdata.is_custom == 1) rowdata.name = rowdata.korean;
      let info = {
        workout_id: Number(rowdata.workout_id),
        name: rowdata.name,
        english: rowdata.english,
        korean: rowdata.korean,
        category: rowdata.category,
        muscle_primary: rowdata.muscle_p,
        muscle_secondary: [rowdata.muscle_s1, rowdata.muscle_s2, rowdata.muscle_s3, rowdata.muscle_s4, rowdata.muscle_s5, rowdata.muscle_s6],
        equipment: rowdata.equipment,
        record_type: rowdata.record_type,
        multiplier: rowdata.multiplier,
        min_step: rowdata.min_step,
        is_custom: rowdata.is_custom,
        is_deleted: rowdata.is_deleted != undefined ? rowdata.is_deleted : null,
        video_url: rowdata.video_url,
        video_url_substitute: rowdata.video_url_substitute,
        reference_num: rowdata.reference_num,
        equation: workout_equation_result[rowdata.workout_id] != undefined ?
          {
            inclination: workout_equation_result[rowdata.workout_id].inclination,
            intercept: workout_equation_result[rowdata.workout_id].intercept
          }
          :
          {
            inclination: null,
            intercept: null
          }
        ,
        rest_time: 0,
        detail_plan: default_intensity_result.detail_plan,
        youtube_info: youtube_info_result[rowdata.workout_id] != undefined ? youtube_info_result[rowdata.workout_id] : []
      }
      if (info.workout_id == 136) info.record_type = 5;
      if (info.workout_id == 132) info.record_type = 6;
      return info;
    }));
    let update_time = Math.floor(Date.now() / 1000);
    // console.log(JSON.stringify(data_slice));
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, data, update_time));
  },
  /*
  getWorkoutTableData: async (req, res) => {
    const uid = req.uid;
    // Get Profile
    const profileResult = await User.getProfile(uid);
    if (profileResult == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
    }
    const { sex, age, weight, percentage } = profileResult;
    const ageGroup = await ageGroupClassifier(age); // Conversion to group
    const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to group

    const result = await Workout.getWorkoutTable(uid, sex, ageGroup, weightGroup);
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
    }
    const data = await Promise.all(result.map(async rowdata => {
      const temp = await Promise.all([Workout.getWorkoutRecordById(rowdata.workout_id, uid), WorkoutAbility.getAllWorkoutAbilityHistory(uid, rowdata.workout_id), defaultIntensity(rowdata.inclination, rowdata.intercept, percentage, rowdata.min_step), await Workout.getWorkoutYoutubeVideo(rowdata.workout_id)]);

      const info = {
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
        is_deleted: rowdata.is_deleted,
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
        detail_plan: temp[2].detail_plan,
        youtube_info: temp[3]
      }
      return info;
    }))
    // await Promise.all(data.map(async rowdata => {
    //   const index = rowdata.index;
    //   const workout_id = rowdata.workout_id;
    //   const result = await Promise.all([await Workout.getWorkoutRecordById(workout_id, uid), await WorkoutAbility.getAllWorkoutAbilityHistory(uid, workout_id), await defaultIntensity(rowdata.equation.inclination, rowdata.equation.intercept, percentage, rowdata.min_step)]);
    //   data[index].recent_records = result[0].recentRecords;
    //   data[index].rest_time = result[0].rest_time;
    //   data[index].workout_ability = result[1];
    //   data[index].plan = result[2].plan;
    //   data[index].detail_plan = result[2].detail_plan;
    // }))
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_USERSRECORDS_SUCCESS, data));
  },*/
  getEachUsersRecords: async (req, res) => {
    const id = req.params.id;
    const uid = req.uid;
    const usersRecords = await Workout.getUsersWorkoutRecordById(id, uid);
    const followsRecords = await Workout.getFollowsWorkoutRecordById(id, uid);

    // DB Error Handling
    if (usersRecords == -1 || followsRecords == -1) {
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
    if (profileResult == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
    }
    const { sex, age, weight, percentage } = profileResult;
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
    if (!checkWorkoutIndex.reduce((a, b) => a * b)) {
      res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
      return;
    }

    // Get Workout Info
    const result = await Promise.all(ids.map(async id => {
      const data = await Workout.getWorkoutById(id, sex, ageGroup, weightGroup);
      const { recentRecords, rest_time } = await Workout.getWorkoutRecordById(id, uid);
      const updateResultPopularity = await Workout.updateWorkoutPopularity(id);
      const updateResultAddNum = await Workout.updateUserWorkoutHistoryAdd(uid, id);
      const workout_ability = await WorkoutAbility.getAllWorkoutAbilityHistory(uid, id);
      const { plan, detail_plan } = await defaultIntensity(data.inclination, data.intercept, percentage, data.min_step);
      // DB Error Handling
      if (data == -1 || recentRecords == -1 || updateResultPopularity == -1 || workout_ability == -1 || updateResultAddNum == -1) {
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUT_FAIL));
      }
      return jsonFormatter.getWorkout(id, data.video_url, data.english, data.korean, data.category, data.muscle_p, [data.muscle_s1, data.muscle_s2, data.muscle_s3, data.muscle_s4, data.muscle_s5, data.muscle_s6], data.equipment, data.record_type, rest_time, data.inclination, data.intercept, recentRecords, workout_ability, plan, detail_plan);
    }));

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUT_SUCCESS, result));
  },
  getAlgorithmData: async (req, res) => {
    const uid = req.uid;
    const workout_id = req.params.workout_id;
    const langCode = req.lang_code;

    const { percentage, sex, ageGroup, weightGroup } = await getUserInfo(uid)
    const { inclination, intercept } = await WorkoutEquation.getEquation(workout_id, sex, ageGroup, weightGroup);
    const [max_one_rm, workoutData] = await Promise.all([await WorkoutAbility.getWorkoutMaxOneRm(uid, workout_id, percentage, inclination, intercept), await Workout.getWorkoutInfo(workout_id)]);
    const { min_step } = workoutData;
    const most_recent_record = await Workout.getMostRecentWorkoutRecordById(workout_id, uid);

    const fleekAlgo = fleekIntensity(langCode);
    const data = await Promise.all(fleekAlgo.map(async (algo) => {
      const algo_index = fleekAlgo.findIndex(algorithm => algorithm.algorithm_id == algo.algorithm_id);

      let algorithm_id = algo.algorithm_id, algorithm_name = algo.algorithm_name, content_data = fleekAlgo[algo_index].algorithm_content;
      let availability, detail_data;

      if (algo.algorithm_id == 0) {
        const most_recent_max_one_rm = await WorkoutAbility.getRecentWorkoutMaxOneRm(uid, workout_id);
        if (most_recent_record.length == 0) {
          availability = 0;
          detail_data = null;
        }
        else {
          availability = 1;
          detail_data = await fleekIntensityRecentRecord(most_recent_record[0], most_recent_max_one_rm, min_step);
        }
      } else {
        if ((inclination == null || intercept == null) && most_recent_record.length == 0) {
          availability = 0;
          detail_data = null;
        } else {
          availability = 1;
          detail_data = await Promise.all([0, 1, 2, 3, 4].map(async (intensity) => {
            const data_by_intensity = await Promise.all(fleekAlgo[algo_index].algorithm_detail[intensity].weights.map(async (weight_param, index) => {
              const reps = fleekAlgo[algo_index].algorithm_detail[intensity].reps[index];
              const weight = roundNumber.roundNum(weight_param * max_one_rm, min_step);
              let rpe;
              if (weight == null || !isFinite(weight)) {
                rpe = null;
              } else {
                rpe = await getRpeByRepsWeight(reps, weight / max_one_rm);
              }
              return { reps: reps, weight: weight, rpe: rpe };
            }));
            return data_by_intensity
          }));
        }
      }
      return { availability: availability, algorithm_id: algorithm_id, algorithm_name: algorithm_name, algorithm_content: content_data, detail_plan: detail_data };

    }));
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUTALGORITHM_SUCCESS, data));
  },
  /*
  getAlgoWorkoutPlan: async (req, res) => {
    const uid = req.uid;
    const algorithm_id = req.params.algorithm_id;
    const workout_id = req.params.workout_id;

    const {percentage, sex, ageGroup, weightGroup} = await getUserInfo(uid)
    const {inclination, intercept} = await WorkoutEquation.getEquation(workout_id, sex, ageGroup, weightGroup);
    // Get Max 1RM && WorkoutData
    const [max_one_rm, workoutData] = await Promise.all([await WorkoutAbility.getWorkoutMaxOneRm(uid, workout_id, percentage, inclination, intercept), await Workout.getWorkoutInfo(workout_id)]);
    // DB Error Handling
    if (max_one_rm == -1 || workoutData == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_WORKOUTALGORITHM_FAIL));
    }
    const { min_step } = workoutData;

    let content_data, detail_data;

    if (algorithm_id == 0) {
      const most_recent_record = (await Workout.getMostRecentWorkoutRecordById(workout_id, uid))[0];
      const most_recent_max_one_rm = await WorkoutAbility.getRecentWorkoutMaxOneRm(uid, workout_id);
 
      content_data = fleekIntensity[0].algorithm_content
      detail_data = await fleekIntensityRecentRecord(most_recent_record, most_recent_max_one_rm, min_step);

    } else{
      const algo_index = fleekIntensity.findIndex(algo => algo.algorithm_id == algorithm_id);
      
      content_data = fleekIntensity[algo_index].algorithm_content
      detail_data = await Promise.all([0, 1, 2, 3, 4].map(async(intensity) => {
        const data_by_intensity = await Promise.all(fleekIntensity[algo_index].algorithm_detail[intensity].weights.map(async(weight_param, index) => {
        const reps = fleekIntensity[algo_index].algorithm_detail[intensity].reps[index];
        const weight = roundNumber.roundNum(weight_param * max_one_rm, min_step);
        let rpe;
        if (weight == null || !isFinite(weight)){
          rpe = null;
        } else {
          rpe = await getRpeByRepsWeight(reps, weight/max_one_rm);
        }
        return { reps: reps, weight: weight, rpe: rpe };
        }));
        return data_by_intensity
      }));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUTALGORITHM_SUCCESS, {algorithm_content: content_data, detail_plan: detail_data}));
  },
  */
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
  },
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
  getWorkoutRankingInfo: async (req, res) => {
    const uid = req.uid;

    const workout_id = req.params.workout_id;
    const { type, group, period, page } = req.query;

    let data;

    const { sex, ageGroup, weightGroup } = await getUserInfo(uid);

    switch (type) {
      case "onermmax":
        data = await Promise.all([await Workout.getOneRmMaxListByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period, page), await Workout.getOneRmMaxRankByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period)]);
        break;
      case "weightmax":
        data = await Promise.all([await Workout.getWeightMaxListByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period, page), await Workout.getWeightMaxRankByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period)])
        break;
      case "volumemax":
        data = await Promise.all([await Workout.getVolumeMaxListByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period, page), await Workout.getVolumeMaxRankByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period)])
        break;
      case "totalsets":
        data = await Promise.all([await Workout.getTotalSetsMaxListByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period, page), await Workout.getTotalSetsMaxRankByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period)])
        break;
      case "totalvolume":
        data = await Promise.all([await Workout.getTotalVolumeMaxListByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period, page), await Workout.getTotalVolumeMaxRankByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period)])
        break;
      case "totalreps":
        data = await Promise.all([await Workout.getTotalRepsMaxListByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period, page), await Workout.getTotalRepsMaxRankByWorkoutId(workout_id, uid, sex, ageGroup, weightGroup, group, period)])
        break;
      default:
        break;
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_WORKOUTALGORITHM_SUCCESS, { rank: data[1].rank, value: data[1].value, rank_list: data[0] }));
  }
}