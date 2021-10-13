import { Parent } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import { parentValidator } from "../../validators";
import Joi from "joi";


const parentController ={

    async createParent(req,res,next){
        const { error } = parentValidator.validate(req.body);
    if (error) {
      return next(error);
    }

    try {
      const exist = await Parent.exists({ mobile: req.body.mobile });
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
        const exist = await Parent.exists({ email: req.body.email });
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
        const exist = await Parent.exists({ doc_id: req.body.doc_id });
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
      let saveData = new Parent({ ...req.body });
      result = await saveData.save();
    } catch (error) {
      return next(error);
    }

    res
      .status(201)
      .json({ status: true, message: "successfully create a parent and please upload documents.",id:result._id});

    },

    async updateParent(req,res,next){

         //validation
    const parentUpdateSchema = Joi.object({
        email:Joi.string().min(3).max(25).email(),
        mobile:Joi.string().length(10).pattern(/^[0-9]+$/),  
        occupation: Joi.string().min(3).max(15),
    });
    const { error } = parentUpdateSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const { mobile, email,occupation } = req.body;
    try {
        const exist = await Parent.exists({mobile});
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
          const exist = await Parent.exists({ email });
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
      document = await Parent.findOneAndUpdate(
        { _id: req.params.id },
        { mobile, email,occupation },
        { new: true }
      );
    } catch (error) {
      return next(error);
    }

    res
      .status(200)
      .json({ status: true, msg: "successfully updates ", data: document });

    },

    //delete parent 
    async deleteParent(req,res,next){
        try {
            const document = await Parent.findOneAndRemove({ _id: req.params.id });
            if (!document) {
              return next(new Error("parent data not avaible!"));
            }
          } catch (error) {
            return next(error);
          }
          res.status(200).json({ status: true, msg: "successfully deleted parent data!" });
    },

    //Find one parent data
    async findParent(req,res,next){
        let document;
        try {
          document = await Parent.findOne({ _id: req.params.id });
        } catch (error) {
          return next(CustomErrorHandler.serverError);
        }
        res.status(200).json({ status: true, message: "show a parent",data:document});

    },

    //find all parent  data
    async findAllParent(req,res,next){
        let document;
    try {
      document = await Parent.find().populate('students')
        .select("-updatedAt -__v")
        .sort({ _id: 1 });
    } catch (error) {
      return next(CustomErrorHandler.serverError());
    }
    res.status(200).json({ status: true, message: "show all parents successfully",data:document});
    }




}


export default parentController;