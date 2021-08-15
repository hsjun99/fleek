const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table_session = 'session';
const table_userWorkoutHistory = 'userWorkoutHistory';
const table_workoutAbility = 'workoutAbility';
const table_workoutlog = 'workoutlog';

const template = {
    getDashboardRecords: async (uid) => {
        const fields1 = 'AVG(total_time) AS time_AVG, AVG(session_total_volume) AS volume_AVG, AVG(session_total_reps) AS reps_AVG, AVG(session_total_sets) AS sets_AVG';
        const query1 = `SELECT ${fields1} FROM ${table_session}
                        WHERE ${table_session}.is_deleted = 0 AND ${table_session}.userinfo_uid = '${uid}'`;
        try {
            const result1 = await pool.queryParamMaster(query1);
            // No Record
            if (result1.length == 0){
                return {
                    session_time_avg: null,
                    session_volume_avg: null,
                    session_reps_avg: null,
                    session_sets_avg: null
                }
            } else { // At least 1 Record
                return {
                    session_time_avg: Math.round(result1[0].time_AVG),
                    session_volume_avg: Math.round(result1[0].volume_AVG),
                    session_reps_avg: Math.round(result1[0].reps_AVG),
                    session_sets_avg: Math.round(result1[0].sets_AVG)
                }
            }
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getDashboardRecords ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getDashboardRecords ERROR: ", err);
            throw err;
        }
    },
    getFavoriteWorkouts: async (uid) => {
        const fields1 = 'workout_workout_id, finish_num';
        const fields2 = 'MAX(max_one_rm) AS one_rm_MAX';
        const fields3 = 'SUM(reps) AS reps_SUM';
        const fields4 = 'MAX(reps) AS reps_MAX';
        const query1 = `SELECT ${fields1} FROM ${table_userWorkoutHistory}
                        WHERE ${table_userWorkoutHistory}.userinfo_uid = '${uid}' AND ${table_userWorkoutHistory}.finish_num != 0
                        ORDER BY ${table_userWorkoutHistory}.finish_num DESC
                        LIMIT 5`;

        const restructure = async(result1) => {
            let data = [];
            await asyncForEach(result1, async(rowdata) => {
                const query2 = `SELECT ${fields2} FROM ${table_workoutAbility}
                                INNER JOIN ${table_session}
                                ON ${table_session}.session_id = ${table_workoutAbility}.session_session_id AND ${table_workoutAbility}.userinfo_uid = '${uid}' AND ${table_workoutAbility}.workout_workout_id = ${rowdata.workout_workout_id} AND ${table_session}.is_deleted = 0`;
                const query3 = `SELECT ${fields3} FROM ${table_workoutlog}
                                INNER JOIN ${table_session}
                                ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_workoutlog}.workout_workout_id = ${rowdata.workout_workout_id} AND ${table_session}.is_deleted = 0`;
                const query4 = `SELECT ${fields4} FROM ${table_workoutlog}
                                INNER JOIN ${table_session}
                                ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_workoutlog}.workout_workout_id = ${rowdata.workout_workout_id} AND ${table_session}.is_deleted = 0`;
                const oneRmData = await pool.queryParamMaster(query2);
                const totalRepsData = await pool.queryParamMaster(query3);
                const maxRepsData = await pool.queryParamMaster(query4);
                data.push({workout_id: rowdata.workout_workout_id, one_rm: Math.round(oneRmData[0].one_rm_MAX), total_days: rowdata.finish_num, total_reps: totalRepsData[0].reps_SUM, max_reps: maxRepsData[0].reps_MAX});
            });
            return data;
        }

        try {
            const result1 = await pool.queryParamMaster(query1);
            const data = await restructure(result1);
            return data;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getDashboardRecords ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("ggetDashboardRecords ERROR: ", err);
            throw err;
        }
    }
}

module.exports = template;