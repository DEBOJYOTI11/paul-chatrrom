var jwt = require('jsonwebtoken');
var express = require('express');

require('../mod/connect')();
var router  = express.Router();
var schema  = require('../mod/schema');
var config = require('../mod/config');


router.use(function(req,res,next){

	var token = req.params.token || req.body.token || req.query.token || req.headers['x-access-token'];
	if(token){
		jwt.verify(token, config.secret,function(err,decoded){

			if(err){

				return res.json({success:false,
								message: 'Failed to authenticate token'})
				}
			req.decoded = decoded;
			console.log("decoded ",decoded);
			next()

		});
	}else{
		return res.status(403).send({ 
        	success: false, 
        	message: 'No token provided.' 
    	});
	}
});



router.get('/', function(req,res){
  console.log("Redirecting..");

  res.render('index', {sessions: sessions , title:'Paul chatroom'});
});

router.get('/:sess_name', function(req, res) {
  	 sess = req.params.sess_name;
  	 console.log('(DEBUG) Session Requested is : ',sess);
     res.render('chat_main', {livesess: sess, title:sess});
});
router.get('/endSession/:sess_name',function(req,res){

	res.clearCookie(req.params.sess_name);
	console.log('Deleted cookie');
	res.json({status:'400',mess:'Deleted'});
});
router.get('/getprivatemessage/:sess_name/:user' , function(res,res){
	let user = req.params.user;
	let sess = req.params.sess_name;
	var idSession;
	schema.session.find(
		{'session_name':sess},
		{'_id':1,},
		function(err,data){
			if(err)throw err;

			idSession  = data._id;
		});
	schema.chatPrivate.find(
		{ "session": mongoose.Types.ObjectId(idSession), "recep":user},
		{'sender':1, 'recep':1, 'message':1, 'time':1, '_id':0},
		function (err, data) {
			if (err) throw err;
			res.json(data);
	});
});

router.get('/broadcast/:sess_name/', function (res, res) {
		let sess = req.params.sess_name;
		var idSession;
		schema.session.find(
			{ 'session_name': sess },
			{ '_id': 1, },
			function (err, data) {
				if (err) throw err;

				idSession = data._id;
		});
		schema.chatBroadcast.find(
			{ "session": mongoose.Types.ObjectId(idSession)},
			{ 'sender': 1, 'message': 1, 'time': 1, '_id': 0 },
			function (err, data) {
				if (err) throw err;
				res.json(data);
		});

});

module.exports = router;
