"use strict";
/** Database setup for BizTime. */

const { Client } = require("pg");

/** MAC EDITION */
const DB_URI = process.env.NODE_ENV === "test"
  ? "postgresql:///biztime_test" : "postgresql:///biztime";


/** WINDOWS EDITION */
// const DB_URI = process.env.NODE_ENV === "test"
//   ? "postgresql://esoun:esoun@localhost/biztime_test" : "postgresql://esoun:esoun@localhost/biztime";

let db = new Client({ connectionString: DB_URI }); db.connect();

module.exports = db;
