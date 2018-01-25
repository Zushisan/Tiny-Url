/* express_server.js*/
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')

app.use(cookieSession({
  name: 'session',
  secret: "key1",
  // Cookie Options
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
// app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = [
  //{ shortURL: longURL},
  { "b2xVn2": "http://www.google.ca",
      userID: "test" },
  { "9sm5xK": "http://www.lighthouse.ca",
      userID: "test" }
];

const userDatabase = {
  "Jonathan": {
    userID: "Jonathan",
    email: "Jonathan@me.com",
    password: "password"
  },
  "test": {
    userID: "test",
    email: "test@me.com",
    password: "1234"}
};

function filterDatabase(database, cookie){
  let newObject = [];
  // console.log("I am the database: ", database);
  // console.log("I am the cookie: ", cookie);
  if(cookie !== undefined){
    // console.log("I am in the if");
    for(let index in database){
      // console.log("I am database[index]: ", database[index]);
      if(database[index].userID === cookie){
        newObject.push(database[index]);
      }
    }
    // return newObject;
  }
  return newObject;
  // return database;
}

//Random url generator
function generateRandomString(longURL, cookie) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  // push our tinyUrl longUrl pair into the object
  var object = {};
  object[text] = longURL;
  // create a key userID, with the cookie value
  object.userID = cookie;
  // console.log(object.userID);
  urlDatabase.push(object);
  // console.log(urlDatabase);

  return text;
}

//Random user ID generator
function generateRandomID(userInfo) {
  console.log("password before: ", userInfo.password)
  userInfo.password = bcrypt.hashSync(userInfo.password, 10)
  console.log("password after: ", userInfo.password)
  var randomID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 4; i++){
    randomID += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  console.log("userInfo: ", userInfo)
  var object = userInfo;
  object.userID = randomID;
  userDatabase[randomID] = object;

  return randomID
}

var baseURL = process.env.ROOT_URL || 'http://localhost:8080/';

// redirect
app.get("/", (req,res) =>{
  res.redirect("/urls");
});

//home
app.get("/urls", (req,res) =>{
console.log(req)
console.log("-----",req.session)
  let cookie = req.session.user_id
  let newDatabase = filterDatabase(urlDatabase, cookie);

  let templateVar = {
    key: newDatabase,
    userDatabaseKey: userDatabase,
    cookie: req.session.user_id
  };

  res.render('urls_index', templateVar);
});

//form page
app.get("/urls/new", (req, res) => {
  let templateVar = {
    userDatabaseKey: userDatabase,
    cookie: req.session.user_id
  };
  let cookie = req.session.user_id

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

  console.log(req.params.id);
  console.log(urlDatabase)

  for(let key in urlDatabase){
    // console.log("I compare req.params.id: ",req.params.id, " to: ", urlDatabase[key][req.params.id]);
    if(urlDatabase[key][req.params.id]){
      if(req.session.user_id === urlDatabase[key].userID){
        res.render('urls_show', templateVar);
        return;
      }
    }
  }
  res.status(400).send("Not found");
});

//is the short url that redirects to long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = ""
  let shortURL = req.params.shortURL
  // console.log("shortURL: ", shortURL)
  for (let i = 0; i < urlDatabase.length; i++){
     if (urlDatabase[i][shortURL]){
       longURL = urlDatabase[i][shortURL];
     }
   }
   // console.log("long URL: ", longURL);
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
    console.log("compare: ", req.body.email, " to ", userDatabase[key].email)
    if (req.body.email === userDatabase[key].email){
      res.status(400).send("Email already in use")
      return
    }
  }

  let randomID = generateRandomID(req.body);
  req.session.user_id = randomID;
  res.redirect('/urls');
  // console.log(userDatabase);
// }
})

//form that generate url
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
       delete urlDatabase[i][deleteKey];
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
      // res.cookie("userID", key);
      res.redirect("/urls")
      return
    }
  }
  res.status(403).send("Incorrect credentials")
  return
});

// Logout
app.post("/logout", (req, res) => {
  // console.log(req.cookies);
  let user = req.session.user_id;
  req.session = null;
  res.redirect("/urls");
});


app.listen(8080);
console.log('8080 is the magic port');
