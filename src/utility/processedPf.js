module.exports = class processedPf {
  constructor(messages = []) {
    this.messageStats = {
      total: messages.length,
      dayAverage: Math.round(messages.length /
        (Math.floor(Number(messages[messages.length - 1].timestamp) / 1000 / 60 / 60 / 24) -
        Math.floor(Number(messages[0].timestamp) / 1000 / 60 / 60 / 24))),
      weekStats: {
        
      },
      channelStats: {
        
      }
    }
    
    messages.forEach(m => {
      const { weekStats, channelStats } = this.messageStats;
    });

    //this.generateEmbeds();
  }

  generateEmbeds(member, client) {
    this.embeds = {
      'TYPE_BASIC' : {
        color: 0xFFFFFF,
        
        author: {
          name: `${member.user.tag} | ${member.guild.name}`,
          iconURL: member.user.displayAvatarURL()
        },
        
        thumbnail: {
          url: client.user.displayAvatarURL()
        },

        fields: [
          {
            name: `Total Messages`,
            value: this.messageStats.total.toLocaleString(),
            inline: true
          },

          {
            name: `Average Messages / Day`,
            value: this.messageStats.dayAverage.toLocaleString(),
            inline: true
          }
        ],
      }
    }
  }
}