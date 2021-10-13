import express from "express";

import {adminController} from '../controllers'

const router = express.Router();

router.put('/assign-rollno',adminController.assignRollno)


router.get('/assign-rollno',adminController.findAllAssignRollno)
router.get('/search-students',adminController.findAllStudentsByClassId)


router.put('/assign-teacher/:id',adminController.assignUpdateTeacher)
router.delete('/assign-teacher/:id',adminController.deleteAssignClassTeacher)
router.get('/assign-teacher',adminController.findAssignTeacher)

router.post('/upload-student-files',adminController.uploadStudentFiles)
router.delete('/delete-upload-file',adminController.deleteUploadedPhoto)




export default router;