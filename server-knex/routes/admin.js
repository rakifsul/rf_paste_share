const express = require('express');
const adminController = require('../controllers/admin');
const sessionChecker = require('../middlewares/sessionchecker');

const router = express.Router();

router.get("/", sessionChecker.notLoggedIn, adminController.getIndex);

router.post("/", sessionChecker.notLoggedIn, adminController.postIndex);

router.get("/paste/list", sessionChecker.notLoggedIn, adminController.getPasteList);

router.post("/paste/list", sessionChecker.notLoggedIn, adminController.postPasteList);

router.get("/paste/delete/:id", sessionChecker.notLoggedIn, adminController.getPasteDeleteAt);

router.get("/settings", sessionChecker.notLoggedIn, adminController.getSettings);

router.post("/account-setting/edit", sessionChecker.notLoggedIn, adminController.postAccountSettingEdit);

router.post("/frontend-setting/edit", sessionChecker.notLoggedIn, adminController.postFrontendSettingEdit);

module.exports = router;
