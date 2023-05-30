import ResearchModel from "../models/researchModel.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//create a new ContactUsDetails
const createData = async (req, res) => {
  const { title, description,} = req.body;
  try {
    let image = req.file.path; //get the path of the image
    const uploadedImage = await cloudinary.uploader.upload(image); // upload the image to cloudinary
    const newData = new ResearchModel({
      image: {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
      title,
      description,
    });
    const savedData = await newData.save();
    res.status(201).json({
      message: "new data successfully created",
      data: savedData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "failed to add data",
    });
  }
};

//get all data
const getall = async (req, res) => {
    try{
  const allData = await ResearchModel.find();
  res.json({
    message: "all data",
    status: 200,
    data: allData,
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
    const deletedData = await ResearchModel.findByIdAndRemove(id);

    res
      .status(200)
      .json({ message: ` data with id = ${id} deleted successfully`,
    data: deletedData, });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "ERROR",
    });
  }
};
// GET /cards/:id - retrieve a specific card by ID
const getDataById = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const dataId = await ResearchModel.findById(id);
    if (!dataId)
      return res.status(404).json({
        data: `data with this ${id} id no longer exist in the database`,
      });

    return res.status(200).json({
      message: `data of id ${id}`,
      data: dataId,
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

    const editData = {
      image: uploadedImage
        ? {
            public_id: uploadedImage.public_id,
            url: uploadedImage.secure_url,
          }
        : null,
     title,
     description,
     
    };

    const updatedData = await ResearchModel.findByIdAndUpdate(
      id,
      editData,
      { new: true } // To return the updated document
    );

    res.json({
      message: "Data updated successfully",
      status: 200,
      data: updatedData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  createData,
  getall,
  deleteData,
  updateData,
  getDataById,
};
