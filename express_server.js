/* express_server.js*/
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

 let urlDatabase = [
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

app.get("/urls", (req,res) =>{

 res.render('urls_index', {
   key: urlDatabase
 });
});

// app.get("/urls/:id", (req,res) =>{
// app.get(`/urls/${shortURL}`, (req,res) =>{

//  // let templateVar = {shortURL: req.params.id};
//  // why does above format not work, but below does?
//  res.render("urls_show");
//  // console.log(req.params.id);
// // , {shortURL: req.params.id}
// });
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  // console.log(req.body);
  res.render('urls_show');


  // let resObj = res.json(urlDatabase.b2xVn2);
  // console.log(typeof resObj);
  // let longURL = ...
  // res.redirect(longURL);
});




app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(req.body.longURL);
  // console.log(urlDatabase);                          // debug statement to see POST parameters
  // res.send("Ok");
  res.redirect(`http://localhost:8080/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});



app.listen(8080);
console.log('8080 is the magic port');
