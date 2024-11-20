const mysql = require("mysql");
const dbConfig = require("./db_config.json");

const pool = mysql.createPool(dbConfig);

function getConnection(callback) {
    pool.getConnection(function(err, connection) {
        console.log(JSON.stringify(err))
        if (!err) {
            callback(connection);
        } else {
            console.log(`db error: ${err.message}`)
        }
    })
}

module.exports = getConnection;