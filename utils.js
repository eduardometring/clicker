const utils = {
	random: (min, max) => {
		return Math.floor(Math.random() * max) + min;
	},
	checkPrice: (game, object) => {
		const price = game.prices[object];
		return game.inventory[price.object] >= price.value;
	}
}

module.exports = utils;
