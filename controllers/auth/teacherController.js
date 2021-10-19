import { Teacher, Student } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { teacherValidator } from "../../validators";
import Joi from "joi";

const teacherController = {
  async createTeacher(req, res, next) {
    const { error } = teacherValidator.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      const exist = await Teacher.exists({ mobile: req.body.mobile });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("this mobile number already taken.")
        );
      }
    } catch (error) {
      return next(error);
    }

    try {
      const exist = await Teacher.exists({ email: req.body.email });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("this email id already taken.")
        );
      }
    } catch (error) {
      return next(error);
    }

    try {
      const exist = await Teacher.exists({ doc_id: req.body.doc_id });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist(
            "this teacher document id already taken."
          )
        );
      }
    } catch (error) {
      return next(error);
    }

    let result;
    try {
      let saveData = new Teacher({ ...req.body });
      result = await saveData.save();
    } catch (error) {
      return next(error);
    }

    res.status(201).json({
      status: true,
      message: "successfully create a teacher and please upload documents.",
      id: result._id,
    });
  },

  async updateTeacher(req, res, next) {
    //validation
    const teacherUpdateSchema = Joi.object({
      email: Joi.string().min(3).max(25).email(),
      mobile: Joi.string()
        .length(10)
        .pattern(/^[0-9]+$/),
      qualification: Joi.string().min(3).max(15),
    });
    const { error } = teacherUpdateSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { mobile, email, qualification } = req.body;
    try {
      const exist = await Teacher.exists({ mobile });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("this mobile number already taken.")
        );
      }
    } catch (error) {
      return next(error);
    }

    try {
      const exist = await Teacher.exists({ email });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("this email id already taken.")
        );
      }
    } catch (error) {
      return next(error);
    }

    // than updates
    let document;
    try {
      document = await Teacher.findOneAndUpdate(
        { _id: req.params.id },
        { mobile, email, qualification },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }

    res
      .status(200)
      .json({ status: true, msg: "successfully updates ", data: document });
  },

  //delete teacher
  async deleteTeacher(req, res, next) {
    try {
      const document = await Teacher.findOneAndRemove({ _id: req.params.id });
      if (!document) {
        return next(new Error("teacher not avaible!"));
      }
    } catch (error) {
      return next(error);
    }
    res
      .status(200)
      .json({ status: true, message: "successfully deleted teacher!" });
  },

  //find one teacher
  async findTeacher(req, res, next) {
    const teacher_id = req.query.teacher_id;
    const class_id = req.query.class_id;

    //validation
    const schema = Joi.object({
      teacher_id: Joi.string().length(24),
      class_id: Joi.string().length(24),
    });
    const { error } = schema.validate({ teacher_id, class_id });
    if (error) {
      return next(error);
    }

    let query = {};
    if (teacher_id != null) {
      query = { _id: teacher_id };
    } else if (class_id != null) {
      query = { classes: class_id };
    } else {
      return res.status(400).json({ message: "Invalid input field" });
    }
    let document;
    try {
      document = await Teacher.findOne(query).populate('classes','name');
    } catch (error) {
      return next(CustomErrorHandler.serverError);
    }
    res
      .status(200)
      .json({ status: true, message: "show a teacher", data: document });
  },

  //find all teacher
  async findAllTeacher(req, res, next) {
    let document;
    try {
      document = await Teacher.find()
        .select("-updatedAt -__v")
        .sort({ _id: 1 });
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(200).json({
      status: true,
      message: "successfully show all teacher!",
      data: document,
    });
  },

  //find one own teacher or students  ************************************
  async findTeacherOrStudents(req, res, next) {
    const teacher_id = req.params.id;
    //validation
    const schema = Joi.object({
      teacher_id: Joi.string().length(24).required(),
    });
    const { error } = schema.validate({ teacher_id });
    if (error) {
      return next(error);
    }

    let output = {};
    let document;
    try {
      document = await Teacher.findOne({ _id: teacher_id }).populate(
        "classes",
        "name"
      );
    } catch (error) {
      return next(CustomErrorHandler.serverError);
    }

    let documentStudents = [];
    if (document.classes != null && document.classes !== undefined) {
      try {
        documentStudents = await Student.find({
          classes: document.classes._id,
        }).populate("classes", "_id name");
      } catch (error) {
        return next(CustomErrorHandler.serverError());
      }
    }
    output = {
      teacher: document,
      student: documentStudents,
    };
    res.status(200).json({
      status: true,
      message: "show a teacher info and assigned class wise students",
      data: output,
    });
  },
};

export default teacherController;
