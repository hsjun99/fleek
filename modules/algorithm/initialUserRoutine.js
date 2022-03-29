const globalization = require('../function/globalization');
const getUserWorkoutWeight = require('../functionFleek/getUserWorkoutWeight');

module.exports = {
    initRoutines: async (langCode, sex = 0, ageGroup = 2, weightGroup = 70, percentage = 60) => {
        return [
            {
                "name": (await globalization.translation(langCode)).init_routine_beg_1,
                "detail": [
                    {
                        "workout_id": 57,
                        "super_set_label": 0,
                        "rest_time": 40,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(5).fill({
                            "reps": 10,
                            "weight": await getUserWorkoutWeight(57, sex, ageGroup, weightGroup, percentage),
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 200,
                        "super_set_label": 0,
                        "rest_time": 40,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(5).fill({
                            "reps": 10,
                            "weight": await getUserWorkoutWeight(200, sex, ageGroup, weightGroup, percentage),
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 109,
                        "super_set_label": 0,
                        "rest_time": 40,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(5).fill({
                            "reps": 10,
                            "weight": await getUserWorkoutWeight(109, sex, ageGroup, weightGroup, percentage),
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 185,
                        "super_set_label": 0,
                        "rest_time": 40,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(5).fill({
                            "reps": 10,
                            "weight": await getUserWorkoutWeight(185, sex, ageGroup, weightGroup, percentage),
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 230,
                        "super_set_label": 0,
                        "rest_time": 40,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(5).fill({
                            "reps": 10,
                            "weight": await getUserWorkoutWeight(230, sex, ageGroup, weightGroup, percentage),
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 43,
                        "super_set_label": 0,
                        "rest_time": 40,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(5).fill({
                            "reps": 10,
                            "weight": await getUserWorkoutWeight(43, sex, ageGroup, weightGroup, percentage),
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    }
                ]
            },
            {
                "name": (await globalization.translation(langCode)).init_routine_beg_2,
                "detail": [
                    {
                        "workout_id": 105,
                        "super_set_label": 6,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 142,
                        "super_set_label": 0,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 72,
                        "super_set_label": 4,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 23,
                        "super_set_label": 0,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 163,
                        "super_set_label": 0,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    }
                ]
            },
            // {
            //     "name": (await globalization.translation(langCode)).init_routine_beg_3,
            //     "detail": [
            //         {
            //             "workout_id": 73,
            //             "super_set_label": 5,
            //             "rest_time": 20,
            //             "is_kilogram": 1,
            //             "is_meter": 1,
            //             "workout_detail": Array(3).fill({
            //                 "reps": 10,
            //                 "weight": 0,
            //                 "duration": 0,
            //                 "distance": 0,
            //                 "set_type": 0,
            //                 "rpe": null
            //             })
            //         },
            //         {
            //             "workout_id": 122,
            //             "super_set_label": 5,
            //             "rest_time": 20,
            //             "is_kilogram": 1,
            //             "is_meter": 1,
            //             "workout_detail": Array(3).fill({
            //                 "reps": 0,
            //                 "weight": 0,
            //                 "duration": 60,
            //                 "distance": 0,
            //                 "set_type": 0,
            //                 "rpe": null
            //             })
            //         },
            //         {
            //             "workout_id": 162,
            //             "super_set_label": 0,
            //             "rest_time": 20,
            //             "is_kilogram": 1,
            //             "is_meter": 1,
            //             "workout_detail": Array(3).fill({
            //                 "reps": 10,
            //                 "weight": 0,
            //                 "duration": 0,
            //                 "distance": 0,
            //                 "set_type": 0,
            //                 "rpe": null
            //             })
            //         },
            //         {
            //             "workout_id": 142,
            //             "super_set_label": 0,
            //             "rest_time": 20,
            //             "is_kilogram": 1,
            //             "is_meter": 1,
            //             "workout_detail": Array(3).fill({
            //                 "reps": 10,
            //                 "weight": 0,
            //                 "duration": 0,
            //                 "distance": 0,
            //                 "set_type": 0,
            //                 "rpe": null
            //             })
            //         },
            //         {
            //             "workout_id": 121,
            //             "super_set_label": 6,
            //             "rest_time": 20,
            //             "is_kilogram": 1,
            //             "is_meter": 1,
            //             "workout_detail": Array(3).fill({
            //                 "reps": 10,
            //                 "weight": 0,
            //                 "duration": 0,
            //                 "distance": 0,
            //                 "set_type": 0,
            //                 "rpe": null
            //             })
            //         },
            //         {
            //             "workout_id": 208,
            //             "super_set_label": 0,
            //             "rest_time": 20,
            //             "is_kilogram": 1,
            //             "is_meter": 1,
            //             "workout_detail": Array(3).fill({
            //                 "reps": 10,
            //                 "weight": 0,
            //                 "duration": 0,
            //                 "distance": 0,
            //                 "set_type": 0,
            //                 "rpe": null
            //             })
            //         }
            //     ]
            // },
            {
                "name": (await globalization.translation(langCode)).init_routine_beg_4,
                "detail": [
                    {
                        "workout_id": 208,
                        "super_set_label": 0,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 144,
                        "super_set_label": 0,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 136,
                        "super_set_label": 0,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 9,
                        "super_set_label": 0,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    },
                    {
                        "workout_id": 120,
                        "super_set_label": 0,
                        "rest_time": 20,
                        "is_kilogram": 1,
                        "is_meter": 1,
                        "workout_detail": Array(3).fill({
                            "reps": 10,
                            "weight": 0,
                            "duration": 0,
                            "distance": 0,
                            "set_type": 0,
                            "rpe": null
                        })
                    }
                ]
            },
        ];
    }
}