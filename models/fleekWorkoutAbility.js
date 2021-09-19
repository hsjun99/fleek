const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');
const timeFunction = require('../modules/function/timeFunction');

const table_workoutAbility = 'workoutAbility';
const table_session = 'session';

const workoutAbility = {
    getRecentWorkoutMaxOneRm: async(uid, workout_id) => {
        const fields = 'max_one_rm';
        const query = `SELECT ${fields} FROM ${table_workoutAbility}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutAbility}.session_session_id AND ${table_session}.is_deleted != 1
                        WHERE ${table_workoutAbility}.userinfo_uid="${uid}" AND ${table_workoutAbility}.workout_workout_id="${workout_id}"
                        ORDER BY ${table_session}.created_at DESC
                        LIMIT 1`;
        try {
            const result = await pool.queryParamSlave(query);
            let max_one_rm = 0;
            if (result.length > 0) max_one_rm = result[0].max_one_rm;
            return max_one_rm;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutMaxOneRm ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutMaxOneRm ERROR: ", err);
            throw err;
        }
    },
    getWorkoutMaxOneRm: async(uid, workout_id, percentage, inclination, intercept) => {
        const fields = 'max_one_rm';
        const query = `SELECT ${fields} FROM ${table_workoutAbility}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutAbility}.session_session_id AND ${table_session}.is_deleted != 1
                        WHERE ${table_workoutAbility}.userinfo_uid="${uid}" AND ${table_workoutAbility}.workout_workout_id="${workout_id}"
                        ORDER BY max_one_rm DESC
                        LIMIT 1`;
        try {
            const result = await pool.queryParamSlave(query);
            let max_one_rm = 0;
            if (result.length > 0) {
                // when history exits
                max_one_rm = result[0].max_one_rm;
            } else {
                // default max 1rm
                max_one_rm = Math.exp((percentage-intercept)/inclination);
            }
            return max_one_rm;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutMaxOneRm ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutMaxOneRm ERROR: ", err);
            throw err;
        }
    },
    getAllWorkoutAbilityHistory: async(uid, workout_id) => {
        const fields = `max_one_rm, total_volume, max_volume, total_reps, max_weight, ${table_workoutAbility}.created_at`;
        const query = `SELECT ${fields} FROM ${table_workoutAbility}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutAbility}.session_session_id AND ${table_session}.is_deleted != 1
                        WHERE ${table_workoutAbility}.userinfo_uid="${uid}" AND ${table_workoutAbility}.workout_workout_id="${workout_id}"
                        ORDER BY ${table_workoutAbility}.workoutAbility_id DESC`;
        try {
            const result = await pool.queryParamSlave(query);
            return result;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getAllWorkoutAbilityHistory ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getAllWorkoutAbilityHistory ERROR: ", err);
            throw err;
        }
    }
}

module.exports = workoutAbility;