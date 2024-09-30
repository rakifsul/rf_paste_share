const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = require("url");
require("dotenv").config();

const Admin = require("./models/admin");
const Setting = require("./models/setting");
const Paste = require("./models/paste");
const indexRouter = require("./routes/index");
const adminRouter = require("./routes/admin");
const authRouter = require("./routes/auth");
const helper = require("./lib/helper")

var app = express();
let store = null;
if (process.env.MONGODB_URI) {
    store = new MongoDBStore({
        uri: process.env.MONGODB_URI,
        collection: "sessions"
    });
} else {
    store = null;
    throw new Error("Detail database tidak valid.")
}

store.on("error", function (error) {
    console.log(error);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        store: store,
        resave: false,
        saveUninitialized: false
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
            stack: err.stack
        }
    });
});

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).catch((error) => {
        console.log(error);
    });
} else {
    throw new Error("Detail database tidak valid.")
}

mongoose.connection.on("error", (err) => {
    console.log(err);
});

mongoose.connection.on("connected", async function () {
    const admin = await Admin.find({});
    if (admin.length == 0) {
        console.log("Admin belum ada, membuat admin pertama...");
        let newAdmin = new Admin({
            email: "admin@example.com",
            name: "admin",
            password: bcrypt.hashSync("admin", 12)
        });
        await newAdmin.save();
    }

    const setting = await Setting.find({});
    if (setting.length == 0) {
        console.log("Config belum ada, membuat config default...")
        let newSetting = new Setting({
            siteTitle: "RF Paste Share",
            siteSEOTitle: "RF Paste Share - Aplikasi web berbagi paste",
            siteDescription: "RF Paste Share adalah aplikasi web berbagi paste...",
            siteSEODescription: "RF Paste Share adalah aplikasi web berbagi paste...",
            recentPastesMaxNumber: 4,
            trendsMaxNumberPerPage: 4,
            searchResultsMaxNumberPerPage: 4
        });
        await newSetting.save();
    }

    const pastes = await Paste.find({});
    if (pastes.length > 0) {
        console.log("Menghapus paste yang sudah expired...")
        let needToDelete = [];
        pastes.forEach(async (item, index) => {
            const expiry = helper.textToMS(item.expiry);

            let expiryFromCreated = (new Date(item.createdAt));
            expiryFromCreated.setMilliseconds(expiryFromCreated.getMilliseconds() + expiry);

            let dateNow = new Date();
            if (dateNow > expiryFromCreated) {
                needToDelete.push(item);
            }
        });

        needToDelete.forEach(async (item, index) => {
            await Paste.deleteOne({
                _id: item._id
            });
        });
    }

    const port = url.parse(process.env.BASE_URL).port | 3000;
    app.listen(port, function () {
        console.log(`server berjalan di port ${port}`);
    });
});
