const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');
const timeFunction = require('../modules/function/timeFunction');

const table_workout = 'workout';
const table_equation = 'equation';
const table_workoutlog = 'workoutlog';
const table_session = 'session';
const table_userinfo = 'userinfo';
const table_follows = 'follows';
const table_workoutAbility = 'workoutAbility';
const table_userWorkoutHistory = 'userWorkoutHistory';

const workout = {
    getCalendarData: async(uid) => {
        const fields = `reps, weight, duration, distance, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.session_session_id, workout_order, set_order, max_one_rm, total_volume, max_volume, total_reps, max_weight, ${table_session}.created_at`;
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_session}.is_deleted != 1
                        LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = ${table_session}.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
                        ORDER BY ${table_workoutlog}.session_session_id ASC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){
                        data.push({session_id: rowdata.session_session_id, session_detail: {date: rowdata.created_at, total_workout_time: null, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight}}]}});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_session_id){
                        const L = data[data.length-1].session_detail.content.length
                        if (data[data.length-1].session_detail.content[L-1].workout_id == rowdata.workout_workout_id) {
                            data[data.length-1].session_detail.content[L-1].sets.push({reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                        }
                        else {
                            data[data.length-1].session_detail.content.push({workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight}});
                        }
                    }
                    else {
                        data.push({session_id: rowdata.session_session_id, session_detail: {date: rowdata.created_at, total_workout_time: null, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight}}]}});
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
    getWorkoutById: async (workout_id, sex, age, weight) => {
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
    getWorkoutRecordById: async (workout_id, uid) => {
        const fields = 'reps, weight, rest_time, session_session_id, created_at';
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_workoutlog}.workout_workout_id = ${workout_id} AND ${table_session}.is_deleted != 1
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            let rest_time = 0; // default;
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
            const recentRecords = await restructure();
            if (result.length > 0) rest_time = result[0].rest_time;
            return {recentRecords, rest_time};
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    updateWorkoutPopularity: async (workout_id) => {
        const query = `UPDATE ${table_workout} SET popularity = popularity+1 WHERE workout_id="${workout_id}"`;
        try {
            const result = await pool.queryParamMaster(query);
            return true;
        } catch (error) {
            if (err.errno == 1062) {
                console.log('checkWorkout Error : ', err.errno, err.code);
                return -1;
            }
            console.log('checkWorkout Error : ', err);
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
    getUsersWorkoutRecordById: async (workout_id, uid) => {
        const fields = `${table_userinfo}.name, DISTINCT_SESSION.session_id, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, DISTINCT_SESSION.created_at`;
        /*
        const queryALL = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_workoutlog}.session_session_id = ${table_session}.session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_userinfo} ON ${table_session}.userinfo_uid = ${table_userinfo}.uid
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
                        */
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN
                        (SELECT DISTINCT ${table_session}.session_id, ${table_session}.created_at, ${table_session}.userinfo_uid
                        FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_workoutlog}.session_session_id = ${table_session}.session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id} AND ${table_session}.is_deleted != 1
                        WHERE ${table_session}.userinfo_uid != '${uid}'
                        ORDER BY ${table_workoutlog}.session_session_id DESC
                        LIMIT 5) AS DISTINCT_SESSION
                        ON DISTINCT_SESSION.session_id = ${table_workoutlog}.session_session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_userinfo} ON DISTINCT_SESSION.userinfo_uid = ${table_userinfo}.uid
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    const timeDiffArr = await timeFunction.timeDiff_DHM(rowdata.created_at);
                    if (data.length == 0){
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: timeDiffArr, log: [{reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_id){
                        data[data.length-1].log.push({reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                    }
                    else {
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: timeDiffArr, log: [{reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
            
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getUsersWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getUsersWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getFollowsWorkoutRecordById: async (workout_id, uid) => {
        const fields = `${table_userinfo}.name, DISTINCT_SESSION.session_id, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, DISTINCT_SESSION.created_at`;

        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN
                        (SELECT DISTINCT ${table_session}.session_id, ${table_session}.created_at, ${table_session}.userinfo_uid
                        FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_workoutlog}.session_session_id = ${table_session}.session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id} AND ${table_session}.is_deleted != 1
                        INNER JOIN ${table_follows} ON ${table_follows}.follow_uid = ${table_session}.userinfo_uid AND ${table_follows}.userinfo_uid = '${uid}'
                        WHERE ${table_session}.userinfo_uid != '${uid}'
                        ORDER BY ${table_workoutlog}.session_session_id DESC
                        LIMIT 5) AS DISTINCT_SESSION
                        ON DISTINCT_SESSION.session_id = ${table_workoutlog}.session_session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_userinfo} ON DISTINCT_SESSION.userinfo_uid = ${table_userinfo}.uid
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`; // INNER JOIN ${table_follows} ON ${table_userinfo}.uid = ${table_follows}.follow_uid AND ${table_follows}.userinfo_uid = ${uid}
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    const timeDiffArr = await timeFunction.timeDiff_DHM(rowdata.created_at);
                    if (data.length == 0){
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: timeDiffArr, log: [{reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_id){
                        data[data.length-1].log.push({reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                    }
                    else {
                        data.push({name: rowdata.name, session_id: rowdata.session_id, time: timeDiffArr, log: [{reps:rowdata.reps, weight:rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
            
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getFollowsWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getFollowsWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    updateUserWorkoutHistoryAdd: async(uid, workout_id) => {
        const fields1 = 'add_num, finish_num, userinfo_uid, workout_workout_id';
        const questions1 = `?, ?, ?, ?`;
        const values1 = [0, 0, uid, workout_id];
        const query1 = `INSERT IGNORE INTO ${table_userWorkoutHistory}(${fields1}) VALUES(${questions1})`;
        const query2 = `UPDATE ${table_userWorkoutHistory} SET add_num = add_num+1 WHERE userinfo_uid = "${uid}" AND workout_workout_id="${workout_id}"`;
        try {
            const result1 = await pool.queryParamArrMaster(query1, values1);
            const result2 = await pool.queryParamMaster(query2);
            return true;
        } catch (error) {
            if (err.errno == 1062) {
                console.log('updateUserWorkoutHistoryAdd Error : ', err.errno, err.code);
                return -1;
            }
            console.log('updateUserWorkoutHistoryAdd Error : ', err);
            throw err;
        }
    },
    updateUserWorkoutHistoryFinish: async(uid, workout_id) => {
        const query = `UPDATE ${table_userWorkoutHistory} SET finish_num = finish_num+1 WHERE userinfo_uid = "${uid}" AND workout_workout_id="${workout_id}"`;
        try {
            const result = await pool.queryParamMaster(query);
            return true;
        } catch (error) {
            if (err.errno == 1062) {
                console.log('updateUserWorkoutHistoryFinish Error : ', err.errno, err.code);
                return -1;
            }
            console.log('updateUserWorkoutHistoryFinish Error : ', err);
            throw err;
        }
    }
}


module.exports = workout;