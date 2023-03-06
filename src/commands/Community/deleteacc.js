const { SlashCommandBuilder } = require('@discordjs/builders')
const User = require("../../models/User");
const DiscordUser = require("../../models/DiscordUser");
const Logs = require("../../models/Logs");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('deleteacc')
    .setDescription('Delete account with the email!')
    .addStringOption(option =>
        option.setName("email")
        .setDescription("User principal name to delete the account")
        .setRequired(true)
    ),
    async execute(interaction, client) {
        
        await interaction.reply({content: "Working on it...", ephemeral: true});

        // first we get the user principal name
        var email = interaction.options.getString("email");

        // get user from the interaction
        var userInteraction = client.users.cache.get(interaction.member.user.id); 

        // now we check if the discord user owns that account
        try{

            // find the discord user
            const dcUser = await DiscordUser.findOne({
                discordId : userInteraction.id
            }).populate("User");

            // if dcUser is null, that means no account was found
            if(dcUser == null){
                await interaction.editReply({content: "No account was found!"});
                return;
            }
            
            // here, dcUser is not null, we scan the array of User(s) created
            const users = dcUser.User;

            const userFound = users.filter(us => us.email === email);
            
            if(userFound == null){
                await interaction.editReply({content : "Counld not find account in your library by the given Principal Name!"});
                return;
            }

            dcUser.User = users.filter(
                function(user){
                    return user.email !== email
                }
            );
            
            await interaction.editReply({content : "Found the user...", ephemeral: true});

            // get access token
            var clientId = process.env.CLIENT_ID;
            var clientSecret = process.env.CLIENT_SECRET;
            var tenantId = process.env.TENANT_ID;

            // authenticate with microsoft 365
            const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: clientId,
                    client_secret: clientSecret,
                    resource: "https://graph.microsoft.com/"
                })
            });

            const tokenJson = await tokenResponse.json();
            const accessToken = tokenJson.access_token;
            
            // get the user
            const userResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${email}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (userResponse.status != 204) {
                await interaction.editReply({content : "No user was found!", emphemral: true});
                return;
            }

            await interaction.editReply({ content: `Deleted ${email}`, ephemeral: true}).catch(err => {interaction.reply('Error')})
            await client.channels.cache.get(`${process.env.LOG_CHANNEL}`).send(`${userInteraction.username} deleted account ${email}!`);

            try{

                await DiscordUser.updateOne({_id : dcUser._id}, dcUser);

                await User.deleteOne({_id : userFound._id});

                const log = new Logs(
                {
                    command: "deleteacc",
                    description : `delete account with email ${email}`,
                    discordId : `${userInteraction.id}`
                });
                
                await log.save();

                // delete the actual user as well
                await User.deleteOne({_id: userFound._id});

            }catch(e){
                console.log(e);
            }
            
        }catch(e){
            console.log(e);
            await interaction.editReply("Something went wrong!");
            return;
        }

    },
}