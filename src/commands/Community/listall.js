const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv');
const User = require("../../models/User");
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('listall')
  .setDescription('Discord username to find user accounts!'),
  async execute(interaction, client) {
    try{

      const usersRegistered = await User.find();
      
      const embed = new MessageEmbed()
        .setColor('#00ff7f')
        .setTitle('Hey! I found the list of users!')
        .addFields(
          { name : "Account Inforamtion", value:" "},
      );
      
      usersRegistered.forEach(user => {
        embed.addFields({
          name: `${user.username} `, value: " " 
        });
      });

      await interaction.reply({embeds :[embed], ephemeral: true});

    }catch(e){
      console.log(e);
    }


  }
}