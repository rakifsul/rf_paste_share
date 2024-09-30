const bcrypt = require("bcryptjs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable("admins", function (table) {
            table.increments("_id");
            table.string("name", 1000).notNullable();
            table.string("email", 1000).notNullable();
            table.string("password", 1000).notNullable();
            table.timestamps(true, true, true);
        })
        .createTable("pastes", function (table) {
            table.increments("_id");
            table.string("title", 1000).notNullable();
            table.text("content", "text");
            table.string("expiry", 1000).notNullable();
            table.string("exposure", 1000).notNullable();
            table.string("slug", 1000).notNullable();
            table.string("editSlug", 1000).notNullable();
            table.integer("hits").notNullable();
            table.timestamps(true, true, true);
        })
        .createTable("pastecreateds", function (table) {
            table.increments("_id");
            table.timestamps(true, true, true);
        })
        .createTable("settings", function (table) {
            table.increments("_id");
            table.string("siteTitle", 1000).notNullable();
            table.string("siteSEOTitle", 1000).notNullable();
            table.text("siteDescription", "text");
            table.text("siteSEODescription", "text");
            table.integer("recentPastesMaxNumber").notNullable().defaultTo(4);
            table.integer("trendsMaxNumberPerPage").notNullable().defaultTo(4);
            table
                .integer("searchResultsMaxNumberPerPage")
                .notNullable()
                .defaultTo(4);
            table.timestamps(true, true, true);
        })
        .then(() => {
            return knex("admins").insert([
                {
                    name: "admin",
                    email: "admin@example.com",
                    password: bcrypt.hashSync("admin", 12),
                },
            ]);
        })
        .then(() => {
            return knex("settings").insert([
                {
                    siteTitle: "RF Paste Share",
                    siteSEOTitle:
                        "RF Paste Share - Blog CMS, Dibuat Menggunakan Node.js",
                    siteDescription:
                        "RF Paste Share adalah aplikasi web untuk membuat blog...",
                    siteSEODescription:
                        "RF Paste Share adalah aplikasi web untuk membuat blog...",
                    recentPastesMaxNumber: 4,
                    trendsMaxNumberPerPage: 4,
                    searchResultsMaxNumberPerPage: 4,
                },
            ]);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTable("filefiletags")
        .dropTable("filetags")
        .dropTable("files")
        .dropTable("settings")
        .dropTable("menus")
        .dropTable("articlearticletags")
        .dropTable("articletags")
        .dropTable("articles")
        .dropTable("admins");
};
