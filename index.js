const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const utils = require('./utils');
const clients = {};

const game = {
	inventory: {
		cookie: 0,
		grandma: 0,
	},
	prices: {
		grandma: { value: 20, object: 'cookie' },
	},
	workersConfig: {
		grandma: { time: 5000, object: 'cookie', add: 1 }
	},
	workers: []
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

// Um único worker a cada .5s opera todos ao mesmo tempo
setInterval(serviceWorker, 500);

function serviceWorker() {
	const now = new Date().getTime();
	game.workers.forEach((worker, i) => {
		const { type, latestJob } = worker;
		const { time, object, add } = game.workersConfig[type];
		if ((latestJob + time) <= now ) {
			game.workers[i].latestJob = new Date().getTime();
			game.inventory[object] += add;
		}
	});
	io.emit('game render', game);
}

io.on('connection', (socket) => {
	// Join
	socket.on('join', (name) => {
		clients[socket.id] = { name: name, color: `rgba(${utils.random(50, 200)}, ${utils.random(50, 200)}, ${utils.random(50, 200)})` };
		io.emit('game render', game);
	});

	// Disconnect
	socket.on('disconnect', () => {
		delete clients[socket.id];
	});

	// Chat
	socket.on('chat message', (message) => {
		io.emit('chat message', clients[socket.id], message);
	});

	// Clicks
	socket.on('click', (object) => {
		switch (object) {
			case 'cookie':
				game.inventory[object]++;
				break;
			case 'grandma':
				if (utils.checkPrice(game, object)) {
					utils.buy(game, object);
					game.workers.push({ type: 'grandma', latestJob: new Date().getTime() });
				}
				break;
		}


		io.emit('game render', game);
	});
});

http.listen(8080, '0.0.0.0', () => {
	console.log('Server online');
});
