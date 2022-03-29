module.exports = {
    translation: async (langCode) => {
        const english = {
            "init_routine_beg_1": "Beginner Full Body Routine",
            "init_routine_beg_2": "At-home Fat Burning Routine",
            // "init_routine_beg_3": "At-home Fat Burning Routine #2",
            "init_routine_beg_4": "Bodyweight Strength Training"
        }
        const korean = {
            "init_routine_beg_1": "헬스 초보 무분할 루틴",
            "init_routine_beg_2": "체지방 감량 홈트",
            // "init_routine_beg_3": "체지방 감량 홈트 2",
            "init_routine_beg_4": "전신 근력 강화 홈트"
        }
        switch (langCode.toString()) {
            case "0":
                return english;
            case "1":
                return korean;
            default:
                return english;
        }
    }
}