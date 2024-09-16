const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const flash = require('connect-flash');

const db = require('./models');

//200
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Koneksi database berhasil.');
  } catch (error) {
    console.error('Tidak bisa terkoneksi ke database: ' + error);
  }
})();

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "xcvxcsdwerwe",
    resave: false,
    saveUninitialized: false
  })
);

app.use(flash());

app.use("/public", express.static(path.join(__dirname, "public")));

app.use('/', indexRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
