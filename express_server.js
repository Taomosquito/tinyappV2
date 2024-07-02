// Imports and other setup constants
const express = require('express');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const {
  getUserByEmail,
  validateUserCredentials,
  generateRandomString,
  urlsForUser
} = require('./helpers');
const { users, urlDatabase } = require('./inMemDatabases');

app.use(cookieSession({
  name: 'session',
  keys: ['s1e2s3s4i5o6n7'],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



// Sets up resource usage framework such as using ejs over html and ensuring express is human readable
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));



// Home route and subsequently not the one controlling the primary functionality
app.get('/', (req, res) => {
  const userId = req.session.user_id;

  if (!userId || !users[userId]) {
    console.log('User is not authenticated, redirecting to login');
    return res.redirect('/login');
  }

  res.redirect('/urls');
});



// Makes a json of the database object as referenced above
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});



// Advancerd functionality of the home routes behavior
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});



// What do to when the sites primary resource received a get request through this route handler
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.status(403).send("You must be logged in to view URLs.");
  }

  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = { urls: userURLs, user: users[userID] };
  res.render("urls_index", templateVars);
});


// What to do when the new route link is selected
app.get('/urls/new', (req, res) => {
  const { user_id } = req.session;
  if (!users[user_id]) {
    return res.redirect('/register');
  }

  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render('urls_new', templateVars);
});



app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!url) {
    return res.send('Url not found');
  }

  const longURL = url.longURL;
  res.redirect(longURL);
});



// Used with the get request for edit
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];
  if (!url) {
    return res.send('Url not found');
  }

  const { user_id } = req.session;
  if (!users[user_id]) {
    return res.send("You must be logged in to view URLs.");
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.render('urls_show', { longURL, id, user: users[user_id] });
});



// Makes the registration page available
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  res.render('register', templateVars);
});


// Handles the login route
app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user };
  res.render('login', templateVars);
});



// Handles the register route
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Incomplete Registration Such As Missing Email Or Password');
  }

  const userExists = getUserByEmail(email, users);
  if (userExists) {
    return res.status(400).send('Account Already Exists');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const id = generateRandomString();
  users[id] = { id, email, hashedPassword, };
  req.session.user_id = users[id].id;
  res.redirect('/urls');
});



// Handle POST requests to /urls
app.post('/urls', (req, res) => {
  const userId = req.session.user_id;

  if (!userId || !users[userId]) {
    return res.send('User is not authenticated, redirect to login');
  }

  const longURL = req.body.longURL;
  if (!longURL) {
    return res.status(400).send('URL is required.');
  }

  const id = generateRandomString();
  urlDatabase[id] = { longURL, userID: userId };
  res.redirect(`/urls/${id}`);
});



// Handle POST requests to /logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/login");
});



// First post request catch all behavior
app.post('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect(`/login`);
  };

  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});



// Post request catch all delete button behavior
app.post('/urls/:id/delete', (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.redirect(`/login`);
  };

  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect(`/urls`);
});



// Handle POST requests to /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user1 = getUserByEmail(email, users);

  if (!user1) {
    return res.status(403).send("Invalid Username or password");
  }

  const storedHashedPassword = user1.hashedPassword;
  const { isValid, error } = validateUserCredentials(email, password, users, storedHashedPassword);
  if (!isValid) {
    return res.status(403).send(error);
  }

  req.session.user_id = user1.id;
  res.redirect('/urls');
});



// Starts the server with all the  handlers having been set first.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
