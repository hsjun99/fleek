const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table_templateUsers = 'templateUsers';
const table_templateUsersDetails = 'templateUsersDetails';
const table_templateDefault = 'templateDefault';
const table_templateDefaultDetails = 'templateDefaultDetails';

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
            const result1 = await pool.queryParamSlave(query1);
            if (result1.length == 0){
                return {
                    session_time_avg: null,
                    session_volume_avg: null,
                    session_reps_avg: null,
                    session_sets_avg: null
                }
            } else {
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
        const query1 = `SELECT ${fields1} FROM ${table_userWorkoutHistory}
                        WHERE ${table_userWorkoutHistory}.userinfo_uid = '${uid}' AND ${table_userWorkoutHistory}.finish_num != 0
                        ORDER BY ${table_userWorkoutHistory}.finish_num DESC
                        LIMIT 5`;
        try {
            const result1 = await pool.queryParamSlave(query1);
            const restructure = async() => {
                let data = [];
                await asyncForEach(result1, async(rowdata) => {
                    const query2 = `SELECT ${fields2} FROM ${table_workoutAbility}
                                    INNER JOIN ${table_session}
                                    ON ${table_session}.session_id = ${table_workoutAbility}.session_session_id AND ${table_workoutAbility}.userinfo_uid = '${uid}' AND ${table_workoutAbility}.workout_workout_id = ${rowdata.workout_workout_id} AND ${table_session}.is_deleted != 1`;
                    const query3 = `SELECT ${fields3} FROM ${table_workoutlog}
                                    INNER JOIN ${table_session}
                                    ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.userinfo_uid = '${uid}' AND ${table_workoutlog}.workout_workout_id = ${rowdata.workout_workout_id} AND ${table_session}.is_deleted != 1`;
                    const oneRmData = await pool.queryParamSlave(query2);
                    const totalRepsData = await pool.queryParamSlave(query3);
                    data.push({workout_id: rowdata.workout_workout_id, one_rm: Math.round(oneRmData[0].one_rm_MAX), total_days: rowdata.finish_num, total_reps: totalRepsData[0].reps_SUM});
                });
                return data;
            }
            const data = await restructure();
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
    postTemplateData: async (uid, name, data) => {
        const fields1 = 'name, userinfo_uid';
        const fields2 = 'workout_order, workout_workout_id, templateUsers_template_id';
        const questions1 = '?, ?';
        const questions2 = '?, ?, ?'
        const values1 = [name, uid];
        const query1 = `INSERT INTO ${table_templateUsers}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;
        try {
            const result1 = await pool.queryParamArrMaster(query1, values1);
            const addTemplateDetails = async() => {
                let cnt = 1;
                await asyncForEach(data, async(workout) => {
                    await pool.queryParamArrMaster(query2, [cnt++, workout, result1.insertId]);
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
        const fields = 'name, templateUsers_id, workout_workout_id';
        const query = `SELECT ${fields} FROM ${table_templateUsers}
                        INNER JOIN ${table_templateUsersDetails} ON ${table_templateUsers}.templateUsers_id = ${table_templateUsersDetails}.templateUsers_template_id AND ${table_templateUsers}.userinfo_uid = '${uid}' AND ${table_templateUsers}.is_deleted != 1`;
        try {
            const result = await pool.queryParamSlave(query);
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    
                    if (data.length == 0){
                        data.push({name: rowdata.name, template_id: rowdata.templateUsers_id, detail: [rowdata.workout_workout_id]});
                    }
                    
                    else if (data[data.length-1].template_id == rowdata.templateUsers_id){
                        data[data.length-1].detail.push(rowdata.workout_workout_id);
                    }
                    else {
                        data.push({name: rowdata.name, template_id: rowdata.templateUsers_id, detail: [rowdata.workout_workout_id]});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getUserTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getUserTemplate ERROR: ", err);
            throw err;
        }
    },
    getDefaultTemplate: async() => {
        const fields = 'name, templateDefault_id, workout_workout_id';
        const query = `SELECT ${fields} FROM ${table_templateDefault}
                        INNER JOIN ${table_templateDefaultDetails} ON ${table_templateDefault}.templateDefault_id = ${table_templateDefaultDetails}.templateDefault_template_id`;
        try {
            const result = await pool.queryParamSlave(query);
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){
                        data.push({name: rowdata.name, default_template_id: rowdata.templateDefault_id, detail: [rowdata.workout_workout_id]});
                    }   
                    else if (data[data.length-1].default_template_id == rowdata.templateDefault_id){
                        data[data.length-1].detail.push(rowdata.workout_workout_id);
                    }
                    else {
                        data.push({name: rowdata.name, default_template_id: rowdata.templateDefault_id, detail: [rowdata.workout_workout_id]});
                    }
                });
                return data;
            }
            const data = await restructure();
            return data;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getUserTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getUserTemplate ERROR: ", err);
            throw err;
        }
    },
    updateUserTemplate: async(uid, template_id, name, data) => {
        const fields2 = 'workout_order, workout_workout_id, templateUsers_template_id';
        const questions2 = '?, ?, ?'

        const query1 = `DELETE T_details
                        FROM ${table_templateUsersDetails} T_details
                        INNER JOIN ${table_templateUsers} ON T_details.templateUsers_template_id = ${table_templateUsers}.templateUsers_id AND ${table_templateUsers}.userinfo_uid = '${uid}'
                        WHERE T_details.templateUsers_template_id=${template_id}`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;
        const query3 = `UPDATE ${table_templateUsers} SET name='${name}'
                        WHERE ${table_templateUsers}.templateUsers_id = '${template_id}' AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
        try {
            await pool.queryParamMaster(query1);
            const addTemplateDetails = async() => {
                let cnt = 1;
                await asyncForEach(data, async(workout) => {
                    await pool.queryParamArrMaster(query2, [cnt++, workout, template_id]);
                });
            }
            await addTemplateDetails();
            await pool.queryParamMaster(query3);
            return template_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateUserTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("updateUserTemplate ERROR: ", err);
            throw err;
        }
    },
    deleteUserTemplate: async(uid, template_id) => {
        const query = `UPDATE ${table_templateUsers} SET is_deleted=1
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id} AND ${table_templateUsers}.userinfo_uid = "${uid}"`;
        try {
            await pool.queryParamMaster(query);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('deleteTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("deleteTemplate ERROR: ", err);
            throw err;
        }
        /*
        const query1 = `DELETE T_details
                        FROM ${table_templateUsersDetails} T_details
                        INNER JOIN ${table_templateUsers} ON T_details.templateUsers_template_id = ${table_templateUsers}.templateUsers_id AND ${table_templateUsers}.userinfo_uid = '${uid}'
                        WHERE T_details.templateUsers_template_id=${template_id}`;
        const query2 = `DELETE FROM ${table_templateUsers}
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id}`
        try {
            await pool.queryParamMaster(query1);
            await pool.queryParamMaster(query2);
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('deleteUserTemplate ERROR : ', err.errno, err.code);
                return -1;
            }
            console.log('deleteUserTemplate ERROR : ', err);
            throw err;
        }*/
    },
    checkTemplate: async(uid, template_id) => {
        const query = `SELECT templateUsers_id FROM ${table_templateUsers}
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id} AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
        try {
            const result = await pool.queryParamMaster(query);
            if (result.length == 0) return false;
            return true;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('deleteUserTemplate ERROR : ', err.errno, err.code);
                return -1;
            }
            console.log('deleteUserTemplate ERROR : ', err);
            throw err;
        }
    }
}

module.exports = template;