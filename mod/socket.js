
const _ = require('underscore'),
      path = require('path');

const moment = require('moment'),
      striptags = require('striptags'),
      sleep = require('sleep'),
      mongoose = require('mongoose'),
      schema = require('../mod/schema');


module.exports = function(io,server,users,socketConnections){

   var idSession;
   var nameSession;
   io = require('socket.io')(server)
   io.on('connection', function(socket) {

      console.log('[Info] Connected User');

      //on connection
      socket.on('setUsername', function(data) {
          console.log(data);
          schema.session.findOne({session_name:striptags(data.sess)},function(err,item){
                   
                  nameSession = striptags(data.sess);
                  console.log('(DEBUG) IdSession,  Name: %s', nameSession);
                  idSession = item._id;
                  let name = data['name'];
                  name = striptags(name);

                  if(users.indexOf(name) != -1) {
                      socket.emit('userExists', data + ' username is taken! Try some other username.');
                  }
                  else{
                    console.log('[Info] Username acquire request. Username= ',data.name);
 
                    schema.user.find({"user_name":data['name']},
                                       {'user_name':1,'_id':0},
                                      function(err,u){
                                          if(err)throw err;

                                          if(u.length==0){
                                            console.log(data);
                                            var userNew = new schema.user({
                                              user_name: data['name'],
                                              password: data['password'],
                                              session: idSession
                                            });

                                            userNew.save(function (err) {
                                              if (err){
                                                socke.emit('ErrorLine', 'Some error occureed! Try again');
                                                return;
                                              }
                                              schema.user.find({ "session": mongoose.Types.ObjectId(idSession) }, 'user_name', function (err, users) {
                                                if (err) throw err;
                                               
                                                io.sockets.emit('liveuser', { "allusers": users });
                                              });
                                            });
                                          }
                                          if(u.length>1){
                                            socke.emit('ErrorLine', 'Some error occureed! Try again');
                                            return;
                                          }
                                    });
                      users.push(data.name);
                      socketConnections[socket.id] = data.name;
                      socket.emit('userSet', {username: data.name});

                     

                      schema.chatBroadcast.find(
                        { "session": mongoose.Types.ObjectId(idSession)},
                        { 'sender': 1, 'message': 1, 'time': 1, '_id': 0 },
                        function(err,packet){
                          if(err)throw err;
                          socket.emit('initialize', packet);
                        });

                      schema.chatPrivate.find(
                        { "session": mongoose.Types.ObjectId(idSession), "recep": name },
                        { 'sender': 1, 'recep': 1, 'message': 1, 'time': 1, '_id': 0 },
                        function (err, packet) {
                          if (err) throw err;
                          socket.emit('private_message_initailize',packet);
                          
                      });
                    }
              });
      });


   // Personal message
   socket.on('perr_msg', function(data){
      if(socketConnections[socket.id]){

          if(users.indexOf(data.recep)!=-1){
            recep = (_.invert(socketConnections))[data.recep];
            //data['time'] = moment(data['time']).fromNow();
            data['sender'] = data['user'];
            //console.log("Message from ",data.user, " | Me = ", data.recep, " | message ",data.message);
            //console.log(recep);
            var p_save = new schema.chatPrivate({
                sender : data.user,
                recep : data.recep,
                message : data.message,
                time : data.time,
                session : idSession
            });
            p_save.save(function(err){ 
              if(err)
                socket.emit('ErrorLine','Some error occureed! Try again');
            });

            socket.broadcast.to(recep).emit("private_message",data);
            socket.emit("private_message", data);
          }
          else{
            socket.emit('ErrorLine', {"status":"Wrong recepient"});
          }
          console.log("Message form ",socketConnections[socket.id], " to ",data.recep);
      }
      else{
        socket.emit('ErrorLine', {"status": "Please acquire a username to join first"});
      }
   });

   socket.on('msg', function(data) {

      if( socketConnections[socket.id]){

          //data['time'] = moment(data['time']).fromNow();

          data['message'] = striptags(data['message']);
          console.log("[Info] Message from ",socketConnections[socket.id]);
          var b_save = new schema.chatBroadcast({
                sender : data.user,
                message : data.message,
                time : data.time,
                session : idSession
            });
          b_save.save(function(err){
              if(err)
                socke.emit('ErrorLine','Some error occureed! Try again');
          });
          io.sockets.emit('newmsg', data);
      }
      else{
        socket.emit('ErrorLine', {"status": "Please acquire a username to join first"});
      }
     
   });

   socket.on('disconnect',function(data){

      if(socketConnections[socket.id]){
        console.log('[Info] Disconnect request form ', socketConnections[socket.id]);
        schema.user.findOneAndRemove({user_name:socketConnections[socket.id]},function(err){
          if(err)throw err;
          users.splice(users.indexOf(socketConnections[socket.id]),1);
          delete socketConnections[socket.id];
          //io.sockets.emit('liveuser',{"allusers":users});
          schema.user.find({ "session": mongoose.Types.ObjectId(idSession) }, 'user_name', function (err, users) {
            if (err) throw err;
            console.log(users);
            io.sockets.emit('liveuser', { "allusers": users });
          })
        })
        }
    });

});
}
