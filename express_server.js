const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const generateRandomString = () => {
  let newString = '';
  const alphaNumeric = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i2 = 0; i2 < 6; i2++) {
    const randomIndex = Math.floor(Math.random() * alphaNumeric.length);
    newString += alphaNumeric[randomIndex];
  }
  return newString;
};

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));


const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': "http://www.google.com",
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("urls"); 
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const urlID = req.params.id;
  delete urlDatabase[urlID];
  res.redirect(`/urls`);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.id];
  res.render('urls_show', { longURL, id } );
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
