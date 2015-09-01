var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

app.use(express.static(__dirname + "public"));

app.set('port', process.env.port || 3000);
app.set('views',__dirname+'/views');
app.set('view engine','jade');

app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

mongoose.connect('mongodb://localhost/marketplace');

var Item = new mongoose.Schema({ //DATABASE SCHEMA
	title : String,
	type  : String,
	desc  : String,	
	price : String,
	sold  : String
});

var item = mongoose.model('Items',Item);

var Seller = new mongoose.Schema({
	username : String,
	password : String
});

var sellers = mongoose.model('Sellers',Seller);

var CartItem = new mongoose.Schema({
	title : String,
	type  : String,
	desc  : String,	
	price : String,
	sold  : String
});

var cartItems = mongoose.model('CartItems',CartItem);

app.get('/addToCart/:id',function(req,res){  // TO RENDER THE DATA TO MODIFY PAGE TO EDIT IT
	item.findById(req.params.id,function(err,docs){
		new cartItems(docs).save(function(err,docs){
			if(err) res.json(err);
			else res.redirect('/marketplace.com');
		});
	});
});

app.get('/marketplace.com/myCart',function(req,res){ //TO FETCH ALL THE DATA FROM DATABASE AND DISPLAY ON HOME PAGE
	cartItems.find({},function(err,docs){
		if(err) res.json(err);
		else res.render('myCart', {cartitems : docs}); 
	});
});

app.get('/soldItem/:id',function(req,res){  // TO RENDER THE DATA TO MODIFY PAGE TO EDIT IT
	cartItems.findById(req.params.id,function(err,doc){
		cartItems.update({_id : req.params.id},
		{$set:{sold : 'sold'}},function(err,doc){
		 	if(err) res.json(err);
		 	else
			item.update({_id : req.params.id},
			{$set:{sold : 'sold'}},function(err,doc){
				if(err) res.json(err);
				else res.redirect('/marketplace.com/myCart');
			});
		});
	});
});

app.get('/marketplace.com/myCart/sold',function(req,res){ //TO FETCH ALL THE DATA FROM DATABASE AND DISPLAY ON HOME PAGE
		res.render('sold');
});

app.get('/removeFromCart/:id',function(req,res){
	cartItems.remove({_id : req.params.id},function(err){
		if(err) console.log(err);
		else res.redirect('/marketplace.com/myCart')
	});
});

app.get('/marketplace.com',function(req,res){ //TO FETCH ALL THE DATA FROM DATABASE AND DISPLAY ON HOME PAGE
	item.find({},function(err,docs){
		if(err) res.json(err);
		else res.render('index', {items : docs});
	});
});

app.get('/marketplace.com/login',function(req,res){ //TO FETCH ALL THE DATA FROM DATABASE AND DISPLAY ON HOME PAGE
		res.render('login');
});

app.get('/marketplace.com/login/invalid',function(req,res){ //TO FETCH ALL THE DATA FROM DATABASE AND DISPLAY ON HOME PAGE
		res.render('invalidLogin');
});

app.get('/marketplace.com/seller',function(req,res){ //TO FETCH ALL THE DATA FROM DATABASE AND DISPLAY ON HOME PAGE
	item.find({},function(err,docs){
		if(err) res.json(err);
		else res.render('seller', {items : docs});
	});
});

app.get('/deleteItem/:id', function(req,res){ // TO DELETE AN ITEM FROM A PARTICULAR ID
	item.remove({_id : req.params.id},function(err){
		if(err) console.log(err);
		else res.redirect('/marketplace.com/seller');
	});
});

app.get('/modifyForm/:id',function(req,res){  // TO RENDER THE DATA TO MODIFY PAGE TO EDIT IT
	item.findById(req.params.id,function(err,doc){
		if(err) console.log(err);
		else res.render('edit',{item : doc});
	});
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    sellers.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password!==password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.post('/loginCheck',passport.authenticate('local', { 
	successRedirect: '/marketplace.com/seller',
    failureRedirect: '/marketplace.com/login/invalid',
    failureFlash: false })
);

app.post('/updateItem/:id', function(req,res){ //TO EDIT THE DETAILS,UPDATE THE DATABASE AND GO BACK TO HOME PAGE
	item.update({_id : req.params.id},
		{$set:{title : req.body.title,
		 type : req.body.type,
		 desc : req.body.desc,
		price : req.body.price}},function(err,doc){
		if(err) res.json(err);
		else res.redirect('/marketplace.com/seller');
	});
});

app.post('/new', function(req, res){ //TO REDIRECT TO HOME PAGE AFTER SAVING THE DATA INTO MONGO
	new item(req.body).save(function(err,doc){
		if(err) res.json(err);
		else res.redirect('/marketplace.com/seller');
	});
});
app.listen(3000);
console.log("server running on port 3000");