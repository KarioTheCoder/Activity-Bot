const mongoose = require('mongoose');
const profile = require('../assets/profile.js');

const cache = new Map();

const twoKeyed = (a, b) => a + '-' + b; //ORDER MATTERS

module.exports = {
  connect: async function(client) {
    await mongoose.connect(client.config.MONGO_URL !== '_ENV' ? client.config.MONGO_URL : process.env.MONGO_URL)
  },

  fetchProfile: async function(uid, gid) {
    if(cache.has(twoKeyed(uid, gid))) 
      return cache.get(twoKeyed(uid, gid));

    let fetched = await profile.findOne({
      userID: uid,
      guildID: gid
    });

    if(!fetched)
      fetched = new profile({
        userID: uid,
        guildID: gid,

        messageCountByTimestamp: new Map(),
        messageCountByChannel: new Map()
      });

    cache.set(twoKeyed(uid, gid), fetched);
    return fetched
  },

  pushMessage: async function(memberPf, message) {

    if(!message?.channel || !message?.createdTimestamp) return; //For security during testing
    
    //memberPf stands for member profile
    const timestamp = new Date(message.createdTimestamp);
    memberPf.messageCountByTimestamp.set(twoKeyed(timestamp.getDay(), timestamp.getHours()),
      (memberPf.messageCountByTimestamp.get(twoKeyed(timestamp.getDay(), timestamp.getHours())) || 0) + 1);

    memberPf.messageCountByChannel.set(message.channel.id,
      (memberPf.messageCountByChannel.get(message.channel.id) || 0) + 1);

    await memberPf.save();
  }
}