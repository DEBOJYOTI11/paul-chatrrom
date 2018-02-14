var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema_session =new Schema({
	session_name : String,
	password : String,
	connected : [{type:Schema.Types.ObjectId, ref:'user'}]
});

var schema_users = new Schema({
	user_name :{
				type: String,
				require : true,
				trim : true
				},
	password : String,
	session :  { type: Schema.Types.ObjectId, ref: 'session' }
});

var schema_chat_broadcast =  new Schema({
	sender : {
		type: String,require : true,trim : true
			},
	message : String,
	time : String,
	session :  { type: Schema.Types.ObjectId, ref: 'session' }
	//multimedia : file
});
var schema_private_message = new Schema({
	sender : {
		type: String,require : true,trim : true
			},
	recep : {
		type: String,require : true,trim : true
			},
	message : String,
	time : String,
	session :  { type: Schema.Types.ObjectId, ref: 'session' }
	//multimedia : file
});


exports.session = mongoose.model('session', schema_session);
exports.user = mongoose.model('user', schema_users);
exports.chatBroadcast = mongoose.model('chatB',schema_chat_broadcast);
exports.chatPrivate = mongoose.model('chatP', schema_private_message);

