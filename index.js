const {
  Client,
  Intents,
  Collection
} = require('discord.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ]
});

client.commands = new Collection();
client.config = require('./src/utility/config.json');

const fs = require('fs');

fs.readdirSync('./src/commands')
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const command = require(`./src/commands/${file}`);
    client.commands.set(command.name, command);
    command.aliases?.forEach(alias => client.commands.set(alias, command));
  });

fs.readdirSync('./src/handlers')
  .filter(file => file.endsWith('.js'))
  .forEach(file => require(`./src/handlers/${file}`)(client));

require('./src/utility/server.js')();

client.login(client.config.BOT_TOKEN !== '_ENV' ? client.config.BOT_TOKEN : process.env.BOT_TOKEN);

process.on('uncaughtException', console.log);
process.on('unhandledRejection', console.log);