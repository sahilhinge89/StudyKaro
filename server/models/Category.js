const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
   name:{
    type:String,
    required:true,
   },
   description:{
    type:String,
   },
   Course:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Courses"
   }] 

}) 

module.exports = mongoose.model("Category",categorySchema);
