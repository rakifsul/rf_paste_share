const randomstring = require("randomstring");
const fs = require("fs");
const Joi = require('joi');
const createError = require('http-errors');
const helper = require("../lib/helper");
const Paste = require('../models/paste');
const PasteCreated = require('../models/pastecreated');
const Setting = require('../models/setting');

let timeoutContainer = [];

module.exports.getIndex = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        const pastes = await Paste.find({
            exposure: "Public"
        },
            null, {
            limit: Number(setting.recentPastesMaxNumber),
            sort: {
                createdAt: -1
            }
        });

        res.render("index/layout.ejs", {
            child: "index/index.ejs",
            clientScript: "index/index.js.ejs",
            data: {
                results: pastes,
                setting: setting,
                baseURL: process.env.BASE_URL,
                errors: req.flash('errors')
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

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
        const setting = await Setting.findOne({});

        const { pasteTitle, pasteContent, pasteExpiry, pasteExposure } = req.body;

        let generatedEditID = randomstring.generate({
            length: 7,
            charset: "alphabetic",
            capitalization: "lowercase"
        });

        let generatedPasteID = randomstring.generate({
            length: 7,
            charset: "alphabetic",
            capitalization: "lowercase"
        });

        let paste = new Paste({
            title: pasteTitle ? pasteTitle : "Untitled",
            content: pasteContent,
            expiry: pasteExpiry,
            exposure: pasteExposure,
            slug: generatedPasteID,
            editSlug: generatedEditID,
            hits: 0
        });

        await paste.save();

        let pasteCreated = new PasteCreated({});
        await pasteCreated.save();

        let timeo = setTimeout(async function () {
            console.log("deleting the row automatically...");

            await Paste.deleteOne({
                editSlug: generatedEditID
            });

            console.log("deleted the row automatically...");
        }, helper.textToMS(pasteExpiry));

        timeoutContainer[generatedEditID] = timeo;

        res.redirect("/edit/" + generatedEditID);
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getEditAt = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        const paste = await Paste.findOne({
            editSlug: req.params.id
        });

        if (paste) {
            res.render("index/layout.ejs", {
                child: "index/edit.ejs",
                clientScript: "index/edit.js.ejs",
                data: {
                    result: paste,
                    setting: setting,
                    baseURL: process.env.BASE_URL,
                    errors: req.flash('errors')
                }
            });
        } else {
            next(createError(404));
        }
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

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
        const setting = await Setting.findOne({});

        let editSlugParts = req.get("referer").split("/");
        let lastEditSlugParts = editSlugParts[editSlugParts.length - 1];

        const { pasteTitle, pasteContent, pasteExpiry, pasteExposure } = req.body;

        const ret = await Paste.updateOne({
            editSlug: lastEditSlugParts
        }, {
            $set: {
                title: pasteTitle ? pasteTitle : "Untitled",
                content: pasteContent,
                expiry: pasteExpiry,
                exposure: pasteExposure
            }
        });

        clearTimeout(timeoutContainer[lastEditSlugParts]);

        let timeo = setTimeout(async function () {
            console.log("deleting the row automatically...");

            const ret = await Paste.deleteOne({
                editSlug: lastEditSlugParts
            });

            console.log("deleted the row automatically...");
        }, helper.textToMS(pasteExpiry));

        timeoutContainer[lastEditSlugParts] = timeo;

        res.redirect(req.get("referer"));
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getViewAt = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        const paste = await Paste.findOne({
            slug: req.params.id
        });

        if (paste) {
            await Paste.updateOne({
                _id: paste._id
            }, {
                $set: {
                    hits: paste.hits + 1
                }
            });

            res.render("index/layout.ejs", {
                child: "index/view.ejs",
                clientScript: "index/view.js.ejs",
                data: {
                    result: paste,
                    setting: setting,
                    baseURL: process.env.BASE_URL
                }
            });

        } else {
            next(createError(404));
        }
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getDeleteAt = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        const ret = await Paste.deleteOne({
            editSlug: req.params.id
        });

        res.redirect('/');
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getTrends = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        res.redirect("/trends/0");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getTrendsAt = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        const count = await Paste.count({
            exposure: "Public"
        });

        let perPage = Number(setting.trendsMaxNumberPerPage);
        let page = Math.max(0, req.params.id);

        const rows = await Paste.find({
            exposure: "Public"
        },
            null, {
            limit: perPage,
            skip: perPage * page,
            sort: { hits: -1 }
        });

        res.render("index/layout.ejs", {
            child: "index/trends.ejs",
            clientScript: "index/trends.js.ejs",
            data: {
                results: rows,
                count: count,
                pagination: {
                    page: Number(req.params.id) + 1,
                    pageCount: Math.ceil(count / Number(setting.trendsMaxNumberPerPage))
                },
                currentPage: Number(req.params.id),
                pages: Math.ceil(count / Number(setting.trendsMaxNumberPerPage)),
                setting: setting,
                baseURL: process.env.BASE_URL
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getSearch = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        let query = req.query.q;

        const count = await Paste.count({
            exposure: "Public",
            title: { $regex: query, $options: 'i' }
            // $text: { $search: req.query.q }
        });

        let perPage = Number(setting.searchResultsMaxNumberPerPage);
        let page = Math.max(0, req.query.page);

        const rows = await Paste.find({
            exposure: "Public",
            title: { $regex: query, $options: 'i' }
            // $text: { $search: req.query.q }
        },
            null, {
            limit: perPage,
            skip: perPage * page,
            sort: { hits: -1 }
        });

        res.render("index/layout.ejs", {
            child: "index/search.ejs",
            clientScript: "index/search.js.ejs",
            data: {
                results: rows,
                count: count,
                pagination: {
                    page: Number(req.query.page) + 1,
                    pageCount: Math.ceil(count / Number(setting.searchResultsMaxNumberPerPage))
                },
                q: query,
                currentPage: Number(req.query.page),
                pages: Math.ceil(count / Number(setting.searchResultsMaxNumberPerPage)),
                setting: setting,
                baseURL: process.env.BASE_URL
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}