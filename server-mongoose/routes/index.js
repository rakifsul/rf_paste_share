const express = require('express');
const indexController = require('../controllers/index');

const router = express.Router();

router.get("/", indexController.getIndex);

router.post("/", indexController.postIndex);

router.get("/edit/:id", indexController.getEditAt);

router.post("/edit", indexController.postEdit);

router.get("/view/:id", indexController.getViewAt);

router.get("/delete/:id", indexController.getDeleteAt);

router.get("/trends", indexController.getTrends);

router.get("/trends/:id", indexController.getTrendsAt);

router.get("/search", indexController.getSearch);


module.exports = router;
