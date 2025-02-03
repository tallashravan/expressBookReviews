const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    let accessToken = req.session.authorization["accessToken"];
    jwt.verify(accessToken, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        res.send("User Not Logged In");
      }
    });
  } else {
    res.send("Missing User Creds!");
  }
});

const PORT = 5002;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
