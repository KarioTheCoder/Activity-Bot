const mongoose = require('mongoose');

const schema = mongoose.Schema({
  userID: {
    type: String,
    unique: true
  },
  messages: {
    type: Array
  }
});

module.exports = mongoose.model('Profile', schema);