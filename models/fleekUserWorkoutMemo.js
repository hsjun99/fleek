const pool = require("../modules/pool");
const asyncForEach = require("../modules/function/asyncForEach");
const timeFunction = require("../modules/function/timeFunction");

const table_userWorkoutMemo = "userWorkoutMemo";

const userWorkoutMemo = {
  getMemo: async (uid, workout_id) => {
    const fields1 = "userWorkoutMemo_id, content, created_at";
    const query1 = `SELECT ${fields1} FROM ${table_userWorkoutMemo}
                        WHERE workout_workout_id = ${workout_id} AND userinfo_uid = '${uid}'
                        ORDER BY created_at DESC`;
    try {
      const result1 = await pool.queryParamSlave(query1);
      return result1;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getEquation ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getEquation ERROR: ", err);
      throw err;
    }
  },
  postMemo: async (uid, workout_id, content) => {
    const fields1 = "content, created_at, userinfo_uid, workout_workout_id";
    const questions1 = `?, ?, ?, ?`;
    const values1 = [
      content,
      await timeFunction.currentTime(),
      uid,
      workout_id,
    ];
    const query1 = `INSERT INTO ${table_userWorkoutMemo}(${fields1}) VALUES(${questions1})`;
    try {
      const result1 = await pool.queryParamArrMaster(query1, values1);
      return result1;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getEquation ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getEquation ERROR: ", err);
      throw err;
    }
  },
  updateMemo: async (uid, userWorkoutMemo_id, content) => {
    const query1 = `UPDATE ${table_userWorkoutMemo} SET content = '${content}'
                        WHERE userWorkoutMemo_id = ${userWorkoutMemo_id} AND userinfo_uid = '${uid}'`;
    try {
      await pool.queryParamMaster(query1);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getEquation ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getEquation ERROR: ", err);
      throw err;
    }
  },
  deleteMemo: async (uid, userWorkoutMemo_id) => {
    const query1 = `DELETE FROM ${table_userWorkoutMemo}
                        WHERE userWorkoutMemo_id = ${userWorkoutMemo_id} AND userinfo_uid = '${uid}'`;
    try {
      await pool.queryParamMaster(query1);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getEquation ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getEquation ERROR: ", err);
      throw err;
    }
  },
};

module.exports = userWorkoutMemo;
