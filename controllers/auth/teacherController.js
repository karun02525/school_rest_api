import { Teacher } from "../../models";
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
          CustomErrorHandler.alreadyExist(
            "this mobile number already taken."
          )
        );
      }
    } catch (error) {
      return next(error);
    }

    try {
        const exist = await Teacher.exists({ email: req.body.email });
        if (exist) {
          return next(
            CustomErrorHandler.alreadyExist(
              "this email id already taken."
            )
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

    res.status(201).json({ status: true, message: "successfully create a teacher and please upload documents.",id:result._id});
  },

  async updateTeacher(req, res, next) {
    //validation
    const teacherUpdateSchema = Joi.object({
        email:Joi.string().min(3).max(25).email(),
        mobile:Joi.string().length(10).pattern(/^[0-9]+$/),  
        qualification: Joi.string().min(3).max(15),
    });
    const { error } = teacherUpdateSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { mobile, email,qualification } = req.body;
    try {
        const exist = await Teacher.exists({mobile});
        if (exist) {
          return next(
            CustomErrorHandler.alreadyExist(
              "this mobile number already taken."
            )
          );
        }
      } catch (error) {
        return next(error);
      }
  
      try {
          const exist = await Teacher.exists({ email });
          if (exist) {
            return next(
              CustomErrorHandler.alreadyExist(
                "this email id already taken."
              )
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
        { mobile, email,qualification },
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
    res.status(200).json({ status: true, message: "successfully deleted teacher!" });
  },

  //find one teacher
  async findTeacher(req, res, next) {
    let document;
    try {
      document = await Teacher.findOne({ _id: req.params.id });
    } catch (error) {
      return next(CustomErrorHandler.serverError);
    }
    res.status(200).json({ status: true, message: "show a teacher",data:document});
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
    res.status(200).json({ status: true, message: "successfully deleted teacher!",data:document });
  },
};

export default teacherController;
