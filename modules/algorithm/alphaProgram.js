
{
   workouts_by_tier_default: [
      [200, 29, 171, 185, 81, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
}


module.exports = {
   "5x5": (workoutsByTier) => {
      const T1_1 = workoutsByTier[0][0],
            T1_2 = workoutsByTier[0][1],
            T1_3 = workoutsByTier[0][2],
            T1_4 = workoutsByTier[0][3],
            T1_5 = workoutsByTier[0][4];
      return [
         [//0
         ],
         [//1
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [0, 0, 0, 0, 0],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_2}`,
               workout_tier_index: [1, 2],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [0, 0, 0, 0, 0],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_3}`,
               workout_tier_index: [1, 3],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [0, 0, 0, 0, 0],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//2
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [1, 1, 1, 1, 1],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_4}`,
               workout_tier_index: [1, 4],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [0, 0, 0, 0, 0],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_5}`,
               workout_tier_index: [1, 5],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [0, 0, 0, 0, 0],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//3
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [2, 2, 2, 2, 2],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_2}`,
               workout_tier_index: [1, 2],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [1, 1, 1, 1, 1],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_3}`,
               workout_tier_index: [1, 3],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [1, 1, 1, 1, 1],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//4
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [3, 3, 3, 3, 3],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_4}`,
               workout_tier_index: [1, 4],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [1, 1, 1, 1, 1],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_5}`,
               workout_tier_index: [1, 5],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [1, 1, 1, 1, 1],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//5
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [4, 4, 4, 4, 4],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_2}`,
               workout_tier_index: [1, 2],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [2, 2, 2, 2, 2],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_3}`,
               workout_tier_index: [1, 3],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [2, 2, 2, 2, 2],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//6
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [5, 5, 5, 5, 5],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_4}`,
               workout_tier_index: [1, 4],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [2, 2, 2, 2, 2],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_5}`,
               workout_tier_index: [1, 5],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [2, 2, 2, 2, 2],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//7
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [6, 6, 6, 6, 6],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_2}`,
               workout_tier_index: [1, 2],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [3, 3, 3, 3, 3],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_3}`,
               workout_tier_index: [1, 3],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [3, 3, 3, 3, 3],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//8
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [7, 7, 7, 7, 7],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_4}`,
               workout_tier_index: [1, 4],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [3, 3, 3, 3, 3],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_5}`,
               workout_tier_index: [1, 5],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [3, 3, 3, 3, 3],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//9
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [8, 8, 8, 8, 8],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_2}`,
               workout_tier_index: [1, 2],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [4, 4, 4, 4, 4],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_3}`,
               workout_tier_index: [1, 3],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [4, 4, 4, 4, 4],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//10
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [9, 9, 9, 9, 9],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_4}`,
               workout_tier_index: [1, 4],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [4, 4, 4, 4, 4],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_5}`,
               workout_tier_index: [1, 5],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [4, 4, 4, 4, 4],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [//11
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [10, 10, 10, 10, 10, 10],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_2}`,
               workout_tier_index: [1, 2],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [5, 5, 5, 5, 5],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_3}`,
               workout_tier_index: [1, 3],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [5, 5, 5, 5, 5],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ],
         [
            {
               workout_id: `${T1_1}`,
               workout_tier_index: [1, 1],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [11, 11, 11, 11, 11],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_4}`,
               workout_tier_index: [1, 4],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [5, 5, 5, 5, 5],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            },
            {
               workout_id: `${T1_5}`,
               workout_tier_index: [1, 5],
               load: [0.75, 0.75, 0.75, 0.75, 0.75],
               minStepConstant: [5, 5, 5, 5, 5],
               reps: [5, 5, 5, 5, 5],
               restTime: [180, 180, 180, 180, 180]
            }
         ]
      ]
   }
}