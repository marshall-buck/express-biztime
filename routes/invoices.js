"use strict";

const express = require("express");
const router = express.Router();
const db = require('../db');
const { NotFoundError } = require('../expressError');
const { route } = require("./companies");



/** return all invoices as JSON {invoices: [{id, comp_code}, ...]} */
router.get('/', async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
      FROM invoices`
  );

  return res.status(200).json({ invoices: results.rows });
});
// GET /invoices/[id]
// Returns obj on given invoice.

/** get invoice by id
 * -return JSON  {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */

router.get('/:id', async function (req, res) {
  const id = req.params.id;
  const invoiceResults = await db.query(`
        SELECT id, amt, paid, add_date, paid_date, comp_code as company
        FROM invoices
        WHERE id = $1
      `, [id]);

  const invoice = invoiceResults.rows[0];
  if (invoice.length === 0) {
    throw new NotFoundError();
  }
  const companyResults = await db.query(`
      SELECT code, name, description
      FROM companies
      WHERE code = $1
    `, [invoice.company]);

  invoice.company = companyResults.rows[0];


  return res.status(200).json({ invoice });



});

/** adds invoice needs JSON body {comp_code, amt}
 * -returns {invoice: {id, comp_code, amt, paid, add_date, paid_date}} or 404 if not found
*/

router.post('/', async function (req, res) {
  const { comp_code, amt } = req.body;
  // TODO try catch
  const result = await db.query(`
      INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date
  `, [comp_code, amt]);


  const invoice = result.rows[0];
  return res.status(201).json({ invoice });
});


// PUT /invoices/[id]
// Updates an invoice.
/** updates invoice needsJSON {amt}
 * -returns  {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put('/:id', async function (req, res) {
  const { amt } = req.body;

  const result = await db.query(
    `UPDATE invoices
      SET amt = $1
      WHERE id = $2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, req.params.id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError();
  }

  const invoice = result.rows[0];
  return res.status(200).json({ invoice });

});



/**deletes invoice
 * -returns {status: "deleted"}
 */
router.delete('/:id', async function (req, res, next) {

  const result = await db.query(`DELETE FROM invoices
      WHERE id = $1
      RETURNING id`,
    [req.params.id]
  );

  // assign rows to a variable and test if falsy
  if (result.rows.length === 0) {
    throw new NotFoundError();
  }

  return res.status(200).json({ status: "deleted" });

});



// Also, one route from the previous part should be updated:

// GET /companies/[code]
// Return obj of company: {company: {code, name, description, invoices: [id, ...]}}

// If the company given cannot be found, this should return a 404 status response.


module.exports = router;