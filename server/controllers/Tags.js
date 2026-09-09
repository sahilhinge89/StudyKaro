const Tags = require("../models/Tags");

//create Tag  handler function

exports.createCategory = async (req, res) => {
  try {
    // fetch data
    const { name, description } = req.body;
    //validation
    if (!name || !description) {
      return res.status(401).json({
        success: true,
        message: "All fields are required",
      });
    }
    //create entry in DB
    const tagDetails = await Tag.createTag({
      name: name,
      decription: description,
    });
    console.log(tagDetails);

    // return response
    return res.status(200).json({
      success: true,
      message: "Tag Created Successfully",
    });
  } catch (error) {}
};

// getaAllTags handler function

exports.showAllCategory = async (req, res) => {
  try {
    const allTags = await Tags.find({}, { name: true, description: true });
    res.status(200).json({
      success: true,
      message: "All tags returned successfully",
      allTags,
    });
  } catch (error) {}
};
