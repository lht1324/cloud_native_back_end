const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const session = require("express-session");
const {urlencoded} = require("express");

const app = express();

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
)

app.use(
    session({
        secret: "secret_key",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // milliseconds * seconds * minute * hour
            httpOnly: true,
            secure: false,
        }
    })
)

app.use(bodyParser.json());
app.use(express.json());
app.use(urlencoded({ extended: true }))

app.use("/user", userRoutes);
app.use("/review", reviewRoutes);

app.listen(5000, () => {
    console.log("Server started on port 5000!");
})