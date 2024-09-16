// Update with your config settings.
require("dotenv").config({
    path: "../.env",
});

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
    development: {
        client: "mysql2",
        connection: {
            host: process.env.KNEX_DEV_HOST,
            port: process.env.KNEX_DEV_PORT,
            user: process.env.KNEX_DEV_USER,
            password: process.env.KNEX_DEV_PASSWORD,
            database: process.env.KNEX_DEV_DATABASE,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },

    staging: {
        client: "mysql2",
        connection: {
            host: process.env.KNEX_STG_HOST,
            port: process.env.KNEX_STG_PORT,
            user: process.env.KNEX_STG_USER,
            password: process.env.KNEX_STG_PASSWORD,
            database: process.env.KNEX_STG_DATABASE,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },

    production: {
        client: "mysql2",
        connection: {
            host: process.env.KNEX_PROD_HOST,
            port: process.env.KNEX_PROD_PORT,
            user: process.env.KNEX_PROD_USER,
            password: process.env.KNEX_PROD_PASSWORD,
            database: process.env.KNEX_PROD_DATABASE,
        },
        migrations: {
            tableName: "knex_migrations",
        },
    },
};
