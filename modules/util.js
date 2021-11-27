const timeFunction = require('./function/timeFunction');
module.exports = {
    success: (status, message, data, currentTime) => {
        return {
            status: status,
            success: true,
            message: message,
            update_time: currentTime,
            data: data
        }
    },
    fail: (status, message, data) => {
        return {
            status: status,
            success: false,
            message: message,
            data: data
        }
    }
};