var express = require('express');
var  jwt     = require('jsonwebtoken');
app= express();
router = express.Router();

require('../mod/connect')();
var schema  = require('../mod/schema');
var config = require('../mod/config');

// router.use(function(req,res,next){

//   var token = req.params.token || req.body.token || req.query.token || req.headers['x-access-token'];
//   if(token){
//     jwt.verify(token, "Ilovesex",function(err,decoded){

//       if(err)
//         return res.json({success:false,
//                 message: 'Failed to authenticate token'})
//       req.decoded = decoded;
//       console.log("decoded ",decoded);
//       next()

//     });
//   }else{
//     return res.status(403).send({ 
//           success: false, 
//           message: 'No token provided.' 
//       });
//   }
// })

function strip(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

router.get('/',function(req,res){

  schema.session.find({},'session_name', function(err,data){
  	if(err){
  		res.render('index', {'success':false , 'error':err});
  	}

  	res.render('index', {'success':false,'sessions': data, 'title':'Paul Chatrrom'});
  });
});


router.post('/authenticate',function(req,res){
  console.log('(DEBUG) Authentication : ', req.body.session_name, req.body.password);

  schema.session.findOne({
      session_name : strip(req.body.session_name)
  },function(err,sess){
      if(err)throw err;
      console.log(sess);
      if(!sess){
        res.json({ success: false, message: 'Authentication failed. Session not found.' });
        return;
        
      }

      if(sess.password != req.body.password){
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
        return;
      }

      const payload = {
          admin: schema.session.session_name 
      };
      var token = jwt.sign(payload,config.secret,{ // app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
      });

      res.cookie(req.body.session_name, token, {expire: 86400 + Date.now()});
        // return the information including token as JSON
      res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
      });   

    })
});

router.get('/about',function(req,res){
  res.render('about')
});

router.get('/contact',function(req,res){
  res.render('contact');
});

router.get('*',function(req,res){
  //res.send("Redirecting......");
  //sleep.sleep(5);
  //res.redirect('/');

  res.render('404error');
});
//router.use(express.static(__dirname + '/public'));
module.exports = router;