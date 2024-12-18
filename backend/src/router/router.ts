import { Router } from "express";
import { signinController, updateUserController } from "../controllers/user.controller";
import { getAllTeachers, getCurrentTeachers, getTeacherById} from "../controllers/teachers.controller";
import { getRatingsByTeacherSubjectId, getRatingsSummary } from "../controllers/ratings.controller";
import { getAllSubjects, getSubjectById } from "../controllers/subjects.controller";
import { evaluateTeacher, getTeacherToEvaluate } from "../controllers/evaluate.teacher.controller";



const router = Router();

router.post('/login', signinController);
router.post('/update', updateUserController);
router.get('/current-teachers', getCurrentTeachers);
router.get('/teachers', getAllTeachers);
router.get('/teachers/:id', getTeacherById);
router.get('/subjects', getAllSubjects);
router.get('/subjects/:id', getSubjectById);
router.get('/ratings', getRatingsSummary); 
router.get('/ratings/:teacherSubjectId', getRatingsByTeacherSubjectId);
router.get('/evaluate-teacher', getTeacherToEvaluate);
router.post('/evaluate-teacher', evaluateTeacher)
router.get('/search');




export default router;