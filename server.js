var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(__dirname + "public"));

app.set('port', process.env.port || 3000);
app.set('views',__dirname+'/views');
app.set('view engine','jade');

app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/marketplace');

var Item = new mongoose.Schema({ //DATABASE SCHEMA
	title : String,
	type  : String,
	desc  : String,	
	price : Number
});

var item = mongoose.model('Items',Item);

app.get('/marketplace.com',function(req,res){ //TO FETCH ALL THE DATA FROM DATABASE AND DISPLAY ON HOME PAGE
	item.find({},function(err,docs){
		if(err) res.json(err);
		else res.render('index', {items : docs});
	});
});

app.get('/deleteItem/:id', function(req,res){ // TO DELETE AN ITEM FROM A PARTICULAR ID
	item.remove({_id : req.params.id},function(err){
		if(err) console.log(err);
		else res.redirect('back');
	});
});

app.get('/modifyForm/:id',function(req,res){  // TO RENDER THE DATA TO MODIFY PAGE TO EDIT IT
	item.findById(req.params.id,function(err,doc){
		if(err) console.log(err);
		else res.render('edit',{item : doc});
	});
});

app.post('/updateItem/:id', function(req,res){ //TO EDIT THE DETAILS,UPDATE THE DATABASE AND GO BACK TO HOME PAGE
	item.update({_id : req.params.id},
		{$set:{title : req.body.title,
		 type : req.body.type,
		 desc : req.body.desc,
		price : req.body.price}},function(err,doc){
		if(err) res.json(err);
		else res.redirect('/marketplace.com');
	});
});

app.post('/new', function(req, res){ //TO REDIRECT TO HOME PAGE AFTER SAVING THE DATA INTO MONGO
	new item(req.body).save(function(err,doc){
		if(err) res.json(err);
		else res.redirect('/marketplace.com');
	});
});
app.listen(3000);
console.log("server running on port 3000");