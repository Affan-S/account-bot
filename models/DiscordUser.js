const mongoose = require("mongoose");

const DiscordUser = new mongoose.Schema({

    discordId :{
        type: String,
        require: true  
    },
    discordDisplayName: {
        type: String,
        require: true,
    },
    User:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
})


module.exports = mongoose.model("DiscordUser", DiscordUser);