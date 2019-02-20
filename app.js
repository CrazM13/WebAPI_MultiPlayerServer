const io = require('socket.io')(process.env.PORT || 5000);

var playerCount = 0;

console.log("Server Running");

io.on('connection', function(socket) {
	console.log("Connected To Unity");

	socket.broadcast.emit('spawn');
	playerCount++;

	for (var i = 0; i < playerCount; i++) {
		socket.emit('spawn');
		console.log("Sending Spawn To New Player");
	}

	socket.on('sayhello', function(data) {
		console.log("Unity Game Says \"Hello\"");

		socket.emit('talkback');
	});

	socket.on('disconnect', function () {
		console.log("Player Disconnected");
		playerCount--;
	});
});