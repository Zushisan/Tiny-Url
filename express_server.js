/* express_server.js*/
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

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

app.listen(8080);
console.log('8080 is the magic port');
