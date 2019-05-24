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

// allow the app to access the all the json files
var products = require("./models/products.json");    
var reviews = require("./models/reviews.json");  
var users = require("./models/users.json");
var contacts = require("./models/contacts.json");

// This function calls the index view when somebody goes to the site - routes.
app.get('/', function(req, res) {
  // renders the index page showing products, reviews annd contacts from json files
  res.render("index", {products:products, reviews:reviews, contacts:contacts});
  console.log("Home page now rendered");    // the log function is used to output data to the terminal. 
});
 
// ---- CRUD functions on products.json
// ---- view all products
app.get('/products', function(req, res) {
  res.render("products", {products:products});
  console.log("Product page now rendered");    // the log function is used to output data to the terminal. 
});

// ---- view one product
app.get('/item/:id', function(req, res) {
  var json = JSON.stringify(products);
  var keyToFind = parseInt(req.params.id); // call name from the url
  var index = products.map(function(products) {return products.id;}).indexOf(keyToFind)
  console.log(req.params.id);
  //parse json info then select the item with correct id 
  res.render("item", {products: products, p: index});
  console.log("item page now rendered");    // the log function is used to output data to the terminal. 
});

// ---- delete one product - how not to do it!
// unreliable as not specific enough and may delete the wrong product
app.delete('delete-item-0/:id', function(req, res) {
 //var deleteCustomer = products["product" + req.params.id];
  var p = req.params.id;
    delete products[p];
    console.log("deleted ", p);
    res.render("products", {products:products});
});

// ---- delete one product
app.get('/delete-item/:id', function(req, res) {
  var json = JSON.stringify(products);
  var keyToFind = parseInt(req.params.id); // get id from the url
    var index = products.map(function(products) {return products.id;}).indexOf(keyToFind)
    products.splice(index ,1); // deletes one item from position represented by index  (its position) from above
    json = JSON.stringify(products, null, 4); //turns it back to json
    fs.writeFile('./models/products.json', json, 'utf8'); // Writing the data back to the file
    console.log("Product Deleted");
  
  res.redirect("/products");
});

// ---- create a product, renders page with form
app.get("/add-item", function(req, res){
    res.render("add-item.ejs");
    console.log("on the add item page!")
});

// ---- create a product function
app.post("/add-item", function(req, res){
    // function to find the max id
  	function getMaxProduct(products , id) {
  		var productMax
  		for (var i=0; i< products.length; i++) {
  			if(!productMax || parseInt(products[i][id]) > parseInt(productMax[id]))
  				productMax = products[i];
    		}
  		return productMax;
  	}
	var maxPID = getMaxProduct(products, "id"); // This calls the function above and passes the result as a variable called maxPID.
	var newProductID = maxPID.id + 1;  // this creates a new variable called newProductID which is the maxPID + 1
	console.log( newProductID); // We console log the new id for show reasons only
    
	// create a new product based on what we have in our form on the add page 
	var newProductInfo = {
    name: req.body.name,  //data from form
    id:  newProductID,    //data from function
    cost: req.body.cost,  //data from form
  };
  console.log(newProductInfo);
  var pjson = JSON.stringify(products); // Convert our json data to a string
  
  // The following function reads the new data and pushes it into our JSON file
  fs.readFile('./models/products.json', 'utf8', function readFileCallback(err, data){
    if(err){
     throw(err);
    } else {
      products.push(newProductInfo); // add the data to the json file based on the declared variable above
      pjson = JSON.stringify(products, null, 4); // converts the data to a json file and the null and 4 represent how it is structuere. 4 is indententation 
      fs.writeFile('./models/products.json', pjson, 'utf8')
    }
  })
  res.redirect("/products");
  console.log("Item added and back to products list"); 
});


// ---- view all contacts in a list 
app.get("/contacts", function(req, res){
    res.render("contacts.ejs", {contacts: contacts});
    console.log("on contacts page!")
});

