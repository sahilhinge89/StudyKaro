const {instance} = require('../config/razorpay');
const Course = require('../models/Courses')
const User = require ('../models/User')
const mailSender = require('../utils/mailSender')
const {couresEnrollmentEmail} = require('../mail/templates/courseEnrollmentEmail');
const Courses = require('../models/Courses');


//capture the payments and initiate the Razorpay order

exports.capturePayment = async (req,res) =>{
 //get courseID and userID

 const {course_id} = req.body;
 const userId = req.user.id;

 //validation
 //valid courseID
 if(!course_id){
    return res.status(401).json({
            success:false,
            message:'Please provide valid course id',
        })
 }

  // valid courseDetails
  
  let course;

  try {
    course = await Courses.findById(course_id);
    if(!course){
        return res.json({
            success:false,
            message:'Could not find the course',
        })
    }
    // user already pay for the same course 
    const uid = new mongoose.Types.ObjectId(userId);
    if (course.studentsEnrolled.includes(uid)){
        return res.status(200).json({
            success:false,
            message:'Student is already enrolled',
        })
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
            success:false,
            message:error.message,
        })
  }
// order create
  const amount = course.price;
  const currency = "INR";
  const options ={
    amount:amount *100,
    currency,
    receipt:Math.random(Date.now().toString()),
    notes:{
        courseId:course_id,
        userId,
    }
  }

  try{
   // initiate the payment using razorpay
   const  paymentResponse = await instance.orders.create(options);
   console.log(paymentResponse);
   
    return res.status(200).json({
            success:true,
            courseName:course.courseName,
            courseDescription: course.courseDecription,
            thumbnail: course.thumbnail,
            orderId: paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount,
          
        })
  }catch(error){
         res.json({
            success:false,
            message:'Could not initiate order',
        })
  }
}


//verifying Singnature of Razorpay and Server

exports.verifySignature =async(req,res) =>{
 const webhookSecret = "12345678"
    const signature = req.header["x-razorpay-signatrue"];
    const shasum = crypto.createHmac("sha256",webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature ===digest){
        console.log('Payment is Authorised');
        const {courseId, userId} =req.body.payload.payment.entity.notes;
        try {
            //fulfill the action

            //find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentEnrolled: userId}},
                {new:true},
            )
            if(!enrolledCourse){

                return res.status(500).json({
               success:false,
               message:'course not found',
           })
           
        }
        console.log(enrolledCourse);

        //find the student and the course to their list enrolled courses me
        const enrolledStudent = await User.findByIdAndUpdate(
            {_id:userId},
            {$push:{courses:courseId}},
            {new:true},
        )
        console.log(enrolledStudent);

        // comfirmation mail sending to the student
        const emailResponse = await mailSender(
                          enrolledStudent.email,
                          'Congratulation From StudyKaro',
                          'Congratulations, you ate onboarded into new StudyKaro Course'
        )

         console.log(emailResponse);
            return res.status(200).json({
                success:true,
                message:'Signature Verified and Cousre Added'
            })
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            })
        }
    }
    else{
         
            return res.status(400).json({
                success:true,
                message:'Invaild could not find'
            })
    }
}   
