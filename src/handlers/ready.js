const activity = require('../utility/activity.js');

module.exports = client => {
  client.on('ready', async () => {

    await activity.connect(client);
    
    client.user.setActivity("Free Diamonds", {
      type: "STREAMING",
      url: "https://www.youtube.com/watch?v=cm6xeszqPc0"
    });
    
    console.log(`Tag: ${client.user.tag}\nID: ${client.user.id}`);
    console.log(`Guild Count: ${client.guilds.cache.size}\nTotal Triggers: ${client.commands.size}`);
    client.ready = true;
  });
}