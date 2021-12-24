var admin = require('firebase-admin');
const pool = require('../pool');
const table_fcmToken = 'fcmToken';

function sessionFinish(name, templateName, langCode) {
  switch (langCode.toString()) {
    case "1":
      return {
        message_background: {
          notification: {
            title: '플릭(Fleek)',
            body: `${name}님이 ${templateName} 운동을 완료했습니다!`
          }
        }
      }
    default:
      return {
        message_background: {
          notification: {
            title: '플릭(Fleek)',
            body: `${name}님이 ${templateName} 운동을 완료했습니다!`
          }
        }
      }
  }
}

// function sessionLike(name, langCode) {
//   switch (langCode.toString()) {
//     case "1":
//       return {
//         message_background: {
//           notification: {
//             title: '플릭(Fleek)',
//             body: `${name}님이 좋아요를 눌렀습니다! 확인해보세요!!`
//           }
//         }
//       }
//     default:
//       return {
//         message_background: {
//           notification: {
//             title: '플릭(Fleek)',
//             body: `${name} has liked your workout!!`
//           }
//         }
//       }
//   }
// }

// function userFollow(name, langCode) {
//   switch (langCode.toString()) {
//     case "1":
//       return {
//         message_background: {
//           notification: {
//             title: '플릭(Fleek)',
//             body: `${name}님이 팔로우하였습니다! 확인해보세요!!`
//           }
//         }
//       }
//     default:
//       return {
//         message_background: {
//           notification: {
//             title: '플릭(Fleek)',
//             body: `${name} has followed you!!`
//           }
//         }
//       }
//   }
// }

module.exports = async (uidResult, messageType, args) => {
  let uidKorean = [], uidEnglish = [];
  let uidKoreanString, uidEnglishString;
  await Promise.all(uidResult.map(async (rowdata) => {
    if (rowdata.lang_code == 0) {
      uidEnglish.push(rowdata.uid);
    } else if (rowdata.lang_code == 1) {
      uidKorean.push(rowdata.uid);
    } else {
      uidEnglish.push(rowdata.uid);
    }
  }));

  uidKoreanString = "('" + uidKorean.join("\',\'") + "')";
  uidEnglishString = "('" + uidEnglish.join("\',\'") + "')";

  const fields1 = 'token_value';
  const queryKorean = `SELECT ${fields1} FROM ${table_fcmToken}
                        WHERE ${table_fcmToken}.userinfo_uid IN ${uidKoreanString}`;
  const queryEnglish = `SELECT ${fields1} FROM ${table_fcmToken}
                        WHERE ${table_fcmToken}.userinfo_uid IN ${uidEnglishString}`;
  let resultKorean = [], resultEnglish = [];
  if (uidKorean.length != 0) resultKorean = await pool.queryParamSlave(queryKorean);
  if (uidEnglish.length != 0) resultEnglish = await pool.queryParamSlave(queryEnglish);

  const tokenListKorean = await Promise.all(resultKorean.map(async data => { return data.token_value; }));
  const tokenListEnglish = await Promise.all(resultEnglish.map(async data => { return data.token_value; }));

  switch (messageType) {
    case "sessionFinish":
      if (tokenListKorean.length != 0) {
        await admin.messaging().sendToDevice(
          tokenListKorean, // ['token_1', 'token_2', ...]
          sessionFinish(args[0], args[1], 1).message_background,
          {
            // Required for background/quit data-only messages on iOS
            contentAvailable: true,
            // Required for background/quit data-only messages on Android
            priority: "high",
          }
        );
      }
      if (tokenListEnglish.length != 0) {
        await admin.messaging().sendToDevice(
          tokenListEnglish, // ['token_1', 'token_2', ...]
          sessionFinish(args[0], args[1], 0).message_background,
          {
            // Required for background/quit data-only messages on iOS
            contentAvailable: true,
            // Required for background/quit data-only messages on Android
            priority: "high",
          }
        );
      }
    // case "sessionLike":
    //   if (tokenListKorean.length != 0) {
    //     await admin.messaging().sendToDevice(
    //       tokenListKorean, // ['token_1', 'token_2', ...]
    //       sessionLike(args[0], 1).message_background,
    //       {
    //         // Required for background/quit data-only messages on iOS
    //         contentAvailable: true,
    //         // Required for background/quit data-only messages on Android
    //         priority: "high",
    //       }
    //     );
    //   }
    //   if (tokenListEnglish.length != 0) {
    //     await admin.messaging().sendToDevice(
    //       tokenListEnglish, // ['token_1', 'token_2', ...]
    //       sessionLike(args[0], 0).message_background,
    //       {
    //         // Required for background/quit data-only messages on iOS
    //         contentAvailable: true,
    //         // Required for background/quit data-only messages on Android
    //         priority: "high",
    //       }
    //     );
    //   }
    // case "userFollow":
    //   if (tokenListKorean.length != 0) {
    //     await admin.messaging().sendToDevice(
    //       tokenListKorean, // ['token_1', 'token_2', ...]
    //       userFollow(args[0], 1).message_background,
    //       {
    //         // Required for background/quit data-only messages on iOS
    //         contentAvailable: true,
    //         // Required for background/quit data-only messages on Android
    //         priority: "high",
    //       }
    //     );
    //   }
    //   if (tokenListEnglish.length != 0) {
    //     await admin.messaging().sendToDevice(
    //       tokenListEnglish, // ['token_1', 'token_2', ...]
    //       userFollow(args[0], 0).message_background,
    //       {
    //         // Required for background/quit data-only messages on iOS
    //         contentAvailable: true,
    //         // Required for background/quit data-only messages on Android
    //         priority: "high",
    //       }
    //     );
    //   }
  }

  // await admin.messaging().sendToDevice(
  //   token_list, // ['token_1', 'token_2', ...]
  //   fcm_message_foreground,
  //   {
  //     // Required for background/quit data-only messages on iOS
  //     contentAvailable: true,
  //     // Required for background/quit data-only messages on Android
  //     priority: "high",
  //   }
  // );
}
