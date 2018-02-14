var mongoose = require("mongoose");
var config = require("../mod/config");

mongoose.Promise = global.Promise;
module.exports = function(){
	mongoose.connect(config.database, {
   	useMongoClient: true,
	},function () { /* dummy function */ })
		.then(() => {
			//return server.start();
		})
		.catch(err => { // mongoose connection error will be handled here
			console.error('App starting error:', err.stack);
			process.exit(1);
		});
 }