"use strict";

const express = require("express");
const router = express.Router();
const db = require('../db');
const { NotFoundError, BadRequestError } = require('../expressError');

/** returns JSON object of all companies as {companies: [{code, name}, ...]} */
router.get('/', async function (req, res) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`
  );

  return res.status(200).json({ companies: results.rows });
});



/** get a company by code
 * -returns  {company: {code, name, invoices, description}}
 */
router.get('/:code', async function (req, res, next) {
  const code = req.params.code;
  const results = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
  );
  const company = results.rows[0];


  if (results.rows.length === 0) {
    throw new NotFoundError();
  }

  const invoices = await db.query(`
  SELECT id FROM invoices
  WHERE comp_code = $1`, [req.params.code]);

  company.invoices = invoices.rows.map(e => e.id);

  debugger;


  return res.status(200).json({ company });
});




/** Add a new company.
 * - accepts JSON: {code, name, description}
 * - returns  {company: {code, name, description}} or 404
 */
router.post('/', async function (req, res, next) {
  const { code, name, description } = req.body;

  // wrap in try/catch:

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
    [code, name, description]
  );


  const company = result.rows[0];
  return res.status(201).json({ company });

});



/** Edit a company.
 * - accepts JSON: {name, description}
 * - returns updated company object: {company: {code, name, description}} or 404
 */

router.put('/:code', async function (req, res, next) {
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
      SET name = $1,
          description = $2
          WHERE code = $3
      RETURNING code, name, description`,
    [name, description, req.params.code]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError();
  }

  const company = result.rows[0];
  return res.status(200).json({ company });

});

/** Delete a company.
 * - Returns {status: "deleted"} or 404
 */

router.delete('/:code', async function (req, res, next) {

  const result = await db.query(`DELETE FROM companies
      WHERE code = $1
      RETURNING code, name, description`,
    [req.params.code]
  );


  if (result.rows.length === 0) {
    throw new NotFoundError();
  }

  return res.status(200).json({ status: "deleted" });

});


module.exports = router;