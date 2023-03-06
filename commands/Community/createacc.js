const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle  } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv');
const User = require("../../models/User");
const DiscordUser = require("../../models/DiscordUser");
const Logs = require("../../models/Logs");
const Cooldown = require("../../models/CoolDown");

const passwordGenerator = require('generate-password');
const CoolDown = require('../../models/CoolDown');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('createacc')
  .setDescription('Create account with provided username. Usage /createacc <username>!')
  .addStringOption(option =>
      option.setName("username")
      .setDescription("Username to create new account")
      .setRequired(true)
  ),
  async execute(interaction, client) {

    await interaction.reply({content: "Working on it...", ephemeral: true});
    
    // get username from the interaction option
    const username = interaction.options.getString("username");
    
    // validate
    var re = /^\w+$/;
    
    if(re.test(username) == false){

      const embed = new MessageEmbed()
        .setColor('#00ff7f')
        .setTitle('Invalid Username Found!')
        .addFields(
          { name : "Spaces and special characters are not allowed in the Username field", value:" "},
        );
      await interaction.editReply({embeds: [embed], ephemeral: true});

      return;
    }
    
    const userInteraction = client.users.cache.get(interaction.member.user.id);

    const coolDown = await Cooldown.findOne({
      discordId: userInteraction.id
    });

    if(coolDown != null){

      // check the cool down date
      const coolEndDate = coolDown.coolDowndate;

      if(Date.now() < coolEndDate){
        const difftime = coolDown.coolDowndate - Date.now();
        const diffDays = Math.ceil(difftime / (1000 * 3600 * 24));
        await interaction.editReply({content: `Please wait for cooldown to end. Remaining time : ${diffDays} Days`,emphemral: true});
        return;
      }
    }

    // client information
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const tenantId = process.env.TENANT_ID;

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

    const password = passwordGenerator.generate({
      length: 12,
      numbers: true,
      symbols: true,
      uppercase: true,
      strict: true
    });

    // get access token from the response
    const tokenJson = await tokenResponse.json();
    const accessToken = tokenJson.access_token;

    // register the user
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accountEnabled: true,
        UsageLocation: "CA",
        displayName: username,
        mailNickname: username,
        userPrincipalName: `${username}@KrishresiSMP.onmicrosoft.com`,
        passwordProfile: {
          password: password,
          forceChangePasswordNextSignIn: false
        }
      })
    });

    if (userResponse.status != 201) {
      await interaction.editReply({content: "Username already taken!", ephemeral: true});
      return;
    }

    // implement cool down

    // case 1: no coolDown is added, so its a fresh cooldown
    if(coolDown == null){
      const coolDownTimer = new CoolDown({
        discordId : userInteraction.id,
        commandUseDate: Date.now(),
        coolDowndate: Date.now() + (30 * 24 * 60 * 60 * 1000)
      });
      await coolDownTimer.save();
    }

    // cooldown is found, update it.
    if(coolDown != null){

      const coolEndDate = coolDown.coolDowndate;

      if(Date.now() > coolEndDate){
        const coolDownUpdate = new CoolDown({
          discordId : userInteraction.id,
          commandUseDate: Date.now(),
          coolDowndate: Date.now() + (30 * 24 * 60 * 60 * 1000)
        });
        await CoolDown.updateOne({_id : coolDown._id},coolDownUpdate);
      }

    }

    // add license
    //await interaction.followUp({content: "Adding license....", ephemeral: true});

    const email = `${username}@KrishresiSMP.onmicrosoft.com`;

    const userLicense = await fetch(`https://graph.microsoft.com/v1.0/users/${email}/assignLicense`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          addLicenses: [
            {
              disabledPlans: [],
              skuId: "87cd17ac-7b0e-4041-93a6-48ac0799f295"
              // 710779e8-3d4a-4c88-adb9-386c958d1fdf - 100 assignmend
              //87cd17ac-7b0e-4041-93a6-48ac0799f295 - 1 assignment
            }
          ],
          removeLicenses: []
        }
      )
    });

    if(userLicense.status == 400) {
      await interaction.editReply({content: "Licenses assignment failed!", ephemeral:true});
      return;
    }

    if(userLicense.status == 200){
      await interaction.editReply({content: "License assigned", ephemeral:true});
    }
    // update current DISCORD USER's accounts list
    try{

      const user = new User({
        username: `${username}`,
        email: `${username}@KrishresiSMP.onmicrosoft.com`,
        password: password 
      });

      const savedUser = await user.save();

      const discordUser = await DiscordUser.findOne({
        discordId: userInteraction.id
      });

      if(discordUser == null){
        const newDU = new DiscordUser({
          discordId : userInteraction.id,
          discordDisplayName: userInteraction.tag,
          User: [
            savedUser
          ]
        });
        await newDU.save(); 
      }else{
        discordUser.User.push(savedUser._id);
        await DiscordUser.updateOne({_id : discordUser._id},discordUser);
      }
      
      // Log the data - Create account, discord ID (not name, name can change)
      const log = new Logs(
      {
        command: "createacc",
        description : `${userInteraction.username} created account with username ${username}`,
        discordId : `${userInteraction.id}`
      });

      await log.save();
      
    }catch(e){
      console.log(e);
    }

    const userJson = await userResponse.json();

    // embed
    const embed = new MessageEmbed()
      .setColor('#00ff7f')
      .setTitle('Hey! A new account was just created!')
      .addFields(
        { name : "Account Inforamtion", value:" "},
        { name: 'Username', value: userJson.userPrincipalName },
        { name: 'Password', value: password }
    );

    await userInteraction.send(
      {
        embeds: [embed],
        ephemeral: true
      }
    );
    
    await userInteraction.send(
      {
        content: `Email    : ${userJson.userPrincipalName}
Password : ${password}`
      }
    );

    
    await interaction.editReply({content: `Account is successfully created by ${userInteraction}! Please check dm for credentials`,ephemeral: true});
    await client.channels.cache.get(`${process.env.LOG_CHANNEL}`).send(`${userInteraction.username} created account ${username}!`);
    
    if(userLicense.status == 200){
      setTimeout(async () => {
        // remove the license
        const res = await fetch(`https://graph.microsoft.com/v1.0/users/${email}/assignLicense`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              addLicenses: [],
              removeLicenses: ["87cd17ac-7b0e-4041-93a6-48ac0799f295"]
            }
          )
        });
  
      }, 600000);
    }

  }
}