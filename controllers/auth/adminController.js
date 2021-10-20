import Joi from "joi";
import { Student, AssignTeacher, Attendance, Teacher } from "../../models";
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
  { name: "student_avatar" },
  { name: "parent_avatar" },
  { name: "student_doc_front" },
  { name: "student_doc_back" },
  { name: "parent_doc_front" },
  { name: "parent_doc_back" },
  { name: "teacher_avatar" },
  { name: "teacher_doc_front" },
  { name: "teacher_doc_back" },
  { name: "certificate_doc_front" },
  { name: "certificate_doc_back" },
]);

const adminController = {

  // Assign Roll No
  async assignRollno(req, res, next) {
    //validation
    const student_id = req.query.student_id;
    const rollno = parseInt(req.query.rollno);
    const class_id = req.query.class_id;

    const rollnoSchema = Joi.object({
      student_id: Joi.string().length(24).required(),
      class_id: Joi.string().length(24).required(),
      rollno: Joi.number().min(1).max(99).required(),
    });
    const { error } = rollnoSchema.validate({student_id, rollno,class_id });
    if (error) {
      return next(error);
    }

    try {
      const exist = await Student.exists({_id:student_id,classes:class_id});
      if (!exist) {
        return next(
          CustomErrorHandler.alreadyExist("the class id not exist please try again.")
        );
      }
    } catch (error) {
      return next(error);
    }

    try {
     // const data = await Student.exists({classes:class_id ,rollno:rollno});
      const data = await Student.findOne({ $and:[{classes:class_id ,rollno:rollno}]}).populate('classes');
      if (data) {
        return next(
         // CustomErrorHandler.alreadyExist(` already assigned by class roll no.`)
          CustomErrorHandler.alreadyExist(`${data.fname} ${data.lname} already assigned by class ${data.classes.name} roll no ${data.rollno}.`)
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
        { rollno},
        { new: true }
      ).populate('classes');
    } catch (error) {
      return next(error);
    }
    res.status(200).json({
      status: true,
      message:`${document.fname} ${document.lname} roll no assigned by class ${document.classes.name} roll no ${document.rollno} successfully!!.`,
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
      document = await Student.find({ classes:class_id }).populate("classes", "_id name")
      
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

      await Teacher.findOneAndUpdate({ _id: teacher_id },{ classes: req.params.id});

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
        .populate("teacher", "fname lname mobile teacher_avatar")
        .select("-createdAt -__v -_id");
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    res.json({ status: true, data: document });
  },


  //delete assign class teacher**************
  async deleteAssignClassTeacher(req, res, next) {
    const class_id=req.params.id;
    let document;
    try {
      document = await AssignTeacher.findOneAndUpdate(
        { class_id},
        { teacher: null, status: 0 },
        { new: true }
      );
      try{
        await Teacher.findOneAndUpdate({class_id},{ classes:null},{ new: true });
      } catch (error) {
        return next(error);
      }
      } catch (error) {
        return next(error);
      }
      res.status(200)
      .json({ status: true, message: "successfully deleted assign teacher!" });
  },



    //find all Attendance Student
    async findAttendance(req, res, next) {
      let document;
      try {
        document = await Attendance.find();
      } catch (error) {
        return next(CustomErrorHandler.serverError());
      }
      res
        .status(200)
        .json({ status: true, message: "showing all notification", data: document });
    },



  //find Assign Teacher Class Id
  async findAssignTeacherClassId(req, res, next) {
    const class_id = req.query.class_id;
    //validation
    const schema = Joi.object({
      class_id: Joi.string().length(24).required(),
    });
    const { error } = schema.validate({class_id });
    if (error) {
      return next(error);
    }
    let document;
    try {
      document = await AssignTeacher.findOne({class_id})
        .populate("teacher",'-__v')
        .select("-createdAt -__v -_id");
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    res.json({ status: true, data: document });
  },


  //*************************************************** Upload Students & Parents ********************** */   
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

        if (key === "student_avatar") {
          doOperationStudentUpdate(
            id,
            { student_avatar: file["student_avatar"][0].path },
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
  //*************************************************** Upload Teacher ********************** */   
  async uploadTeacherFiles(req, res, next) {
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
        if (key === "teacher_avatar") {
          doOperationTeacherUpdate(
            id,
            { teacher_avatar: file["teacher_avatar"][0].path },
            next
          );
        }  else if (key === "teacher_doc_front") {
          doOperationTeacherUpdate(
            id,
            { teacher_doc_front: file["teacher_doc_front"][0].path },
            next
          );
        } else if (key === "teacher_doc_back") {
          doOperationTeacherUpdate(
            id,
            { teacher_doc_back: file["teacher_doc_back"][0].path },
            next
          );
        } else if (key === "certificate_doc_front") {
          doOperationTeacherUpdate(
            id,
            { certificate_doc_front: file["certificate_doc_front"][0].path },
            next
          );
        } else if (key === "certificate_doc_back") {
          doOperationTeacherUpdate(
            id,
            { certificate_doc_back: file["certificate_doc_back"][0].path },
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
 



  //delete uploaded file photos,front doc,back doc vai student,teacher,parent
  async deleteUploadedPhoto(req, res, next) {
    const id = req.query.id;
    const type = req.query.type;
    const source = req.query.source;

    //validation
    const schema = Joi.object({
      id: Joi.string().length(24).required(),
      type: Joi.string().valid("student", "teacher").required(),
      source: Joi.string().valid("student_avatar", "parent_avatar", "student_doc_front", "student_doc_back", "parent_doc_front", "parent_doc_back"
      , "teacher_avatar", "teacher_doc_front", "teacher_doc_back", "certificate_doc_front", "certificate_doc_back"
      ).required(),
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

//for Common methods delete
const doOperationDelete = (document, source, next) => {
  let imagePath;
  if (source === "student_avatar") {
    imagePath = document.student_avatar;
  }else if (source === "parent_avatar") {
    imagePath = document.parent_avatar;
  }else if (source === "student_doc_front") {
    imagePath = document.student_doc_front;
  }else if (source === "student_doc_back") {
    imagePath = document.student_doc_back;
  }else if (source === "parent_doc_front") {
    imagePath = document.parent_doc_front;
  }else if (source === "parent_doc_back") {
    imagePath = document.parent_doc_back;
  }else if (source === "teacher_avatar") {
    imagePath = document.teacher_avatar;
  }else if (source === "teacher_doc_front") {
    imagePath = document.teacher_doc_front;
  }else if (source === "teacher_doc_back") {
    imagePath = document.teacher_doc_back;
  }else if (source === "certificate_doc_front") {
    imagePath = document.certificate_doc_front;
  }else if (source === "certificate_doc_back") {
    imagePath = document.certificate_doc_back;
  }

  //image delete
  fs.unlink(`${appRoot}/${imagePath}`, (err) => {
    if (err) {
      return next(CustomErrorHandler.serverError("file not avaible!"));
    }
  });
};

//for Student  Common methods
const doOperationStudentUpdate = async (_id, data, next) => {
  try {
    await Student.findOneAndUpdate({ _id }, data);
  } catch (error) {
    return next(error);
  }
};

//for Teacher Common methods
const doOperationTeacherUpdate = async (_id, data, next) => {
  try {
    await Teacher.findOneAndUpdate({ _id }, data);
  } catch (error) {
    return next(error);
  }
};

export default adminController;
