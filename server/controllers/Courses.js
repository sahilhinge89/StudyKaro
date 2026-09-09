const Courses = require("../models/Courses");
const Tag = require("../models/Tags");
const User = require("../models/User");
const { uploaderImaageToCloudinary } = require("../utils/imageUploader");

// createCoures handler function
exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    //get thumbnail
    const thumbnail = req.files.thumbnailImage;

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // check for instructor

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Insturctor Details: ", instructorDetails);

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Detail not found",
      });
    }

    //check given tag is valid or not
    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag Details not found",
      });
    }

    //Upload Image to Cloudinary
    const thumbnailImage = await uploaderImaageToCloudinary(
      thumbnail,
      process.env.Folder_Name,
    );

    //create an entry for New course

    const newCourse = await Courses.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });
    // add the new course to the user schema of instructor

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true },
    );

    // return response
    return res.status(200).json({
      success: true,
      message: "Course Created Succesfully",
      data: newCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to created error message",
      error: error.message,
    });
  }
};

// showAllCourses handler function

exports.showAllCourses = async (req, res) => {
  try {
    const showAllCourses = await Courses.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      },
    )
      .populate("instructor")
      .exec();

    return re.status(200).json({
      success: true,
      message: "Data for all courses fetched successfully",
      data: newCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to created error message",
      error: error.message,
    });
  }
};
