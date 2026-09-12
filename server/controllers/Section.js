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
    .populate({
				path: "courseContent",
				populate: {
					path: "subSection",
				},
			})
			.exec();
   // Return the updated course object in the response
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


// UPDATE a section
exports.updateSection = async (req, res) => {
	try {
		const { sectionName, sectionId } = req.body;
		const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);
		res.status(200).json({
			success: true,
			message: section,
		});
	} catch (error) {
		console.error("Error updating section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};


// DELETE a section
exports.deleteSection = async (req, res) => {
	try {
		const { sectionId } = req.params;
		await Section.findByIdAndDelete(sectionId);
		res.status(200).json({
			success: true,
			message: "Section deleted",
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
