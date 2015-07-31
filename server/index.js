var app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	jwt = require('jsonwebtoken');
	//mongoose = require('mongoose');


//mongoose.connect('mongodb://localhost');
//var db = mongoose.connection;
//db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function (callback) {
//	console.log('DB connected!')
//});

app.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.get('/', function(req, res){
	res.sendfile('index.html');
});
app.get('/register', function(req, res){
	var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
	res.send(token);
});
app.get('/login', function(req, res){
	var token = jwt.sign({ foo: 'bar' }, 'shhhhh');
	res.send(token);
});
var devices = {}, users = {};
io.on('connection', function(socket){
	var user = {
		type: socket.handshake.query.type,
		id:  socket.handshake.query.id,
		socketId: socket.id
	};
	if (user.type == 'app') {
		users[user.id] = socket;
	} else if (user.type == 'device') {
		devices[user.id] = socket
	}
	console.log('a user connected', user);
	socket.on('disconnect', function(){
		if (user.type == app) {
			delete users[user.id];
		} else if (user.type == 'device') {
			delete devices[user.id];
		}
	});
	socket.on('status', function(data){
		sendData(data, 'status');
	});
	socket.on('changeStatus', function(data){
		sendData(data, 'changeStatus');
	});
	socket.on('setTimer', function(data){
		sendData(data, 'setTimer');
	});

	function sendData(data,channel) {
		if (data.type == 'device') {
			if (devices[data.deviceId]) {
				console.log('get status for device '+ devices[data.deviceId].id);
				//data.status = !data.status;
				devices[data.deviceId].emit(channel, data);
			} else {
				data.error = 'No device';
				socket.emit(data)
			}

		} else if (data.type == 'app') {
			if (users[data.appId]) {
				console.log('device set status' + users[data.appId].id)
				users[data.appId].emit(channel, data);
			} else {
				data.error = 'No user';
				socket.emit(data)
			}
		}
	}
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});