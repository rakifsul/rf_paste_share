const express = require('express');
const fs = require("fs");
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const router = express.Router();
const db = require('../models');

const sessionChecker = async (req, res, next) => {
    //200
    if (req.session.user) {
        const user = await db.User.findOne({
            where: {
                email: req.session.user.email
            }
        });

        if (user) {
            res.redirect("/admin");
        } else {
            next();
        }
    } else {
        next();
    }
};

router.get("/login", sessionChecker, function (req, res) {
    //200
    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    res.render("auth/login", {
        data: {
            siteTitle: config.siteTitle,
            baseURL: config.baseURL,
            siteDesc: config.siteDesc,
            errors: req.flash('errors')
        }
    });
});

router.post("/login", async function (req, res) {
    //200
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });

    const validObj = schema.validate(req.body);
    if (validObj.error) {
        req.flash("errors", validObj.error.details);
        res.status(422).redirect("/auth/login");
        res.end();
        return;
    }

    const { email, password } = req.body;

    const user = await db.User.findOne({
        where: {
            email: email
        }
    });

    if (user) {
        if (email == user.email) {
            if (bcrypt.compareSync(password, user.password) == true) {
                req.session.user = {
                    email: user.email
                };
                res.redirect("/admin");
            } else {
                res.redirect("/auth/login");
            }
        } else {
            res.redirect("/auth/login");
        }
    } else {
        res.redirect("/auth/login");
    }
});

router.get("/register", function (req, res) {
    //200
    const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

    res.render("auth/register", {
        data: {
            siteTitle: config.siteTitle,
            baseURL: config.baseURL,
            siteDesc: config.siteDesc,
            errors: req.flash('errors')
        }
    });
});

router.post("/register", async function (req, res) {
    //200
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
        password_repeat: Joi.ref('password')
    }).with('password', 'password_repeat');;

    const validObj = schema.validate(req.body);
    if (validObj.error) {
        console.log(validObj.error.details);
        req.flash("errors", validObj.error.details);
        res.status(422).redirect("/auth/register");
        res.end();
        return;
    }

    const { email, password } = req.body;
    try {
        const user = await db.User.create({
            email: email,
            password: bcrypt.hashSync(password, 12)
        });

        res.redirect("/auth/login");
    } catch (err) {
        res.end("Exception: " + err);
    }
});

router.get("/logout", function (req, res) {
    //200
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
});

module.exports = router;
