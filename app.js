/**
 * create products, search functionailty, 
 */
var express = require("express");
var app = express();
app.use(express.static("views"));       // Allow access to content of views folder
app.use(express.static("scripts"));     // Allow access to scripts folder
app.use(express.static("images"));      // Allow access to images folder
app.set("view engine", "ejs"); // This line sets the default view wngine 

var http = require('http');
var bodyParser = require("body-parser");
const multer = require('multer'); // file storing middleware
//var formidable = require('formidable');
var fs = require('fs');
app.use(bodyParser.urlencoded({extended:false})); //handle body requests

var products = require("./models/products.json");    // allow the app to access the products.json file
var reviews = require("./models/reviews.json");  
var users = require("./models/users.json");
var contacts = require("./models/contacts.json");

// This function calls the index view when somebody goes to the site route.
app.get('/', function(req, res) {
  res.render("index", {products:products, reviews:reviews, contacts:contacts});
  console.log("Home page now rendered");    // the log function is used to output data to the terminal. 
});
 

app.get('/products', function(req, res) {
  res.render("products", {products:products});
  console.log("Product page now rendered");    // the log function is used to output data to the terminal. 
});

app.get('/item/:id', function(req, res) {
  var json = JSON.stringify(products);
  var keyToFind = parseInt(req.params.id); // call name from the url
  var index = products.map(function(products) {return products.id;}).indexOf(keyToFind)
  console.log(req.params.id);
  //parse json info then select the item with correct id 
  res.render("item", {products: products, p: index});
  console.log("item page now rendered");    // the log function is used to output data to the terminal. 
});

app.delete('delete-item-0/:id', function(req, res) {
 //var deleteCustomer = products["product" + req.params.id];
  var p = req.params.id;
    delete products[p];
    console.log("deleted ", p);
    res.render("products", {products:products});
});

//liams -  modified by me!
app.get('/delete-item/:id', function(req, res) {
  var json = JSON.stringify(products);
  var keyToFind = parseInt(req.params.id); // call name from the url
    //var data = products; //this declares data = str2
    var index = products.map(function(products) {return products.id;}).indexOf(keyToFind)
    products.splice(index ,1); // deletes one item from position represented by index  (its position) from above
    json = JSON.stringify(products, null, 4); //turns it back to json
    fs.writeFile('./models/products.json', json, 'utf8'); // Writing the data back to the file
    console.log("Product Deleted");
  
  res.redirect("/products");
});

app.get("/add-item", function(req, res){
    res.render("add-item.ejs");
    console.log("on the add item page!")
});

app.post("/add-item", function(req, res){
    // function to find the max id
  	function getPMax(products , id) {
		var pmax
		for (var i=0; i< products.length; i++) {
			if(!pmax || parseInt(products[i][id]) > parseInt(pmax[id]))
				pmax = products[i];
  		}
  		return pmax;
  	}
	var maxPpgp = getPMax(products, "id"); // This calls the function above and passes the result as a variable called maxPpg.
	var newPId = maxPpgp.id + 1;  // this creates a nwe variable called newID which is the max Id + 1
	console.log(newPId); // We console log the new id for show reasons only
    
	// create a new product based on what we have in our form on the add page 
	var productsx = {
    name: req.body.name,
    id: newPId,
    cost: req.body.cost,
  };
  console.log(productsx);
  var pjson = JSON.stringify(products); // Convert our json data to a string
  
  // The following function reads the new data and pushes it into our JSON file
  fs.readFile('./models/products.json', 'utf8', function readFileCallback(err, data){
    if(err){
     throw(err);
    } else {
      products.push(productsx); // add the data to the json file based on the declared variable above
      pjson = JSON.stringify(products, null, 4); // converts the data to a json file and the null and 4 represent how it is structuere. 4 is indententation 
      fs.writeFile('./models/products.json', pjson, 'utf8')
    }
  })
  res.redirect("/products");
  console.log("Item added and back to products list"); 
});
//=====

//   ============== end of product and item functions

// route to render contact info page 
app.get("/contacts", function(req, res){
    res.render("contacts.ejs", {contacts: contacts});
    console.log("on contacts page!")
});

app.get("/add-contact", function(req, res){
    res.render("add-contact.ejs");
    console.log("on add contact page!")
});

// route to render contact info page 
app.post("/add-contact", function(req, res){
    // function to find the max id
  	function getMax(contacts , id) {
		var max
		for (var i=0; i<contacts.length; i++) {
			if(!max || parseInt(contacts[i][id]) > parseInt(max[id]))
				max = contacts[i];
  		}
  		return max;
  	}
	var maxPpg = getMax(contacts, "id"); // This calls the function above and passes the result as a variable called maxPpg.
	var newId = maxPpg.id + 1;  // this creates a nwe variable called newID which is the max Id + 1
	console.log(newId); // We console log the new id for show reasons only
    
	// create a new product based on what we have in our form on the add page 
	
	var contactsx = {
    name: req.body.name,
    id: newId,
    comment: req.body.comment,
    email: req.body.email
  };
  console.log(contactsx);
  var json = JSON.stringify(contacts); // Convert our json data to a string
  
  // The following function reads the new data and pushes it into our JSON file
  fs.readFile('./models/contacts.json', 'utf8', function readFileCallback(err, data){
    if(err){
     throw(err);
    } else {
      contacts.push(contactsx); // add the data to the json file based on the declared variable above
      json = JSON.stringify(contacts, null, 4); // converts the data to a json file and the null and 4 represent how it is structuere. 4 is indententation 
      fs.writeFile('./models/contacts.json', json, 'utf8')
    }
  })
  res.redirect("/contacts");
  console.log("Add-contact page rendered and contact added"); 
});
//=====

app.get('/users', function(req, res){
    res.render("users", {users:users});
    console.log("User page now rendered");
});

app.get('/about', function(req, res) {
	res.render('about');
	console.log("about page now rendered");
});


//file upload ---------------
const multerConfig = {
    
storage: multer.diskStorage({
 //Setup where the user's file will go
 destination: function(req, file, next){
   next(null, './public/photo-storage');
   },   
    
    //Then give the file a unique name
    filename: function(req, file, next){
        console.log(file);
        //get the file mimetype ie 'image/jpeg' split and prefer the second value ie'jpeg'
        const ext = file.mimetype.split('/')[1];
        //set the file fieldname to a unique name containing the original name, current datetime and the extension.
        next(null, file.fieldname + '-' + Date.now() + '.'+ext);
      }
    }),   
    
    //A means of ensuring only images are uploaded. 
    fileFilter: function(req, file, next){
          if(!file){
            next();
          }
        // only permit image mimetypes
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
  res.render("index", {products:products, reviews:reviews, users:users});
  //res.send('Complete!');
});

//file upload end ------------- 


// This function gets the application up and running on the development server.
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("Yippee its running");
})