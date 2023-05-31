import AnnModel from "../models/AnnouncementModel.js";

class Controller {
  //get All
  async getAll(req, res, next) {
    try {
      const allData = await AnnModel.find({});
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
      const data = await AnnModel.findById(id);

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
    const { title, description, type, day, month } = req.body;
    try {
      const newdata = await AnnModel.create({
        type,
        description,
        title,
        day,
        month,
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
      const data = await AnnModel.findById(req.params.id);
      console.log(req.params.id);
      if (!data) {
        return res.status(404).json({ message: "Data not found" });
      }

      const { title, description, type, day, month } = req.body;

      if (description) data.description = description;
      if (title) data.title = title;
      if (type) data.type = type;
      if (month) data.month = month;
      if (day) data.day = day;

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
      const data = await AnnModel.findById(id);
      if (!data) {
        return res.status(404).json({
          message: "not found",
        });
      }
      const result = await AnnModel.findByIdAndRemove(id);

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
