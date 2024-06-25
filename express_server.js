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
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// What to do when the new route link is selected
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_new', templateVars);
});

// Get request redirection to the actual link
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Used with the get request for edit
app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];
  const username = req.cookies["username"]
  res.render('urls_show', { longURL, id, username });
});

// Makes the registration page available
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
})

// Handle POST requests to /urls
app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});


// Handle POST requests to /logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
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
  const username = req.body.username;
  console.log(username);
  res.cookie('username', username);
  res.redirect("/urls");
});

// Starts the server with all the  handlers having been set first.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
