const express = require("express");
const getConnection = require("../db/db");
const router = express.Router();

const app = express();

app.use(router);

router.post("/", async (req, res) => {
    // id는 오토
    const { storeName, author, review, starCount } = req.body;
    const connection = await getConnection();

    try {
        const selectQuery = `SELECT * FROM review WHERE (storeName = ? AND author = ? AND starCount = ?)`;
        const [selectRows, selectFields] = await connection.query(selectQuery, [storeName, author, starCount]);

        if (getValidObject(selectRows).length === 0) {
            const insertQuery = `INSERT INTO review (storeName, author, review, starCount, registerDate) VALUES (?, ?, ?, ?, NOW())`;
            const [result, insertFields] = await connection.query(insertQuery, [storeName, author, review, starCount]);

            if (result.affectedRows > 0) {
                res.status(200).send({ isSuccess: true, message: "리뷰가 작성되었습니다.", reviewRowId: result.insertId })
            } else {
                res.status(400).send({ isSuccess: false, message: "리뷰 추가에 실패했습니다." });
            }
        } else {
            res.status(400).send({ isSuccess: false, message: "이미 작성된 가게입니다." });
        }
    } catch(error) {
        console.log(`PostReview Error: ${error.message}`);
        res.status(500).send({ isSuccess: false, message: "서버 에러가 발생했습니다." });
    } finally {
        connection.release();
    }
})
router.post("/list", async (req, res) => {
    const connection = await getConnection();

    try {
        const { userId, reviewIdList } = req.body;
        const validReviewIdList = typeof(reviewIdList) === "string"
            ? JSON.parse(reviewIdList)
            : reviewIdList

        /*
        * reviewIdList.isEmpty === true 일 때 전체 Row를 내려주는 식으로 작업하면
        * 작성한 게 없는 사람은 전체 리스트를 받아야 해 userId를 사용했다.
        * */
        console.log(`getList = ${userId}, ${reviewIdList}, ${JSON.stringify(reviewIdList)}, ${typeof(reviewIdList)}, ${validReviewIdList}`)
        if (validReviewIdList.length !== 0) {
            const selectQuery = "SELECT * FROM review WHERE id IN (?)";

            const [selectRows, selectFields] = await connection.query(selectQuery, [validReviewIdList]);

            res.status(200).send({ isSuccess: true, message: "리뷰 검색에 성공했습니다.", reviewDataList: selectRows })
        } else {
            if (userId === undefined) {
                const selectQuery = "SELECT * FROM review";

                const [selectRows, selectFields] = await connection.query(selectQuery, []);

                res.status(200).send({ isSuccess: true, message: "리뷰 검색에 성공했습니다.", reviewDataList: selectRows })
            } else {
                res.status(404).send({ isSuccess: false, message: "작성하신 리뷰가 존재하지 않습니다.", reviewDataList: [] })
            }
        }
    } catch(error) {
        console.log(`GetReview Error: ${error.message}`);
        res.status(500).json({ isSuccess: false, message: "서버 에러가 발생했습니다." });
    } finally {
        connection.release();
    }
});
router.put("/", async(req, res) => {
    const connection = await getConnection();

    try {
        const { id, storeName, author, review, starCount } = req.body;
        const updateQuery = "UPDATE review SET `storeName` = ?, `author` = ?, `review` = ?, `starCount` = ? WHERE id = ?";
        const [result, updateFields] = await connection.query(updateQuery, [storeName, author, review, starCount, id]);

        if (result.affectedRows > 0) {
            res.status(200).json({ isSuccess: true, message: "리뷰가 수정되었습니다." })
        } else {
            res.status(400).json({ isSuccess: false, message: "리뷰 수정에 실패했습니다. 다시 시도해주세요." })
        }
    } catch(error) {
        console.log(`PutReview Error: ${error.message}`)
        res.status(500).json({ isSuccess: false, message: "서버 에러가 발생했습니다." })
    } finally {
        connection.release();
    }
})

function getValidObject(object) {
    return JSON.parse(JSON.stringify(object));
}

module.exports = router