const express = require('express');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const randomstring = require("randomstring");
const fs = require("fs");
const Joi = require('joi');
const helper = require("../lib/helper");
const db = require('../models');
const router = express.Router();

let timeoutContainer = [];

router.get("/", async function (req, res) {
  //200
  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

  const pastes = await db.Paste.findAll({
    where: {
      exposure: "Public"
    },
    order: [
      ['createdAt', 'DESC']
    ],
    limit: Number(config.recentPastesMaxNumber)
  });

  res.render("index/layout", {
    child: "index/index",
    data: {
      results: pastes,
      siteTitle: config.siteTitle,
      baseURL: config.baseURL,
      siteDesc: config.siteDesc,
      errors: req.flash('errors')
    }
  });
});

router.post("/", async function (req, res) {
  //200
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

  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

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

  try {
    const paste = await db.Paste.create({
      title: pasteTitle ? pasteTitle : "Untitled",
      content: pasteContent,
      expiry: pasteExpiry,
      exposure: pasteExposure,
      slug: generatedPasteID,
      editSlug: generatedEditID,
      hits: 0
    });

    const pasteCreated = await db.PasteCreated.create({
    });

    let timeo = setTimeout(async function () {
      console.log("deleting the row automatically...");

      const ret = await db.Paste.destroy({
        where: {
          editSlug: generatedEditID
        }
      });

      console.log("deleted the row automatically...");
    }, helper.textToMS(pasteExpiry));

    timeoutContainer[generatedEditID] = timeo;

    res.redirect("/edit/" + generatedEditID);
  } catch (err) {
    res.send("Exception");
  }
});

router.get("/edit/:id", async function (req, res) {
  //200
  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

  try {
    const paste = await db.Paste.findOne({
      where: {
        editslug: req.params.id
      }
    });

    if (paste) {
      res.render("index/layout", {
        child: "index/edit",
        data: {
          result: paste,
          siteTitle: config.siteTitle,
          baseURL: config.baseURL,
          siteDesc: config.siteDesc,
          errors: req.flash('errors')
        }
      });
    } else {
      res.send("Data not found");
    }
  } catch (err) {
    res.send("Exception");
  }
});

router.post("/edit", async function (req, res) {
  //200
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

  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

  let editSlugParts = req.get("referer").split("/");
  let lastEditSlugParts = editSlugParts[editSlugParts.length - 1];

  const { pasteTitle, pasteContent, pasteExpiry, pasteExposure } = req.body;

  const ret = await db.Paste.update({
    title: pasteTitle ? pasteTitle : "Untitled",
    content: pasteContent,
    expiry: pasteExpiry,
    exposure: pasteExposure
  }, {
    where: {
      editSlug: lastEditSlugParts
    }
  });

  clearTimeout(timeoutContainer[lastEditSlugParts]);

  let timeo = setTimeout(async function () {
    console.log("deleting the row automatically...");

    const ret = await db.Paste.destroy({
      where: {
        editSlug: lastEditSlugParts
      }
    });

    console.log("deleted the row automatically...");
  }, helper.textToMS(pasteExpiry));

  timeoutContainer[lastEditSlugParts] = timeo;

  res.redirect(req.get("referer"));
});

router.get("/view/:id", async function (req, res) {
  //200
  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

  try {
    const paste = await db.Paste.findOne({
      where: {
        slug: req.params.id
      }
    });

    if (paste) {
      const ret = await db.Paste.update({
        hits: paste.hits + 1
      }, {
        where: {
          id: paste.id
        }
      });

      res.render("index/layout", {
        child: "index/view",
        data: {
          result: paste,
          siteTitle: config.siteTitle,
          baseURL: config.baseURL,
          siteDesc: config.siteDesc
        }
      });

    } else {
      res.send("Data not found");
    }
  } catch (err) {
    res.send("Exception");
  }
});

router.get("/delete/:id", async function (req, res) {
  //200
  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

  const ret = await db.Paste.destroy({
    where: {
      editSlug: req.params.id
    }
  });

  res.redirect(config.baseURL);
});

router.get("/trends", function (req, res) {
  //200
  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

  res.redirect(config.baseURL + "/trends/0");
});

router.get("/trends/:id", async function (req, res) {
  //200
  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

  const fetched = await db.Paste.findAndCountAll({
    where: {
      exposure: "Public"
    },
    order: [
      ['hits', 'DESC']
    ],
    offset: Number(config.trendsMaxNumberPerPage) * Number(req.params.id),
    limit: Number(config.trendsMaxNumberPerPage)
  });

  res.render("index/layout", {
    child: "index/trends",
    data: {
      results: fetched.rows,
      count: fetched.count,
      pagination: {
        page: Number(req.params.id) + 1,
        pageCount: Math.ceil(fetched.count / Number(config.trendsMaxNumberPerPage))
      },
      currentPage: Number(req.params.id),
      pages: Math.ceil(fetched.count / Number(config.trendsMaxNumberPerPage)),
      siteTitle: config.siteTitle,
      baseURL: config.baseURL,
      siteDesc: config.siteDesc
    }
  });
});

router.get("/search", async function (req, res) {
  //200
  const config = JSON.parse(fs.readFileSync("settings.json", "utf8"));

  let query = req.query.q;

  const fetched = await db.Paste.findAndCountAll({
    where: {
      title: {
        [Op.like]: `%${query}%`
      }
    },
    order: [
      ['hits', 'DESC']
    ],
    offset: Number(config.searchResultsMaxNumberPerPage) * Number(req.query.page),
    limit: Number(config.searchResultsMaxNumberPerPage)
  });

  res.render("index/layout", {
    child: "index/search",
    data: {
      results: fetched.rows,
      count: fetched.count,
      pagination: {
        page: Number(req.query.page) + 1,
        pageCount: Math.ceil(fetched.count / Number(config.searchResultsMaxNumberPerPage))
      },
      q: query,
      currentPage: Number(req.query.page),
      pages: Math.ceil(fetched.count / Number(config.searchResultsMaxNumberPerPage)),
      siteTitle: config.siteTitle,
      baseURL: config.baseURL,
      siteDesc: config.siteDesc
    }
  });
});


module.exports = router;
