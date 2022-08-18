"use strict";

const express = require("express");
const router = express.Router();
const db = require('../db');
const { NotFoundError } = require('../expressError');

/** returns JSON object of all companies as {companies: [{code, name}, ...]} */
router.get('/', async function (req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`
  );

  return res.status(200).json({ companies: results.rows });
});



/** get a company by code
 * -returns  {company: {code, name, description}}
 */
router.get('/:code', async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
  );
  debugger;
  if (results.rows.length === 0) {
    throw new NotFoundError();
  }


  return res.status(200).json({ company: results.rows[0] });
});

// If the company given cannot be found, this should return a 404 status response.

// POST /companies
// Adds a company.

// Needs to be given JSON like: {code, name, description}

// Returns obj of new company: {company: {code, name, description}}

// PUT /companies/[code]
// Edit existing company.

// Should return 404 if company cannot be found.

// Needs to be given JSON like: {name, description}

// Returns update company object: {company: {code, name, description}}

// DELETE /companies/[code]
// Deletes company.

// Should return 404 if company cannot be found.

// Returns {status: "deleted"}




module.exports = router;