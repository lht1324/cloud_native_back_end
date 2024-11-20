const express = require("express");
const pool = require("../db/db");
const router = express.Router();

router.post("/", async (req, res) => {
    // id는 오토
    const { storeName, author, review } = req.body;

    try {
        const [result] = await pool.query(
            `Insert Into Review (storeName, author, review) VALUES (?, ?, ?)`,
            [storeName, author, review]
        )
        res.status(201).json({ id: result.insertId, storeName, author, review })
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
})
router.get("/", async (res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM Review")
        await res.json(rows)
    } catch(e) {
        res.status(500).json({ error: e.message })
    }
});
router.put("/", async(req, res) => {
    try {

    } catch(e) {

    }
})
router.delete("/", async(req, res) => {
    try {

    } catch(e) {

    }
})

module.exports = router