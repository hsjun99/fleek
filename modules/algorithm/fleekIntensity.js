module.exports = (langCode) => {
    switch (langCode.toString()) {
        case "1":
            return [
                {
                    algorithm_id: 0,
                    algorithm_name: "이전기록",
                    algorithm_content: "이전기록의 세트 수, 무게, 횟수를 바탕으로 세트를 구성하였습니다.\n이전 기록의 강도는 3 입니다.",
                },
                /*
                {
                    algorithm_id: 1,
                    algorithm_name: "nSuns",
                    algorithm_content: "content content content",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.9*0.50, 0.9*0.60, 0.9*0.70, 0.9*0.70, 0.9*0.70, 0.9*0.70, 0.9*0.70, 0.9*0.70],
                            reps: [10, 9, 8, 8, 7, 7, 6, 6]
                        },
                        // 1
                        {
                            weights: [0.9*0.65, 0.9*0.75, 0.9*0.85, 0.9*0.85, 0.9*0.85, 0.9*0.80, 0.9*0.75, 0.9*0.70, 0.9*0.65],
                            reps: [8, 6, 4, 4, 4, 5, 6, 7, 8]
                        },
                        // 2
                        {
                            weights: [0.9*0.75, 0.9*0.85, 0.9*0.95, 0.9*0.90, 0.9*0.85, 0.9*0.80, 0.9*0.75, 0.9*0.70, 0.9*0.65],
                            reps: [5, 3, 1, 3, 3, 3, 5, 5, 5]
                        },
                        // 3
                        {
                            weights: [0.9*0.75, 0.9*0.85, 0.9*0.95, 0.9*0.90, 0.9*0.85, 0.9*0.80, 0.9*0.75, 0.9*0.70, 0.9*0.65],
                            reps: [5, 3, 1, 3, 3, 3, 5, 5, 5]
                        },
                        // 4
                        {
                            weights: [0.9*0.75, 0.9*0.85, 0.9*0.95, 0.9*0.90, 0.9*0.85, 0.9*0.80, 0.9*0.75, 0.9*0.70, 0.9*0.65],
                            reps: [5, 3, 1, 3, 3, 3, 5, 5, 5]
                        },
                    ]
                },
                */
                {
                    algorithm_id: 1,
                    algorithm_name: "5 x 5",
                    algorithm_content: "전통적 스트렝스 트레이닝 중 하나인 5 세트 5 반복 입니다.\n강도 1 부터 늘려나가는 것을 추천드립니다.",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.65, 0.65, 0.65, 0.65, 0.65],
                            reps: [5, 5, 5, 5, 5]
                        },
                        // 1
                        {
                            weights: [0.7, 0.7, 0.7, 0.7, 0.7],
                            reps: [5, 5, 5, 5, 5]
                        },
                        // 2
                        {
                            weights: [0.75, 0.75, 0.75, 0.75, 0.75],
                            reps: [5, 5, 5, 5, 5]
                        },
                        // 3
                        {
                            weights: [0.8, 0.8, 0.8, 0.8, 0.8],
                            reps: [5, 5, 5, 5, 5]
                        },
                        // 4
                        {
                            weights: [0.85, 0.85, 0.85, 0.85, 0.85],
                            reps: [5, 5, 5, 5, 5]
                        }
                    ]
                },
                {
                    algorithm_id: 2,
                    algorithm_name: "5/3/1",
                    algorithm_content: "유명한 스트렝스 트레이닝 프로그램인 짐 웬들러의 5/3/1 입니다.\n첫 3세트는 워밍업, 그 다음 3세트로 1RM 갱신에 도전하세요.",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.4, 0.47, 0.55, 0.65, 0.75, 0.85],
                            reps: [5, 5, 5, 5, 3, 1]
                        },
                        // 1
                        {
                            weights: [0.4, 0.47, 0.55, 0.675, 0.775, 0.875],
                            reps: [5, 5, 5, 5, 3, 1]
                        },
                        // 2
                        {
                            weights: [0.4, 0.47, 0.55, 0.7, 0.8, 0.9],
                            reps: [5, 5, 5, 5, 3, 1]
                        },
                        // 3
                        {
                            weights: [0.4, 0.47, 0.55, 0.75, 0.85, 0.95],
                            reps: [5, 5, 5, 5, 3, 1]
                        },
                        // 4
                        {
                            weights: [0.4, 0.47, 0.55, 0.8, 0.9, 1],
                            reps: [5, 5, 5, 5, 3, 1]
                        }
                    ]
                },
                {
                    algorithm_id: 3,
                    algorithm_name: "8/6/3",
                    algorithm_content: "유명 스트렝스 프로그램, 짐 웬들러 5/3/1 를 파워빌딩으로 개조한 8/6/3 입니다.\n첫 3세트는 워밍업, 그 다음 3세트로 스트렝스 증가와 근육 성장을 동시에 이룰 수 있습니다.",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.40, 0.50, 0.60, 0.65, 0.75, 0.80],
                            reps: [10, 6, 3, 8, 6, 3]
                        },
                        // 1
                        {
                            weights: [0.40, 0.50, 0.60, 0.675, 0.775, 0.825],
                            reps: [10, 6, 3, 8, 6, 3]
                        },
                        // 2
                        {
                            weights: [0.40, 0.50, 0.60, 0.7, 0.8, 0.85],
                            reps: [10, 6, 3, 8, 6, 3]
                        },
                        // 3
                        {
                            weights: [0.40, 0.50, 0.60, 0.75, 0.85, 0.90],
                            reps: [10, 6, 3, 8, 6, 3]
                        },
                        // 4
                        {
                            weights: [0.40, 0.50, 0.60, 0.80, 0.90, 0.95],
                            reps: [10, 6, 3, 8, 6, 3]
                        }
                    ]
                },
                {
                    algorithm_id: 4,
                    algorithm_name: "GVT",
                    algorithm_content: "막대한 볼륨으로 근육을 성장시키는 저먼 볼륨 트레이닝입니다.\n60~90초의 쉬는 시간으로 짧은 시간 내, 최대한 많은 볼륨을 수행하는 트레이닝 방법입니다.",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        },
                        // 1
                        {
                            weights: [0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        },
                        // 2
                        {
                            weights: [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        },
                        // 3
                        {
                            weights: [0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        },
                        // 4
                        {
                            weights: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        }
                    ]
                },
            ]
        default:
            return [
                {
                    algorithm_id: 0,
                    algorithm_name: "Previous",
                    algorithm_content: "It is based on the number of sets, reps, and weight of your previous record.",
                },
                /*
                {
                    algorithm_id: 1,
                    algorithm_name: "nSuns",
                    algorithm_content: "content content content",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.9*0.50, 0.9*0.60, 0.9*0.70, 0.9*0.70, 0.9*0.70, 0.9*0.70, 0.9*0.70, 0.9*0.70],
                            reps: [10, 9, 8, 8, 7, 7, 6, 6]
                        },
                        // 1
                        {
                            weights: [0.9*0.65, 0.9*0.75, 0.9*0.85, 0.9*0.85, 0.9*0.85, 0.9*0.80, 0.9*0.75, 0.9*0.70, 0.9*0.65],
                            reps: [8, 6, 4, 4, 4, 5, 6, 7, 8]
                        },
                        // 2
                        {
                            weights: [0.9*0.75, 0.9*0.85, 0.9*0.95, 0.9*0.90, 0.9*0.85, 0.9*0.80, 0.9*0.75, 0.9*0.70, 0.9*0.65],
                            reps: [5, 3, 1, 3, 3, 3, 5, 5, 5]
                        },
                        // 3
                        {
                            weights: [0.9*0.75, 0.9*0.85, 0.9*0.95, 0.9*0.90, 0.9*0.85, 0.9*0.80, 0.9*0.75, 0.9*0.70, 0.9*0.65],
                            reps: [5, 3, 1, 3, 3, 3, 5, 5, 5]
                        },
                        // 4
                        {
                            weights: [0.9*0.75, 0.9*0.85, 0.9*0.95, 0.9*0.90, 0.9*0.85, 0.9*0.80, 0.9*0.75, 0.9*0.70, 0.9*0.65],
                            reps: [5, 3, 1, 3, 3, 3, 5, 5, 5]
                        },
                    ]
                },
                */
                {
                    algorithm_id: 1,
                    algorithm_name: "5 x 5",
                    algorithm_content: "A 5×5 workout comprises compound barbell movements — like squats and deadlifts — using heavy weights and lower repetitions per set.",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.65, 0.65, 0.65, 0.65, 0.65],
                            reps: [5, 5, 5, 5, 5]
                        },
                        // 1
                        {
                            weights: [0.7, 0.7, 0.7, 0.7, 0.7],
                            reps: [5, 5, 5, 5, 5]
                        },
                        // 2
                        {
                            weights: [0.75, 0.75, 0.75, 0.75, 0.75],
                            reps: [5, 5, 5, 5, 5]
                        },
                        // 3
                        {
                            weights: [0.8, 0.8, 0.8, 0.8, 0.8],
                            reps: [5, 5, 5, 5, 5]
                        },
                        // 4
                        {
                            weights: [0.85, 0.85, 0.85, 0.85, 0.85],
                            reps: [5, 5, 5, 5, 5]
                        }
                    ]
                },
                {
                    algorithm_id: 2,
                    algorithm_name: "5/3/1",
                    algorithm_content: "The 5/3/1 workout is a powerlifting program designed by powerlifter Jim Wendler. The first three sets are warm-ups. Try to achieve a new 1RM on the following three sets.",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.4, 0.47, 0.55, 0.65, 0.75, 0.85],
                            reps: [5, 5, 5, 5, 3, 1]
                        },
                        // 1
                        {
                            weights: [0.4, 0.47, 0.55, 0.675, 0.775, 0.875],
                            reps: [5, 5, 5, 5, 3, 1]
                        },
                        // 2
                        {
                            weights: [0.4, 0.47, 0.55, 0.7, 0.8, 0.9],
                            reps: [5, 5, 5, 5, 3, 1]
                        },
                        // 3
                        {
                            weights: [0.4, 0.47, 0.55, 0.75, 0.85, 0.95],
                            reps: [5, 5, 5, 5, 3, 1]
                        },
                        // 4
                        {
                            weights: [0.4, 0.47, 0.55, 0.8, 0.9, 1],
                            reps: [5, 5, 5, 5, 3, 1]
                        }
                    ]
                },
                {
                    algorithm_id: 3,
                    algorithm_name: "8/6/3",
                    algorithm_content: "8/6/3 workout is a well known strength program, which is based on Jim Wendler's 5/3/1 workout.",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.40, 0.50, 0.60, 0.65, 0.75, 0.80],
                            reps: [10, 6, 3, 8, 6, 3]
                        },
                        // 1
                        {
                            weights: [0.40, 0.50, 0.60, 0.675, 0.775, 0.825],
                            reps: [10, 6, 3, 8, 6, 3]
                        },
                        // 2
                        {
                            weights: [0.40, 0.50, 0.60, 0.7, 0.8, 0.85],
                            reps: [10, 6, 3, 8, 6, 3]
                        },
                        // 3
                        {
                            weights: [0.40, 0.50, 0.60, 0.75, 0.85, 0.90],
                            reps: [10, 6, 3, 8, 6, 3]
                        },
                        // 4
                        {
                            weights: [0.40, 0.50, 0.60, 0.80, 0.90, 0.95],
                            reps: [10, 6, 3, 8, 6, 3]
                        }
                    ]
                },
                {
                    algorithm_id: 4,
                    algorithm_name: "GVT",
                    algorithm_content: "German volume training (GVT) is an intense exercise program that builds the muscle mass and strength necessary for weightlifters to move beyond personal plateaus. It involves high numbers of sets and repetitions with short resting periods in between.",
                    algorithm_detail: [
                        // 0
                        {
                            weights: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        },
                        // 1
                        {
                            weights: [0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55, 0.55],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        },
                        // 2
                        {
                            weights: [0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        },
                        // 3
                        {
                            weights: [0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        },
                        // 4
                        {
                            weights: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7],
                            reps: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
                        }
                    ]
                },
            ]
    }

}