const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// // index.html
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/intro.html');
});

app.get('/game', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

// Arquivos estáticos
app.use(express.static('public'));

io.on('connection', (socket) => {
	console.log('a user connected');

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('chat message', (msg) => {
		io.emit('chat message', msg);
	});
});

http.listen(3000, () => {
	console.log('Server online');
});
