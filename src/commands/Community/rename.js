const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const User = require("../../models/User");
const DiscordUser = require("../../models/DiscordUser");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('renameacc')
    .setDescription('Change user principal name!')
    .addStringOption(option =>
        option.setName("email")
        .setDescription("Existing email...")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName("newemail")
        .setDescription("New email address.")
        .setRequired(true)
    ),
    async execute(interaction, client) {

        await interaction.reply({content : "Working on it...!",ephemeral: true});

        // get the username
        const email = interaction.options.getString("email");
        const newPricipalName = interaction.options.getString('newemail');

        const userInteraction = client.users.cache.get(interaction.member.user.id); 

        if(email.includes("@KrishresiSMP.onmicrosoft.com") == false || newPricipalName.includes("@KrishresiSMP.onmicrosoft.com") == false){
            await interaction.editReply({content : "Invalid emails!",ephemeral: true});
            return;
        }

        try{

            // find the discord user
            const dcUser = await DiscordUser.findOne({
                discordId : userInteraction.id
            }).populate("User");

            // if dcUser is null, that means no account was found
            if(dcUser == null){
                await interaction.editReply({content: "No accounts were found!"});
                return;
            }
            
            // here, dcUser is not null, we scan the array of User(s) created
            const users = dcUser.User;
            const userFound = users.find(us => us.email === email);
            
            if(userFound == null){
                await interaction.editReply({content : "Counld not find account in your library by the given Principal Name!",ephemeral: true});
                return;
            }
            
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
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify({
                    userPrincipalName: newPricipalName,
                })
            });

            if (userResponse.status == 404) {
                await interaction.editReply({content : "Request discarded! Given account was not found!", emphemral: true});
                return;
            }

            if(userResponse.status == 400){
                await interaction.editReply({content : "Principal name is already taken!", emphemral: true});
                return;     
            }
            
            // dm here
            await interaction.editReply({ content: `Updated User Principal Name : ${newPricipalName}`, ephemeral: true}).catch(err => {interaction.reply(`${err}`)})
            
            const embed = new MessageEmbed()
                .setColor('#00ff7f')
                .setTitle('Hey! A new account was just created!')
                .addFields(
                    { name : "Account Inforamtion", value:" "},
                    { name: 'Username', value: userFound.email },
                    { name: 'Password', value: userFound.password }
            );

            await userInteraction.send(
                {
                  embeds: [embed],
                  ephemeral: true
                }
            );
            
            userFound.email = newPricipalName;
            await User.updateOne({_id: userFound._id },userFound);
            await client.channels.cache.get(`${process.env.LOG_CHANNEL}`).send(`${userInteraction.tag} renamed their account ${email} to ${newPricipalName}!`);
            
        }
        catch(e){
            console.log(e);
        }
    },
}