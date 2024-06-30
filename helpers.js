// shortened url functionality implemented here
const bcrypt  = require("bcryptjs");

const generateRandomString = () => {
  let newString = '';
  const alphaNumeric = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i2 = 0; i2 < 6; i2++) {
    const randomIndex = Math.floor(Math.random() * alphaNumeric.length);
    newString += alphaNumeric[randomIndex];
  }
  return newString;
};

// Helper Function That does what the name states
const getUserByEmail = (email, users) => {
  for (let userID in users) {

    if (users[userID]['email'] === email) {
      return users[userID];
    }
  }
};

const urlsForUser = (id, urlDatabase) => {
  let userURLs = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userURLs[urlID] = urlDatabase[urlID];
    }
  }
  return userURLs;
};

const validateUserCredentials = (email, password, users, hashedPassword) => {
  const user = getUserByEmail(email, users);
  if (!user) {
    return { isValid: false, error: "Invalid Username or password" };
  }
  if (bcrypt.compareSync(password, hashedPassword)) {
    return { isValid: true, user };
  }
  return { isValid: false, error: "Invalid Username or password" };
};

module.exports = { 
  getUserByEmail, 
  validateUserCredentials, 
  generateRandomString, 
  urlsForUser 
};