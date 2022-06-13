const dotenv = require("dotenv");
const axios = require("axios");

const checkPro = {
  checkSubscription: async (req, res, next) => {
    const options = {
      method: "get",
      url: `https://api.revenuecat.com/v1/subscribers/${req.uid}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REVENUECAT_API_KEY}`,
        Accept: "application/json"
      }
    };
    const revPromise = new Promise((resolve, reject) => {
      axios(options)
        .then(res => {
          if (res.data.subscriber.entitlements.pro != undefined) req.ispro = true;
          else req.ispro = false;
          resolve();
        })
        .catch(err => {
          req.ispro = false;
          resolve();
        });
    });
    await Promise.all([revPromise]);
    next();
  }
};

module.exports = checkPro;
