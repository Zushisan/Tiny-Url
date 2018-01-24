/* express_server.js*/
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = [
//{ shortURL: longURL},
{ "b2xVn2": "http://www.google.ca" },
{ "9sm5xK": "http://www.lighthouse.ca" }
];


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
//home
app.get("/urls", (req,res) =>{

res.render('urls_index', {
key: urlDatabase
});
});

//form page
app.get("/urls/new", (req, res) => {
res.render("urls_new");
});

//gives short url
app.get("/urls/:id", (req, res) => {
let templateVar = {shortURL: req.params.id};
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
  console.log("long URL: ", longURL)
res.redirect(longURL);
});

//form
app.post("/urls", (req, res) => {
let shortURL = generateRandomString(req.body.longURL);

// res.send("Ok");
res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

// Delete button
app.post("/urls/:id/delete", (req, res) => {
let deleteKey = req.params.id;

for (let i = 0; i < urlDatabase.length; i++){
    if (urlDatabase[i][deleteKey]){
      delete urlDatabase[i][deleteKey];
    }
  }

res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
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
res.redirect("/urls"); // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req, res) => {
let user = req.body.username
console.log("user: ", user)
res.cookie("username", user)
console.log(req.cookies)
res.redirect("/urls")
});


app.listen(8080);
console.log('8080 is the magic port');
