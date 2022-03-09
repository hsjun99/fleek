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
                "ko": "🔥플릭🔥",
                "en": "🔥Fleek🔥",
            },
            contents: {
                "ko": "운동할 시간입니다!!",
                "en": "It's time to exercise!!",
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
    cancelNotification: async (notification_id) => {
        const response = await client.cancelNotification(notification_id);
        return response;
    }
}
