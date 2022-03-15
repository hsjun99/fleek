const onesignalClient = require('../../config/onesignal');

let client;

(async () => {
    client = await onesignalClient();
})();

module.exports = {
    registerNotification: async (uid, set_time) => {
        const notification = {
            included_segments: ['Subscribed Users'],
            headings: {
                "ko": "운동할 시간입니다🔥",
                "en": "Time to Workout🔥",
            },
            contents: {
                "ko": "플릭과 함께 오늘의 운동을 시작해요~!",
                "en": "Let's start today's workout with Fleek",
            },
            filters: [
                { field: 'tag', key: 'user_uid', relation: '=', value: uid }
            ],
            send_after: set_time, //(new Date((new Date()).getTime() + 86400000)).toString(),
            priority: 10
        };

        try {
            const response = await client.createNotification(notification);
            return response.body.id;
        } catch (e) {
            console.log(e.statusCode);
            console.log(e.body);
            return;
        }
    },
    adminNotification: async () => {
        const notification = {
            included_segments: ['Subscribed Users'],
            headings: {
                "ko": "맞춤 루틴 요청이 도착했어요💪",
                "en": "맞춤 루틴 요청이 도착했어요💪",
            },
            contents: {
                "ko": "대시보드를 확인해주세요!",
                "en": "대시보드를 확인해주세요!",
            },
            filters: [
                { field: 'tag', key: 'user_uid', relation: '=', value: 'S27Sma9UBkSTgN6mSXXhPm31CG52' },
                { operator: "OR" }, { field: 'tag', key: 'user_uid', relation: '=', value: 'C1YfpVlKKDWwzZqAhnoR55UlZO62' },
            ],
            priority: 10
        };

        try {
            const response = await client.createNotification(notification);
            return response.body.id;
        } catch (e) {
            console.log(e.statusCode);
            console.log(e.body);
            return;
        }
    },
    cancelNotification: async (notification_id) => {
        const response = await client.cancelNotification(notification_id);
        return response;
    }
}
