module.exports = {
    success: (status, message, data) => {
        return {
            status: status,
            success: true,
            message: message,
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