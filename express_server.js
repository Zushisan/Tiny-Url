 // express_server.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  secret: "key1",
}))

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Waiting for dynamic URL
var baseURL = process.env.ROOT_URL || 'http://localhost:8080/';

var urlDatabase = [
  //{ shortURL: longURL,
  //    userID: "who created the url" }
  { "b2xVn2": "http://www.google.ca",
      userID: "test" },
  { "9sm5xK": "http://www.lighthouse.ca",
      userID: "test" }
];

const userDatabase = {
  "Jonathan": {
    userID: "Jonathan",
    email: "Jonathan@me.com",
    password: bcrypt.hashSync("password", 10)
  },
  "test": {
    userID: "test",
    email: "test@me.com",
    password: bcrypt.hashSync("1234", 10)
  }
};

// return a filtered database in function of the logged user
function filterDatabase(database, cookie){
  let newObject = [];
  if(cookie !== undefined){
    for(let index in database){
      if(database[index].userID === cookie){
        newObject.push(database[index]);
      }
    }
  }
  return newObject;
}

//Random short url generator
function generateRandomString(longURL, cookie) {
  var randomShortUrl = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    randomShortUrl += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  // push our tinyUrl longUrl pair into the object
  var object = {};
  object[randomShortUrl] = longURL;
  // create a key userID, with the cookie value
  object.userID = cookie;
  urlDatabase.push(object);


  return randomShortUrl;
}

//Random user ID generator
function generateRandomID(userInfo) {
  userInfo.password = bcrypt.hashSync(userInfo.password, 10)
  var randomID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 4; i++){
    randomID += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  var object = userInfo;
  object.userID = randomID;
  userDatabase[randomID] = object;

  return randomID;
}

// redirect
app.get("/", (req,res) =>{
  res.redirect("/urls");
});

// home
app.get("/urls", (req,res) =>{
  let cookie = req.session.user_id
  let newDatabase = filterDatabase(urlDatabase, cookie);
  let templateVar = {
    key: newDatabase,
    userDatabaseKey: userDatabase,
    cookie: req.session.user_id
  };
  res.render('urls_index', templateVar);
});

// page for creating a new shortURL
app.get("/urls/new", (req, res) => {
  let templateVar = {
    userDatabaseKey: userDatabase,
    cookie: req.session.user_id
  };
  let cookie = req.session.user_id;

  for (let key in userDatabase){
   if(userDatabase[cookie]){
     res.render("urls_new", templateVar);
     return
   }
 }
 res.redirect("/login")
});

//gives short url
app.get("/urls/:id", (req, res) => {
  let templateVar = {
    shortURL: req.params.id,
    baseURL: baseURL,
    userDatabaseKey: userDatabase,
    cookie: req.session.user_id
  };

  for(let key in urlDatabase){
    if(urlDatabase[key][req.params.id]){
      if(req.session.user_id === urlDatabase[key].userID){
        res.render('urls_show', templateVar);
        return;
      }
    }
  }
  // if nothing is rendered, 400 not found
  res.status(400).send("Not found");
});

// the short url link that redirects to long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = ""
  let shortURL = req.params.shortURL

  let object = urlDatabase.find(function(u){
    return u[shortURL];
  });
  longURL = object[shortURL];

  res.redirect(longURL);
});

//Registration page
app.get("/register", (req, res) => {
  let templateVar = {
    userDatabaseKey: userDatabase,
    cookie: req.session.user_id
  };

  res.render("register", templateVar);
});

// login page
app.get("/login", (req, res) => {
  let templateVar = {
    userDatabaseKey: userDatabase,
    cookie: req.session.user_id
  };

  res.render("login", templateVar);
});

// Registration Form
app.post('/register', (req, res) => {
  if (req.body.email === "" || req.body.password === ""){
    res.status(400).send("Please enter valid email/password");
    return
  }

  for (let key in userDatabase){
    if (req.body.email === userDatabase[key].email){
      res.status(400).send("Email already in use");
      return;
    }
  }

  let randomID = generateRandomID(req.body);
  req.session.user_id = randomID;

  res.redirect('/urls');
})

// form that generate url
app.post("/urls", (req, res) => {
  let cookie = req.session.user_id;
  let shortURL = generateRandomString(req.body.longURL, cookie);

  res.redirect("/urls");
});

// Delete button
app.post("/urls/:id/delete", (req, res) => {
  let deleteKey = req.params.id;

  for (let i = 0; i < urlDatabase.length; i++){
    if (urlDatabase[i][deleteKey]){
      if(req.session.user_id === urlDatabase[i].userID){
        urlDatabase.splice(i, 1);
      }
    }
  }

 res.redirect("/urls");
});

// Update button
app.post("/urls/:id", (req, res) => {
  let updateValue = req.body.longURL;
  let updateKey = req.params.id;


  for (let i = 0; i < urlDatabase.length; i++){
    if (urlDatabase[i][updateKey]){
      if(req.session.user_id === urlDatabase[i].userID){
        urlDatabase[i][updateKey] = updateValue;
      }
     }
   }

res.redirect("/urls");
});

// Login Form
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPass = req.body.password;

  for (let key in userDatabase){
    if(userDatabase[key].email === userEmail && bcrypt.compareSync(userPass, userDatabase[key].password)){
      req.session.user_id = key;
      console.log(req.session.user_id);
      res.redirect("/urls");
      return
    }
  }

  res.status(403).send("Incorrect credentials")
  return
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.listen(8080);
console.log('8080 is the magic port');
