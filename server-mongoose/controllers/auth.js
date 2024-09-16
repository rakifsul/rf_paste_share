const fs = require("fs");
const createError = require('http-errors');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const Admin = require("../models/admin");
const Setting = require('../models/setting');

module.exports.getLogin = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        res.render("auth/layout.ejs", {
            child: "auth/login.ejs",
            clientScript: "auth/login.js.ejs",
            data: {
                setting: setting,
                errors: req.flash('errors')
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.postLogin = async function (req, res, next) {
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

    try {
        const admin = await Admin.findOne({
            email: email
        });

        if (admin) {
            if (email == admin.email) {
                if (bcrypt.compareSync(password, admin.password) == true) {
                    req.session.isLoggedIn = true;
                    req.session.admin = admin;
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
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getRegister = async function (req, res, next) {
    try {
        const setting = await Setting.findOne({});

        res.render("auth/layout.ejs", {
            child: "auth/register.ejs",
            clientScript: "auth/register.js.ejs",
            data: {
                setting: setting,
                errors: req.flash('errors')
            }
        });
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.postRegister = async function (req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        name: Joi.string().required(),
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

    const { email, name, password } = req.body;
    try {
        let admin = new Admin({
            email: email,
            name: name,
            password: bcrypt.hashSync(password, 12)
        });

        await admin.save();

        res.redirect("/auth/login");
    } catch (err) {
        console.log(err);
        next(createError(500));
    }
}

module.exports.getLogout = async function (req, res, next) {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}