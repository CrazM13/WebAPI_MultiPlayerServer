const io = require('socket.io')(process.env.PORT || 5000);
const shortid = require('shortid');

var players = [];
var playerCount = 0;

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

	socket.broadcast.emit('spawn', {id: thisPlayerID});
	console.log("Sending Spawn To New Player With ID", thisPlayerID);
	
	for (var i = 0; i < players.length; i++) {
		socket.emit('spawn');
	}

	socket.on('sayhello', function(data) {
		console.log("Unity Game Says \"Hello\"");

		socket.emit('talkback');
	});

	socket.on('disconnect', function () {
		console.log("Player Disconnected");
		playerCount--;
	});

	socket.on('move', function(data) {
		data.id = thisPlayerID;
		console.log("Player Moved", JSON.stringify(data));
		
		socket.broadcast.emit('move', data);
	});
});