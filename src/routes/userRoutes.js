const express = require("express");
const getConnection = require("../db/db");
const router = express.Router();

const app = express();

app.use(router);

// 로그인
router.post("/signin", async (req, res) => {
    const connection = await getConnection()

    try {
        const { id, password } = req.body
        const selectQuery = "SELECT * FROM `today_lunch`.`user` WHERE (`id` = ? AND `password` = ?)"

        const [selectRows, selectFields] = await connection.query(selectQuery, [id, password])

        if (getValidObject(selectRows).length !== 0) {
            req.session.user = null;
            req.session.user = {
                id: selectRows[0].id,
                nickname: selectRows[0].nickname,
            }
            res.status(200).send({ isSuccess: true, message: "로그인에 성공했습니다.", user: req.session.user });
        } else {
            res.status(404).send({ isSuccess: false, message: "유저 정보가 존재하지 않습니다." });
        }
    } catch(error) {
        console.log(`PostSignIn error: ${error.message}`)
        res.status(500).send({ isSuccess: false, error: error.message })
    } finally {
        connection.release();
    }
});

// 회원가입
router.post("/signup", async (req, res) => {
    const connection = await getConnection();

    try {
        const { id, password, nickname } = req.body
        const selectQuery = "SELECT * FROM `today_lunch`.`user` WHERE (`id` = ? OR `nickname` = ?)"

        const [selectRows, selectFields] = await connection.query(selectQuery, [id, nickname]);

        if (getValidObject(selectRows).length === 0) {
            const insertQuery = "INSERT INTO user (id, password, nickname, reviewIdList, registerDate) VALUES (?, ?, ?, '[]', NOW())"

            const [result, insertFields] = await connection.query(insertQuery, [id, password, nickname])

            req.session.user = null;

            req.session.user = {
                id: id,
                nickname: nickname,
            }
            result.affectedRows > 0
                ? res.status(201).send({ isSuccess: true, message: "회원가입에 성공했습니다.", user: req.session.user })
                : res.status(404).send({ isSuccess: false, message: "유저 정보가 존재하지 않습니다." });
        } else {
            const savedId = selectRows[0].id;
            const savedNickname = selectRows[0].nickname;

            if (id === savedId) {
                res.status(400).send({ isSuccess: false, message: "이미 존재하는 아이디입니다." });
            } else if (nickname === savedNickname) {
                res.status(400).send({ isSuccess: false, message: "이미 존재하는 닉네임입니다." });
            } else {
                res.status(400).send({ isSuccess: false, message: "이미 존재하는 아이디와 닉네임입니다." });
            }
        }
    } catch(error) {
        console.log(`PostSignUp error: ${error.message}`)
        res.status(500).send({ isSuccess: false, error: error.message })
    } finally {
        connection.release();
    }
});

// 자동 로그인
router.get("/signin-auto", async (req, res) => {
    try {
        if (req.session && req.session.user) {
            res.json({ isSuccess: true, message: "자동 로그인에 성공했습니다.", user: req.session.user });
        } else {
            res.status(401).json({ isSuccess: false, message: "자동 로그인에 실패했습니다." })
        }
    } catch(error) {
        console.log(`GetSignInAuto Error: ${error.message}`)
        res.status(500).send({ isSuccess: false, error: e.message })
    }
});

// 로그아웃
router.post("/logout", async (req, res) => {
    if (req.session) {
        req.session.destroy((error) => {
            if (error) {
                console.error(`PostLogout error: ${error.message}`)
                res.status(500).json({ isSuccess: true, message: "로그아웃 중 문제가 발생했습니다." })
            }

            res.clearCookie("connect.sid");
            res.status(200).json({ isSuccess: true, message: "로그아웃에 성공했습니다." })
        })
    } else {
        res.status(400).json({ isSuccess: false, message: "로그인 상태가 아닙니다." })
    }
});

// 유저 정보 조회
router.get("/:id", async (req, res) => {
    const connection = await getConnection();
    const id = req.params.id;

    try {
        const selectQuery = "SELECT * FROM user WHERE id = ?"

        const [selectRows, selectFields] = await connection.query(selectQuery, [id])
        if (getValidObject(selectRows).length !== 0) {
            const userInfo = {
                rowId: selectRows[0].rowId,
                id: selectRows[0].id,
                nickname: selectRows[0].nickname,
                reviewIdList: selectRows[0].reviewIdList,
                registerDate: selectRows[0].registerDate,
            }

            res.status(200).json({ isSuccess: true, message: "회원 정보가 존재합니다.", userInfo: userInfo, isLogin: req.session.user !== undefined })
        } else {
            res.status(404).json({ isSuccess: false, message: "회원 정보가 존재하지 않습니다." })
        }
    } catch(error) {
        console.log(`GetUserById Error: ${error.message}`)
        res.status(500).json({ isSuccess: false, message: "서버 에러가 발생했습니다." })
    } finally {
        connection.release();
    }
});

// 유저 정보 수정
router.put("/", async (req, res) => {
    const connection = await getConnection();

    const { rowId, id, nickname, reviewIdList } = req.body;

    try {
        const updateQuery = "UPDATE user SET `id` = ?, `nickname` = ?, `reviewIdList` = ? WHERE `rowId` = ?"

        const [result, updateFields] = await connection.query(updateQuery, [id, nickname, JSON.stringify(reviewIdList), rowId]);

        if (result.affectedRows > 0) {
            req.session.user = {
                id: id,
                nickname: nickname,
            }
            res.status(200).json({ isSuccess: true, message: "유저 정보가 수정되었습니다." })
        } else {
            res.status(400).json({ isSuccess: false, message: "유저 정보 수정에 실패했습니다. 다시 시도해주세요." })
        }
    } catch(error) {
        console.log(`PutUser Error: ${error.message}`)
        res.status(500).json({ isSuccess: false, message: "서버 에러가 발생했습니다." })
    } finally {
        connection.release();
    }
})

// 유저 탈퇴
router.delete("/:id", async (req, res) => {
    const connection = await getConnection();
    const id = req.params.id;

    try {
        const deleteQuery = "DELETE FROM user WHERE id = ?"

        const [result, deleteFields] = await connection.query(deleteQuery, [id]);
        console.log(`result delete = ${JSON.stringify(result)}`)

        if (result.affectedRows > 0) {
            req.session.destroy((error) => {
                if (error) {
                    res.status(400).json({ isSuccess: false, message: "유저 정보 삭제에 실패했습니다. 다시 시도해주세요." })
                }

                res.status(200).json({ isSuccess: true, message: "유저 정보가 삭제되었습니다." })
            })
        } else {
            res.status(400).json({ isSuccess: false, message: "유저 정보 삭제에 실패했습니다. 다시 시도해주세요." })
        }
    } catch(error) {
        console.log(`DeleteUser Error: ${error.message}`)
        res.status(500).json({ isSuccess: false, message: "서버 에러가 발생했습니다." })
    } finally {
        connection.release();
    }
})

function getValidObject(object) {
    return JSON.parse(JSON.stringify(object));
}

module.exports = router