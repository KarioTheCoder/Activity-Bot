const activity = require('../utility/activity.js');

module.exports = client => {
  client.on('messageCreate', async message => {
    if(!client.ready || message.author.bot) return;

    const { prefix } = client.config;
    const command = message.content?.slice(prefix.length).toLowerCase().split(' ')[0] || '';

    const memberPf = await activity.fetchProfile(message.author.id, message.guild.id);
    await activity.pushMessage(memberPf, message);
    
    if(message.content?.toLowerCase().startsWith(prefix.toLowerCase()) &&
      client.commands.has(command)) {

      if(!message.guild.members.cache.get(client.user.id).permissions.has('ADMINISTRATOR')) {
        try {
          return await message.channel.send({
            embeds: [{
              color: 0xFF0000,
              description: `The bot is missing the \`ADMINISTRATOR\` permission which is required to use the bot!`
            }]
          })
        } catch(err) {
          return message.author.send({
          embeds: [{
              color: 0xFF0000,
              description: `The bot is missing the \`ADMINISTRATOR\` permission which is required to use the bot!`
            }]
          });
        }
      }

     return client.commands.get(command).execute?.(message, client);     
    }
  });
}