const mongoose = require('mongoose');

const schema = mongoose.Schema({
  userID: {
    type: String,
    unique: true
  },
  guildID: {
    type: String
  },

  messageCountByTimestamp: {
    type: Map
    //Key Format: date:hour
  },
  messageCountByChannel: {
    type: Map
    //Key Format: channelID
  }
});

module.exports = mongoose.model('Profile', schema);