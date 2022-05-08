let util = require("../modules/util");
let statusCode = require("../modules/statusCode");
let resMessage = require("../modules/responseMessage");

let User = require("../models/fleekUser");
let Template = require("../models/fleekTemplate");
let Workout = require("../models/fleekWorkout");
let Dashboard = require("../models/fleekDashboard");
let WorkoutAbility = require("../models/fleekWorkoutAbility");
let UserWorkoutMemo = require("../models/fleekUserWorkoutMemo");
let Session = require("../models/fleekSession");
let PTRequest = require("../models/fleekPTRequest");

const getUserInfo = require("../modules/functionFleek/getUserInfo");
const getUserInfoWear = require("../modules/functionFleek/getUserInfoWear");

const defaultIntensity = require("../modules/algorithm/defaultIntensity");

const ageGroupClassifier = require("../modules/classifier/ageGroupClassifier");
const weightGroupClassifier = require("../modules/classifier/weightGroupClassifier");

const code_follow = {
  success: 0,
  invalid_user: 1,
  already_follow: 2,
  self: 3
};

module.exports = {
  unregister: async (req, res) => {
    const uid = req.uid;

    const result = await User.unregister(uid);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS));
  },
  follow: async (req, res) => {
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
    if (!follow_uid) {
      return res.status(statusCode.BAD_REQUEST).send(
        util.fail(statusCode.BAD_REQUEST, resMessage.INVALID_USER, {
          code: code_follow.invalid_user
        })
      );
    }
    // (2) Self Follow
    if (uid == follow_uid) {
      return res.status(statusCode.BAD_REQUEST).send(
        util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {
          code: code_follow.self
        })
      );
    }
    // Check Current Following Status
    const flag = await User.checkFollow(uid, follow_uid);
    // DB Error Handling
    if (flag == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
    }
    // (3) Already Following
    if (flag) {
      return res.status(statusCode.BAD_REQUEST).send(
        util.fail(statusCode.BAD_REQUEST, resMessage.FOLLOW_FAIL, {
          code: code_follow.already_follow
        })
      );
    }
    //****************************************
    // Do Follow
    const result = await User.addFollow(uid, follow_uid);
    // DB Error Handling
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
    }
    // Success
    res.status(statusCode.OK).send(
      util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS, {
        code: code_follow.success
      })
    );

    // const { name, privacy_setting } = await User.getProfile(uid);
    // await User.addFollowFirebase(uid, follow_uid, name, privacy_setting);
  },
  unfollow: async (req, res) => {
    const uid = req.uid;
    const unfollow_uid = req.params.unfollow_uid;
    const result = await User.deleteFollow(uid, unfollow_uid);
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
    }
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS));
  },
  deleteFollower: async (req, res) => {
    const uid = req.uid;
    const remove_uid = req.params.remove_uid;
    const result = await User.deleteMyFollower(uid, remove_uid);
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.FOLLOW_FAIL));
    }
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.FOLLOW_SUCCESS));
  },
  getAllFollowing: async (req, res) => {
    const uid = req.uid;
    const following = await User.getFollows(uid);

    // DB Error Handling
    if (following == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, following));
  },
  getSetting: async (req, res) => {
    const uid = req.uid;

    const result = await User.getSetting(uid);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, result));
  },
  updateSetting: async (req, res) => {
    const uid = req.uid;
    let data = req.body;

    if (data.lang_code == undefined || data.lang_code == null) data.lang_code = 1;

    const result = await User.updateSetting(uid, data);

    if (result == -1 || !result) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
  },
  getProfile: async (req, res) => {
    const uid = req.uid;

    //const profileData = await User.getProfile(uid);
    let profileData = await getUserInfo(uid);
    const session_book = await Session.getBookSession(uid);
    const pt_request = await PTRequest.getPersonalTrainingRequest(uid);
    profileData["session_book"] = {
      template_id: session_book != undefined ? session_book.templateUsers_templateUsers_id : null,
      set_time: session_book != undefined ? session_book.set_time : null
    };
    profileData["pt_request"] = {
      request_id: pt_request != undefined ? pt_request.ptRequest_id : null,
      request_status: pt_request != undefined ? pt_request.request_status : null
    };

    // DB Error Handling
    if (profileData == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, profileData));
  },
  getProfileWear: async (req, res) => {
    const uid = req.uid;

    const profileData = await getUserInfoWear(uid);

    // DB Error Handling
    if (profileData == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, profileData));
  },
  updateName: async (req, res) => {
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
  updateWeight: async (req, res) => {
    const uid = req.uid;
    const { weight } = req.query;

    const result = await User.updateWeight(uid, weight);
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
  },
  updateBodyInfo: async (req, res) => {
    const uid = req.uid;
    const { height, weight, skeletal_muscle_mass, body_fat_ratio } = req.body;
    const result = await User.updateBodyInfo(uid, height, weight, skeletal_muscle_mass, body_fat_ratio);
    console.log(weight);
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));

    let update_time = Math.floor(Date.now() / 1000);
    await Workout.postWorkoutInfoSyncFirebase(uid, update_time);
  },
  updateBodyInfoRecord: async (req, res) => {
    const uid = req.uid;
    const userBodyInfoTracking_id = req.params.body_info_id;
    const { height, weight, skeletal_muscle_mass, body_fat_ratio } = req.body;
    const result = await User.updateBodyInfoRecord(uid, userBodyInfoTracking_id, height, weight, skeletal_muscle_mass, body_fat_ratio);
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));

    let update_time = Math.floor(Date.now() / 1000);
    await Workout.postWorkoutInfoSyncFirebase(uid, update_time);
  },
  deleteBodyInfo: async (req, res) => {
    const uid = req.uid;
    const userBodyInfoTracking_id = req.params.body_info_id;
    const result = await User.deleteBodyInfo(uid, userBodyInfoTracking_id);
    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));

    let update_time = Math.floor(Date.now() / 1000);
    await Workout.postWorkoutInfoSyncFirebase(uid, update_time);
  },
  postSuggestion: async (req, res) => {
    const uid = req.uid;
    const content = req.body.data;

    const result = await User.postSuggestion(uid, content);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
  },
  getSelfFleekData: async (req, res) => {
    const uid = req.uid;
    const profileResult = await User.getProfile(uid);
    const { sex, age, weight } = profileResult;
    const [ageGroup, weightGroup] = await Promise.all([await ageGroupClassifier(age), await weightGroupClassifier(weight, sex)]);

    let data = {
      uid: uid,
      template: null,
      calendar_data: null,
      dashboard: { record: null, favorite_workouts: null }
    };

    [data.template, data.calendar_data, data.dashboard.record, data.dashboard.favorite_workouts] = await Promise.all([
      Template.getUserTemplate(uid),
      Workout.getUserHistoryDataAll(uid, sex, ageGroup, weightGroup),
      Dashboard.getDashboardRecords(uid),
      Dashboard.getFavoriteWorkouts(uid)
    ]);
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
  },
  getOthersFleekData: async (req, res) => {
    //const uid = req.uid;
    const other_uid = req.params.other_uid;

    const otherPrivacySetting = await User.checkPrivacy(other_uid);
    if (otherPrivacySetting == 1) {
      return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
    } else if (otherPrivacySetting == 2) {

    }


    const { sex, age, weight, achievement, profile_url, instagram_id } = await getUserInfo(other_uid);
    const [ageGroup, weightGroup] = await Promise.all([await ageGroupClassifier(age), await weightGroupClassifier(weight, sex)]);



    // const ageGroup = await ageGroupClassifier(age); // Conversion to group
    // const weightGroup = await weightGroupClassifier(weight, sex); // Conversion to group
    // const [workout_record_result, workout_ability_result] = await Promise.all([await Workout.getWorkoutRecordTotal(other_uid), await WorkoutAbility.getAllWorkoutAbilityHistoryTotal(other_uid)]);
    // const getOthersWorkoutData = async() => {
    //     const result = await Workout.getWorkoutTable(other_uid, sex, ageGroup, weightGroup);
    //     if (result == -1){
    //         return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
    //     }
    //     const workout_data = await Promise.all(result.map(async rowdata => {
    //         const info =  {
    //             workout_id: Number(rowdata.workout_id),
    //             equation: {
    //                 inclination: rowdata.inclination,
    //                 intercept: rowdata.intercept
    //             },
    //             recent_records: workout_record_result[rowdata.workout_id] != undefined ? workout_record_result[rowdata.workout_id] : [],
    //             workout_ability: workout_ability_result[rowdata.workout_id] != undefined ? workout_ability_result[rowdata.workout_id] : []
    //         }
    //         return info;
    //     }));
    //     return workout_data;
    // }
    const getOthersCustomWorkout = async () => {
      const result = await Workout.getOthersCustomWorkouts(other_uid, sex, ageGroup, weightGroup);
      if (result == -1) {
        return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_USERSRECORDS_FAIL));
      }
      const data = await Promise.all(
        result.map(async rowdata => {
          //const workoutRecord = await Workout.getWorkoutRecordById(rowdata.workout_id, uid);
          if (rowdata.is_custom == 1) rowdata.name = rowdata.korean;
          const info = {
            workout_id: Number(rowdata.workout_id),
            name: rowdata.korean,
            english: rowdata.english,
            korean: rowdata.korean,
            category: rowdata.category,
            muscle_primary: rowdata.muscle_p,
            muscle_secondary: [
              rowdata.muscle_s1,
              rowdata.muscle_s2,
              rowdata.muscle_s3,
              rowdata.muscle_s4,
              rowdata.muscle_s5,
              rowdata.muscle_s6
            ],
            equipment: rowdata.equipment,
            record_type: rowdata.record_type,
            multiplier: rowdata.multiplier,
            min_step: rowdata.min_step,
            tier: rowdata.tier,
            is_custom: rowdata.is_custom,
            video_url: rowdata.video_url,
            video_url_substitute: rowdata.video_url_substitute,
            reference_num: rowdata.reference_num,
            rest_time: 0
            //workout_ability: temp[1],
            //plan: temp[2].plan,
            //detail_plan: temp[2].detail_plan
          };
          return info;
        })
      );
      return data;
    };

    let data = {
      uid: other_uid,
      profile_url: profile_url,
      instagram_id: instagram_id,
      achievement: achievement,
      template: null,
      calendar_data: null,
      extra_custom_workout_table: null
    };
    [data.template, data.calendar_data, data.extra_custom_workout_table] = await Promise.all([
      Template.getUserTemplate(other_uid),
      Workout.getUserHistoryDataAll(other_uid, sex, ageGroup, weightGroup),
      getOthersCustomWorkout()
    ]);
    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.WRITE_SESSION_SUCCESS, data));
  },
  updatePrivacySetting: async (req, res) => {
    const uid = req.uid;
    const privacyMode = req.params.privacy_mode;

    const result = await User.updatePrivacySetting(uid, privacyMode);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
  },
  getUserWorkoutMemo: async (req, res) => {
    const uid = req.uid;
    const workout_id = req.params.workout_id;

    const result = await UserWorkoutMemo.getMemo(uid, workout_id);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, result));
  },
  postUserWorkoutMemo: async (req, res) => {
    const uid = req.uid;
    const workout_id = req.params.workout_id;
    const content = req.body.content;

    const result = await UserWorkoutMemo.postMemo(uid, workout_id, content);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }
    console.log(result.insertId);
    // Success
    res.status(statusCode.OK).send(
      util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL, {
        userWorkoutMemo_id: result.insertId
      })
    );
  },
  updateUserWorkoutMemo: async (req, res) => {
    const uid = req.uid;
    const userWorkoutMemo_id = req.params.userWorkoutMemo_id;
    const content = req.body.content;

    const result = await UserWorkoutMemo.updateMemo(uid, userWorkoutMemo_id, content);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
  },
  deleteUserWorkoutMemo: async (req, res) => {
    const uid = req.uid;
    const userWorkoutMemo_id = req.params.userWorkoutMemo_id;

    const result = await UserWorkoutMemo.deleteMemo(uid, userWorkoutMemo_id);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
  },
  updateInstagramId: async (req, res) => {
    const uid = req.uid;
    const instagram_id = req.params.instagram_id;

    const result = await User.updateInstagramId(uid, instagram_id);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
  },
  deleteInstagramId: async (req, res) => {
    const uid = req.uid;

    const result = await User.deleteInstagramId(uid);

    if (result == -1) {
      return res.status(statusCode.DB_ERROR).send(util.fail(statusCode.DB_ERROR, resMessage.READ_FOLLOWING_FAIL));
    }

    // Success
    res.status(statusCode.OK).send(util.success(statusCode.OK, resMessage.READ_FOLLOWING_FAIL));
  }
};
