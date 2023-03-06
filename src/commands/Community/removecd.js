const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv');
const DiscordUser = require("../../models/DiscordUser");
const CoolDown = require("../../models/CoolDown");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('removecd')
  .setDescription('Discord username to remove cool down!')
  .addStringOption(option =>
      option.setName("username")
      .setDescription("Discord username to find registered accounts information")
      .setRequired(true)
  ),
  async execute(interaction, client) {

    await interaction.reply({content: "Working on it...", ephemeral: true});
    
    // get username from the interaction option
    const username = interaction.options.getString("username");
    
    const role = interaction.member.roles.cache.has("1047716444881830008");

    if(role == false){
      await interaction.editReply({content: "Insufficient Role to perform this action!", ephemeral: true});
      return;
    }

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

      // remove the cooldown
      await CoolDown.deleteOne({
        discordId: dcUser.discordId
      });

      await interaction.editReply({content: `Removed cooldown for discord user ${username}`, ephemeral: true});

    }catch(e){
      console.log(e);
    }

  }
}