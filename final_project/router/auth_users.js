const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Checks if the given username and password match the one we have in records.
 *
 * @param {string} username - The username to check.
 * @param {string} password - The password to check.
 * @return {boolean} true if the username and password match, false otherwise.
 */
const authenticatedUser = (username, password) => {
  //returns boolean
  let user = users.filter((user) => {
    if (user.username === username && user.password === password) {
      return user;
    }
  });
  if (user.length > 0) {
    console.log("found returning true");
    return true;
  } else {
    console.log("not found returning false");
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  let userName = req.body.username;
  console.log(userName);
  let password = req.body.password;
  console.log(password);
  if (!userName || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }
  if (authenticatedUser(userName, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: userName,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken: accessToken,
      username: userName,
    };

    return res.status(200).json({ message: "Successfully logged in" });
  }
  return res.status(200).json({ message: "User Not Found!" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  console.log(req.user);
  let userName = req.user.data;
  let review = req.query.review;
  let isbn = req.params.isbn;
  console.log("books[isbn]", books[isbn]);
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  Object.keys(books).map((key) => {
    if (key == isbn) {
      books[key].reviews[userName] = review;
    }
  });
  console.log(books);
  return res.status(200).json({ message: "Review successfully added" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  console.log(req.user);
  let userName = req.user.data;
  let isbn = req.params.isbn;
  console.log("books[isbn]", books[isbn]);
  let book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  let userReview = book.reviews[userName];
  if (!userReview) {
    return res.status(404).json({ message: "Review not found" });
  }
  delete book.reviews[userName];
  console.log(books);
  return res.status(200).json({ message: "Review successfully deleted!" });
});

module.exports.authenticated = regd_users;
module.exports.users = users;
