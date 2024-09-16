const express = require('express');
const authController = require('../controllers/auth');
const sessionChecker = require('../middlewares/sessionchecker');

const router = express.Router();

router.get("/login", sessionChecker.loggedIn, authController.getLogin);

router.post("/login", sessionChecker.loggedIn, authController.postLogin);

router.get("/register", authController.getRegister);

router.post("/register", authController.postRegister);

router.get("/logout", authController.getLogout);

module.exports = router;