// ---- add contact page rendered 
app.get("/add-contact", function(req, res){
    res.render("add-contact.ejs");
    console.log("on add contact page!")
});

// ---- create a contact function 
app.post("/add-contact", function(req, res){
    // function to find the max id of objects in json file
  	function getMax(contacts , id) {
  		var max
  		for (var i=0; i<contacts.length; i++) {
  			if(!max || parseInt(contacts[i][id]) > parseInt(max[id]))
  				max = contacts[i];
    		}
    		return max;
  	}
	var maxContactId = getMax(contacts, "id"); // This calls the function above and passes the result as a variable called maxContactId.
	var newMaxID = maxContactId.id + 1;  // this creates a nwe variable called newMaxID which is the max Id + 1
	console.log(newMaxID); // We console log the newMaxID for show reasons only
    
	// create a new contact based on what we have in our form on the add page 
	
	var newContact = {
    name: req.body.name,       //from form
    id: newMaxID,              //from function above
    comment: req.body.comment, //from form
    email: req.body.email      //from form
  };
  console.log(newContact); //show new contact details in console
  var json = JSON.stringify(contacts); // Convert our json data to a string
  
  // The following function reads the new data and pushes it into our JSON file
  fs.readFile('./models/contacts.json', 'utf8', function readFileCallback(err, data){
    if(err){
     throw(err);
    } else {
      contacts.push(newContact); // add the data to the json file based on the declared variable above
      json = JSON.stringify(contacts, null, 4); // converts the data to a json file and the null and 4 represent how it is structuere. 4 is indententation 
      fs.writeFile('./models/contacts.json', json, 'utf8')
    }
  })
  res.redirect("/contacts");
  console.log("Add-contact page rendered and contact added"); 
});

// ---- update a contact
app.get('/edit-contact/:name', function(req, res){
  console.log("edit-contact page renderned");
  function chooseContact(indOne){ 
		return indOne.name === req.params.name;	 		
  }
	
 	var indOne = contacts.filter(chooseContact);
	res.render("edit-contact",{indOne:indOne});
 	console.log(indOne);
});

app.post('/edit-contact/:name', function(req, res){
	var json = JSON.stringify(contacts);
	var keyToFind = req.params.name; // call name from the url

  var index = contacts.map(function(contact) {return contact.name;}).indexOf(keyToFind);
	console.log("index ", index);
	console.log("keyToFind ", keyToFind);
	// console.log("req.body.id ", req.body.id); //testing line
	
	var w = parseInt(req.body.newid); //keeping the var as an int as it would be changed to a string
	var x = req.body.newname;
	var y = req.body.newemail;
	var z = req.body.newcomment;
	
	contacts.splice(index, 1 , {id: w, name: x, email: y, comment: z} );
	json = JSON.stringify(contacts, null, 4);
	fs.writeFile('./models/contacts.json', json, 'utf8'); // Writing the data back to the file
  console.log(w, x, y, z, index);
  res.redirect("/contacts");
});



// ---- read all users
app.get('/users', function(req, res){
    res.render("users", {users:users});
    console.log("User page now rendered");
});

app.get('/about', function(req, res) {
	res.render('about');
	console.log("about page now rendered");
});


// ---- file upload 
// ---- function - specifically an image
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
  
// ---- file upload page rendered
app.get('/upload', function(req, res) {
	res.render('upload');
	console.log("upload page now rendered");
});

// ---- file upload function using multerConfig from above
app.post('/upload',multer(multerConfig).single('photo'),function(req,res){
  res.render("index", {products:products, reviews:reviews, users:users});
  //res.send('Complete!');
});

//file upload end ------------- 
app.get('/download', function(req, res) {
  var file = __dirname +'/public/emer.txt';
	res.download(file);
	console.log("download of txt file");
});

// ---- This function gets the application up and running on the development server.
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("Yippee its running");
})