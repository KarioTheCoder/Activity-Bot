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
      channelStats: new Map()
    }

    // --- WEEK STATS --- && --- CHANNEL STATS ---
    const {
      total,
      weekStats,
      channelStats
    } = this.messageStats;
    
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

      if(!channelStats.has(messages[i].channelID))
        channelStats.set(messages[i].channelID, {
          totalMsgs: 0,
          msgsConstitute: 0,
          averageMsgs: 0
        });

      channelStats.get(messages[i].channelID).totalMsgs++;
    }

    for(let i = 0; i < 7; ++i) {
      weekStats[i].msgsConstitute = (weekStats[i].totalMsgs * 100) /  total;
      weekStats[i].averageMsgs = daysOfWeekTotals[i] > 0 ? weekStats[i].totalMsgs / daysOfWeekTotals[i] : 0;
    }

    for(const pair of channelStats) {
      pair[1].msgsConstitute = (pair[1].totalMsgs * 100) / total;
      pair[1].averageMsgs = pair[1].totalMsgs / daysSinceFirstMsg;
    }
    
    //this.generateEmbeds();
  }

  generateEmbeds(member, client) {

    const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const { maxChannels } = client.config.processors.profile;
    
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
            value: `Total: ${day.totalMsgs.toLocaleString()} (\`${Math.round(day.msgsConstitute * 10) / 10}\`%)\nAverage: ${Math.round(day.averageMsgs).toLocaleString()}`,
            inline: true
          }
        })
      },

      'TYPE_CHANNELSTATS' : {
        color: 0xFFFFFF, //Change to white when done
        
        author: {
          name: `${member.user.tag} | ${member.guild.name}`,
          iconURL: member.user.displayAvatarURL()
        },
        
        thumbnail: {
          url: client.user.displayAvatarURL()
        },

        description: `> Displaying messae stats for upto \`${maxChannels}\` channels`,

        fields: Array.from(this.messageStats.channelStats)
          .sort((a, b) => b[1].totalMsgs - a[1].totalMsgs)
          .slice(0, maxChannels).map(c => {
          return {
            name: client.channels.cache.get(c[0]).name,
            value: `Total: ${c[1].totalMsgs.toLocaleString()} (\`${Math.round(c[1].msgsConstitute * 10) / 10}\`%)\nDaily Average: ${c[1].averageMsgs.toLocaleString()}\nChannel Mention: <#${c[0]}>`
          }
        })
      }
    }
  }
}