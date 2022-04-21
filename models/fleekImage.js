const pool = require("../modules/pool");
const asyncForEach = require("../modules/function/asyncForEach");
const timeFunction = require("../modules/function/timeFunction");

var moment = require("moment");

const table_userinfo = "userinfo";
const table_feedImage = "feedImage";
const table_follows = "follows";
// const table_customWorkout = 'customWorkout';

const fleekImage = {
  updateProfileUrl: async (uid, profile_url) => {
    const query = `UPDATE ${table_userinfo}
                        SET profile_url = '${profile_url}'
                        WHERE uid = '${uid}'`;
    try {
      await pool.queryParamMaster(query);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutMaxOneRm ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutMaxOneRm ERROR: ", err);
      throw err;
    }
  },
  deleteProfileUrl: async (uid) => {
    const query = `UPDATE ${table_userinfo}
                        SET profile_url = NULL
                        WHERE uid = '${uid}'`;
    try {
      await pool.queryParamMaster(query);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutMaxOneRm ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutMaxOneRm ERROR: ", err);
      throw err;
    }
  },
  postFeedImage: async (uid, feed_url, content, privacy_setting) => {
    const questions = "?, ?, ?, ?, ?";
    const field = `userinfo_uid, feed_url, content, privacy_setting, created_at`;
    const query = `INSERT INTO ${table_feedImage}(${field}) VALUES(${questions})`;
    try {
      await pool.queryParamArrMaster(query, [
        uid,
        feed_url,
        content,
        privacy_setting,
        moment().format("YYYY-MM-DD HH:mm:ss"),
      ]);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutMaxOneRm ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutMaxOneRm ERROR: ", err);
      throw err;
    }
  },
  deleteFeedImage: async (uid, feedImage_id) => {
    const query = `UPDATE ${table_feedImage}
                        SET is_deleted = 1
                        WHERE feedImage_id = ${feedImage_id} AND userinfo_uid = '${uid}'`;
    try {
      await pool.queryParamMaster(query);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutMaxOneRm ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutMaxOneRm ERROR: ", err);
      throw err;
    }
  },
  getMyFeedImages: async (uid, last_id) => {
    const pagination_condition = `AND feedImage_id < ${last_id}`;
    const field = `feedImage_id, userinfo_uid AS uid, name, profile_url, feed_url, content, ${table_feedImage}.privacy_setting, ${table_feedImage}.created_at`;
    const query = `SELECT ${field} FROM ${table_feedImage}
                        INNER JOIN ${table_userinfo} ON userinfo_uid = uid
                        WHERE userinfo_uid = '${uid}'
                        AND ${table_feedImage}.is_deleted = 0
                        ${last_id == "init" ? "" : pagination_condition}
                        ORDER BY feedImage_id DESC
                        LIMIT 24`;
    try {
      const data = await pool.queryParamMaster(query);
      return data;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutMaxOneRm ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutMaxOneRm ERROR: ", err);
      throw err;
    }
  },
  getOthersFeedImages: async (uid, other_uid, last_id) => {
    const pagination_condition = `AND feedImage_id < ${last_id}`;
    const field = `feedImage_id, userinfo_uid AS uid, name, profile_url, feed_url, content, ${table_feedImage}.created_at`;
    const query = `SELECT ${field} FROM ${table_feedImage}
                        INNER JOIN ${table_userinfo} ON userinfo_uid = uid
                        WHERE userinfo_uid = '${other_uid}'
                            AND ${table_feedImage}.is_deleted = 0
                            AND DATE_SUB(DATE_SUB(NOW(), INTERVAL 9 HOUR), INTERVAL 15 SECOND) > ${table_feedImage}.created_at
                            AND (${table_feedImage}.privacy_setting = 0 OR (${table_feedImage}.privacy_setting = 2 AND '${other_uid}' IN (SELECT follow_uid FROM ${table_follows} WHERE userinfo_uid = '${uid}')))
                            ${last_id == "init" ? "" : pagination_condition}
                        ORDER BY feedImage_id DESC
                        LIMIT 24`;
    try {
      const data = await pool.queryParamSlave(query);
      return data;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutMaxOneRm ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutMaxOneRm ERROR: ", err);
      throw err;
    }
  },
  getAllFeedImages: async (uid, last_id) => {
    const pagination_condition = `AND feedImage_id < ${last_id}`;
    const field = `feedImage_id, userinfo_uid AS uid, name, profile_url, feed_url, content, ${table_feedImage}.created_at`;
    const query = `SELECT ${field} FROM ${table_feedImage}
                        INNER JOIN ${table_userinfo} ON userinfo_uid = uid
                        WHERE ${table_feedImage}.is_deleted = 0
                            AND DATE_SUB(DATE_SUB(NOW(), INTERVAL 9 HOUR), INTERVAL 15 SECOND) > ${table_feedImage}.created_at
                            AND (${table_feedImage}.privacy_setting = 0 OR (${table_feedImage}.privacy_setting = 2 AND userinfo_uid IN (SELECT follow_uid FROM ${table_follows} WHERE userinfo_uid = '${uid}')))
                            ${last_id == "init" ? "" : pagination_condition}
                        ORDER BY feedImage_id DESC
                        LIMIT 24`;
    try {
      const data = await pool.queryParamSlave(query);
      return data;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutMaxOneRm ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutMaxOneRm ERROR: ", err);
      throw err;
    }
  },
  updateFeedImageDetail: async (
    uid,
    feedImage_id,
    content,
    privacy_setting
  ) => {
    const query = `UPDATE ${table_feedImage}
                        SET content = '${content}', privacy_setting = ${privacy_setting}
                        WHERE feedImage_id = ${feedImage_id} AND uid = '${uid}'`;
    try {
      await pool.queryParamMaster(query);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutMaxOneRm ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutMaxOneRm ERROR: ", err);
      throw err;
    }
  },
  // updateCustomImageUrl: async (uid, workout_id, custom_image_url) => {
  //     const query = `UPDATE ${table_customWorkout}
  //                     SET custom_image_url = '${custom_image_url}'
  //                     WHERE userinfo_uid = '${uid}' AND workout_workout_id = ${workout_id}`;
  //     try {
  //         await pool.queryParamMaster(query);
  //         return true;
  //     } catch (err) {
  //         if (err.errno == 1062) {
  //             console.log('getWorkoutMaxOneRm ERROR: ', err.errno, err.code);
  //             return -1;
  //         }
  //         console.log("getWorkoutMaxOneRm ERROR: ", err);
  //         throw err;
  //     }
  // },
  // deleteCustomImageUrl: async (uid, workout_id) => {
  //     const query = `UPDATE ${table_customWorkout}
  //                     SET custom_image_url = NULL
  //                     WHERE uid = '${uid}' AND workout_workout_id = ${workout_id}`;
  //     try {
  //         await pool.queryParamMaster(query);
  //         return true;
  //     } catch (err) {
  //         if (err.errno == 1062) {
  //             console.log('getWorkoutMaxOneRm ERROR: ', err.errno, err.code);
  //             return -1;
  //         }
  //         console.log("getWorkoutMaxOneRm ERROR: ", err);
  //         throw err;
  //     }
  // },
};

module.exports = fleekImage;
