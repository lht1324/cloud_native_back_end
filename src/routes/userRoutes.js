const express = require("express");
const getConnection = require("../db/db");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        console.log("connection try")
        getConnection((connection) => {
            console.log("in Query")
            const query = "SELECT * FROM `today_lunch`.`user` WHERE (`rowId` = '1')"

            connection.query(query, [1], (err, results) => {
                if (err) {
                    console.log(`Error: ${err.message}`);
                    return;
                }

                const row = results[0];

                console.log(`row = ${JSON.stringify(row)}, results = ${JSON.stringify(results)}`);
            });

            console.log(`req = ${req.body}`);
            connection.release();
            res.status(201).send({ isSuccess: true })
        })
    } catch(e) {
        console.log(`error: ${e.message}`)
        res.status(500).send({ isSuccess: false, error: e.message })
    }
    console.log(`user post, ${JSON.stringify(req.body)}`)
});

router.get("/", async (res) => {
    try {

    } catch(e) {

    }
});

router.put("/", async (req, res) => {
    try {

    } catch(e) {

    }
})

router.delete("/", async (req, res) => {
    try {

    } catch(e) {

    }
})

module.exports = router