const requestIp = require('request-ip');
const geoIp = require('geoip-lite');
const User = require('../models/fleekUser');
// const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz')

const ipTimezone = {
    extractTimezone: async(req, res, next) => {
        const clientIp = requestIp.getClientIp(req);
        const geo = geoIp.lookup(clientIp);
        const timezone = geo.timezone;
        User.updateUserTimeZone(req.uid, timezone);
        // console.log(utcToZonedTime('2018-09-01T16:01:36.386Z', geo.timezone))
        next();
    }
}

module.exports = ipTimezone;