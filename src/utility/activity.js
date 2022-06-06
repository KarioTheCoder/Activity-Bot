const mongoose = require('mongoose');
const profile = require('../assets/profile.js');

const cache = new Map();

module.exports = {
  connect: async function(client) {
    await mongoose.connect(client.config.MONGO_URL !== '_ENV' ? client.config.MONGO_URL : process.env.MONGO_URL)
  },

  fetchProfile: async function(uid, gid) {
    if(cache.has(uid)) 
      return cache.get(uid);

    let fetched = await profile.findOne({
      userID: uid
    });

    if(!fetched)
      fetched = new profile({
        userID: uid,
        messages: []
      });

    cache.set(uid, fetched);
    return fetched
  },

  pushMessage: async function(memberPf, message) {

    if(!message?.channel || !message?.createdTimestamp) return; //For security during testing
    
    //memberPf stands for member profile
    memberPf.messages.push({
      timestamp: message.createdTimestamp,
      channelID: message.channel.id,
    });
    await memberPf.save();
  }
}