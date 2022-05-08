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
<<<<<<< HEAD
        connectionLimit: 8,
        charset: "utf8mb4",
=======
        connectionLimit: 2,
        charset: "utf8mb4"
>>>>>>> 2e9fec5cb58af04c5b71699f4785d5f9481d03c6
      };
      resolve(mysql.createPool(configDB));
    });
  });
};

const DB_slave = async () => {
  return new Promise(async (resolve, reject) => {
    await ssmPromise.then(configAWS => {
      const configDB = {
        host: configAWS.host_slave, // process.env.REGION == 'TOKYO' ? configAWS.host_slave : configAWS.host_slave_US,
        port: configAWS.port_slave,
        user: configAWS.user_slave,
        password: configAWS.password_slave,
<<<<<<< HEAD
        connectionLimit: 8,
        database: configAWS.database_slave,
=======
        connectionLimit: 2,
        database: configAWS.database_slave
>>>>>>> 2e9fec5cb58af04c5b71699f4785d5f9481d03c6
      };
      resolve(mysql.createPool(configDB));
    });
  });
};

module.exports = { DB_master, DB_slave };
