const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table_templateUsers = 'templateUsers';
const table_templateUsersDetails = 'templateUsersDetails';
//const table_templateDefault


const template = {
    postTemplateData: async (uid, name, data) => {
        const fields1 = 'name, userinfo_uid';
        const fields2 = 'sets, reps, duration, distance, iswarmup, workout_workout_id, templateUsers_template_id';
        const questions1 = '?, ?';
        const questions2 = '?, ?, ?, ?, ?, ?, ?'
        const values1 = [name, uid];
        const query1 = `INSERT INTO ${table_templateUsers}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;
        try {
            const result1 = await pool.queryParamArrMaster(query1, values1);
            const addTemplateDetails = async() => {
                await asyncForEach(data, async(workouts) => {
                    await pool.queryParamArrMaster(query2, [workouts.sets, workouts.reps, workouts.duration, workouts.distance, workouts.iswarmup, workouts.workout_id, result1.insertId]);
                });
            }
            await addTemplateDetails();
            return result1.insertId;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postTemplateData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("postTemplateData ERROR: ", err);
            throw err;
        }
    },
    getUserTemplate: async(uid) => {
        const fields = 'name, templateUsers_id, workout_workout_id, sets, reps, duration, distance';
        const query = `SELECT ${fields} FROM ${table_templateUsers}
                        INNER JOIN ${table_templateUsersDetails} ON ${table_templateUsers}.templateUsers_id = ${table_templateUsersDetails}.templateUsers_template_id AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
        try {
            const result = await pool.queryParamSlave(query);
            console.log(result);
            if (result.length==0) return -1;
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
    getDefaultWorkoutById: async (workout_id, sex, age, weight) => {
        const fields = 'english, korean, category, muscle_p, muscle_s1, muscle_s2, muscle_s3, muscle_s4, muscle_s5, muscle_s6, equipment, record_type, inclination, intercept';
        const query = `SELECT ${fields} FROM ${table_workout} 
                        LEFT JOIN ${table_equation} ON ${table_workout}.workout_id = ${table_equation}.workout_workout_id
                        WHERE ${table_workout}.workout_id="${workout_id}" 
                            AND (inclination IS NULL
                                    OR (${table_equation}.sex="${sex}" AND (${table_equation}.age="${age}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weight}"))`;
        try {
            const result = await pool.queryParamSlave(query);
            if (result.length==0) return -1;
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
}

module.exports = template;