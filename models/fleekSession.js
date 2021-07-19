const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table_workoutlog = 'workoutlog';
const table_session = 'session';
const table_favworkout = 'favworkout';

const session = {
    postData: async (uid, name, sex, age, height, weight, created_at, goal=1) => {
        const fields1 = 'uid, name, sex, age, height, weight, created_at';
        const fields2 = 'goal, userinfo_uid'
        const questions1 = `?, ?, ?, ?, ?, ?, ?`;
        const questions2 = `?,?`
        const values1 = [uid, name, sex, age, height, weight, created_at];

        const query1 = `INSERT INTO ${table1}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table2}(${fields2}) VALUES(${questions2})`;
        try {
            const result = await pool.queryParamArrMaster(query1, values1);
            const addGoals = async() => {
                await asyncForEach(goal, async(elem) => {
                    await pool.queryParamArrMaster(query2, [elem, uid]);
                });
            }
            await addGoals();
            return uid;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postData ERROR : ', err.errno, err.code);
                return -1;
            }
            console.log('postData ERROR : ', err);
            throw err;
        }
    },
    postSessionData: async (uid, data, created_at) => {
        const fields1 = 'userinfo_uid, created_at';
        const fields2 = 'reps, weight, duration, distance, iswarmup, workout_order, set_order, workout_workout_id, session_session_id';
        const questions1 = '?, ?';
        const questions2 = '?, ?, ?, ?, ?, ?, ?, ?, ?'
        const values1 = [uid, created_at];
        const query1 = `INSERT INTO ${table_session}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table_workoutlog}(${fields2}) VALUES(${questions2})`;
        try {
            const result1 = await pool.queryParamArrMaster(query1, values1);
            const addWorkoutlog = async() => {
                await asyncForEach(data, async(workouts) => {
                    //await console.log(workouts.workout_id, workouts.workout_order);
                    await asyncForEach(workouts.detail, async(sets) => {
                        //await console.log(sets);
                        await pool.queryParamArrMaster(query2, [sets.reps, sets.weight, sets.duration, sets.distance, sets.iswarmup, workouts.workout_order, sets.set_order, workouts.workout_id, result1.insertId]);
                    })
                });
            }
            await addWorkoutlog();
            return result1.insertId;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postSessionData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("postSessionData ERROR: ", err);
            throw err;
        }
    },
    updateFavworkout: async (uid, fav_workout_ids) => {
        let string_fav_workout_ids = '(' + fav_workout_ids.toString() + ')';
        if (fav_workout_ids.length == 0) string_fav_workout_ids = '(-1)'

        const fields1 = 'userinfo_uid, workout_workout_id';
        const questions1 = `?, ?`;
        const query1 = `INSERT IGNORE INTO ${table_favworkout}(${fields1}) VALUES(${questions1})`;
        const query2 = `DELETE FROM ${table_favworkout} WHERE workout_workout_id NOT IN ${string_fav_workout_ids} AND userinfo_uid = '${uid}'`;
        try {
            const addFavs = async() => {
                await asyncForEach(fav_workout_ids, async(workout_id) => {
                    await pool.queryParamArrMaster(query1, [uid, workout_id]);
                });
            }
            await addFavs();
            await pool.queryParamMaster(query2);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateFavworkout ERROR : ', err.errno, err.code);
                return -1;
            }
            console.log('updateFavworkout ERROR : ', err);
            throw err;
        }
    }
}

module.exports = session;