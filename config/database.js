//const { config } = require("aws-sdk");
const mysql = require("promise-mysql");
const ssmPromise = require("../modules/auth/awsparamStore.js");
const dotenv = require("dotenv");

dotenv.config();

const DB_master = async () => {
  return new Promise(async (resolve, reject) => {
    await ssmPromise.then((configAWS) => {
<<<<<<< HEAD
      console.log(process.env.REGION);
=======
>>>>>>> 5a40e2267c923758bfc7fec4cb1e8f4fba09a24c
      const configDB = {
        host: configAWS.host_master,
        port: configAWS.port_master,
        user: configAWS.user_master,
        password: configAWS.password_master,
        database: configAWS.database_master,
<<<<<<< HEAD
        connectionLimit: 5,
=======
        connectionLimit: 8,
>>>>>>> 5a40e2267c923758bfc7fec4cb1e8f4fba09a24c
        charset: "utf8mb4",
      };
      resolve(mysql.createPool(configDB));
    });
  });
};

const DB_slave = async () => {
  return new Promise(async (resolve, reject) => {
    await ssmPromise.then((configAWS) => {
      const configDB = {
        host: configAWS.host_slave, // process.env.REGION == 'TOKYO' ? configAWS.host_slave : configAWS.host_slave_US,
        port: configAWS.port_slave,
        user: configAWS.user_slave,
        password: configAWS.password_slave,
<<<<<<< HEAD
        database: configAWS.database_slave,
        connectionLimit: 5,
=======
        connectionLimit: 8,
        database: configAWS.database_slave,
>>>>>>> 5a40e2267c923758bfc7fec4cb1e8f4fba09a24c
      };
      resolve(mysql.createPool(configDB));
    });
  });
};

module.exports = { DB_master, DB_slave };
