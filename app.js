/**
 * create products, search functionailty, 
 */

var express = require("express");
var app = express();

app.use(express.static("views"));       // Allow access to content of views folder
app.use(express.static("scripts"));     // Allow access to scripts folder
app.use(express.static("images"));      // Allow access to images folder
app.set("view engine", "ejs"); // This line sets the default view wngine 

require('dotenv').config(); //for creating environment variables in the .env file used for DB connection

var mysql       = require('mysql');
var http        = require('http');
var bodyParser  = require("body-parser"); //allows req.body.id etc
const multer    = require('multer'); // file storing middleware
var fs          = require('fs');
var flash = require('connect-flash');
app.use(bodyParser.urlencoded({extended:false})); //handle body requests
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// allow the app to access the all the json files
var products  = require("./models/products.json");    
var reviews   = require("./models/reviews.json");  
var users     = require("./models/users.json");
var contacts  = require("./models/contacts.json");

//
console.log('current: ' + new Date(Date.now()).toLocaleString());    //testing by sending current timestamp to console
var wstream = fs.createWriteStream('./logs/logger.txt');    //create a log of activity with current timestamp in a file called logger.txt
wstream.write('Log file\n');
//wstream.end();
var logger = require("./logs/logger.txt"); 
 
//my gearhost MYSQL db credentials to create a connection.
//using https://codeburst.io/how-to-easily-set-up-node-environment-variables-in-your-js-application-d06740f9b9bd
//to create a gitignore to secure my DB credentials which are environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true //this allows for multiple sql statements in 1 function
});

//start my connection to my database
db.connect(function (err){
 if(!err){
  console.log("DB connected");
  wstream.write('\nConnected to gearhost DB... today');
 }else{
  console.log("Error in connecting DB");
  wstream.write('\nerror connecting to gearhost db');
 }
});

var message = " ";
// This function calls the index view when somebody goes to the site - routes.
app.get('/', function(req, res) {
  // renders the index page showing products, reviews annd contacts from json files
  res.render("index", {products:products, reviews:reviews, contacts:contacts, message: 'Im back'});
  console.log("Home page now rendered");    // the log function is used to output data to the terminal. 
});
 
// ---- CRUD functions on SQL table
// ---- create the table, only need to run the URL onetime manually
app.get('/create-products-table', function(req, res) {
    db.query('DROP TABLE IF EXISTS products_ejs; SELECT * FROM users; CREATE TABLE products_ejs ( Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Name varchar(255), Price decimal(5, 2), Descript varchar(255), Image varchar(255));', [1, 2], function(err, results){
        if (err) throw err;
        // `results` is an array with one element for every statement in the query:
        //console.log(results[0]); // [{1: 1}]
        //console.log(results[1]); // [{2: 2}]
        var res1 = results[0];
        var res2 = results[1];
        wstream.write('\ntable created products_ejs' + new Date(Date.now()).toLocaleString());
        //res.send("Well done products table created...");
        console.log("Well done products table created...");
        res.redirect('/', 202, { message: 'Table products_ejs created in gearhost'});
    
        //res.render('products.ejs', {res1, res2, reviews, title: 'Products listing', messages: ''});
       // wstream.write('\nall product listing and JSON reviews display' + new Date(Date.now()).toLocaleString());
    });
//  let sql = 'CREATE TABLE products_ejs ( Id int NOT NULL AUTO_INCREMENT PRIMARY KEY, Name varchar(255), Price decimal(5, 2), Descript varchar(255), Image varchar(255));';
//     let query = db.query(sql, (err, res) => {
//       if(err) throw err;
//       console.log(res);
//       });
//     wstream.write('\nproduct table created on the db');
//     res.send("Well done products table created...");
});

//--------------PRODUCT CRUD
app.get('/add-item', function(req, res) {
  res.render('add-item.ejs', {message: 'add'});
  console.log("add-item page now rendered");    // the log function is used to output data to the terminal. 
});
//taking data from a form in the views - post request
app.post('/add-item', function(req, res) {
  let sql = 'INSERT INTO products_ejs ( Name, Price, Descript, Image) VALUES ("'+req.body.name+'", '+req.body.price+', "'+req.body.descript+'",  "'+req.body.image+'")';
  let query = db.query(sql, (err, res) => {
    if(err) throw err;
    console.log(res);
    wstream.write('\nnew product added ' + req.body.name + " " + new Date(Date.now()).toLocaleString());
  });
  res.redirect('/products',202 ,  {message: 'new product created'}); // redirect to product funtion so it will render the view with the row data 
  console.log("Now you are on the products page!");
});


app.get('/products', function(req, res){
    db.query('SELECT * FROM products_ejs; SELECT * FROM users; select count(id) from users;', [1, 2, 3], function(err, results){
        if (err) throw err;
        // `results` is an array with one element for every statement in the query:
        console.log(results[0]); // [{1: 1}]
        console.log(results[1]); // [{2: 2}]
        var res1 = results[0];
        var res2 = results[1];
		//var res3 = results[2];
		
		var res3 = JSON.stringify(results[2]); //to display data, need to JSON.stringify
		console.log('res3 ', res3);
        res.render('products.ejs', {res1, res2, res3, reviews, title: 'Products listing', message: ' '});
        wstream.write('\nall product listing and JSON reviews display' + new Date(Date.now()).toLocaleString());
    });
    console.log("Now you are on the products page! ");
});  

