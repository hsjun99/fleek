const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');
const moment = require('moment');

const table_workout = 'workout';
const table_equation = 'equation';
const table_workoutlog = 'workoutlog';
const table_session = 'session';
const table_userinfo = 'userinfo';

const workout = {
    getWorkoutById: async (workout_id, sex, age, weight) => {
        const fields = 'english, korean, category, muscle_p, muscle_s1, muscle_s2, muscle_s3, muscle_s4, muscle_s5, muscle_s6, equipment, record_type, inclination, intercept';
        const query = `SELECT ${fields} FROM ${table_workout} 
                        LEFT JOIN ${table_equation} ON ${table_workout}.workout_id = ${table_equation}.workout_workout_id
                        WHERE ${table_workout}.workout_id="${workout_id}" 
                            AND (inclination IS NULL
                                    OR (${table_equation}.sex="${sex}" AND (${table_equation}.age="${age}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weight}"))`;
        try {
            const result = await pool.queryParamSlave(query);
            return result[0];
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutById ERROR: ", err);
            throw err;
        }
    },
    getWorkoutRecordById: async (workout_id, uid) => {
        const fields = 'reps, weight, session_session_id, created_at';
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = ${uid} AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){
                        data.push([{reps:rowdata.reps, weight:rowdata.weight, session_id: rowdata.session_session_id, created_at: rowdata.created_at}]);
                    }
                    else if (data[data.length-1][0].session_id == rowdata.session_session_id){
                        data[data.length-1].push({reps:rowdata.reps, weight:rowdata.weight, session_id: rowdata.session_session_id, created_at: rowdata.created_at});
                    }
                    else {
                        data.push([{reps:rowdata.reps, weight:rowdata.weight, session_id: rowdata.session_session_id, created_at: rowdata.created_at}]);
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    checkWorkout: async (workout_id) => {
        const query = `SELECT * FROM ${table_workout} WHERE workout_id="${workout_id}"`;
        try {
            const result = await pool.queryParamSlave(query);
            if (result.length === 0) {
                return false;
            } else return true
        } catch (error) {
            if (err.errno == 1062) {
                console.log('checkWorkout Error : ', err.errno, err.code);
                return -1;
            }
            console.log('checkWorkout Error : ', err);
            throw err;
        }
    },
    getUsersWorkoutRecordById: async (workout_id) => {
        const fields = `${table_userinfo}.name, ${table_session}.session_id, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_session}.created_at`;
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_workoutlog}.session_session_id = ${table_session}.session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_userinfo} ON ${table_session}.userinfo_uid = ${table_userinfo}.uid
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            // Time Difference Calculation Required
            const now = moment();
            const currenttime = await now.format("YYYY-MM-DD HH:mm:ss");
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    console.log(moment(currenttime).diff(rowdata.created_at));
                    if (data.length == 0){
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: rowdata.created_at, log: [{reps:rowdata.reps, weight:rowdata.weight}]});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_id){
                        data[data.length-1].log.push({reps:rowdata.reps, weight:rowdata.weight});
                    }
                    else {
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: rowdata.created_at, log: [{reps:rowdata.reps, weight:rowdata.weight}]});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
            
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getFollowsWorkoutRecordById: async (workout_id, uid) => {

    }
}

module.exports = workout;