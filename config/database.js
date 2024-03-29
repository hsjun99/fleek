//const { config } = require("aws-sdk");
const mysql = require("promise-mysql");
const ssmPromise = require("../modules/auth/awsparamStore.js");
const dotenv = require("dotenv");
dotenv.config();

const DB_master = async () => {
  return new Promise(async (resolve, reject) => {
    await ssmPromise.then(configAWS => {
      const configDB = {
        host: configAWS.host_master,
        port: configAWS.port_master,
        user: configAWS.user_master,
        password: configAWS.password_master,
        database: configAWS.database_master,
        connectionLimit: 10,
        charset: "utf8mb4"
      };
      resolve(mysql.createPool(configDB));
    });
  });
};

const DB_slave = async () => {
  return new Promise(async (resolve, reject) => {
    await ssmPromise.then(configAWS => {
      const configDB = {
        host: configAWS.host_slave,
        port: configAWS.port_slave,
        user: configAWS.user_slave,
        password: configAWS.password_slave,
        connectionLimit: 20,
        database: configAWS.database_slave
      };
      resolve(mysql.createPool(configDB));
    });
  });
};

module.exports = { DB_master, DB_slave };
