const fetch = require('node-fetch');

const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
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
    .setName('gettoken')
    .setDescription('get token for testing'),
    async execute(interaction, client) {
        
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

        const tokenJson = await tokenResponse.json();
        const accessToken = tokenJson.access_token;

        console.log(accessToken);

        await interaction.reply({content: `done`, ephermal: true});

    }
}

