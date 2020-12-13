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
		grandpa: 0,
		thief: 0,
		cop: 0,
	},
	prices: {
		grandma: { value: 100, object: 'cookie' },
		grandpa: { value: 300, object: 'cookie'},
		cop: { value: 5000, object: 'cookie'},
	},
	workersConfig: {
		grandma: { time: 5000, object: 'cookie', add: 1 },
		grandpa: { time: 10000, object: 'grandma', add: 1 },
		cop: { time: 15000, object: 'thief', remove: 1 },
		thief: { time: 10000, object: 'cookie', remove: 15 },
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

setInterval(addThief, 10000);

function addThief() {
	game.workers.push({ type: 'thief', latestJob: 0 });
	game.inventory.thief ++;
}

function serviceWorker() {
	const now = new Date().getTime();
	game.workers.forEach((worker, i) => {
		const { type, latestJob } = worker;
		const { time, object, add, remove } = game.workersConfig[type];
		if ((latestJob + time) <= now ) {
			game.workers[i].latestJob = new Date().getTime();
		
			if (remove) {
				game.inventory[object] -= remove;
			} else {
				game.inventory[object] += add;
			}
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
			case 'grandpa': 
				if (utils.checkPrice(game, object)) {
					utils.buy(game, object);
					game.workers.push({ type: 'grandpa', latestJob: new Date().getTime() });
				}
				break;
			case 'cop':
				if(utils.checkPrice(game, object)) {
					utils.buy(game, object);
					game.workers.push({type: 'cop', latestJob: new Date().getTime() });
				}
				break;
			}

		io.emit('game render', game);
	});
});

http.listen(8080, '0.0.0.0', () => {
	console.log('Server online');
});