// function to render the individual products page {user: req.user,} 
app.get('/item/:id', function(req, res){
 // res.send("Hello cruel world!"); // This is commented out to allow the index view to be rendered
 let sql = 'SELECT * FROM products_ejs WHERE Id = '+req.params.id+';';
 console.log("id: ", req.params.id);
 //global.product_id = req.params.id;
 let query = db.query(sql, (err, res1) =>{
  if(err) throw err;
  res.render('item.ejs', { res1, title: 'Item view', message: ' '}); // use the render command so that the response object renders a HHTML page
  wstream.write('\nproduct listed ' + new Date(Date.now()).toLocaleString());
 });
 console.log("Now you are on the Individual product page!");
}); 

//edit a product
app.get('/product-update/:id', function(req, res){
 let sql = 'SELECT * FROM products_ejs WHERE Id = '+req.params.id+';';
 //let sql = 'UPDATE liammc SET Name = "'+req.body.name+'", Price = '+req.body.price+', Image = "'+req.body.image+'", Activity = "'+req.body.activity+'" WHERE Id = "'+req.params.id+'";';
 console.log(req.params.id);
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  wstream.write('\nproduct edit page ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
  res.render('product-update.ejs', {res1, title: 'Edit product', message: ' '});// use the render command so that the response object renders a HHTML page
 });
 console.log("Now you are on the edit product page!");
});

//edit a product
app.post('/product-update/:id', function(req, res){
	console.log(req.params.id);
	console.log(req.params.name);
	console.log(req.params.price);
	console.log(req.params.id);
 let sql = 'UPDATE products_ejs SET Name = "'+req.body.Name+'", Price = '+req.body.Price+', Image = "'+req.body.image+'", Descript = "'+req.body.descript+'" WHERE Id = '+req.params.id+';';
 console.log(req.params.id);
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  wstream.write('\nproduct edit page ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
  res.redirect('/products', 202, {title: 'Products', message: 'product updated'});// use the render command so that the response object renders a HHTML page
 });
 console.log("Now you are on the products page!");
});


// ---- delete one product
// app.get('/delete-item/:id', function(req, res) {
//     let sql = 'DELETE FROM products_ejs WHERE Id = "'+req.body.id+'";';
//     let query = db.query(sql, (err, res1) =>{
//       if(err) throw(err);
//     wstream.write('\nproduct deleted ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
//     console.log("Product Deleted");
//     res.redirect("/products", 202, {title: 'Products', message: 'Product deleted'});
// });

app.get('/product-delete/:id', function(req, res){
 let sql = 'DELETE FROM products_ejs WHERE Id = '+req.params.id+';';
 let query = db.query(sql, (err, res1) =>{
  if(err) throw(err);
  wstream.write('\nproduct deleted ' + req.params.id + ' ' + new Date(Date.now()).toLocaleString());
  res.redirect('/products', 202, {title: 'Products', message: 'Product deleted'}); // use the redirect to go to that funtion which will then render the page with data
 });
 console.log("Its Gone!");
});

// ---- CRUD on products.json
// ---- view all products
// app.get('/o-products', function(req, res) {
//   res.render("o-products", {products:products, message: ''});
//   console.log("Product page now rendered");    // the log function is used to output data to the terminal. 
// });

// ---- view one product
// app.get('/o-item/:id', function(req, res) {
//   var json = JSON.stringify(products);
//   var keyToFind = parseInt(req.params.id); // call name from the url
//   var index = products.map(function(products) {return products.id;}).indexOf(keyToFind)
//   console.log(req.params.id);
//   //parse json info then select the item with correct id 
//   res.render("o-item", {products: products, p: index, message: ''});
//   console.log("item page now rendered");    // the log function is used to output data to the terminal. 
// });

// ---- delete one product - how not to do it!
// unreliable as not specific enough and may delete the wrong product
// app.delete('o-delete-item-0/:id', function(req, res) {
//  //var deleteCustomer = products["product" + req.params.id];
//   var p = req.params.id;
//     delete products[p];
//     console.log("deleted ", p);
//     res.render("o-products", {products:products, message: ''});
// });

// ---- delete one product
// app.get('/o-delete-item/:id', function(req, res) {
//   var json = JSON.stringify(products);
//   var keyToFind = parseInt(req.params.id); // get id from the url
//     var index = products.map(function(products) {return products.id;}).indexOf(keyToFind)
//     products.splice(index ,1); // deletes one item from position represented by index  (its position) from above
//     json = JSON.stringify(products, null, 4); //turns it back to json
//     fs.writeFile('./models/products.json', json, 'utf8'); // Writing the data back to the file
//     console.log("Product Deleted");
  
