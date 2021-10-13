import { Student,Parent } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { studentValidator } from "../../validators";
import Joi from "joi";


const studentController = {

  //Student register
  async createStudent(req, res, next) {
    const { error } = studentValidator.validate(req.body);
    if (error) {
      return next(error);
    }
     const {mobile,email,parent_doc_id}=req.body
      try {
        const exist = await Student.exists({mobile,email,parent_doc_id});
        if (exist) {
          return next(
            CustomErrorHandler.alreadyExist(
              "this student already register."
            )
          );
        }
      } catch (error) {
        return next(error);
      }

    let result;
    try {
      let saveData = new Student({...req.body});
      result = await saveData.save();

      //update students id on Parent collection
      //   await Parent.findOneAndUpdate(
      //   { _id: parent_id},
      //   {$push:{students:result._id}},
      // );

    } catch (error) {
      return next(error);
    }
    res.status(201).json({ status: true, message: "successfully create a student and please upload documents.",id:result._id});
  },
  

  //Student update data
  async updateStudent(req, res, next) {
    //validation
    const teacherUpdateSchema = Joi.object({
        mobile:Joi.string().length(10).pattern(/^[0-9]+$/)
    });
    const { error } = teacherUpdateSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { mobile } = req.body;
    try {
        const exist = await Student.exists({mobile});
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
  
    // than updates
    let document;
    try {
      document = await Student.findOneAndUpdate(
        { _id: req.params.id },
        { mobile},
        { new: true }
      );
    } catch (error) {
      return next(error);
    }

    res.status(200).json({ status: true, message: "successfully update a student",data:result});
  },

  //delete Student
  async deleteStudent(req, res, next) {
    try {
      const document = await Student.findOneAndRemove({ _id: req.params.id });
      if (!document) {
        return next(new Error("student not avaible!"));
      }
    } catch (error) {
      return next(error);
    }
    res.status(200).json({ status: true, msg: "successfully deleted student!" });
  },

  //find one Student
  async findStudent(req, res, next) {
    const id=req.params.id
    let query={};
      if(id.length===24) {
        query= { _id: id }
      }else  if(id.length===10) {
          query= { mobile: id }
      }else{
        return res.status(400).json({message:'Invalid input field'});
      }

    let document;
    try {
      document = await Student.findOne(query);
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(200).json({ status: true, message: "show a student",data:document});
  },

  //find all Student
  async findAllStudent(req, res, next) {
    let document;
    try {
      document = await Student.find().populate('parent').populate('classes', '_id name').populate('teacher','fname lname email mobile gender qualification avatar')
        .select("-updatedAt -__v")
        .sort({ _id: 1 });
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(200).json({ status: true, message: "showing all student",data:document});
  },
};

export default studentController;
