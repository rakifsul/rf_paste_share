const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const url = require("url");

require("dotenv").config();

const knex = require("./databases/connection");

const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const authRouter = require("./routes/auth");
const helper = require("./lib/helper");

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        store: new FileStore(),
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 3600000, secure: false, httpOnly: true },
    })
);

app.use(flash());

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
        error: {
            message: err.message,
            status: err.status,
            stack: err.stack,
        },
    });
});

const port = url.parse(process.env.BASE_URL).port | 3000;
app.listen(port, async function () {
    console.log(`server berjalan di port ${port}`);

    const pastes = await knex("pastes");
    if (pastes.length > 0) {
        console.log("Menghapus paste yang sudah expired...");
        let needToDelete = [];
        pastes.forEach(async (item, index) => {
            const expiry = helper.textToMS(item.expiry);

            let expiryFromCreated = new Date(item.createdAt);
            expiryFromCreated.setMilliseconds(
                expiryFromCreated.getMilliseconds() + expiry
            );

            let dateNow = new Date();
            if (dateNow > expiryFromCreated) {
                needToDelete.push(item);
            }
        });

        needToDelete.forEach(async (item, index) => {
            await knex("pastes")
                .where({
                    _id: item._id,
                })
                .del();
        });
    }
});
