const pool = require("../modules/pool");
const asyncForEach = require("../modules/function/asyncForEach");
const timeFunction = require("../modules/function/timeFunction");

const table_ptRequest = "ptRequest";

const workout = {
  getPersonalTrainingRequest: async (uid) => {
    const query = `SELECT * FROM ${table_ptRequest}
                        WHERE userinfo_uid = '${uid}'
                        ORDER BY ptRequest_id DESC LIMIT 1`;

    try {
      const data = await pool.queryParamMaster(query);
      return data[0];
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutRecordById ERROR: ", err);
      throw err;
    }
  },
  countPersonalTrainingRequest: async (uid) => {
    const query = `SELECT * FROM ${table_ptRequest}
                        WHERE userinfo_uid = '${uid}' AND request_status = 1`;

    try {
      const data = await pool.queryParamSlave(query);
      return data.length;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutRecordById ERROR: ", err);
      throw err;
    }
  },
  postPersonalTrainingRequest: async (uid, data) => {
    const fields1 =
      "userinfo_uid, request_duration, request_goal, request_train_type, request_intensity, request_content";
    const questions1 = "?, ?, ?, ?, ?, ?";
    const values1 = [
      uid,
      data.request_duration,
      data.request_goal,
      data.request_train_type,
      data.request_intensity,
      data.request_content,
    ];
    const query1 = `INSERT INTO ${table_ptRequest}(${fields1}) VALUES(${questions1})`;
    try {
      await pool.queryParamArrMaster(query1, values1);
      return;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutRecordById ERROR: ", err);
      throw err;
    }
  },
  cancelPersonalTrainingRequest: async (uid, request_id) => {
    const query1 = `UPDATE ${table_ptRequest} SET request_status = -1
                        WHERE ptRequest_id = ${request_id} AND userinfo_uid = '${uid}'`;
    try {
      await pool.queryParamMaster(query1);
      return;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutRecordById ERROR: ", err);
      throw err;
    }
  },
};

module.exports = workout;
