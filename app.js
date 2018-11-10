/**
 * 
 */
var express = require("express");
var app = express();

app.set("view engine", "ejs"); // This line sets the default view wngine 

var http = require('http');
var bodyParser = require("body-parser");
var fs = require('fs');


app.use(express.static("views"));       // Allow access to content of views folder
app.use(express.static("scripts"));     // Allow access to scripts folder
app.use(express.static("images"));      // Allow access to images folder


var products = require("./models/products.json");    // allow the app to access the products.json file
var reviews = require("./models/reviews.json");  
var users = require("./models/users.json");

// This function calls the index view when somebody goes to the site route.
app.get('/', function(req, res) {
  res.render("index", {products:products, reviews:reviews, users:users});
  console.log("Home page now rendered");    // the log function is used to output data to the terminal. 
});
 
app.get('/products', function(req, res) {
  res.render("products", {products:products});
  console.log("Product page now rendered");    // the log function is used to output data to the terminal. 
});

app.get('/users', function(req, res){
    res.render("users", {users:users});
    console.log("User page now rendered");
});

app.get('/about', function(req, res) {
	res.render('about');
	console.log("about page now rendered");
});




  // This function gets the application up and running on the development server.
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("Yippee its running");
})