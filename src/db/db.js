const mysql = require("mysql2");
const dbConfig = require("./db_config.json");
const {query} = require("express");

const pool = mysql.createPool(dbConfig);

async function getConnection() {
    return pool.promise().getConnection();
}

module.exports = getConnection;