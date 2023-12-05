const { Pool} = require('pg');

const pool = new Pool({
    host:'viaduct.proxy.rlwy.net',
    port: 19378,
    user: 'postgres',
    password: 'D4dA6bEFCb**GcDEDeFACbbgDdE5f31d',
    database: 'railway'
});

module.exports = pool;
