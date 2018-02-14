var mongoose =require("mongoose");

var express = require('express');
app= express();
var schema = require('../mod/schema');
router = express.Router();

router.get('/', function(req,res){
	res.render("dashboard",{title:'dashboard'});
});

router.get('/create', function(req,res){
	var sess1 = new schema.session({ 
	     session_name: 'RangerBoys', 
	     password: 'hulk',
	     admin: true 
	   });

	var sess2 = new schema.session({
		session_name : 'Allboys',
		password : 'boys',
		admin:true
	});

	  // save the sample user
	 sess1.save(function(err) {
	    if (err) throw err;
	  });
	 sess2.save();
	 res.json({ success: true });

});

router.get('/get',function(req,res){
	schema.session.find({},function(err,data){
		if(err){
			res.json({'success':false, 'Response':'Error occurred'});
			throw err;
		}
		res.json(data);
	});
});

router.get('/delete',function(req,res){
	schema.session.find({},function(err,items){
		items.forEach(function(doc){
			res.clearCookie(doc.session_name);
		});

		schema.session.find({}).remove().exec();
		schema.chatBroadcast.find({}).remove().exec();
		schema.chatPrivate.find({}).remove().exec();
		schema.user.find({}).remove().exec();
		//res.json({'status':'Deleted'});
		res.redirect('/');
	});
});


module.exports = router;