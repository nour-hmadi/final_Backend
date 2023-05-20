import Model from "../models/courseSyllabusModel.js";

class Controller {
  //get All
  async getAll(req, res, next) {
    try {
      const allCoursesSyllabus = await Model.find({});
      res.json({
        message: "all data",
        status: 200,
        data: allCoursesSyllabus,
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
      const syllabus = await Model.findById(id);

      if (!syllabus)
        return res.status(404).json({
          data: `Data with this ${id} does not exist`,
        });
      return res.status(200).json({
        data: syllabus,
      });
    } catch (err) {
      return res.status(500).json({
        data: syllabus,
      });
    }
  }

  // Add new course
  async post(req, res) {
    const body = req.body;
    try {
      const doc = new Model(body);
      const new_date = await doc.save();
      console.log(body);
      return res.status(200).json({ new_date });
    } catch (err) {
      return res.status(500).json({
        data: err.message,
      });
    }
  }
  //update a course syllabus by _id
  async put(req, res, next) {
    try {
      const info = await Model.findById(req.params.id);
      console.log(req.params.id);
      if (!info) {
        return res.status(404).json({ message: "Data not found" });
      }

      const {
        course_name,
        course_code,
        description,
        credits,
        sem,
        cm,
        td,
        tp,
        hrs,
      } = req.body;
      if (course_name) info.course_name = course_name;
      if (course_code) info.course_code = course_code;
      if (description) info.description = description;
      if (credits) info.credits = credits;
      if (sem) info.sem = sem;
      if (cm) info.cm = cm;
      if (td) info.td = td;
      if (tp) info.tp = tp;
      if (hrs) info.hrs = hrs;

      const updatedInfo = await info.save();
      res.json(updatedInfo);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  //delete story by id

  async delete(req, res, next) {
    try {
      let { id } = req.params;
      const syllabus = await Model.findById(id);
      if (!syllabus) {
        return res.status(404).json({
          message: " Data not found",
        });
      }
      const result = await Model.findByIdAndRemove(id);

      return res.status(200).json({
        message: "Data deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

const controller = new Controller();

export default controller;
