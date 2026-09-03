const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
   Name:{
    type:String,
    required:true,
   },
   description:{
    type:String,
   },
   Course:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Courses"
   }

}) 

module.exports = mongoose.model("Tags",tagsSchema);
