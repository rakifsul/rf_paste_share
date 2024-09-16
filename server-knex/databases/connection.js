const knex = require("knex");
const knexfile = require("./knexfile");

let knexEnv;
if (process.env.KNEX_ENV === "development") {
    knexEnv = knexfile.development;
} else if (process.env.KNEX_ENV === "staging") {
    knexEnv = knexfile.staging;
} else if (process.env.KNEX_ENV === "production") {
    knexEnv = knexfile.production;
} else {
    throw Error("invalid environment.");
}

const db = knex(knexEnv);

module.exports = db;
