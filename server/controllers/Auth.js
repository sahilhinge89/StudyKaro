const User = require("../models/User")
const OTP = require('../models/OTP')
const Profile = require('../models/Profile')
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config()

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
            confrimPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //  Do validation
        if (!firstName || !lastName || !email
            || !password || !confrimPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }

        // match password and confirm password
        if (password !== confrimPassword) {
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
        if(user){
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