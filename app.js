/**
 * 
 */
var express = require("express");
var app = express();

app.set("view engine", "ejs"); // This line sets the default view wngine 

var http = require('http');
var bodyParser = require("body-parser");
const multer = require('multer'); // file storing middleware
//var formidable = require('formidable');
var fs = require('fs');
app.use(bodyParser.urlencoded({extended:false})); //handle body requests

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

app.get('/item/:id', function(req, res) {
  var p = req.params.id;
  console.log(req.params.id);
  //res.render("item", {products: products});
  res.render("item", {products: products, p: req.params.id});
  //res.render("item"), {p: req.params.id};
  console.log("item page now rendered");    // the log function is used to output data to the terminal. 
});


app.get('/users', function(req, res){
    res.render("users", {users:users});
    console.log("User page now rendered");
});

app.get('/about', function(req, res) {
	res.render('about');
	console.log("about page now rendered");
});

const multerConfig = {
    
storage: multer.diskStorage({
 //Setup where the user's file will go
 destination: function(req, file, next){
   next(null, './public/photo-storage');
   },   
    
    //Then give the file a unique name
    filename: function(req, file, next){
        console.log(file);
        const ext = file.mimetype.split('/')[1];
        next(null, file.fieldname + '-' + Date.now() + '.'+ext);
      }
    }),   
    
    //A means of ensuring only images are uploaded. 
    fileFilter: function(req, file, next){
          if(!file){
            next();
          }
        const image = file.mimetype.startsWith('image/');
        if(image){
          console.log('photo uploaded');
          next(null, true);
        }else{
          console.log("file not supported");
          
          //TODO:  A better message response to user on failure.
          return next();
        }
    }
  };
  

app.get('/upload', function(req, res) {
	res.render('upload');
	console.log("upload page now rendered");
});
app.post('/upload',multer(multerConfig).single('photo'),function(req,res){
   res.send('Complete!');
});

  // This function gets the application up and running on the development server.
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("Yippee its running");
})