let User = require("../../models/fleekUser");

module.exports = async (uid) => {
    const settingResult = await User.getSetting(uid);
    let is_kilogram, is_meter;
    if (settingResult != null || settingResult != undefined){
        is_kilogram = settingResult.is_kilogram;
        is_meter = settingResult.is_meter;
    } else {
        is_kilogram = 1;
        is_meter = 1;
    }
    if (is_kilogram == null || is_kilogram == undefined) is_kilogram = 1;
    if (is_meter == null || is_meter == undefined) is_meter = 1;
    return {
        is_kilogram: is_kilogram,
        is_meter: is_meter
    }
}