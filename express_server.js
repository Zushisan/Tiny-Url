/* express_server.js*/
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {

}


app.get("/urls", (req,res) =>{

 let urlDatabase = [
   { url: "http://www.google.ca" },
   { url: "http://www.lighthouse.ca" }
 ];

 res.render('urls_index', {
   key: urlDatabase
 });
});

// app.get("/urls/:id", (req,res) =>{
app.get("/urls/b2xVn2", (req,res) =>{

 // let templateVar = {shortURL: req.params.id};
 // why does above format not work, but below does?
 res.render("urls_show", {shortURL: req.params.id});
 // console.log(req.params.id);

});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});



app.listen(8080);
console.log('8080 is the magic port');
