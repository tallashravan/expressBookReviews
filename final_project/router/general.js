const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  let userName = req.body.username;
  let password = req.body.password;
  if (!userName || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }
  let existingUser = users.filter((user) => {
    if (user.username == userName) {
      return user;
    }
  });
  if (existingUser.length > 0) {
    return res.status(404).json({ message: "User already exists!" });
  }
  users.push({ username: userName, password: password });
  return res
    .status(200)
    .json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const bookPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(books);
    }, 1000);
  });
  bookPromise.then((data) => {
    res.status(200).json(data);
  });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  console.log(isbn);

  const bookPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      let book = books[isbn];
      if (book) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    }, 1000);
  });
  bookPromise
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      res.status(404).json({ message: "Book not found" });
    });
});

/**
 * Finds all books in the book database that match a given attribute and value.
 *
 * @param {string} attrKey - The attribute key to search for. For example, "title" or "author".
 * @param {string} attrValue - The value of the attribute to match. For example, "Pride and Prejudice" or "Jane Austen".
 * @return {array} An array of book objects that match the given attribute and value.
 */
function findBooksByAttribute(attrKey, attrValue) {
  const bookPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      let foundBooks = [];
      Object.keys(books).map((key) => {
        if (new RegExp(attrValue, "i").test(books[key][attrKey])) {
          foundBooks.push(books[key]);
        }
      });

      if (foundBooks.length > 0) {
        return resolve(foundBooks);
      } else {
        return reject("Book not found");
      }
    }, 1000);
  });
  return bookPromise;
}

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  let authorName = req.params.author;
  findBooksByAttribute("author", authorName)
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res
        .status(404)
        .json({ message: "Book with given author not found" });
    });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  let titleInput = req.params.title;

  findBooksByAttribute("title", titleInput)
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((err) => {
      return res
        .status(404)
        .json({ message: "Book with given title not found" });
    });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  let isbn = req.params.isbn;
  Object.keys(books).map((key) => {
    if (key == isbn) {
      return res.status(200).json(books[key].reviews);
    }
  });
  return res.status(404).json({ message: "Book with given isbn not found" });
});

module.exports.general = public_users;
