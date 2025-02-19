const express = require("express");
const Book = require("../models/book");

const router = new express.Router();
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json");
const { error } = require("locus/src/print");


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {

    const validateBook = jsonschema.validate(req.body, bookSchema);
    if (validateBook.valid === false){
      const errors = validateBook.errors.map(error => error.stack).join(", ");
      return res.status(400).json({ error: errors});

    }
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const validBook = jsonschema.validate(req.body, bookSchema);
    if (validBook.valid === false){
      const errors = validBook.errors.map(error => error.stack).join(", ");
      return res.status(400).json({error: errors});
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
