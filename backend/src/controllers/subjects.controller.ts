import { Request, Response } from 'express';
import { Subject, TeacherSubject } from '../models';

export const getAllSubjects = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        if (page < 1) {
            res.status(400).json({ message: 'Invalid page' });
            return;
        }
        const subjects = await Subject.findAll(
            {
                limit,
                offset,
                raw: true,
            }
        );
        res.json({ subjects });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getSubjectById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const subject = await Subject.findOne({ where: { id }, raw: true });
        if (!subject) {
            res.status(404).json({ message: 'Subject not found' });
            return;
        }
        const teacherSubjects = await TeacherSubject.findAll({ where: { subject_id: id }, raw: true });
        res.json({ ...subject, teacher_count: teacherSubjects.length });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}   