const mongoose = require("mongoose");

const CoolDown = new mongoose.Schema({

    discordId :{
        type: String,
        require: true  
    },
    commandUseDate: {
        type: Date,
        require: true,
        default: Date.now()
    },
    coolDowndate : {
        type: Date,
        require : true,
        default: Date.now()
    }   
    
})

module.exports = mongoose.model("CoolDowns", CoolDown);