import Joi from "joi";
  
//validation

const attendSchema = Joi.object({
    teacher_id:Joi.string().min(24).max(24).required(),
    class_id:Joi.string().min(24).max(24).required(),
    attlist:Joi.array()
    .items({
        student_id: Joi.string().min(24).max(24).required(),
        att_type: Joi.number().required(),
        name: Joi.string().required(),
    }),

});

export default attendSchema;
