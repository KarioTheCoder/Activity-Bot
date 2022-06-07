module.exports = class processedPf {
  constructor(member, messages = []) {
    this.messages = {
      total: messages.length,
      perWeekDay: [0, 0, 0, 0, 0, 0, 0], //7 days of the week
      perChannel: {
        
      }
    }

    messages.forEach(m => {
      const { perWeekDay, perChannel } = this.messages;

      if(!perChannel.hasOwnProperty(m.channelID))
        perChannel[m.channelID] = 0;
      
      ++perWeekDay[new Date(m.timestamp).getDay()];
      ++perChannel[m.channelID];
    });
  }
}