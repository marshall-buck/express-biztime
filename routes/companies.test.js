"use strict";

const request = require("supertest");
const app = require("../app"); 
const db = require("../db");

let testCompany;
let testInvoice;

beforeEach(async function () {
    await db.query("DELETE FROM companies");
    let result = await db.query(`
      INSERT INTO companies (code, name, description)
      VALUES ('AAPL','apple','tech')
      RETURNING code, name, description`);
    testCompany = result.rows[0];
  });

// test we can get all companies
describe("GET /companies", function() {
    test('Gets list of all companies', async function() {
        const resp = await request(app).get('/companies');
        expect(resp.body).toEqual({"companies": [{
            code: testCompany.code,
            name: testCompany.name
        }]})
    })
})

// test we can get a company
// {company: {code, name, description}
describe("GET /companies/:code", function() {
    test('Get one company', async function() {
        const resp = await request(app).get(`/companies/${testCompany.code}`);

        testCompany.invoices = [];

        expect(resp.body).toEqual({
            company: testCompany
        })
    })

    test("Respond with 404 if not found", async function () {
        const resp = await request(app).get(`/companies/0`);
        expect(resp.statusCode).toEqual(404);
    })
})

// test we can add

describe("POST /companies", function () {
    test("Add company", async function () {
      const resp = await request(app)
          .post(`/companies`)
          .send({
            code:'CAT', 
            name:'cat', 
            description:'construction'});
      expect(resp.statusCode).toEqual(201);
      expect(resp.body).toEqual({
        company: {  
            code:'CAT', 
            name:'cat', 
            description:'construction'
        },
      });
    });
  });

// test we can edit

describe("PUT /companies/:code", function () {
    test("Update a single company", async function () {
      const resp = await request(app)
          .put(`/companies/${testCompany.code}`)
          .send({ 
            name: "new cat",
            description: 'new description' });

      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({
        company: {  
            code:'AAPL', 
            name: "new cat",
            description: 'new description'
        }
      });
    });
  
    test("Respond with 404 if not found", async function () {
      const resp = await request(app).patch(`/companies/0`);
      expect(resp.statusCode).toEqual(404);
    });
  });

// test we can delete

describe("DELETE /companies/:code", function () {
    test("Delete a single company", async function () {
      const resp = await request(app)
          .delete(`/companies/${testCompany.code}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({ status: "deleted" });
    });
  });




afterAll(async function () {
    await db.end();
  });


//   describe("GET /items", function() {
//     it("Gets a list of items", async function() {
//       const resp = await request(app).get(`/items`);
//       expect(resp.body).toEqual({ "items" : items });
//     });
//   });