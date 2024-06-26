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
  const userList = Object.keys(users);
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(password);
  for (user of userList) {
    // Sad path that checks if the field has been filled out completely
    if (!email || !password) {
      res.status(400)
      return res.send('Incomplete Registration Such As Missing Email Or Password')
     }
    // Sad path that checks if the field has been filled out with new information
     if (users[user].email === email || users[user].password === password){
      res.status(400)
      return res.send('Invalid Registration Such As Used Email Or Password')
     }
    // Happy path the information is both new and fully filled out
    users[userID] = {userID, email, password,};
    res.cookie('user_id', userID);
    res.redirect('/urls')
  }
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
  const userList = Object.keys(users);
  const username = req.body.username;
  const password = req.body.password;
  for (user of userList) {
    // Sad path that checks if the field has been filled out completely
    if (!username || !password) {
      res.status(400)
      return res.send('Incomplete Login Attempt Such As Missing Email Or Password')
    }
    // Happy path the information is both new and fully filled out
    if (users[user].email === username && users[user].password === password){
      res.cookie('username', username);
      res.redirect("/urls");
   }
   res.status(400);
   res.send('Incorrect Login Attempt Such As Missing Email Or Password');
  }

});

// Starts the server with all the  handlers having been set first.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
