const express = require('express');

module.exports = function() {
	const app = express();
		
	app.listen (3000, () =>   {
  		console.log('Listening on port 3000');
	});

	app.get("/", (req,res) => {
  		res.send('https://discord.gg/bqkTK6ubJA');
	});
}