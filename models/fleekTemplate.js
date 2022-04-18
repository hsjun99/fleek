const pool = require('../modules/pool');
const asyncForEach = require('../modules/function/asyncForEach');
const timeFunction = require('../modules/function/timeFunction');

const table_templateUsers = 'templateUsers';
const table_templateUsersDetails = 'templateUsersDetails';
const table_templateDefaultGroup = 'templateDefaultGroup';
const table_templateDefault = 'templateDefault';
const table_templateDefaultDetails = 'templateDefaultDetails';
const table_workout = 'workout';
const table_customWorkout = 'customWorkout'
const table_session = 'session';

const getUserInfo = require('../modules/functionFleek/getUserInfo');
const getUserNextWorkoutPlanHierarchy = require('../modules/functionFleek/getUserNextWorkoutPlanHierarchy');
const getUserSetting = require('../modules/functionFleek/getUserSetting');

var admin = require('firebase-admin');
// const feedMessage = require('../modules/feedMessage');
const aboutLanguage = require('../modules/function/aboutLanguage');

const template = {
    postTemplateDataDetail: async (uid, name, data) => {
        const fields1 = 'name, userinfo_uid';
        const fields2 = 'workout_order, super_set_label, workout_workout_id, templateUsers_template_id, rest_time, is_kilogram, is_meter, workout_detail';
        const questions1 = '?, ?';
        const questions2 = '?, ?, ?, ?, ?, ?, ?, ?'
        const values1 = [name, uid];
        const query1 = `INSERT INTO ${table_templateUsers}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;

        let userSetting;
        // Transactions
        let transactionArr = new Array();

        let templateUsers_template_id; // Insert ID

        const ts1 = async (connection) => {
            const result1 = await connection.query(query1, values1);
            templateUsers_template_id = result1.insertId;
        }
        const ts2 = async (connection) => {
            let cnt = 1;
            await asyncForEach(data, async (workout) => {
                await connection.query(query2, [cnt++, workout.super_set_label, workout.workout_id, templateUsers_template_id, workout.rest_time, userSetting.is_kilogram, userSetting.is_meter, JSON.stringify(workout.workout_detail)])
            });
        }
        try {
            userSetting = await getUserSetting(uid);
            transactionArr.push(ts1);
            transactionArr.push(ts2);
            await pool.Transaction(transactionArr);
            return templateUsers_template_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postTemplateData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("postTemplateData ERROR: ", err);
            throw err;
        }
    },
    postTemplateData: async (uid, name, data) => {
        const fields1 = 'name, userinfo_uid';
        const fields2 = 'workout_order, super_set_label, workout_workout_id, templateUsers_template_id, rest_time, is_kilogram, is_meter, workout_detail';
        const questions1 = '?, ?';
        const questions2 = '?, ?, ?, ?, ?, ?, ?, ?'
        const values1 = [name, uid];
        const query1 = `INSERT INTO ${table_templateUsers}(${fields1}) VALUES(${questions1})`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;

        let userSetting;
        // Transactions
        let transactionArr = new Array();

        let templateUsers_template_id; // Insert ID

        let insertData;

        const ts1 = async (connection) => {
            const result1 = await connection.query(query1, values1);
            templateUsers_template_id = result1.insertId;
        }
        const ts2 = async (connection) => {
            let cnt = 1;
            const { sex, percentage, ageGroup, weightGroup } = await getUserInfo(uid);
            await asyncForEach(insertData, async (workout) => {
                const detail_plan = await getUserNextWorkoutPlanHierarchy(uid, workout.workout_id, sex, ageGroup, weightGroup, percentage);
                await connection.query(query2, [cnt++, workout.super_set_label, workout.workout_id, templateUsers_template_id, 0, userSetting.is_kilogram, userSetting.is_meter, JSON.stringify(detail_plan)])
            });
        }
        try {
            if (data.length > 0) {
                if ((typeof data[0]) == 'number') {
                    insertData = await Promise.all(data.map(async (workout_id) => {
                        return {
                            "workout_id": workout_id,
                            "super_set_label": 0
                        };
                    }));
                } else {
                    insertData = data;
                }
                console.log(insertData);
            }
            userSetting = await getUserSetting(uid);
            transactionArr.push(ts1);
            transactionArr.push(ts2);
            await pool.Transaction(transactionArr);
            return templateUsers_template_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postTemplateData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("postTemplateData ERROR: ", err);
            throw err;
        }
    },
    postTemplateSyncFirebase: async (uid, update_time) => {
        const table_syncTable = await admin.database().ref('syncTable');
        try {
            await table_syncTable.child(uid).update({ template: update_time });
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
    postOtherUsersTemplateDataFirebase: async (uid, template_id) => {
        const table_usersFeed = await admin.database().ref('usersFeed');
        const fields1 = 'userinfo_uid, name';
        const query1 = `SELECT ${fields1} FROM ${table_templateUsers}
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id}`;
        try {
            const result = await pool.queryParamMaster(query1);
            const imported_uid = result[0].userinfo_uid;
            let template_name = result[0].name;
            // Send Message
            // const message = await feedMessage.template_import(uid, template_id, template_name);
            await table_usersFeed.child(imported_uid).update({ new_message: 1 });
            await table_usersFeed.child(imported_uid).push().set(message);

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
    postOtherUsersTemplateData: async (uid, template_id) => {
        const fields1 = 'userinfo_uid, name, templateUsers_id, super_set_label, workout_workout_id, rest_time, workout_detail, is_custom'
        const fields2 = 'name, userinfo_uid';
        const fields3 = 'workout_order, super_set_label, workout_workout_id, templateUsers_template_id, rest_time, is_kilogram, is_meter, workout_detail';
        const questions2 = '?, ?';
        const questions3 = '?, ?, ?, ?, ?, ?, ?, ?'
        const query1 = `SELECT ${fields1} FROM ${table_templateUsers}
                        INNER JOIN ${table_templateUsersDetails} ON ${table_templateUsers}.templateUsers_id = ${table_templateUsersDetails}.templateUsers_template_id AND ${table_templateUsers}.templateUsers_id = ${template_id}
                        LEFT JOIN ${table_workout} ON ${table_templateUsersDetails}.workout_workout_id = ${table_workout}.workout_id`;

        const query2 = `INSERT INTO ${table_templateUsers}(${fields2}) VALUES(${questions2})`;
        const query3 = `INSERT INTO ${table_templateUsersDetails}(${fields3}) VALUES(${questions3})`;

        let transactionArr = new Array();

        let userSetting;

        let template_detail;
        let templateUsers_template_id;

        let other_uid;

        const restructure1 = async (result) => {
            let data = [];
            await asyncForEach(result, async (rowdata) => {
                if (data.length == 0) {
                    data.push({ name: rowdata.name, template_id: rowdata.templateUsers_id, detail: [{ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, is_custom: rowdata.is_custom, rest_time: rowdata.rest_time, workout_detail: JSON.parse(rowdata.workout_detail) }] });
                }
                else if (data[data.length - 1].template_id == rowdata.templateUsers_id) {
                    data[data.length - 1].detail.push({ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, is_custom: rowdata.is_custom, rest_time: rowdata.rest_time, workout_detail: JSON.parse(rowdata.workout_detail) });
                }
                else {
                    data.push({ name: rowdata.name, template_id: rowdata.templateUsers_id, detail: [{ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, is_custom: rowdata.is_custom, rest_time: rowdata.rest_time, workout_detail: JSON.parse(rowdata.workout_detail) }] });
                }
            });
            return data;
        }

        const ts1 = async (connection) => {
            const result1 = await connection.query(query1);
            other_uid = result1[0].userinfo_uid;
            const templateData = (await restructure1(result1))[0];

            const result2 = await connection.query(query2, [templateData.name, uid]);
            templateUsers_template_id = result2.insertId;
            template_detail = templateData.detail;
        }
        const ts2 = async (connection) => {
            let cnt = 1;
            await asyncForEach(template_detail, async (workout) => {
                let insertWorkoutId = workout.workout_id;
                if (workout.is_custom == 1) {

                    // const query5 = `UPDATE ${table_customWorkout}
                    //                 SET is_deleted = 0
                    //                 WHERE workout_workout_id = ${workout.workout_id} AND userinfo_uid = '${uid}'`

                    // await connection.query(query5);

                    const fields6 = 'korean, english, category, muscle_p, muscle_s1, equipment, record_type, multiplier, video_url, video_url_substitute, is_custom, reference_num';
                    const query6 = `INSERT INTO ${table_workout}(${fields6})
                                    SELECT ${fields6} FROM ${table_workout}
                                    WHERE workout_id = ${workout.workout_id}`
                    insertWorkoutId = (await connection.query(query6)).insertId;


                    const fields4 = 'workout_workout_id, userinfo_uid, created_at';
                    const values4 = [insertWorkoutId, uid, await timeFunction.currentTime()];
                    const questions4 = '?, ?, ?'
                    const query4 = `INSERT IGNORE INTO ${table_customWorkout}(${fields4}) VALUES(${questions4})`;
                    await connection.query(query4, values4);
                }
                await connection.query(query3, [cnt++, workout.super_set_label, insertWorkoutId, templateUsers_template_id, workout.rest_time, userSetting.is_kilogram, userSetting.is_meter, JSON.stringify(workout.workout_detail)]);
            });
        }

        try {
            userSetting = await getUserSetting(uid);
            transactionArr.push(ts1);
            transactionArr.push(ts2);
            await pool.Transaction(transactionArr);
            return templateUsers_template_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postTemplateData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("postTemplateData ERROR: ", err);
            throw err;
        }
    },
    postDefaultTemplateData: async (uid, default_template_group_id, index) => {
        const fields1 = 'sub_name, workout_workout_id'
        const fields2 = 'name, userinfo_uid';
        const fields3 = 'workout_order, super_set_label, workout_workout_id, templateUsers_template_id, rest_time, is_kilogram, is_meter, workout_detail';
        const questions2 = '?, ?';
        const questions3 = '?, ?, ?, ?, ?, ?, ?, ?'
        const query1 = `SELECT ${fields1} FROM ${table_templateDefault}
                        INNER JOIN ${table_templateDefaultDetails} ON ${table_templateDefault}.templateDefault_id = ${table_templateDefaultDetails}.templateDefault_template_id
                        WHERE ${table_templateDefault}.templateDefaultGroup_templateDefaultGroup_id = ${default_template_group_id} AND ${table_templateDefault}.templateDefault_index = ${index}`;

        const query2 = `INSERT INTO ${table_templateUsers}(${fields2}) VALUES(${questions2})`;
        const query3 = `INSERT INTO ${table_templateUsersDetails}(${fields3}) VALUES(${questions3})`;
        const query4 = `UPDATE ${table_templateDefaultGroup} SET popularity=popularity+1
                        WHERE ${table_templateDefaultGroup}.templateDefaultGroup_id = ${default_template_group_id}`;

        let transactionArr = new Array();

        let userSetting;

        let name, workoutData = [];
        let templateUsers_template_id;

        const ts1 = async (connection) => {
            const result1 = await pool.queryParamSlave(query1);
            name = result1[0].sub_name;
            await asyncForEach(result1, async (rowdata) => {
                workoutData.push(rowdata.workout_workout_id);
            });

            const result2 = await connection.query(query2, [name, uid]);
            templateUsers_template_id = result2.insertId;
        }
        const ts2 = async (connection) => {
            let cnt = 1;
            const { sex, percentage, ageGroup, weightGroup } = await getUserInfo(uid);
            await asyncForEach(workoutData, async (workout) => {
                const detail_plan = await getUserNextWorkoutPlanHierarchy(uid, workout, sex, ageGroup, weightGroup, percentage);
                await connection.query(query3, [cnt++, 0, workout, templateUsers_template_id, 0, userSetting.is_kilogram, userSetting.is_meter, JSON.stringify(detail_plan)])
            });
        }
        const ts3 = async (connection) => {
            await connection.query(query4);
        }

        const restructure = async (result) => {
            let data = [];
            name = result[0].sub_name;
            await asyncForEach(result, async (rowdata) => {
                data.push(rowdata.workout_workout_id);
            });
            return data;
        }
        try {
            userSetting = await getUserSetting(uid);
            transactionArr.push(ts1);
            transactionArr.push(ts2);
            transactionArr.push(ts3);
            await pool.Transaction(transactionArr);
            return templateUsers_template_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('postTemplateData ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("postTemplateData ERROR: ", err);
            throw err;
        }
    },
    getUserTemplateName: async (template_id) => {
        const fields = 'name';
        const query = `SELECT ${fields} FROM ${table_templateUsers}
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id}`;
        try {
            const result = await pool.queryParamSlave(query);
            return result[0].name;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getUserTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getUserTemplate ERROR: ", err);
            throw err;
        }
    },
    getUserTemplateIdFromSessionId: async (session_id) => {
        const fields = 'templateUsers_template_id';
        const query = `SELECT ${fields} FROM ${table_session}
                        WHERE ${table_session}.session_id = ${session_id}`;
        try {
            const result = await pool.queryParamSlave(query);
            return result[0].templateUsers_template_id;
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getUserTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getUserTemplate ERROR: ", err);
            throw err;
        }
    },
    getUserTemplateByTemplateId: async (template_id) => {
        const fields = 'name, templateUsers_id, template_type, super_set_label, workout_workout_id, rest_time, lastdate, workout_detail';
        const query = `SELECT ${fields} FROM ${table_templateUsers}
                        INNER JOIN ${table_templateUsersDetails} ON ${table_templateUsers}.templateUsers_id = ${table_templateUsersDetails}.templateUsers_template_id AND ${table_templateUsers}.templateUsers_id = ${template_id} AND ${table_templateUsers}.is_deleted != 1`;
        const durationToInt = async (set) => {
            set.distance = parseInt(set.distance);
            return set;
        }

        try {
            const result = await pool.queryParamMaster(query);
            const restructure = async () => {
                let data = [];
                await asyncForEach(result, async (rowdata) => {
                    let workout_detail = JSON.parse(rowdata.workout_detail);
                    await Promise.all(workout_detail.map(async (set_detail, index) => {
                        // If set_type is not defined in workout_detail
                        if (!("set_type" in set_detail)) {
                            workout_detail[index]["set_type"] = 0;
                        }
                        if (!("rpe" in set_detail)) {
                            workout_detail[index]["rpe"] = null;
                        }
                    }))
                    if (data.length == 0) {
                        data.push({ name: rowdata.name, template_id: rowdata.templateUsers_id, template_type: rowdata.template_type, last_date: rowdata.lastdate, detail: [{ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, rest_time: rowdata.rest_time, workout_detail: workout_detail }] });
                    }
                    else if (data[data.length - 1].template_id == rowdata.templateUsers_id) {
                        data[data.length - 1].detail.push({ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, rest_time: rowdata.rest_time, workout_detail: workout_detail });
                    }
                    else {
                        data.push({ name: rowdata.name, template_id: rowdata.templateUsers_id, template_type: rowdata.template_type, last_date: rowdata.lastdate, detail: [{ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, rest_time: rowdata.rest_time, workout_detail: workout_detail }] });
                    }
                });
                return data;
            }
            const data = await restructure();
            return data[0];
        } catch (err) {
            if (err.errno == 1062) {
                console.log('getUserTemplate ERROR: ', err.errno, err.code);
                return -1;
            }
            console.log("getUserTemplate ERROR: ", err);
            throw err;
        }
    },
    getUserTemplate: async (uid) => {
        const fields = 'name, templateUsers_id, template_type, super_set_label, workout_workout_id, rest_time, lastdate, workout_detail';
        const query = `SELECT ${fields} FROM ${table_templateUsers}
                        INNER JOIN ${table_templateUsersDetails} ON ${table_templateUsers}.templateUsers_id = ${table_templateUsersDetails}.templateUsers_template_id AND ${table_templateUsers}.userinfo_uid = '${uid}' AND ${table_templateUsers}.is_deleted != 1`;
        const durationToInt = async (set) => {
            set.distance = parseInt(set.distance);
            return set;
        }

        try {
            const result = await pool.queryParamSlave(query);
            const restructure = async () => {
                let data = [];
                await asyncForEach(result, async (rowdata) => {
                    let workout_detail = JSON.parse(rowdata.workout_detail);
                    await Promise.all(workout_detail.map(async (set_detail, index) => {
                        delete workout_detail[index]["is_done"];
                        // If set_type is not defined in workout_detail
                        if (!("set_type" in set_detail)) {
                            workout_detail[index]["set_type"] = 0;
                        }
                        if (!("rpe" in set_detail)) {
                            workout_detail[index]["rpe"] = null;
                        }
                    }))
                    if (data.length == 0) {
                        data.push({ name: rowdata.name, template_type: rowdata.template_type, template_id: rowdata.templateUsers_id, last_date: rowdata.lastdate, detail: [{ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, rest_time: rowdata.rest_time, workout_detail: workout_detail }] });
                    }
                    else if (data[data.length - 1].template_id == rowdata.templateUsers_id) {
                        data[data.length - 1].detail.push({ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, rest_time: rowdata.rest_time, workout_detail: workout_detail });
                    }
                    else {
                        data.push({ name: rowdata.name, template_type: rowdata.template_type, template_id: rowdata.templateUsers_id, last_date: rowdata.lastdate, detail: [{ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, rest_time: rowdata.rest_time, workout_detail: workout_detail }] });
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
    getUserTemplateWear: async (uid, langCode) => {
        const fields = 'name, templateUsers_id, super_set_label, workout_workout_id, is_kilogram, is_meter, rest_time, workout_detail';
        const query = `SELECT ${fields} FROM ${table_templateUsers}
                        INNER JOIN ${table_templateUsersDetails} ON ${table_templateUsers}.templateUsers_id = ${table_templateUsersDetails}.templateUsers_template_id AND ${table_templateUsers}.userinfo_uid = '${uid}' AND ${table_templateUsers}.is_deleted != 1`;
        const fields2 = 'korean, english, record_type, is_custom';
        const durationToInt = async (set) => {
            set.distance = parseInt(set.distance);
            return set;
        }

        try {
            const result = await pool.queryParamSlave(query);
            const restructure = async () => {
                let data = [];
                await asyncForEach(result, async (rowdata) => {
                    let workout_detail = JSON.parse(rowdata.workout_detail);
                    await Promise.all(workout_detail.map(async (set_detail, index) => {
                        delete workout_detail[index]["is_done"];
                        // If set_type is not defined in workout_detail
                        if (!("set_type" in set_detail)) {
                            workout_detail[index]["set_type"] = 0;
                        }
                        if (!("rpe" in set_detail)) {
                            workout_detail[index]["rpe"] = null;
                        }
                    }))
                    if (data.length == 0) {
                        data.push({ name: rowdata.name, template_id: rowdata.templateUsers_id, detail: [{ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, is_kilogram: rowdata.is_kilogram, is_meter: rowdata.is_meter, rest_time: rowdata.rest_time, workout_detail: workout_detail }] });
                    }
                    else if (data[data.length - 1].template_id == rowdata.templateUsers_id) {
                        data[data.length - 1].detail.push({ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, is_kilogram: rowdata.is_kilogram, is_meter: rowdata.is_meter, rest_time: rowdata.rest_time, workout_detail: workout_detail });
                    }
                    else {
                        data.push({ name: rowdata.name, template_id: rowdata.templateUsers_id, detail: [{ workout_id: rowdata.workout_workout_id, super_set_label: rowdata.super_set_label, is_kilogram: rowdata.is_kilogram, is_meter: rowdata.is_meter, rest_time: rowdata.rest_time, workout_detail: workout_detail }] });
                    }
                });
                return data;
            }
            const data = await restructure();
            await Promise.all(data.map(async (template, index_template) => {
                await Promise.all(template.detail.map(async (workout, index_workout) => {
                    const query2 = `SELECT ${fields2} FROM ${table_workout}
                                    WHERE workout_id = ${workout.workout_id}`;
                    const result_workout_data = (await pool.queryParamSlave(query2))[0];

                    data[index_template].detail[index_workout].workout_name = await aboutLanguage.workoutNameTemplateWear(langCode, result_workout_data);//   result_workout_data.korean;
                    // data[index_template].detail[index_workout].workout_name = result_workout_data.korean;
                    data[index_template].detail[index_workout].record_type = result_workout_data.record_type;
                }));
            }));
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
    getDefaultTemplate: async (langCode) => {
        const fields = `templateDefaultGroup_id, ${await aboutLanguage.langCodeToString(langCode)}, target, split, popularity, templateDefault_id, workout_workout_id, sub_${await aboutLanguage.langCodeToString(langCode)}, templateDefault_index`;
        const query = `SELECT ${fields} FROM ${table_templateDefaultGroup}
                        INNER JOIN ${table_templateDefault} ON ${table_templateDefaultGroup}.templateDefaultGroup_id = ${table_templateDefault}.templateDefaultGroup_templateDefaultGroup_id
                        INNER JOIN ${table_templateDefaultDetails} ON ${table_templateDefault}.templateDefault_id = ${table_templateDefaultDetails}.templateDefault_template_id`;
        try {
            let result = await pool.queryParamSlave(query);
            const restructure = async () => {
                let data = [];
                await asyncForEach(result, async (rowdata) => {
                    rowdata = await aboutLanguage.rowdataDefaultTemplate(langCode, rowdata)
                    if (data.length == 0) {
                        data.push({ default_template_group_id: rowdata.templateDefaultGroup_id, name: rowdata.name, target: rowdata.target, split: rowdata.split, popularity: rowdata.popularity, default_template: [{ index: rowdata.templateDefault_index, default_template_id: rowdata.templateDefault_id, sub_name: rowdata.sub_name, detail: [rowdata.workout_workout_id] }] })
                    }
                    else if (data[data.length - 1].default_template_group_id == rowdata.templateDefaultGroup_id) {
                        const length = data[data.length - 1].default_template.length
                        if (data[data.length - 1].default_template[length - 1].default_template_id == rowdata.templateDefault_id) {
                            data[data.length - 1].default_template[length - 1].detail.push(rowdata.workout_workout_id);
                        }
                        else {
                            data[data.length - 1].default_template.push({ index: rowdata.templateDefault_index, default_template_id: rowdata.templateDefault_id, sub_name: rowdata.sub_name, detail: [rowdata.workout_workout_id] });
                        }
                    }
                    else {
                        data.push({ default_template_group_id: rowdata.templateDefaultGroup_id, name: rowdata.name, target: rowdata.target, split: rowdata.split, popularity: rowdata.popularity, default_template: [{ index: rowdata.templateDefault_index, default_template_id: rowdata.templateDefault_id, sub_name: rowdata.sub_name, detail: [rowdata.workout_workout_id] }] })
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
    updateUserTemplate: async (uid, template_id, name, data) => {
        const fields2 = 'workout_order, super_set_label, workout_workout_id, is_kilogram, is_meter, rest_time, templateUsers_template_id, workout_detail';
        const questions2 = '?, ?, ?, ?, ?, ?, ?, ?'

        const query1 = `DELETE T_details
                        FROM ${table_templateUsersDetails} T_details
                        INNER JOIN ${table_templateUsers} ON T_details.templateUsers_template_id = ${table_templateUsers}.templateUsers_id AND ${table_templateUsers}.userinfo_uid = '${uid}'
                        WHERE T_details.templateUsers_template_id=${template_id}`;
        const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;
        const query3 = `UPDATE ${table_templateUsers} SET name='${name}'
                        WHERE ${table_templateUsers}.templateUsers_id = '${template_id}' AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
        const query4 = `UPDATE ${table_templateUsers} SET is_deleted = 1
                        WHERE ${table_templateUsers}.templateUsers_id = '${template_id}' AND ${table_templateUsers}.userinfo_uid = '${uid}'`;

        // Transactions
        let transactionArr = new Array();
        const ts1 = async (connection) => {
            await connection.query(query1);
        };
        const ts2 = async (connection) => {
            let cnt = 1;
            await asyncForEach(data, async (workout) => {
                if (workout.super_set_label == null || workout.super_set_label == undefined) {
                    workout.super_set_label = 0;
                }
                await connection.query(query2, [cnt++, workout.super_set_label, workout.workout_id, workout.is_kilogram, workout.is_meter, workout.rest_time, Number(template_id), JSON.stringify(workout.workout_detail)]);
            });
        };
        const ts3 = async (connection) => {
            if (data.length == 0) {
                await connection.query(query4);
            } else {
                await connection.query(query3);
            }
        };

        try {
            transactionArr.push(ts1);
            transactionArr.push(ts2);
            transactionArr.push(ts3);
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
    },
    // updateUserTemplateFromSession: async(uid, template_id, data) => {
    //     const fields0 = '';
    //     const fields2 = 'workout_order, super_set_label, workout_workout_id, is_kilogram, is_meter, rest_time, templateUsers_template_id, workout_detail';
    //     const questions2 = '?, ?, ?, ?, ?, ?, ?, ?'


    //     const query0 = `SELECT ${       } FROM ${table_templateUsers}
    //                     WHERE ${table_templateUsers}.templateUsers_id = ${template_id} AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
    //     const query1 = `DELETE T_details
    //                     FROM ${table_templateUsersDetails} T_details
    //                     INNER JOIN ${table_templateUsers} ON T_details.templateUsers_template_id = ${table_templateUsers}.templateUsers_id AND ${table_templateUsers}.userinfo_uid = '${uid}'
    //                     WHERE T_details.templateUsers_template_id=${template_id}`;
    //     const query2 = `INSERT INTO ${table_templateUsersDetails}(${fields2}) VALUES(${questions2})`;
    //     // const query4 = `UPDATE ${table_templateUsers} SET is_deleted = 1
    //     //                 WHERE ${table_templateUsers}.templateUsers_id = '${template_id}' AND ${table_templateUsers}.userinfo_uid = '${uid}'`;

    //     // Transactions
    //     let transactionArr = new Array();
    //     const ts1 = async (connection) => {
    //         await connection.query(query1);
    //     };
    //     const ts2 = async (connection) => {
    //         let cnt = 1;
    //         await asyncForEach(data, async(workout) => {
    //             workout.super_set_label = (workout.super_set_label == null || workout.super_set_label == undefined) ? 0 : workout.super_set_label;
    //             workout.is_kilogram = (workout.is_kilogram == null || workout.is_kilogram == undefined) ? 1 : workout.is_kilogram;
    //             workout.is_meter = (workout.is_meter == null || workout.is_meter == undefined) ? 1 : workout.is_meter;

    //             let template_detail = []
    //             if (workout.detail.length != 0) {
    //                 template_detail = await Promise.all(workout.detail.map(async (detail) => {
    //                     return {
    //                         "set_order": detail.set_order,
    //                         "reps": detail.reps,
    //                         "weight": detail.weight,
    //                         "duration": detail.duration,
    //                         "distance": detail.distance,
    //                         "set_type": detail.set_type,
    //                         "rpe": detail.rpe
    //                     }
    //                 }));
    //             }
    //             await connection.query(query2, [cnt++, workout.super_set_label, workout.workout_id, workout.is_kilogram, workout.is_meter, workout.rest_time, Number(template_id), JSON.stringify(template_detail)]);
    //         });
    //     };

    //     try {   
    //         transactionArr.push(ts1);
    //         transactionArr.push(ts2);
    //         await pool.Transaction(transactionArr);
    //         return template_id;
    //     } catch (err) {
    //         if (err.errno == 1062) {
    //             console.log('updateUserTemplate ERROR: ', err.errno, err.code);
    //             return -1;
    //         }
    //         console.log("updateUserTemplate ERROR: ", err);
    //         throw err;
    //     }
    // },
    /*
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
    deleteUserTemplate: async (uid, template_id) => {
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
    checkTemplate: async (uid, template_id) => {
        const query = `SELECT templateUsers_id FROM ${table_templateUsers}
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id} AND ${table_templateUsers}.userinfo_uid = '${uid}'`;
        try {
            const result = await pool.queryParamSlave(query);
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