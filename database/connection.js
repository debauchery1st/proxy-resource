const knex = require("knex");

const knexConfig = require("../knexfile.js");

const db_env = process.env.NODE_ENV || "production";

module.exports = knex(knexConfig[db_env]);
