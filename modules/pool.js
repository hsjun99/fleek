//const poolPromise = require('../config/database');
const {DB_master, DB_slave} = require('../config/database');
const poolPromise_master = DB_master();
const poolPromise_slave = DB_slave();

module.exports = { 
    queryParamMaster: async (query) => {
        return new Promise ( async (resolve, reject) => {
            try {
                const pool = await poolPromise_master;
                const connection = await pool.getConnection();
                try {
                    const result = await connection.query(query);
                    pool.releaseConnection(connection);
                    resolve(result);
                } catch (err) {
                    pool.releaseConnection(connection);
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    queryParamSlave: async (query) => {
        return new Promise ( async (resolve, reject) => {
            try {
                const pool = await poolPromise_slave;
                const connection = await pool.getConnection();
                try {
                    const result = await connection.query(query);
                    pool.releaseConnection(connection);
                    resolve(result);
                } catch (err) {
                    pool.releaseConnection(connection);
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    queryParamArrMaster: async (query, value) => {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise_master;
                const connection = await pool.getConnection();
                try {
                    const result = await connection.query(query, value);
                    pool.releaseConnection(connection);
                    resolve(result);
                } catch (err) {
                    pool.releaseConnection(connection);
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    queryParamArrSlave: async (query, value) => {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise_slave;
                const connection = await pool.getConnection();
                try {
                    const result = await connection.query(query, value);
                    pool.releaseConnection(connection);
                    resolve(result);
                } catch (err) {
                    pool.releaseConnection(connection);
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    },
    Transaction: async (...args) => {
        return new Promise(async (resolve, reject) => {
            try {
                const pool = await poolPromise_master;
                const connection = await pool.getConnection();
                try {
                    await connection.beginTransaction();
                    args.forEach(async (it) => await it(connection));
                    await connection.commit();
                    pool.releaseConnection(connection);
                    resolve(result);
                } catch (err) {
                    await connection.rollback()
                    pool.releaseConnection(connection);
                    reject(err);
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}