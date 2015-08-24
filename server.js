var express = require('express');
var app = express();
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');

app.use(express.static(__dirname + "view"));

app.set('port', process.env.port || 3000);
app.set('views',__dirname+'/views');
app.set('view engine','jade');

app.use(bodyParser());
//app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/marketplace');

var Item = new mongoose.Schema({
	title : String,
	type  : String,
	desc  : String,	
	price : String,
	img   : String
});

var item = mongoose.model('Items',Item);

app.get('/view',function(req,res){
	item.find({},function(err,docs){
		//console.log(err,docs);
		if(err) res.json(err);
		else res.render('index', {items : docs});
	});
});

app.post('/new', function(req, res){
	new item(req.body).save(function(err,doc){
		if(err) res.json(err);
		//else res.send('Success');
		else res.redirect('/view');
	});
});
app.listen(3000);
console.log("server running on port 3000");