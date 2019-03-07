const io = require('socket.io')(process.env.PORT || 5000);
const shortid = require('shortid');

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const router = express.Router();


const db = require('./config/database');

// Connect To MongoDB Using Mongoose
mongoose.connect(db.mongoURI, {
	useNewUrlParser: true
}).then(function () {
	console.log("MongoDB Connected");
}).catch(function(err) {
	console.log(err);
});

// Load Users Model
require('./models/Users');
var User = mongoose.model('Users');

var players = [];

console.log("Server Running");

io.on('connection', function(socket) {
	console.log("Connected To Unity");

	socket.emit('connected');

	var thisPlayerID = shortid.generate();

	var player = {
		id: thisPlayerID,
		position: {
			v: 0
		}
	};

	players[thisPlayerID] = player;

	socket.emit('register', {id: thisPlayerID});
	socket.broadcast.emit('spawn', {id: thisPlayerID});
	socket.broadcast.emit('requestPosition');
	
	
	for (var playerId in players) {
		console.log(playerId);
		
		if (playerId == thisPlayerID) continue;

		console.log(playerId);

		console.log("Sending Spawn To New Player With ID", playerId);
		socket.emit('spawn', players[playerId]);
	}

	socket.on('sayhello', function(data) {
		console.log("Unity Game Says \"Hello\"");

		socket.emit('talkback');
	});

	socket.on('sendData', function(data) {
		console.log(JSON.stringify(data));
		User.findOne({name: data.name}).then(function (user) {
			console.log(JSON.stringify(user));
			if (user != null) {
				socket.emit('registrationFailed', data);
			} else {
				var newUser = {
					name: data.name
				};
				new User(newUser).save().then(function(users) {
					console.log("Sending Data To Database");

					User.find({}).then(function (users) {
						
						socket.emit('hideForm', {users});
					});
				});
			}
		});
	});

	socket.on('disconnect', function () {
		console.log("Player Disconnected");
		delete players[thisPlayerID];
		socket.broadcast.emit('disconnected', {id: thisPlayerID});
	});

	socket.on('move', function(data) {
		data.id = thisPlayerID;
		
		socket.broadcast.emit('move', data);
	});

	socket.on('updatePosition', function(data) {
		data.id = thisPlayerID;

		socket.broadcast.emit('updatePosition', data);
	});
});