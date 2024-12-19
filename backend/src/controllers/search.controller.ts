import { Request, Response } from 'express';
import { Rating, Subject, Teacher, TeacherSubject } from '../models';
import { Op } from 'sequelize';
import sequelize from '../config/db.config';


interface RatingsSummary  extends Rating { 
    total_ratings: number;
    average_rating: number;
}

interface TeacherSubjectWithRelations extends TeacherSubject {
    'Teacher.name': string | null;
    'Subject.name': String | null;
  }
  

export const search = async (req: Request, res: Response) => {
    try {
        const { query, page} = req.query;
        if (!query) {
            res.status(400).json({ message: 'Query is required' });
            return;
        }

        const searchQuery = query as string;
        const searchPage = parseInt(page as string) || 1;
        const limit = 10;
        const offset = (searchPage - 1) * limit;
        const teachers = await Teacher.findAll(
            {
                where: {
                    name: {
                        [Op.like]: `%${searchQuery.toUpperCase()}%`
                    }
                },
                raw: true,
                limit,
                offset
            }
        );

        if (teachers.length === 0) {
            res.status(404).json({ message: 'No teachers found' });
            return;
        }

        const teacherSubject = await TeacherSubject.findAll({
            where: {
                teacher_id: teachers.map(teacher => teacher.id)
            },
            include: [
                {
                    model: Teacher,
                    attributes: ['name'],
                    required: true
                },
                {
                    model: Subject,
                    attributes: ['name'],
                    required: true
                }
            ],
            raw: true
        }) as TeacherSubjectWithRelations[];

        const ratings = await Rating.findAll({
            where: {
                teacher_subject_id: teacherSubject.map(ts => ts.id)
            },
            attributes: [
                'teacher_subject_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_ratings'],
                [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
            ],
            group: ['teacher_subject_id'],
            raw: true
        }) as RatingsSummary[];
       
        const result = teacherSubject.map(ts => {
            const rating = ratings.find(r => r.teacher_subject_id === ts.id);
            return {
                id: ts.id,
                teacher_name: ts['Teacher.name'],
                subject_name: ts['Subject.name'],
                total_ratings: rating?.total_ratings || 0,
                average_rating: rating?.average_rating || 0
            }
        });

        res.json({
            query: searchQuery,
            teachers: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}