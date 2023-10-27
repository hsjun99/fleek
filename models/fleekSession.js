const pool = require("../modules/pool");
const asyncForEach = require("../modules/function/asyncForEach");

const oneRmCalculator = require("../modules/algorithm/oneRmCalculator");

const timeFunction = require("../modules/function/timeFunction");

const getUserInfo = require("../modules/functionFleek/getUserInfo");
const getWorkoutEquation = require("../modules/functionFleek/getWorkoutEquation");

var moment = require("moment");

const OneSignal = require("../modules/onesignal/notificationManager");

const table_workout = "workout";
const table_workoutlog = "workoutlog";
const table_session = "session";
const table_templateUsers = "templateUsers";
const table_workoutAbility = "workoutAbility";
const table_userWorkoutHistory = "userWorkoutHistory";
const table_userinfo = "userinfo";
const table_customWorkout = "customWorkout";

const table_sessionBook = "sessionBook";

var admin = require("firebase-admin");

const CacheService = require("../modules/cache.service");
const ttl = 30; // cache for 1 Minute
const cache = new CacheService(ttl); // Create a new cache service instance

const session = {
  // sessionLike: async (uid, session_id, emoji_type, name, privacy_mode, template_name) => {
  //   const table_sessionLike = await admin.database().ref("sessionLike");
  //   const table_usersFeed = await admin.database().ref("usersFeed");

  //   const fields1 = "userinfo_uid AS uid, lang_code";
  //   const query1 = `SELECT ${fields1} FROM ${table_session}
  //                       INNER JOIN ${table_userinfo} ON uid = userinfo_uid
  //                       WHERE ${table_session}.session_id = ${session_id}`;
  //   try {
  //     if ((await (await admin.database().ref("sessionLike").child(session_id).once("value")).val()) == null) {
  //       await table_sessionLike.update({
  //         [session_id]: {
  //           0: { cnt: 0, users: ["null"] },
  //           1: { cnt: 0, users: ["null"] },
  //           2: { cnt: 0, users: ["null"] },
  //           3: { cnt: 0, users: ["null"] },
  //           4: { cnt: 0, users: ["null"] }
  //         }
  //       });
  //       const userList = await (await table_sessionLike.child(session_id).child(emoji_type).child("users").once("value")).val();
  //       userList.push(uid);
  //       await table_sessionLike
  //         .child(session_id)
  //         .child(emoji_type)
  //         .update({
  //           cnt: admin.database.ServerValue.increment(1),
  //           users: userList
  //         });
  //     } else {
  //       // Step1: Remove user's emoji from the database
  //       await Promise.all(
  //         [0, 1, 2, 3, 4].map(async emoji_type => {
  //           const userList = await (await table_sessionLike.child(session_id).child(emoji_type).child("users").once("value")).val();
  //           var index = userList.indexOf(uid);
  //           if (index > -1) {
  //             userList.splice(index, 1);
  //             await table_sessionLike
  //               .child(session_id)
  //               .child(emoji_type)
  //               .update({
  //                 cnt: admin.database.ServerValue.increment(-1),
  //                 users: userList
  //               });
  //           }
  //         })
  //       );
  //       // Step2: Add user's new emoji to the database
  //       const userList = await (await table_sessionLike.child(session_id).child(emoji_type).child("users").once("value")).val();
  //       if (!userList.includes(uid)) {
  //         userList.push(uid);
  //         await table_sessionLike
  //           .child(session_id)
  //           .child(emoji_type)
  //           .update({
  //             cnt: admin.database.ServerValue.increment(1),
  //             users: userList
  //           });
  //       }
  //     }
  //     const result1 = await pool.queryParamSlave(query1);
  //     const liked_uid = result1[0].uid;

  //     // Send Message
  //     if (privacy_mode == 0 && uid != liked_uid) {
  //       // const message = await feedMessage.session_like(uid, session_id, template_name);
  //       await table_usersFeed.child(liked_uid).update({ new_message: 1 });
  //       await table_usersFeed.child(liked_uid).push().set(message);
  //     }

  //     // Send Push
  //     if (privacy_mode == 0 && uid != liked_uid) {
  //       // await firebaseCM(result1, "sessionLike", [name]);
  //       // const fields2 = 'token_value';
  //       // const query2 = `SELECT ${fields2} FROM ${table_fcmToken}
  //       //                 WHERE ${table_fcmToken}.userinfo_uid = '${liked_uid}'`;
  //       // const result2 = await pool.queryParamSlave(query2);
  //       // const token_list = await Promise.all(result2.map(async data => {
  //       //     return data.token_value;
  //       // }));
  //       // const message_background = {
  //       //     notification: {
  //       //         title: '플릭(Fleek)',
  //       //         body: `${name}님이 좋아요를 눌렀습니다! 확인해보세요!!`
  //       //     }
  //       // }
  //       // const message_foreground = {
  //       //     data: {
  //       //         title: '플릭(Fleek)',
  //       //         body: `${name}님이 좋아요를 눌렀습니다! 확인해보세요!!`
  //       //     }
  //       // }
  //       // if (token_list.length != 0) {
  //       //     await firebaseCM(token_list, message_background, message_foreground);
  //       // }
  //     }
  //     return true;
  //   } catch (err) {
  //     if (err.errno == 1062) {
  //       console.log("deleteSession ERROR: ", err.errno, err.code);
  //       return -1;
  //     }
  //     console.log("deleteSession ERROR: ", err);
  //     throw err;
  //   }
  // },
  sessionStart: async (uid, name, followers_list) => {
    const table_usersOnline = await admin.database().ref("usersOnline");
    const table_usersFeed = await admin.database().ref("usersFeed");

    const fields1 = "privacy_setting";
    const query1 = `SELECT ${fields1} FROM ${table_userinfo}
                        WHERE ${table_userinfo}.uid = '${uid}'`;
    try {
      table_usersOnline.update({ [uid]: 1 });

      const result1 = await pool.queryParamSlave(query1);
      const privacy_mode = result1[0].privacy_setting;
      // Send Message
      if (privacy_mode == 0) {
        const message = await feedMessage.session_start(uid);
        await Promise.all(
          followers_list.map(async follow_uid => {
            await table_usersFeed.child(follow_uid).update({ new_message: 1 });
            await table_usersFeed.child(follow_uid).push().set(message);
          })
        );
      }
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("deleteSession ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("deleteSession ERROR: ", err);
      throw err;
    }
  },
  sessionStop: async (uid, name, followers_list) => {
    const table_usersOnline = await admin.database().ref("usersOnline");
    try {
      table_usersOnline.update({ [uid]: 0 });

      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("deleteSession ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("deleteSession ERROR: ", err);
      throw err;
    }
  },
  // sessionFinish: async (uid, name, privacy_mode, followers_list, session_id, template_name) => {
  //   const table_usersOnline = await admin.database().ref("usersOnline");
  //   const table_sessionLike = await admin.database().ref("sessionLike");
  //   const table_usersFeed = await admin.database().ref("usersFeed");

  //   try {
  //     table_usersOnline.update({ [uid]: 0 });
  //     table_sessionLike.update({
  //       [session_id]: {
  //         0: { cnt: 0, users: ["null"] },
  //         1: { cnt: 0, users: ["null"] },
  //         2: { cnt: 0, users: ["null"] },
  //         3: { cnt: 0, users: ["null"] },
  //         4: { cnt: 0, users: ["null"] }
  //       }
  //     });
  //     // Send Message
  //     // if (privacy_mode == 0) {
  //     //   const message = await feedMessage.session_finish(uid, session_id, template_name);
  //     //   await Promise.all(
  //     //     followers_list.map(async follow_uid => {
  //     //       await table_usersFeed.child(follow_uid).update({ new_message: 1 });
  //     //       await table_usersFeed.child(follow_uid).push().set(message);
  //     //     })
  //     //   );
  //     // }

  //     // const uidListString = "('" + followers_list.join("\',\'") + "')";
  //     // const fields1 = 'uid, lang_code';
  //     // const query1 = `SELECT ${fields1} FROM ${table_userinfo}
  //     //                 WHERE uid IN ${uidListString}`;
  //     // const result1 = await pool.queryParamSlave(query1);

  //     // Send Push
  //     // if (privacy_mode == 0) {
  //     //     await firebaseCM(result1, "sessionFinish", [name, template_name]);
  //     //     // const followersString = "('" + followers_list.join("\',\'") + "')";
  //     //     // const fields2 = 'token_value';
  //     //     // const query2 = `SELECT ${fields2} FROM ${table_fcmToken}
  //     //     //                 WHERE ${table_fcmToken}.userinfo_uid IN ${followersString}`;
  //     //     // const result2 = await pool.queryParamSlave(query2);
  //     //     // const token_list = await Promise.all(result2.map(async data => {
  //     //     //     return data.token_value;
  //     //     // }));
  //     //     // const message_background = {
  //     //     //     notification: {
  //     //     //         title: '플릭(Fleek)',
  //     //     //         body: `${name}님이 ${template_name} 운동을 완료했습니다!`
  //     //     //     }
  //     //     // }
  //     //     // const message_foreground = {
  //     //     //     data: {
  //     //     //         title: '플릭(Fleek)',
  //     //     //         body: `${name}님이 ${template_name} 운동을 완료했습니다!`
  //     //     //     }
  //     //     // }
  //     //     // if (token_list.length != 0) {
  //     //     //     await firebaseCM(token_list, message_background, message_foreground);
  //     //     // }
  //     // }

  //     return true;
  //   } catch (err) {
  //     if (err.errno == 1062) {
  //       console.log("deleteSession ERROR: ", err.errno, err.code);
  //       return -1;
  //     }
  //     console.log("deleteSession ERROR: ", err);
  //     throw err;
  //   }
  // },
  modifySessionData: async (uid, session_id, name, body_weight, data, start_time, total_time, device = null, session_review) => {
    const fields5 =
      "reps, weight, duration, distance, iswarmup, workout_order, set_order, max_heart_rate, super_set_label, rest_time, set_type, rpe, workout_workout_id, session_session_id";
    const fields6 =
      "max_one_rm, total_volume, max_volume, total_reps, max_weight, max_reps, total_distance, total_duration, max_speed, max_duration, workout_workout_id, userinfo_uid, session_session_id, created_at";
    const questions5 = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
    const questions6 = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";

    const fields4 =
      "userinfo_uid, created_at, start_time, name, templateUsers_template_id, total_time, device, feedback_content, feedback_rating, session_review";
    const questions4 = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?";

    const query1 = `UPDATE ${table_session} SET is_deleted = 1
                      WHERE ${table_session}.session_id = '${session_id}'`;
    const query2 = `DELETE FROM ${table_workoutAbility}
                      WHERE session_session_id = ${session_id} AND userinfo_uid = '${uid}'`;
    const query3 = `SELECT * FROM ${table_session}
                      WHERE session_id = '${session_id}'`;
    const query4 = `INSERT INTO ${table_session}(${fields4}) VALUES(${questions4})`;
    const query5 = `INSERT INTO ${table_workoutlog}(${fields5}) VALUES(${questions5})`;
    const query6 = `INSERT INTO ${table_workoutAbility}(${fields6}) VALUES(${questions6})`;
    // Transactions
    let transactionArr = new Array();
    let new_session_id;
    const ts1 = async connection => {
      await connection.query(query1);
    };
    const ts2 = async connection => {
      // DELETE Initial Workout Ability
      await connection.query(query2);
      const result3 = await connection.query(query3);
      const result4 = await connection.query(query4, [
        result3[0].userinfo_uid,
        result3[0].created_at,
        result3[0].start_time,
        result3[0].name,
        result3[0].templateUsers_template_id,
        result3[0].total_time,
        result3[0].device,
        result3[0].feedback_content,
        result3[0].feedback_rating,
        result3[0].session_review
      ]);
      new_session_id = result4.insertId;
    };
    const ts3 = async connection => {
      let session_total_volume = 0,
        session_total_sets = 0,
        session_total_reps = 0;
      let session_total_distance = 0,
        session_total_duration = 0;
      await asyncForEach(data, async workouts => {
        let max_one_rm = 0,
          total_volume = 0,
          max_volume = 0,
          total_reps = 0,
          max_weight = 0;
        let max_reps = 0,
          max_duration = 0,
          max_speed = 0,
          total_distance = 0,
          total_duration = 0;
        // Get Multiplier from Workout Table
        const fields9 = "multiplier, record_type";
        const query9 = `SELECT ${fields9} FROM ${table_workout}
                                WHERE ${table_workout}.workout_id = ${workouts.workout_id}`;
        const result9 = await pool.queryParamArrSlave(query9);
        if (workouts.super_set_label == null || workouts.super_set_label == undefined) workouts.super_set_label = 0;
        await asyncForEach(workouts.detail, async sets => {
          // INSERT NEW Workout Logs
          await connection.query(query5, [
            sets.reps,
            sets.weight,
            sets.duration,
            sets.distance,
            sets.iswarmup,
            workouts.workout_order,
            sets.set_order,
            workouts.max_heart_rate,
            workouts.super_set_label,
            workouts.rest_time,
            sets.set_type,
            sets.rpe,
            workouts.workout_id,
            new_session_id
          ]);
          if (result9[0].record_type == 4) {
            total_volume += sets.reps * (sets.weight + body_weight);
            max_volume = Math.max(max_volume, sets.reps * (sets.weight + body_weight));
          } else if (result9[0].record_type == 5) {
            total_volume += sets.reps * body_weight;
            max_volume = Math.max(max_volume, sets.reps * body_weight);
          } else if (result9[0].record_type == 6) {
            total_volume += sets.reps * (body_weight - sets.weight);
            max_volume = Math.max(max_volume, sets.reps * (body_weight - sets.weight));
          } else {
            total_volume += sets.reps * sets.weight * result9[0].multiplier;
            max_volume = Math.max(max_volume, sets.reps * sets.weight * result9[0].multiplier);
          }
          max_one_rm = Math.max(max_one_rm, await oneRmCalculator(sets.weight, sets.reps));
          total_reps += sets.reps;
          max_weight = Math.max(max_weight, sets.weight);

          max_reps = Math.max(max_reps, sets.reps);
          max_duration = Math.max(max_duration, sets.duration);
          total_distance += sets.distance;
          total_duration += sets.duration;
          if (sets.distance != 0 && sets.distance != null && sets.duration != 0 && sets.duration != null) {
            max_speed = Math.max(max_speed, sets.distance / (sets.duration / 60));
          }
        });
        await connection.query(query6, [
          max_one_rm,
          total_volume,
          max_volume,
          total_reps,
          max_weight,
          max_reps,
          total_distance,
          total_duration,
          max_speed,
          max_duration,
          workouts.workout_id,
          uid,
          new_session_id,
          start_time
        ]);
        /*
                // Update UserWorkoutHistory Table - finish_num
                const fields11 = 'add_num, finish_num, userinfo_uid, workout_workout_id';
                const questions11 = `?, ?, ?, ?`;
                const values11 = [0, 0, uid, workouts.workout_id];
                const query11 = `INSERT IGNORE INTO ${table_userWorkoutHistory}(${fields11}) VALUES(${questions11})`;
                const query5 = `UPDATE ${table_userWorkoutHistory} SET finish_num = finish_num+1 WHERE userinfo_uid = "${uid}" AND workout_workout_id="${workouts.workout_id}"`;
                await connection.query(query11, values11);
                await connection.query(query5);
                */

        session_total_volume += total_volume;
        session_total_sets += workouts.detail.length;
        session_total_reps += total_reps;
        session_total_distance += total_distance;
        session_total_duration += total_duration;
      });
      // UPDATE SESSION TABLE
      const values7 = [
        session_review,
        name,
        session_total_volume,
        session_total_sets,
        session_total_reps,
        session_total_distance,
        session_total_duration,
        total_time,
        start_time
      ];
      const query7 = `UPDATE ${table_session}
                            SET session_review = ?, name = ?, session_total_volume = ?, session_total_sets = ?, session_total_reps = ?, session_total_distance = ?, session_total_duration = ?, total_time = ?, start_time = ?
                            WHERE ${table_session}.session_id = ${new_session_id}`;
      await connection.query(query7, values7);
    };
    try {
      transactionArr.push(ts1);
      transactionArr.push(ts2);
      transactionArr.push(ts3);
      await pool.Transaction(transactionArr);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("postSessionData ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("postSessionData ERROR: ", err);
      throw err;
    }
  },
  // modifySessionData: async (uid, session_id, name, body_weight, data, start_time, total_time, device = null, session_review) => {
  //   const fields3 =
  //     "reps, weight, duration, distance, iswarmup, workout_order, set_order, max_heart_rate, super_set_label, rest_time, set_type, rpe, workout_workout_id, session_session_id";
  //   const fields4 =
  //     "max_one_rm, total_volume, max_volume, total_reps, max_weight, max_reps, total_distance, total_duration, max_speed, max_duration, workout_workout_id, userinfo_uid, session_session_id, created_at";
  //   const questions3 = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
  //   const questions4 = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";

  //   const query1 = `DELETE FROM ${table_workoutlog}
  //                       WHERE session_session_id = ${session_id}`;
  //   const query2 = `DELETE FROM ${table_workoutAbility}
  //                       WHERE session_session_id = ${session_id} AND userinfo_uid = '${uid}'`;
  //   const query3 = `INSERT INTO ${table_workoutlog}(${fields3}) VALUES(${questions3})`;
  //   const query4 = `INSERT INTO ${table_workoutAbility}(${fields4}) VALUES(${questions4})`;

  //   // Transactions
  //   let transactionArr = new Array();
  //   const ts1 = async connection => {
  //     // DELETE Intitial Workout Logs
  //     await connection.query(query1);
  //   };
  //   const ts2 = async connection => {
  //     // DELETE Initial Workout Ability
  //     await connection.query(query2);
  //   };
  //   const ts3 = async connection => {
  //     let session_total_volume = 0,
  //       session_total_sets = 0,
  //       session_total_reps = 0;
  //     let session_total_distance = 0,
  //       session_total_duration = 0;
  //     await asyncForEach(data, async workouts => {
  //       let max_one_rm = 0,
  //         total_volume = 0,
  //         max_volume = 0,
  //         total_reps = 0,
  //         max_weight = 0;
  //       let max_reps = 0,
  //         max_duration = 0,
  //         max_speed = 0,
  //         total_distance = 0,
  //         total_duration = 0;
  //       // Get Multiplier from Workout Table
  //       const fields9 = "multiplier, record_type";
  //       const query9 = `SELECT ${fields9} FROM ${table_workout}
  //                               WHERE ${table_workout}.workout_id = ${workouts.workout_id}`;
  //       const result9 = await pool.queryParamArrSlave(query9);
  //       if (workouts.super_set_label == null || workouts.super_set_label == undefined) workouts.super_set_label = 0;
  //       await asyncForEach(workouts.detail, async sets => {
  //         // INSERT NEW Workout Logs
  //         await connection.query(query3, [
  //           sets.reps,
  //           sets.weight,
  //           sets.duration,
  //           sets.distance,
  //           sets.iswarmup,
  //           workouts.workout_order,
  //           sets.set_order,
  //           workouts.max_heart_rate,
  //           workouts.super_set_label,
  //           workouts.rest_time,
  //           sets.set_type,
  //           sets.rpe,
  //           workouts.workout_id,
  //           session_id
  //         ]);
  //         if (result9[0].record_type == 4) {
  //           total_volume += sets.reps * (sets.weight + body_weight);
  //           max_volume = Math.max(max_volume, sets.reps * (sets.weight + body_weight));
  //         } else if (result9[0].record_type == 5) {
  //           total_volume += sets.reps * body_weight;
  //           max_volume = Math.max(max_volume, sets.reps * body_weight);
  //         } else if (result9[0].record_type == 6) {
  //           total_volume += sets.reps * (body_weight - sets.weight);
  //           max_volume = Math.max(max_volume, sets.reps * (body_weight - sets.weight));
  //         } else {
  //           total_volume += sets.reps * sets.weight * result9[0].multiplier;
  //           max_volume = Math.max(max_volume, sets.reps * sets.weight * result9[0].multiplier);
  //         }
  //         max_one_rm = Math.max(max_one_rm, await oneRmCalculator(sets.weight, sets.reps));
  //         total_reps += sets.reps;
  //         max_weight = Math.max(max_weight, sets.weight);

  //         max_reps = Math.max(max_reps, sets.reps);
  //         max_duration = Math.max(max_duration, sets.duration);
  //         total_distance += sets.distance;
  //         total_duration += sets.duration;
  //         if (sets.distance != 0 && sets.distance != null && sets.duration != 0 && sets.duration != null) {
  //           max_speed = Math.max(max_speed, sets.distance / (sets.duration / 60));
  //         }
  //       });
  //       await connection.query(query4, [
  //         max_one_rm,
  //         total_volume,
  //         max_volume,
  //         total_reps,
  //         max_weight,
  //         max_reps,
  //         total_distance,
  //         total_duration,
  //         max_speed,
  //         max_duration,
  //         workouts.workout_id,
  //         uid,
  //         session_id,
  //         start_time
  //       ]);
  //       /*
  //               // Update UserWorkoutHistory Table - finish_num
  //               const fields11 = 'add_num, finish_num, userinfo_uid, workout_workout_id';
  //               const questions11 = `?, ?, ?, ?`;
  //               const values11 = [0, 0, uid, workouts.workout_id];
  //               const query11 = `INSERT IGNORE INTO ${table_userWorkoutHistory}(${fields11}) VALUES(${questions11})`;
  //               const query5 = `UPDATE ${table_userWorkoutHistory} SET finish_num = finish_num+1 WHERE userinfo_uid = "${uid}" AND workout_workout_id="${workouts.workout_id}"`;
  //               await connection.query(query11, values11);
  //               await connection.query(query5);
  //               */

  //       session_total_volume += total_volume;
  //       session_total_sets += workouts.detail.length;
  //       session_total_reps += total_reps;
  //       session_total_distance += total_distance;
  //       session_total_duration += total_duration;
  //     });
  //     // UPDATE SESSION TABLE
  //     const values6 = [
  //       session_review,
  //       name,
  //       session_total_volume,
  //       session_total_sets,
  //       session_total_reps,
  //       session_total_distance,
  //       session_total_duration,
  //       total_time,
  //       start_time
  //     ];
  //     const query6 = `UPDATE ${table_session}
  //                           SET session_review = ?, name = ?, session_total_volume = ?, session_total_sets = ?, session_total_reps = ?, session_total_distance = ?, session_total_duration = ?, total_time = ?, start_time = ?
  //                           WHERE ${table_session}.session_id = ${session_id}`;
  //     await connection.query(query6, values6);
  //   };
  //   try {
  //     transactionArr.push(ts1);
  //     transactionArr.push(ts2);
  //     transactionArr.push(ts3);
  //     await pool.Transaction(transactionArr);
  //     return true;
  //   } catch (err) {
  //     if (err.errno == 1062) {
  //       console.log("postSessionData ERROR: ", err.errno, err.code);
  //       return -1;
  //     }
  //     console.log("postSessionData ERROR: ", err);
  //     throw err;
  //   }
  // },
  postSessionData: async (
    uid,
    body_weight,
    data,
    created_at,
    start_time,
    session_name,
    template_id,
    total_time,
    device = null,
    feedback_content = null,
    feedback_rating = null,
    session_review
  ) => {
    const fields1 =
      "userinfo_uid, created_at, start_time, name, templateUsers_template_id, total_time, device, feedback_content, feedback_rating, session_review";
    const fields2 =
      "reps, weight, duration, distance, iswarmup, workout_order, set_order, max_heart_rate, super_set_label, rest_time, set_type, rpe, workout_workout_id, session_session_id";
    const fields4 =
      "max_one_rm, total_volume, max_volume, total_reps, max_weight, max_reps, total_distance, total_duration, max_speed, max_duration, workout_workout_id, userinfo_uid, session_session_id, created_at";
    const questions1 = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
    const questions2 = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
    const questions4 = "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
    const values1 = [
      uid,
      created_at,
      start_time,
      session_name,
      template_id,
      total_time,
      device,
      feedback_content,
      feedback_rating,
      session_review
    ];
    const query0 = `UPDATE ${table_userinfo}
                        SET last_session_finish = '${created_at}' WHERE uid = '${uid}'`;
    // Insert into Session Table
    const query1 = `INSERT INTO ${table_session}(${fields1}) VALUES(${questions1})`;
    // Insert into Workoutlog Table
    const query2 = `INSERT INTO ${table_workoutlog}(${fields2}) VALUES(${questions2})`;
    // Update Template Table - lastdate
    const query3 = `UPDATE ${table_templateUsers}
                        SET lastdate = CASE WHEN COALESCE(lastdate, '1000-01-01 00:00:00') < '${start_time}' THEN '${start_time}'
                        ELSE lastdate
                        END
                        WHERE ${table_templateUsers}.templateUsers_id = ${template_id}`;
    // Insert into WorkoutAbility Table
    const query4 = `INSERT INTO ${table_workoutAbility}(${fields4}) VALUES(${questions4})`;

    try {
      await pool.queryParamMaster(query0);
      const result1 = await pool.queryParamArrMaster(query1, values1);
      const session_id = result1.insertId;

      let session_total_volume = 0,
        session_total_sets = 0,
        session_total_reps = 0;
      let session_total_distance = 0,
        session_total_duration = 0;
      let one_rms_index = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
      ];
      const addWorkoutlog = async () => {
        await asyncForEach(data, async workouts => {
          let max_one_rm = 0,
            total_volume = 0,
            max_volume = 0,
            total_reps = 0,
            max_weight = 0;
          let max_reps = 0,
            max_duration = 0,
            max_speed = 0,
            total_distance = 0,
            total_duration = 0;
          // Get Multiplier from Workout Table
          const fields9 = "multiplier, record_type";
          const query9 = `SELECT ${fields9} FROM ${table_workout}
                                    WHERE ${table_workout}.workout_id = ${workouts.workout_id}`;
          const result9 = await pool.queryParamArrSlave(query9);

          if (workouts.super_set_label == null || workouts.super_set_label == undefined) workouts.super_set_label = 0;
          await asyncForEach(workouts.detail, async sets => {
            await pool.queryParamArrMaster(query2, [
              sets.reps,
              sets.weight,
              sets.duration,
              sets.distance,
              sets.iswarmup,
              workouts.workout_order,
              sets.set_order,
              workouts.max_heart_rate,
              workouts.super_set_label,
              workouts.rest_time,
              sets.set_type,
              sets.rpe,
              workouts.workout_id,
              result1.insertId
            ]);
            if (result9[0].record_type == 4) {
              total_volume += sets.reps * (sets.weight + body_weight);
              max_volume = Math.max(max_volume, sets.reps * (sets.weight + body_weight));
            } else if (result9[0].record_type == 5) {
              total_volume += sets.reps * body_weight;
              max_volume = Math.max(max_volume, sets.reps * body_weight);
            } else if (result9[0].record_type == 6) {
              total_volume += sets.reps * (body_weight - sets.weight);
              max_volume = Math.max(max_volume, sets.reps * (body_weight - sets.weight));
            } else {
              total_volume += sets.reps * sets.weight * result9[0].multiplier;
              max_volume = Math.max(max_volume, sets.reps * sets.weight * result9[0].multiplier);
            }
            max_one_rm = Math.max(max_one_rm, await oneRmCalculator(sets.weight, sets.reps));
            total_reps += sets.reps;
            max_weight = Math.max(max_weight, sets.weight);

            max_reps = Math.max(max_reps, sets.reps);
            max_duration = Math.max(max_duration, sets.duration);
            total_distance += sets.distance;
            total_duration += sets.duration;
            if (sets.distance != 0 && sets.distance != null && sets.duration != 0 && sets.duration != null) {
              max_speed = Math.max(max_speed, sets.distance / (sets.duration / 60));
            }
          });

          await pool.queryParamArrMaster(query4, [
            max_one_rm,
            total_volume,
            max_volume,
            total_reps,
            max_weight,
            max_reps,
            total_distance,
            total_duration,
            max_speed,
            max_duration,
            workouts.workout_id,
            uid,
            result1.insertId,
            created_at
          ]);
          // Update UserWorkoutHistory Table - finish_num
          const fields11 = "add_num, finish_num, userinfo_uid, workout_workout_id";
          const questions11 = `?, ?, ?, ?`;
          const values11 = [0, 0, uid, workouts.workout_id];
          const query11 = `INSERT IGNORE INTO ${table_userWorkoutHistory}(${fields11}) VALUES(${questions11})`;
          const query5 = `UPDATE ${table_userWorkoutHistory} SET finish_num = finish_num+1 WHERE userinfo_uid = "${uid}" AND workout_workout_id="${workouts.workout_id}"`;
          await pool.queryParamArrMaster(query11, values11);
          await pool.queryParamMaster(query5);
          session_total_volume += total_volume;
          session_total_sets += workouts.detail.length;
          session_total_reps += total_reps;

          session_total_distance += total_distance;
          session_total_duration += total_duration;

          one_rms_index[workouts.workouts_index - 1] = max_one_rm.toFixed(2);
        });
      };
      await addWorkoutlog();
      if (moment() >= moment(start_time)) {
        await pool.queryParamMaster(query3);
      }

      const fields6 = "total_volume, total_sets, total_reps";
      // Update Session Table - total volume, sets, reps
      const query6 = `UPDATE ${table_session} SET session_total_volume = ${session_total_volume}, session_total_sets = ${session_total_sets}, session_total_reps = ${session_total_reps}, session_total_distance = ${session_total_distance}, session_total_duration = ${session_total_duration}
                            WHERE ${table_session}.session_id = ${result1.insertId}`;
      await pool.queryParamMaster(query6);

      return session_id;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("postSessionData ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("postSessionData ERROR: ", err);
      throw err;
    }
  },
  deleteSession: async (uid, session_id) => {
    const fields0 = "workout_workout_id";
    const query0 = `SELECT DISTINCT ${fields0} FROM ${table_workoutlog}
                        WHERE ${table_workoutlog}.session_session_id = ${session_id}`;
    const query = `UPDATE ${table_session} SET is_deleted=1
                        WHERE ${table_session}.session_id = ${session_id} AND ${table_session}.userinfo_uid = "${uid}"`;

    // Transactions
    let transactionArr = new Array();

    let workoutsString;

    const ts1 = async connection => {
      const result0 = await pool.queryParamArrSlave(query0);
      let data = [];
      await asyncForEach(result0, async rowdata => {
        data.push(rowdata.workout_workout_id);
      });
      workoutsString = "(" + data.toString(",") + ")";
      connection.query(query);
    };
    const ts2 = async connection => {
      const query1 = `UPDATE ${table_userWorkoutHistory} SET finish_num = finish_num - 1
                            WHERE ${table_userWorkoutHistory}.userinfo_uid = '${uid}' AND ${table_userWorkoutHistory}.workout_workout_id IN ${workoutsString}`;
      await connection.query(query1);
    };
    try {
      transactionArr.push(ts1);
      transactionArr.push(ts2);
      await pool.Transaction(transactionArr);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("deleteSession ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("deleteSession ERROR: ", err);
      throw err;
    }
  },
  deleteAllSession: async uid => {
    const query = `UPDATE ${table_session} SET is_deleted = 1
                        WHERE ${table_session}.userinfo_uid = "${uid}"`;
    try {
      await pool.queryParamMaster(query);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("deleteSession ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("deleteSession ERROR: ", err);
      throw err;
    }
  },
  postSessionReview: async (uid, sessionId, sessionReview) => {
    const value = [sessionReview];
    const query = `UPDATE ${table_session}
                    SET session_review = ?
                    WHERE ${table_session}.userinfo_uid = "${uid}" AND ${table_session}.session_id = ${sessionId}`;
    try {
      await pool.queryParamArrMaster(query, value);
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("deleteSession ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("deleteSession ERROR: ", err);
      throw err;
    }
  },
  postUserHistorySyncFirebase: async (uid, update_time) => {
    const table_syncTable = await admin.database().ref("syncTable");
    try {
      await table_syncTable.child(uid).update({ userHistory: update_time });
      return true;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getUserTemplate ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getUserTemplate ERROR: ", err);
      throw err;
    }
  },
  // getFirstSessionBatchDataGlobal: async (uid) => {
  //   // const fields = `${table_session}.session_id, ${table_userinfo}.uid, ${table_userinfo}.name, ${table_templateUsers}.name AS template_name, ${table_session}.created_at AS date`;
  //   // const query = `SELECT ${fields} FROM ${table_session}
  //   //                 INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = ${table_session}.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
  //   //                 LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
  //   //                 WHERE ${table_session}.is_deleted != 1
  //   //                 ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //   //                 LIMIT 50`;
  //   const fields = `SESSION_BATCH.userinfo_uid, SESSION_BATCH.profile_url, SESSION_BATCH.instagram_id, ${table_userinfo}.name, SESSION_BATCH.name AS session_name, ${table_templateUsers}.name AS template_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.set_type, ${table_workoutlog}.rpe, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.super_set_label, ${table_workoutlog}.session_session_id, workout_order, set_order, SESSION_BATCH.created_at, SESSION_BATCH.start_time, SESSION_BATCH.total_time, SESSION_BATCH.device, max_one_rm, total_volume, max_volume, total_reps, max_weight`;
  //   const query = `SELECT ${fields} FROM ${table_workoutlog}
  //                       INNER JOIN
  //                       (SELECT session_id, userinfo_uid, profile_url, instagram_id, ${table_session}.name, ${table_session}.created_at, ${table_session}.start_time, total_time, device, templateUsers_template_id FROM ${table_session}
  //                       INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = userinfo_uid AND ${table_userinfo}.privacy_setting != 1
  //                       WHERE ${table_session}.is_deleted != 1 AND ${table_session}.session_total_sets != 0
  //                       ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //                       LIMIT 30) AS SESSION_BATCH
  //                       ON SESSION_BATCH.session_id = ${table_workoutlog}.session_session_id
  //                       INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = SESSION_BATCH.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
  //                       LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = SESSION_BATCH.templateUsers_template_id
  //                       LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = SESSION_BATCH.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
  //                       ORDER BY SESSION_BATCH.created_at DESC, SESSION_BATCH.session_id DESC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
  //   try {
  //     let result = await pool.queryParamSlave(query);
  //     const restructure = async () => {
  //       let data = [];
  //       await asyncForEach(result, async (rowdata) => {
  //         // rowdata.max_heart_rate = 50;
  //         if (data.length == 0) {
  //           data.push({
  //             session_id: rowdata.session_session_id,
  //             uid: rowdata.userinfo_uid,
  //             profile_url: rowdata.profile_url,
  //             instagram_id: rowdata.instagram_id,
  //             name: rowdata.name,
  //             template_name:
  //               rowdata.session_name != null
  //                 ? rowdata.session_name
  //                 : rowdata.template_name,
  //             device: rowdata.device,
  //             session_detail: {
  //               created_at: rowdata.created_at,
  //               start_time: rowdata.start_time,
  //               total_workout_time: rowdata.total_time,
  //               content: [
  //                 {
  //                   workout_id: rowdata.workout_workout_id,
  //                   super_set_label: rowdata.super_set_label,
  //                   max_heart_rate: rowdata.max_heart_rate,
  //                   sets: [
  //                     {
  //                       reps: rowdata.reps,
  //                       weight: rowdata.weight,
  //                       duration: rowdata.duration,
  //                       distance: rowdata.distance,
  //                       set_type: rowdata.set_type,
  //                       rpe: rowdata.rpe,
  //                     },
  //                   ],
  //                   workout_ability: {
  //                     max_one_rm: rowdata.max_one_rm,
  //                     total_volume: rowdata.total_volume,
  //                     max_volume: rowdata.max_volume,
  //                     total_reps: rowdata.total_reps,
  //                     max_weight: rowdata.max_weight,
  //                   },
  //                 },
  //               ],
  //             },
  //           });
  //         } else if (
  //           data[data.length - 1].session_id == rowdata.session_session_id
  //         ) {
  //           const L = data[data.length - 1].session_detail.content.length;
  //           if (
  //             data[data.length - 1].session_detail.content[L - 1].workout_id ==
  //             rowdata.workout_workout_id
  //           ) {
  //             data[data.length - 1].session_detail.content[L - 1].sets.push({
  //               reps: rowdata.reps,
  //               weight: rowdata.weight,
  //               duration: rowdata.duration,
  //               distance: rowdata.distance,
  //               set_type: rowdata.set_type,
  //               rpe: rowdata.rpe,
  //             });
  //           } else {
  //             data[data.length - 1].session_detail.content.push({
  //               workout_id: rowdata.workout_workout_id,
  //               super_set_label: rowdata.super_set_label,
  //               max_heart_rate: rowdata.max_heart_rate,
  //               sets: [
  //                 {
  //                   reps: rowdata.reps,
  //                   weight: rowdata.weight,
  //                   duration: rowdata.duration,
  //                   distance: rowdata.distance,
  //                   set_type: rowdata.set_type,
  //                   rpe: rowdata.rpe,
  //                 },
  //               ],
  //               workout_ability: {
  //                 max_one_rm: rowdata.max_one_rm,
  //                 total_volume: rowdata.total_volume,
  //                 max_volume: rowdata.max_volume,
  //                 total_reps: rowdata.total_reps,
  //                 max_weight: rowdata.max_weight,
  //               },
  //             });
  //           }
  //         } else {
  //           data.push({
  //             session_id: rowdata.session_session_id,
  //             uid: rowdata.userinfo_uid,
  //             profile_url: rowdata.profile_url,
  //             instagram_id: rowdata.instagram_id,
  //             name: rowdata.name,
  //             template_name:
  //               rowdata.session_name != null
  //                 ? rowdata.session_name
  //                 : rowdata.template_name,
  //             device: rowdata.device,
  //             session_detail: {
  //               created_at: rowdata.created_at,
  //               start_time: rowdata.start_time,
  //               total_workout_time: rowdata.total_time,
  //               content: [
  //                 {
  //                   workout_id: rowdata.workout_workout_id,
  //                   super_set_label: rowdata.super_set_label,
  //                   max_heart_rate: rowdata.max_heart_rate,
  //                   sets: [
  //                     {
  //                       reps: rowdata.reps,
  //                       weight: rowdata.weight,
  //                       duration: rowdata.duration,
  //                       distance: rowdata.distance,
  //                       set_type: rowdata.set_type,
  //                       rpe: rowdata.rpe,
  //                     },
  //                   ],
  //                   workout_ability: {
  //                     max_one_rm: rowdata.max_one_rm,
  //                     total_volume: rowdata.total_volume,
  //                     max_volume: rowdata.max_volume,
  //                     total_reps: rowdata.total_reps,
  //                     max_weight: rowdata.max_weight,
  //                   },
  //                 },
  //               ],
  //             },
  //           });
  //         }
  //       });
  //       return data;
  //     };
  //     const data = await restructure();

  //     await Promise.all(
  //       data.map(async (session, session_index) => {
  //         const { sex, ageGroup, weightGroup, achievement } = await getUserInfo(
  //           session.uid
  //         );
  //         //console.log(achievement)
  //         data[session_index].achievement = achievement;
  //         await Promise.all(
  //           session.session_detail.content.map(
  //             async (workout, workout_index) => {
  //               const { inclination, intercept } = await getWorkoutEquation(
  //                 workout.workout_id,
  //                 sex,
  //                 ageGroup,
  //                 weightGroup
  //               );
  //               let percentage = null;
  //               if (
  //                 inclination != null &&
  //                 intercept != null &&
  //                 workout.workout_ability.max_one_rm != 0 &&
  //                 workout.workout_ability.max_one_rm != null
  //               ) {
  //                 percentage = Math.round(
  //                   inclination * Math.log(workout.workout_ability.max_one_rm) +
  //                     intercept
  //                 );
  //               }
  //               data[session_index].session_detail.content[
  //                 workout_index
  //               ].workout_ability.percentage = percentage;
  //             }
  //           )
  //         );
  //       })
  //     );
  //     return data;
  //   } catch (err) {
  //     if (err.errno == 1062) {
  //       console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
  //       return -1;
  //     }
  //     console.log("getWorkoutRecordById ERROR: ", err);
  //     throw err;
  //   }
  // },
  // getNextSessionBatchDataGlobal: async (uid, last_session_id) => {
  //   // const fields = `${table_session}.session_id, ${table_userinfo}.uid, ${table_userinfo}.name, ${table_templateUsers}.name AS template_name, ${table_session}.created_at AS date`;
  //   // const query = `SELECT ${fields} FROM ${table_session}
  //   //                 INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = ${table_session}.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
  //   //                 LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
  //   //                 WHERE ${table_session}.is_deleted != 1 AND
  //   //                     (${table_session}.created_at < (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id})
  //   //                         OR (${table_session}.created_at = (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id}) AND session_id < ${last_session_id} ))
  //   //                 ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //   //                 LIMIT 50`;
  //   const fields = `SESSION_BATCH.userinfo_uid, SESSION_BATCH.profile_url, SESSION_BATCH.instagram_id, ${table_userinfo}.name, SESSION_BATCH.name AS session_name, ${table_templateUsers}.name AS template_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.set_type, ${table_workoutlog}.rpe, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.super_set_label, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.session_session_id, workout_order, set_order, SESSION_BATCH.created_at, SESSION_BATCH.start_time, SESSION_BATCH.total_time, SESSION_BATCH.device, max_one_rm, total_volume, max_volume, total_reps, max_weight`;
  //   const query = `SELECT ${fields} FROM ${table_workoutlog}
  //                       INNER JOIN
  //                       (SELECT session_id, userinfo_uid, profile_url, instagram_id, ${table_session}.name, ${table_session}.created_at, ${table_session}.start_time, total_time, device, templateUsers_template_id FROM ${table_session}
  //                       INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = userinfo_uid AND ${table_userinfo}.privacy_setting != 1
  //                       WHERE (${table_session}.created_at < (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id})
  //                               OR (${table_session}.created_at = (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id}) AND session_id < ${last_session_id} ))
  //                           AND ${table_session}.is_deleted != 1 AND ${table_session}.session_total_sets != 0
  //                       ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //                       LIMIT 30) AS SESSION_BATCH
  //                       ON SESSION_BATCH.session_id = ${table_workoutlog}.session_session_id
  //                       INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = SESSION_BATCH.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
  //                       LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = SESSION_BATCH.templateUsers_template_id
  //                       LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = SESSION_BATCH.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
  //                       ORDER BY SESSION_BATCH.created_at DESC, SESSION_BATCH.session_id DESC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
  //   try {
  //     let result = JSON.parse(
  //       JSON.stringify(await pool.queryParamSlave(query))
  //     );
  //     const restructure = async () => {
  //       let data = [];
  //       await asyncForEach(result, async (rowdata) => {
  //         // rowdata.max_heart_rate = 50;
  //         // console.log(rowdata.max_heart_rate)
  //         if (data.length == 0) {
  //           data.push({
  //             session_id: rowdata.session_session_id,
  //             uid: rowdata.userinfo_uid,
  //             profile_url: rowdata.profile_url,
  //             instagram_id: rowdata.instagram_id,
  //             name: rowdata.name,
  //             template_name:
  //               rowdata.session_name != null
  //                 ? rowdata.session_name
  //                 : rowdata.template_name,
  //             device: rowdata.device,
  //             session_detail: {
  //               created_at: rowdata.created_at,
  //               start_time: rowdata.start_time,
  //               total_workout_time: rowdata.total_time,
  //               content: [
  //                 {
  //                   workout_id: rowdata.workout_workout_id,
  //                   super_set_label: rowdata.super_set_label,
  //                   max_heart_rate: rowdata.max_heart_rate,
  //                   sets: [
  //                     {
  //                       reps: rowdata.reps,
  //                       weight: rowdata.weight,
  //                       duration: rowdata.duration,
  //                       distance: rowdata.distance,
  //                       set_type: rowdata.set_type,
  //                       rpe: rowdata.rpe,
  //                     },
  //                   ],
  //                   workout_ability: {
  //                     max_one_rm: rowdata.max_one_rm,
  //                     total_volume: rowdata.total_volume,
  //                     max_volume: rowdata.max_volume,
  //                     total_reps: rowdata.total_reps,
  //                     max_weight: rowdata.max_weight,
  //                   },
  //                 },
  //               ],
  //             },
  //           });
  //         } else if (
  //           data[data.length - 1].session_id == rowdata.session_session_id
  //         ) {
  //           const L = data[data.length - 1].session_detail.content.length;
  //           if (
  //             data[data.length - 1].session_detail.content[L - 1].workout_id ==
  //             rowdata.workout_workout_id
  //           ) {
  //             data[data.length - 1].session_detail.content[L - 1].sets.push({
  //               reps: rowdata.reps,
  //               weight: rowdata.weight,
  //               duration: rowdata.duration,
  //               distance: rowdata.distance,
  //               set_type: rowdata.set_type,
  //               rpe: rowdata.rpe,
  //             });
  //           } else {
  //             data[data.length - 1].session_detail.content.push({
  //               workout_id: rowdata.workout_workout_id,
  //               super_set_label: rowdata.super_set_label,
  //               max_heart_rate: rowdata.max_heart_rate,
  //               sets: [
  //                 {
  //                   reps: rowdata.reps,
  //                   weight: rowdata.weight,
  //                   duration: rowdata.duration,
  //                   distance: rowdata.distance,
  //                   set_type: rowdata.set_type,
  //                   rpe: rowdata.rpe,
  //                 },
  //               ],
  //               workout_ability: {
  //                 max_one_rm: rowdata.max_one_rm,
  //                 total_volume: rowdata.total_volume,
  //                 max_volume: rowdata.max_volume,
  //                 total_reps: rowdata.total_reps,
  //                 max_weight: rowdata.max_weight,
  //               },
  //             });
  //           }
  //         } else {
  //           data.push({
  //             session_id: rowdata.session_session_id,
  //             uid: rowdata.userinfo_uid,
  //             profile_url: rowdata.profile_url,
  //             instagram_id: rowdata.instagram_id,
  //             name: rowdata.name,
  //             template_name:
  //               rowdata.session_name != null
  //                 ? rowdata.session_name
  //                 : rowdata.template_name,
  //             device: rowdata.device,
  //             session_detail: {
  //               created_at: rowdata.created_at,
  //               start_time: rowdata.start_time,
  //               total_workout_time: rowdata.total_time,
  //               content: [
  //                 {
  //                   workout_id: rowdata.workout_workout_id,
  //                   super_set_label: rowdata.super_set_label,
  //                   max_heart_rate: rowdata.max_heart_rate,
  //                   sets: [
  //                     {
  //                       reps: rowdata.reps,
  //                       weight: rowdata.weight,
  //                       duration: rowdata.duration,
  //                       distance: rowdata.distance,
  //                       set_type: rowdata.set_type,
  //                       rpe: rowdata.rpe,
  //                     },
  //                   ],
  //                   workout_ability: {
  //                     max_one_rm: rowdata.max_one_rm,
  //                     total_volume: rowdata.total_volume,
  //                     max_volume: rowdata.max_volume,
  //                     total_reps: rowdata.total_reps,
  //                     max_weight: rowdata.max_weight,
  //                   },
  //                 },
  //               ],
  //             },
  //           });
  //         }
  //       });
  //       return data;
  //     };
  //     const data = await restructure();
  //     await Promise.all(
  //       data.map(async (session, session_index) => {
  //         const { sex, ageGroup, weightGroup, achievement } = await getUserInfo(
  //           session.uid
  //         );
  //         data[session_index].achievement = achievement;
  //         await Promise.all(
  //           session.session_detail.content.map(
  //             async (workout, workout_index) => {
  //               const { inclination, intercept } = await getWorkoutEquation(
  //                 workout.workout_id,
  //                 sex,
  //                 ageGroup,
  //                 weightGroup
  //               );
  //               let percentage = null;
  //               if (
  //                 inclination != null &&
  //                 intercept != null &&
  //                 workout.workout_ability.max_one_rm != 0 &&
  //                 workout.workout_ability.max_one_rm != null
  //               ) {
  //                 percentage = Math.round(
  //                   inclination * Math.log(workout.workout_ability.max_one_rm) +
  //                     intercept
  //                 );
  //               }
  //               data[session_index].session_detail.content[
  //                 workout_index
  //               ].workout_ability.percentage = percentage;
  //             }
  //           )
  //         );
  //       })
  //     );
  //     return data;
  //   } catch (err) {
  //     if (err.errno == 1062) {
  //       console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
  //       return -1;
  //     }
  //     console.log("getWorkoutRecordById ERROR: ", err);
  //     throw err;
  //   }
  // },
  getFirstSessionBatchData: async (uid, langCode) => {
    const fields = `SESSION_BATCH.userinfo_uid, SESSION_BATCH.profile_url, SESSION_BATCH.instagram_id, ${table_userinfo}.name, SESSION_BATCH.name AS session_name, ${table_templateUsers}.name AS template_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.set_type, ${table_workoutlog}.rpe, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.super_set_label, ${table_workoutlog}.session_session_id, workout_order, set_order, SESSION_BATCH.created_at, SESSION_BATCH.start_time, SESSION_BATCH.total_time, SESSION_BATCH.device, max_one_rm, total_volume, max_volume, total_reps, max_weight`;
    const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN 
                        (SELECT session_id, userinfo_uid, profile_url, instagram_id, ${table_session}.name, ${table_session}.created_at, ${table_session}.start_time, total_time, device, templateUsers_template_id FROM ${table_session}
                        INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = userinfo_uid AND ${table_userinfo}.privacy_setting != 1 AND ${table_userinfo}.lang_code = ${langCode}
                        WHERE ${table_session}.is_deleted != 1 AND ${table_session}.session_total_sets != 0
                        ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
                        LIMIT 30) AS SESSION_BATCH
                        ON SESSION_BATCH.session_id = ${table_workoutlog}.session_session_id
                        INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = SESSION_BATCH.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = SESSION_BATCH.templateUsers_template_id
                        LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = SESSION_BATCH.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
                        ORDER BY SESSION_BATCH.created_at DESC, SESSION_BATCH.session_id DESC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
    try {
      const key = "sessionBatchInit";
      let result = await cache.get(key, async () => {
        console.log("No Cache");
        return await pool.queryParamSlave(query);
      });
      const restructure = async () => {
        let data = [];
        await asyncForEach(result, async rowdata => {
          if (data.length == 0) {
            data.push({
              session_id: rowdata.session_session_id,
              uid: rowdata.userinfo_uid,
              profile_url: rowdata.profile_url,
              instagram_id: rowdata.instagram_id,
              name: rowdata.name,
              template_name: rowdata.session_name != null ? rowdata.session_name : rowdata.template_name,
              device: rowdata.device,
              session_detail: {
                created_at: rowdata.created_at,
                start_time: rowdata.start_time,
                total_workout_time: rowdata.total_time,
                content: [
                  {
                    workout_id: rowdata.workout_workout_id,
                    super_set_label: rowdata.super_set_label,
                    max_heart_rate: rowdata.max_heart_rate,
                    sets: [
                      {
                        reps: rowdata.reps,
                        weight: rowdata.weight,
                        duration: rowdata.duration,
                        distance: rowdata.distance,
                        set_type: rowdata.set_type,
                        rpe: rowdata.rpe
                      }
                    ],
                    workout_ability: {
                      max_one_rm: rowdata.max_one_rm,
                      total_volume: rowdata.total_volume,
                      max_volume: rowdata.max_volume,
                      total_reps: rowdata.total_reps,
                      max_weight: rowdata.max_weight
                    }
                  }
                ]
              }
            });
          } else if (data[data.length - 1].session_id == rowdata.session_session_id) {
            const L = data[data.length - 1].session_detail.content.length;
            if (data[data.length - 1].session_detail.content[L - 1].workout_id == rowdata.workout_workout_id) {
              data[data.length - 1].session_detail.content[L - 1].sets.push({
                reps: rowdata.reps,
                weight: rowdata.weight,
                duration: rowdata.duration,
                distance: rowdata.distance,
                set_type: rowdata.set_type,
                rpe: rowdata.rpe
              });
            } else {
              data[data.length - 1].session_detail.content.push({
                workout_id: rowdata.workout_workout_id,
                super_set_label: rowdata.super_set_label,
                max_heart_rate: rowdata.max_heart_rate,
                sets: [
                  {
                    reps: rowdata.reps,
                    weight: rowdata.weight,
                    duration: rowdata.duration,
                    distance: rowdata.distance,
                    set_type: rowdata.set_type,
                    rpe: rowdata.rpe
                  }
                ],
                workout_ability: {
                  max_one_rm: rowdata.max_one_rm,
                  total_volume: rowdata.total_volume,
                  max_volume: rowdata.max_volume,
                  total_reps: rowdata.total_reps,
                  max_weight: rowdata.max_weight
                }
              });
            }
          } else {
            data.push({
              session_id: rowdata.session_session_id,
              uid: rowdata.userinfo_uid,
              profile_url: rowdata.profile_url,
              instagram_id: rowdata.instagram_id,
              name: rowdata.name,
              template_name: rowdata.session_name != null ? rowdata.session_name : rowdata.template_name,
              device: rowdata.device,
              session_detail: {
                created_at: rowdata.created_at,
                start_time: rowdata.start_time,
                total_workout_time: rowdata.total_time,
                content: [
                  {
                    workout_id: rowdata.workout_workout_id,
                    super_set_label: rowdata.super_set_label,
                    max_heart_rate: rowdata.max_heart_rate,
                    sets: [
                      {
                        reps: rowdata.reps,
                        weight: rowdata.weight,
                        duration: rowdata.duration,
                        distance: rowdata.distance,
                        set_type: rowdata.set_type,
                        rpe: rowdata.rpe
                      }
                    ],
                    workout_ability: {
                      max_one_rm: rowdata.max_one_rm,
                      total_volume: rowdata.total_volume,
                      max_volume: rowdata.max_volume,
                      total_reps: rowdata.total_reps,
                      max_weight: rowdata.max_weight
                    }
                  }
                ]
              }
            });
          }
        });
        return data;
      };
      const data = await restructure();
      await Promise.all(
        data.map(async (session, session_index) => {
          const { sex, ageGroup, weightGroup, achievement } = await getUserInfo(session.uid);
          data[session_index].achievement = achievement;
          await Promise.all(
            session.session_detail.content.map(async (workout, workout_index) => {
              const { inclination, intercept } = await getWorkoutEquation(workout.workout_id, sex, ageGroup, weightGroup);
              let percentage = null;
              if (
                inclination != null &&
                intercept != null &&
                workout.workout_ability.max_one_rm != 0 &&
                workout.workout_ability.max_one_rm != null
              ) {
                percentage = Math.round(inclination * Math.log(workout.workout_ability.max_one_rm) + intercept);
              }
              data[session_index].session_detail.content[workout_index].workout_ability.percentage = percentage;
            })
          );
        })
      );
      return data;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutRecordById ERROR: ", err);
      throw err;
    }
  },
  getNextSessionBatchData: async (uid, last_session_id, langCode) => {
    const fields = `SESSION_BATCH.userinfo_uid, SESSION_BATCH.profile_url, SESSION_BATCH.instagram_id, ${table_userinfo}.name, SESSION_BATCH.name AS session_name, ${table_templateUsers}.name AS template_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.set_type, ${table_workoutlog}.rpe, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.super_set_label, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.session_session_id, workout_order, set_order, SESSION_BATCH.created_at, SESSION_BATCH.start_time, SESSION_BATCH.total_time, SESSION_BATCH.device, max_one_rm, total_volume, max_volume, total_reps, max_weight`;
    const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN 
                        (SELECT session_id, userinfo_uid, profile_url, instagram_id, ${table_session}.name, ${table_session}.created_at, ${table_session}.start_time, total_time, device, templateUsers_template_id FROM ${table_session}
                        INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = userinfo_uid AND ${table_userinfo}.privacy_setting != 1 AND ${table_userinfo}.lang_code = ${langCode}
                        WHERE (${table_session}.created_at < (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id})
                                OR (${table_session}.created_at = (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id}) AND session_id < ${last_session_id} ))
                            AND ${table_session}.is_deleted != 1 AND ${table_session}.session_total_sets != 0
                        ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
                        LIMIT 30) AS SESSION_BATCH
                        ON SESSION_BATCH.session_id = ${table_workoutlog}.session_session_id
                        INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = SESSION_BATCH.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = SESSION_BATCH.templateUsers_template_id
                        LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = SESSION_BATCH.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
                        ORDER BY SESSION_BATCH.created_at DESC, SESSION_BATCH.session_id DESC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;

    try {
      const key = "sessionBatchNext" + `${last_session_id}`;
      let result = await cache.get(key, async () => {
        console.log("No Cache");
        return await pool.queryParamSlave(query);
      });
      const restructure = async () => {
        let data = [];
        await asyncForEach(result, async rowdata => {
          // rowdata.max_heart_rate = 50;
          // console.log(rowdata.max_heart_rate)
          if (data.length == 0) {
            data.push({
              session_id: rowdata.session_session_id,
              uid: rowdata.userinfo_uid,
              profile_url: rowdata.profile_url,
              instagram_id: rowdata.instagram_id,
              name: rowdata.name,
              template_name: rowdata.session_name != null ? rowdata.session_name : rowdata.template_name,
              device: rowdata.device,
              session_detail: {
                created_at: rowdata.created_at,
                start_time: rowdata.start_time,
                total_workout_time: rowdata.total_time,
                content: [
                  {
                    workout_id: rowdata.workout_workout_id,
                    super_set_label: rowdata.super_set_label,
                    max_heart_rate: rowdata.max_heart_rate,
                    sets: [
                      {
                        reps: rowdata.reps,
                        weight: rowdata.weight,
                        duration: rowdata.duration,
                        distance: rowdata.distance,
                        set_type: rowdata.set_type,
                        rpe: rowdata.rpe
                      }
                    ],
                    workout_ability: {
                      max_one_rm: rowdata.max_one_rm,
                      total_volume: rowdata.total_volume,
                      max_volume: rowdata.max_volume,
                      total_reps: rowdata.total_reps,
                      max_weight: rowdata.max_weight
                    }
                  }
                ]
              }
            });
          } else if (data[data.length - 1].session_id == rowdata.session_session_id) {
            const L = data[data.length - 1].session_detail.content.length;
            if (data[data.length - 1].session_detail.content[L - 1].workout_id == rowdata.workout_workout_id) {
              data[data.length - 1].session_detail.content[L - 1].sets.push({
                reps: rowdata.reps,
                weight: rowdata.weight,
                duration: rowdata.duration,
                distance: rowdata.distance,
                set_type: rowdata.set_type,
                rpe: rowdata.rpe
              });
            } else {
              data[data.length - 1].session_detail.content.push({
                workout_id: rowdata.workout_workout_id,
                super_set_label: rowdata.super_set_label,
                max_heart_rate: rowdata.max_heart_rate,
                sets: [
                  {
                    reps: rowdata.reps,
                    weight: rowdata.weight,
                    duration: rowdata.duration,
                    distance: rowdata.distance,
                    set_type: rowdata.set_type,
                    rpe: rowdata.rpe
                  }
                ],
                workout_ability: {
                  max_one_rm: rowdata.max_one_rm,
                  total_volume: rowdata.total_volume,
                  max_volume: rowdata.max_volume,
                  total_reps: rowdata.total_reps,
                  max_weight: rowdata.max_weight
                }
              });
            }
          } else {
            data.push({
              session_id: rowdata.session_session_id,
              uid: rowdata.userinfo_uid,
              profile_url: rowdata.profile_url,
              instagram_id: rowdata.instagram_id,
              name: rowdata.name,
              template_name: rowdata.session_name != null ? rowdata.session_name : rowdata.template_name,
              device: rowdata.device,
              session_detail: {
                created_at: rowdata.created_at,
                start_time: rowdata.start_time,
                total_workout_time: rowdata.total_time,
                content: [
                  {
                    workout_id: rowdata.workout_workout_id,
                    super_set_label: rowdata.super_set_label,
                    max_heart_rate: rowdata.max_heart_rate,
                    sets: [
                      {
                        reps: rowdata.reps,
                        weight: rowdata.weight,
                        duration: rowdata.duration,
                        distance: rowdata.distance,
                        set_type: rowdata.set_type,
                        rpe: rowdata.rpe
                      }
                    ],
                    workout_ability: {
                      max_one_rm: rowdata.max_one_rm,
                      total_volume: rowdata.total_volume,
                      max_volume: rowdata.max_volume,
                      total_reps: rowdata.total_reps,
                      max_weight: rowdata.max_weight
                    }
                  }
                ]
              }
            });
          }
        });
        return data;
      };
      const data = await restructure();
      await Promise.all(
        data.map(async (session, session_index) => {
          const { sex, ageGroup, weightGroup, achievement } = await getUserInfo(session.uid);
          data[session_index].achievement = achievement;
          await Promise.all(
            session.session_detail.content.map(async (workout, workout_index) => {
              const { inclination, intercept } = await getWorkoutEquation(workout.workout_id, sex, ageGroup, weightGroup);
              let percentage = null;
              if (
                inclination != null &&
                intercept != null &&
                workout.workout_ability.max_one_rm != 0 &&
                workout.workout_ability.max_one_rm != null
              ) {
                percentage = Math.round(inclination * Math.log(workout.workout_ability.max_one_rm) + intercept);
              }
              data[session_index].session_detail.content[workout_index].workout_ability.percentage = percentage;
            })
          );
        })
      );
      return data;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutRecordById ERROR: ", err);
      throw err;
    }
  },
  // getFirstSessionBatchDataProfile: async (uid, langCode) => {
  //   // const fields = `${table_session}.session_id, ${table_userinfo}.uid, ${table_userinfo}.name, ${table_templateUsers}.name AS template_name, ${table_session}.created_at AS date`;
  //   // const query = `SELECT ${fields} FROM ${table_session}
  //   //                 INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = ${table_session}.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
  //   //                 LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
  //   //                 WHERE ${table_session}.is_deleted != 1
  //   //                 ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //   //                 LIMIT 50`;
  //   const fields = `SESSION_BATCH.userinfo_uid, SESSION_BATCH.profile_url, SESSION_BATCH.instagram_id, ${table_userinfo}.name, SESSION_BATCH.name AS session_name, ${table_templateUsers}.name AS template_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.set_type, ${table_workoutlog}.rpe, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.super_set_label, ${table_workoutlog}.session_session_id, workout_order, set_order, SESSION_BATCH.created_at, SESSION_BATCH.start_time, SESSION_BATCH.total_time, SESSION_BATCH.device, max_one_rm, total_volume, max_volume, total_reps, max_weight`;
  //   const query = `SELECT ${fields} FROM ${table_workoutlog}
  //                       INNER JOIN
  //                       (SELECT session_id, userinfo_uid, profile_url, instagram_id, ${table_session}.name, ${table_session}.created_at, ${table_session}.start_time, total_time, device, templateUsers_template_id FROM ${table_session}
  //                       INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = userinfo_uid AND ${table_userinfo}.privacy_setting != 1 AND ${table_userinfo}.lang_code = ${langCode} AND ${table_userinfo}.profile_url IS NOT NULL
  //                       WHERE ${table_session}.is_deleted != 1 AND ${table_session}.session_total_sets != 0
  //                       ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //                       LIMIT 30) AS SESSION_BATCH
  //                       ON SESSION_BATCH.session_id = ${table_workoutlog}.session_session_id
  //                       INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = SESSION_BATCH.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
  //                       LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = SESSION_BATCH.templateUsers_template_id
  //                       LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = SESSION_BATCH.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
  //                       ORDER BY SESSION_BATCH.created_at DESC, SESSION_BATCH.session_id DESC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
  //   try {
  //     var start = new Date();

  //     let result = await pool.queryParamSlave(query);
  //     console.log(new Date() - start);
  //     const restructure = async () => {
  //       let data = [];
  //       await asyncForEach(result, async (rowdata) => {
  //         // rowdata.max_heart_rate = 50;
  //         if (data.length == 0) {
  //           data.push({
  //             session_id: rowdata.session_session_id,
  //             uid: rowdata.userinfo_uid,
  //             profile_url: rowdata.profile_url,
  //             instagram_id: rowdata.instagram_id,
  //             name: rowdata.name,
  //             template_name:
  //               rowdata.session_name != null
  //                 ? rowdata.session_name
  //                 : rowdata.template_name,
  //             device: rowdata.device,
  //             session_detail: {
  //               created_at: rowdata.created_at,
  //               start_time: rowdata.start_time,
  //               total_workout_time: rowdata.total_time,
  //               content: [
  //                 {
  //                   workout_id: rowdata.workout_workout_id,
  //                   super_set_label: rowdata.super_set_label,
  //                   max_heart_rate: rowdata.max_heart_rate,
  //                   sets: [
  //                     {
  //                       reps: rowdata.reps,
  //                       weight: rowdata.weight,
  //                       duration: rowdata.duration,
  //                       distance: rowdata.distance,
  //                       set_type: rowdata.set_type,
  //                       rpe: rowdata.rpe,
  //                     },
  //                   ],
  //                   workout_ability: {
  //                     max_one_rm: rowdata.max_one_rm,
  //                     total_volume: rowdata.total_volume,
  //                     max_volume: rowdata.max_volume,
  //                     total_reps: rowdata.total_reps,
  //                     max_weight: rowdata.max_weight,
  //                   },
  //                 },
  //               ],
  //             },
  //           });
  //         } else if (
  //           data[data.length - 1].session_id == rowdata.session_session_id
  //         ) {
  //           const L = data[data.length - 1].session_detail.content.length;
  //           if (
  //             data[data.length - 1].session_detail.content[L - 1].workout_id ==
  //             rowdata.workout_workout_id
  //           ) {
  //             data[data.length - 1].session_detail.content[L - 1].sets.push({
  //               reps: rowdata.reps,
  //               weight: rowdata.weight,
  //               duration: rowdata.duration,
  //               distance: rowdata.distance,
  //               set_type: rowdata.set_type,
  //               rpe: rowdata.rpe,
  //             });
  //           } else {
  //             data[data.length - 1].session_detail.content.push({
  //               workout_id: rowdata.workout_workout_id,
  //               super_set_label: rowdata.super_set_label,
  //               max_heart_rate: rowdata.max_heart_rate,
  //               sets: [
  //                 {
  //                   reps: rowdata.reps,
  //                   weight: rowdata.weight,
  //                   duration: rowdata.duration,
  //                   distance: rowdata.distance,
  //                   set_type: rowdata.set_type,
  //                   rpe: rowdata.rpe,
  //                 },
  //               ],
  //               workout_ability: {
  //                 max_one_rm: rowdata.max_one_rm,
  //                 total_volume: rowdata.total_volume,
  //                 max_volume: rowdata.max_volume,
  //                 total_reps: rowdata.total_reps,
  //                 max_weight: rowdata.max_weight,
  //               },
  //             });
  //           }
  //         } else {
  //           data.push({
  //             session_id: rowdata.session_session_id,
  //             uid: rowdata.userinfo_uid,
  //             profile_url: rowdata.profile_url,
  //             instagram_id: rowdata.instagram_id,
  //             name: rowdata.name,
  //             template_name:
  //               rowdata.session_name != null
  //                 ? rowdata.session_name
  //                 : rowdata.template_name,
  //             device: rowdata.device,
  //             session_detail: {
  //               created_at: rowdata.created_at,
  //               start_time: rowdata.start_time,
  //               total_workout_time: rowdata.total_time,
  //               content: [
  //                 {
  //                   workout_id: rowdata.workout_workout_id,
  //                   super_set_label: rowdata.super_set_label,
  //                   max_heart_rate: rowdata.max_heart_rate,
  //                   sets: [
  //                     {
  //                       reps: rowdata.reps,
  //                       weight: rowdata.weight,
  //                       duration: rowdata.duration,
  //                       distance: rowdata.distance,
  //                       set_type: rowdata.set_type,
  //                       rpe: rowdata.rpe,
  //                     },
  //                   ],
  //                   workout_ability: {
  //                     max_one_rm: rowdata.max_one_rm,
  //                     total_volume: rowdata.total_volume,
  //                     max_volume: rowdata.max_volume,
  //                     total_reps: rowdata.total_reps,
  //                     max_weight: rowdata.max_weight,
  //                   },
  //                 },
  //               ],
  //             },
  //           });
  //         }
  //       });
  //       return data;
  //     };
  //     const data = await restructure();
  //     console.log(new Date() - start);

  //     await Promise.all(
  //       data.map(async (session, session_index) => {
  //         const { sex, ageGroup, weightGroup, achievement } = await getUserInfo(
  //           session.uid
  //         );
  //         //console.log(achievement)
  //         data[session_index].achievement = achievement;
  //         await Promise.all(
  //           session.session_detail.content.map(
  //             async (workout, workout_index) => {
  //               const { inclination, intercept } = await getWorkoutEquation(
  //                 workout.workout_id,
  //                 sex,
  //                 ageGroup,
  //                 weightGroup
  //               );
  //               let percentage = null;
  //               if (
  //                 inclination != null &&
  //                 intercept != null &&
  //                 workout.workout_ability.max_one_rm != 0 &&
  //                 workout.workout_ability.max_one_rm != null
  //               ) {
  //                 percentage = Math.round(
  //                   inclination * Math.log(workout.workout_ability.max_one_rm) +
  //                     intercept
  //                 );
  //               }
  //               data[session_index].session_detail.content[
  //                 workout_index
  //               ].workout_ability.percentage = percentage;
  //             }
  //           )
  //         );
  //       })
  //     );
  //     console.log(new Date() - start);
  //     return data;
  //   } catch (err) {
  //     if (err.errno == 1062) {
  //       console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
  //       return -1;
  //     }
  //     console.log("getWorkoutRecordById ERROR: ", err);
  //     throw err;
  //   }
  // },
  // getNextSessionBatchDataProfile: async (uid, last_session_id, langCode) => {
  //   // const fields = `${table_session}.session_id, ${table_userinfo}.uid, ${table_userinfo}.name, ${table_templateUsers}.name AS template_name, ${table_session}.created_at AS date`;
  //   // const query = `SELECT ${fields} FROM ${table_session}
  //   //                 INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = ${table_session}.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
  //   //                 LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
  //   //                 WHERE ${table_session}.is_deleted != 1 AND
  //   //                     (${table_session}.created_at < (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id})
  //   //                         OR (${table_session}.created_at = (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id}) AND session_id < ${last_session_id} ))
  //   //                 ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //   //                 LIMIT 50`;
  //   const fields = `SESSION_BATCH.userinfo_uid, SESSION_BATCH.profile_url, SESSION_BATCH.instagram_id, ${table_userinfo}.name, SESSION_BATCH.name AS session_name, ${table_templateUsers}.name AS template_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.set_type, ${table_workoutlog}.rpe, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.super_set_label, ${table_workoutlog}.max_heart_rate, ${table_workoutlog}.session_session_id, workout_order, set_order, SESSION_BATCH.created_at, SESSION_BATCH.start_time, SESSION_BATCH.total_time, SESSION_BATCH.device, max_one_rm, total_volume, max_volume, total_reps, max_weight`;
  //   const query = `SELECT ${fields} FROM ${table_workoutlog}
  //                       INNER JOIN
  //                       (SELECT session_id, userinfo_uid, profile_url, instagram_id, ${table_session}.name, ${table_session}.created_at, ${table_session}.start_time, total_time, device, templateUsers_template_id FROM ${table_session}
  //                       INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = userinfo_uid AND ${table_userinfo}.privacy_setting != 1 AND ${table_userinfo}.lang_code = ${langCode} AND ${table_userinfo}.profile_url IS NOT NULL
  //                       WHERE (${table_session}.created_at < (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id})
  //                               OR (${table_session}.created_at = (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id}) AND session_id < ${last_session_id} ))
  //                           AND ${table_session}.is_deleted != 1 AND ${table_session}.session_total_sets != 0
  //                       ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //                       LIMIT 30) AS SESSION_BATCH
  //                       ON SESSION_BATCH.session_id = ${table_workoutlog}.session_session_id
  //                       INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = SESSION_BATCH.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
  //                       LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = SESSION_BATCH.templateUsers_template_id
  //                       LEFT JOIN ${table_workoutAbility} ON ${table_workoutAbility}.session_session_id = SESSION_BATCH.session_id AND ${table_workoutAbility}.workout_workout_id = ${table_workoutlog}.workout_workout_id
  //                       ORDER BY SESSION_BATCH.created_at DESC, SESSION_BATCH.session_id DESC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
  //   // const query = `SELECT * FROM ${table_workoutlog}
  //   //                INNER JOIN
  //   //                 (SELECT session_id, userinfo_uid, ${table_session}.name, ${table_session}.created_at, ${table_session}.start_time, total_time, device, templateUsers_template_id FROM ${table_session}
  //   //                 INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = userinfo_uid AND ${table_userinfo}.privacy_setting != 1 AND ${table_userinfo}.lang_code = ${langCode}
  //   //                 WHERE (${table_session}.created_at < (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id})
  //   //                         OR (${table_session}.created_at = (SELECT created_at FROM ${table_session} WHERE session_id = ${last_session_id}) AND session_id < ${last_session_id} ))
  //   //                     AND ${table_session}.is_deleted != 1
  //   //                 ORDER BY ${table_session}.created_at DESC, ${table_session}.session_id DESC
  //   //                 LIMIT 15) AS SESSION_BATCH
  //   //                 ON SESSION_BATCH.session_id = ${table_workoutlog}.session_session_id`;

  //   try {
  //     let result = JSON.parse(
  //       JSON.stringify(await pool.queryParamSlave(query))
  //     );
  //     const restructure = async () => {
  //       let data = [];
  //       await asyncForEach(result, async (rowdata) => {
  //         // rowdata.max_heart_rate = 50;
  //         // console.log(rowdata.max_heart_rate)
  //         if (data.length == 0) {
  //           data.push({
  //             session_id: rowdata.session_session_id,
  //             uid: rowdata.userinfo_uid,
  //             profile_url: rowdata.profile_url,
  //             instagram_id: rowdata.instagram_id,
  //             name: rowdata.name,
  //             template_name:
  //               rowdata.session_name != null
  //                 ? rowdata.session_name
  //                 : rowdata.template_name,
  //             device: rowdata.device,
  //             session_detail: {
  //               created_at: rowdata.created_at,
  //               start_time: rowdata.start_time,
  //               total_workout_time: rowdata.total_time,
  //               content: [
  //                 {
  //                   workout_id: rowdata.workout_workout_id,
  //                   super_set_label: rowdata.super_set_label,
  //                   max_heart_rate: rowdata.max_heart_rate,
  //                   sets: [
  //                     {
  //                       reps: rowdata.reps,
  //                       weight: rowdata.weight,
  //                       duration: rowdata.duration,
  //                       distance: rowdata.distance,
  //                       set_type: rowdata.set_type,
  //                       rpe: rowdata.rpe,
  //                     },
  //                   ],
  //                   workout_ability: {
  //                     max_one_rm: rowdata.max_one_rm,
  //                     total_volume: rowdata.total_volume,
  //                     max_volume: rowdata.max_volume,
  //                     total_reps: rowdata.total_reps,
  //                     max_weight: rowdata.max_weight,
  //                   },
  //                 },
  //               ],
  //             },
  //           });
  //         } else if (
  //           data[data.length - 1].session_id == rowdata.session_session_id
  //         ) {
  //           const L = data[data.length - 1].session_detail.content.length;
  //           if (
  //             data[data.length - 1].session_detail.content[L - 1].workout_id ==
  //             rowdata.workout_workout_id
  //           ) {
  //             data[data.length - 1].session_detail.content[L - 1].sets.push({
  //               reps: rowdata.reps,
  //               weight: rowdata.weight,
  //               duration: rowdata.duration,
  //               distance: rowdata.distance,
  //               set_type: rowdata.set_type,
  //               rpe: rowdata.rpe,
  //             });
  //           } else {
  //             data[data.length - 1].session_detail.content.push({
  //               workout_id: rowdata.workout_workout_id,
  //               super_set_label: rowdata.super_set_label,
  //               max_heart_rate: rowdata.max_heart_rate,
  //               sets: [
  //                 {
  //                   reps: rowdata.reps,
  //                   weight: rowdata.weight,
  //                   duration: rowdata.duration,
  //                   distance: rowdata.distance,
  //                   set_type: rowdata.set_type,
  //                   rpe: rowdata.rpe,
  //                 },
  //               ],
  //               workout_ability: {
  //                 max_one_rm: rowdata.max_one_rm,
  //                 total_volume: rowdata.total_volume,
  //                 max_volume: rowdata.max_volume,
  //                 total_reps: rowdata.total_reps,
  //                 max_weight: rowdata.max_weight,
  //               },
  //             });
  //           }
  //         } else {
  //           data.push({
  //             session_id: rowdata.session_session_id,
  //             uid: rowdata.userinfo_uid,
  //             profile_url: rowdata.profile_url,
  //             instagram_id: rowdata.instagram_id,
  //             name: rowdata.name,
  //             template_name:
  //               rowdata.session_name != null
  //                 ? rowdata.session_name
  //                 : rowdata.template_name,
  //             device: rowdata.device,
  //             session_detail: {
  //               created_at: rowdata.created_at,
  //               start_time: rowdata.start_time,
  //               total_workout_time: rowdata.total_time,
  //               content: [
  //                 {
  //                   workout_id: rowdata.workout_workout_id,
  //                   super_set_label: rowdata.super_set_label,
  //                   max_heart_rate: rowdata.max_heart_rate,
  //                   sets: [
  //                     {
  //                       reps: rowdata.reps,
  //                       weight: rowdata.weight,
  //                       duration: rowdata.duration,
  //                       distance: rowdata.distance,
  //                       set_type: rowdata.set_type,
  //                       rpe: rowdata.rpe,
  //                     },
  //                   ],
  //                   workout_ability: {
  //                     max_one_rm: rowdata.max_one_rm,
  //                     total_volume: rowdata.total_volume,
  //                     max_volume: rowdata.max_volume,
  //                     total_reps: rowdata.total_reps,
  //                     max_weight: rowdata.max_weight,
  //                   },
  //                 },
  //               ],
  //             },
  //           });
  //         }
  //       });
  //       return data;
  //     };
  //     const data = await restructure();
  //     await Promise.all(
  //       data.map(async (session, session_index) => {
  //         const { sex, ageGroup, weightGroup, achievement } = await getUserInfo(
  //           session.uid
  //         );
  //         data[session_index].achievement = achievement;
  //         await Promise.all(
  //           session.session_detail.content.map(
  //             async (workout, workout_index) => {
  //               const { inclination, intercept } = await getWorkoutEquation(
  //                 workout.workout_id,
  //                 sex,
  //                 ageGroup,
  //                 weightGroup
  //               );
  //               let percentage = null;
  //               if (
  //                 inclination != null &&
  //                 intercept != null &&
  //                 workout.workout_ability.max_one_rm != 0 &&
  //                 workout.workout_ability.max_one_rm != null
  //               ) {
  //                 percentage = Math.round(
  //                   inclination * Math.log(workout.workout_ability.max_one_rm) +
  //                     intercept
  //                 );
  //               }
  //               data[session_index].session_detail.content[
  //                 workout_index
  //               ].workout_ability.percentage = percentage;
  //             }
  //           )
  //         );
  //       })
  //     );
  //     return data;
  //   } catch (err) {
  //     if (err.errno == 1062) {
  //       console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
  //       return -1;
  //     }
  //     console.log("getWorkoutRecordById ERROR: ", err);
  //     throw err;
  //   }
  // },
  getAllSessionData: async uid => {
    const fields = `${table_session}.userinfo_uid, ${table_userinfo}.name, ${table_templateUsers}.name AS template_name, ${table_workoutlog}.reps, ${table_workoutlog}.weight, ${table_workoutlog}.duration, ${table_workoutlog}.distance, ${table_workoutlog}.set_type, ${table_workoutlog}.rpe, ${table_workoutlog}.workout_workout_id, ${table_workoutlog}.session_session_id, workout_order, set_order, ${table_session}.created_at, ${table_session}.total_time`;
    const query = `SELECT ${fields} FROM ${table_workoutlog}
                        INNER JOIN ${table_session} ON ${table_session}.session_id = ${table_workoutlog}.session_session_id AND ${table_session}.is_deleted != 1
                        INNER JOIN ${table_userinfo} ON ${table_userinfo}.uid = ${table_session}.userinfo_uid AND (${table_userinfo}.privacy_setting != 1 OR (${table_userinfo}.privacy_setting = 1 AND ${table_userinfo}.uid = '${uid}'))
                        LEFT JOIN ${table_templateUsers} ON ${table_templateUsers}.templateUsers_id = ${table_session}.templateUsers_template_id
                        ORDER BY ${table_session}.created_at DESC, ${table_workoutlog}.workout_order ASC, ${table_workoutlog}.set_order ASC`;
    try {
      let result = JSON.parse(JSON.stringify(await pool.queryParamSlave(query)));
      const restructure = async () => {
        let data = [];
        await asyncForEach(result, async rowdata => {
          if (data.length == 0) {
            data.push({
              session_id: rowdata.session_session_id,
              uid: rowdata.userinfo_uid,
              name: rowdata.name,
              template_name: rowdata.template_name,
              session_detail: {
                date: rowdata.created_at,
                total_workout_time: rowdata.total_time,
                content: [
                  {
                    workout_id: rowdata.workout_workout_id,
                    sets: [
                      {
                        reps: rowdata.reps,
                        weight: rowdata.weight,
                        duration: rowdata.duration,
                        distance: rowdata.distance,
                        set_type: rowdata.set_type,
                        rpe: rowdata.rpe
                      }
                    ]
                  }
                ]
              }
            });
          } else if (data[data.length - 1].session_id == rowdata.session_session_id) {
            const L = data[data.length - 1].session_detail.content.length;
            if (data[data.length - 1].session_detail.content[L - 1].workout_id == rowdata.workout_workout_id) {
              data[data.length - 1].session_detail.content[L - 1].sets.push({
                reps: rowdata.reps,
                weight: rowdata.weight,
                duration: rowdata.duration,
                distance: rowdata.distance,
                set_type: rowdata.set_type,
                rpe: rowdata.rpe
              });
            } else {
              data[data.length - 1].session_detail.content.push({
                workout_id: rowdata.workout_workout_id,
                sets: [
                  {
                    reps: rowdata.reps,
                    weight: rowdata.weight,
                    duration: rowdata.duration,
                    distance: rowdata.distance,
                    set_type: rowdata.set_type,
                    rpe: rowdata.rpe
                  }
                ]
              });
            }
          } else {
            data.push({
              session_id: rowdata.session_session_id,
              uid: rowdata.userinfo_uid,
              name: rowdata.name,
              template_name: rowdata.template_name,
              session_detail: {
                date: rowdata.created_at,
                total_workout_time: rowdata.total_time,
                content: [
                  {
                    workout_id: rowdata.workout_workout_id,
                    sets: [
                      {
                        reps: rowdata.reps,
                        weight: rowdata.weight,
                        duration: rowdata.duration,
                        distance: rowdata.distance,
                        set_type: rowdata.set_type,
                        rpe: rowdata.rpe
                      }
                    ]
                  }
                ]
              }
            });
          }
        });
        return data;
      };
      const data = await restructure();
      return data;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("getWorkoutRecordById ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("getWorkoutRecordById ERROR: ", err);
      throw err;
    }
  },
  getBookSession: async uid => {
    const fields1 = "templateUsers_templateUsers_id, set_time";
    const query1 = `SELECT ${fields1} FROM ${table_sessionBook} WHERE userinfo_uid = '${uid}'`;

    try {
      const result1 = await pool.queryParamSlave(query1);
      return result1[0];
    } catch (err) {
      if (err.errno == 1062) {
        console.log("postTemplateData ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("postTemplateData ERROR: ", err);
      throw err;
    }
  },
  postBookSession: async (uid, template_id, set_time, is_alarm) => {
    const fields1 = "userinfo_uid, templateUsers_templateUsers_id, onesignal_id, set_time";
    const questions1 = "?, ?, ?, ?";
    const query1 = `INSERT INTO ${table_sessionBook}(${fields1}) VALUES(${questions1})`;

    let onesignal_id = null;

    try {
      if (is_alarm == "true") onesignal_id = await OneSignal.registerNotification(uid, set_time);
      await pool.queryParamArrMaster(query1, [uid, template_id, onesignal_id, set_time]);
      return;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("postTemplateData ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("postTemplateData ERROR: ", err);
      throw err;
    }
  },
  deleteBookSession: async uid => {
    const fields1 = "onesignal_id";
    const query1 = `SELECT ${fields1} FROM ${table_sessionBook} WHERE userinfo_uid = '${uid}'`;
    const query2 = `DELETE FROM ${table_sessionBook} WHERE userinfo_uid = '${uid}'`;

    try {
      const result1 = await pool.queryParamMaster(query1);
      await Promise.all(
        result1.map(async rowdata => {
          try {
            await OneSignal.cancelNotification(rowdata.onesignal_id);
          } catch {}
        })
      );
      await pool.queryParamMaster(query2);
      return;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("postTemplateData ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("postTemplateData ERROR: ", err);
      throw err;
    }
  },
  transferSession: async (uid, session_id) => {
    let newSessionId;

    const ts1 = async connection => {
      const fieldsNew1 = `userinfo_uid, created_at, start_time, name, templateUsers_template_id, total_time, device`;
      const fieldsOriginal1 = `'${uid}', created_at, start_time, name, templateUsers_template_id, total_time, device`;
      // Insert into Session Table
      const query1 = `INSERT INTO ${table_session}(${fieldsNew1})
                      SELECT ${fieldsOriginal1} FROM ${table_session} WHERE session_id = ${session_id}`;
      const result1 = await connection.query(query1);
      newSessionId = result1.insertId;
    };
    const ts2 = async connection => {
      const fieldsNew2 = `reps, weight, duration, distance, iswarmup, workout_order, set_order, max_heart_rate, super_set_label, rest_time, set_type, rpe, workout_workout_id, session_session_id`;
      const fieldsOriginal2 = `reps, weight, duration, distance, iswarmup, workout_order, set_order, max_heart_rate, super_set_label, rest_time, set_type, rpe, workout_workout_id, ${newSessionId}`;
      // Insert into Workoutlog Table
      const query2 = `INSERT INTO ${table_workoutlog}(${fieldsNew2})
                      SELECT ${fieldsOriginal2} FROM ${table_workoutlog} WHERE session_session_id = ${session_id}`;
      await connection.query(query2);
    };
    const ts3 = async connection => {
      const fields3 = `${table_workout}.workout_id`;
      const query3 = `SELECT ${fields3} FROM
                      (SELECT DISTINCT(workout_workout_id) AS workout_id FROM ${table_workoutlog}
                        WHERE session_session_id = ${session_id}) A
                      INNER JOIN ${table_workout} ON A.workout_id = ${table_workout}.workout_id
                      WHERE is_custom = 1`;
      const result3 = await connection.query(query3);
      await asyncForEach(result3, async rowdata => {
        // const fields4 =
        //   "korean, english, category, muscle_p, muscle_s1, equipment, record_type, multiplier, video_url, video_url_substitute, is_custom, reference_num";
        // const query4 = `INSERT INTO ${table_workout}(${fields4})
        //                 SELECT ${fields4} FROM ${table_workout}
        //                 WHERE workout_id = ${rowdata.workout_id}`;
        // const insertWorkoutId = (await connection.query(query4)).insertId;

        const fields5 = "workout_workout_id, userinfo_uid, created_at";
        const questions5 = "?, ?, ?";
        const values5 = [rowdata.workout_id, uid, await timeFunction.currentTime()];
        const query5 = `INSERT IGNORE INTO ${table_customWorkout}(${fields5}) VALUES(${questions5})`;
        await connection.query(query5, values5);
        const query6 = `UPDATE ${table_customWorkout} SET is_deleted = 0
                        WHERE workout_workout_id = ${rowdata.workout_id} AND userinfo_uid = '${uid}'`;
        await connection.query(query6);
      });
    };
    try {
      let transactionArr = new Array();
      transactionArr.push(ts1);
      transactionArr.push(ts2);
      transactionArr.push(ts3);
      await pool.Transaction(transactionArr);
      return newSessionId;
    } catch (err) {
      if (err.errno == 1062) {
        console.log("postTemplateData ERROR: ", err.errno, err.code);
        return -1;
      }
      console.log("postTemplateData ERROR: ", err);
      throw err;
    }
  }
};

module.exports = session;
