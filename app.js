const io = require('socket.io')(process.env.PORT || 5000);
const shortid = require('shortid');

var players = [];

console.log("Server Running");

io.on('connection', function(socket) {
	console.log("Connected To Unity");

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
	
	
	for (var playerId in players) {
		if (playerId == thisPlayerID) continue;

		console.log("Sending Spawn To New Player With ID", playerID);
		socket.emit('spawn', players[playerId]);
	}

	socket.on('sayhello', function(data) {
		console.log("Unity Game Says \"Hello\"");

		socket.emit('talkback');
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