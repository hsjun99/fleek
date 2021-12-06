const moment = require('moment');
var momentDurationFormatSetup = require("moment-duration-format");

module.exports = {
    currentTime: async() => {
        const now = moment();
        // const currenttime = await now.format("YYYY-MM-DD HH:mm:ss");
        const currenttime = await now.toISOString();
        console.log(currenttime)
        return currenttime;
    },
    timeDiff_DHM: async(time) => {
        const now = moment();
        const currenttime = await now.format("YYYY-MM-DD HH:mm:ss");
        const timeDiffArr = await moment.duration(moment(currenttime,"YYYY-MM-DD HH:mm:ss").diff(moment(time,"YYYY-MM-DD HH:mm:ss"))).format("d,h,m").split(',');
        await timeDiffArr.forEach((part, index, theArray)=>{theArray[index]=Number(part)});
        if (timeDiffArr.length==1) timeDiffArr.unshift(0, 0);
        else if (timeDiffArr.length==2) timeDiffArr.unshift(0);
        return timeDiffArr;
    },
    timeTrim_YMD: async(time) => {
        const trimmedDate = await moment().format(moment.HTML5_FMT.DATE);
        return trimmedDate;
    }
}