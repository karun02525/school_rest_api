import express from "express";

import {teacherController,parentController,classController,studentController} from '../controllers'

const router = express.Router();


router.post('/class',classController.createClass)
router.delete('/class/:id',classController.deleteClass)
router.get('/class',classController.findAllClass)


router.post('/teacher',teacherController.createTeacher)
router.put('/teacher/:id',teacherController.updateTeacher)
router.delete('/teacher/:id',teacherController.deleteTeacher)
router.get('/teacher',teacherController.findTeacher)
router.get('/teacher',teacherController.findAllTeacher)



router.post('/student',studentController.createStudent)
router.put('/student/:id',studentController.updateStudent)
router.delete('/student/:id',studentController.deleteStudent)
router.get('/student/:id',studentController.findOneStudent)
router.get('/student',studentController.findAllStudent)
router.get('/search-students',studentController.searchStudents)


router.get('/student-parent',studentController.findStudentsParent)



router.get('/teacher-info/:id',teacherController.findTeacherOrStudents)


export default router;