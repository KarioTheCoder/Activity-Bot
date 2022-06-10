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
          description: `Bots' activities aren't stored!`
        }]
      });

    const display = await message.channel.send({
      embeds: [{
        color: 0xFFFF00,  
        description: `**Processing the activity for \`${target.user.tag}\` in \`${target.guild.name}\`**`,
        image: {
          url: 'https://i.pinimg.com/originals/a2/dc/96/a2dc9668f2cf170fe3efeb263128b0e7.gif'
        }
      }]
    });
    
    const memberPf = await activity.fetchProfile(target.user.id, target.guild.id);

    const memberGuildMsgs = memberPf.messages.filter(m => target.guild.channels.cache.has(m.channelID));
    if(memberGuildMsgs.length < 1) {
      return display.edit({
        embeds: [{
          color: 0xFF0000,
          description: `${target.user.tag} needs to send at least one message for their activites to start being recorded!`
        }]
      });
    }
    
    const processedPf = new activity.processedPf(memberGuildMsgs);

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
            },
            {
              label: 'Channel Stats',
              value: 'TYPE_CHANNELSTATS'
            }
          ])
      );

    await display.edit({
      embeds: [processedPf.embeds['TYPE_BASIC']],
      components: [row]
    });

    const collector = display.createMessageComponentCollector({
      filter: i => i.isSelectMenu(),
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

      row.components[0].options.forEach(opt => opt.default = opt.value === selection.values[0]);
      
      selection.update({
        embeds: [processedPf.embeds[selection.values[0]]],
        components: [row]
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