const mongoose = require("mongoose");

const coursesSchema  = new mongoose.Schema({
    courseName:{
        type:String,
    },
    courseDecription:{
        type:String,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    whatYouWillLearn:{
        type:String,
    },
    couresContent:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Section"
    },
    ratingAndReviews:{
         type:mongoose.Schema.Types.ObjectId,
        
         ref:"RatingAndReviews"
    },
    price:{
        type:Number,
   
    },
    thumbanail: {
        type:String,
    },
    tag:{
         type:mongoose.Schema.Types.ObjectId,
         
         ref:"Tags"
    },
    StudentsEnrolled :[{
         type:mongoose.Schema.Types.ObjectId,
         required:true,
         ref:"User"
    }]
        
})

module.exports = mongoose.model("Courses",coursesSchema);