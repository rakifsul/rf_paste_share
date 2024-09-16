const bcrypt = require("bcryptjs");
const fs = require("fs");
const createError = require('http-errors');
const Joi = require('joi');
const helper = require('../lib/helper');
const Admin = require('../models/admin');
const Paste = require('../models/paste');
const PasteCreated = require('../models/pastecreated');
const Setting = require('../models/setting');

module.exports.getIndex = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        const pastes = await Paste.find({
        },
            null, {
            limit: 10,
            sort: {
                createdAt: -1
            }
        });

        res.render("admin/layout.ejs", {
            child: "admin/index.ejs",
            clientScript: "admin/index.js.ejs",
            data: {
                results: pastes,
                setting: setting
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.postIndex = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        const results = await PasteCreated.find({});

        let groupedResultsByDay = {};
        results.forEach((item, index) => {
            const dateOnly = item.createdAt.toISOString().split("T")[0];
            if (groupedResultsByDay[dateOnly]) {
                groupedResultsByDay[dateOnly]++;
            } else {
                groupedResultsByDay[dateOnly] = 1;
            }
        })

        let finalResults = [];
        for (const [key, value] of Object.entries(groupedResultsByDay)) {
            finalResults.push({
                key: key,
                value: value
            });
        }
        res.json(finalResults);
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getPasteList = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        const pastes = await Paste.find({
        },
            null, {
            sort: {
                createdAt: -1
            }
        });

        res.render("admin/layout.ejs", {
            child: "admin/pastes.ejs",
            clientScript: "admin/pastes.js.ejs",
            data: {
                results: pastes,
                setting: setting
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.postPasteList = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        let searchStr = req.body.search.value;
        if (req.body.search.value) {
            searchStr = {
                $text: {
                    $search: req.body.search.value
                }
            };
        } else {
            searchStr = {};
        }

        let recordsTotal = await Paste.count({});
        let recordsFiltered = await Paste.count(searchStr);

        let results = await Paste.find(
            searchStr,
            null, {
            limit: Number(req.body.length),
            skip: Number(req.body.start),
            sort: {
                createdAt: -1
            }
        });

        let data = JSON.stringify({
            draw: req.body.draw,
            recordsFiltered: recordsFiltered,
            recordsTotal: recordsTotal,
            data: results
        });

        res.send(data);
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getPasteDeleteAt = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        await Paste.deleteOne({
            editSlug: req.params.id
        });

        res.redirect("/admin/paste/list");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }

}

module.exports.getSettings = async function (req, res) {
    try {
        const setting = await Setting.findOne({});

        res.render("admin/layout.ejs", {
            child: "admin/settings.ejs",
            clientScript: "admin/settings.js.ejs",
            data: {
                adminEmail: req.session.admin.email,
                setting: setting,
                errors: req.flash('errors')
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.postAccountSettingEdit = async function (req, res, next) {
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

    try {
        const setting = await Setting.findOne({});

        const { email, password } = req.body;
        if (password && email) {
            await Admin.updateOne({
                email: req.session.admin.email
            }, {
                $set: {
                    email: email,
                    password: bcrypt.hashSync(password, 12)
                }
            });
        } else if (email) {
            await Admin.updateOne({
                email: req.session.admin.email
            }, {
                $set: {
                    email: email
                }
            });
        }

        res.redirect("/admin/settings");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.postFrontendSettingEdit = async function (req, res, next) {
    const schema = Joi.object({
        recentPastesMaxNumber: Joi.string().required(),
        trendsMaxNumberPerPage: Joi.string().required(),
        searchResultsMaxNumberPerPage: Joi.string().required()
    });

    const validObj = schema.validate(req.body, {
        allowUnknown: true
    });

    if (validObj.error) {
        // res.send("Invalid Input");
        req.flash("errors", validObj.error.details);
        res.status(422).redirect("/admin/settings");
        res.end();
        return;
    }

    try {
        const setting = await Setting.findOne({});

        setting.siteTitle = req.body.siteTitle;
        setting.siteSEOTitle = req.body.siteSEOTitle;
        setting.siteDescription = req.body.siteDescription;
        setting.siteSEODescription = req.body.siteSEODescription;
        setting.recentPastesMaxNumber = Number(req.body.recentPastesMaxNumber);
        setting.trendsMaxNumberPerPage = Number(req.body.trendsMaxNumberPerPage);
        setting.searchResultsMaxNumberPerPage = Number(req.body.searchResultsMaxNumberPerPage);

        await setting.save();

        res.redirect("/admin/settings");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}