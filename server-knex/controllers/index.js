const randomstring = require("randomstring");
const fs = require("fs");
const Joi = require("joi");
const createError = require("http-errors");
const helper = require("../lib/helper");
const knex = require("../databases/connection");

let timeoutContainer = [];

module.exports.getIndex = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        const pastes = await knex("pastes")
            .where({
                exposure: "Public",
            })
            .limit(Number(setting.recentPastesMaxNumber))
            .orderBy("createdAt", "desc");

        res.render("index/layout.ejs", {
            child: "index/index.ejs",
            clientScript: "index/index.js.ejs",
            data: {
                results: pastes,
                setting: setting,
                baseURL: process.env.BASE_URL,
                errors: req.flash("errors"),
            },
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.postIndex = async function (req, res, next) {
    const schema = Joi.object({
        pasteTitle: Joi.string().required(),
        pasteContent: Joi.string().required(),
        pasteExpiry: Joi.string().required(),
        pasteExposure: Joi.string().required(),
    });

    const validObj = schema.validate(req.body, { abortEarly: false });
    if (validObj.error) {
        // res.send("Invalid Input");
        console.log(validObj.error);
        req.flash("errors", validObj.error.details);
        res.status(422).redirect("/");
        res.end();
        return;
    }

    try {
        const setting = await knex("settings").first();

        const { pasteTitle, pasteContent, pasteExpiry, pasteExposure } =
            req.body;

        let generatedEditID = randomstring.generate({
            length: 7,
            charset: "alphabetic",
            capitalization: "lowercase",
        });

        let generatedPasteID = randomstring.generate({
            length: 7,
            charset: "alphabetic",
            capitalization: "lowercase",
        });

        const pasteId = await knex("pastes").insert({
            title: pasteTitle ? pasteTitle : "Untitled",
            content: pasteContent,
            expiry: pasteExpiry,
            exposure: pasteExposure,
            slug: generatedPasteID,
            editSlug: generatedEditID,
            hits: 0,
        });

        const pasteCreatedId = await knex("pastecreateds").insert({});

        let timeo = setTimeout(async function () {
            console.log("deleting the row automatically...");

            await knex("pastes")
                .where({
                    editSlug: generatedEditID,
                })
                .del();

            console.log("deleted the row automatically...");
        }, helper.textToMS(pasteExpiry));

        timeoutContainer[generatedEditID] = timeo;

        res.redirect("/edit/" + generatedEditID);
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getEditAt = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();
        const paste = await knex("pastes")
            .where({ editSlug: req.params.id })
            .first();

        if (paste) {
            res.render("index/layout.ejs", {
                child: "index/edit.ejs",
                clientScript: "index/edit.js.ejs",
                data: {
                    result: paste,
                    setting: setting,
                    baseURL: process.env.BASE_URL,
                    errors: req.flash("errors"),
                },
            });
        } else {
            next(createError(404));
        }
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.postEdit = async function (req, res, next) {
    const schema = Joi.object({
        pasteTitle: Joi.string().required(),
        pasteContent: Joi.string().required(),
        pasteExpiry: Joi.string().required(),
        pasteExposure: Joi.string().required(),
    });

    const validObj = schema.validate(req.body);
    if (validObj.error) {
        // res.send("Invalid Input");
        req.flash("errors", validObj.error.details);
        let editSlugParts = req.get("referer").split("/");
        let lastEditSlugParts = editSlugParts[editSlugParts.length - 1];
        res.status(422).redirect("/edit/" + lastEditSlugParts);
        res.end();
        return;
    }

    try {
        const setting = await knex("settings").first();

        let editSlugParts = req.get("referer").split("/");
        let lastEditSlugParts = editSlugParts[editSlugParts.length - 1];

        const { pasteTitle, pasteContent, pasteExpiry, pasteExposure } =
            req.body;

        await knex("pastes")
            .where({ editSlug: lastEditSlugParts })
            .update({
                title: pasteTitle ? pasteTitle : "Untitled",
                content: pasteContent,
                expiry: pasteExpiry,
                exposure: pasteExposure,
            });

        clearTimeout(timeoutContainer[lastEditSlugParts]);

        let timeo = setTimeout(async function () {
            console.log("deleting the row automatically...");

            await knex("pastes")
                .where({
                    editSlug: lastEditSlugParts,
                })
                .del();

            console.log("deleted the row automatically...");
        }, helper.textToMS(pasteExpiry));

        timeoutContainer[lastEditSlugParts] = timeo;

        res.redirect(req.get("referer"));
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getViewAt = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        const paste = await knex("pastes")
            .where({ slug: req.params.id })
            .first();

        if (paste) {
            await knex("pastes")
                .where({ _id: paste._id })
                .update({
                    hits: paste.hits + 1,
                });

            res.render("index/layout.ejs", {
                child: "index/view.ejs",
                clientScript: "index/view.js.ejs",
                data: {
                    result: paste,
                    setting: setting,
                    baseURL: process.env.BASE_URL,
                },
            });
        } else {
            next(createError(404));
        }
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getDeleteAt = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        await knex("pastes")
            .where({
                editSlug: req.params.id,
            })
            .del();

        res.redirect("/");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getTrends = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        res.redirect("/trends/0");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getTrendsAt = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        const t1 = await knex("pastes")
            .where({
                exposure: "Public",
            })
            .count("_id as TOTAL")
            .first();
        const count = t1.TOTAL;

        let perPage = Number(setting.trendsMaxNumberPerPage);
        let page = Math.max(0, req.params.id);

        const rows = await knex("pastes")
            .where("exposure", "=", "Public")
            .offset(page * perPage)
            .limit(perPage)
            .orderBy("hits", "desc");

        res.render("index/layout.ejs", {
            child: "index/trends.ejs",
            clientScript: "index/trends.js.ejs",
            data: {
                results: rows,
                count: count,
                pagination: {
                    page: Number(req.params.id) + 1,
                    pageCount: Math.ceil(
                        count / Number(setting.trendsMaxNumberPerPage)
                    ),
                },
                currentPage: Number(req.params.id),
                pages: Math.ceil(
                    count / Number(setting.trendsMaxNumberPerPage)
                ),
                setting: setting,
                baseURL: process.env.BASE_URL,
            },
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};

module.exports.getSearch = async function (req, res, next) {
    try {
        const setting = await knex("settings").first();

        let query = req.query.q;

        const t1 = await knex("pastes")
            .where({
                exposure: "Public",
            })
            .andWhere("title", "like", `%${query}%`)
            .count("_id as TOTAL")
            .first();
        const count = t1.TOTAL;

        let perPage = Number(setting.searchResultsMaxNumberPerPage);
        let page = Math.max(0, req.query.page);

        const rows = await knex("pastes")
            .where("exposure", "=", "Public")
            .andWhere("title", "like", `%${query}%`)
            .offset(page * perPage)
            .limit(perPage)
            .orderBy("hits", "desc");

        res.render("index/layout.ejs", {
            child: "index/search.ejs",
            clientScript: "index/search.js.ejs",
            data: {
                results: rows,
                count: count,
                pagination: {
                    page: Number(req.query.page) + 1,
                    pageCount: Math.ceil(
                        count / Number(setting.searchResultsMaxNumberPerPage)
                    ),
                },
                q: query,
                currentPage: Number(req.query.page),
                pages: Math.ceil(
                    count / Number(setting.searchResultsMaxNumberPerPage)
                ),
                setting: setting,
                baseURL: process.env.BASE_URL,
            },
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
};
