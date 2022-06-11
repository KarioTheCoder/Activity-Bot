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

      guildMembers.set(pair[0], new activity.processedPf(guildMessages));
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

    const topMsgsEmbed = {
      color: 0xFFFFFF,

      author: {
        name: `Leaderboard | ${message.guild.name}`,
        iconURL: client.user.displayAvatarURL()
      },

      thumbnail: {
        url: message.guild.iconURL()
      },

      description: `> Displaying up to \`${maxMembers}\` members`,
      
      fields: Array.from(guildMembers)
        .sort((a, b) => b[1].messageStats.total - a[1].messageStats.total)
        .slice(0, maxMembers).map((m, i) => {
          return {
            name: `${[first, second, third][i] || fourth} ${client.users.cache.get(m[0])?.tag || `Unkown#????`}`,
            value: `${m[1].messageStats.total.toLocaleString()} ${m[1].messageStats.total > 1 ? 'messages' : 'message'}`
          }
        }),
    }

    const avgMsgsEmbed = JSON.parse(JSON.stringify(topMsgsEmbed));
    avgMsgsEmbed.fields = Array.from(guildMembers)
      .sort((a, b) => b[1].messageStats.dayAverage - a[1].messageStats.dayAverage)
      .slice(0, maxMembers).filter(m => Math.round(m[1].messageStats.dayAverage) >= 1).map((m, i) => {
        return {
          name: `${[first, second, third][i] || fourth} ${client.users.cache.get(m[0])?.tag || `Unkown#????`}`,
          value: `${Math.round(m[1].messageStats.dayAverage).toLocaleString()} average messages / day`
        }
      });

      const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('PF_DISPLAY_TYPE')
          .setPlaceholder('Browse Sorting Types')
          .addOptions([
            {
              label: 'Total Messages',
              value: `SORT_TOTAL`
            },
            {
              label: 'Average Daily Messages',
              value: `SORT_DAYAVERAGE`
            }
          ])
      );

    const sortingTypes = {
      'SORT_TOTAL' : topMsgsEmbed,
      'SORT_DAYAVERAGE' : avgMsgsEmbed
    }
    
    await display.edit({
      embeds: [topMsgsEmbed],
      components: [row]
    });

    const collector = display.createMessageComponentCollector({
      filter: i => i.isSelectMenu(),
      time: client.config.commands.leaderboard.inactivityTimeout
    });

    collector.on('collect', async selection => {
      if(selection.user.id !== message.author.id) {
        selection.reply({
          embeds: [{
            color: 0xFF0000,
            description: `This menu isn't for you!`
          }],
          ephemeral: true
        });
        
        return display.edit({
          components: [row]
        });
      }
      
      selection.update({
        embeds: [sortingTypes[selection.values[0]]]
      });
    });
    
    collector.on('end', async () => {
      row.components[0].setDisabled(true);
      display.edit({
        components: [row]
      });
    });    
  }
}