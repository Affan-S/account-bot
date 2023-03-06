const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv');

const DiscordUser = require("../../models/DiscordUser");

module.exports = {
  data: new SlashCommandBuilder()
  .setName('searchacc')
  .setDescription('Create account with provided username. Usage /createacc <username>!')
  .addStringOption(option =>
      option.setName("email")
      .setDescription("User principal name / email to search")
      .setRequired(true)
  ),
  async execute(interaction, client) {

    await interaction.reply({content: "Working on it..", ephemeral: true});
    // get all discord users and find the user account one by one...lols?

    const email = interaction.options.getString("email");
    
    const dcUsers = await DiscordUser.find().populate({
        path: "User",
        
    });
    var found = false;

    const theUser = dcUsers.forEach(user=>{
        // get list of users
        const usersInDcUser = user.User;

        usersInDcUser.forEach(async (currentUser) => {
            // check usernames
            const cEmail = currentUser.email;
            if(cEmail.trim() === email.trim()){
                found = true;
                await interaction.editReply({content: `The ${email} is owned by ${user.discordDisplayName}`, ephemeral: true});
                return;
            }
        });
    });

    if(found == false){
        await interaction.editReply({content: `The principal name is not owned by any discord user!`, ephemeral: true});
    }

  }
}