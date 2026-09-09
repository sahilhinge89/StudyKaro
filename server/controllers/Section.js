const Section = require("../models/Section");
const Courses = require("../models/Courses");

exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;

    // data validation
    if (!sectionName || !courseId) {
      res.status(400).json({
        success: true,
        message: "Missing Properties",
      });

      // create section
      const newSection = await Section.create({ sectionName });
      //update course with Section ObjectID
      const updatedCourse = await Courses.findByIdAndUpdate(
        courseId,
        {
          $push: {
            courseContent: newSection._id,
          },
        },
        { new: true },
      );
    }
    // return response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to create Section,Please try again",
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    // data input
    const { sectionName, sectionId } = req.body;
    // data validation
    if (!sectionName || !sectionId) {
      res.status(400).json({
        success: true,
        message: "Missing Properties",
      });
    }
    //update data
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true },
    );

    //return response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending reset password mail",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    //get ID using params
    const { sectionId } = req.params;

    // use findById and delete
    await Section.findByIdAndDelete(sectionId);
    return res.status(200).json({
      success: true,
      message: "Section deleted Successfully",
      error: error.message,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to delete Section,please try again",
      error: error.message,
    });
  }
};
