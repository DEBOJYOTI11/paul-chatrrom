window.onload = function(){
    const sessName = document.getElementById("livesession").innerHTML; //$('#livesession').val();

console.log("(INFO) Live session is ", sessName);

var messages = [];
function message_format(data) {

    d = data.time;

    return "<div class=\"card-panel\">" +
        "<strong>" + data.user + "&nbsp;|&nbsp;</strong>" +
        "<span class=\"blue-text text-darken-2\">" + data.message + "</span>" +
        "<span class=\"right-align\">" + d + "</span>" +
        "</div>"

};

function format_private_message(data) {
    return "<li class=\"collection-item\">" + data.message + data.user + data.time + "</li>"
}

function setUsername() {
    var u = document.getElementById('user_name');
    console.log("In setUsername ", u.value);
    if (u.value) {
        data = { name: u.value, password: 'debo', sess: sessName }
        socket.emit('setUsername', data);
        u.value = "";
    }
    else
        document.getElementById('error-container').innerHTML = "Enter valid Username<br>";
    //should get messages here
};

//console.log(window.location.hostname);
var socket = io.connect();
var user;

socket.on('userExists', function (data) {
    document.getElementById('error-container').innerHTML = data;
});

socket.on('userSet', function (data) {
    console.log("Confirmed username!");
    user = data.username;

    var welcome = document.getElementById('welcome');

    welcome.style.display = "block";
    welcome.innerHTML = "<h5>welcome " + user + "</h5>";

    document.getElementById("msg").style.display = "block";
    document.getElementById("name").style.display = "none";
});

function sendPrivateMessage() {
    m = document.getElementById("message_p");
    r = document.getElementById("recep_p");
    if (m.value && r.value && r.value != user) {
        data = { "message": m.value, "user": user, "recep": r.value, "time": Date(), "sess": sessName }
        socket.emit("perr_msg", data);
        console.log("Send private message to ", r.value, " from ", m.value);
        m.value = "";
        r.value = "";
    }
    m.value = "";
    r.value = "";


}

function sendMessage() {
    var msg = document.getElementById('message').value;

    document.getElementById('message').value = "";
    console.log("SendMessage" + msg);
    if (msg) {

        socket.emit('msg', { message: msg, user: user, time: Date(), sess: sessName });
    }
};

function logout() {
    var okToRefresh = confirm("Sure wana logout?");
    if (okToRefresh) {
        //setTimeout("location.reload(true);",1500);
        location.reload(true);
    }
};


socket.on('liveuser', function (data) {
    var live = document.getElementById("liveusers");

    console.log(data.allusers);

    var temp = "<li class=\"collection-header\"><h4>Online users</h4></li>";
    for (var i = 0; i < data.allusers.length; i++) {
        temp += "<li class=\"collection-item\">" + data.allusers[i].user_name + "</li>";
    }

    live.innerHTML = temp;

});

socket.on('initialize', function (data) {
    console.log("Inidtialization data : ", data);
    data.forEach(function (d) {
        //document.getElementById('message-container').innerHTML += message_format(d);
        messages.unshift(message_format(d));
        document.getElementById('message-container').innerHTML = messages;
    });

});

socket.on('newmsg', function (data) {
    console.log("User : " + user + " New message " + data.message + " from " + data.user);
    if (user) {
        messages.unshift(message_format(data));
        document.getElementById('message-container').innerHTML = messages;
    }
});

function format_primate_message(data) {
    return "<li class=\"collection-item\">" + data.message + '|' + data.sender + ' | ' + data.time + "</li>";
}
socket.on('private_message', function (data) {

    console.log("Message from ", data.user, " | Me = ", data.recep, " | message ", data.message);


    document.getElementById("Personal_chat").innerHTML += format_primate_message(data);
});

socket.on('private_message_initialize', function (data) {
    data.forEach(function (d) {
        document.getElementById("Personal_chat").innerHTML += format_primate_message(d);
    })
});

socket.on('ErrorLine', function (data) {
    //console.log('Server unavialable. Please reconnect later');
    document.getElementById('error-container').innerHTML += data.status;
});


$("#exitsess").on('click', function () {
    let l = document.getElementById("livesession").innerHTML;
    console.log('session exit ', l);
    let call = '/session/endSession/' + l + '?token=' + $.cookie(l);
    console.log(call);
    $.get(call, function (data) {
        console.log(data);
        if (data.status == '400') {
            window.location.href = "/";
        }
    });
});
}

