const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table_workout = 'workout';
const table_equation = 'equation';
const table_workoutlog = 'workoutlog';
const table_session = 'session';

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
                console.log('WorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("WorkoutRecordById ERROR: ", err);
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
    }
}

module.exports = workout;