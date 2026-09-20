const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
    courseName:{
        type:String,
    },
    courseDescription:{
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
    courseContent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Section"
    },
    ratingAndReviews:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"RatingAndReviews"
    },
    price:{
        type:Number,
    },
    thumbnail: {
        type:String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
        default: "Draft"
    },
    instructions: {
        type: [String]
    },
    studentsEnrolled :[{
         type:mongoose.Schema.Types.ObjectId,
         required:true,
         ref:"User"
    }]
})

module.exports = mongoose.model("Courses",coursesSchema);