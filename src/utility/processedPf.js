module.exports = class processedPf {
  constructor(messages = []) {
    const daysSinceFirstMsg = 
      Math.floor(Date.now() / 1000 / 60 / 60 / 24) -
      Math.floor(Number(messages[0].timestamp) / 1000 / 60 / 60 / 24) + 1;
    //  ^  +1 as the first day should also be counted 
    
    this.messageStats = {
      total: messages.length,
      dayAverage: messages.length / daysSinceFirstMsg,
      weekStats: [
        
      ],
      channelStats: {
        
      }
    }

    // --- WEEK STATS ---
    const { weekStats } = this.messageStats;
    
    for(let i = 0; i < 7; ++i) {
      weekStats[i] = {
        totalMsgs: 0,
        msgsConstitute: 0,
        averageMsgs: 0,
      }
    }

    const daysOfWeekTotals = [0, 0, 0, 0, 0, 0, 0];
    
    for(let i = 0; i < daysSinceFirstMsg; ++i) {
      daysOfWeekTotals[(i + new Date(messages[0].timestamp).getDay()) % 7]++;
    }

    for(let i = 0; i < messages.length; ++i) {
      weekStats[new Date(messages[i].timestamp).getDay()].totalMsgs++;
    }

    for(let i = 0; i < 7; ++i) {
      weekStats[i].msgsConstitute = (weekStats[i].totalMsgs * 100) /  this.messageStats.total;
      weekStats[i].averageMsgs = daysOfWeekTotals[i] > 0 ? weekStats[i].totalMsgs / daysOfWeekTotals[i] : 0;
    }
    
    //this.generateEmbeds();
  }

  generateEmbeds(member, client) {

    const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
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
            value: Math.round(this.messageStats.dayAverage).toLocaleString(),
            inline: true
          }
        ],
      },

      'TYPE_WEEKSTATS' : {
        color: 0xFFFFFF,
        
        author: {
          name: `${member.user.tag} | ${member.guild.name}`,
          iconURL: member.user.displayAvatarURL()
        },
        
        thumbnail: {
          url: client.user.displayAvatarURL()
        },

        description: `> Displaying message stats for each day of the week`,
        
        fields: this.messageStats.weekStats.map((day, i) => {
          return {
            name: daysOfWeekNames[i],
            value: `Total: ${day.totalMsgs.toLocaleString()} (\`${Math.round(day.msgsConstitute * 10) / 10}\`%)\nAverage: ${Math.round(day.averageMsgs.toLocaleString())}`,
            inline: true
          }
        })
      },

      'TYPE_CHANNELSTATS' : {
        color: 0xFFFF00, //Change to white when done
        
        author: {
          name: `${member.user.tag} | ${member.guild.name}`,
          iconURL: member.user.displayAvatarURL()
        },
        
        thumbnail: {
          url: client.user.displayAvatarURL()
        },

        description: 'Work in progress...'
      }
    }
  }
}