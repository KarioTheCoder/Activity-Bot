const {
  MessageSelectMenu,
  MessageActionRow
} = require('discord.js');

const activity = require('../utility/activity.js');

module.exports = {
  name: 'profile',
  aliases: ['pf', 'pro', 'userinfo', 'ui', 'stats'],
  execute: async function(message, client) {

    const args = message.content.split(' ');
    const target = message.guild.members.cache.find(m => 
     m.user.id === args[1] || m.user.tag === args[1] || m.user.id === args[1]?.slice(2, -1)) || message.member;


    if(target.user.bot)
      return message.channel.send({
        embeds: [{
          color: 0xFF0000,
          description: `Activity for bots isn't stored!`
        }]
      });

    const display = await message.channel.send({
      embeds: [{
        color: 0xFFFF00,
        description: `**Processing the activity for \`${target.user.tag}\` in \`${target.guild.name}\`**`,
        image: {
          url: 'https://24.media.tumblr.com/f678ce38eb896bc1d4aaa911958af087/tumblr_n2eccv6Dev1rgpzseo1_1280.gif'
        }
      }]
    });
    
    const memberPf = await activity.fetchProfile(target.user.id, target.guild.id);
    
    const processedPf = new activity.processedPf(
      memberPf.messages.filter(m => target.guild.channels.cache.has(m.channelID))
    );

    processedPf.generateEmbeds(target, client);
    
    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('PF_DISPLAY_TYPE')
          .setPlaceholder('Select Profile Type')
          .addOptions([
            {
              label: 'Basic',
              value: `TYPE_BASIC`,
              default: true
            },
            {
              label: 'Week Stats',
              value: `TYPE_WEEKSTATS`
            }
          ])
      );

    await display.edit({
      embeds: [processedPf.embeds['TYPE_BASIC']],
      components: [row]
    });

    const collector = display.createMessageComponentCollector({
      time: client.config.commands.profile.inactivityTimeout
    });


    collector.on('collect', async selection => {
      if(selection.user.id !== message.author.id)
        return selection.reply({
          embeds: [{
            color: 0xFF0000,
            description: `This menu isn't for you!`
          }],
          ephemeral: true
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