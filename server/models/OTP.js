const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require("../mail/templates/emailVerificationTemplate"); // ✅ added

const otpSchema = new mongoose.Schema({
   email:{
    type:String,
    required:true,
   },
   otp:{
    type:String,
    required:true,
   },
   createdAt:{
    type:Date,
    default:Date.now,
    expires:5*60
   }

}) 

// creating function to send emails

async function sendVerificationEmail(email,otp){
 try {
   const mailResponse = await mailSender(
     email,
     "Verification Email from StudyKaro",
     otpTemplate(otp)   
   );
   
 } catch (error) {
   console.log("error occured while sending mail:",error);
   throw error;
 }
}

// applying pre save middleware
otpSchema.pre("save", async function () {
   await sendVerificationEmail(this.email, this.otp);
})

module.exports = mongoose.model("OTP",otpSchema);