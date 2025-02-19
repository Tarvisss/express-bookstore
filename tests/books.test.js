// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");


let testingBooks;

beforeEach(async function() {
    try {
      let result = await db.query(`
        INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) 
        VALUES ('0691161348', 'http://a.co/orPtX2', 'Tarvis', 'dutch', 4, 'Priceon University Press', 'Power-player: Unloking the Hidden Mathematics in Video Games', 2015)
        RETURNING isbn, amazon_url, author, language, pages, publisher, title, year`);
      
      // Store the result for use in the tests
      testingBooks = result.rows[0];
    } catch (err) {
      console.error('Error in beforeEach setup:', err);
    }
  });
  
  afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM books");
  });
  
  afterAll(async function() {
    // close db connection
    await db.end();
  });

///Get Books

describe("GET /books", function() {
    test("Gets a list of books", async function() {
      const response = await request(app).get(`/books`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        books: [testingBooks]
      });
    });
  });


 // get a single book

describe("GET /books/:isbn", function() {
    test("Gets a single book", async function() {
      const response = await request(app).get(`/books/${testingBooks.isbn}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({book: testingBooks});
    });
  
    test("Responds with 404 if can't find book", async function() {
      const response = await request(app).get(`/books/000000000`);
      expect(response.statusCode).toEqual(404);
    });
  });


  // Add a new book

describe("POST /books", function() {
    test("Adds a book to DB", async function() {
      const response = await request(app)
        .post(`/books`)
        .send({
            "isbn": "069116148",
            "amazon_url": "http://a.co/ortX2",
            "author": "Tarvistesting",
            "language": "dutches",
            "pages": 444,
            "publisher": "Priceon University Pressssss",
            "title": "Power-player: Unloking the Hidden Mathematics yo in Video Games",
            "year": 2014
          }
          );
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        book: {
          "isbn": "069116148",
          "amazon_url": "http://a.co/ortX2",
          "author": "Tarvistesting",
          "language": "dutches",
          "pages": 444,
          "publisher": "Priceon University Pressssss",
          "title": "Power-player: Unloking the Hidden Mathematics yo in Video Games",
          "year": 2014
        }
      }
      );
    });
  });

  // update a book

describe("PUT /books/:isbn", function() {
    test("Updates a single book", async function() {
      const response = await request(app)
        .put(`/books/${testingBooks.isbn}`)
        .send({
            "isbn": "0691161348",
            "amazon_url": "http://a.co/ortX223",
            "author": "Tarvistestings",
            "language": "dutchess",
            "pages": 4424,
            "publisher": "Priceon University Pressssssest",
            "title": "Power-player: Unlocking the Hidden Mathematics yo in Video Games",
            "year": 2013
          });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        book: {
        "isbn": "0691161348",
        "amazon_url": "http://a.co/ortX223",
        "author": "Tarvistestings",
        "language": "dutchess",
        "pages": 4424,
        "publisher": "Priceon University Pressssssest",
        "title": "Power-player: Unlocking the Hidden Mathematics yo in Video Games",
        "year": 2013
        }
      });
    });
    
  
    test("Responds with 404 if can't find book", async function() {
      const response = await request(app).patch(`/books/02222222`);
      expect(response.statusCode).toEqual(404);
    });
  });

  // delete a book

describe("DELETE /books/:isbn", function() {
    test("Deletes a single a cat", async function() {
      const response = await request(app)
        .delete(`/books/${testingBooks.isbn}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ message: "Book deleted" });
    });
  });