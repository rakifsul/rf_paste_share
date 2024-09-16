const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bcrypt = require("bcryptjs");
const fs = require("fs");
const Joi = require('joi');
const db = require('../models');
const router = express.Router();

const sessionChecker = async (req, res, next) => {
    //200
    if (req.session.user) {
        const user = await db.User.findOne({
            where: {
                email: req.session.user.email
            }
        });

        if (user) {
            next();
        } else {
            res.redirect("/auth/login");
        }
    } else {
        res.redirect("/auth/login");
    }
};

router.get("/", sessionChecker, async function (req, res) {
    //200
    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    const pastes = await db.Paste.findAll({
        where: {
            exposure: "Public"
        },
        order: [
            ['createdAt', 'DESC']
        ],
        limit: 10
    });

    res.render("admin/layout", {
        child: "admin/index",
        data: {
            results: pastes,
            siteTitle: config.siteTitle,
            baseURL: config.baseURL,
            siteDesc: config.siteDesc
        }
    });
});

router.post("/", sessionChecker, async function (req, res) {
    //200
    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    const results = await db.PasteCreated.findAll({
        where: {
            createdAt: {
                [Op.between]: [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date(Date.now())]
            }
        },
        attributes: [
            [Sequelize.literal(`DATE("createdAt")`), 'date'],
            [Sequelize.literal(`COUNT(*)`), 'count']
        ],
        group: ['date'],
        limit: 7
    });

    let finalResults = [];
    for (let result of results) {
        finalResults.push({
            key: result.dataValues.date,
            value: result.dataValues.count
        });
    }

    res.json(finalResults);
});

router.get("/paste/list", sessionChecker, async function (req, res) {
    //200
    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    const pastes = await db.Paste.findAll({
        where: {
            exposure: "Public"
        },
        order: [
            ['createdAt', 'DESC']
        ]
    });

    res.render("admin/layout", {
        child: "admin/pastes",
        data: {
            results: pastes,
            siteTitle: config.siteTitle,
            baseURL: config.baseURL,
            siteDesc: config.siteDesc
        }
    });
});

router.post("/paste/list", sessionChecker, async function (req, res) {
    //200
    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    let myWhere;
    let searchStr = req.body.search.value;
    if (req.body.search.value) {
        searchStr = {
            where: {
                title: {
                    [Op.like]: `%${req.body.search.value}%`
                }
            }
        };

        myWhere = {
            title: {
                [Op.like]: `%${req.body.search.value}%`
            }
        };
    } else {
        searchStr = {};
        myWhere = null;
    }

    const recordsTotal = await db.Paste.count({});
    const recordsFiltered = await db.Paste.count(searchStr);

    let fetched;
    if (myWhere) {
        fetched = await db.Paste.findAll({
            where: myWhere,
            order: [
                ['createdAt', 'DESC']
            ],
            offset: Number(req.body.start),
            limit: Number(req.body.length)
        });
    } else {
        fetched = await db.Paste.findAll({
            order: [
                ['createdAt', 'DESC']
            ],
            offset: Number(req.body.start),
            limit: Number(req.body.length)
        });
    }

    let data = JSON.stringify({
        draw: req.body.draw,
        recordsFiltered: recordsFiltered,
        recordsTotal: recordsTotal,
        data: fetched
    });

    res.send(data);
});

router.get("/paste/delete/:id", sessionChecker, async function (req, res) {
    //200
    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    const ret = await db.Paste.destroy({
        where: {
            editSlug: req.params.id
        }
    });

    res.redirect(config.baseURL + "/admin/paste/list");
});

router.get("/settings", sessionChecker, function (req, res) {
    //200
    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    res.render("admin/layout", {
        child: "admin/settings",
        data: {
            recentPastesMaxNumber: config.recentPastesMaxNumber,
            trendsMaxNumberPerPage: config.trendsMaxNumberPerPage,
            searchResultsMaxNumberPerPage: config.searchResultsMaxNumberPerPage,
            adminEmail: req.session.user.email,
            siteTitle: config.siteTitle,
            baseURL: config.baseURL,
            siteDesc: config.siteDesc,
            errors: req.flash('errors')
        }
    });
});

router.post("/account-setting/edit", sessionChecker, async function (req, res) {
    //200
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });

    const validObj = schema.validate(req.body);
    if (validObj.error) {
        // res.send("Invalid Input");
        req.flash("errors", validObj.error.details);
        res.status(422).redirect("/admin/settings");
        res.end();
        return;
    }

    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    const { email, password } = req.body;
    try {
        const user = await db.User.update({
            email: email,
            password: bcrypt.hashSync(password, 12)
        }, {
            where: {
                email: req.session.user.email
            }
        });

        res.redirect(config.baseURL + "/admin/settings");
    } catch (err) {
        res.end("Exception: " + err);
    }
});

router.post("/frontend-setting/edit", sessionChecker, function (req, res) {
    //200
    const schema = Joi.object({
        recentPastesMaxNumber: Joi.string().required(),
        trendsMaxNumberPerPage: Joi.string().required(),
        searchResultsMaxNumberPerPage: Joi.string().required()
    });

    const validObj = schema.validate(req.body);
    if (validObj.error) {
        // res.send("Invalid Input");
        req.flash("errors", validObj.error.details);
        res.status(422).redirect("/admin/settings");
        res.end();
        return;
    }

    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    let tConf = config;
    tConf.recentPastesMaxNumber = req.body.recentPastesMaxNumber;
    tConf.trendsMaxNumberPerPage = req.body.trendsMaxNumberPerPage;
    tConf.searchResultsMaxNumberPerPage = req.body.searchResultsMaxNumberPerPage;

    fs.writeFileSync("settings.json", JSON.stringify(tConf, null, "\t"));

    res.redirect(config.baseURL + "/admin/settings");
});

module.exports = router;
