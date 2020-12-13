const utils = {
	random: (min, max) => {
		return Math.floor(Math.random() * max) + min;
	},
	checkPrice: (game, object) => {
		const price = game.prices[object];
		return game.inventory[price.object] >= price.value;
	},
	buy: (game, object) => {
		const price = game.prices[object];
		game.inventory[price.object] -= price.value;
		game.inventory[object]++;
	}
}

module.exports = utils;
