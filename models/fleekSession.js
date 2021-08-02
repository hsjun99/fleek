const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const oneRmCalculator = require('../modules/algorithm/oneRmCalculator');
const alphaProgram = require('../modules/algorithm/alphaProgram');

const ageGroupClassifier = require('../modules/classifier/ageGroupClassifier');
const weightGroupClassifier = require('../modules/classifier/weightGroupClassifier');

const table_workout = 'workout';
const table_workoutlog = 'workoutlog';
const table_session = 'session';
const table_templateUsers = 'templateUsers';
const table_workoutAbility = 'workoutAbility';
const table_userWorkoutHistory = 'userWorkoutHistory';
const table_alphaProgramUsers = 'alphaProgramUsers';


const WorkoutAbility = require('./fleekWorkoutAbility');
const WorkoutEquation = require('./workoutEquation');
const User = require('./fleekUser');

const session = {
    postSessionData: async (uid, data, created_at, template_id, total_time, alphaProgramUsers_id, alphaProgram_progress) => {
        const fields1 = 'userinfo_uid, created_at, templateUsers_template_id, alphaProgramUsers_alphaProgramUsers_id, alphaProgramUsers_progress, total_time';
        const fields2 = 'reps, weight, duration, distance, iswarmup, workout_order, set_order, rest_time, workout_workout_id, session_session_id';
        const fields4 = 'max_one_rm, total_volume, max_volume, total_reps, max_weight, workout_workout_id, userinfo_uid, session_session_id, created_at';
        const questions1 = '?, ?, ?, ?, ?, ?';
        const questions2 = '?, ?, ?, ?, ?, ?, ?, ?, ?, ?';
        const questions4 = '?, ?, ?, ?, ?, ?, ?, ?, ?';
        const values1 = [uid, created_at, template_id, alphaProgramUsers_id, alphaProgram_progress, total_time];
        // Insert into Session Table
        const query1 = `INSERT INTO ${table_session}(${fields1}) VALUES(${questions1})`;
        // Insert into Workoutlog Table
        const query2 = `INSERT INTO ${table_workoutlog}(${fields2}) VALUES(${questions2})`;
        // Update Template Table - lastdate
        const query3 = `UPDATE ${table_templateUsers} SET lastdate='${created_at}'
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id}`;
        // Insert into WorkoutAbility Table
        const query4 = `INSERT INTO ${table_workoutAbility}(${fields4}) VALUES(${questions4})`;
        // Update AlphaProgramUsers Table - progress
        const query7 = `UPDATE ${table_alphaProgramUsers} SET progress=${alphaProgram_progress}+1
                        WHERE ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgramUsers}.alphaProgramUsers_id = ${alphaProgramUsers_id} AND ${table_alphaProgramUsers}.is_done = 0`;
        try {
            const result1 = await pool.queryParamArrMaster(query1, values1);
            let session_total_volume=0, session_total_sets=0, session_total_reps=0;
            let one_rms_index = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                                 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            const addWorkoutlog = async() => {
                await asyncForEach(data, async(workouts) => {
                    let max_one_rm=0, total_volume=0, max_volume=0, total_reps=0, max_weight=0;
                    // Get Multiplier from Workout Table
                    const query9 = `SELECT multiplier FROM ${table_workout}
                                        WHERE ${table_workout}.workout_id = ${workouts.workout_id}`;
                    const result9 = await pool.queryParamArrSlave(query9);
                    await asyncForEach(workouts.detail, async(sets) => {
                        await pool.queryParamArrMaster(query2, [sets.reps, sets.weight, sets.duration, sets.distance, sets.iswarmup, workouts.workout_order, sets.set_order, workouts.rest_time, workouts.workout_id, result1.insertId]);
                        max_one_rm = Math.max(max_one_rm, await oneRmCalculator(sets.weight, sets.reps));
                        total_volume += sets.reps * sets.weight * result9[0].multiplier;
                        max_volume = Math.max(max_volume, sets.reps * sets.weight * result9[0].multiplier);
                        total_reps += sets.reps;
                        max_weight = Math.max(max_weight, sets.weight);
                    })
                    await pool.queryParamArrMaster(query4, [max_one_rm, total_volume, max_volume, total_reps, max_weight, workouts.workout_id, uid, result1.insertId, created_at]);
                    // Update UserWorkoutHistory Table - finish_num
                    const query5 = `UPDATE ${table_userWorkoutHistory} SET finish_num = finish_num+1 WHERE userinfo_uid = "${uid}" AND workout_workout_id="${workouts.workout_id}"`;
                    await pool.queryParamMaster(query5)
                    session_total_volume += total_volume;
                    session_total_sets += workouts.detail.length;
                    session_total_reps += total_reps;
                    one_rms_index[workouts.workouts_index-1] = max_one_rm.toFixed(2);
                });
            }
            await addWorkoutlog();
            await pool.queryParamMaster(query3);
            await pool.queryParamMaster(query7);

            const fields6 = 'total_volume, total_sets, total_reps';
            // Update Session Table - total volume, sets, reps
            const query6 = `UPDATE ${table_session} SET session_total_volume = ${session_total_volume}, session_total_sets = ${session_total_sets}, session_total_reps = ${session_total_reps}
                            WHERE ${table_session}.session_id = ${result1.insertId}`;
            await pool.queryParamMaster(query6);
            if (alphaProgramUsers_id != null && alphaProgram_progress == 0) {
                const fields10 = 'workouts_index';
                const query10 = `SELECT ${fields10} FROM ${table_alphaProgramUsers}
                                WHERE ${table_alphaProgramUsers}.alphaProgramUsers_id = ${alphaProgramUsers_id}`;
                const result10 = await pool.queryParamSlave(query10);
                const workouts_index = JSON.parse(result10[0].workouts_index).workouts_index;
                await Promise.all(one_rms_index.map(async (elem, index) => {
                    if (workouts_index[index] != 0 && Math.round(elem) == 0) {
                        let oneRmPastData = await WorkoutAbility.getWorkoutMaxOneRm(uid, workouts_index[index]);
                        if (Math.round(oneRmPastData) == 0) {
                            const {sex, age, weight, percentage} = await User.getProfile(uid);
                            const ageGroup = await ageGroupClassifier(age);
                            const weightGroup = await weightGroupClassifier(weight);
                            const {inclination, intercept} = await WorkoutEquation.getEquation(workouts_index[index], sex, ageGroup, weightGroup);
                            oneRmPastData = Math.exp((percentage-intercept)/inclination);
                        }
                        one_rms_index[index] = oneRmPastData.toFixed(2);
                    }
                }))
                const one_rms_index_String = JSON.stringify({one_rms_index: one_rms_index});
                // Update AlphaProgramUsers Table - one_rms_by_tier
                const query8 = `UPDATE ${table_alphaProgramUsers} SET one_rms_index='${one_rms_index_String}'
                                WHERE ${table_alphaProgramUsers}.userinfo_uid = '${uid}' AND ${table_alphaProgramUsers}.alphaProgramUsers_id = ${alphaProgramUsers_id} AND ${table_alphaProgramUsers}.is_done = 0`;
                await pool.queryParamMaster(query8);
            }
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
    deleteSession: async(uid, session_id) => {
        const query = `UPDATE ${table_session} SET is_deleted=1
                        WHERE ${table_session}.session_id = ${session_id} AND ${table_session}.userinfo_uid = "${uid}"`;
        try {
            await pool.queryParamMaster(query);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('deleteSession ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("deleteSession ERROR: ", err);
            throw err;
        }
    }
}

module.exports = session;