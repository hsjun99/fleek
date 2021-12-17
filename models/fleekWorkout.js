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
const table_customWorkout = 'customWorkout';
const table_templateUsers = 'templateUsers';
const table_templateUsersDetails = 'templateUsersDetails';
const table_workoutYoutube = 'workoutYoutube';

var admin = require('firebase-admin');

const getWorkoutEquation = require('../modules/functionFleek/getWorkoutEquation');
const getUserRecentRecords = require('../modules/functionFleek/getUserRecentRecords');

const CacheService = require('../modules/cache.service');
const ttl = 60 * 60 * 1; // cache for 1 Hour
const cache = new CacheService(ttl); // Create a new cache service instance

const workout = {
    getWorkoutYoutubeVideoTotal: async() => {
        const fields = 'workout_workout_id, video_id, video_title, channel_name';
        const query = `SELECT ${fields} FROM ${table_workoutYoutube}
                        ORDER BY workout_workout_id`;          
        try {
            const result = await pool.queryParamSlave(query);
            let temp = {};
            await asyncForEach(result, async(rowdata) => {
                if (temp[rowdata.workout_workout_id] == undefined){       
                    temp[rowdata.workout_workout_id] = [{video_id: rowdata.video_id, video_title: rowdata.video_title, channel_name: rowdata.channel_name}];
                } else {
                    temp[rowdata.workout_workout_id].push({video_id: rowdata.video_id, video_title: rowdata.video_title, channel_name: rowdata.channel_name});
                }
            })
            return temp;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getWorkoutYoutubeVideo: async(workout_id) => {
        const fields = 'video_id, video_title, channel_name';
        const query = `SELECT ${fields} FROM ${table_workoutYoutube}
                        WHERE ${table_workoutYoutube}.workout_workout_id = ${workout_id}`;
                            
        try {
            const data = await pool.queryParamSlave(query);
            return data
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    postWorkoutInfoSyncFirebase: async(uid, update_time) => {
        const table_syncTable = await admin.database().ref('syncTable');
        try {
            await table_syncTable.child(uid).update({workoutInfo: update_time});
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getUserTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getUserTemplate ERROR: ", err);
            throw err;
        }
    },
    postCustomWorkout: async(uid, workout_name, muscle_primary, muscle_secondary, equipment, record_type, multiplier, video_url, video_url_substitute, reference_num) => {
        const fields1 = 'korean, english, category, muscle_p, muscle_s1, equipment, record_type, multiplier, video_url, video_url_substitute, is_custom, reference_num';
        const fields2 = 'workout_workout_id, userinfo_uid, created_at';
        const questions1 = `?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?`;
        const questions2 = `?, ?, ?`
        const values1 = [workout_name, 'custom', '-', muscle_primary, muscle_secondary[0], equipment, record_type, multiplier, video_url, video_url_substitute, 1, reference_num];
        const query1 = `INSERT INTO ${table_workout}(${fields1}) VALUES(${questions1})`;

        let transactionArr = new Array();
        let workout_id;

        const ts1 = async(connection) => {
            const result1 = await connection.query(query1, values1);
            workout_id = result1.insertId;
        }
        const ts2 = async(connection) => {
            const values2 = [workout_id, uid, await timeFunction.currentTime()];
            const query2 = `INSERT INTO ${table_customWorkout}(${fields2}) VALUES(${questions2})`;
            await connection.query(query2, values2);
        }

        try {
            transactionArr.push(ts1);
            transactionArr.push(ts2);
            await pool.Transaction(transactionArr);

            return workout_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateProfile ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("updateProfile ERROR: ", err);
            throw err;
        }
    },
    updateCustomWorkout: async(uid, workout_id, workout_name, muscle_primary, muscle_secondary, equipment, record_type, multiplier, video_url, video_url_substitute, reference_num) => {
        const query1 = `UPDATE ${table_workout}
                        SET korean = '${workout_name}', muscle_p = '${muscle_primary}', muscle_s1 = '${muscle_secondary[0]}', equipment = '${equipment}', record_type = '${record_type}', multiplier = '${multiplier}', video_url = '${video_url}', video_url_substitute = '${video_url_substitute}', reference_num = '${reference_num}'
                        WHERE workout_id = ${workout_id} AND is_custom = 1`;

        try {
            await pool.queryParamMaster(query1);

            return workout_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateProfile ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("updateProfile ERROR: ", err);
            throw err;
        }
    },
    deleteCustomWorkout: async(uid, workout_id, template_data) => {
        const query1 = `UPDATE ${table_customWorkout} SET is_deleted = 1 WHERE workout_workout_id = ${workout_id} AND userinfo_uid = '${uid}'`;
        
        // Transactions
        let transactionArr = new Array();
        const ts1 = async(connection) => {
            await connection.query(query1);
        }
        const ts2 = async(connection) => {
            await Promise.all(template_data.map(async(template) => {
                let detail_final = await Promise.all(template.detail.map(async(detail) => {
                    if (detail.workout_id == workout_id) {
                        return null;
                    } else {
                        return detail;
                    }
                }))
                detail_final = detail_final.filter(item => item); // remove null

                // Update Template Detail
                const fields3 = 'workout_order, workout_workout_id, rest_time, templateUsers_template_id, workout_detail';
                const question3 = '?, ?, ?, ?, ?'
                
                const query2 = `DELETE T_details
                                FROM ${table_templateUsersDetails} T_details
                                INNER JOIN ${table_templateUsers} ON T_details.templateUsers_template_id = ${table_templateUsers}.templateUsers_id AND ${table_templateUsers}.userinfo_uid = '${uid}'
                                WHERE T_details.templateUsers_template_id=${template.template_id}`;
                const query3 = `INSERT INTO ${table_templateUsersDetails}(${fields3}) VALUES(${question3})`;
                const query4 = `UPDATE ${table_templateUsers} SET is_deleted = 1
                                WHERE ${table_templateUsers}.templateUsers_id = '${template.template_id}' AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
                await connection.query(query2);
                let cnt = 1;
                await asyncForEach(detail_final, async(workout) => {
                    await connection.query(query3, [cnt++, workout.workout_id, workout.rest_time, Number(template.template_id), JSON.stringify(workout.workout_detail)]);
                });
                if (detail_final.length == 0) {
                    await connection.query(query4);
                }
            }))
        }
        try {
            transactionArr.push(ts1);
            transactionArr.push(ts2);

            await pool.Transaction(transactionArr);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getOthersCustomWorkouts: async(other_uid, sex, ageGroup, weightGroup) => {
        const fields = `workout_id, english, korean, category, muscle_p, muscle_s1, muscle_s2, muscle_s3, muscle_s4, muscle_s5, muscle_s6, equipment, record_type, multiplier, min_step, tier, is_custom, video_url, video_url_substitute, reference_num, inclination, intercept`;
        const query = `SELECT ${fields} FROM ${table_workout}
                        LEFT JOIN ${table_equation} ON ${table_workout}.workout_id = ${table_equation}.workout_workout_id
                        LEFT JOIN ${table_customWorkout} ON ${table_workout}.workout_id = ${table_customWorkout}.workout_workout_id AND ${table_customWorkout}.userinfo_uid = '${other_uid}'
                        WHERE ${table_workout}.workout_id != 135
                            AND (inclination IS NULL
                                    OR (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}"))
                            AND (is_custom = 1 AND ${table_customWorkout}.is_deleted != 1)`;
        try {
            const result = await pool.queryParamSlave(query);
            return result;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getWorkoutInfo: async(workout_id) => {
        const query = `SELECT * FROM ${table_workout}
                        WHERE ${table_workout}.workout_id = ${workout_id}`;
                            
        try {
            const data = await pool.queryParamSlave(query);
            return {
                workout_id: workout_id,
                english: data[0].english,
                korean: data[0].korean,
                category: data[0].category,
                muscle_primary: data[0].muscle_p,
                muscle_secondary: [data[0].muscle_s1, data[0].muscle_s2, data[0].muscle_s3, data[0].muscle_s4, data[0].muscle_s5, data[0].muscle_s6],
                equipment: data[0].equipment,
                record_type: data[0].record_type,
                multiplier: data[0].multiplier,
                min_step: data[0].min_step,
                tier: data[0].tier,
                is_custom: data[0].is_custom,
                popularity: data[0].popularity,
                video_url: data[0].video_url,
                video_url_substitute: data[0].video_url_substitute,
                reference_num: data[0].reference_num,
                
            }
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getWorkoutTablePure: async(uid) => {
        const fields1 = `workout_id, english, korean, category, muscle_p, muscle_s1, muscle_s2, muscle_s3, muscle_s4, muscle_s5, muscle_s6, equipment, record_type, multiplier, min_step, tier, is_custom, video_url, video_url_substitute, reference_num`;
        const fields2 = `workout_id, english, korean, category, muscle_p, muscle_s1, muscle_s2, muscle_s3, muscle_s4, muscle_s5, muscle_s6, equipment, record_type, multiplier, min_step, tier, is_custom, video_url, video_url_substitute, reference_num, ${table_customWorkout}.is_deleted`;
        const query1 = `SELECT ${fields1} FROM ${table_workout}
                        WHERE ${table_workout}.workout_id != 135
                                AND is_custom = 0`;
        const query2 = `SELECT ${fields2} FROM ${table_workout}
                        INNER JOIN ${table_customWorkout} ON ${table_workout}.workout_id = ${table_customWorkout}.workout_workout_id AND ${table_customWorkout}.userinfo_uid = '${uid}'`;
        try {
            const key = `workoutTable`; // Cache Key
            const [data_original, data_custom] = await Promise.all([
                await cache.get(key, async () => {
                    console.log("No Cache")
                    const data = await pool.queryParamSlave(query1);
                    return data;
                }),
                await pool.queryParamSlave(query2)
            ]);
            const data = data_original.concat(data_custom);
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
    getWorkoutTable: async(uid, sex, ageGroup, weightGroup) => {
        const fields = `workout_id, english, korean, category, muscle_p, muscle_s1, muscle_s2, muscle_s3, muscle_s4, muscle_s5, muscle_s6, equipment, record_type, multiplier, min_step, tier, is_custom, video_url, video_url_substitute, reference_num, inclination, intercept, ${table_customWorkout}.is_deleted, userinfo_uid`;
        const query = `SELECT ${fields} FROM ${table_workout}
                        LEFT JOIN ${table_equation} ON ${table_workout}.workout_id = ${table_equation}.workout_workout_id
                        LEFT JOIN ${table_customWorkout} ON ${table_workout}.workout_id = ${table_customWorkout}.workout_workout_id AND ${table_customWorkout}.userinfo_uid = '${uid}'
                        WHERE ${table_workout}.workout_id != 135
                            AND (inclination IS NULL
                                    OR (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}"))
                            AND (${table_customWorkout}.userinfo_uid = '${uid}' OR is_custom = 0)
                                    `;

                        //AND (is_custom = 0
                        //OR (is_custom = 1 AND ${table_customWorkout}.is_deleted != 1))
        try {
            const result = await pool.queryParamSlave(query);
            return result;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getCalendarDataBySession: async(uid, sex, ageGroup, weightGroup, session_id) => {
        const fields = `${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.session_session_id, ${table_templateUsers}.templateUsers_id, ${table_templateUsers}.name, workout_order, set_order, max_one_rm, total_volume, max_volume, total_reps, max_weight, ${table_session}.created_at, ${table_session}.total_time, inclination, intercept`;
        const query = `SELECT ${fields} FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.session_id = ${session_id}
                        LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = ${table_session}.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
                        LEFT JOIN ${table_equation} ON ${table_equation}.workout_workout_id = ${table_workoutlog}.workout_workout_id AND (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}")
                        ORDER BY ${table_session}.created_at ASC, ${table_session}.session_id ASC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamMaster(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    let percentage=null;
                    if (rowdata.inclination != null && rowdata.intercept != null && rowdata.max_one_rm != 0 && rowdata.max_one_rm != null) {
                        percentage = Math.round(rowdata.inclination * Math.log(rowdata.max_one_rm) + rowdata.intercept);
                    }
                    if (data.length == 0){
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: rowdata.name, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_session_id){
                        const L = data[data.length-1].session_detail.content.length
                        if (data[data.length-1].session_detail.content[L-1].workout_id == rowdata.workout_workout_id) {
                            data[data.length-1].session_detail.content[L-1].sets.push({reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                        }
                        else {
                            data[data.length-1].session_detail.content.push({workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}});
                        }
                    }
                    else {
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: rowdata.name, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
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
    getCalendarData: async(uid, sex, ageGroup, weightGroup) => {
        const fields = `${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.session_session_id, ${table_templateUsers}.templateUsers_id, ${table_templateUsers}.name, workout_order, set_order, max_one_rm, total_volume, max_volume, total_reps, max_weight, ${table_session}.created_at, ${table_session}.total_time, inclination, intercept`;
        const query = `SELECT ${fields} FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_session}.is_deleted != 1
                        LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = ${table_session}.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
                        LEFT JOIN ${table_equation} ON ${table_equation}.workout_workout_id = ${table_workoutlog}.workout_workout_id AND (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}")
                        ORDER BY ${table_session}.created_at ASC, ${table_session}.session_id ASC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        
        // const query = `SELECT ${fields} FROM ${table_workoutlog}
        //                 INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_session}.is_deleted != 1
        //                 LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = ${table_session}.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
        //                 LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
        //                 LEFT JOIN ${table_equation} ON ${table_equation}.workout_workout_id = ${table_workoutlog}.workout_workout_id AND (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}")
        //                 ORDER BY ${table_session}.created_at ASC, ${table_session}.session_id ASC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamMaster(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    let percentage=null;
                    if (rowdata.inclination != null && rowdata.intercept != null && rowdata.max_one_rm != 0 && rowdata.max_one_rm != null) {
                        percentage = Math.round(rowdata.inclination * Math.log(rowdata.max_one_rm) + rowdata.intercept);
                    }
                    if (data.length == 0){
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: rowdata.name, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_session_id){
                        const L = data[data.length-1].session_detail.content.length
                        if (data[data.length-1].session_detail.content[L-1].workout_id == rowdata.workout_workout_id) {
                            data[data.length-1].session_detail.content[L-1].sets.push({reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                        }
                        else {
                            data[data.length-1].session_detail.content.push({workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}});
                        }
                    }
                    else {
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: rowdata.name, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
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
    getUserHistoryDataBySession: async(uid, sex, ageGroup, weightGroup, session_id) => {
        const fields = `${table_session}.name AS session_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.super_set_label, ${table_workoutlog}.session_session_id, ${table_templateUsers}.templateUsers_id, ${table_templateUsers}.name AS template_name, workout_order, set_order, max_one_rm, total_volume, max_volume, total_reps, max_weight, ${table_session}.created_at, ${table_session}.start_time, ${table_session}.total_time, inclination, intercept`;
        const query = `SELECT ${fields} FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.session_id = ${session_id}
                        LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = ${table_session}.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
                        LEFT JOIN ${table_equation} ON ${table_equation}.workout_workout_id = ${table_workoutlog}.workout_workout_id AND (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}")
                        ORDER BY ${table_session}.created_at ASC, ${table_session}.session_id ASC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamMaster(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    // rowdata.max_heart_rate = 50;
                    let percentage=null;
                    if (rowdata.inclination != null && rowdata.intercept != null && rowdata.max_one_rm != 0 && rowdata.max_one_rm != null) {
                        percentage = Math.round(rowdata.inclination * Math.log(rowdata.max_one_rm) + rowdata.intercept);
                    }
                    if (data.length == 0){
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: (rowdata.session_name != null ? rowdata.session_name : rowdata.template_name), session_detail: {created_at: rowdata.created_at, start_time: rowdata.start_time, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_session_id){
                        const L = data[data.length-1].session_detail.content.length
                        if (data[data.length-1].session_detail.content[L-1].workout_id == rowdata.workout_workout_id) {
                            data[data.length-1].session_detail.content[L-1].sets.push({reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                        }
                        else {
                            data[data.length-1].session_detail.content.push({workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}});
                        }
                    }
                    else {
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: (rowdata.session_name != null ? rowdata.session_name : rowdata.template_name), session_detail: {created_at: rowdata.created_at, start_time: rowdata.start_time, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
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
    getUserHistoryDataAll: async(uid, sex, ageGroup, weightGroup) => {
        const fields = `${table_session}.name AS session_name, ${table_session}.device, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.super_set_label, ${table_workoutlog}.session_session_id, ${table_templateUsers}.templateUsers_id, ${table_templateUsers}.name AS template_name, workout_order, set_order, ${table_session}.created_at, ${table_session}.start_time, ${table_session}.total_time, inclination, intercept`;
        const query = `SELECT ${fields} FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_session}.is_deleted != 1
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
                        LEFT JOIN ${table_equation} ON ${table_equation}.workout_workout_id = ${table_workoutlog}.workout_workout_id AND (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}")
                        ORDER BY ${table_session}.created_at ASC, ${table_session}.session_id ASC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamMaster(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    // rowdata.max_heart_rate = 50;
                    // let percentage=null;
                    // if (rowdata.inclination != null && rowdata.intercept != null && rowdata.max_one_rm != 0 && rowdata.max_one_rm != null) {
                    //     percentage = Math.round(rowdata.inclination * Math.log(rowdata.max_one_rm) + rowdata.intercept);
                    // }
                    if (data.length == 0){
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: (rowdata.session_name != null ? rowdata.session_name : rowdata.template_name), device: rowdata.device, session_detail: {start_time: rowdata.start_time, created_at: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]}]}});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_session_id){
                        const L = data[data.length-1].session_detail.content.length
                        if (data[data.length-1].session_detail.content[L-1].workout_id == rowdata.workout_workout_id) {
                            data[data.length-1].session_detail.content[L-1].sets.push({reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                        }
                        else {
                            data[data.length-1].session_detail.content.push({workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]});
                        }
                    }
                    else {
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: (rowdata.session_name != null ? rowdata.session_name : rowdata.template_name), device: rowdata.device, session_detail: {start_time: rowdata.start_time, created_at: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}]}]}});
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
    getUserHistoryDataPartial: async(uid, sex, ageGroup, weightGroup, mobileLastUpdateTime) => {
        const fields = `${table_session}.device, ${table_session}.is_deleted, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.workout_workout_id,  ${table_workoutlog}.session_session_id, ${table_templateUsers}.templateUsers_id, ${table_templateUsers}.name, workout_order, set_order, max_one_rm, total_volume, max_volume, total_reps, max_weight, ${table_session}.created_at, ${table_session}.total_time, inclination, intercept`;
        const query = `SELECT ${fields} FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_session}.last_update IS NOT NULL AND ${table_session}.last_update > ${mobileLastUpdateTime}
                        LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = ${table_session}.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
                        LEFT JOIN ${table_equation} ON ${table_equation}.workout_workout_id = ${table_workoutlog}.workout_workout_id AND (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}")
                        ORDER BY ${table_session}.created_at ASC, ${table_session}.session_id ASC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamMaster(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    let percentage=null;
                    if (rowdata.inclination != null && rowdata.intercept != null && rowdata.max_one_rm != 0 && rowdata.max_one_rm != null) {
                        percentage = Math.round(rowdata.inclination * Math.log(rowdata.max_one_rm) + rowdata.intercept);
                    }
                    if (data.length == 0){
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: rowdata.name, device: rowdata.device, is_deleted: rowdata.is_deleted, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_session_id){
                        const L = data[data.length-1].session_detail.content.length
                        if (data[data.length-1].session_detail.content[L-1].workout_id == rowdata.workout_workout_id) {
                            data[data.length-1].session_detail.content[L-1].sets.push({reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                        }
                        else {
                            data[data.length-1].session_detail.content.push({workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}});
                        }
                    }
                    else {
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: rowdata.name, device: rowdata.device, is_deleted: rowdata.is_deleted, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
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
    getUserHistoryDataBySessionId: async(uid, sessionId, sex, ageGroup, weightGroup) => {
        const fields = `${table_session}.device, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.session_session_id, ${table_templateUsers}.templateUsers_id, ${table_templateUsers}.name, workout_order, set_order, max_one_rm, total_volume, max_volume, total_reps, max_weight, ${table_session}.created_at, ${table_session}.total_time, inclination, intercept`;
        const query = `SELECT ${fields} FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.session_id = ${sessionId} AND ${table_session}.userinfo_uid = '${uid}' AND ${table_session}.is_deleted != 1
                        LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = ${table_session}.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
                        LEFT JOIN ${table_equation} ON ${table_equation}.workout_workout_id = ${table_workoutlog}.workout_workout_id AND (${table_equation}.sex="${sex}" AND (${table_equation}.age="${ageGroup}" OR ${table_equation}.age=8) AND ${table_equation}.weight="${weightGroup}")
                        ORDER BY ${table_session}.created_at ASC, ${table_session}.session_id ASC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
        
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamMaster(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    let percentage=null;
                    if (rowdata.inclination != null && rowdata.intercept != null && rowdata.max_one_rm != 0 && rowdata.max_one_rm != null) {
                        percentage = Math.round(rowdata.inclination * Math.log(rowdata.max_one_rm) + rowdata.intercept);
                    }
                    if (data.length == 0){
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: rowdata.name, device: rowdata.device, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
                    }
                    else if (data[data.length-1].session_id == rowdata.session_session_id){
                        const L = data[data.length-1].session_detail.content.length
                        if (data[data.length-1].session_detail.content[L-1].workout_id == rowdata.workout_workout_id) {
                            data[data.length-1].session_detail.content[L-1].sets.push({reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance});
                        }
                        else {
                            data[data.length-1].session_detail.content.push({workout_id: rowdata.workout_workout_id, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}});
                        }
                    }
                    else {
                        data.push({session_id: rowdata.session_session_id, template_id: rowdata.templateUsers_id, template_name: rowdata.name, device: rowdata.device, session_detail: {date: rowdata.created_at, total_workout_time: rowdata.total_time, content: [{workout_id: rowdata.workout_workout_id, max_heart_rate: rowdata.max_heart_rate, sets: [{reps: rowdata.reps, weight: rowdata.weight, duration: rowdata.duration, distance: rowdata.distance}], workout_ability: {max_one_rm: rowdata.max_one_rm, total_volume: rowdata.total_volume, max_volume: rowdata.max_volume, total_reps: rowdata.total_reps, max_weight: rowdata.max_weight, percentage: percentage}}]}});
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
    getWorkoutRecordTypeById: async (workout_id) => {
        const fields = 'record_type';
        const query = `SELECT ${fields} FROM ${table_workout}
                        WHERE ${table_workout}.workout_id = ${workout_id}`;
        try {
            const result = await pool.queryParamSlave(query);
            if (result.length==0) return -1;
            return result[0].record_type;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutById ERROR: ", err);
            throw err;
        }
    },
    getWorkoutById: async (workout_id, sex, age, weight) => {
        const fields = 'english, korean, category, muscle_p, muscle_s1, muscle_s2, muscle_s3, muscle_s4, muscle_s5, muscle_s6, equipment, record_type, inclination, intercept, video_url, min_step';
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
    getWorkoutRecordTotal: async (uid) => {
        const fields = 'workout_workout_id, reps, weight, duration, distance, set_type, rpe, rest_time, session_session_id, created_at';
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_session}.is_deleted != 1
                        ORDER BY ${table_workoutlog}.workout_workout_id ASC, ${table_session}.created_at DESC, ${table_session}.session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            let temp = {};
            await asyncForEach(result, async(rowdata) => {
                if (temp[rowdata.workout_workout_id] == undefined) {
                    temp[rowdata.workout_workout_id] = [];
                }
                if (temp[rowdata.workout_workout_id].length == 0){       
                    temp[rowdata.workout_workout_id].push([{reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance, set_type:rowdata.set_type, rpe:rowdata.rpe, session_id: rowdata.session_session_id, created_at: rowdata.created_at}]);
                }
                else if (temp[rowdata.workout_workout_id][temp[rowdata.workout_workout_id].length-1][0].session_id == rowdata.session_session_id){
                    temp[rowdata.workout_workout_id][temp[rowdata.workout_workout_id].length-1].push({reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance, set_type:rowdata.set_type, rpe:rowdata.rpe, session_id: rowdata.session_session_id, created_at: rowdata.created_at});
                }
                else {
                    temp[rowdata.workout_workout_id].push([{reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance, set_type:rowdata.set_type, rpe:rowdata.rpe, session_id: rowdata.session_session_id, created_at: rowdata.created_at}]);
                }
            })
            return temp;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
            throw err;
        }
    },
    getWorkoutRecordById: async (workout_id, uid) => {
        const fields = 'reps, weight, duration, distance, set_type, rpe, rest_time, session_session_id, created_at';
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_workoutlog}.workout_workout_id = ${workout_id} AND ${table_session}.is_deleted != 1
                        ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            let rest_time = 0; // default;
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){       
                        data.push([{reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance, set_type:rowdata.set_type, rpe:rowdata.rpe, session_id: rowdata.session_session_id, created_at: rowdata.created_at}]);
                    }
                    else if (data[data.length-1][0].session_id == rowdata.session_session_id){
                        data[data.length-1].push({reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance, set_type:rowdata.set_type, rpe:rowdata.rpe, session_id: rowdata.session_session_id, created_at: rowdata.created_at});
                    }
                    else {
                        data.push([{reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance, set_type:rowdata.set_type, rpe:rowdata.rpe, session_id: rowdata.session_session_id, created_at: rowdata.created_at}]);
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
    getMostRecentWorkoutRecordById: async (workout_id, uid) => {
        const fields = `${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance`;
        const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN
                        (SELECT DISTINCT ${table_session}.session_id, ${table_session}.created_at, ${table_session}.userinfo_uid
                        FROM ${table_session}
                        INNER JOIN ${table_workoutlog} ON ${table_workoutlog}.session_session_id = ${table_session}.session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id} AND ${table_session}.is_deleted != 1
                        WHERE ${table_session}.userinfo_uid = '${uid}'
                        ORDER BY ${table_workoutlog}.session_session_id DESC
                        LIMIT 1) AS DISTINCT_SESSION
                        ON DISTINCT_SESSION.session_id = ${table_workoutlog}.session_session_id AND ${table_workoutlog}.workout_workout_id = ${workout_id}
                        INNER JOIN ${table_userinfo} ON DISTINCT_SESSION.userinfo_uid = ${table_userinfo}.uid
                        ORDER BY ${table_workoutlog}.session_session_id DESC, ${table_workoutlog}.set_order ASC`;
        try {
            let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){
                        data.push([{reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance}]);
                    }
                    else if (data[data.length-1][0].session_id == rowdata.session_session_id){
                        data[data.length-1].push({reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance});
                    }
                    else {
                        data.push([{reps:rowdata.reps, weight:rowdata.weight, duration:rowdata.duration, distance:rowdata.distance}]);
                    }
                });
                return data;
            }
            const recentRecords = await restructure();
            return recentRecords;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getWorkoutRecordById ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getWorkoutRecordById ERROR: ", err);
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
    },
    getWorkoutsPreviewData: async (uid, workout_id) => {
        const fields1 = 'finish_num';
        const fields2 = 'MAX(max_one_rm) AS one_rm_MAX';
        const fields3 = 'SUM(reps) AS reps_SUM';
        const query1 = `SELECT ${fields1} FROM ${table_userWorkoutHistory}
                        WHERE ${table_userWorkoutHistory}.userinfo_uid = '${uid}' AND ${table_userWorkoutHistory}.workout_workout_id=${workout_id}`;
        const query2 = `SELECT ${fields2} FROM ${table_workoutAbility}
                        INNER JOIN ${table_session}
                        ON ${table_session}.session_id = ${table_workoutAbility}.session_session_id AND ${table_workoutAbility}.userinfo_uid = '${uid}' AND ${table_workoutAbility}.workout_workout_id = ${workout_id} AND ${table_session}.is_deleted != 1`;
        const query3 = `SELECT ${fields3} FROM ${table_workoutlog}
                        INNER JOIN ${table_session}
                        ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_workoutlog}.workout_workout_id = ${workout_id} AND ${table_session}.is_deleted != 1`;
        try {
            const result1 = await pool.queryParamSlave(query1);
            const result2 = await pool.queryParamSlave(query2);
            const result3 = await pool.queryParamSlave(query3);
            const data = {
                workout_id: workout_id,
                one_rm: null,
                total_days: null,
                total_reps: null
            }
            if (result1.length > 0) data.total_days = result1[0].finish_num;
            if (result2.length > 0) data.one_rm = Math.round(result2[0].one_rm_MAX);
            if (result3.length > 0) data.total_reps = result3[0].reps_SUM;
            return data;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getDashboardRecords ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("ggetDashboardRecords ERROR: ", err);
            throw err;
        }
    },
    getSubstituteWorkout: async (workout_id) => {
        const fields1 = 'category, muscle_p, muscle_s1, tier';
        const query1 = `SELECT ${fields1} FROM ${table_workout}
                        WHERE workout_id = ${workout_id}`;
        try{
            const result1 = await pool.queryParamSlave(query1);
            const fields2 = `workout_id, (0.6*("${result1[0].category}"=category) + 0.2*(${result1[0].muscle_p}=muscle_p) + 0.15*(${result1[0].muscle_s1}=muscle_s1) + ${Math.random()*2-1}*(${result1[0].tier}=tier)) AS SCORE`;
            const query2 = `SELECT ${fields2} FROM ${table_workout}
                            WHERE workout_id != ${workout_id} AND workout_id != 135
                            ORDER BY SCORE DESC
                            LIMIT 10`;
            const result2 = await pool.queryParamSlave(query2);
            const restructure = async() => {
                let data = [];
                await asyncForEach(result2, async(rowdata) => {
                    data.push(rowdata.workout_id);
                });
                return data;
            }
            const data = await restructure();
            return data;
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

module.exports = workout;