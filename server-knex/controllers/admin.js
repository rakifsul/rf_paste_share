const bcrypt = require("bcryptjs");
const fs = require("fs");
const createError = require("http-errors");
const Joi = require("joi");
const helper = require("../lib/helper");
const knex = require("../databases/connection");

module.exports.getIndex = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        const pastes = await knex("pastes")
            .limit(10)
            .orderBy("createdAt", "desc");

        res.render("admin/layout.ejs", {
            child: "admin/index.ejs",
            clientScript: "admin/index.js.ejs",
            data: {
                results: pastes,
                setting: setting,
            },
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.postIndex = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        const results = await knex("pastecreateds");

        let groupedResultsByDay = {};
        results.forEach((item, index) => {
            const dateOnly = item.createdAt.toISOString().split("T")[0];
            if (groupedResultsByDay[dateOnly]) {
                groupedResultsByDay[dateOnly]++;
            } else {
                groupedResultsByDay[dateOnly] = 1;
            }
        });

        let finalResults = [];
        for (const [key, value] of Object.entries(groupedResultsByDay)) {
            finalResults.push({
                key: key,
                value: value,
            });
        }
        res.json(finalResults);
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getPasteList = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        const pastes = await knex("pastes").orderBy("createdAt", "desc");

        res.render("admin/layout.ejs", {
            child: "admin/pastes.ejs",
            clientScript: "admin/pastes.js.ejs",
            data: {
                results: pastes,
                setting: setting,
            },
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.postPasteList = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        let searchStr = req.body.search.value;
        if (req.body.search.value) {
            searchStr = req.body.search.value;
        } else {
            searchStr = "";
        }

        const t1 = await knex("pastes").count("_id as TOTAL").first();
        const recordsTotal = t1.TOTAL;

        const t2 = await knex("pastes")
            .where("title", "like", `%${searchStr}%`)
            .count("_id as TOTAL")
            .first();
        const recordsFiltered = t2.TOTAL;

        const results = await knex("pastes")
            .where("title", "like", `%${searchStr}%`)
            .offset(Number(req.body.start))
            .limit(Number(req.body.length))
            .orderBy("createdAt", "desc");

        let data = JSON.stringify({
            draw: req.body.draw,
            recordsFiltered: recordsFiltered,
            recordsTotal: recordsTotal,
            data: results,
        });

        res.send(data);
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getPasteDeleteAt = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        await knex("pastes")
            .where({
                editSlug: req.params.id,
            })
            .del();

        res.redirect("/admin/paste/list");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getSettings = async function (req, res) {
    try {
        const setting = await knex("settings").first();

        res.render("admin/layout.ejs", {
            child: "admin/settings.ejs",
            clientScript: "admin/settings.js.ejs",
            data: {
                adminEmail: req.session.admin.email,
                setting: setting,
                errors: req.flash("errors"),
            },
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.postAccountSettingEdit = async function (req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
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
        const setting = await knex("settings").first();

        const { email, password } = req.body;
        if (password && email) {
            await knex("admins")
                .where({ email: req.session.admin.email })
                .update({
                    email: email,
                    password: bcrypt.hashSync(password, 12),
                });
        } else if (email) {
            await knex("admins")
                .where({ email: req.session.admin.email })
                .update({
                    email: email,
                });
        }

        res.redirect("/admin/settings");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.postFrontendSettingEdit = async function (req, res, next) {
    const schema = Joi.object({
        recentPastesMaxNumber: Joi.string().required(),
        trendsMaxNumberPerPage: Joi.string().required(),
        searchResultsMaxNumberPerPage: Joi.string().required(),
    });

    const validObj = schema.validate(req.body, {
        allowUnknown: true,
    });

    if (validObj.error) {
        // res.send("Invalid Input");
        req.flash("errors", validObj.error.details);
        res.status(422).redirect("/admin/settings");
        res.end();
        return;
    }

    try {
        const target = await knex("settings").first();

        const ret = await knex("settings")
            .where({ _id: target._id })
            .update({
                siteTitle: req.body.siteTitle,
                siteSEOTitle: req.body.siteSEOTitle,
                siteDescription: req.body.siteDescription,
                siteSEODescription: req.body.siteSEODescription,
                recentPastesMaxNumber: Number(req.body.recentPastesMaxNumber),
                trendsMaxNumberPerPage: Number(req.body.trendsMaxNumberPerPage),
                searchResultsMaxNumberPerPage: Number(
                    req.body.searchResultsMaxNumberPerPage
                ),
            });

        res.redirect("/admin/settings");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};
