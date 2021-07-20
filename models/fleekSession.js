const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const oneRmCalculator = require('../modules/algorithm/oneRmCalculator');

const table_workoutlog = 'workoutlog';
const table_session = 'session';
const table_favworkout = 'favworkout';
const table_templateUsers = 'templateUsers';
const table_workoutAbility = 'workoutAbility';

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
    postSessionData: async (uid, data, created_at, template_id=null) => {
        const fields1 = 'userinfo_uid, created_at';
        const fields2 = 'reps, weight, duration, distance, iswarmup, workout_order, set_order, rest_time, workout_workout_id, session_session_id';
        const fields4 = 'max_one_rm, total_volume, max_volume, total_reps, max_weight, workout_workout_id, userinfo_uid';
        const questions1 = '?, ?';
        const questions2 = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
        const questions4 = '?, ?, ?, ?, ?, ?, ?';
        const values1 = [uid, created_at];
        const query1 = `INSERT INTO ${table_session}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table_workoutlog}(${fields2}) VALUES(${questions2})`;
        const query3 = `UPDATE ${table_templateUsers} SET lastdate='${created_at}'
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id}`;
        const query4 = `INSERT INTO ${table_workoutAbility}(${fields4}) VALUES(${questions4})`;
        try {
            const result1 = await pool.queryParamArrMaster(query1, values1);
            const addWorkoutlog = async() => {
                await asyncForEach(data, async(workouts) => {
                    let max_one_rm=0, total_volume=0, max_volume=0, total_reps=0, max_weight=0;
                    await asyncForEach(workouts.detail, async(sets) => {
                        await pool.queryParamArrMaster(query2, [sets.reps, sets.weight, sets.duration, sets.distance, sets.iswarmup, workouts.workout_order, sets.set_order, workouts.rest_time, workouts.workout_id, result1.insertId]);
                        max_one_rm = Math.max(max_one_rm, await oneRmCalculator(sets.weight, sets.reps));
                        total_volume += sets.reps * sets.weight;
                        max_volume = Math.max(max_volume, sets.reps * sets.weight);
                        total_reps += sets.reps;
                        max_weight = Math.max(max_weight, sets.weight);
                    })
                    await pool.queryParamArrMaster(query4, [max_one_rm, total_volume, max_volume, total_reps, max_weight, workouts.workout_id, uid]);
                });
            }
            await addWorkoutlog();
            await pool.queryParamMaster(query3);
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