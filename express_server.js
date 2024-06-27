// Imports and other setup constants
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());



// shortened url functionality implemented here
const generateRandomString = () => {
  let newString = '';
  const alphaNumeric = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i2 = 0; i2 < 6; i2++) {
    const randomIndex = Math.floor(Math.random() * alphaNumeric.length);
    newString += alphaNumeric[randomIndex];
  }
  return newString;
};



// Sets up resource usage framework such as using ejs over html and ensuring express is human readable
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));



// Memory based URL Management database (only shows the precoded URLS here)
const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': "http://www.google.com",
};



// Memory based registered users database (only shows the precoded users {Admin users is good here})
const users = {
  admin: {
    id: "admin",
    email: "a.a@a.a",
    password: "admin",
  },
  admin2: {
    id: "admin2",
    email: "b.b@b.b",
    password: "admin2",
  }
};



// Helper Function That does what the name states
const getUserByEmail = (email) => {
  for (let userID in users) {

    if (users[userID].email === email) {
      return users[userID];
    }
  }
};

// Function to validate user credentials
const validateUserCredentials = (email, password, users) => {
  const user = getUserByEmail(email, users);
  if (!user) {
    return { isValid: false, error: "Invalid Username or password" };
  }
  if (user.password !== password) {
    return { isValid: false, error: "Invalid Username or password" };
  }
  return { isValid: true, user };
};


// Home route and subsequently not the one controlling the primary functionality
app.get('/', (req, res) => {
  res.send('Hello!');
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
  const { user_id } = req.cookies;
  if (!users[user_id]) {
    return res.redirect('/register');
  }
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render('urls_index', templateVars);
});



// What to do when the new route link is selected
app.get('/urls/new', (req, res) => {
  const { user_id } = req.cookies;
  if (!users[user_id]) {
    return res.redirect('/register');
  }
  const templateVars = { user: users[user_id], urls: urlDatabase };
  res.render('urls_new', templateVars);
});



// Get request redirection to the actual link
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});



// Used with the get request for edit
app.get('/urls/:id', (req, res) => {
  const { user_id } = req.cookies;
  if (!users[user_id]) {
    return res.redirect('/register');
  }
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];
  res.render('urls_show', { longURL, id, user: users[user_id] });
});



// Makes the registration page available
app.get('/register', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = { user };
  res.render('register', templateVars);
});


// Handles the login route
app.get('/login', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = { user };
  res.render('login', templateVars);
});



// Handles the register route
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Incomplete Registration Such As Missing Email Or Password');
  }
  
  const userExists = getUserByEmail(email);
  if (userExists) {
    return res.status(400).send('Account Already Exists');
  }

  const id = generateRandomString();
  users[id] = { id, email, password, };
  res.cookie('user_id', id);
  res.redirect('/urls');
});



// Handle POST requests to /urls
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});



// Handle POST requests to /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});



// First post request catch all behavior
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});



// Post request catch all delete button behavior
app.post('/urls/:id/delete', (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect(`/urls`);
});



// Handle POST requests to /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const { isValid, error, user } = validateUserCredentials(email, password, users);

  if (!isValid) {
    return res.status(403).send(error);
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});



// Starts the server with all the  handlers having been set first.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
