const mongoose = require("mongoose");

const Logs = new mongoose.Schema({

    discordId : {
        type: String,
        required: true
    },
    command: {
        type: String,
        require: true
    },
    date : {
        type: Date,
        require: true,
        default: Date.now
    },
    description : {
        type: String,
        require: true,
        default: "Success"
    }
    
})


module.exports = mongoose.model("Logs", Logs);