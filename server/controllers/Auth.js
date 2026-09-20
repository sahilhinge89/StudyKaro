const User = require("../models/User")
const OTP = require('../models/OTP')
const Profile = require('../models/Profile')
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {passwordUpdated} = require('../mail/templates/passwordUpdate');
const mailSender = require('../utils/mailSender')
const crypto = require("crypto");
require("dotenv").config()
console.log("JWT SECRET:", process.env.JWT_SECRET);
//send OTP
exports.sendOTP = async (req, res) => {
    try {
        //Fetch email from request body
        const { email } = req.body;

        //check if user already exist
        const checkUserIsPresent = await User.findOne({ email });

        //if user already exist, then return a reponse
        if (checkUserIsPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already registered',
            })
        }

        //Generate Otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated:", otp);

        //check the otp is unique or not
        let result = await OTP.findOne({ otp: otp });
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        //create an entry in Database
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        //return response successfully
        res.status(200).json({
            success: true,
            message: 'OTP sent Successfully',
            otp,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// signUp
exports.signUp = async (req, res) => {
    try {
        // fetching from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,   
            accountType,
            contactNumber,
            otp
        } = req.body;

        //  Do validation
        if (!firstName || !lastName || !email
            || !password || !confirmPassword || !otp) {  
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        // match password and confirm password
        if (password !== confirmPassword) {   
            return res.status(400).json({
                success: false,
                message: "Password and ConfirmPassword value does not match, Please try again"
            })
        }

        //check user already exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: 'User already registered',
            })
        }

        //find most recent OTP stored for the user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        //validate Otp
        if (recentOtp.length == 0) {
            //OTP not Found
            return res.status(400).json({
                success: false,
                message: 'OTP Not Found',
            })
        } else if (otp !== recentOtp[0].otp) {
            //OTP does not match
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            })
        }

        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ***** Gravatar avatar *****
        // Gravatar looks up an avatar by the MD5 hash of the (trimmed, lowercased) email.
        // d=retro generates a fun default identicon if the email has no real Gravatar account,
        // so every user gets a profile picture even if they never set one up.
        const emailHash = crypto
            .createHash('md5')
            .update(email.trim().toLowerCase())
            .digest('hex');
        const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=retro&s=200`;

        //entry created in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            contactNumber,
            image: gravatarUrl,
            additionalDetails: profileDetails._id,
        })

        //return response
        return res.status(200).json({
            success: true,
            message: 'User is registered Successfully',
            user,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'User is not registered. Please try again',
        })
    }
} 

// login 
exports.login  = async (req,res) =>{
    try{
        //get data from req body
        const {email,password} = req.body;

        //validation data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required, please feel incorrect data "
            })
        }

        // user check exist or not
        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please signup first"
            })
        }
        //generate JWT, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload ={
                email: user.email,
                id:user._id,
                accountType:user.accountType, 
            }
         
            const token = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn:'2h',
            })
            user.token =token;
            user.password= undefined;

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*100)
            } 
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'Logged in successfull'
            })
        }
        else {
             return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            })
        }
    }
    catch(error){
         console.log(error);
         return res.status(401).json({
                success:false,
                message:"Login failure",
   })
 }
} 

//Change Password 
exports.changePassword = async (req, res) => {
  try {
    // 1. Get data from req.body / req.user (assuming auth middleware sets req.user)
    const userDetails = await User.findById(req.user.id);
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    // 2. Validate input
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    // 3. Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "The old password is incorrect",
      });
    }

    // 4. Hash and update new password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // 5. Send notification email (don't crash the request if the email fails)
    try {
      await mailSender(
        updatedUserDetails.email,
        "Password Updated Successfully",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
    } catch (mailError) {
      console.error("Error sending password update email:", mailError);
    }

    // 6. Return success response
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the password",
    });
  }
};
