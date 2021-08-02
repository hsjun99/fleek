//const { getEachUsersRecords } = require("../../controllers/workoutsController");

module.exports = {
    getWorkout: (id, video_url, english, korean, category, muscle_p, muscle_s, equipment, record_type, rest_time, inclination, intercept, recent_records, workout_ability, plan, detail_plan) => {
        return {
            basic_info: {
                workout_id: Number(id),
                video_url: video_url,
                english: english,
                korean: korean,
                category: category,
                muscle_primary: muscle_p,
                muscle_secondary: muscle_s,
                equipment: equipment,
                record_type: record_type
            },
            rest_time: rest_time,
            equation: {inclination: inclination, intercept: intercept},
            recent_records: recent_records,
            workout_ability: workout_ability,
            plan: plan,
            detail_plan: detail_plan
        };
    },
    getOthersRecords: (users_records, follows_records) => {
        return {
            users_records: users_records,
            friends_records: follows_records
        };
    }
}