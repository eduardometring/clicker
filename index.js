const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const utils = require('./utils');
const clients = {};

const clickerGame = {
	cookies: 0
};

// Linguagem de programação HTML
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/intro.html');
});

app.get('/game', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

// Arquivos estáticos
app.use(express.static('public'));

io.on('connection', (socket) => {
	// Join
	socket.on('join', (name) => {
		clients[socket.id] = { name: name, color: `rgba(${utils.random(50, 200)}, ${utils.random(50, 200)}, ${utils.random(50, 200)})` };
	});

	// Disconnect
	socket.on('disconnect', () => {
		delete clients[socket.id];
		console.log(JSON.stringify(clients));
		console.log('user disconnected');
	});

	socket.on('chat message', (message) => {
		io.emit('chat message', clients[socket.id], message);
	});
});

http.listen(8080, '0.0.0.0', () => {
	console.log('Server online');
});
