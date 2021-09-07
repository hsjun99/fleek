/*
// 1. 좋아요

{
    "type": "U_1",
    "uid": "kakao:141314314",
    "session_id": 140,
    "created_at": "2021-08-31 01:00:50"
}

// 2. 팕로우

{
    "type": "U_2",
    "uid": "kakao:141314314",
    "created_at": "2021-08-31 01:00:50"
}

// 3. 운동시작

{
    "type": "U_3",
    "uid": "",
    "created_at": "2021-08-31 01:00:50"
}

// 4. 운동완료

{
    "type": "U_4",
    "uid": "",
    "created_at": "2021-08-31 01:00:50"
}

// 5. 운동 스크랩

{
    "type": "U_5",
    "uid": "",
    "template_id": 12,
    "created_at": "2021-08-31 01:00:50"
}

// 6. 공지/업데이트

{
    "type": "A_1",
    "title": "",
    "content": "",
    "created_at": ""
}

// 7. 개인 메시지

{
    "type": "A_2",
    "title": "",
    "content": "",
    "created_at": ""
}

*/

const timeFunction = require('./function/timeFunction');

module.exports = {
    session_like: async(uid, session_id) => {
        return {
            type: "U_1",
            uid: uid,
            session_id: session_id,
            created_at: await timeFunction.currentTime()
        }
    },
    followed: async(uid) => {
        return {
            type: "U_2",
            uid: uid,
            created_at: await timeFunction.currentTime()
        }
    },
    session_start: async(uid) => {
        return {
            type: "U_3",
            uid: uid,
            created_at: await timeFunction.currentTime()
        }
    },
    session_finish: async(uid) => {
        return {
            type: "U_4",
            uid: uid,
            created_at: await timeFunction.currentTime()
        }
    },
    template_import: async(uid, template_id) => {
        return {
            type: "U_5",
            uid: uid,
            template_id: template_id,
            created_at: await timeFunction.currentTime()
        }
    }
}