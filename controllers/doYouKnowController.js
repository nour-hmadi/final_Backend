import Model from "../models/doYouKnowModel.js";

class Controller {
  //get All
  async getAll(req, res, next) {
    try {
      const allData = await Model.find({});
      res.json({
        message: "all data",
        status: 200,
        data: allData,
      });
    } catch (err) {
      return res.status(500).json({
        data: err,
      });
    }
  }

  //get course syllabus by id
  async getByID(req, res, next) {
    let { id } = req.params;

    try {
      const data = await Model.findById(id);

      if (!data)
        return res.status(404).json({
          data: `Info with this ${id} does not exist`,
        });
      return res.status(200).json({
        data: data,
      });
    } catch (err) {
      return res.status(500).json({
        data: data,
      });
    }
  }

  // Add new course
  async post(req, res) {
    const { question, description, result } = req.body;
    try {
      const newdata = await Model.create({
        question: question || "do you know that ...",
        description,
        result,
      });
      res.status(203).json({
        message: "data created successfully",
        newdata,
      });
    } catch (err) {
      return res.status(500).json({
        data: err.message,
      });
    }
  }
  //update a course syllabus by _id
  async put(req, res, next) {
    try {
      const data = await Model.findById(req.params.id);
      console.log(req.params.id);
      if (!data) {
        return res.status(404).json({ message: "Data not found" });
      }

      const { title, description, result } = req.body;

      if (description) data.description = description;
      if (title) data.title = title;
      if (result) data.result = result;

      const updatedData = await data.save();
      res.json(updatedData);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  //delete story by id

  async delete(req, res, next) {
    try {
      let { id } = req.params;
      const data = await Model.findById(id);
      if (!data) {
        return res.status(404).json({
          message: "not found",
        });
      }
      const result = await Model.findByIdAndRemove(id);

      return res.status(200).json({
        message: "deleted successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

const controller = new Controller();

export default controller;
