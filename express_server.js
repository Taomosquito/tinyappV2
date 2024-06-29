// Imports and other setup constants
const express = require('express');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// sample hashing use for implementation later in code.
const password = "purple-monkey-dinosaur"; // find actual in the req.body object
const hashedPasswordExample = bcrypt.hashSync(password, 10);
bcrypt.compareSync("purple-monkey-dinosaur", hashedPasswordExample); // returns true


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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "ADMIN",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "ADMIN",
  },
};

const urlsForUser = (id) => {
  let userURLs = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userURLs[urlID] = urlDatabase[urlID];
    }
  }
  return userURLs;
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



// Helper Function That does what the name states
const getUserByEmail = (email) => {
  for (let userID in users) {

    if (users[userID].email === email) {
      return users[userID];
    }
  }
};

// Function to validate user credentials
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
app.get("/urls", (req, res) => {
  // const userID = req.session.user_id; // Assuming you're using session cookies
  const userID = req.cookies.user_id;  
  if (!userID) {
  return res.status(403).send("You must be logged in to view URLs.");
  }
  const userURLs = urlsForUser(userID);
  const templateVars = { urls: userURLs, user: users[userID] };
  res.render("urls_index", templateVars);
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
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});



// Used with the get request for edit
app.get('/urls/:id', (req, res) => {
  const { user_id } = req.cookies;
  if (!users[user_id]) {
    return res.redirect('/register');
  }
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id].longURL;
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

  const hashedPassword = bcrypt.hashSync(password, 10);
  
  const id = generateRandomString();
  users[id] = { id, email, hashedPassword, };
  res.cookie('user_id', id);
  res.redirect('/urls');
});



// Handle POST requests to /urls
app.post('/urls', (req, res) => {
  const userId = req.cookies['user_id'];

  if (!userId || !users[userId]) {
    console.log('User is not authenticated, redirecting to login');
    return res.redirect('/login');
  }

  const longURL = req.body.longURL;
  if (!longURL) {
    return res.status(400).send('URL is required.');
  }

  const id = generateRandomString();
  urlDatabase[id] = { longURL, userID: userId};
  res.redirect(`/urls/${id}`);
});



// Handle POST requests to /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});



// First post request catch all behavior
app.post('/urls/:id', (req, res) => {
  const user = users[req.cookies['user_id']];
  if (!user){
    return res.redirect(`/login`);
  };
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});



// Post request catch all delete button behavior
app.post('/urls/:id/delete', (req, res) => {
  const user = users[req.cookies['user_id']];
  if (!user){
    return res.redirect(`/login`);
  };
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect(`/urls`);
});



// Handle POST requests to /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  const storedHashedPassword = user.hashedPassword;

  if (!user) {
    return res.status(403).send("Invalid Username or password");
  }
  const { isValid, error } = validateUserCredentials(email, password, users, storedHashedPassword);
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
