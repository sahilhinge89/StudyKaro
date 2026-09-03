const mongoose = require("mongoose");

const subSection  = new mongoose.Schema({
    tile:{
        type:String,
    },
    timeDuration:{
        type:String,
    },

    description:{  
      type:String,
    },
    videoUrl:{
        type:String
    },
        
})

module.exports = mongoose.model("Subsection",subSection);