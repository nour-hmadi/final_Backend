import ContactUsDetails from "../models/contactModel.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//create a new ContactUsDetails
const createContactUsDetails = async (req, res) => {
  const { title, description } = req.body;
  try {
    let image = req.file.path; //get the path of the image
    const uploadedImage = await cloudinary.uploader.upload(image); // upload the image to cloudinary
    const newContactUsDetails = new ContactUsDetails({
      image: {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
      title,
      description,
    });
    const savedContactUsDetails = await newContactUsDetails.save();
    res.status(201).json({
      message: "ContactUsDetails Successfully created",
      data: savedContactUsDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to create ContactUsDetails",
    });
  }
};

//get a ContactUsDetails
const getContactUsDetails = async (req, res) => {
  const allContactUsDetails = await ContactUsDetails.find();
  res.json({
    message: "All ContactUsDetails",
    status: 200,
    data: allContactUsDetails,
  });
};

// GET /cards/:id - retrieve a specific card by ID
const getCardById = async (req, res) => {
  const { id } = req.params;
  try {
    const card = await ContactUsDetails.findById(id);
    if (!card) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete a ContactUsDetails
const deleteContactUsDetails = async (req, res) => {
  const { id } = req.params;
  try {
    await ContactUsDetails.findByIdAndRemove(id);
    res.status(200).json({
      message: "ContactUsDetails Successfully deleted",
      data: null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to delete ContactUsDetails",
    });
  }
};

//update ContactUsDetails
// const updateContactUsDetails = async (req, res) => {
//     const { id } = req.params;
//     const { title, description } = req.body;
//     try {
//         let image;
//         if (req.file) {
//             image = await req.file.path;
//             const uploadedImage = await cloudinary.uploader.upload(rep.file.path);
//             image = uploadedImage.secure_url;
//         }
//         const editContactUsDetails = {
//             image,
//             title,
//             description,
//         };
//         const updatedContactUsDetails = await ContactUsDetails.findByIdAndUpdate(id, editContactUsDetails);
//         res.json({
//             message: "ContactUsDetails updated successfully",
//             status: 200,
//             data: editContactUsDetails,
//         });
//     } catch (error) {
//         console.log(error);
//         res.json({
//             message: "ContactUsDetails updated failed",
//             status: 203,
//         });
//     }
// };
const updateContactUsDetails = async (req, res) => {
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

    const updatedContactUsDetails = await ContactUsDetails.findByIdAndUpdate(
      id,
      editContactUsDetails,
      { new: true } // To return the updated document
    );

    res.json({
      message: "ContactUsDetails updated successfully",
      status: 200,
      data: updatedContactUsDetails,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "ContactUsDetails update failed",
      status: 203,
    });
  }
};

export default {
  createContactUsDetails,
  getContactUsDetails,
  deleteContactUsDetails,
  updateContactUsDetails,
  getCardById,
};
