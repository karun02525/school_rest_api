import Joi from "joi";
import { Student, AssignTeacher, Parent, Teacher } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import multer from "multer";
import path from "path";
import fs from "fs";

var storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

var upload = multer({ storage: storage });

var uploadMultiple = upload.fields([
  { name: "avatar" },
  { name: "parent_avatar" },
  { name: "student_doc_front" },
  { name: "student_doc_back" },
  { name: "parent_doc_front" },
  { name: "parent_doc_back" },
]);

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, Date.now() + uniqueName);
  },
});

const uploadProfile = multer({ storage1, storage1 }).single("avatar");

const uploadFrontDocments = multer({ storage1 }).single("doc_front_avatar");

const uploadBackDocments = multer({ storage1 }).single("doc_back_avatar");

const adminController = {
  async uploadStudentFiles(req, res, next) {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }

      //validation
      const { id } = req.body;
      const schema = Joi.object({
        id: Joi.string().length(24).required(),
      });
      const { error } = schema.validate({ id });
      if (error) {
        return next(error);
      }

      const file = req.files;
      if (file) {
        const key = Object.keys(file)[0];

        if (key === "avatar") {
          doOperationStudentUpdate(
            id,
            { avatar: file["avatar"][0].path },
            next
          );
        } else if (key === "parent_avatar") {
          doOperationStudentUpdate(
            id,
            { parent_avatar: file["parent_avatar"][0].path },
            next
          );
        } else if (key === "student_doc_front") {
          doOperationStudentUpdate(
            id,
            { student_doc_front: file["student_doc_front"][0].path },
            next
          );
        } else if (key === "student_doc_back") {
          doOperationStudentUpdate(
            id,
            { student_doc_back: file["student_doc_back"][0].path },
            next
          );
        } else if (key === "parent_doc_front") {
          doOperationStudentUpdate(
            id,
            { parent_doc_front: file["parent_doc_front"][0].path },
            next
          );
        } else if (key === "parent_doc_back") {
          doOperationStudentUpdate(
            id,
            { parent_doc_back: file["parent_doc_back"][0].path },
            next
          );
        } else {
          res.status(400).json({
            status: false,
            message: 'photo upload has failed.',
          });
        }
      }
      res.json({
        status: true,
        message: 'photo updated successfully!!',
      });
    });
  },

  // Assign Roll No
  async assignRollno(req, res, next) {
    //validation
    const class_id = req.query.class_id;
    const student_id = req.query.student_id;
    const rollno = req.query.rollno;

    const rollnoSchema = Joi.object({
      student_id: Joi.string().length(24).required(),
      class_id: Joi.string().length(24).required(),
      rollno: Joi.number().min(1).max(99).required(),
    });
    const { error } = rollnoSchema.validate({ class_id, student_id, rollno });
    if (error) {
      return next(error);
    }

    try {
      const exist = await Student.exists({ student_id, rollno, class_id });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("this roll number already taken.")
        );
      }
    } catch (error) {
      return next(error);
    }

    // than updates
    let document;
    try {
      document = await Student.findOneAndUpdate(
        { _id: student_id },
        { rollno },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }
    res.status(200).json({
      status: true,
      message: "Roll no updated successfully!!",
      data: document,
    });
  },

  //Find All Assign Rollno
  async findAllAssignRollno(req, res, next) {
    let document;
    try {
      document = await Student.find();
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json({ status: true, data: document });
  },

  //Find all Students by class id
  async findAllStudentsByClassId(req, res, next) {
    const class_id = req.query.class_id;
    const schema = Joi.object({
      class_id: Joi.string().length(24).required(),
    });
    const { error } = schema.validate({ class_id });
    if (error) {
      return next(error);
    }

    let document;
    try {
      document = await Student.find({ class_id })
        .populate("parent")
        .populate("classes", "_id name")
        .populate(
          "teacher",
          "fname lname email mobile gender qualification avatar"
        );
      if (document.length === 0) {
        return res
          .status(400)
          .json({ status: false, message: "data are empty" });
      }
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    return res.json({ status: true, message: "success", data: document });
  },

  //Find By  To All Students
  async findAllStudents(req, res, next) {
    let document;
    try {
      document = await Student.find()
        .select("-updatedAt -__v")
        .sort({ _id: 1 });
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    res.json(document);
  },

  //Assign Teacher with class
  async assignUpdateTeacher(req, res, next) {
    //validation
    const schema = Joi.object({
      teacher_id: Joi.string().length(24).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return next(error);
    }

    const { teacher_id } = req.body;

    try {
      const exist = await AssignTeacher.exists({ teacher: teacher_id });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("this the teacher already taken.")
        );
      }
    } catch (error) {
      return next(error);
    }

    let document;
    try {
      document = await AssignTeacher.findOneAndUpdate(
        { class_id: req.params.id },
        { teacher: teacher_id, status: 1 },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }
    res
      .status(200)
      .json({ status: true, message: "updates successfully", data: document });
  },
  //Find assign teacher
  async findAssignTeacher(req, res, next) {
    let document;
    try {
      document = await AssignTeacher.find()
        .populate("teacher", "fname lname mobile avatar")
        .select("-createdAt -__v -_id");
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    res.json({ status: true, data: document });
  },

  //delete assign class teacher
  async deleteAssignClassTeacher(req, res, next) {
    let document;
    try {
      document = await AssignTeacher.findOneAndUpdate(
        { class_id: req.params.id },
        { teacher: null, status: 0 },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }
    res
      .status(200)
      .json({ status: true, message: "successfully deleted assign teacher!" });
  },

  //Upload Profile Student,Teacher******************************
  async uploadProfilePhoto(req, res, next) {
    uploadProfile(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
      //validation
      const schema = Joi.object({
        id: Joi.string().length(24).required(),
        type: Joi.string().valid("student", "teacher").required(),
      });
      const { error } = schema.validate(req.body);
      if (error) {
        return next(error);
      }
      const { type, id } = req.body;
      const filePath = req.file.path;

      if (type === "student") {
        try {
          await Student.findOneAndUpdate({ _id: id }, { avatar: filePath });
        } catch (error) {
          return next(error);
        }
      } else {
        try {
          await Teacher.findOneAndUpdate({ _id: id }, { avatar: filePath });
        } catch (error) {
          return next(error);
        }
      }
      res.json({
        status: true,
        message: `${type} picture updated successfully!!`,
      });
    });
  },

  //Upload Fornt Doctments Student,Parent,Teacher
  async uploadDocmentFrontPhoto(req, res, next) {
    uploadFrontDocments(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
      //validation
      const schema = Joi.object({
        id: Joi.string().length(24).required(),
        type: Joi.string().valid("student", "teacher", "parent").required(),
      });
      const { error } = schema.validate(req.body);
      if (error) {
        return next(error);
      }
      const { type, id } = req.body;
      const doc_front_avatar = req.file.path;

      if (type === "student") {
        try {
          await Student.findOneAndUpdate({ _id: id }, { doc_front_avatar });
        } catch (error) {
          return next(error);
        }
      } else if (type === "parent") {
        try {
          await Parent.findOneAndUpdate({ _id: id }, { doc_front_avatar });
        } catch (error) {
          return next(error);
        }
      } else {
        try {
          await Teacher.findOneAndUpdate({ _id: id }, { doc_front_avatar });
        } catch (error) {
          return next(error);
        }
      }
      res.json({
        status: true,
        message: `${type} document front updated successfully!!`,
      });
    });
  },

  //Upload Back Doctments Student,Parent,Teacher
  async uploadDocmentBackPhoto(req, res, next) {
    uploadBackDocments(req, res, async (err) => {
      if (err) {
        return next(CustomErrorHandler.serverError());
      }
      //validation
      const schema = Joi.object({
        id: Joi.string().length(24).required(),
        type: Joi.string().valid("student", "teacher", "parent").required(),
      });
      const { error } = schema.validate(req.body);
      if (error) {
        return next(error);
      }
      const { type, id } = req.body;
      const doc_back_avatar = req.file.path;

      if (type === "student") {
        try {
          await Student.findOneAndUpdate({ _id: id }, { doc_back_avatar });
        } catch (error) {
          return next(error);
        }
      } else if (type === "parent") {
        try {
          await Parent.findOneAndUpdate({ _id: id }, { doc_back_avatar });
        } catch (error) {
          return next(error);
        }
      } else {
        try {
          await Teacher.findOneAndUpdate({ _id: id }, { doc_back_avatar });
        } catch (error) {
          return next(error);
        }
      }
      res.json({
        status: true,
        message: `${type} document back updated successfully!!`,
      });
    });
  },
  //delete uploaded file photos,front doc,back doc vai student,teacher,parent
  async deleteUploadedPhoto(req, res, next) {
    const id = req.query.id;
    const type = req.query.type;
    const source = req.query.source;

    //validation
    const schema = Joi.object({
      id: Joi.string().length(24).required(),
      type: Joi.string().valid("student", "teacher", "parent").required(),
      source: Joi.string()
        .valid("avatar", "doc_front_avatar", "doc_back_avatar")
        .required(),
    });
    const { error } = schema.validate({ id, type, source });
    if (error) {
      return next(error);
    }

    // For Student
    if (type === "student") {
      try {
        const document = await Student.findOneAndUpdate(
          { _id: id },
          { [source]: "" }
        );
        doOperationDelete(document, source, next);
      } catch (error) {
        return next(error);
      }
    }

    //For Parent
    if (type === "parent") {
      try {
        const document = await Parent.findOneAndUpdate(
          { _id: id },
          { [source]: "" }
        );
        doOperationDelete(document, source, next);
      } catch (error) {
        return next(error);
      }
    }

    //for Teacher Operation
    if (type === "teacher") {
      try {
        const document = await Teacher.findOneAndUpdate(
          { _id: id },
          { [source]: "" }
        );
        doOperationDelete(document, source, next);
      } catch (error) {
        return next(error);
      }
    }

    res.json({
      status: true,
      message: `${type} ${source} deleted successfully!`,
    });
  },
};

//for Common methods
const doOperationDelete = (document, source, next) => {
  let imagePath;
  if (source === "avatar") {
    imagePath = document.avatar;
  }
  if (source === "doc_front_avatar") {
    imagePath = document.doc_front_avatar;
  }
  if (source === "doc_back_avatar") {
    imagePath = document.doc_back_avatar;
  }
  //image delete
  fs.unlink(`${appRoot}/${imagePath}`, (err) => {
    if (err) {
      return next(CustomErrorHandler.serverError("file not avaible!"));
    }
  });
};

//for Common methods
const doOperationStudentUpdate = async (_id, data, next) => {
  try {
    await Student.findOneAndUpdate({ _id }, data);
  } catch (error) {
    return next(error);
  }
};

export default adminController;