//   res.redirect("/o-products", {messages: ''});
// });

// ---- create a product, renders page with form
// app.get("/o-add-item", function(req, res){
//     res.render("o-add-item.ejs", {message: ''});
//     console.log("on the add item page!")
// });

// ---- create a product function
// app.post("/o-add-item", function(req, res){
//     // function to find the max id
//   	function getMaxProduct(products , id) {
//   		var productMax
//   		for (var i=0; i< products.length; i++) {
//   			if(!productMax || parseInt(products[i][id]) > parseInt(productMax[id]))
//   				productMax = products[i];
//     		}
//   		return productMax;
//   	}
// 	var maxPID = getMaxProduct(products, "id"); // This calls the function above and passes the result as a variable called maxPID.
// 	var newProductID = maxPID.id + 1;  // this creates a new variable called newProductID which is the maxPID + 1
// 	console.log( newProductID); // We console log the new id for show reasons only
    
// 	// create a new product based on what we have in our form on the add page 
// 	var newProductInfo = {
//     name: req.body.name,  //data from form
//     id:  newProductID,    //data from function
//     cost: req.body.cost,  //data from form
//   };
//   console.log(newProductInfo);
//   var pjson = JSON.stringify(products); // Convert our json data to a string
  
//   // The following function reads the new data and pushes it into our JSON file
//   fs.readFile('./models/products.json', 'utf8', function readFileCallback(err, data){
//     if(err){
//      throw(err);
//     } else {
//       products.push(newProductInfo); // add the data to the json file based on the declared variable above
//       pjson = JSON.stringify(products, null, 4); // converts the data to a json file and the null and 4 represent how it is structuere. 4 is indententation 
//       fs.writeFile('./models/products.json', pjson, 'utf8')
//     }
//   })
//   res.redirect("/o-products", {message: 'item added'});
//   console.log("Item added and back to products list"); 
// });


// ---- view all contacts in a JSON list 
app.get("/contacts", function(req, res){
    res.render("contacts.ejs", {contacts: contacts, message: ''});
    console.log("on contacts page!")
});

// ---- add contact page rendered 
app.get("/add-contact", function(req, res){
    res.render("add-contact.ejs", {message: ''});
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
      contacts.push(newContact); // add the data to the json file based on the declared variable above using push()
      json = JSON.stringify(contacts, null, 4); // converts the data to a json file and the null and 4 represent how it is structuere. 4 is indententation 
      fs.writeFile('./models/contacts.json', json, 'utf8')
    }
  })
  //res.render('contacts.ejs', {contacts: contacts, messages: 'contact added'});
  res.redirect('/contacts', 202, {message: 'contact added'});
  console.log("Add-contact page rendered and contact added"); 
});

// ---- update a contact
app.get('/edit-contact/:name', function(req, res){
  console.log("edit-contact page renderned");
  function chooseContact(indOne){ 
		return indOne.name === req.params.name;	 		
  }
	
 	var indOne = contacts.filter(chooseContact);
	res.render("edit-contact.ejs", {indOne:indOne, message: ''});
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
  res.redirect('/contacts', 202, {contacts: contacts, message: 'contact updated'});
});



// ---- read all users
app.get('/users', function(req, res){
    res.render("users", {users:users, message: ''});
    console.log("User page now rendered");
});

app.get('/about', function(req, res) {
	res.render('about', {message: ''});
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
	res.render('upload', {message: ''});
	console.log("upload page now rendered");
});

// ---- file upload function using multerConfig from above
// app.post('/upload',multer(multerConfig).single('photo'),function(req,res){
//   res.render("index", {products:products, reviews:reviews, users:users});
//   //res.send('Complete!');
// });

// liam upload
//const fileUpload = require('express-fileupload');
//app.use(fileUpload());

app.post('/upload', function(req, res){
  //  need to get the file from the form
  let sampleFile = req.files.sampleFile
  console.log("samplefile", sampleFile); //check we have correct details
  var filename = sampleFile.name;
  console.log("filename ", filename);  //check we have correct details
  // we use the middleware (file upload ) to move the data from the form to the desired location
  sampleFile.mv('./images/' + filename, function(err){
    if(err)
      return res.status(500).send(err);
    console.log("Image is uploaded"); //file uploading though this empty object
    res.redirect('/', 202, {products:products, reviews:reviews, contacts:contacts, message: 'uploaded'});
  });
});
//file upload end ------------- 
app.get('/download', function(req, res) {
  var file = __dirname +'/public/emer.txt';
	res.download(file);
	console.log("download of txt file");
});

// ---- search function
app.post('/search', function(req, res){
  let sql = 'SELECT * FROM products_ejs WHERE Name LIKE "%'+req.body.search+'%" ';
  let query = db.query(sql, (err,res1) => {
    if(err) throw err;
    res.render('products.ejs', {res1, message: ''});
    console.log("search ", res1);
  });
});

// ---- This function gets the application up and running on the development server.
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("Yippee its running");
})