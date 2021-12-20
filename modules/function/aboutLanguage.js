module.exports = {
    langCodeToString: async (langCode) => {
        switch (langCode.toString()) {
            case "0":
                return 'english';
            case "1":
                return 'korean';
            default:
                return 'english';
        }
    },
    rowdataDefaultTemplate: async (langCode, rowdata) => {
        switch (langCode.toString()) {
            case "0":
                rowdata.name = rowdata.english;
                rowdata.sub_name = rowdata.sub_english;
                return rowdata;
            case "1":
                rowdata.name = rowdata.korean;
                rowdata.sub_name = rowdata.sub_korean;
                return rowdata;
            default:
                rowdata.name = rowdata.english;
                rowdata.sub_name = rowdata.sub_english;
                return rowdata;
        }
    },
    rowdataWorkoutTable: async (langCode, rowdata) => {
        switch (langCode.toString()) {
            case "0":
                rowdata.name = rowdata.english;
                return rowdata;
            case "1":
                rowdata.name = rowdata.korean;
                return rowdata;
            default:
                rowdata.name = rowdata.english;
                return rowdata;
        }
    },
    rowdataFaq: async (langCode, rowdata) => {
        switch (langCode.toString()) {
            case "0":
                rowdata.title = rowdata.title_english;
                rowdata.content = rowdata.content_english;
                return rowdata;
            case "1":
                rowdata.title = rowdata.title_korean;
                rowdata.content = rowdata.content_korean;
                return rowdata;
            default:
                rowdata.title = rowdata.title_english;
                rowdata.content = rowdata.content_english;
                return rowdata;
        }
    },
    workoutNameTemplateWear: async (langCode, result) => {
        switch (langCode.toString()) {
            case "0":
                if (result.english.indexOf('(') == -1) {
                    return result.english;
                } else {
                    return result.english.substring(0, result.english.indexOf('('));
                }
            case "1":
                if (result.english.indexOf('(') == -1) {
                    return result.korean;
                } else {
                    return result.korean.substring(0, result.korean.indexOf('('));
                }
            default:
                if (result.english.indexOf('(') == -1) {
                    return result.english;
                } else {
                    return result.english.substring(0, result.english.indexOf('('));
                }
        }
    }
}