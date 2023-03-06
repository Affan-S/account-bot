const { SlashCommandBuilder } = require('@discordjs/builders')
const User = require("../../models/User");


module.exports = {
    data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Check the Bot is Working with Commands'),
    async execute(interaction, client) {

        try{
            const user = new User({
                username: "user1",
                email: "some email",
                password: "12345" 
            });
            var savedObject = await user.save(); 
        }catch(e){
            console.log(e);
        }
        await interaction.reply({ content: `<a:Success:999006584862675025> The bot is working, you can do other commands. Run /help for more information.`, ephemeral: true}).catch(err => {interaction.reply('Error')})
    },
}