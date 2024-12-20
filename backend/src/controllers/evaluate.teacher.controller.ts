import { Request, Response } from "express";
import { teacherHistory } from "../services/sira";
import { Rating, Subject, Teacher, TeacherSubject } from "../models";



interface TeacherSubjectWithRelations extends TeacherSubject {
  'Teacher.name': string | null;
  'Subject.name': String | null;
}


export const getTeacherToEvaluate = async (
  req: Request & { user?: string; session?: string }, res: Response) => {
  try {
    if (!req.user || !req.session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const currentTeachers = await teacherHistory(req.session);
    const teacherSubject: TeacherSubjectWithRelations[] = [];
    for (const teacher of currentTeachers) {
      const teacherSubjectDB = await TeacherSubject.findOne({
        where: { teacher_id: teacher.id, subject_id: teacher.codeSubject },
        include: [
          {
            model: Teacher,
            attributes: ["name"],
            required: true,
          },
          {
            model: Subject,
            attributes: ["name"],
            required: true,
          },
        ],
        raw: true,
      }) as TeacherSubjectWithRelations;
      if (!teacherSubjectDB) {
        res.status(404).json({ message: "Teacher not found" });
        return;
      }
      teacherSubject.push(teacherSubjectDB);
    }

    const rating = await Rating.findAll({
      where: {
        teacher_subject_id: teacherSubject.map((ts) => ts.id),
        student_id: req.user,
      },
      attributes: ["teacher_subject_id", "rating", "comment"],
      raw: true,
    });

    res.json({
      teachers: teacherSubject.map((ts) => {
        return {
          id: ts.id,
          name: ts["Teacher.name"],
          subject: ts["Subject.name"],
          rated: rating.some((r) => r.teacher_subject_id === ts.id),
        };
      }),
    });
  } catch (error) {
    console.error("Error getting teachers to evaluate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const evaluateTeacher = async (req: Request & { user?: string }, res: Response) => {
    try {
        console.log(req.user);
        console.log(req.body);
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { teacher_subject_id, rating, comment } = req.body;
        if (!teacher_subject_id || !rating || comment === undefined) {
            res.status(400).json({ message: 'teacher_subject_id, rating and comment are required' });
            return;
        }

        if (rating < 1 || rating > 5) {
            res.status(400).json({ message: 'Rating must be between 1 and 5' });
            return;
        }

        const teacherSubject = await TeacherSubject.findOne({ where: { id: teacher_subject_id } });
        if (!teacherSubject) {
            res.status(404).json({ message: 'TeacherSubject not found' });
            return;
        }

        const ratingDB = await Rating.findOne({ where: { student_id: req.user, teacher_subject_id }});

        if (ratingDB) {
           res.status(400).json({ message: 'Rating already exists' });
           return;
        } 

        await Rating.create({ student_id: req.user, teacher_subject_id, rating, comment });
        
        res.json({ message: 'Rating created' });
    } catch (error) {
       
        res.status(500).json({ message: 'Internal server error' });
    }
};
