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
      
    const memberPf = await activity.fetchProfile(target.user.id, target.guild.id);

    const display = await message.channel.send({
      embeds: [{
        color: 0xFFFF00,
        description: `**Processing the activity for \`${target.user.tag}\` in \`${target.guild.name}\`**`,
        image: {
          url: 'https://24.media.tumblr.com/f678ce38eb896bc1d4aaa911958af087/tumblr_n2eccv6Dev1rgpzseo1_1280.gif'
        }
      }]
    });

    const processStart = display.createdTimestamp;
    
    const processedPf = new activity.processedPf(
      target,
      memberPf.messages.filter(m => target.guild.channels.cache.has(m.channelID))
    );

    display.edit({
      embeds: [{
        color: 0xFFFFFF,
        
        author: {
          name: `${target.user.tag} | ${target.guild.name}`,
          iconURL: target.user.displayAvatarURL()
        },
        
        thumbnail: {
          url: client.user.displayAvatarURL()
        },

        fields: [
          {
            name: `Total Messages`,
            value: processedPf.messages.total.toLocaleString()
          }
        ],
        
        footer: {
          text: `Processed in ${Date.now() - processStart}ms`
        }
      }]
    });
  }  
}