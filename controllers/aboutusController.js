import Model from "../models/aboutusModel.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//create a new ContactUsDetails
const createData = async (req, res) => {
  const { title, description } = req.body;
  try {
    let image = req.file.path; //get the path of the image
    const uploadedImage = await cloudinary.uploader.upload(image); // upload the image to cloudinary
    const newContactUsDetails = new Model({
      image: {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
      title,
      description,
    });
    const savedContactUsDetails = await newContactUsDetails.save();
    res.status(201).json({
      message: "new data successfully created",
      data: savedContactUsDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "failed to add data",
    });
  }
};

//get all data
const getData = async (req, res) => {
    try{
  const allContactUsDetails = await Model.find();
  res.json({
    message: "all data",
    status: 200,
    data: allContactUsDetails,
  });
}
catch (err) {
    return res.status(500).json({
      data: err
    })
  }
};

//delete a ContactUsDetails
const deleteData = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedcard = await Model.findByIdAndRemove(id);

    res
      .status(200)
      .json({ message: ` data with id = ${id} deleted successfully` });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "ERROR",
    });
  }
};
// GET /cards/:id - retrieve a specific card by ID
const getDataById = async (req, res) => {
  const id = req.params.d;
  console.log(id);
  try {
    const contactDetailsId = await Model.findById(id);
    if (!contactDetailsId)
      return res.status(404).json({
        data: `data with this ${id} id no longer exist in the database`,
      });

    return res.status(200).json({
      message: `data of id ${id}`,
      data: contactDetailsId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Failure `,
    });
  }
};

//update
const updateData = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    let image;
    let uploadedImage;

    if (req.file) {
      image = req.file.path;
      uploadedImage = await cloudinary.uploader.upload(image);
    }

    const editContactUsDetails = {
      image: uploadedImage
        ? {
            public_id: uploadedImage.public_id,
            url: uploadedImage.secure_url,
          }
        : null,
      title,
      description,
    };

    const updatedContactUsDetails = await Model.findByIdAndUpdate(
      id,
      editContactUsDetails,
      { new: true } // To return the updated document
    );

    res.json({
      message: "Data updated successfully",
      status: 200,
      data: updatedContactUsDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  createData,
  getData,
  deleteData,
  updateData,
  getDataById,
};
