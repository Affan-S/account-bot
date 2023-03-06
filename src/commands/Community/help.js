const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Learn all commands!'),
    async execute(interaction, client) {

        const embed = new MessageEmbed()
        .setColor('#00ff7f')
        .setTitle('Following are available commands!')
        .addFields(
            { name : "1. /help - list all the helpful commands", value:" "},
            { name : "2. /createacc <username> - create new account", value:" "},
            { name : "3. /removecd <discord_username#tag> - remove account creation cooldown", value:" "},
            { name : "4. /forgot <principal name / email> - fetch password for the registered account", value:" "},
            { name : "5. /deleteacc <principal name / email> - delete account", value:" "},
            { name : "6. /rename <principal name / email> <new principal name / new email> - change username", value:" "},
            { name : "7. /useraacc <discordname#tag> - all username registered on the account of discord user", value:" "},
            { name : "8. /searchacc <principal name> - check who made an account with the given email/principal name", value:" "},
            { name : "9. /listall - list all the acounts created by bots (only the active ones)", value:" "},
        );

        await interaction.reply({ embeds : [embed], ephemeral: true}).catch(err => {interaction.reply('Error')})
    },
}