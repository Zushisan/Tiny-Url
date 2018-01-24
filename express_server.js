/* express_server.js*/
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = [
  //{ shortURL: longURL},
  { "b2xVn2": "http://www.google.ca" },
  { "9sm5xK": "http://www.lighthouse.ca" }
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


//Random url generator
function generateRandomString(longURL) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  var object = {};
  object[text] = longURL;
  urlDatabase.push(object);

  return text;
}

//Random user ID generator
function generateRandomID(userInfo) {
  var randomID = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 4; i++){
    randomID += possible.charAt(Math.floor(Math.random() * possible.length));
  }

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
  let templateVar = {
    key: urlDatabase,
    userDatabaseKey: userDatabase,
    cookie: req.cookies["userID"]
  };
  res.render('urls_index', templateVar);
});

//form page
app.get("/urls/new", (req, res) => {
  let templateVar = {
    userDatabaseKey: userDatabase,
    cookie: req.cookies["userID"]
  };
  res.render("urls_new", templateVar);
});

//gives short url
app.get("/urls/:id", (req, res) => {
  let templateVar = {
    shortURL: req.params.id,
    baseURL: baseURL,
    userDatabaseKey: userDatabase,
    cookie: req.cookies["userID"]
 };
  res.render('urls_show', templateVar);
});

//is the short url that redirects to long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = ""
  let shortURL = req.params.shortURL
  console.log("shortURL: ", shortURL)
  for (let i = 0; i < urlDatabase.length; i++){
     if (urlDatabase[i][shortURL]){
       longURL = urlDatabase[i][shortURL];
     }
   }
   console.log("long URL: ", longURL);
 res.redirect(longURL);
});

//Registration page
app.get("/register", (req, res) => {
  let templateVar = {
    userDatabaseKey: userDatabase,
    cookie: req.cookies["userID"]
  };
  res.render("register", templateVar);
});

// login page
app.get("/login", (req, res) => {
  let templateVar = {
    userDatabaseKey: userDatabase,
    cookie: req.cookies["userID"]
  };
  res.render("login", templateVar);
});

// Registration Form
app.post('/register', (req, res) => {
  let randomID = generateRandomID(req.body);
  // if (req.body.email === "" || req.body.password === ""){
  //   res.status(400)
  //   res.send("fefe");
  // }
  // for (let i = 0; i < urlDatabase; i++){
  //   if (req.body.email === urlDatabse[i][email]){
  //     res.status(400);
  //     // .send("Email already in use")
  //   }
  // }

  // else
  res.cookie("userID", randomID);
  res.redirect('/urls');
  console.log(userDatabase);
})

//form that generate url
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(req.body.longURL);
  res.redirect("/urls");
});

// Delete button
app.post("/urls/:id/delete", (req, res) => {
 let deleteKey = req.params.id;
 console.log(req.params.id)
 for (let i = 0; i < urlDatabase.length; i++){
     if (urlDatabase[i][deleteKey]){
       delete urlDatabase[i][deleteKey];
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
       urlDatabase[i][updateKey] = updateValue;
     }
   }
res.redirect("/urls");
});

// Login Form
app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPass = req.body.password;

  // console.log(userEmail);

  for (let key in userDatabase){
    // console.log("I am in the loop", userDatabase[key].email); // go throught each key in database
    if(userDatabase[key].email === userEmail){
      // console.log("I am in the email", key.email); // check for email
      if(userDatabase[key].password === userPass){
        // console.log("I am in the password", key.password); // check for password
        res.cookie("userID", key);
        res.redirect("/urls"); // if everything is good, set cookie
      }                             // else wrong password
    }                             // else register
  }



    // if no password re enter passwrod WRONG

  // else go register
  // res.redirect("/urls");
});

// Logout
app.post("/logout", (req, res) => {
  console.log(req.cookies);
  let user = req.cookies;
  res.clearCookie("userID", user.userID);
  res.redirect("/urls");
});


app.listen(8080);
console.log('8080 is the magic port');
