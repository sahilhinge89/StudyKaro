const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const bcrypt = require('bcrypt')

// resetPasswordToken

exports.resetPasswordToken = async (req,res) =>{
 try {
        //get email from req body
        const email = req.body.email;

    //check user for this email, email valdiation
     const user = await User.fineOne({email:email});
     if(!user){
        return res.json({
            success:false,
            message:'Your Email is not regitered with us'
        });
     }
    //Generate token 
     const token = crypto.randomUUID();
    // update user by adding token and expiration time
     const updatedDetails = await User.findOneAndUpdate(
        {email:email},{
            token:token,
            resetPasswordExpires: Date.now() + 5*60*1000,
        },
        {new:true}
    )
    // create url 
     
    const url = `http://localhost:3000/update-password/${token}` 
    // send mail containing the url
        await mailSender(email, "Password Reset Link",
            `Password Rest Link: ${url}`
        )
    // retrun response 
 
        return res.json({
            success:true,
            message:'Email  Sent succefully, please check email and change password'
        })
 } catch (error) {
    console.log(error);
    return res.status(500).json({
        success:false,
        message:'Something went wrong while sending reset password email '
    })
    
 }
}

//resetPassword

exports.resetPassword = async(req,res) =>{
    try {
        //fetching data
    const{password, confirmPassword, token} = req.body;
    // validation
        if(password != confirmPassword){
            return res.json({
                success:false,
                message:'Password not matching',
            })
        }
    //get userdetails from db using token
        const userDetails = await user.findOne({token:token});

    // if no entry - invaild  token
        if(!userDetails){
            return res.json({
                success:false,
                message:'Token is invalid',

            })
        }
    // token expiry time check
       if(userDetails.resetPasswordExpires < Date.now()){
        return res.json({
            success:false,
            message:'Token is expired, Please regenerate your token',
        })
       }

     
    // hash password
     const hashedPassword = await bcrypt.hash(password, 10);
    // update password
       await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true}
        
       )
    // return response 
        return res.json({
            success:true,
            message:'Password reset successfully',
        })
  
    } catch (error) {
        console.log(error);
         return res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset password mail',
        })
    }
}