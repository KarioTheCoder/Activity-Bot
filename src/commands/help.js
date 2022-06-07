const {
  MessageActionRow,
  MessageButton
} = require('discord.js');

module.exports = {
  name: 'help',
  aliases: ['uptime', 'ping', 'up'],
  execute: async function(message, client) {

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setStyle('LINK')
        .setLabel('Source Code')
        .setURL('https://github.com/KarioTheCoder/Activity-Bot')
      );
    
    return message.channel.send({
      embeds: [{
        color: 0x00FF00,
        description: `Latency: \`${Date.now() - message.createdTimestamp}\`ms\nCurrent Prefix: \`${client.config.prefix}\``
      }],

      components: [row]
    });
  }
}