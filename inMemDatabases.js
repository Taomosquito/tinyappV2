const bcrypt = require("bcryptjs");
// Memory based URL Management database (only shows the precoded URLS here)
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "ADMIN",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "ADMIN",
  },
};



// Memory based registered users database (only shows the precoded users {Admin users is good here})
const users = {
  ADMIN: {
    id: "ADMIN",
    email: "a.a@a.a",
    hashedPassword: bcrypt.hashSync('admin', 10) //
  },
  admin2: {
    id: "admin2",
    email: "b.b@b.b",
    hashedPassword: bcrypt.hashSync('admin2', 10) //
  }
};

module.exports = { users, urlDatabase };