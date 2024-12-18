import {Subject, Teacher, TeacherSubject } from '../models';
import { Request, Response } from 'express';
import SiraServiceException, {teacherHistory } from '../services/sira';

interface TeacherHistory {
    id: number;
    name: string;
    subject: string;
    teacher_id: string;
    subject_id: string;
}


export const getCurrentTeachers = async (req: Request & {user?:string, session?:string}, res: Response) => {
    try {
        if (!req.user || !req.session) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const currentTeachers = await teacherHistory(req.session);
        const teachersHistory: TeacherHistory[] = [];

        for (const teacher of currentTeachers) {
            let teacherDB = await Teacher.findOne({ where: { id: teacher.id } });
            if (!teacherDB) {
                teacherDB = await Teacher.create({ id: teacher.id, name: teacher.name});
            } 

            let subject = await Subject.findOne({ where: { id: teacher.codeSubject } });
            if (!subject) {
                subject = await Subject.create({ id: teacher.codeSubject, name: teacher.subject });
            }

            let teacherSubject = await TeacherSubject.findOne({ where: { teacher_id: teacherDB.id, subject_id: subject.id } });
            if (!teacherSubject) {
                teacherSubject = await TeacherSubject.create({ teacher_id: teacherDB.id, subject_id: subject.id });
            }
            const history:TeacherHistory = {
                id: teacherSubject.id,
                name: teacherDB.name,
                subject: subject.name,
                teacher_id: teacherDB.id,
                subject_id: subject.id,
            }

            teachersHistory.push(history);
        }

        res.json({ teachersHistory });

    }catch (error) {
        if (error instanceof SiraServiceException) {
            res.status(400).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}



export const getAllTeachers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        if (page < 1) {
            res.status(400).json({ message: 'Invalid page' });
            return;
        }
        const limit = 10;
        const offset = (page - 1) * limit;
        const teachers = await Teacher.findAll(
            {
                limit,
                offset,
                raw: true,
            }
        );
        res.json({ teachers });
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getTeacherById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const teacher = await Teacher.findOne({ where: { id }, raw: true });
        if (!teacher) {
            res.status(404).json({ message: 'Teacher not found' });
            return;
        }

        const teacherSubjects = await TeacherSubject.findAll({ where: { teacher_id: id } });

        const subjects = await Subject.findAll({
            where: {
                id: teacherSubjects.map((ts) => ts.subject_id),
            },
            raw: true,
        });

        res.json({ ...teacher, subjects });
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
