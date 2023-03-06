const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv');
const DiscordUser = require("../../models/DiscordUser");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('useracc')
  .setDescription('Discord username to find user accounts!')
  .addStringOption(option =>
      option.setName("username")
      .setDescription("Discord username to find registered accounts information")
      .setRequired(true)
  ),
  async execute(interaction, client) {

    await interaction.reply({content: "Working on it...", ephemeral: true});

    // get username from the interaction option
    const username = interaction.options.getString("username");

    // update current DISCORD USER's accounts list
    try{

      const dcUser = await DiscordUser.findOne({
        discordDisplayName: username
      }).populate({
        path: "User"
      });

      if(dcUser == null){
        
        const embed = new MessageEmbed()
        .setColor('#00ff7f')
        .setTitle("Can't find any account accociated with the username!")
        .addFields(
          { name : "No accounts were found", value:" "},
        );

        await interaction.editReply({embeds: [embed], ephemeral: true});

        return;

      }

      const usersInDcUser = dcUser.User;
      
      const embed = new MessageEmbed()
        .setColor('#00ff7f')
        .setTitle('Hey! I found the list of users!')
        .addFields(
          { name : "Account Inforamtion", value:" "},
      );
      
      usersInDcUser.forEach(user => {
        embed.addFields({
          name: ` ${user.username}  `, value: " " 
        });
      });
      
      await interaction.editReply({embeds: [embed], ephemeral: true});

    }catch(e){
      console.log(e);
    }

   
  }
}