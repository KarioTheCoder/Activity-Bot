const {
  MessageSelectMenu,
  MessageActionRow
} = require('discord.js');

const activity = require('../utility/activity.js');

module.exports = {
  name: `leaderboard`,
  aliases: ['lb', 'serverlb', 'guildlb', 'top'],
  execute: async function(message, client) {
    const guildMembers = message.guild.members.cache.filter(m => !m.user.bot);
    const display = await message.channel.send({
      embeds: [{
        color: 0xFFFF00,  
        description: `**Processing the activity for \`${guildMembers.size.toLocaleString()}\` members in \`${message.guild.name}\`**`,
        image: {
          url: 'https://i.pinimg.com/originals/a2/dc/96/a2dc9668f2cf170fe3efeb263128b0e7.gif'
        }
      }]
    });

    for(const pair of guildMembers) {
      const memberPf = await activity.fetchProfile(pair[0]);
      const guildMessages = memberPf.messages.filter(m => client.channels.cache.has(m.channelID));

      if(guildMessages.length < 1) {
        guildMembers.delete(pair[0]);
        continue;
      }

      guildMembers.set(pair[0], guildMessages);
    }

    if(guildMembers.size < 1)
      return display.edit({
        embeds: [{
          color: 0xFF0000,
          description: 'No members in this server have any recorded activity!'
        }]
      });

    const { maxMembers } = client.config.commands.leaderboard;
    const {
      first,
      second,
      third,
      fourth
    } = client.config.emojis;
    
    return display.edit({
      embeds: [{
        color: 0xFFFFFF,

        author: {
          name: `Leaderboard | ${message.guild.name}`,
          iconURL: client.user.displayAvatarURL()
        },

        thumbnail: {
          url: message.guild.iconURL()
        },

        description: `> Displaying upto \`${maxMembers}\` members`,
        
        fields: Array.from(guildMembers)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, maxMembers).map((m, i) => {
            return {
              name: `${[first, second, third][i] || fourth} ${client.users.cache.get(m[0])?.tag || `Unkown#????`}`,
              value: `${m[1].length.toLocaleString()} ${m[1].length > 1 ? 'messages' : 'message'}`
            }
          })
      }]
    });
  }
}