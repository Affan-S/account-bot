const { SlashCommandBuilder } = require('@discordjs/builders')

const DiscordUser = require("../../models/DiscordUser");
const { MessageEmbed } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
    .setName('forgot')
    .setDescription('Get password for a username!')
    .addStringOption(option =>
        option.setName("email")
        .setDescription("Principal name to get the password for...")
        .setRequired(true)
    ),
    async execute(interaction, client) {
        
        // get the username
        var email = interaction.options.getString("email");

        // check if the user owns the account
        var userInteraction = client.users.cache.get(interaction.member.user.id);
        
        await interaction.reply({content: "Working on your task....", ephemeral: true});

        try{
            
            // get the user
            const dcUser = await DiscordUser.findOne({
                discordId : userInteraction.id
            }).populate("User");

            // if dcUser is null, that means no account was found
            if(dcUser == null){
                await interaction.editReply({content: "No account(s) were found in your library"});
                return;
            }
            
            // here, dcUser is not null, we scan the array of User(s) created
            const users = dcUser.User;
            
            const userFound = users.find(us => us.email === email);
            
            if(userFound == null){
                await interaction.editReply({content : "Account not found!"});
                return;
            }

            const embed = new MessageEmbed()
                .setColor('#00ff7f')
                .setTitle('Hey! A new account was just created!')
                .addFields(
                    { name : "Password found : ", value:`${userFound.password}`},
                );
            
                await userInteraction.send(
                    {
                      embeds: [embed],
                      ephemeral: true
                    }
                );

            await interaction.editReply({ content: "Credentials are send in DM!", ephemeral: true}).catch(err => {interaction.reply('Error')})
            
        }catch(e){
            console.log(e);
        }

    },
}