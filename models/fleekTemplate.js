const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');

const table_templateUsers = 'templateUsers';
const table_templateUsersDetails = 'templateUsersDetails';
const table_templateDefaultGroup = 'templateDefaultGroup';
const table_templateDefault = 'templateDefault';
const table_templateDefaultDetails = 'templateDefaultDetails';

const getUserInfo = require('../modules/functionFleek/getUserInfo');
const getUserNextWorkoutPlanHierarchy = require('../modules/functionFleek/getUserNextWorkoutPlanHierarchy');

const template = {
    postTemplateData: async (uid, name, data) => {
        const fields1 = 'name, userinfo_uid';
        const fields2 = 'workout_order, workout_workout_id, templateUsers_template_id, workout_detail';
        const questions1 = '?, ?';
        const questions2 = '?, ?, ?, ?'
        const values1 = [name, uid];
        const query1 = `INSERT INTO ${table_templateUsers}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;
        try {
            const result1 = await pool.queryParamArrMaster(query1, values1);

            const {sex, percentage, ageGroup, weightGroup} = await getUserInfo(uid);

            const addTemplateDetails = async() => {
                let cnt = 1;
                await asyncForEach(data, async(workout) => {
                    const detail_plan = await getUserNextWorkoutPlanHierarchy(uid, workout, sex, ageGroup, weightGroup, percentage);
                    await pool.queryParamArrMaster(query2, [cnt++, workout, result1.insertId, JSON.stringify(detail_plan)]);
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
    postDefaultTemplateData: async(uid, default_template_group_id, index) => {
        const fields1 = 'sub_name, workout_workout_id'
        const fields2 = 'name, userinfo_uid';
        const fields3 = 'workout_order, workout_workout_id, templateUsers_template_id, workout_detail';
        const questions2 = '?, ?';
        const questions3 = '?, ?, ?, ?'
        const query1 = `SELECT ${fields1} FROM ${table_templateDefault}
                        INNER JOIN ${table_templateDefaultDetails} ON ${table_templateDefault}.templateDefault_id = ${table_templateDefaultDetails}.templateDefault_template_id
                        WHERE ${table_templateDefault}.templateDefaultGroup_templateDefaultGroup_id = ${default_template_group_id} AND ${table_templateDefault}.templateDefault_index = ${index}`;
        
        const query2 = `INSERT INTO ${table_templateUsers}(${fields2}) VALUES(${questions2})`;
        const query3 = `INSERT INTO ${table_templateUsersDetails}(${fields3}) VALUES(${questions3})`;
        const query4 = `UPDATE ${table_templateDefaultGroup} SET popularity=popularity+1
                        WHERE ${table_templateDefaultGroup}.templateDefaultGroup_id = ${default_template_group_id}`;
        
        let transactionArr = new Array();
        
        let name;
        const restructure = async (result) => {
            let data = [];
            name = result[0].sub_name;
            await asyncForEach(result, async(rowdata) => {
                data.push(rowdata.workout_workout_id);
            });
            return data;
        }
        try {//transactionArr.push({query: query1, value: null});
            const {sex, percentage, ageGroup, weightGroup} = await getUserInfo(uid);
            const result1 = await pool.queryParamMaster(query1);
            const workoutData = await restructure(result1);
            const result2 = await pool.queryParamArrMaster(query2, [name, uid]);
            //transactionArr.push({query: query2, value: [name, uid]});
            const addTemplateDetails = async() => {
                let cnt = 1;
                await asyncForEach(workoutData, async(workout) => {
                    const detail_plan = await getUserNextWorkoutPlanHierarchy(uid, workout, sex, ageGroup, weightGroup, percentage);
                    await pool.queryParamArrMaster(query3, [cnt++, workout, result2.insertId, JSON.stringify(detail_plan)]);
                    //transactionArr.push({query: query3, value: [cnt++, workout, result2.insertId, JSON.stringify(detail_plan)]});
                });
            }
            await addTemplateDetails();

            await pool.queryParamMaster(query4);
            //transactionArr.push({query: query4, value: null});
            //const result = await pool.Transaction(transactionArr);
            return result2.insertId;
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
        const fields = 'name, templateUsers_id, workout_workout_id, lastdate, workout_detail';
        const query = `SELECT ${fields} FROM ${table_templateUsers}
                        INNER JOIN ${table_templateUsersDetails} ON ${table_templateUsers}.templateUsers_id = ${table_templateUsersDetails}.templateUsers_template_id AND ${table_templateUsers}.userinfo_uid = '${uid}' AND ${table_templateUsers}.is_deleted != 1`;
        try {
            const result = await pool.queryParamSlave(query);
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){
                        data.push({name: rowdata.name, template_id: rowdata.templateUsers_id, last_date: rowdata.lastdate, detail: [{workout_id: rowdata.workout_workout_id, workout_detail: JSON.parse(rowdata.workout_detail)}]});
                    }
                    else if (data[data.length-1].template_id == rowdata.templateUsers_id){
                        data[data.length-1].detail.push({workout_id: rowdata.workout_workout_id, workout_detail: JSON.parse(rowdata.workout_detail)});
                    }
                    else {
                        data.push({name: rowdata.name, template_id: rowdata.templateUsers_id, last_date: rowdata.lastdate, detail: [{workout_id: rowdata.workout_workout_id, workout_detail: JSON.parse(rowdata.workout_detail)}]});
                    }
                });
                return data;
            }
            const data = await restructure();
            console.log(data)
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
        const fields = 'templateDefaultGroup_id, name, target, split, popularity, templateDefault_id, workout_workout_id, sub_name, templateDefault_index';
        const query = `SELECT ${fields} FROM ${table_templateDefaultGroup}
                        INNER JOIN ${table_templateDefault} ON ${table_templateDefaultGroup}.templateDefaultGroup_id = ${table_templateDefault}.templateDefaultGroup_templateDefaultGroup_id
                        INNER JOIN ${table_templateDefaultDetails} ON ${table_templateDefault}.templateDefault_id = ${table_templateDefaultDetails}.templateDefault_template_id`;
        try {
            const result = await pool.queryParamSlave(query);
            const restructure = async() => {
                let data = [];
                await asyncForEach(result, async(rowdata) => {
                    if (data.length == 0){
                        data.push({default_template_group_id: rowdata.templateDefaultGroup_id, name: rowdata.name, target: rowdata.target, split: rowdata.split, popularity: rowdata.popularity, default_template: [{index: rowdata.templateDefault_index, default_template_id: rowdata.templateDefault_id, sub_name: rowdata.sub_name, detail: [rowdata.workout_workout_id]}]})
                    }   
                    else if (data[data.length-1].default_template_group_id == rowdata.templateDefaultGroup_id){
                        const length = data[data.length-1].default_template.length
                        if (data[data.length-1].default_template[length-1].default_template_id == rowdata.templateDefault_id) {
                            data[data.length-1].default_template[length-1].detail.push(rowdata.workout_workout_id);
                        }
                        else {
                            data[data.length-1].default_template.push({index: rowdata.templateDefault_index, default_template_id: rowdata.templateDefault_id, sub_name: rowdata.sub_name, detail: [rowdata.workout_workout_id]});
                        }
                    }
                    else {
                        data.push({default_template_group_id: rowdata.templateDefaultGroup_id, name: rowdata.name, target: rowdata.target, split: rowdata.split, popularity: rowdata.popularity, default_template: [{index: rowdata.templateDefault_index, default_template_id: rowdata.templateDefault_id, sub_name: rowdata.sub_name, detail: [rowdata.workout_workout_id]}]})
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
        
        let transactionArr = new Array();

        const addTemplateDetails = async() => {
            let cnt = 1;
            await asyncForEach(data, async(workout) => {
                transactionArr.push({query: query2, value: [cnt++, workout, template_id]});
            });
        }
       
        try {
            transactionArr.push({query: query1, value: null});
            await addTemplateDetails();
            transactionArr.push({query: query3, value: null});
            const result = await pool.Transaction(transactionArr);
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
    updateUserTemplate: async(uid, template_id, name, data) => {
        const fields2 = 'workout_order, workout_workout_id, templateUsers_template_id, workout_detail';
        const questions2 = '?, ?, ?, ?'

        const query1 = `DELETE T_details
                        FROM ${table_templateUsersDetails} T_details
                        INNER JOIN ${table_templateUsers} ON T_details.templateUsers_template_id = ${table_templateUsers}.templateUsers_id AND ${table_templateUsers}.userinfo_uid = '${uid}'
                        WHERE T_details.templateUsers_template_id=${template_id}`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;
        const query3 = `UPDATE ${table_templateUsers} SET name='${name}'
                        WHERE ${table_templateUsers}.templateUsers_id = '${template_id}' AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
        
        let transactionArr = new Array();
        
        const addTemplateDetails = async() => {
            let cnt = 1;
            await asyncForEach(data, async(workout) => {
                transactionArr.push({query: query2, value: [cnt++, workout.workout_id, Number(template_id), JSON.stringify(workout.workout_detail)]});
            });
        }
        
        try {
            
            transactionArr.push({query: query1, value: null});
            await addTemplateDetails();
            transactionArr.push({query: query3, value: null});

            await pool.Transaction(transactionArr);
            return template_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('updateUserTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("updateUserTemplate ERROR: ", err);
            throw err;
        }
    },/*
    updateUserTemplate: async(uid, template_id, name, data) => {
        const fields2 = 'workout_order, workout_workout_id, templateUsers_template_id, workout_detail';
        const questions2 = '?, ?, ?, ?'

        const query1 = `DELETE T_details
                        FROM ${table_templateUsersDetails} T_details
                        INNER JOIN ${table_templateUsers} ON T_details.templateUsers_template_id = ${table_templateUsers}.templateUsers_id AND ${table_templateUsers}.userinfo_uid = '${uid}'
                        WHERE T_details.templateUsers_template_id=${template_id}`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;
        const query3 = `UPDATE ${table_templateUsers} SET name='${name}'
                        WHERE ${table_templateUsers}.templateUsers_id = '${template_id}' AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
        try {
            console.log(data)
            await pool.queryParamMaster(query1);
            const addTemplateDetails = async() => {
                let cnt = 1;
                await asyncForEach(data, async(workout) => {
                    console.log(workout)
                    await pool.queryParamArrMaster(query2, [cnt++, workout.workout_id, template_id, JSON.stringify(workout.workout_detail)]);
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
    },*/
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