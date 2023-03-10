const { Client, Intents, Collection } = require('discord.js');
const { interaction } = require('discord.js')
const fs = require('fs');
const client = new Client({ intents: [Intents.FLAGS.GUILDS]});
const connectDB = require("./config/db");
require('dotenv').config();

client.commands = new Collection();


const functions = fs.readdirSync("./src/functions").filter(file => file.endsWith(".js"));
const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");


(async () => {

  for (file of functions) {
    require(`./functions/${file}`)(client);
  }

  connectDB();
  
  client.handleEvents(eventFiles, "./src/events");

  client.handleCommands(commandFolders, "./src/commands");

  client.login(process.env['token'])

  console.log(`Logged in! Ready to Moderate Discord Coding Lounge!`)
  
})();